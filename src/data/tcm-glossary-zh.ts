import type { TcmGlossaryEntry } from "./tcm-glossary";

export const TCM_GLOSSARY_ZH: Record<string, TcmGlossaryEntry> = {
  qi: { term: "气", chinese: "气", short: "生命之原动力", detail: "气是推动一切脏腑功能的根本能量——呼吸、消化、思维、情志皆由气化所主。中医认为气虚、气滞、气逆皆可致病。" },
  "qi-brist": { term: "气虚", chinese: "气虚", short: "元气不足", detail: "身体生气、藏气不足时，表现为倦怠乏力、纳差、免疫低下。脾胃为气血生化之源，补气当从健脾入手。" },
  yin: { term: "阴", chinese: "阴", short: "清凉滋润之力", detail: "阴主静、润、凉，代表休息、滋养与恢复。阴平阳秘方能深睡、体温平稳、内心安宁。" },
  yang: { term: "阳", chinese: "阳", short: "温煦推动之力", detail: "阳为生命之火——温煦脏腑、推动气血运行。阳虚则畏寒肢冷、晨起困倦、血行迟缓。" },
  "yin-brist": { term: "阴虚", chinese: "阴虚", short: "清凉之力不足", detail: "阴液亏耗时身体失去降温安宁的能力，出现五心烦热、浅睡盗汗、口干舌燥。舌红少苔或有裂纹为典型舌象。" },
  "yang-brist": { term: "阳虚", chinese: "阳虚", short: "温煦之力不足", detail: "命门之火衰微，气血运行乏力，手脚冰凉。舌淡胖嫩水滑——如浸水之海绵。" },
  shen: { term: "神", chinese: "神", short: "心神与意识", detail: "神藏于心，主宰意识、睡眠、认知与情志。心神不宁则焦虑、失眠、注意力涣散。" },
  mjälten: { term: "脾", chinese: "脾", short: "运化之枢纽", detail: "脾主运化水谷精微为气血。脾恶湿喜燥——故宜温食熟食，忌生冷寒凉。" },
  fukt: { term: "湿", chinese: "湿", short: "病理性水湿内停", detail: "脾运不健则水湿内生，表现为身重、腹胀、头昏。舌苔厚腻。湿邪粘滞，为六淫中最难祛除者。" },
  slem: { term: "痰", chinese: "痰", short: "湿聚成痰，阻滞气机", detail: "湿邪日久凝聚为痰，阻滞经络脏腑，导致咳痰、头脑昏沉。治当化痰健脾。" },
  meridianer: { term: "经络", chinese: "经络", short: "气血运行的通道", detail: "经络是气血流通的网络系统，十二正经各连一脏一腑。「不通则痛」是中医诊治的基本法则。" },
  stagnation: { term: "气滞", chinese: "气滞", short: "气机郁滞", detail: "多因情志不畅、压力过大或久坐所致。肝主疏泄，肝气郁结则胸胁胀满、烦躁易怒。宜运动、芳香理气、适当宣泄情绪。" },
  blodstagnation: { term: "血瘀", chinese: "血瘀", short: "血行不畅", detail: "气滞日久可致血瘀。表现为刺痛固定不移、经血暗黑有块、舌质紫暗。运动、姜黄、生姜有助活血化瘀。" },
  levern: { term: "肝", chinese: "肝", short: "疏泄与情志之官", detail: "肝主疏泄，调畅全身气机。与怒、郁、创造力相关。肝气条达则情志平和、目清筋柔。" },
  njurarna: { term: "肾", chinese: "肾", short: "先天之本，阴阳之根", detail: "肾藏精，主生长发育与生殖。肾经起于足底——故忌赤脚踩冷地。肾为一身阴阳之根。" },
  tungdiagnostik: { term: "舌诊", chinese: "舌诊", short: "望舌辨证", detail: "舌为脏腑之外候。观其色、形、苔、润燥可辨寒热虚实。舌淡胖齿痕为气虚，舌红少苔为阴虚。" },
  "mat-som-medicin": { term: "食疗", chinese: "食疗", short: "药食同源", detail: "中医将食物按寒热温凉、酸甜苦辛咸分类，对应不同脏腑。合理饮食可扶正祛邪——故食疗为治病之首选。" },
};
