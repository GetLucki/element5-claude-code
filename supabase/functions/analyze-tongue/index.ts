import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Du är en expert på traditionell kinesisk medicin (TCM) och tungdiagnostik, anpassad för en svensk publik intresserad av holistisk hälsa.

Analysera tungbilden noggrant. Titta på:
- Färg (blek, röd, mörk, lila)
- Beläggning (tjock, tunn, gul, vit, ingen)
- Form (svullen, tunn, tandmärken)
- Fuktighet (torr, våt, hal)
- Sprickor eller oregelbundenheter

Baserat på analysen, välj DEN diagnos som bäst matchar bland dessa fem:
1. "low-energy" — Energiunderskott (blek tunga, tandmärken, tunn vit beläggning)
2. "metabolic" — Trög metabolism (svullen tunga, tjock beläggning, fuktig)
3. "inner-stress" — Inre obalans (röd tunga, tunn/ingen beläggning, torr)
4. "tension" — Spänningar & stelhet (lila/mörk tunga, synliga vener under tungan)
5. "cold-circulation" — Svag cirkulation (blek/blåaktig tunga, våt, vit beläggning)

Ge också anpassade metriker (0-100) för:
- balans: övergripande kroppens balans
- energi: energinivå
- flode: cirkulation och flöde

Lista även 3-5 troliga symptom som personen sannolikt upplever baserat på tungobservationerna, t.ex. "Dålig aptit", "Trötthet efter måltid", "Ytlig sömn". Symptomen ska vara på svenska och relevanta för diagnosen.

Svara ALLTID med tool-anropet.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Authentication ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Input validation ---
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { image } = await req.json();
    if (!image || typeof image !== "string") {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate base64 data URL format and extract data
    const formatMatch = image.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/s);
    if (!formatMatch) {
      return new Response(JSON.stringify({ error: "Invalid image format. Use JPEG, PNG or WebP." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check size (~5MB binary ≈ 7MB base64)
    if (image.length > 7_000_000) {
      return new Response(JSON.stringify({ error: "Image too large (max 5MB)" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify base64 is decodable and has valid image magic bytes
    try {
      const raw = atob(formatMatch[2].slice(0, 32));
      const bytes = Array.from(raw, c => c.charCodeAt(0));
      const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8;
      const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
      const isWebp = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
      if (!isJpeg && !isPng && !isWebp) {
        return new Response(JSON.stringify({ error: "Invalid image data" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch {
      return new Response(JSON.stringify({ error: "Invalid image encoding" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Analysera denna tungbild och ge din diagnos." },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "tongue_diagnosis",
              description: "Returnera tungdiagnos-resultat",
              parameters: {
                type: "object",
                properties: {
                  diagnosis_id: {
                    type: "string",
                    enum: ["low-energy", "metabolic", "inner-stress", "tension", "cold-circulation"],
                    description: "Vilken diagnos som bäst matchar",
                  },
                  balans: { type: "number", description: "Balansvärde 0-100" },
                  energi: { type: "number", description: "Energivärde 0-100" },
                  flode: { type: "number", description: "Flödesvärde 0-100" },
                  analysis_summary: {
                    type: "string",
                    description: "Kort sammanfattning av tunganalysen på svenska (2-3 meningar)",
                  },
                  likely_symptoms: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 troliga symptom personen upplever baserat på tunganalysen, på svenska",
                  },
                },
                required: ["diagnosis_id", "balans", "energi", "flode", "analysis_summary", "likely_symptoms"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "tongue_diagnosis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Systemet är överbelastat just nu. Försök igen om en stund." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Analyskrediter slut. Kontakta administratören." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ error: "Analysen misslyckades. Försök igen senare." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in AI response");
      return new Response(JSON.stringify({ error: "Kunde inte tolka analysen. Försök igen." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-tongue error:", e instanceof Error ? e.name : "unknown");
    return new Response(JSON.stringify({ error: "Ett tekniskt fel uppstod. Försök igen senare." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
