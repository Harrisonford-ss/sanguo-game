// 三国志 - 地理数据 (Geographic Data for Three Kingdoms Board Game)
// Coordinates are [longitude, latitude] for map plotting
// All coordinates reference modern city locations

export const threeKingdomsCities = [
  // ========== 魏 (Wei) ==========
  {
    id: 'luoyang',
    ancientName: '洛阳',
    modernName: '洛阳市',
    modernProvince: '河南省',
    lng: 112.45,
    lat: 34.62,
    kingdom: '魏',
    kingdomId: 'wei',
    significance: '东汉都城，天下之中。曹丕篡汉后以此为魏国都城，政治文化中心。',
    battles: ['董卓焚烧洛阳', '曹丕受禅称帝'],
    changedHands: false
  },
  {
    id: 'xuchang',
    ancientName: '许昌',
    modernName: '许昌市',
    modernProvince: '河南省',
    lng: 113.85,
    lat: 34.03,
    kingdom: '魏',
    kingdomId: 'wei',
    significance: '曹操挟天子以令诸侯之地，建安年间实际政治中心。荀彧、郭嘉在此辅佐曹操。',
    battles: ['曹操迎汉献帝', '衣带诏事件'],
    changedHands: false
  },
  {
    id: 'yecheng',
    ancientName: '邺城',
    modernName: '临漳县（邯郸市）',
    modernProvince: '河北省',
    lng: 114.62,
    lat: 36.33,
    kingdom: '魏',
    kingdomId: 'wei',
    significance: '袁绍大本营，官渡之战后为曹操所得。建有铜雀台，曹植于此作《铜雀台赋》。',
    battles: ['官渡之战（前哨）', '袁氏兄弟内斗'],
    changedHands: true // 袁绍 -> 曹操
  },
  {
    id: 'changan',
    ancientName: '长安',
    modernName: '西安市',
    modernProvince: '陕西省',
    lng: 108.94,
    lat: 34.26,
    kingdom: '魏',
    kingdomId: 'wei',
    significance: '西汉旧都，关中重镇。董卓迁都于此，后遭李傕郭汜之乱。魏国西线军事重心。',
    battles: ['董卓迁都', '李傕郭汜之乱', '马超起兵攻长安'],
    changedHands: false
  },
  {
    id: 'guandu',
    ancientName: '官渡',
    modernName: '中牟县（郑州市）',
    modernProvince: '河南省',
    lng: 114.02,
    lat: 34.72,
    kingdom: '魏',
    kingdomId: 'wei',
    significance: '官渡之战发生地，曹操以少胜多大破袁绍，奠定统一北方基础。',
    battles: ['官渡之战'],
    changedHands: false
  },
  {
    id: 'wancheng',
    ancientName: '宛城',
    modernName: '南阳市',
    modernProvince: '河南省',
    lng: 112.53,
    lat: 33.00,
    kingdom: '魏',
    kingdomId: 'wei',
    significance: '南阳盆地重镇，张绣据守此城。曹操攻宛城时典韦战死。',
    battles: ['宛城之战（张绣降而复叛）'],
    changedHands: true // 张绣 -> 曹操
  },
  {
    id: 'shouchun',
    ancientName: '寿春',
    modernName: '寿县（淮南市）',
    modernProvince: '安徽省',
    lng: 116.78,
    lat: 32.57,
    kingdom: '魏',
    kingdomId: 'wei',
    significance: '淮南重镇，袁术在此称帝。后为魏国东南防线要塞，诸葛诞于此叛魏。',
    battles: ['袁术称帝', '诸葛诞叛乱'],
    changedHands: true
  },
  {
    id: 'hefei',
    ancientName: '合肥',
    modernName: '合肥市',
    modernProvince: '安徽省',
    lng: 117.27,
    lat: 31.86,
    kingdom: '魏',
    kingdomId: 'wei',
    significance: '魏吴前线重镇，孙权数次攻合肥未果。张辽以八百骑大破孙权十万大军。',
    battles: ['合肥之战（张辽威震逍遥津）', '孙权五攻合肥'],
    changedHands: false
  },
  {
    id: 'beiping',
    ancientName: '幽州/蓟',
    modernName: '北京市',
    modernProvince: '北京市',
    lng: 116.40,
    lat: 39.90,
    kingdom: '魏',
    kingdomId: 'wei',
    significance: '幽州治所，公孙瓒据此对抗袁绍。刘备、关羽、张飞桃园结义之地。',
    battles: ['桃园三结义', '公孙瓒与袁绍争霸'],
    changedHands: true // 公孙瓒 -> 袁绍 -> 曹操
  },
  {
    id: 'xiapi',
    ancientName: '下邳',
    modernName: '邳州市（徐州市）',
    modernProvince: '江苏省',
    lng: 117.95,
    lat: 34.33,
    kingdom: '魏',
    kingdomId: 'wei',
    significance: '徐州要地，吕布最终据点。曹操水淹下邳擒杀吕布，关羽在此被围降曹。',
    battles: ['水淹下邳擒吕布', '关羽降曹'],
    changedHands: true // 陶谦 -> 刘备 -> 吕布 -> 曹操
  },
  {
    id: 'puyang',
    ancientName: '濮阳',
    modernName: '濮阳市',
    modernProvince: '河南省',
    lng: 115.03,
    lat: 35.76,
    kingdom: '魏',
    kingdomId: 'wei',
    significance: '曹操早期征战之地，与吕布在此多次交锋。曹操险被吕布所擒。',
    battles: ['曹操大战吕布于濮阳'],
    changedHands: true
  },

  // ========== 蜀 (Shu) ==========
  {
    id: 'chengdu',
    ancientName: '成都',
    modernName: '成都市',
    modernProvince: '四川省',
    lng: 104.07,
    lat: 30.67,
    kingdom: '蜀',
    kingdomId: 'shu',
    significance: '蜀汉都城，天府之国。刘备在此称帝建立蜀汉，诸葛亮于此治国，鞠躬尽瘁。',
    battles: ['刘备入蜀', '刘备称帝', '邓艾偷渡阴平灭蜀'],
    changedHands: true // 刘璋 -> 刘备
  },
  {
    id: 'hanzhong',
    ancientName: '汉中',
    modernName: '汉中市',
    modernProvince: '陕西省',
    lng: 107.03,
    lat: 33.07,
    kingdom: '蜀',
    kingdomId: 'shu',
    significance: '蜀汉北方门户，刘备称汉中王之地。定军山之战黄忠斩夏侯渊，诸葛亮北伐出发基地。',
    battles: ['定军山之战', '汉中争夺战', '诸葛亮北伐出师'],
    changedHands: true // 张鲁 -> 曹操 -> 刘备
  },
  {
    id: 'baidi',
    ancientName: '白帝城',
    modernName: '奉节县（重庆市）',
    modernProvince: '重庆市',
    lng: 109.46,
    lat: 31.02,
    kingdom: '蜀',
    kingdomId: 'shu',
    significance: '长江三峡入口，刘备伐吴大败后退守白帝城，临终托孤于诸葛亮，千古名场面。',
    battles: ['白帝城托孤'],
    changedHands: false
  },
  {
    id: 'jiameng',
    ancientName: '葭萌关',
    modernName: '昭化区（广元市）',
    modernProvince: '四川省',
    lng: 105.83,
    lat: 32.32,
    kingdom: '蜀',
    kingdomId: 'shu',
    significance: '入蜀咽喉要道，刘备入川时驻军于此。张飞挑灯夜战马超即在此地。',
    battles: ['张飞大战马超'],
    changedHands: true
  },
  {
    id: 'mianzhu',
    ancientName: '绵竹',
    modernName: '绵竹市（德阳市）',
    modernProvince: '四川省',
    lng: 104.22,
    lat: 31.34,
    kingdom: '蜀',
    kingdomId: 'shu',
    significance: '成都北部屏障，蜀汉最后防线。诸葛瞻父子在此抵抗邓艾，战死殉国。',
    battles: ['绵竹之战（诸葛瞻战死）'],
    changedHands: false
  },

  // ========== 吴 (Wu) ==========
  {
    id: 'jianye',
    ancientName: '建业',
    modernName: '南京市',
    modernProvince: '江苏省',
    lng: 118.80,
    lat: 32.06,
    kingdom: '吴',
    kingdomId: 'wu',
    significance: '东吴都城，虎踞龙盘。孙权于229年在此称帝，诸葛亮舌战群儒之地。',
    battles: ['孙权称帝', '诸葛亮舌战群儒'],
    changedHands: false
  },
  {
    id: 'chaisang',
    ancientName: '柴桑',
    modernName: '九江市',
    modernProvince: '江西省',
    lng: 116.00,
    lat: 29.71,
    kingdom: '吴',
    kingdomId: 'wu',
    significance: '东吴军事指挥中心，周瑜在此统领赤壁之战。位于长江中游，战略位置极为重要。',
    battles: ['赤壁之战前哨', '周瑜运筹帷幄'],
    changedHands: false
  },
  {
    id: 'chibi',
    ancientName: '赤壁',
    modernName: '赤壁市（咸宁市）',
    modernProvince: '湖北省',
    lng: 113.90,
    lat: 29.72,
    kingdom: '吴',
    kingdomId: 'wu',
    significance: '三国最著名战役发生地，孙刘联军以少胜多大破曹操八十万大军，奠定三分天下格局。',
    battles: ['赤壁之战', '火烧连环船', '草船借箭'],
    changedHands: false
  },
  {
    id: 'changsha',
    ancientName: '长沙',
    modernName: '长沙市',
    modernProvince: '湖南省',
    lng: 112.97,
    lat: 28.23,
    kingdom: '吴',
    kingdomId: 'wu',
    significance: '荆南四郡之一，黄忠曾为长沙太守。关羽攻取长沙时与黄忠义战，惺惺相惜。',
    battles: ['关羽战黄忠取长沙'],
    changedHands: true // 刘备 -> 孙权
  },
  {
    id: 'kuaiji',
    ancientName: '会稽',
    modernName: '绍兴市',
    modernProvince: '浙江省',
    lng: 120.58,
    lat: 30.00,
    kingdom: '吴',
    kingdomId: 'wu',
    significance: '东吴东南腹地，鱼米富庶之乡。孙氏家族早期经营之地。',
    battles: [],
    changedHands: false
  },
  {
    id: 'wuchang',
    ancientName: '武昌',
    modernName: '鄂州市',
    modernProvince: '湖北省',
    lng: 114.89,
    lat: 30.39,
    kingdom: '吴',
    kingdomId: 'wu',
    significance: '东吴重要都城之一，孙权曾迁都于此。扼守长江中游，控制荆州方向。',
    battles: ['孙权迁都武昌'],
    changedHands: false
  },

  // ========== 争夺之地 (Contested) ==========
  {
    id: 'jingzhou',
    ancientName: '荆州',
    modernName: '荆州市',
    modernProvince: '湖北省',
    lng: 112.24,
    lat: 30.33,
    kingdom: '蜀→吴',
    kingdomId: 'contested',
    significance: '三国兵家必争之地，三国势力交汇点。刘备借荆州起家，关羽镇守时威震华夏，后败走麦城。',
    battles: ['刘备借荆州', '关羽水淹七军', '关羽败走麦城', '吕蒙白衣渡江'],
    changedHands: true // 刘表 -> 曹操 -> 刘备 -> 孙权
  },
  {
    id: 'fancheng',
    ancientName: '樊城',
    modernName: '襄阳市（樊城区）',
    modernProvince: '湖北省',
    lng: 112.14,
    lat: 32.04,
    kingdom: '魏',
    kingdomId: 'wei',
    significance: '襄樊重镇，魏吴蜀三方激烈争夺之地。关羽水淹七军围樊城，曹仁死守。',
    battles: ['关羽围樊城', '水淹七军擒于禁'],
    changedHands: true
  },
  {
    id: 'xiangyang',
    ancientName: '襄阳',
    modernName: '襄阳市',
    modernProvince: '湖北省',
    lng: 112.14,
    lat: 32.04,
    kingdom: '魏',
    kingdomId: 'wei',
    significance: '荆州治所所在地，刘表据此经营荆州。刘备三顾茅庐于此地隆中，诸葛亮提出隆中对。',
    battles: ['三顾茅庐', '隆中对'],
    changedHands: true // 刘表 -> 曹操
  },
  {
    id: 'yiling',
    ancientName: '夷陵',
    modernName: '宜昌市（夷陵区）',
    modernProvince: '湖北省',
    lng: 111.32,
    lat: 30.77,
    kingdom: '吴',
    kingdomId: 'wu',
    significance: '夷陵之战发生地，陆逊火烧连营七百里，大破刘备七十万大军。蜀汉由此衰落。',
    battles: ['夷陵之战（火烧连营）'],
    changedHands: true
  },
  {
    id: 'xinye',
    ancientName: '新野',
    modernName: '新野县（南阳市）',
    modernProvince: '河南省',
    lng: 112.36,
    lat: 32.52,
    kingdom: '蜀',
    kingdomId: 'shu',
    significance: '刘备寄居荆州时驻地，诸葛亮初出茅庐首次用兵。火烧博望坡、火烧新野皆在此。',
    battles: ['火烧博望坡', '火烧新野'],
    changedHands: true
  }
];

// ========== 黄河 (Yellow River) key waypoints ==========
export const yellowRiver = {
  name: '黄河',
  id: 'yellow-river',
  // Key bend points from west to east (approximate course during Three Kingdoms)
  points: [
    { lng: 100.00, lat: 36.00, label: '黄河上游（兰州附近）' },
    { lng: 104.10, lat: 37.50, label: '宁夏段' },
    { lng: 106.70, lat: 38.50, label: '河套北上' },
    { lng: 107.00, lat: 40.50, label: '河套顶部（包头）' },
    { lng: 110.00, lat: 40.00, label: '河套东折' },
    { lng: 111.50, lat: 39.00, label: '晋陕峡谷北端' },
    { lng: 110.50, lat: 37.50, label: '晋陕峡谷中段' },
    { lng: 110.00, lat: 35.50, label: '壶口瀑布附近' },
    { lng: 110.25, lat: 34.80, label: '潼关/风陵渡（黄河大拐弯）' },
    { lng: 112.00, lat: 34.90, label: '洛阳北（孟津）' },
    { lng: 113.70, lat: 35.00, label: '郑州段（中原腹地）' },
    { lng: 115.00, lat: 35.40, label: '濮阳段' },
    { lng: 116.50, lat: 36.50, label: '济南段' },
    { lng: 118.50, lat: 37.50, label: '黄河入海口（东营）' }
  ]
};

// ========== 长江 (Yangtze River) key waypoints ==========
export const yangtzeRiver = {
  name: '长江',
  id: 'yangtze-river',
  // Key points from Sichuan to the sea
  points: [
    { lng: 101.00, lat: 29.00, label: '长江上游（攀枝花）' },
    { lng: 103.70, lat: 29.35, label: '乐山（岷江汇入）' },
    { lng: 104.60, lat: 29.35, label: '宜宾（金沙江与岷江交汇）' },
    { lng: 105.80, lat: 29.55, label: '泸州' },
    { lng: 106.55, lat: 29.56, label: '重庆（嘉陵江汇入）' },
    { lng: 108.40, lat: 30.80, label: '万州' },
    { lng: 109.46, lat: 31.02, label: '白帝城/奉节（三峡入口）' },
    { lng: 110.40, lat: 30.70, label: '三峡中段（巫峡）' },
    { lng: 111.30, lat: 30.70, label: '宜昌/夷陵（三峡出口）' },
    { lng: 112.24, lat: 30.33, label: '荆州' },
    { lng: 113.40, lat: 29.90, label: '岳阳（洞庭湖入江口）' },
    { lng: 113.90, lat: 29.72, label: '赤壁' },
    { lng: 114.30, lat: 30.60, label: '武汉（汉水汇入）' },
    { lng: 114.89, lat: 30.39, label: '武昌/鄂州' },
    { lng: 116.00, lat: 29.71, label: '九江/柴桑（鄱阳湖入江口）' },
    { lng: 117.36, lat: 30.91, label: '芜湖' },
    { lng: 118.50, lat: 32.00, label: '南京/建业' },
    { lng: 119.43, lat: 32.20, label: '镇江' },
    { lng: 121.50, lat: 31.40, label: '长江入海口（上海）' }
  ]
};

// ========== 主要山脉 (Major Mountain Ranges) ==========
export const mountainRanges = [
  {
    id: 'qinling',
    name: '秦岭',
    significance: '魏蜀天然分界线，诸葛亮北伐必经之险。子午谷、斜谷、褒斜道皆穿秦岭而过。',
    // Ridge line approximation (west to east)
    points: [
      { lng: 104.50, lat: 34.00 },
      { lng: 106.00, lat: 33.80 },
      { lng: 107.50, lat: 33.90 },
      { lng: 108.50, lat: 34.00 },
      { lng: 109.50, lat: 34.00 },
      { lng: 110.50, lat: 34.00 },
      { lng: 111.50, lat: 34.10 },
      { lng: 112.50, lat: 34.30 }
    ]
  },
  {
    id: 'daba',
    name: '大巴山',
    significance: '汉中盆地南部屏障，蜀道之一部分。连接秦岭与四川盆地。',
    points: [
      { lng: 106.00, lat: 32.50 },
      { lng: 107.50, lat: 32.30 },
      { lng: 108.50, lat: 32.00 },
      { lng: 109.50, lat: 31.80 },
      { lng: 110.50, lat: 31.50 }
    ]
  },
  {
    id: 'taihang',
    name: '太行山',
    significance: '华北平原与山西高原分界线，曹操北征乌桓和征讨袁氏余部经此。',
    points: [
      { lng: 112.00, lat: 35.00 },
      { lng: 113.00, lat: 36.00 },
      { lng: 113.50, lat: 37.00 },
      { lng: 114.00, lat: 38.00 },
      { lng: 114.50, lat: 39.00 },
      { lng: 115.00, lat: 40.00 }
    ]
  },
  {
    id: 'wushan',
    name: '巫山',
    significance: '长江三峡所在山脉，白帝城扼其入口。刘备伐吴及蜀道东线的关键地理屏障。',
    points: [
      { lng: 109.50, lat: 31.80 },
      { lng: 110.00, lat: 31.30 },
      { lng: 110.50, lat: 30.80 },
      { lng: 110.00, lat: 30.30 }
    ]
  },
  {
    id: 'qilian',
    name: '祁连山',
    significance: '河西走廊南屏，马超、韩遂等凉州军阀活动区域的南部边界。',
    points: [
      { lng: 97.00, lat: 39.00 },
      { lng: 99.00, lat: 38.50 },
      { lng: 101.00, lat: 38.00 },
      { lng: 103.00, lat: 37.00 }
    ]
  },
  {
    id: 'nanling',
    name: '南岭',
    significance: '东吴南部边界山脉，吴国向南扩展的天然屏障。孙权征山越多在此山区。',
    points: [
      { lng: 110.00, lat: 25.50 },
      { lng: 112.00, lat: 25.00 },
      { lng: 114.00, lat: 25.00 },
      { lng: 116.00, lat: 25.50 }
    ]
  }
];

// ========== 战略关隘 (Strategic Passes) ==========
export const strategicPasses = [
  {
    id: 'hangu',
    name: '函谷关',
    lng: 110.87,
    lat: 34.52,
    significance: '关中东大门，自秦以来天下第一关。控制关中通往中原的要道。',
    controls: '关中 ↔ 中原'
  },
  {
    id: 'hulao',
    name: '虎牢关',
    lng: 113.22,
    lat: 34.73,
    significance: '洛阳东部门户，三英战吕布之地。十八路诸侯讨董卓时激战于此。',
    controls: '洛阳 ↔ 中原东部'
  },
  {
    id: 'tongguan',
    name: '潼关',
    lng: 110.25,
    lat: 34.49,
    significance: '关中东门户，黄河、渭水、秦岭三险合一。曹操与马超韩遂大战于此。',
    controls: '关中 ↔ 中原（黄河沿线）'
  },
  {
    id: 'jiange',
    name: '剑阁',
    lng: 105.53,
    lat: 32.18,
    significance: '蜀道咽喉，一夫当关万夫莫开。姜维退守剑阁阻挡钟会大军，邓艾绕道阴平灭蜀。',
    controls: '汉中 ↔ 成都'
  },
  {
    id: 'yangping',
    name: '阳平关',
    lng: 106.55,
    lat: 33.20,
    significance: '汉中北部要塞，张鲁据守之地。曹操攻汉中必经此关。',
    controls: '关中 ↔ 汉中'
  },
  {
    id: 'wugu',
    name: '武关',
    lng: 110.35,
    lat: 33.57,
    significance: '秦岭南麓关隘，关中通往南阳的捷径。连接关中与荆襄地区。',
    controls: '关中 ↔ 南阳/荆州'
  },
  {
    id: 'dingjunshan',
    name: '定军山',
    lng: 106.80,
    lat: 33.03,
    significance: '汉中争夺战关键高地，黄忠在此斩杀曹魏名将夏侯渊，刘备由此取得汉中。',
    controls: '汉中盆地制高点'
  },
  {
    id: 'qishan',
    name: '祁山',
    lng: 105.30,
    lat: 34.15,
    significance: '诸葛亮六出祁山北伐曹魏的主要路线。祁山堡为前线据点。',
    controls: '汉中 ↔ 天水/陇右'
  },
  {
    id: 'shangyong',
    name: '上庸',
    lng: 110.10,
    lat: 32.30,
    significance: '魏蜀交界山区重镇，孟达据守此地反复在魏蜀之间叛变。关羽败亡时刘封孟达未救援。',
    controls: '汉中 ↔ 襄阳（汉水上游）'
  },
  {
    id: 'yinping',
    name: '阴平道',
    lng: 104.70,
    lat: 32.90,
    significance: '邓艾偷渡阴平的险路，翻越摩天岭直取江油，绕过剑阁灭蜀。三国最大胆的军事行动之一。',
    controls: '陇南 ↔ 蜀中（绕过剑阁）'
  },
  {
    id: 'chibi_pass',
    name: '赤壁渡口',
    lng: 113.94,
    lat: 29.73,
    significance: '长江中游渡口，赤壁之战主战场。孙刘联军在此以火攻大破曹操水军。',
    controls: '长江南北渡口'
  }
];

// ========== 地图边界 (Map bounds for rendering) ==========
export const mapBounds = {
  west: 97.0,
  east: 122.0,
  north: 42.0,
  south: 24.0
};

// ========== 王国颜色 (Kingdom colors) ==========
export const kingdomColors = {
  wei: { primary: '#4a90d9', name: '魏', ruler: '曹操/曹丕' },
  shu: { primary: '#4caf50', name: '蜀', ruler: '刘备/刘禅' },
  wu:  { primary: '#ef5350', name: '吴', ruler: '孙权' },
  contested: { primary: '#ff9800', name: '争夺', ruler: '多方' }
};

// ========== Helper functions ==========

export function getCitiesByKingdom(kingdomId) {
  return threeKingdomsCities.filter(c => c.kingdomId === kingdomId);
}

export function getCityById(id) {
  return threeKingdomsCities.find(c => c.id === id);
}

export function getPassById(id) {
  return strategicPasses.find(p => p.id === id);
}

// Convert lng/lat to simple x/y for SVG rendering (0-600 range)
export function geoToSvg(lng, lat, width = 600, height = 500) {
  const x = ((lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * width;
  const y = ((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) * height;
  return { x: Math.round(x), y: Math.round(y) };
}
