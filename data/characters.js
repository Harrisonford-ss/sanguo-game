// 三国志探险 - 24武将数据
// rarity: legend(传说/金) | rare(稀有/蓝) | common(普通/绿)

export const characters = [
  // ========== 魏国 ==========
  {
    id: 'caocao',
    name: '曹操',
    kingdom: 'wei',
    title: '魏武帝',
    rarity: 'legend',
    stats: { 武力: 72, 智力: 96, 魅力: 93 },
    bio: '东汉末年杰出的政治家、军事家、文学家。挟天子以令诸侯，统一北方，奠定曹魏基业。也是建安文学的代表人物，留下"对酒当歌，人生几何"等千古名篇。',
    quote: '宁教我负天下人，休教天下人负我。',
    events: ['官渡之战', '赤壁之战', '三国归晋'],
    avatar: { char: '曹', bgColor: '#4a90d9', decoration: '👑' }
  },
  {
    id: 'simayi',
    name: '司马懿',
    kingdom: 'wei',
    title: '晋宣帝',
    rarity: 'legend',
    stats: { 武力: 60, 智力: 97, 魅力: 80 },
    bio: '曹魏重臣，极具忍耐力和政治智慧。多次与诸葛亮对峙，以守代攻。最终其孙司马炎建立晋朝，统一三国。',
    quote: '臣一路走来，没有敌人，看见的都是朋友和师长。',
    events: ['空城计', '三国归晋'],
    avatar: { char: '司', bgColor: '#4a90d9', decoration: '🦊' }
  },
  {
    id: 'guojia',
    name: '郭嘉',
    kingdom: 'wei',
    title: '鬼才军师',
    rarity: 'rare',
    stats: { 武力: 38, 智力: 94, 魅力: 85 },
    bio: '曹操帐下首席谋士之一，才华横溢，算无遗策。可惜英年早逝，年仅38岁。曹操赤壁大败后曾叹息："若郭奉孝在，不使孤至此。"',
    quote: '十胜十败之说，以明公之神武，何虑不成？',
    events: ['官渡之战'],
    avatar: { char: '郭', bgColor: '#4a90d9', decoration: '🎯' }
  },
  {
    id: 'xunyu',
    name: '荀彧',
    kingdom: 'wei',
    title: '王佐之才',
    rarity: 'common',
    stats: { 武力: 30, 智力: 90, 魅力: 88 },
    bio: '曹操的首席内政大臣，被誉为"王佐之才"。多次在关键时刻为曹操献计，同时负责后方政务，是曹魏的核心人物。',
    quote: '公以至仁大义辅天下，秉忠贞之节，守退让之实。',
    events: ['官渡之战'],
    avatar: { char: '荀', bgColor: '#4a90d9', decoration: '📜' }
  },
  {
    id: 'zhangliao',
    name: '张辽',
    kingdom: 'wei',
    title: '逍遥津之虎',
    rarity: 'rare',
    stats: { 武力: 93, 智力: 72, 魅力: 78 },
    bio: '曹魏五子良将之首，以逍遥津之战闻名天下。率八百将士大破孙权十万大军，令东吴小儿闻张辽之名不敢夜啼。',
    quote: '吾受国恩，当以死报之！',
    events: ['官渡之战'],
    avatar: { char: '辽', bgColor: '#4a90d9', decoration: '🐯' }
  },
  {
    id: 'xuchu',
    name: '许褚',
    kingdom: 'wei',
    title: '虎侯',
    rarity: 'common',
    stats: { 武力: 90, 智力: 42, 魅力: 55 },
    bio: '曹操身边最忠诚的护卫，勇猛过人，人称"虎痴"。曾裸衣斗马超，在军中威名赫赫。',
    quote: '吾誓死保护主公！',
    events: [],
    avatar: { char: '许', bgColor: '#4a90d9', decoration: '💪' }
  },
  {
    id: 'xiahoudun',
    name: '夏侯惇',
    kingdom: 'wei',
    title: '独眼将军',
    rarity: 'rare',
    stats: { 武力: 92, 智力: 62, 魅力: 78 },
    bio: '曹操从弟，曹魏名将。在一次战斗中被流矢射中左眼，拔矢啖睛，勇猛无畏。一生追随曹操南征北战。',
    quote: '父精母血，不可弃也！',
    events: [],
    avatar: { char: '夏', bgColor: '#4a90d9', decoration: '🏹' }
  },
  {
    id: 'dianwei',
    name: '典韦',
    kingdom: 'wei',
    title: '古之恶来',
    rarity: 'common',
    stats: { 武力: 91, 智力: 35, 魅力: 60 },
    bio: '曹操帐下猛将，使一双大铁戟，勇猛绝伦。在宛城之战中为保护曹操撤退，独挡敌军，力战而死，壮烈殉主。',
    quote: '主公先走，典韦在此！',
    events: [],
    avatar: { char: '典', bgColor: '#4a90d9', decoration: '⚔️' }
  },

  // ========== 蜀国 ==========
  {
    id: 'liubei',
    name: '刘备',
    kingdom: 'shu',
    title: '昭烈帝',
    rarity: 'rare',
    stats: { 武力: 65, 智力: 75, 魅力: 98 },
    bio: '蜀汉开国皇帝，中山靖王之后。以仁德著称，桃园三结义与关羽张飞义结金兰，三顾茅庐请出诸葛亮。终建蜀汉，三分天下有其一。',
    quote: '勿以恶小而为之，勿以善小而不为。',
    events: ['桃园三结义', '三顾茅庐', '长坂坡', '火烧连营'],
    avatar: { char: '刘', bgColor: '#4caf50', decoration: '👑' }
  },
  {
    id: 'zhugeliang',
    name: '诸葛亮',
    kingdom: 'shu',
    title: '卧龙',
    rarity: 'legend',
    stats: { 武力: 45, 智力: 98, 魅力: 95 },
    bio: '三国时期最杰出的政治家、军事家、发明家。隐居隆中时被刘备三顾茅庐请出，提出"隆中对"三分天下之策。一生鞠躬尽瘁，死而后已。',
    quote: '鞠躬尽瘁，死而后已。',
    events: ['三顾茅庐', '赤壁之战', '草船借箭', '空城计', '七擒孟获'],
    avatar: { char: '诸', bgColor: '#4caf50', decoration: '🪶' }
  },
  {
    id: 'guanyu',
    name: '关羽',
    kingdom: 'shu',
    title: '武圣',
    rarity: 'legend',
    stats: { 武力: 97, 智力: 70, 魅力: 93 },
    bio: '蜀汉五虎将之首，义薄云天，被后世尊为"武圣"。温酒斩华雄、过五关斩六将、水淹七军，留下无数传奇。手持青龙偃月刀，骑赤兔马，威震华夏。',
    quote: '吾观颜良，如插标卖首耳！',
    events: ['桃园三结义', '赤壁之战'],
    avatar: { char: '关', bgColor: '#4caf50', decoration: '🐉' }
  },
  {
    id: 'zhangfei',
    name: '张飞',
    kingdom: 'shu',
    title: '万人敌',
    rarity: 'rare',
    stats: { 武力: 94, 智力: 45, 魅力: 68 },
    bio: '蜀汉五虎将之一，与刘备关羽桃园三结义。勇猛过人，曾在长坂桥上一声怒吼吓退曹操百万大军。性格豪爽但脾气暴躁。',
    quote: '燕人张翼德在此，谁敢来决一死战！',
    events: ['桃园三结义', '长坂坡'],
    avatar: { char: '张', bgColor: '#4caf50', decoration: '🔥' }
  },
  {
    id: 'zhaoyun',
    name: '赵云',
    kingdom: 'shu',
    title: '常胜将军',
    rarity: 'legend',
    stats: { 武力: 96, 智力: 76, 魅力: 90 },
    bio: '蜀汉五虎将之一，一生征战无数几无败绩，被誉为"常胜将军"。长坂坡七进七出救出幼主阿斗，成为千古佳话。',
    quote: '吾乃常山赵子龙也！',
    events: ['长坂坡'],
    avatar: { char: '赵', bgColor: '#4caf50', decoration: '🐴' }
  },
  {
    id: 'huangzhong',
    name: '黄忠',
    kingdom: 'shu',
    title: '老当益壮',
    rarity: 'rare',
    stats: { 武力: 91, 智力: 58, 魅力: 70 },
    bio: '蜀汉五虎将之一，年近七旬仍骁勇善战。定军山一战斩杀曹魏大将夏侯渊，为刘备夺取汉中立下首功。箭术精湛，百步穿杨。',
    quote: '老将虽年迈，尚有廉颇之勇！',
    events: [],
    avatar: { char: '黄', bgColor: '#4caf50', decoration: '🏹' }
  },
  {
    id: 'machao',
    name: '马超',
    kingdom: 'shu',
    title: '锦马超',
    rarity: 'rare',
    stats: { 武力: 92, 智力: 52, 魅力: 82 },
    bio: '蜀汉五虎将之一，西凉名将马腾之子。面如冠玉，英武不凡，人称"锦马超"。曾杀得曹操割须弃袍，威名远扬。',
    quote: '吾家世代忠良，岂肯屈膝于贼！',
    events: [],
    avatar: { char: '马', bgColor: '#4caf50', decoration: '🐎' }
  },
  {
    id: 'weiyan',
    name: '魏延',
    kingdom: 'shu',
    title: '镇北将军',
    rarity: 'common',
    stats: { 武力: 88, 智力: 62, 魅力: 52 },
    bio: '蜀汉名将，勇猛善战，镇守汉中多年。曾提出"子午谷奇谋"直取长安，但未被诸葛亮采纳。性格高傲，与同僚多有不和。',
    quote: '谁敢杀我？谁敢杀我！',
    events: ['七擒孟获'],
    avatar: { char: '魏', bgColor: '#4caf50', decoration: '🗡️' }
  },

  // ========== 吴国 ==========
  {
    id: 'sunquan',
    name: '孙权',
    kingdom: 'wu',
    title: '东吴大帝',
    rarity: 'rare',
    stats: { 武力: 68, 智力: 88, 魅力: 95 },
    bio: '东吴开国皇帝，继承父兄基业。善于用人，联刘抗曹，在赤壁之战中大败曹操。连曹操都称赞："生子当如孙仲谋。"治国有道，魅力超群，以外交手腕纵横三国。',
    quote: '内事不决问张昭，外事不决问周瑜。',
    events: ['赤壁之战', '三国归晋'],
    avatar: { char: '孙', bgColor: '#ef5350', decoration: '👑' }
  },
  {
    id: 'zhouyu',
    name: '周瑜',
    kingdom: 'wu',
    title: '美周郎',
    rarity: 'legend',
    stats: { 武力: 70, 智力: 95, 魅力: 92 },
    bio: '东吴名将，精通音律，容貌出众，人称"美周郎"。赤壁之战的主要策划者，以少胜多大败曹操八十万大军。',
    quote: '既生瑜，何生亮！',
    events: ['赤壁之战', '草船借箭'],
    avatar: { char: '周', bgColor: '#ef5350', decoration: '🎵' }
  },
  {
    id: 'luxun',
    name: '陆逊',
    kingdom: 'wu',
    title: '儒将之风',
    rarity: 'rare',
    stats: { 武力: 58, 智力: 92, 魅力: 82 },
    bio: '东吴中后期最杰出的军事家。夷陵之战中以火攻大破刘备，一战成名。以书生身份统领三军，智勇双全。',
    quote: '以逸待劳，可以百战不殆。',
    events: ['火烧连营'],
    avatar: { char: '陆', bgColor: '#ef5350', decoration: '📚' }
  },
  {
    id: 'lusu',
    name: '鲁肃',
    kingdom: 'wu',
    title: '忠厚长者',
    rarity: 'common',
    stats: { 武力: 48, 智力: 86, 魅力: 85 },
    bio: '东吴重臣，最早提出联刘抗曹战略。为人忠厚正直，在孙刘联盟中起到关键调和作用。赤壁之战的幕后推手。',
    quote: '当今天下，唯有联刘抗曹方为上策。',
    events: ['赤壁之战', '草船借箭'],
    avatar: { char: '鲁', bgColor: '#ef5350', decoration: '🤝' }
  },
  {
    id: 'ganning',
    name: '甘宁',
    kingdom: 'wu',
    title: '锦帆贼',
    rarity: 'common',
    stats: { 武力: 87, 智力: 50, 魅力: 65 },
    bio: '东吴名将，早年为江上锦帆贼，后投奔孙权。作战勇猛，曾率百骑劫曹营，来去自如。孙权称赞他可比张辽。',
    quote: '百骑劫营，有何惧哉！',
    events: [],
    avatar: { char: '甘', bgColor: '#ef5350', decoration: '⛵' }
  },
  {
    id: 'taishici',
    name: '太史慈',
    kingdom: 'wu',
    title: '信义之士',
    rarity: 'common',
    stats: { 武力: 89, 智力: 55, 魅力: 78 },
    bio: '东吴名将，弓马娴熟，信义过人。曾与孙策在神亭单挑，不分胜负。后归顺孙策，成为东吴早期重要将领。',
    quote: '大丈夫生于乱世，当带三尺剑立不世之功！',
    events: [],
    avatar: { char: '太', bgColor: '#ef5350', decoration: '🎯' }
  },
  {
    id: 'lvmeng',
    name: '吕蒙',
    kingdom: 'wu',
    title: '士别三日',
    rarity: 'rare',
    stats: { 武力: 78, 智力: 88, 魅力: 72 },
    bio: '东吴名将，原本是一员武夫，后在孙权劝勉下发奋读书，令人刮目相看，留下"士别三日当刮目相待"的典故。白衣渡江夺取荆州。',
    quote: '士别三日，即更刮目相待！',
    events: [],
    avatar: { char: '吕', bgColor: '#ef5350', decoration: '📖' }
  },
  {
    id: 'huanggai',
    name: '黄盖',
    kingdom: 'wu',
    title: '赤壁功臣',
    rarity: 'common',
    stats: { 武力: 85, 智力: 72, 魅力: 68 },
    bio: '东吴老将，赤壁之战中献苦肉计，假意投降曹操，驾火船冲入曹军水寨，一把大火烧毁曹军战船无数。',
    quote: '周瑜打黄盖，一个愿打一个愿挨！',
    events: ['赤壁之战'],
    avatar: { char: '盖', bgColor: '#ef5350', decoration: '🔥' }
  },

  // ========== 魏国追加 ==========
  {
    id: 'jiaxu',
    name: '贾诩',
    kingdom: 'wei',
    title: '毒士',
    rarity: 'rare',
    stats: { 武力: 30, 智力: 95, 魅力: 65 },
    bio: '三国最善于自保的谋士，先后辅佐董卓、张绣、曹操。献计张绣两次击败曹操，后归曹操成为重要谋臣。算无遗策，被称为"毒士"。',
    quote: '明哲保身，方为上策。',
    events: ['官渡之战'],
    avatar: { char: '贾', bgColor: '#4a90d9', decoration: '🐍' }
  },
  {
    id: 'zhanghe',
    name: '张郃',
    kingdom: 'wei',
    title: '巧变将军',
    rarity: 'common',
    stats: { 武力: 88, 智力: 70, 魅力: 65 },
    bio: '曹魏五子良将之一，善于利用地形巧妙变化。官渡之战后由袁绍投曹操，多次与蜀汉交锋，最终在木门道中诸葛亮埋伏阵亡。',
    quote: '料敌之变，因地制宜。',
    events: ['官渡之战'],
    avatar: { char: '张', bgColor: '#4a90d9', decoration: '⚔️' }
  },

  // ========== 蜀国追加 ==========
  {
    id: 'jiangwei',
    name: '姜维',
    kingdom: 'shu',
    title: '幼麟',
    rarity: 'rare',
    stats: { 武力: 86, 智力: 88, 魅力: 72 },
    bio: '诸葛亮的衣钵传人，原为曹魏天水郡参军。归蜀后深得诸葛亮器重，九伐中原延续北伐事业。文武双全，号"幼麟"。',
    quote: '丞相遗志，维当誓死继之！',
    events: ['空城计', '七擒孟获'],
    avatar: { char: '姜', bgColor: '#4caf50', decoration: '🗡️' }
  },
  {
    id: 'fazheng',
    name: '法正',
    kingdom: 'shu',
    title: '翼侯',
    rarity: 'common',
    stats: { 武力: 35, 智力: 90, 魅力: 60 },
    bio: '刘备入蜀的关键谋士，献计夺取益州和汉中。定军山之战的幕后策划者，刘备称其为"吾之张良"。可惜英年早逝。',
    quote: '主公取汉中，天予不取，反受其咎。',
    events: [],
    avatar: { char: '法', bgColor: '#4caf50', decoration: '📜' }
  },

  // ========== 吴国追加 ==========
  {
    id: 'sunce',
    name: '孙策',
    kingdom: 'wu',
    title: '小霸王',
    rarity: 'rare',
    stats: { 武力: 93, 智力: 72, 魅力: 90 },
    bio: '孙权之兄，号"小霸王"。以传国玉玺向袁术借兵，凭勇武和人格魅力横扫江东六郡，为东吴奠基。可惜26岁遇刺身亡。',
    quote: '吾以一校尉创业江东，繁盛至此！',
    events: [],
    avatar: { char: '孙', bgColor: '#ef5350', decoration: '⚡' }
  },
  {
    id: 'zhoutai',
    name: '周泰',
    kingdom: 'wu',
    title: '铁壁护卫',
    rarity: 'common',
    stats: { 武力: 89, 智力: 45, 魅力: 70 },
    bio: '东吴猛将，多次以身护主孙权。合肥之战中身受数十处伤仍死战不退，孙权亲自为其数伤。忠勇无双，浑身伤疤如铁壁。',
    quote: '主公在，泰虽万死不辞！',
    events: [],
    avatar: { char: '周', bgColor: '#ef5350', decoration: '🛡️' }
  },

  // ========== 群雄 ==========
  {
    id: 'lvbu',
    name: '吕布',
    kingdom: 'qun',
    title: '飞将',
    rarity: 'legend',
    stats: { 武力: 100, 智力: 40, 魅力: 65 },
    bio: '三国第一猛将，使方天画戟，骑赤兔马，有"人中吕布，马中赤兔"之称。先后认丁原、董卓为义父又将其杀害，最终在下邳被曹操擒杀。',
    quote: '大丈夫生居天地之间，岂能郁郁久居人下！',
    events: ['董卓乱政', '三英战吕布'],
    avatar: { char: '吕', bgColor: '#ff9800', decoration: '🐴' }
  },
  {
    id: 'diaochan',
    name: '貂蝉',
    kingdom: 'qun',
    title: '倾国之貌',
    rarity: 'common',
    stats: { 武力: 18, 智力: 72, 魅力: 88 },
    bio: '中国古代四大美女之一，司徒王允的义女。以连环计周旋于董卓与吕布之间，成功离间二人，是除掉董卓的关键人物。',
    quote: '妾身虽弱，愿为大义。',
    events: ['董卓乱政'],
    avatar: { char: '貂', bgColor: '#ff9800', decoration: '🌸' }
  },
  {
    id: 'yuanshao',
    name: '袁绍',
    kingdom: 'qun',
    title: '四世三公',
    rarity: 'rare',
    stats: { 武力: 55, 智力: 68, 魅力: 85 },
    bio: '四世三公之后，十八路诸侯盟主。雄踞河北四州，兵多将广，却在官渡之战中因刚愎自用败于曹操，此后一蹶不振忧愤而死。',
    quote: '吾有四州之地，带甲百万，何惧曹贼？',
    events: ['官渡之战'],
    avatar: { char: '袁', bgColor: '#ff9800', decoration: '👑' }
  },
  {
    id: 'dongzhuo',
    name: '董卓',
    kingdom: 'qun',
    title: '暴虐权臣',
    rarity: 'rare',
    stats: { 武力: 85, 智力: 50, 魅力: 35 },
    bio: '东汉末年权臣，率西凉大军入京，废帝专权，焚烧洛阳，暴虐无道。最终被义子吕布所杀，死后被点天灯。',
    quote: '顺我者昌，逆我者亡！',
    events: ['董卓乱政'],
    avatar: { char: '董', bgColor: '#ff9800', decoration: '🔥' }
  },
  {
    id: 'zhangxiu',
    name: '张绣',
    kingdom: 'qun',
    title: '北地枪王',
    rarity: 'common',
    stats: { 武力: 82, 智力: 52, 魅力: 48 },
    bio: '宛城军阀，号称"北地枪王"。在谋士贾诩辅佐下两次击败曹操，宛城之战中杀死曹操长子曹昂和猛将典韦。后投降曹操。',
    quote: '枪出如龙，有进无退！',
    events: [],
    avatar: { char: '张', bgColor: '#ff9800', decoration: '🗡️' }
  },
  {
    id: 'huatuo',
    name: '华佗',
    kingdom: 'qun',
    title: '神医',
    rarity: 'common',
    stats: { 武力: 15, 智力: 95, 魅力: 88 },
    bio: '东汉末年神医，发明麻沸散（世界最早的麻醉药）和五禽戏。曾为关羽刮骨疗毒。欲以开颅手术治曹操头痛，被曹操疑心杀害。',
    quote: '医者仁心，当以救人为本。',
    events: [],
    avatar: { char: '华', bgColor: '#ff9800', decoration: '💊' }
  }
];

// 按稀有度分组的快捷查询
export const charactersByRarity = {
  legend: characters.filter(c => c.rarity === 'legend'),
  rare: characters.filter(c => c.rarity === 'rare'),
  common: characters.filter(c => c.rarity === 'common')
};

// 按势力分组
export const charactersByKingdom = {
  wei: characters.filter(c => c.kingdom === 'wei'),
  shu: characters.filter(c => c.kingdom === 'shu'),
  wu: characters.filter(c => c.kingdom === 'wu'),
  qun: characters.filter(c => c.kingdom === 'qun')
};

// ID查询
export function getCharacter(id) {
  return characters.find(c => c.id === id);
}
