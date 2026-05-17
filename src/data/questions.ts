import type { LearningLevel, Question, Subject, TypingDifficulty } from '../types';

const difficulties: TypingDifficulty[] = ['easy', 'normal', 'hard', 'nightmare'];

const answerAliases: Record<string, string[]> = {
  縄文土器: ['じょうもんどき', 'joumondoki', 'jomon doki'],
  弥生時代: ['弥生', 'やよいじだい', 'やよい', 'yayoijidai', 'yayoi jidai', 'yayoi'],
  古墳: ['こふん', 'kofun'],
  十七条の憲法: ['17条の憲法', 'じゅうしちじょうのけんぽう', 'juushichijounokenpou'],
  平城京: ['へいじょうきょう', 'heijoukyou', 'heijokyo'],
  平安京: ['へいあんきょう', 'heiankyou', 'heiankyo'],
  鎌倉幕府: ['かまくらばくふ', 'kamakurabakufu', 'kamakura bakufu'],
  元寇: ['げんこう', 'genkou', 'genko'],
  室町幕府: ['むろまちばくふ', 'muromachibakufu', 'muromachi bakufu'],
  鉄砲: ['てっぽう', 'teppou', 'teppo'],
  桶狭間の戦い: ['おけはざまのたたかい', 'okehazamanotatakai', 'okehazama'],
  太閤検地: ['たいこうけんち', 'taikoukenchi', 'taikokenchi'],
  徳川家康: ['とくがわいえやす', 'tokugawaieyasu', 'ieyasu'],
  武家諸法度: ['ぶけしょはっと', 'bukeshohatto'],
  踏絵: ['踏み絵', 'ふみえ', 'fumie'],
  浦賀: ['うらが', 'uraga'],
  日米和親条約: ['にちべいわしんじょうやく', 'nichibeiwashinjouyaku'],
  士族: ['しぞく', 'shizoku'],
  地租改正: ['ちそかいせい', 'chisokaisei'],
  西郷隆盛: ['さいごうたかもり', 'saigoutakamori', 'saigotakamori'],
  下関条約: ['しものせきじょうやく', 'shimonosekijouyaku'],
  ポーツマス条約: ['ぽーつますじょうやく', 'portsmouth', 'portsmouth treaty'],
  国際連盟: ['こくさいれんめい', 'kokusairenmei', 'league of nations'],
  国際連合: ['こくさいれんごう', 'kokusairengou', 'united nations', 'un'],
  北海道: ['ほっかいどう', 'hokkaidou', 'hokkaido'],
  富士山: ['ふじさん', 'fujisan', 'fuji'],
  太平洋: ['たいへいよう', 'taiheiyou', 'pacific ocean'],
  日本海: ['にほんかい', 'nihonkai', 'sea of japan'],
  東京: ['東京都', 'とうきょう', 'tokyo'],
  札幌: ['札幌市', 'さっぽろ', 'sapporo'],
  信濃川: ['しなのがわ', 'shinanogawa', 'shinano river'],
  琵琶湖: ['びわこ', 'biwako', 'lake biwa'],
  福岡県: ['福岡', 'ふくおか', 'fukuoka'],
  那覇市: ['那覇', 'なは', 'naha'],
  北京: ['ぺきん', 'beijing', 'pekin'],
  ソウル: ['seoul'],
  キャンベラ: ['canberra'],
  ブラジリア: ['brasilia'],
  ナイル川: ['ないるがわ', 'nile', 'nile river'],
  スイス: ['switzerland', 'suisse'],
  ロシア: ['russia'],
  アフリカ大陸: ['アフリカ', 'africa'],
  ニューデリー: ['new delhi', 'newdelhi'],
  太平洋ベルト: ['たいへいようべると', 'taiheiyouberuto', 'pacific belt'],
  過密: ['かみつ', 'kamitsu'],
  過疎: ['かそ', 'kaso'],
  熱帯雨林気候: ['ねったいうりんきこう', 'nettaiurinkikou', 'tropical rainforest climate'],
  灌漑: ['かんがい', 'kangai', 'irrigation'],
  ドーナツ化現象: ['どーなつかげんしょう', 'donutsuka', 'donut phenomenon'],
  縮尺: ['しゅくしゃく', 'shukushaku'],
  貿易: ['ぼうえき', 'boueki', 'boeki', 'trade'],
  持続可能な社会: ['じぞくかのうなしゃかい', 'jizokukanounashakai', 'sustainable society'],
  グローバル化: ['ぐろーばるか', 'globalization', 'globalisation'],
};

type QuestionSeed = {
  prompt: string;
  answer: string;
  acceptableAnswers?: string[];
  hint?: string;
};

type QuestionBank = {
  subject: Subject;
  level: LearningLevel;
  seeds: QuestionSeed[];
};

// MVPでは各レベルに10問ずつ用意し、難易度ごとに同じ学習内容を展開します。
// 今後はseedsを増やすだけで、問題数を自然に拡張できます。
const questionBanks: QuestionBank[] = [
  {
    subject: 'history',
    level: 'grade1',
    seeds: [
      { prompt: '縄文時代に多く作られた、厚手で縄目の模様がある土器は？', answer: '縄文土器' },
      { prompt: '稲作が広まった時代は？', answer: '弥生時代', acceptableAnswers: ['弥生時代', '弥生'] },
      { prompt: '大仙古墳のような大きな墓を何という？', answer: '古墳' },
      { prompt: '聖徳太子が定めた役人の心構えは？', answer: '十七条の憲法' },
      { prompt: '奈良時代に都がおかれた場所は？', answer: '平城京' },
      { prompt: '平安時代に都がおかれた場所は？', answer: '平安京' },
      { prompt: '源頼朝が開いた武士の政権は？', answer: '鎌倉幕府' },
      { prompt: '元が日本へ攻めてきた出来事を何という？', answer: '元寇' },
      { prompt: '足利尊氏が開いた幕府は？', answer: '室町幕府' },
      { prompt: 'ヨーロッパ人が日本へ伝えた火器は？', answer: '鉄砲' },
    ],
  },
  {
    subject: 'history',
    level: 'grade2',
    seeds: [
      { prompt: '織田信長が今川義元を破った戦いは？', answer: '桶狭間の戦い' },
      { prompt: '豊臣秀吉が行った全国の田畑調査は？', answer: '太閤検地' },
      { prompt: '江戸幕府を開いた人物は？', answer: '徳川家康' },
      { prompt: '江戸幕府が大名を統制するために定めた法は？', answer: '武家諸法度' },
      { prompt: '江戸時代にキリスト教徒を見つけるため使われた絵は？', answer: '踏絵' },
      { prompt: 'ペリーが来航した場所は？', answer: '浦賀' },
      { prompt: '江戸幕府がアメリカと結んだ最初の条約は？', answer: '日米和親条約' },
      { prompt: '明治政府が行った身分制度改革で、武士に代わる身分は？', answer: '士族' },
      { prompt: '明治政府が地価の3%を税とした改革は？', answer: '地租改正' },
      { prompt: '西南戦争を起こした人物は？', answer: '西郷隆盛' },
    ],
  },
  {
    subject: 'history',
    level: 'grade3',
    seeds: [
      { prompt: '日清戦争後に結ばれた条約は？', answer: '下関条約' },
      { prompt: '日露戦争後に結ばれた条約は？', answer: 'ポーツマス条約' },
      { prompt: '第一次世界大戦後に設立された国際組織は？', answer: '国際連盟' },
      { prompt: '世界恐慌が始まった年は？', answer: '1929年', acceptableAnswers: ['1929年', '1929'] },
      { prompt: '満州事変が起きた年は？', answer: '1931年', acceptableAnswers: ['1931年', '1931'] },
      { prompt: '第二次世界大戦後に設立された国際組織は？', answer: '国際連合' },
      { prompt: '日本国憲法が施行された年は？', answer: '1947年', acceptableAnswers: ['1947年', '1947'] },
      { prompt: 'サンフランシスコ平和条約が結ばれた年は？', answer: '1951年', acceptableAnswers: ['1951年', '1951'] },
      { prompt: '高度経済成長期に開催された東京オリンピックの年は？', answer: '1964年', acceptableAnswers: ['1964年', '1964'] },
      { prompt: '東西冷戦の象徴だったドイツの壁が崩壊した年は？', answer: '1989年', acceptableAnswers: ['1989年', '1989'] },
    ],
  },
  {
    subject: 'geography',
    level: 'grade1',
    seeds: [
      { prompt: '日本で最も面積が大きい都道府県は？', answer: '北海道' },
      { prompt: '日本で最も高い山は？', answer: '富士山' },
      { prompt: '日本列島の東側に広がる海洋は？', answer: '太平洋' },
      { prompt: '日本列島の西側にある海は？', answer: '日本海' },
      { prompt: '日本の首都は？', answer: '東京', acceptableAnswers: ['東京', '東京都'] },
      { prompt: '北海道地方の中心都市は？', answer: '札幌', acceptableAnswers: ['札幌', '札幌市'] },
      { prompt: '日本で最も長い川は？', answer: '信濃川' },
      { prompt: '日本で最も大きい湖は？', answer: '琵琶湖' },
      { prompt: '九州地方で最も人口が多い県は？', answer: '福岡県', acceptableAnswers: ['福岡県', '福岡'] },
      { prompt: '沖縄県の県庁所在地は？', answer: '那覇市', acceptableAnswers: ['那覇市', '那覇'] },
    ],
  },
  {
    subject: 'geography',
    level: 'grade2',
    seeds: [
      { prompt: 'アメリカ合衆国の首都は？', answer: 'ワシントンD.C.', acceptableAnswers: ['ワシントンD.C.', 'ワシントンdc', 'ワシントン'] },
      { prompt: '中国の首都は？', answer: '北京' },
      { prompt: '韓国の首都は？', answer: 'ソウル' },
      { prompt: 'オーストラリアの首都は？', answer: 'キャンベラ' },
      { prompt: 'ブラジルの首都は？', answer: 'ブラジリア' },
      { prompt: 'エジプトを流れる世界最長級の川は？', answer: 'ナイル川' },
      { prompt: 'ヨーロッパでアルプス山脈がある国の一つは？', answer: 'スイス', acceptableAnswers: ['スイス', 'フランス', 'イタリア', 'オーストリア'] },
      { prompt: '世界で最も面積が大きい国は？', answer: 'ロシア' },
      { prompt: '赤道が通る大陸の一つは？', answer: 'アフリカ大陸', acceptableAnswers: ['アフリカ大陸', 'アフリカ', '南アメリカ大陸', '南アメリカ'] },
      { prompt: 'インドの首都は？', answer: 'ニューデリー' },
    ],
  },
  {
    subject: 'geography',
    level: 'grade3',
    seeds: [
      { prompt: '工業が集まり、京浜・中京・阪神などを結ぶ地域を何という？', answer: '太平洋ベルト' },
      { prompt: '都市に人口や機能が集中する現象は？', answer: '過密' },
      { prompt: '人口が少なくなり地域機能が弱まる現象は？', answer: '過疎' },
      { prompt: '雨温図で年間を通して気温が高く降水量が多い気候は？', answer: '熱帯雨林気候' },
      { prompt: '乾燥帯で農業のために人工的に水を引くことを何という？', answer: '灌漑', acceptableAnswers: ['灌漑', 'かんがい'] },
      { prompt: '都市周辺に住宅地が広がる現象は？', answer: 'ドーナツ化現象' },
      { prompt: '地図で実際の距離を縮めた割合は？', answer: '縮尺' },
      { prompt: '商品が国境を越えて売買されることは？', answer: '貿易' },
      { prompt: '環境への負荷を小さくする社会を何という？', answer: '持続可能な社会' },
      { prompt: '国や地域の結びつきが地球規模で強まることは？', answer: 'グローバル化' },
    ],
  },
  {
    subject: 'english',
    level: 'eiken5',
    seeds: [
      { prompt: '「行く」は英語で？', answer: 'go' },
      { prompt: '「見る」は英語で？', answer: 'see' },
      { prompt: '「来る」は英語で？', answer: 'come' },
      { prompt: '「食べる」は英語で？', answer: 'eat' },
      { prompt: '「水」は英語で？', answer: 'water' },
      { prompt: '「本」は英語で？', answer: 'book' },
      { prompt: '「学校」は英語で？', answer: 'school' },
      { prompt: '「友だち」は英語で？', answer: 'friend' },
      { prompt: '「赤い」は英語で？', answer: 'red' },
      { prompt: '「大きい」は英語で？', answer: 'big' },
    ],
  },
  {
    subject: 'english',
    level: 'eiken4',
    seeds: [
      { prompt: '「早く」は英語で？', answer: 'early' },
      { prompt: '「遅い」は英語で？', answer: 'late' },
      { prompt: '「簡単な」は英語で？', answer: 'easy' },
      { prompt: '「難しい」は英語で？', answer: 'difficult', acceptableAnswers: ['difficult', 'hard'] },
      { prompt: '「必要とする」は英語で？', answer: 'need' },
      { prompt: '「買う」は英語で？', answer: 'buy' },
      { prompt: '「売る」は英語で？', answer: 'sell' },
      { prompt: '「始める」は英語で？', answer: 'start', acceptableAnswers: ['start', 'begin'] },
      { prompt: '「終える」は英語で？', answer: 'finish' },
      { prompt: '「家族」は英語で？', answer: 'family' },
    ],
  },
  {
    subject: 'english',
    level: 'eiken3',
    seeds: [
      { prompt: '「経験」は英語で？', answer: 'experience' },
      { prompt: '「将来」は英語で？', answer: 'future' },
      { prompt: '「環境」は英語で？', answer: 'environment' },
      { prompt: '「重要な」は英語で？', answer: 'important' },
      { prompt: '「決める」は英語で？', answer: 'decide' },
      { prompt: '「説明する」は英語で？', answer: 'explain' },
      { prompt: '「招待する」は英語で？', answer: 'invite' },
      { prompt: '「到着する」は英語で？', answer: 'arrive' },
      { prompt: '「練習する」は英語で？', answer: 'practice' },
      { prompt: '「文化」は英語で？', answer: 'culture' },
    ],
  },
  {
    subject: 'english',
    level: 'eikenPre2',
    seeds: [
      { prompt: '「達成する」は英語で？', answer: 'achieve' },
      { prompt: '「改善する」は英語で？', answer: 'improve' },
      { prompt: '「参加する」は英語で？', answer: 'participate' },
      { prompt: '「提案する」は英語で？', answer: 'suggest' },
      { prompt: '「比較する」は英語で？', answer: 'compare' },
      { prompt: '「機会」は英語で？', answer: 'opportunity' },
      { prompt: '「責任」は英語で？', answer: 'responsibility' },
      { prompt: '「社会」は英語で？', answer: 'society' },
      { prompt: '「知識」は英語で？', answer: 'knowledge' },
      { prompt: '「効果的な」は英語で？', answer: 'effective' },
    ],
  },
  {
    subject: 'english',
    level: 'eiken2',
    seeds: [
      { prompt: '「分析する」は英語で？', answer: 'analyze' },
      { prompt: '「影響」は英語で？', answer: 'influence' },
      { prompt: '「証拠」は英語で？', answer: 'evidence' },
      { prompt: '「消費する」は英語で？', answer: 'consume' },
      { prompt: '「供給する」は英語で？', answer: 'provide' },
      { prompt: '「維持する」は英語で？', answer: 'maintain' },
      { prompt: '「減らす」は英語で？', answer: 'reduce' },
      { prompt: '「増加する」は英語で？', answer: 'increase' },
      { prompt: '「経済」は英語で？', answer: 'economy' },
      { prompt: '「資源」は英語で？', answer: 'resource' },
    ],
  },
  {
    subject: 'english',
    level: 'eikenPre1',
    seeds: [
      { prompt: '「持続可能な」は英語で？', answer: 'sustainable' },
      { prompt: '「多様性」は英語で？', answer: 'diversity' },
      { prompt: '「革新」は英語で？', answer: 'innovation' },
      { prompt: '「仮説」は英語で？', answer: 'hypothesis' },
      { prompt: '「論争」は英語で？', answer: 'controversy' },
      { prompt: '「評価する」は英語で？', answer: 'evaluate' },
      { prompt: '「交渉する」は英語で？', answer: 'negotiate' },
      { prompt: '「強調する」は英語で？', answer: 'emphasize' },
      { prompt: '「重要性」は英語で？', answer: 'significance' },
      { prompt: '「不可欠な」は英語で？', answer: 'essential' },
    ],
  },
  {
    subject: 'english',
    level: 'eiken1',
    seeds: [
      { prompt: '「曖昧な」は英語で？', answer: 'ambiguous' },
      { prompt: '「軽減する」は英語で？', answer: 'mitigate' },
      { prompt: '「一貫した」は英語で？', answer: 'consistent' },
      { prompt: '「包括的な」は英語で？', answer: 'comprehensive' },
      { prompt: '「推測する」は英語で？', answer: 'infer' },
      { prompt: '「矛盾」は英語で？', answer: 'contradiction' },
      { prompt: '「回復力」は英語で？', answer: 'resilience' },
      { prompt: '「説得力のある」は英語で？', answer: 'compelling' },
      { prompt: '「実行可能な」は英語で？', answer: 'feasible' },
      { prompt: '「正当化する」は英語で？', answer: 'justify' },
    ],
  },
];

const toQuestionId = (
  subject: Subject,
  level: LearningLevel,
  difficulty: TypingDifficulty,
  index: number,
) => `${subject}-${level}-${difficulty}-${String(index + 1).padStart(3, '0')}`;

const getAcceptableAnswers = (seed: QuestionSeed) => {
  const aliases = answerAliases[seed.answer] ?? [];
  return Array.from(new Set([...(seed.acceptableAnswers ?? [seed.answer]), ...aliases]));
};

export const questions: Question[] = questionBanks.flatMap((bank) =>
  difficulties.flatMap((difficulty) =>
    bank.seeds.map((seed, index) => ({
      id: toQuestionId(bank.subject, bank.level, difficulty, index),
      subject: bank.subject,
      level: bank.level,
      difficulty,
      prompt: seed.prompt,
      answer: seed.answer,
      acceptableAnswers: getAcceptableAnswers(seed),
      hint: seed.hint,
    })),
  ),
);

export const getQuestionsForSettings = (
  subject: Subject,
  level: LearningLevel,
  difficulty: TypingDifficulty,
) =>
  questions.filter(
    (question) =>
      question.subject === subject &&
      question.level === level &&
      question.difficulty === difficulty,
  );
