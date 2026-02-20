export type DiagnosisId = "low-energy" | "metabolic" | "inner-stress" | "tension" | "cold-circulation";

export interface DiagnosisScenario {
  id: DiagnosisId;
  name: string;
  subtitle: string;
  description: string;
  symptoms: string[];
  metrics: { balans: number; energi: number; flode: number };
  food: { eat: string[]; avoid: string[] };
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
    subtitle: "Din kropp ropar efter återhämtning",
    description: "Din energi är i obalans — kroppen behöver näring, vila och tid att ladda om på djupet.",
    symptoms: ["Trötthet trots sömn", "Dålig aptit", "Tunga armar och ben", "Svårt att koncentrera sig"],
    metrics: { balans: 45, energi: 30, flode: 55 },
    food: {
      eat: ["Ugnsrostade rotfrukter", "Långkok & grytor", "Varm gröt med kanel", "Honungsrostade nötter"],
      avoid: ["Råsallad", "Iskalla drycker", "Raffinerat socker"],
    },
    supplements: ["Rosenrot", "B-vitamin complex"],
    biohacks: ["Micropauser varje timme", "Sängdags senast 22:00", "10 min morgonpromenad"],
    training: {
      recommended: ["Lugna promenader i naturen", "Qi Gong-inspirerad stretching", "Yoga Nidra", "Lätt simning"],
      avoid: ["HIIT-träning", "Tung styrketräning", "Löpning i hög intensitet"],
    },
    routines: {
      sleep: ["Lägg dig före 22:00", "Ingen skärm 1h före sängen", "Varm dryck på kvällen"],
      habits: ["Morgonritual med varm dryck", "Micropauser varje timme", "10 min utevistelse på morgonen"],
    },
    avoid: ["Rå mat i stora mängder", "Iskalla drycker", "Oregelbundna måltider", "Skärmtid före sömn", "Intensiv träning vid trötthet"],
    menstruation: {
      tips: ["Varm soppa under dag 1–3", "Extra vila under mensen", "Varma fotbad på kvällen", "Ingefärs-te mot kramper"],
      avoid: ["Kall mat och dryck under mensen", "Intensiv träning under dag 1–3", "Lång fasta under mensen"],
    },
    change: "Ökad energi efter 3 dagars vila",
  },
  metabolic: {
    id: "metabolic",
    name: "Trög metabolism",
    subtitle: "Kroppen behöver renas och lättas upp",
    description: "Din metabolism har saktat in. Genom att stödja kroppens naturliga reningsprocesser kan du återfå lätthet och vitalitet.",
    symptoms: ["Uppblåsthet efter måltid", "Trög mage", "Tyngdkänsla i kroppen", "Slembildning"],
    metrics: { balans: 40, energi: 50, flode: 30 },
    food: {
      eat: ["Rädisor", "Rågknäcke", "Ruccola", "Citron i vatten"],
      avoid: ["Mejeriprodukter", "Socker", "Vitt bröd"],
    },
    supplements: ["Zink", "Maskros-extrakt"],
    biohacks: ["Bastubad 2x/vecka", "Raska promenader 30 min", "Torr kroppborstning"],
    training: {
      recommended: ["Raska promenader 30–45 min", "Cykling", "Dans", "Intervallpromenader"],
      avoid: ["Stillasittande hela dagen", "Enbart tung styrka utan kondition"],
    },
    routines: {
      sleep: ["Regelbunden läggtid", "Svalt sovrum (18°C)"],
      habits: ["Starta dagen med citronvatten", "Ät vid fasta tider", "Torr kroppborstning på morgonen"],
    },
    avoid: ["Mejeriprodukter i överskott", "Socker och vitt mjöl", "Sena kvällsmål", "Stillasittande efter måltid"],
    menstruation: {
      tips: ["Lätt rörelse som promenader", "Varma kryddor i maten (kanel, ingefära)"],
      avoid: ["Tunga, feta måltider under mensen", "Överdriven fasta"],
    },
    change: "Minskad svullnad efter 4 dagar",
  },
  "inner-stress": {
    id: "inner-stress",
    name: "Inre obalans",
    subtitle: "Ditt nervsystem behöver lugn",
    description: "Din kropp bär på en inre stress som påverkar sömn, fokus och återhämtning. Tid för att landa och hitta tillbaka till ro.",
    symptoms: ["Ytlig sömn", "Inre oro", "Muntorrhet", "Svettningar"],
    metrics: { balans: 35, energi: 65, flode: 40 },
    food: {
      eat: ["Fet fisk (lax, makrill)", "Blåbär", "Avokado", "Gurkmeja-latte"],
      avoid: ["Kaffe", "Chili & starka kryddor", "Alkohol"],
    },
    supplements: ["Magnesium (kväll)", "Ashwagandha"],
    biohacks: ["Skärmfri timme innan sängen", "Yin Yoga 20 min", "Andningsövningar"],
    training: {
      recommended: ["Yin Yoga", "Tai Chi", "Lugna skogsvandringar", "Medveten stretching"],
      avoid: ["Intensiva gruppträningar", "Tävlingsidrott", "Träning sent på kvällen"],
    },
    routines: {
      sleep: ["Skärmfri timme innan sängen", "Lavendel eller doftljus vid sängen", "Andningsövning 4-7-8 metoden"],
      habits: ["Morgonmeditation 5 min", "Journalskrivande på kvällen", "Promenad i naturen dagligen"],
    },
    avoid: ["Koffein efter kl 14", "Starka kryddor", "Alkohol", "Nyhetsflöde före sängen", "Intensiv träning sent på dagen"],
    menstruation: {
      tips: ["Extra magnesium dag 1–3", "Yin yoga istället för vanlig träning", "Varm chokladdryck med kakao"],
      avoid: ["Koffein under mensen", "Stressiga aktiviteter under dag 1–2"],
    },
    change: "Bättre sömn efter 5 dagar",
  },
  tension: {
    id: "tension",
    name: "Spänningar & stelhet",
    subtitle: "Energin fastnar i kroppen",
    description: "Spänningar och stagnation hindrar kroppens naturliga flöde. Rörelse, näring och medveten avslappning kan öppna upp igen.",
    symptoms: ["Huvudvärk", "Stel nacke/axlar", "Irritabilitet", "Mensvärk"],
    metrics: { balans: 50, energi: 55, flode: 25 },
    food: {
      eat: ["Surkål & fermenterade grönsaker", "Citrusfrukter", "Ingefära", "Gröna bladgrönsaker"],
      avoid: ["Processad mat", "Överdrivet fett", "Alkohol"],
    },
    supplements: ["Omega-3", "Kurkumin"],
    biohacks: ["Spikmatta 15 min/dag", "Dynamisk stretching", "Skogsbad på helgen"],
    training: {
      recommended: ["Dynamisk stretching", "Pilates", "Simning", "Skogspromenader"],
      avoid: ["Ensidig repetitiv träning", "Tunga lyft utan uppvärmning"],
    },
    routines: {
      sleep: ["Stretching före sängen", "Spikmatta 15 min"],
      habits: ["Rörelsepaus var 45:e minut", "Skogsbad på helgen", "Varm dusch med avslutande kallt"],
    },
    avoid: ["Processad mat", "Långvarigt stillasittande", "Överdriven alkohol", "Ensidig kroppsställning"],
    menstruation: {
      tips: ["Mjuk magmassage", "Varm vetekudde på nedre ryggen", "Lätt stretching"],
      avoid: ["Hård core-träning under mensen", "Inversioner vid kraftig blödning"],
    },
    change: "Ökad rörlighet efter 1 vecka",
  },
  "cold-circulation": {
    id: "cold-circulation",
    name: "Svag cirkulation",
    subtitle: "Värmen stannar i kärnan",
    description: "Din cirkulation behöver stöd för att nå ut till hela kroppen. Värmande kost, rörelse och rutiner hjälper dig tillbaka i balans.",
    symptoms: ["Kalla händer och fötter", "Domningar", "Blekhet", "Trötthet på morgonen"],
    metrics: { balans: 55, energi: 40, flode: 35 },
    food: {
      eat: ["Värmande kryddor (kanel, ingefära, peppar)", "Bensoppa", "Varm soppa", "Chili i lagom mängd"],
      avoid: ["Råa grönsaker i överskott", "Iskalla drycker", "Fruktsmoothies"],
    },
    supplements: ["D-vitamin", "Järn", "CoQ10"],
    biohacks: ["Bastu 3x/vecka", "Varma fotbad på kvällen", "Lagerklädsel och ullsockor"],
    training: {
      recommended: ["Rask promenad", "Funktionell träning", "Dans", "Bastu efter träning"],
      avoid: ["Stillasittande träning i kyla", "Kallbad utan uppvärmning"],
    },
    routines: {
      sleep: ["Varma fotbad före sängen", "Ullsockor i sängen", "Varm dryck 30 min före sängen"],
      habits: ["Börja dagen med varm frukost", "Lagerklädsel", "Rörelse varje timme"],
    },
    avoid: ["Råa grönsaker i överskott", "Iskalla drycker", "Fruktsmoothies", "Att gå barfota på kallt golv", "Att hoppa över frukost"],
    menstruation: {
      tips: ["Extra värmande kryddor i maten", "Varma kompresser på magen", "Ingefärs-te med honung"],
      avoid: ["Kallbad under mensen", "Iskall mat och dryck", "Barfota på kallt golv"],
    },
    change: "Varmare extremiteter efter 5 dagar",
  },
};
