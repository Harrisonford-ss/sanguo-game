// 三国志探险 - 地图数据

export const regions = [
  {
    id: 'wei',
    name: '魏',
    color: '#4a90d9',
    // SVG path 表示魏国疆域（简化的中国北方区域）
    path: 'M 200,50 L 450,40 L 500,80 L 520,160 L 480,220 L 400,250 L 300,260 L 200,230 L 150,160 L 160,100 Z'
  },
  {
    id: 'shu',
    name: '蜀',
    color: '#4caf50',
    // SVG path 表示蜀国疆域（西南区域）
    path: 'M 100,230 L 200,230 L 300,260 L 320,320 L 280,380 L 200,400 L 120,370 L 80,300 L 80,260 Z'
  },
  {
    id: 'wu',
    name: '吴',
    color: '#ef5350',
    // SVG path 表示吴国疆域（东南区域）
    path: 'M 300,260 L 400,250 L 480,220 L 530,260 L 540,340 L 500,400 L 400,420 L 320,400 L 280,380 L 320,320 Z'
  }
];

export const cities = [
  // 魏国城市
  {
    id: 'luoyang',
    name: '洛阳',
    region: 'wei',
    x: 320, y: 140,
    description: '东汉首都，天下之中。董卓乱政后被焚毁，曹魏时期重新营建为都城。',
    connectedTo: ['xuchang', 'changan'],
    quizId: 'sanguo-guijin',
    npcTeam: ['simayi', 'xunyu', 'dianwei'],
    unlocked: true
  },
  {
    id: 'xuchang',
    name: '许昌',
    region: 'wei',
    x: 380, y: 180,
    description: '曹操挟天子以令诸侯的根据地，曹魏实际上的政治中心。',
    connectedTo: ['luoyang', 'yecheng', 'jingzhou'],
    quizId: 'guandu',
    npcTeam: ['guojia', 'xunyu', 'xuchu'],
    unlocked: false
  },
  {
    id: 'yecheng',
    name: '邺城',
    region: 'wei',
    x: 380, y: 90,
    description: '袁绍的大本营，官渡之战后归曹操所有。建有铜雀台，是曹魏的北方重镇。',
    connectedTo: ['xuchang', 'luoyang'],
    quizId: null,
    npcTeam: ['zhangliao', 'xiahoudun', 'dianwei'],
    unlocked: false
  },
  {
    id: 'changan',
    name: '长安',
    region: 'wei',
    x: 200, y: 130,
    description: '西汉旧都，雄踞关中。三国时期是魏国西部的军事重镇。',
    connectedTo: ['luoyang', 'hanzhong'],
    quizId: null,
    npcTeam: ['caocao', 'xiahoudun', 'xuchu'],
    unlocked: false
  },
  // 蜀国城市
  {
    id: 'chengdu',
    name: '成都',
    region: 'shu',
    x: 180, y: 300,
    description: '蜀汉都城，天府之国。刘备在此称帝建立蜀汉，诸葛亮于此治国理政。',
    connectedTo: ['hanzhong', 'baidi'],
    quizId: 'qiqin-menghuo',
    npcTeam: ['weiyan', 'huangzhong', 'machao'],
    unlocked: true
  },
  {
    id: 'hanzhong',
    name: '汉中',
    region: 'shu',
    x: 200, y: 230,
    description: '蜀汉北方门户，定军山之战后归刘备。诸葛亮北伐的出发基地。',
    connectedTo: ['chengdu', 'changan'],
    quizId: 'kongchengji',
    npcTeam: ['zhugeliang', 'weiyan', 'machao'],
    unlocked: false
  },
  {
    id: 'jingzhou',
    name: '荆州',
    region: 'shu',
    x: 340, y: 280,
    description: '兵家必争之地，三国交汇处。刘备借荆州起家，关羽镇守荆州威震华夏。',
    connectedTo: ['xuchang', 'chengdu', 'changsha', 'baidi'],
    quizId: 'sangumaolu',
    npcTeam: ['guanyu', 'zhangfei', 'weiyan'],
    unlocked: false
  },
  {
    id: 'baidi',
    name: '白帝城',
    region: 'shu',
    x: 250, y: 340,
    description: '位于长江三峡之口，刘备伐吴失败后退守白帝城，在此托孤给诸葛亮。',
    connectedTo: ['chengdu', 'jingzhou'],
    quizId: 'huoshao-lianying',
    npcTeam: ['liubei', 'zhaoyun', 'huangzhong'],
    unlocked: false
  },
  // 吴国城市
  {
    id: 'jianye',
    name: '建业',
    region: 'wu',
    x: 490, y: 270,
    description: '东吴都城（今南京），虎踞龙盘之地。孙权在此建都，开创东吴基业。',
    connectedTo: ['chaisang', 'kuaiji'],
    quizId: 'sanguo-guijin',
    npcTeam: ['sunquan', 'luxun', 'lvmeng'],
    unlocked: true
  },
  {
    id: 'chaisang',
    name: '柴桑',
    region: 'wu',
    x: 430, y: 300,
    description: '东吴军事重镇，赤壁之战的指挥中心。周瑜在此运筹帷幄，火烧赤壁。',
    connectedTo: ['jianye', 'changsha', 'jingzhou'],
    quizId: 'chibi',
    npcTeam: ['zhouyu', 'huanggai', 'lusu'],
    unlocked: false
  },
  {
    id: 'kuaiji',
    name: '会稽',
    region: 'wu',
    x: 520, y: 340,
    description: '东吴东南重镇，孙氏家族的发祥地之一。鱼米之乡，经济富庶。',
    connectedTo: ['jianye', 'changsha'],
    quizId: null,
    npcTeam: ['taishici', 'ganning', 'lvmeng'],
    unlocked: false
  },
  {
    id: 'changsha',
    name: '长沙',
    region: 'wu',
    x: 400, y: 370,
    description: '荆南重镇，黄忠曾为长沙太守。关羽攻取长沙时与黄忠在此大战。',
    connectedTo: ['chaisang', 'kuaiji', 'jingzhou'],
    quizId: 'changbanpo',
    npcTeam: ['huangzhong', 'taishici', 'huanggai'],
    unlocked: false
  }
];

// 获取城市
export function getCity(id) {
  return cities.find(c => c.id === id);
}

// 获取区域
export function getRegion(id) {
  return regions.find(r => r.id === id);
}
