export interface TcmGlossaryEntry {
  term: string;
  chinese?: string;
  short: string;
  detail: string;
}

export const TCM_GLOSSARY: Record<string, TcmGlossaryEntry> = {
  qi: {
    term: "Qi",
    chinese: "气",
    short: "Kroppens livskraft och energi",
    detail: "Qi är den fundamentala energin som driver alla kroppens funktioner — från andning och matsmältning till tankar och känslor. I TCM anses sjukdom uppstå när Qi är för svagt, blockerat eller obalanserat.",
  },
  "qi-brist": {
    term: "Qi-brist",
    chinese: "气虚",
    short: "Försvagad livskraft",
    detail: "När kroppen inte producerar eller bevarar tillräckligt med Qi. Leder till trötthet, svag aptit och dålig motståndskraft. Mjälten och Magen anses vara de viktigaste organen för Qi-produktion.",
  },
  yin: {
    term: "Yin",
    chinese: "阴",
    short: "Kroppens kylande, lugnande kraft",
    detail: "Yin representerar det lugnande, fuktande och kylande i kroppen — vila, stillhet och återhämtning. Yin balanserar Yang och är nödvändigt för djup sömn, stabil temperatur och inre lugn.",
  },
  yang: {
    term: "Yang",
    chinese: "阳",
    short: "Kroppens värmande, aktiverande kraft",
    detail: "Yang är livets eld — den kraft som värmer, aktiverar och driver blodcirkulation och metabolism. Vid Yang-brist fryser man lätt, känner sig trög på morgonen och har svag cirkulation.",
  },
  "yin-brist": {
    term: "Yin-brist",
    chinese: "阴虚",
    short: "Försvagad kylande kraft",
    detail: "När kroppens Yin är försvagat tappar den förmågan att kyla ner och lugna sig. Det leder till inre oro, ytlig sömn, torr mun och en känsla av att 'glöda inifrån'. Tungan blir typiskt röd och torr.",
  },
  "yang-brist": {
    term: "Yang-brist",
    chinese: "阳虚",
    short: "Försvagad värmekraft",
    detail: "Kroppens inre eld har försvagats, vilket gör att cirkulationen försämras och man känner sig kall, särskilt i händer och fötter. Tungan blir blek, svullen och våt — som en vattenloggad svamp.",
  },
  shen: {
    term: "Shen",
    chinese: "神",
    short: "Sinnet och medvetandet",
    detail: "Shen bor i Hjärtat enligt TCM och styr medvetande, sömn, tankeförmåga och emotionell balans. Oroligt Shen visar sig som ångest, sömnsvårigheter och koncentrationssvårigheter.",
  },
  mjälten: {
    term: "Mjälten",
    chinese: "脾",
    short: "Centralt organ för matsmältning och energi",
    detail: "I TCM är Mjälten (Pi) ansvarig för att omvandla mat och dryck till Qi och Blod. Den 'hatar' kyla och fukt — därför rekommenderas varm, lagad mat istället för rå sallad och iskalla drycker.",
  },
  fukt: {
    term: "Fukt",
    chinese: "湿",
    short: "Patologisk vätskeansamling",
    detail: "Fukt (Shi) uppstår när Mjälten inte kan transformera vätskor effektivt. Det skapar en känsla av tyngd, uppblåsthet och dimma. Tungan får en tjock, klibbig beläggning. Fukt ses som en av de svåraste patogenerna att behandla i TCM.",
  },
  slem: {
    term: "Slem",
    chinese: "痰",
    short: "Förtätad fukt som blockerar",
    detail: "Slem (Tan) bildas när Fukt förtätas ytterligare. Det kan blockera meridianer och organ, orsaka slembildning i luftvägar och skapa 'hjärndimma'. Behandling fokuserar på att lösa Slem och stärka Mjälten.",
  },
  meridianer: {
    term: "Meridianer",
    chinese: "经络",
    short: "Energikanaler genom kroppen",
    detail: "Meridianer (Jing Luo) är ett nätverk av kanaler som Qi och Blod flödar genom. Det finns 12 huvudmeridianer kopplade till specifika organ. Blockerade meridianer leder till smärta — 'smärta = blockering' är en grundprincip i TCM.",
  },
  stagnation: {
    term: "Stagnation",
    chinese: "气滞",
    short: "Blockerat Qi-flöde",
    detail: "Qi-stagnation uppstår ofta av stress, undertryckta känslor eller stillasittande. Levern ansvarar för fritt Qi-flöde, och stagnation där ger spänningar, irritabilitet, huvudvärk och suckar. Rörelse, aromatiska örter och emotionellt uttryck hjälper.",
  },
  blodstagnation: {
    term: "Blodstagnation",
    chinese: "血瘀",
    short: "Blockerat blodflöde",
    detail: "När Qi stagnerar länge kan det leda till att även Blodet stagnerar. Tecken inkluderar skarp smärta på bestämda ställen, mörk menstruation och en lila tunga. Rörelse, gurkmeja och ingefära hjälper att lösa stagnationen.",
  },
  levern: {
    term: "Levern",
    chinese: "肝",
    short: "Organ för fritt flöde och emotionell balans",
    detail: "I TCM ansvarar Levern (Gan) för att Qi flödar fritt i hela kroppen. Den kopplas till ilska, frustration och kreativitet. En balanserad Lever ger emotionell stabilitet, bra ögonhälsa och smidiga senor.",
  },
  njurarna: {
    term: "Njurarna",
    chinese: "肾",
    short: "Källan till Yin och Yang",
    detail: "Njurarna (Shen) är roten till all Yin och Yang i kroppen. De lagrar vår 'essens' (Jing) och styr tillväxt, åldrande och reproduktion. Njur-meridianen börjar i foten — därför bör man undvika kallt golv.",
  },
  tungdiagnostik: {
    term: "Tungdiagnostik",
    chinese: "舌诊",
    short: "Diagnostik genom tungans utseende",
    detail: "Tungan anses i TCM vara en karta över kroppens inre organ. Färg, form, beläggning och fuktighet ger värdefull information. En blek, svullen tunga med tandmärken tyder på Qi-brist, medan en röd, torr tunga tyder på Yin-brist.",
  },
  "mat-som-medicin": {
    term: "Mat som Medicin",
    chinese: "食疗",
    short: "Kostens helande kraft",
    detail: "I TCM klassificeras all mat efter temperatur (varm/kall), smak (söt, sur, bitter, salt, skarp) och vilka organ den påverkar. Rätt kost kan stärka svaga organ och balansera kroppen — därför är mat den första behandlingsformen i TCM.",
  },
};

/** Find a glossary key in a text string — returns first match */
export function findTcmTerms(text: string): string[] {
  const found: string[] = [];
  const lower = text.toLowerCase();
  for (const key of Object.keys(TCM_GLOSSARY)) {
    const term = TCM_GLOSSARY[key].term.toLowerCase();
    if (lower.includes(term)) {
      found.push(key);
    }
  }
  return found;
}
