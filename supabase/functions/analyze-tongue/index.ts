import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Du är en expert på traditionell kinesisk medicin (TCM) och tungdiagnostik, specialiserad för en modern svensk publik intresserad av holistisk hälsa och funktionell livslängd.

Analysera tungbilden metodiskt och noggrant. Granska följande aspekter:

**FÄRG:**
- Blek: indikerar Qi-brist eller Blod-brist
- Normal rosa: balanserad hälsa
- Röd/mörkröd: värme, inflammation, Yin-brist
- Lila/mörklila: Qi- och Blodstas
- Blåaktig/blek med blå nyans: Yang-brist, kyla, svag cirkulation

**BELÄGGNING:**
- Ingen/tunn vit: normal eller Yin-brist
- Tjock vit: fukt, kyla
- Gul (tunn/tjock): värme, fukt-värme
- Grå/svart: kronisk kyla eller extrem värme
- Kladdig/hal: fukt och slem

**FORM & STORLEK:**
- Svullen med tandmärken: Mjälte-Qi-brist, fukt
- Tunn/smal: Blod-brist, Yin-brist
- Stiv: Lever-Qi-stas
- Darrande: Qi-brist, inre vind

**FUKTIGHET:**
- Torr: vätskebrist, Yin-brist, värme
- Måttligt fuktig: normal
- Hal/blöt: Yang-brist, fukt

**SPRICKOR & VENER:**
- Mittenspricka: Hjärt- eller Mage-brist
- Tvärgående sprickor: kronisk stress, Mjälte-brist
- Synliga blå vener under tungan: blodstas, cirkulationsproblem

Baserat på din analys, välj DEN diagnos som bäst matchar bland dessa fem TCM-mönster:
1. "low-energy" — Qi-brist (blek tunga, tandmärken, tunn vit beläggning, trött, dålig aptit)
2. "metabolic" — Fukt-slem (svullen tunga, tjock kladdig beläggning, tung kropp, tröghet)
3. "inner-stress" — Yin-brist/Lever-Yang-uppflammande (röd tunga, tunn/ingen beläggning, torr, rastlös)
4. "tension" — Qi-Blodstas (lila/mörk tunga, synliga vener, spänningar, smärtor)
5. "cold-circulation" — Yang-brist (blek/blåaktig tunga, våt, vit beläggning, kall, trött)

Ge individuellt anpassade metriker (0–100) baserade på exakt vad du ser i bilden:
- balans: kroppens övergripande TCM-balans (100 = perfekt balans)
- energi: Qi-nivå och vitalitet (100 = optimal energi)
- flode: cirkulation och flöde av Qi och Blod (100 = optimalt flöde)

Lista 3–5 specifika symptom personen sannolikt upplever baserat på tungobservationerna. Symptomen ska vara konkreta och igenkännbara på svenska.

Svara ALLTID med tongue_diagnosis-verktyget.`;

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

    // Standard Supabase auth validation (replaces non-standard getClaims)
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- API Key ---
    const ANTHROPIC_API_KEY = Deno.env.get("anthropic_api_key_ai_engine_e5");
    if (!ANTHROPIC_API_KEY) throw new Error("Anthropic API key is not configured");

    // --- Input validation ---
    const { image } = await req.json();
    if (!image || typeof image !== "string") {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate base64 data URL format and extract parts
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
      const bytes = Array.from(raw, (c) => c.charCodeAt(0));
      const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8;
      const isPng  = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
      const isWebp = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
      if (!isJpeg && !isPng && !isWebp) {
        return new Response(JSON.stringify({ error: "Invalid image data" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch {
      return new Response(JSON.stringify({ error: "Invalid image encoding" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalise media type ("jpg" → "jpeg")
    const mediaType = formatMatch[1] === "jpg" ? "jpeg" : formatMatch[1];
    const imageBase64 = formatMatch[2];

    // --- Call Anthropic Claude Vision API ---
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: `image/${mediaType}` as "image/jpeg" | "image/png" | "image/webp",
                  data: imageBase64,
                },
              },
              {
                type: "text",
                text: "Analysera denna tungbild noggrant och ge din TCM-diagnos.",
              },
            ],
          },
        ],
        tools: [
          {
            name: "tongue_diagnosis",
            description: "Returnera ett strukturerat TCM-tungdiagnosresultat baserat på tungbilden",
            input_schema: {
              type: "object",
              properties: {
                diagnosis_id: {
                  type: "string",
                  enum: ["low-energy", "metabolic", "inner-stress", "tension", "cold-circulation"],
                  description: "Det TCM-mönster som bäst matchar tungbilden",
                },
                balans: {
                  type: "number",
                  description: "Kroppens övergripande TCM-balans, 0-100 (100 = perfekt balans)",
                },
                energi: {
                  type: "number",
                  description: "Qi-nivå och vitalitet, 0-100 (100 = optimal energi)",
                },
                flode: {
                  type: "number",
                  description: "Cirkulation och flöde av Qi och Blod, 0-100 (100 = optimalt flöde)",
                },
                analysis_summary: {
                  type: "string",
                  description: "Konkret sammanfattning av tunganalysen på svenska (2-3 meningar som beskriver vad som faktiskt observerades i bilden)",
                },
                likely_symptoms: {
                  type: "array",
                  items: { type: "string" },
                  description: "3-5 specifika och igenkännbara symptom personen sannolikt upplever, baserade på tungobservationerna, formulerade på svenska",
                },
              },
              required: ["diagnosis_id", "balans", "energi", "flode", "analysis_summary", "likely_symptoms"],
              additionalProperties: false,
            },
          },
        ],
        // Force Claude to always call the tool — guarantees structured JSON output
        tool_choice: { type: "tool", name: "tongue_diagnosis" },
      }),
    });

    if (!anthropicResponse.ok) {
      const errBody = await anthropicResponse.text().catch(() => "");
      if (anthropicResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Systemet är överbelastat just nu. Försök igen om en stund." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("Anthropic API error:", anthropicResponse.status, errBody);
      return new Response(JSON.stringify({ error: "Analysen misslyckades. Försök igen senare." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const claudeData = await anthropicResponse.json();

    // Claude tool use response: find the tool_use block in content[]
    // Unlike OpenAI, Claude returns input as a parsed object (not a JSON string)
    const toolUseBlock = claudeData.content?.find((block: { type: string }) => block.type === "tool_use");

    if (!toolUseBlock?.input) {
      console.error("No tool_use block in Claude response:", JSON.stringify(claudeData));
      return new Response(JSON.stringify({ error: "Kunde inte tolka analysen. Försök igen." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate the result has the required fields
    const result = toolUseBlock.input;
    if (
      !result.diagnosis_id ||
      typeof result.balans !== "number" ||
      typeof result.energi !== "number" ||
      typeof result.flode !== "number"
    ) {
      console.error("Invalid tool result structure:", JSON.stringify(result));
      return new Response(JSON.stringify({ error: "Analysen returnerade ett ogiltigt format. Försök igen." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-tongue error:", e instanceof Error ? e.message : "unknown");
    return new Response(JSON.stringify({ error: "Ett tekniskt fel uppstod. Försök igen senare." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
