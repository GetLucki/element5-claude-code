export type DiagnosisId = "low-energy" | "metabolic" | "inner-stress" | "tension" | "cold-circulation";

export interface DiagnosisScenario {
  id: DiagnosisId;
  name: string;
  tcmName: string;
  /** Short explanation of what this TCM status means for the info popup */
  statusExplanation: string;
  subtitle: string;
  description: string;
  tcmExplanation: string;
  symptoms: string[];
  metrics: { balans: number; energi: number; flode: number };
  food: { eat: string[]; avoid: string[]; tcmNote: string };
  supplements: string[];
  biohacks: string[];
  training: { recommended: string[]; avoid: string[] };
  routines: { sleep: string[]; habits: string[] };
  avoid: string[];
  menstruation?: { tips: string[]; avoid: string[] };
  change?: string;
}

export const SCENARIOS: Record<DiagnosisId, DiagnosisScenario> = {
  "low-energy": {
    id: "low-energy",
    name: "Energiunderskott",
    tcmName: "Qi-brist (气虚)",
    statusExplanation: "Qi är kroppens livskraft och energi. Vid Qi-brist har kroppen svårt att producera tillräckligt med energi för dagliga funktioner. Det leder till trötthet, svag aptit och minskad motståndskraft.",
    subtitle: "Din livskraft behöver stärkas",
    description: "Enligt TCM har din Qi — kroppens livskraft — försvagats. Det innebär att din Mjälte och Mage inte omvandlar näring till energi tillräckligt effektivt.",
    tcmExplanation: "I traditionell kinesisk medicin är Qi den grundläggande energin som driver alla kroppsfunktioner. Vid Qi-brist prioriterar kroppen de mest livsviktiga organen, vilket leder till trötthet, dålig aptit och svag muskeltonus. Tungan blir blek och svullen med tandmärken — ett klassiskt tecken på att Mjälten behöver stöd.",
    symptoms: ["Trötthet trots sömn", "Dålig aptit", "Tunga armar och ben", "Svårt att koncentrera sig", "Lätt andfåddhet vid ansträngning"],
    metrics: { balans: 45, energi: 30, flode: 55 },
    food: {
      eat: ["Ugnsrostade rotfrukter (stärker Mjälte-Qi)", "Långkok & grytor (lätta att absorbera)", "Varm gröt med kanel & kardemumma", "Honungsrostade nötter", "Söt potatis & pumpa"],
      avoid: ["Råsallad (kräver för mycket Qi att bryta ner)", "Iskalla drycker (skadar Mjälte-Yang)", "Raffinerat socker"],
      tcmNote: "Varma, kokta måltider stärker Mjälte-Qi. Undvik rått och kallt som kräver extra energi att bearbeta.",
    },
    supplements: ["Rosenrot (adaptogen som stärker Qi)", "B-vitamin complex", "Astragalus (Huang Qi) — klassisk Qi-tonika"],
    biohacks: ["Micropauser varje timme (bevarar Qi)", "Sängdags senast 22:00", "10 min morgonpromenad (rör Qi)", "Magmassage medurs (stödjer Mjälten)"],
    training: {
      recommended: ["Lugna promenader i naturen", "Qi Gong — speciellt 'Ba Duan Jin'", "Yoga Nidra", "Tai Chi"],
      avoid: ["HIIT-träning (dränerar Qi)", "Tung styrketräning", "Löpning i hög intensitet"],
    },
    routines: {
      sleep: ["Lägg dig före 22:00 (Qi återställs mellan 23–01)", "Ingen skärm 1h före sängen", "Varm dryck på kvällen"],
      habits: ["Morgonritual med varm dryck", "Micropauser varje timme", "10 min utevistelse — morgonsol stärker Yang-Qi"],
    },
    avoid: ["Rå mat i stora mängder", "Iskalla drycker", "Oregelbundna måltider (Mjälten mår bäst av regelbundenhet)", "Skärmtid före sömn", "Intensiv träning vid trötthet"],
    menstruation: {
      tips: ["Varm soppa under dag 1–3 (närer Blod och Qi)", "Extra vila under mensen", "Varma fotbad med ingefära", "Ingefärs-te mot kramper"],
      avoid: ["Kall mat och dryck under mensen", "Intensiv träning under dag 1–3", "Lång fasta under mensen"],
    },
    change: "Ökad energi efter 3 dagars vila och Qi-stärkande kost",
  },
  metabolic: {
    id: "metabolic",
    name: "Trög metabolism",
    tcmName: "Fukt & Slem (湿痰)",
    statusExplanation: "Fukt och Slem uppstår när kroppen inte kan omsätta vätskor effektivt. Det leder till en känsla av tyngd, uppblåsthet, slembildning och 'hjärndimma'. Mjälten behöver stöd för att dränera och transformera.",
    subtitle: "Kroppen behöver renas och flödet återställas",
    description: "Enligt TCM har Fukt (Shi) och Slem (Tan) ackumulerats i kroppen, vilket bromsar din metabolism och skapar en känsla av tyngd och dimma.",
    tcmExplanation: "I TCM uppstår Fukt när Mjälten inte kan transformera vätskor tillräckligt effektivt. Fukten kan förtätas till Slem som blockerar meridianer och organ. Tungan blir svullen med tjock, klibbig beläggning — kroppens sätt att visa att den behöver hjälp med att dränera och transformera.",
    symptoms: ["Uppblåsthet efter måltid", "Trög mage", "Tyngdkänsla i kroppen", "Slembildning", "Hjärndimma"],
    metrics: { balans: 40, energi: 50, flode: 30 },
    food: {
      eat: ["Rädisor (löser Slem)", "Korngrynsgröt (dränerar Fukt)", "Ruccola & bittra grönsaker", "Citron i varmt vatten", "Ingefära & kanel (värmande, torkar Fukt)"],
      avoid: ["Mejeriprodukter (producerar Slem)", "Socker (föder Fukt)", "Vitt bröd & raffinerade kolhydrater"],
      tcmNote: "Bittra och aromatiska livsmedel hjälper Mjälten att transformera Fukt. Undvik klibbiga, söta och feta livsmedel.",
    },
    supplements: ["Zink (stödjer transformering)", "Maskros-extrakt (dränerar Fukt)", "Fu Ling (Poria) — klassisk Fukt-dränerare"],
    biohacks: ["Bastubad 2x/vecka (driver ut Fukt via svett)", "Raska promenader 30 min (rör Qi och Fukt)", "Torr kroppborstning (stimulerar lymf & meridianer)"],
    training: {
      recommended: ["Raska promenader 30–45 min", "Cykling", "Dans (rör stagnation)", "Intervallpromenader"],
      avoid: ["Stillasittande hela dagen", "Enbart tung styrka utan kondition"],
    },
    routines: {
      sleep: ["Regelbunden läggtid", "Svalt sovrum (18°C)"],
      habits: ["Starta dagen med varmt citronvatten", "Ät vid fasta tider (Mjälten älskar regelbundenhet)", "Torr kroppborstning längs meridianerna på morgonen"],
    },
    avoid: ["Mejeriprodukter i överskott", "Socker och vitt mjöl", "Sena kvällsmål (belastar Mjälte-Qi)", "Stillasittande efter måltid"],
    menstruation: {
      tips: ["Lätt rörelse som promenader (rör Fukt)", "Värmande kryddor i maten (kanel, ingefära)"],
      avoid: ["Tunga, feta måltider under mensen", "Överdriven fasta"],
    },
    change: "Minskad svullnad och lättare känsla efter 4 dagar",
  },
  "inner-stress": {
    id: "inner-stress",
    name: "Inre obalans",
    tcmName: "Yin-brist med Tomhetsvärme (阴虚内热)",
    statusExplanation: "Yin är kroppens kylande, lugnande kraft. Vid Yin-brist tappar kroppen förmågan att kyla ner och lugna sig, vilket skapar inre oro, ytlig sömn och en känsla av att 'glöda inifrån'. Tomhetsvärme är den falska värme som uppstår när Yin inte kan balansera Yang.",
    subtitle: "Ditt nervsystem behöver näring och svalka",
    description: "Enligt TCM har din Yin — kroppens lugnande, kylande och närande kraft — förbrukats, vilket låter värme och oro bubbla upp till ytan.",
    tcmExplanation: "Yin och Yang är livets två grundkrafter. Yin står för vila, stillhet, fukt och svalka. När Yin är försvagat förlorar kroppen förmågan att kyla ner och lugna sig. Tungan blir röd och torr, ofta med sprickor — som en uttorkad sjöbädd. Resultatet är ytlig sömn, inre oro och en känsla av att 'glöda inifrån'.",
    symptoms: ["Ytlig sömn", "Inre oro", "Muntorrhet (särskilt nattetid)", "Svettningar (natts)", "Hjärtklappning"],
    metrics: { balans: 35, energi: 65, flode: 40 },
    food: {
      eat: ["Fet fisk — lax, makrill (närer Yin)", "Blåbär & mörka bär (kyler Blod)", "Avokado (fuktar Yin)", "Gurkmeja-latte med havremjölk", "Päron & vattenmelon (naturligt svalkande)"],
      avoid: ["Kaffe (dränerar Yin, höjer Yang)", "Chili & starka kryddor (värmer för mycket)", "Alkohol (torkar ut Yin)"],
      tcmNote: "Fokusera på fuktande, svalkande livsmedel som närer Yin. Undvik allt som 'torkar ut' eller 'hettar upp'.",
    },
    supplements: ["Magnesium (kväll — stödjer Yin-ro)", "Ashwagandha (adaptogen för balans)", "Goji-bär (Gou Qi Zi) — klassisk Yin-tonika"],
    biohacks: ["Skärmfri timme innan sängen (lugnar Shen/sinnet)", "Yin Yoga 20 min (närer Yin via passiva stretchar)", "Andningsövningar 4-7-8 (aktiverar parasympatiska nervsystemet)"],
    training: {
      recommended: ["Yin Yoga (passivt, Yin-närande)", "Tai Chi", "Lugna skogsvandringar", "Medveten stretching"],
      avoid: ["Intensiva gruppträningar (dränerar Yin)", "Tävlingsidrott", "Träning sent på kvällen"],
    },
    routines: {
      sleep: ["Skärmfri timme innan sängen", "Lavendel vid sängen (lugnar Shen)", "Andningsövning 4-7-8 metoden"],
      habits: ["Morgonmeditation 5 min (förankrar Shen)", "Journalskrivande på kvällen", "Promenad i naturen dagligen"],
    },
    avoid: ["Koffein efter kl 14", "Starka kryddor", "Alkohol", "Nyhetsflöde före sängen (stör Shen)", "Intensiv träning sent på dagen"],
    menstruation: {
      tips: ["Extra magnesium dag 1–3", "Yin yoga istället för vanlig träning", "Varm kakao med adaptogener"],
      avoid: ["Koffein under mensen", "Stressiga aktiviteter under dag 1–2"],
    },
    change: "Djupare sömn och lugn efter 5 dagar",
  },
  tension: {
    id: "tension",
    name: "Spänningar & stelhet",
    tcmName: "Qi- och Blodstagnation (气滞血瘀)",
    statusExplanation: "Qi och Blod ska flöda fritt genom kroppen. Vid stagnation har flödet blockerats — ofta av stress, stillasittande eller undertryckta känslor. Resultatet är smärta, spänningar och irritabilitet. 'Smärta = blockering' är en grundprincip i TCM.",
    subtitle: "Energin och blodet har fastnat",
    description: "Enligt TCM har flödet av Qi och Blod stagnerat, vilket skapar spänningar, smärta och irritabilitet. Kroppen behöver rörelse och fri passage.",
    tcmExplanation: "Qi ska flöda fritt genom kroppens meridianer — som vatten i en å. När Qi stagnerar, ofta på grund av stress eller stillasittande, följer Blodstagnation. Resultatet är smärta ('smärta = blockering' säger TCM), huvudvärk och emotionell frustration. Tungan kan bli lila eller mörk med synliga sublinguala vener.",
    symptoms: ["Huvudvärk", "Stel nacke/axlar", "Irritabilitet", "Mensvärk", "Suckar ofta (kroppen försöker röra Qi)"],
    metrics: { balans: 50, energi: 55, flode: 25 },
    food: {
      eat: ["Surkål & fermenterade grönsaker (rör Lever-Qi)", "Citrusfrukter (öppnar Qi-flödet)", "Ingefära (värmande, rör Blod)", "Gurkmeja (löser Blodstagnation)", "Gröna bladgrönsaker"],
      avoid: ["Processad mat", "Överdrivet fett (belastar Levern)", "Alkohol (stagnerar Lever-Qi)"],
      tcmNote: "Syrliga och aromatiska livsmedel hjälper Levern att sprida Qi fritt. Undvik mat som belastar Levern.",
    },
    supplements: ["Omega-3 (stödjer Blodflöde)", "Kurkumin (löser stagnation)", "Bupleurum (Chai Hu) — klassisk Qi-rörare"],
    biohacks: ["Spikmatta 15 min/dag (öppnar meridianer)", "Dynamisk stretching (rör Qi)", "Skogsbad på helgen (lugnar Lever-Qi)"],
    training: {
      recommended: ["Dynamisk stretching", "Pilates (öppnar flöde)", "Simning", "Qi Gong — 'Liu Zi Jue' (sex helande ljud)"],
      avoid: ["Ensidig repetitiv träning", "Tunga lyft utan uppvärmning"],
    },
    routines: {
      sleep: ["Stretching före sängen (släpper Qi-stagnation)", "Spikmatta 15 min"],
      habits: ["Rörelsepaus var 45:e minut", "Skogsbad på helgen (Levern kopplas till naturen i TCM)", "Varm dusch med avslutande kallt (rör Blod)"],
    },
    avoid: ["Processad mat", "Långvarigt stillasittande (stagnerar Qi)", "Överdriven alkohol", "Undertrycka känslor (stagnerar Lever-Qi)"],
    menstruation: {
      tips: ["Mjuk magmassage medurs (rör Qi)", "Varm vetekudde på nedre ryggen", "Lätt stretching och rörelse"],
      avoid: ["Hård core-träning under mensen", "Inversioner vid kraftig blödning"],
    },
    change: "Ökad rörlighet och minskat tryck efter 1 vecka",
  },
  "cold-circulation": {
    id: "cold-circulation",
    name: "Svag cirkulation",
    tcmName: "Yang-brist med inre Kyla (阳虚内寒)",
    statusExplanation: "Yang är kroppens värmande, aktiverande kraft. Vid Yang-brist orkar kroppen inte värma sina yttre delar och cirkulationen försämras. Kalla händer och fötter, blekhet och morgontrötthet är typiska tecken. Njurarna anses vara källan till Yang.",
    subtitle: "Kroppens inre eld behöver stärkas",
    description: "Enligt TCM är din Yang — kroppens värmande, aktiverande kraft — försvagad. Det gör att Kyla tar över och cirkulationen försämras, särskilt till händer och fötter.",
    tcmExplanation: "Yang är livets eld: den värmer, aktiverar och driver blodcirkulationen. Vid Yang-brist orkar kroppen inte värma sina yttre delar. Tungan blir blek, våt och svullen — som en vattenloggad svamp. Njurarna anses i TCM vara källan till Yang, och behöver extra stöd.",
    symptoms: ["Kalla händer och fötter", "Domningar i extremiteter", "Blekhet", "Trötthet på morgonen", "Ökad urinering (särskilt nattetid)"],
    metrics: { balans: 55, energi: 40, flode: 35 },
    food: {
      eat: ["Värmande kryddor — kanel, ingefära, peppar (stärker Yang)", "Bensoppa (djupnärande)", "Varm soppa varje dag", "Lamm & vilt (värmande proteiner i TCM)", "Valnötter (stärker Njur-Yang)"],
      avoid: ["Råa grönsaker i överskott (kyler)", "Iskalla drycker (släcker Yang)", "Fruktsmoothies (för kylande)"],
      tcmNote: "Värmande, lagade måltider är nyckeln. Tänk 'mat som inre eld' — allt som värmer kroppen stärker Yang.",
    },
    supplements: ["D-vitamin (Yang i tablettform)", "Järn (stödjer Blod-bildning)", "CoQ10", "Kanel-extrakt (Rou Gui) — klassisk Yang-tonika"],
    biohacks: ["Bastu 3x/vecka (stärker Yang via extern värme)", "Varma fotbad med ingefära på kvällen", "Lagerklädsel och ullsockor", "Moxibustion på punkt Zusanli (ST36) — fråga din TCM-terapeut"],
    training: {
      recommended: ["Rask promenad (aktiverar Yang)", "Funktionell träning", "Dans", "Bastu efter träning"],
      avoid: ["Stillasittande träning i kyla", "Kallbad utan uppvärmning (chockerar Yang)"],
    },
    routines: {
      sleep: ["Varma fotbad före sängen (drar Yang nedåt)", "Ullsockor i sängen", "Varm dryck 30 min före sängen"],
      habits: ["Börja dagen med varm frukost (aktiverar Mjälte-Yang)", "Lagerklädsel", "Rörelse varje timme"],
    },
    avoid: ["Råa grönsaker i överskott", "Iskalla drycker", "Fruktsmoothies", "Att gå barfota på kallt golv (Njur-meridianen börjar i foten)", "Att hoppa över frukost (Mjälte-Yang behöver morgonbränsle)"],
    menstruation: {
      tips: ["Extra värmande kryddor i maten", "Varma kompresser med moxa-olja", "Ingefärs-te med honung"],
      avoid: ["Kallbad under mensen", "Iskall mat och dryck", "Barfota på kallt golv"],
    },
    change: "Varmare extremiteter och mer morgonenergi efter 5 dagar",
  },
};
