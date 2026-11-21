/* ============================================================
   东京梦华 · 市井浮生  |  DATA
   纯数据与纯函数，不触碰 DOM，可直接在 node 下 require 做静态校验。
   ============================================================ */
const D = {};

D.META = {
  title: '东京梦华 · 市井浮生',
  version: '0.9.0',
  days: 8,
  slotMs: 90000,          // 一时段 90 秒
  yuanxiaoMs: 480000,     // 上元限时 8 分钟
  startMoney: 1500,
  roomFee: 20,
  mealFee: 15
};

D.SLOTS = ['清晨', '午后', '入夜', '深夜'];
D.DATES = ['正月初八', '正月初九', '正月初十', '正月十一', '正月十二', '正月十三', '正月十四', '正月十五'];

/* ------------------------------------------------------------
   出身
   ------------------------------------------------------------ */
D.ORIGINS = {
  shizi: {
    key: 'shizi', name: '寒门士子', who: '赵墨卿 · 二十岁', career: 'keju',
    color: '#dfe5ec', hair: '#2e2a26',
    attrs: { 才学: 30, 身手: 8, 人脉: 10, 名声: 5 }, money: 1500,
    desc: '科举落第，盘缠将尽，寄宿州桥边脚店。一箱旧书，半囊残墨。',
    line: '书铺抄书糊口 → 学官赏识 → 卷入科举关节风波',
    start: 'op_s1'
  },
  shang: {
    key: 'shang', name: '南商之子', who: '沈行舟 · 十八岁', career: 'jingshang',
    color: '#c9a06a', hair: '#22201e',
    attrs: { 才学: 8, 身手: 10, 人脉: 15, 名声: 5 }, money: 3500,
    desc: '随父运货北上，父亲病倒，独力押着两船茶货入京。',
    line: '货被牙人压价 → 行会门槛 → 囤货风波',
    start: 'op_m1'
  },
  jiang: {
    key: 'jiang', name: '匠户弟子', who: '鲁小山 · 十九岁', career: 'jiyi',
    color: '#8fa08c', hair: '#2b2620',
    attrs: { 才学: 10, 身手: 28, 人脉: 8, 名声: 8 }, money: 1200,
    desc: '随师父修葺州桥，师父伤手，工期压顶。一柄尺，一身好筋骨。',
    line: '包工还债 → 巧思得贵人青眼 → 营造行会之争',
    start: 'op_c1'
  },
  xia: {
    key: 'xia', name: '将门遗孤', who: '燕青锋 · 二十一岁', career: 'youxia',
    color: '#5b6470', hair: '#1e1c1a',
    attrs: { 才学: 6, 身手: 32, 人脉: 8, 名声: 12 }, money: 1000,
    desc: '父兄殁于边事，携抚恤银入京寻旧部。腰上一把旧刀，刀鞘磨得发亮。',
    line: '镖局护镖 → 黑白两道恩怨 → 边事旧案浮出',
    start: 'op_x1'
  }
};

/* ------------------------------------------------------------
   职业
   ------------------------------------------------------------ */
D.CAREERS = {
  keju: {
    name: '科举', stages: ['抄书', '乡贡', '省试', '殿试'],
    need: [3, 4, 5], gate: [{ 才学: 30 }, { 才学: 50, 名声: 20 }, { 才学: 70, 名声: 35 }],
    spot: 'shupu', fail: '盘缠耗尽，只能回落书铺'
  },
  jingshang: {
    name: '经商', stages: ['伙计', '坐商', '行商', '大掌柜'],
    need: [3, 4, 5], gate: [{ 人脉: 25 }, { 人脉: 40, 银钱: 15000 }, { 人脉: 55, 银钱: 40000 }],
    spot: 'bangong', fail: '行会门槛未过，货压在手里'
  },
  jiyi: {
    name: '技艺', stages: ['帮工', '匠人', '名匠', '供奉'],
    need: [3, 4, 5], gate: [{ 身手: 28 }, { 身手: 45 }, { 身手: 62, 名声: 30 }],
    spot: 'xiupeng', fail: '工伤未愈，工期又压上来'
  },
  youxia: {
    name: '游侠', stages: ['护院', '押镖', '成名', '投军'],
    need: [3, 4, 5], gate: [{ 身手: 30 }, { 身手: 48, 人脉: 25 }, { 身手: 65, 人脉: 40 }],
    spot: 'biaoju', fail: '惹上官非，只能暂避'
  }
};

/* 工作点：银钱以文计 */
D.WORKS = {
  shupu: {
    label: '抄书', line: 'keju', stam: 22, exp: 1, gain: { 才学: 1 },
    pay: s => 60 + s.attrs.才学 * 4,
    verb: '替书铺抄了两卷《论语》，指节发僵。'
  },
  bangong: {
    label: '夜市帮工', line: 'jingshang', stam: 20, exp: 1, gain: { 人脉: 1 },
    pay: s => 100 + s.attrs.人脉 * 2,
    verb: '替三家的摊子搬了半夜货，袖口沾了油。'
  },
  xiupeng: {
    label: '修摊棚', line: 'jiyi', stam: 24, exp: 1, gain: { 身手: 1 },
    pay: s => 80 + s.attrs.身手 * 3,
    verb: '把塌了半边的摊棚重新立起来，掌上起了一层新茧。'
  },
  biaoju: {
    label: '押镖护院', line: 'youxia', stam: 26, exp: 1, gain: { 身手: 1, 人脉: 1 },
    pay: s => 90 + s.attrs.身手 * 2 + s.attrs.人脉 * 2,
    verb: '守了一夜的货栈，天将亮时赶走了两个摸门的小贼。'
  },
  paotui: {
    label: '跑腿传话', line: null, stam: 14, exp: 0, gain: { 人脉: 1 },
    pay: s => 50 + s.attrs.人脉,
    verb: '替人跑了几趟腿，把话从州桥带到御街。'
  }
};

/* ------------------------------------------------------------
   地点
   ------------------------------------------------------------ */
D.LOCATIONS = {
  zhouqiao: {
    name: '州桥夜市', deco: 'market', w: 1600, h: 1000, ground: '#463a30', spawn: { x: 250, y: 520 },
    blurb: '直至三更尽，才五更又复开张',
    portals: [
      { x: 1540, y: 420, w: 60, h: 160, to: 'washe', label: '东去 · 瓦舍勾栏' },
      { x: 0, y: 420, w: 60, h: 160, to: 'siguo', label: '西往 · 大相国寺' },
      { x: 740, y: 0, w: 130, h: 60, to: 'yujie', label: '北上市门 · 御街' },
      { x: 740, y: 940, w: 130, h: 60, to: 'inn', label: '南回 · 脚店' }
    ],
    spots: [{ id: 'xiupeng', x: 1090, y: 720 }, { id: 'paotui', x: 330, y: 300 }],
    npcs: {
      su: { x: 470, y: 600 }, eshao: { x: 930, y: 500 }, qigai: { x: 190, y: 780 },
      xiaoSu: { x: 540, y: 672 }, yali: { x: 1180, y: 470 }
    }
  },
  washe: {
    name: '瓦舍勾栏', deco: 'goulan', w: 1600, h: 1000, ground: '#2b2233', spawn: { x: 200, y: 520 },
    blurb: '大小勾栏五十余座，可容数千人',
    portals: [
      { x: 0, y: 420, w: 60, h: 160, to: 'zhouqiao', label: '西去 · 州桥夜市' },
      { x: 1540, y: 420, w: 60, h: 160, to: 'yujie', label: '北往 · 御街' }
    ],
    spots: [{ id: 'biaoju', x: 1320, y: 780 }],
    npcs: {
      liu: { x: 820, y: 430 }, shuoshu: { x: 430, y: 640 }, laobao: { x: 640, y: 300 },
      haoke: { x: 1080, y: 540 }, yaren: { x: 1240, y: 400 }
    }
  },
  siguo: {
    name: '大相国寺', deco: 'temple', w: 1600, h: 1000, ground: '#3a4148', spawn: { x: 200, y: 520 },
    blurb: '每月五次开放，万姓交易',
    portals: [
      { x: 1540, y: 420, w: 60, h: 160, to: 'zhouqiao', label: '东去 · 州桥夜市' },
      { x: 740, y: 0, w: 130, h: 60, to: 'yujie', label: '北往 · 御街' }
    ],
    spots: [{ id: 'paotui', x: 420, y: 780 }],
    npcs: { li: { x: 940, y: 520 }, qigai: { x: 1250, y: 700 } }
  },
  yujie: {
    name: '御街', deco: 'street', w: 1600, h: 1000, ground: '#39434c', spawn: { x: 780, y: 880 },
    blurb: '约阔二百余步，直至夜深方收市',
    portals: [
      { x: 740, y: 940, w: 130, h: 60, to: 'zhouqiao', label: '南下 · 州桥' },
      { x: 0, y: 420, w: 60, h: 160, to: 'siguo', label: '西往 · 相国寺' },
      { x: 1540, y: 420, w: 60, h: 160, to: 'washe', label: '东去 · 瓦舍' }
    ],
    spots: [{ id: 'shupu', x: 760, y: 300 }, { id: 'bangong', x: 1220, y: 760 }],
    npcs: {
      qin: { x: 940, y: 520 }, xueguan: { x: 520, y: 340 }, hanglao: { x: 1240, y: 620 },
      jiaofu: { x: 700, y: 760 }, zongzu: { x: 1080, y: 600 }, yali: { x: 400, y: 700 },
      yaren: { x: 300, y: 400 }
    }
  },
  inn: {
    name: '脚店', deco: 'inn', w: 900, h: 700, ground: '#43372f', spawn: { x: 450, y: 260 },
    blurb: '房钱每日二十文',
    portals: [{ x: 400, y: 0, w: 120, h: 60, to: 'zhouqiao', label: '出门 · 州桥' }],
    spots: [{ id: 'bed', x: 200, y: 460 }],
    npcs: { xiaoer: { x: 470, y: 380 } }
  }
};

/* ------------------------------------------------------------
   NPC
   sched：四个时段各自所在的区（空数组表示不在）
   ------------------------------------------------------------ */
D.NPCS = {
  su: {
    name: '苏羹娘', tag: '州桥夜市 · 旋煎茶', color: '#5b7355', hair: '#241f1a',
    idle: 'stir', sched: [['zhouqiao'], ['zhouqiao'], ['zhouqiao'], ['zhouqiao']], talk: 'su_1',
    chatAgain: '（锅里的羹正滚，她只腾出一只手，把凳子往你这边挪了挪）'
  },
  liu: {
    name: '柳婉卿', tag: '莲花棚 · 小卿', color: '#c9a0c0', hair: '#1f1a1e',
    idle: 'sleeve', sched: [['washe'], ['washe'], ['washe'], ['washe']], talk: 'liu_1',
    chatAgain: '（她正卸妆，从镜子里看了你一眼，没停手）'
  },
  qin: {
    name: '秦九娘', tag: '九章堂 · 香药', color: '#7b2f3a', hair: '#20191a',
    idle: 'abacus', sched: [['yujie'], ['yujie'], ['yujie'], []], talk: 'qin_1',
    chatAgain: '（算盘珠子响得急，她抬手示意你先坐）'
  },
  li: {
    name: '李氏', tag: '士族闺秀 · 寓京', color: '#e8eaf0', hair: '#232028',
    idle: 'fan', sched: [[], ['siguo'], ['siguo'], []], talk: 'li_1',
    chatAgain: '（她摇着团扇，隔着水声同你点了个头）'
  },
  xiaoer: {
    name: '陈三娘', tag: '脚店掌柜', color: '#8a6d4a', hair: '#2a231c',
    idle: 'none', sched: [['inn'], ['inn'], ['inn'], ['inn']], talk: 'inn_1'
  },
  shuoshu: {
    name: '说书人 苟四', tag: '瓦舍 · 话本', color: '#6b6350', hair: '#2c2820',
    idle: 'none', sched: [[], ['washe'], ['washe'], ['washe']], talk: 'shuo_1'
  },
  xueguan: {
    name: '学官 周教授', tag: '国子监 · 教授', color: '#7d8490', hair: '#211f1c',
    idle: 'none', sched: [['yujie'], ['yujie'], [], []], talk: 'xg_1'
  },
  hanglao: {
    name: '行老 曹大郎', tag: '诸行 · 行老', color: '#8a6a4a', hair: '#241f1b',
    idle: 'none', sched: [['yujie'], ['yujie'], ['yujie'], []], talk: 'hl_1',
    chatAgain: '（他在算行里的抽头，没抬头）'
  },
  qigai: {
    name: '乞儿', tag: '廊下', color: '#5a5348', hair: '#2a2621',
    idle: 'none', sched: [['zhouqiao'], ['siguo'], ['zhouqiao'], ['zhouqiao']], talk: 'qg_1'
  },
  jiaofu: {
    name: '脚夫 牛七', tag: '搬运行', color: '#6d6552', hair: '#231f1a',
    idle: 'none', sched: [['yujie'], ['yujie'], ['yujie'], []], talk: 'jf_1'
  },
  eshao: {
    name: '恶少 张衙内', tag: '衙内 · 门下', color: '#7a3a35', hair: '#1d1917',
    idle: 'none', sched: [[], ['zhouqiao'], ['zhouqiao'], []], talk: 'es_1'
  },
  yaren: {
    name: '牙人 胡九', tag: '牙行', color: '#7b6a3f', hair: '#241f18',
    idle: 'none', sched: [['yujie'], ['yujie'], ['washe'], []], talk: 'yr_1'
  },
  laobao: {
    name: '干娘 李二妈', tag: '莲花棚 · 掌事', color: '#8e5a63', hair: '#221a1c',
    idle: 'none', sched: [['washe'], ['washe'], ['washe'], ['washe']], talk: 'lb_1'
  },
  haoke: {
    name: '豪客 王承议', tag: '承议郎', color: '#5e4a6b', hair: '#211c22',
    idle: 'none', sched: [[], [], ['washe'], ['washe']], talk: 'hk_1'
  },
  zongzu: {
    name: '族叔 秦仲', tag: '秦氏宗族', color: '#5a5a4a', hair: '#252220',
    idle: 'none', sched: [['yujie'], ['yujie'], ['yujie'], []], talk: 'zz_1'
  },
  yali: {
    name: '衙吏', tag: '开封府 · 吏', color: '#4f5766', hair: '#1e1c1a',
    idle: 'none', sched: [['yujie'], ['yujie'], ['zhouqiao'], ['zhouqiao']], talk: 'yl_1'
  },
  xiaoSu: {
    name: '阿满', tag: '苏家幼弟 · 九岁', color: '#7f8f6d', hair: '#241f1a',
    idle: 'none', sched: [['zhouqiao'], ['zhouqiao'], ['zhouqiao'], []], talk: 'sm_1',
    chatAgain: '（他正拿炭笔在青石板上画字，见你来了赶紧用袖子盖住）'
  }
};

/* ------------------------------------------------------------
   对话胸像：从 8 张人物画里裁的头部特写（480×560，素材未改动）
   键是 DIALOGUES 里的 char 名；没列到的角色继续用程序化小人头像
   ------------------------------------------------------------ */
D.FACES = {
  '苏羹娘': 'assets/face-su.jpg',
  '柳婉卿': 'assets/face-liu.jpg',
  '秦九娘': 'assets/face-qin.jpg',
  '李氏': 'assets/face-gui.jpg',
  '赵墨卿': 'assets/face-shizi.jpg',
  '沈行舟': 'assets/face-shang.jpg',
  '鲁小山': 'assets/face-jiang.jpg',
  '燕青锋': 'assets/face-xia.jpg'
};

/* ------------------------------------------------------------
   消息（真假情报）
   ------------------------------------------------------------ */
D.RUMORS = [
  { id: 'r_tea', from: 'washe', text: '说书人漏了一句：南门外的茶引要涨，囤茶的三日内必赚。', truth: true, gain: { 银钱: 420, 人脉: 1 } },
  { id: 'r_exam', from: 'washe', text: '有人咬耳朵：今科省试重《周礼》，考官好「井田」之论。', truth: true, gain: { 才学: 3, 名声: 2 } },
  { id: 'r_silk', from: 'zhouqiao', text: '夜市里传：苏州丝绸断货，明日价钱翻倍。', truth: false, loss: { 银钱: 260, 体力: 10 } },
  { id: 'r_office', from: 'zhouqiao', text: '摊上人说：可在开封府捐个「散官」，画个押便成。', truth: false, loss: { 银钱: 300, 名声: 3 } },
  { id: 'r_herb', from: 'siguo', text: '香客低语：香药行要断货，九章堂明日必抬价。', truth: true, gain: { 银钱: 300, 人脉: 2 } },
  { id: 'r_tomb', from: 'siguo', text: '签文说：相国寺后墙埋着前朝铜器，掘之可富。', truth: false, loss: { 银钱: 200, 体力: 20 } }
];

/* ------------------------------------------------------------
   事件（进入地点或时段推进时检查）
   ------------------------------------------------------------ */
D.EVENTS = [
  { id: 'ev_su2', day: 2, slot: 2, loc: 'zhouqiao', cond: s => s.seen.su_1 && !s.flags.su_extort_done, node: 'su_2' },
  { id: 'ev_su_mid', day: 3, slot: 2, loc: 'zhouqiao', cond: s => s.flags.su_extort_done && !s.flags.su_mid, node: 'su_5' },
  { id: 'ev_qin_duan', day: 4, slot: 1, loc: 'siguo', cond: s => !s.flags.qin_mid, node: 'qin_5' },
  { id: 'ev_liu_qixi', day: 5, slot: 2, loc: 'washe', cond: s => s.seen.liu_1 && !s.flags.liu_mid, node: 'liu_5' },
  { id: 'ev_dongzhi', day: 6, slot: 0, loc: 'yujie', cond: s => !s.flags.dz_done, node: 'gen_5' },
  { id: 'ev_qin_case', day: 6, slot: 2, loc: 'yujie', cond: s => s.seen.qin_1 && !s.flags.qin_case_done, node: 'qin_3' },
  { id: 'ev_liu_ke', day: 7, slot: 2, loc: 'washe', cond: s => s.seen.liu_1 && !s.flags.liu_ke_done, node: 'liu_3' },
  { id: 'ev_su_snow', day: 7, slot: 3, loc: 'zhouqiao', cond: s => s.stamina < 40 && !s.flags.su_snow, node: 'su_4' },
  { id: 'ev_li_exam', day: 6, slot: 0, loc: 'siguo', cond: s => s.attrs.才学 >= 45 && !s.flags.li_met2, node: 'li_2' }
];

/* ------------------------------------------------------------
   结局
   ------------------------------------------------------------ */
const H = (s, k) => s.hearts[k];
D.ENDINGS = [
  {
    id: 'luopo', title: '败而不亡', sub: '结局 · 客栈',
    cond: s => (s.flags.evicted && s.money < 600) || (s.money < 50 && s.stamina < 20),
    text: [
      '第三夜没付房钱，陈三娘把行李搁在门槛上，叹了口气：「不是我心狠。」',
      '你在州桥的石阶上坐到天亮，身上只剩半块冷馒头。有人蹲下来，把一碗热羹推到你手边，什么也没说。',
      '你抬头，看见一双熬红的眼睛。那一刻你才明白，这座城不是靠有志气的人撑着的。',
      '后来你从洗碗做起，重新攒下第一贯钱。日子没变好，但你不再以为自己是个例外。'
    ]
  },
  {
    id: 'zhen', title: '人间有味是清欢', sub: '真结局 · 上元',
    cond: s => (s.flags.su_yuan || s.flags.su_deng || s.flags.su_pu) && s.flags.liu_tuo && s.flags.qin_zheng
      && H(s, 'su').敬重 >= 50 && H(s, 'liu').敬重 >= 50 && H(s, 'qin').敬重 >= 50 && s.yi >= 3 && s.career.stage >= 2,
    text: [
      '灯楼最高处，三百盏灯一齐亮起来的时候，你手里攥着三样东西：一张判状、一份铺契、一纸诉状的批文。',
      '苏羹娘端着一碗旋煎茶骂你「傻」，骂到一半自己笑了；柳婉卿把词册塞进你怀里说「替我收着」；秦九娘只抬了抬下巴：「账我记着，你欠我的。」',
      '你没有做成什么大事。不过是让一个人没被敲诈走，让一个人从乐籍上除了名，让一个人守住了自己的账本。',
      '散场时你回头看了一眼：满城灯火，都是别人的热闹。可你身边这三个人的灯，是你亲手点上的。',
      '「人间有味是清欢。」你忽然懂了这句话不是清高，是有人愿意跟你一起把日子过下去。'
    ]
  },
  {
    id: 'su_xiangshou', title: '州桥相守', sub: '结局 · 市井',
    cond: s => (s.flags.su_yuan || s.flags.su_pu) && H(s, 'su').情谊 >= 55 && H(s, 'su').敬重 >= 40,
    text: [
      '上元过后，州桥的摊子照旧支起来。你替她把「苏」字的布幌挂正，她从灶后探出头来：「歪了，往东半寸。」',
      '铺面不大，两张桌，一口灶，一盏灯。冬天的风灌进来，她把帘子压上一块砖，说这样暖和些。',
      '阿满考中了县学，回来时规规矩矩给你行了个礼，被她一巴掌拍在后脑：「叫姐夫。」',
      '灯暖粥热。你不再想那些没走成的路。'
    ]
  },
  {
    id: 'su_yiqin', title: '一碗热羹', sub: '结局 · 义亲',
    cond: s => s.flags.su_pu && H(s, 'su').敬重 >= 55 && H(s, 'su').情谊 < 55,
    text: [
      '铺契过到她名下那天，她捧着契纸看了很久，最后说：「你这个人，怪。」',
      '她没叫你留下，你也没提。后来你成了摊上常客，她仍收你钱——十文一碗，一文不少。「义亲也要付账。」',
      '阿满进学那日，她把你按在上座，让弟弟给你敬茶。街坊都笑，说苏家多了个「兄长」。',
      '你起身告辞，走到巷口回头看，她正在往锅里添水，背影很直。'
    ]
  },
  {
    id: 'su_yizou', title: '她远走他乡', sub: '结局 · 州桥',
    cond: s => s.seen.su_1 && (s.missed.su || H(s, 'su').情谊 < 30) && !(s.flags.su_yuan || s.flags.su_pu),
    text: [
      '行吏的「照应」比你想的来得快。等你能替她出头的时候，摊子换了主人。',
      '有人说她跟着一支漕船往南去了，也有人说她嫁去了洛阳。阿满的书包里多了一双新鞋。',
      '州桥的夜市照样通宵。你在原来那个位置站了一会儿，买了碗旋煎茶。',
      '茶是别人的手艺，苦得很。'
    ]
  },
  {
    id: 'liu_tuoji', title: '携手离京', sub: '结局 · 乐籍',
    cond: s => s.flags.liu_tuo && H(s, 'liu').情谊 >= 50 && H(s, 'liu').敬重 >= 45 && H(s, 'liu').倾慕 >= 40
      && (s.flags.guanshen || s.career.line === 'youxia' && s.career.stage >= 2),
    text: [
      '判状是从本司递下来的，盖着朱印。干娘张口要的三百贯作不得数——本司定的赎身银是八贯，一文不能少。',
      '那八贯你替她凑了。她攒下的百余贯，后来成了江南书铺的本钱。',
      '干娘李二妈堵着门骂了半个时辰，最后被衙吏一句「本司判状」堵回去。',
      '离京那日下小雪。她穿着素色衣裳出城，没有回头。走到十里亭，她忽然笑：「原来出门是不用唱曲的。」',
      '后来你们在江南开了家小书铺。她抄词，你算账。有人问起汴京，她只说：「去过。」'
    ]
  },
  {
    id: 'liu_haoke', title: '莲花棚外最后一曲', sub: '结局 · 瓦舍',
    cond: s => s.seen.liu_1 && H(s, 'liu').情谊 >= 30 && (s.flags.liu_qu || s.missed.liu || !s.flags.liu_tuo),
    text: [
      '王承议的马车停在莲花棚外，红绸一直铺到街口。',
      '她上台唱最后一曲，唱的是自己抄的那册词里最末一首。唱到「此去经年」时，台下有人笑，有人拍手。',
      '你站在棚外的廊柱下，隔着人群看她抬起又落下的袖。她似乎朝这边看了一眼，又似乎没有。',
      '灯灭之后你才走。雪落在肩上，一直没化。'
    ]
  },
  {
    id: 'qin_guansi', title: '九章堂并肩', sub: '结局 · 御街',
    cond: s => (s.flags.qin_zheng || s.flags.qin_won) && !s.flags.qin_he && H(s, 'qin').敬重 >= 55,
    text: [
      '你上堂作证那日，说的只有一句：「她要的不是铺面，是一句『她还是这家的人』。」',
      '官司赢了。族叔秦仲在堂下站着，脸色铁青，终究没再开口。',
      '开春时九章堂扩出第二间，她把账钥分你一把：「我掌内，你掌外。每月初一核对。」',
      '她仍旧刻薄，仍旧在人后把账算到毫厘。只是每年上元，铺前那盏灯，会多亮一个时辰。'
    ]
  },
  {
    id: 'qin_choushen', title: '御街再见素衣', sub: '结局 · 御街',
    cond: s => s.seen.qin_1 && (s.flags.qin_lose || s.flags.qin_he || s.missed.qin) && !(s.flags.qin_zheng || s.flags.qin_won),
    text: [
      '官司输了。秦氏宗族把九章堂盘了出去，换了南城一间小杂货铺的名字。',
      '没跟你商量。你也确实没有可以拿出上堂的东西：一个名声不够的年轻人，说不动开封府的吏。',
      '多年后你在御街又碰见她。素衣挽鬓，怀里抱着一摞账册，替人代账。她看见你，点了点头，平静得像一口井。',
      '你想说些什么。她先开口：「账还没算完，我先走了。」'
    ]
  },
  {
    id: 'li_fenfei', title: '门第', sub: '结局 · 曲水',
    cond: s => H(s, 'li').倾慕 >= 40 && !s.flags.guanshen && s.attrs.才学 >= 55,
    text: [
      '她父亲请你喝过一次茶。茶是好茶，话也极客气。',
      '「李家的女儿，嫁的是姓氏。」他说这句话时，眼睛一直看着窗外，「你是个好孩子，可惜你姓赵，或者沈，或者鲁，或者燕，都不是李氏。」',
      '她送你的那方小砚还在。砚底刻了两个字，被一层石粉磨得几乎看不清。',
      '来年春天她随父南归。你站在相国寺的山门外，看着车队转过街角。有些事不是不够喜欢，是不够有资格。'
    ]
  },
  {
    id: 'gaozhong', title: '宦海孤身', sub: '结局 · 殿试',
    cond: s => s.career.line === 'keju' && s.career.stage >= 3
      && Math.max(H(s, 'su').情谊, H(s, 'liu').情谊, H(s, 'qin').情谊) < 55,
    text: [
      '殿试唱名那日，你听见自己的名字被拖长着喊到殿前。街坊说这就是天命。',
      '穿上官服的头一年，你在太府寺点校账籍，抄的最多的一句话是「准」。',
      '政和某年冬，上元放灯，你从衙门出来，忽然在小巷口闻见煎茶的焦香。',
      '那一碗热羹，是很多年前有人硬塞到你手里的，她说不收钱。你当时不信。',
      '你站在灯下想了很久，想不起她姓什么了。'
    ]
  },
  {
    id: 'jianghu', title: '携一人远走', sub: '结局 · 江湖',
    cond: s => ['su', 'liu', 'qin', 'li'].some(k => H(s, k).情谊 >= 55 && H(s, k).敬重 >= 40),
    text: [
      '上元过后，你把脚店的门钥匙还了，把欠陈三娘的三日房钱补齐。',
      '有人愿意跟你走：不是因为你能给她什么，而是因为在最难的那几天，你没有掉头。',
      '你们出了陈州门，一路往南。身后这座城还在通宵喧闹，像一口永远烧着的锅。',
      '你不再指望它能给你一个位置。你只需要身边这个人还记得你原来的样子。'
    ]
  },
  {
    id: 'pingdan', title: '市井无声', sub: '结局 · 寻常',
    cond: () => true,
    text: [
      '上元过后，你仍在东京。房钱照付，活计照做，日子一天一天推着人走。',
      '你没做成什么大事，也没落到无处可去。街上的人换了一批又一批，没人记得你来过。',
      '有时夜里收工，你会绕到州桥看一眼那盏灯。灯下有人，也有别人的故事。',
      '你站一会儿，就走了。'
    ]
  }
];

/* 结局判定顺序 */
D.ENDING_ORDER = ['luopo', 'zhen', 'su_xiangshou', 'su_yiqin', 'su_yizou', 'liu_tuoji', 'liu_haoke',
  'qin_guansi', 'qin_choushen', 'li_fenfei', 'gaozhong', 'jianghu', 'pingdan'];

/* ------------------------------------------------------------
   人物对话链：按顺序取第一个满足条件的节点
   ------------------------------------------------------------ */
D.CHAINS = {
  su: [
    { node: 'su_1', cond: s => !s.seen.su_1 },
    { node: 'su_guard', cond: s => !s.seen.su_guard && s.hearts.su.情谊 - s.hearts.su.敬重 >= 25 && s.hearts.su.情谊 >= 40 },
    { node: 'su_3', cond: s => s.hearts.su.情谊 >= 18 && !s.flags.su_account && !s.flags.su_brother && !s.flags.su_shop && !s.flags.su_loan,
      hint: s => '（她确实还有话，只是没到时候。情谊 18 才听得进——如今 ' + s.hearts.su.情谊 + '。）' },
    { node: 'su_talk', cond: () => true, idle: true }
  ],
  liu: [
    { node: 'liu_1', cond: s => !s.seen.liu_1 },
    { node: 'liu_guard', cond: s => !s.seen.liu_guard && s.hearts.liu.情谊 - s.hearts.liu.敬重 >= 25 && s.hearts.liu.情谊 >= 40 },
    { node: 'liu_2', cond: s => s.hearts.liu.情谊 >= 15 && !s.flags.liu_account,
      hint: s => '（她还掂量着你。情谊 15 她才肯算这账——如今 ' + s.hearts.liu.情谊 + '。）' },
    { node: 'liu_4', cond: s => s.hearts.liu.情谊 >= 32 && s.hearts.liu.敬重 >= 28 && !s.flags.liu_book && !s.flags.liu_book_risk,
      hint: s => '（她说有件事只能托给放心的人。情谊 32 / 敬重 28——如今 ' + s.hearts.liu.情谊 + ' / ' + s.hearts.liu.敬重 + '。）' },
    { node: 'liu_talk', cond: () => true, idle: true }
  ],
  qin: [
    { node: 'qin_1', cond: s => !s.seen.qin_1 },
    { node: 'qin_2', cond: s => s.hearts.qin.敬重 >= 18 && !s.flags.qin_ledger,
      hint: s => '（她想找个敢看账的人。敬重 18 才轮得到你看——如今 ' + s.hearts.qin.敬重 + '。）' },
    { node: 'qin_4', cond: s => s.flags.qin_lose && !s.flags.qin_stay && !s.flags.qin_appeal,
      hint: s => '（她这阵子心事重。等她官司上有个了结，再来。）' },
    { node: 'qin_guard', cond: s => !s.seen.qin_guard && s.hearts.qin.情谊 - s.hearts.qin.敬重 >= 25 && s.hearts.qin.情谊 >= 40 },
    { node: 'qin_talk', cond: () => true, idle: true }
  ],
  li: [
    { node: 'li_0', cond: s => !s.seen.li_1 && s.attrs.才学 < 22 },
    { node: 'li_1', cond: s => !s.seen.li_1 },
    { node: 'li_3', cond: s => s.hearts.li.倾慕 >= 18 && !s.flags.li_close,
      hint: s => '（她要的不是客套。倾慕 18 她才肯多看一眼——如今 ' + s.hearts.li.倾慕 + '。）' },
    { node: 'li_4', cond: s => s.hearts.li.倾慕 >= 28 && !s.flags.li_gate,
      hint: s => '（门第的门槛还在。倾慕 28 她才敢领你去——如今 ' + s.hearts.li.倾慕 + '。）' },
    { node: 'li_talk', cond: () => true, idle: true }
  ],
  xiaoSu: [
    { node: 'sm_1', cond: s => !s.seen.sm_1 },
    { node: 'sm_talk', cond: () => true, idle: true }
  ],
  hanglao: [
    { node: 'hl_1', cond: s => !s.seen.hl_1 },
    { node: 'hl_4', cond: s => s.attrs.人脉 >= 25 && !s.flags.hang_named },
    { node: 'hl_5', cond: s => s.flags.hang_named && !s.seen.hl_5 },
    { node: 'hl_talk', cond: () => true, idle: true }
  ]
};

D.checkEnding = function (s) {
  for (const id of D.ENDING_ORDER) {
    const e = D.ENDINGS.find(x => x.id === id);
    if (e && e.cond(s)) return e;
  }
  return D.ENDINGS.find(x => x.id === 'pingdan') || D.ENDINGS[D.ENDINGS.length - 1];
};

/* ------------------------------------------------------------
   工具
   ------------------------------------------------------------ */
D.fmtMoney = function (wen) {
  wen = Math.max(0, Math.round(wen));
  const guan = Math.floor(wen / 1000);
  const rest = wen % 1000;
  if (guan <= 0) return rest + '文';
  return guan + '贯' + (rest ? rest + '文' : '');
};
D.fmtNum = function (n) {
  const s = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  n = Math.max(0, Math.min(100, Math.round(n)));
  if (n === 100) return '壹佰';
  if (n < 10) return s[n];
  const t = Math.floor(n / 10), o = n % 10;
  return (t === 1 ? '' : s[t]) + '拾' + (o ? s[o] : '');
};
D.slotName = function (i) { return D.SLOTS[i] || ''; };
D.dateName = function (d) { return D.DATES[Math.min(d - 1, D.DATES.length - 1)] || ('第' + d + '日'); };

/* ============================================================
   对话表 DIALOGUES
   char: 说话人（'旁白' 为叙述）｜expr: 表情｜choices[].cond: 显示条件
   effects 键：银钱/才学/身手/人脉/名声/体力/情谊_x/敬重_x/倾慕_x
   ============================================================ */
D.DIALOGUES = {

/* ---------------- 开场 · 寒门士子 ---------------- */
op_s1: { char:'旁白', loc:'御街 · 国子监外墙', slot:'清晨',
  text:'榜下人头攒动。你从末尾往前看了三遍，才确信：没有你的名字。\n风把榜纸吹得哗哗响，像谁在耳边一直摇头。', next:'op_s2' },
op_s2: { char:'陈三娘', expr:'忧', loc:'脚店', slot:'清晨',
  text:'回来了？锅里有热水。房钱今日是第八日了——小可不敢催官人，只是账要记着：一日二十文。',
  choices:[
    { text:'先付清这八日', effects:{银钱:-160, 名声:1}, next:'op_s3', hint:'-160文' },
    { text:'宽限三日，寻到活计便还', effects:{名声:1, 人脉:1}, setFlags:['rent_owed'], next:'op_s3' },
    { text:'问她店里可有活计', effects:{人脉:2, 体力:-4}, next:'op_s3' }
  ] },
op_s3: { char:'陈三娘', expr:'平', loc:'脚店', slot:'清晨',
  text:'城西书铺缺个抄书的手。你既是读书人，去试试。价钱不高，一日百余文，好歹够房钱。',
  choices:[
    { text:'谢过，立时就去', effects:{人脉:2, 名声:1}, setFlags:['met_xiaoer'], next:'op_s4' },
    { text:'再问一句：省试可有门路', effects:{才学:1, 人脉:1}, next:'op_s4' }
  ] },
op_s4: { char:'旁白', loc:'御街', slot:'清晨',
  text:'御街宽得能并排走十乘车。你从廊下穿过去，看见一块旧木牌：书铺。\n门口坐着一个青袍老者，正拿卷子校字，头也不抬：「会写小楷么？」', next:'op_s5' },
op_s5: { char:'旁白', loc:'御街 · 书铺', slot:'清晨',
  text:'你在一张矮凳上坐下，笔尖落下第一个字的时候，心忽然定了。\n——八日之后是上元。在那之前，你得先活成个能开口说话的人。',
  choices:[
    { text:'先抄书糊口', effects:{才学:1}, setFlags:['prologue_done'], next:null },
    { text:'打听乡贡的规矩', effects:{才学:2, 人脉:1}, setFlags:['prologue_done'], next:null }
  ] },

/* ---------------- 开场 · 南商之子 ---------------- */
op_m1: { char:'旁白', loc:'汴河 · 虹桥码头', slot:'清晨',
  text:'两船茶货，一路漕运北上。父亲在陈州染了风寒，昨夜烧得说胡话，今早勉强能坐起来，只说了一句：「货不能等。」', next:'op_m2' },
op_m2: { char:'沈父', expr:'忧', loc:'虹桥码头', slot:'清晨',
  text:'牙行的人已经在等了。你记住：他们压价，不是嫌货差，是看你年轻。你若退一步，他们就要退三步。',
  choices:[
    { text:'我记下了，爹先歇着', effects:{名声:1, 人脉:1}, setFlags:['father_sick'], next:'op_m3' },
    { text:'问清行情再开口', effects:{才学:1, 人脉:2}, setFlags:['father_sick'], next:'op_m3' },
    { text:'先支二百文请医', effects:{银钱:-200, 名声:2}, setFlags:['father_sick'], next:'op_m3' }
  ] },
op_m3: { char:'牙人 胡九', expr:'喜', loc:'虹桥码头', slot:'清晨',
  text:'哟，少东家亲自来了。这批茶……今年市面上多得是，我出八贯一船，全收了，省得你操心。',
  choices:[
    { text:'八贯太少，我要十二贯', effects:{人脉:2, 名声:1}, setFlags:['bargain_ok'], next:'op_m4' },
    { text:'先应下，容我再看货', effects:{才学:1, 人脉:1}, next:'op_m4' },
    { text:'一口应下，落袋为安', effects:{银钱:8000}, next:'op_m4' }
  ] },
op_m4: { char:'牙人 胡九', expr:'怒', loc:'虹桥码头', slot:'清晨',
  text:'少东家好大的口气。这汴京城里，货好不好卖，不看货，看你在哪一行里排第几。行会的门槛，你跨得进去么？',
  choices:[
    { text:'跨不跨得进去，试试才知', effects:{人脉:2, 名声:1}, setFlags:['hang_hint'], next:'op_m5' },
    { text:'赔个笑，请他引见行老', effects:{人脉:3, 名声:-1}, setFlags:['hang_hint'], next:'op_m5' }
  ] },
op_m5: { char:'旁白', loc:'州桥 · 脚店', slot:'清晨',
  text:'货暂寄存州桥的仓里，仓租一日十五文。父亲咳着睡下，你数了数钱袋：还够撑七日。\n——八日之后是上元。上元前后，是这一年里最好卖货的几天。',
  choices:[
    { text:'先找牙行探价', effects:{人脉:1}, setFlags:['prologue_done'], next:null },
    { text:'先见行老递个名帖', effects:{人脉:2, 名声:1}, setFlags:['prologue_done'], next:null }
  ] },

/* ---------------- 开场 · 匠户弟子 ---------------- */
op_c1: { char:'旁白', loc:'州桥 · 桥下工棚', slot:'清晨',
  text:'师父的右手被落下的桥栏砸了，虎口裂开，指节肿得发亮。郎中收了三十文，只留下一句：「三个月不能使力。」', next:'op_c2' },
op_c2: { char:'鲁父（师父）', expr:'忧', loc:'桥下工棚', slot:'清晨',
  text:'州桥这活，月底要交。工料钱是行会先垫的，误了工期，赔的是双倍。小山……你一个人顶不住。',
  choices:[
    { text:'我顶得住，师父养伤', effects:{身手:1, 名声:2}, setFlags:['master_hurt'], next:'op_c3' },
    { text:'先问工期还差多少', effects:{才学:1, 身手:1}, setFlags:['master_hurt'], next:'op_c3' },
    { text:'去行会求宽限', effects:{人脉:3, 名声:-1}, setFlags:['master_hurt'], next:'op_c3' }
  ] },
op_c3: { char:'旁白', loc:'州桥 · 桥面', slot:'清晨',
  text:'桥面的青石已铺了七成。你蹲下去摸那道新缝，指腹能感觉到砂粒的粗。\n旁边卖汤饼的老汉探过头来：「小匠人，你这活做得细。细活，价钱也该细。」',
  choices:[
    { text:'先把余下的石铺完', effects:{身手:2}, setFlags:['bridge_job'], next:'op_c4' },
    { text:'跟他打听行会的规矩', effects:{人脉:2}, setFlags:['bridge_job'], next:'op_c4' }
  ] },
op_c4: { char:'旁白', loc:'州桥 · 桥面', slot:'清晨',
  text:'一整个上午，你搬了二十七块石。手掌起泡，泡破了又结茧。\n日头偏西的时候，行老的管事来过一趟，绕着桥走了一圈，什么也没说。', next:'op_c5' },
op_c5: { char:'旁白', loc:'桥下工棚', slot:'清晨',
  text:'工钱按方算，一方石八十文。你算了算：若按期交工，能得六贯；误一日，赔四十文。\n——八日之后是上元。上元那夜灯火，全城的灯架都要人搭。',
  choices:[
    { text:'先赶工期', effects:{身手:1}, setFlags:['prologue_done'], next:null },
    { text:'打听上元灯架的活', effects:{人脉:2, 名声:1}, setFlags:['prologue_done'], next:null }
  ] },

/* ---------------- 开场 · 将门遗孤 ---------------- */
op_x1: { char:'旁白', loc:'陈州门外 · 官道', slot:'清晨',
  text:'抚恤银十二贯，装在贴身的布袋里。父亲的旧部在信上说：到汴京，去马军司寻一个姓郭的都头。\n信是三年前的。', next:'op_x2' },
op_x2: { char:'旁白', loc:'御街 · 廊下', slot:'清晨',
  text:'你按着信上的地址找了半日，只找到一间茶铺。掌柜说姓郭的三年前调去西边，没回来过。\n「兵的事，」他把茶推过来，「别问。」',
  choices:[
    { text:'谢过，另寻门路', effects:{人脉:1, 名声:1}, setFlags:['no_old_army'], next:'op_x3' },
    { text:'追问一句：西边出了什么事', effects:{才学:1, 人脉:2}, setFlags:['no_old_army','border_hint'], next:'op_x3' },
    { text:'把抚恤银分出二百文买酒打听', effects:{银钱:-200, 人脉:3}, setFlags:['no_old_army'], next:'op_x3' }
  ] },
op_x3: { char:'衙吏', expr:'平', loc:'御街', slot:'清晨',
  text:'廊下站住。腰上带刀的，一律要问一句：哪里人，去哪家。你这刀，是哪一营的制式？',
  choices:[
    { text:'照实说是父兄遗物', effects:{名声:2, 人脉:1}, setFlags:['yali_note'], next:'op_x4' },
    { text:'塞二十文，说句好话', effects:{银钱:-20, 人脉:2, 名声:-1}, setFlags:['yali_note'], next:'op_x4' },
    { text:'不答，转身就走', effects:{名声:-2, 恶:1}, setFlags:['yali_bad'], next:'op_x4' }
  ] },
op_x4: { char:'旁白', loc:'瓦舍 · 廊下', slot:'清晨',
  text:'瓦舍里说书的正讲到「杨家将破阵」。满棚喝彩。\n你在门口站了一会儿，觉得那些喝彩离自己很远——你爹不是杨家将，他死在一条没有名字的河边上。', next:'op_x5' },
op_x5: { char:'旁白', loc:'瓦舍 · 廊下', slot:'清晨',
  text:'镖局的招贴还贴在墙上：招护院二人，日给九十文，须有可靠保人。\n——八日之后是上元。灯节那夜，是全城镖行一年里最忙的一夜。',
  choices:[
    { text:'去镖局应个名', effects:{身手:1, 人脉:1}, setFlags:['prologue_done'], next:null },
    { text:'先摸清黑白两道的路子', effects:{人脉:2}, setFlags:['prologue_done'], next:null }
  ] },

/* ---------------- 脚店 ---------------- */
inn_1: { char:'陈三娘', expr:'平', loc:'脚店', slot:'',
  text:'官人回来了。灶上还有热的，灌浆馒头两个，十五文；若只要热的不要饱，十文。',
  choices:[
    { text:'要两个灌浆馒头', cond: s => s.money >= 15, effects:{银钱:-15, 体力:22}, next:'inn_1b', hint:'-15文 · 体力+22' },
    { text:'只要一碗热水', effects:{体力:6}, next:'inn_1a' },
    { text:'问房钱的事', next:'inn_1c' },
    { text:'（不吃了）', next:null }
  ] },
inn_1a: { char:'陈三娘', expr:'平', loc:'脚店', slot:'',
  text:'（她舀了一碗热水，又丢进两颗枣）热水不顶饱。\n夜里冷，这个暖手。', next:'inn_1b' },
inn_1b: { char:'陈三娘', expr:'喜', loc:'脚店', slot:'',
  text:'慢用。这几日城里人多，来住店的也不少。你若要长住，房钱可三日一结，省得每日摸钱袋。', next:null },
inn_1c: { char:'陈三娘', expr:'忧', loc:'脚店', slot:'',
  text:'一日二十文，这是死数，小可也让不得。若连着三夜付不出，我只好请你另寻去处——不是心狠，是这店也有房东。', next:null },

/* ---------------- 学官 ---------------- */
xg_1: { char:'学官 周教授', expr:'平', loc:'御街 · 国子监外', slot:'',
  text:'你袖口有墨，指上有茧，是抄书的。抄书不丢人，只是抄三年，名字还是排在榜尾。\n乡贡的名额，今年只给十个。',
  choices:[
    { text:'请教如何入乡贡', cond: s => s.attrs.才学 >= 25, effects:{才学:2, 人脉:1}, next:'xg_1a' },
    { text:'递上自己抄的策论', cond: s => s.attrs.才学 >= 30, effects:{才学:1, 名声:3, 人脉:1}, setFlags:['wenzhang_seen'], next:'xg_2' },
    { text:'（才学不足，暂且告辞）', next:null }
  ] },
xg_1a: { char:'学官 周教授', expr:'平', loc:'御街 · 国子监外', slot:'',
  text:'「乡贡看三样：举业、行卷，还有谁替你说话。」他把袖子一拢，\n「你既问得直，把近来写的东西拿来我看。」', next:'xg_2' },
xg_2: { char:'学官 周教授', expr:'喜', loc:'御街 · 国子监外', slot:'',
  text:'字是好字，议论却太直。你写「花石之扰」，是要考官替你担么？\n改三个字，把「扰」改成「费」。改完，我替你递。',
  choices:[
    { text:'照改', effects:{才学:3, 名声:2}, setFlags:['keju_named'], next:null },
    { text:'不改，宁可落榜', effects:{名声:5, 才学:1}, setFlags:['keju_named','keju_stubborn'], next:null }
  ] },

/* ---------------- 行老 ---------------- */
hl_1: { char:'行老 曹大郎', expr:'平', loc:'御街 · 行会', slot:'',
  text:'诸行有诸行的规矩。你想在哪一行里吃饭，就说清楚。小可只问一句：你手上有什么？',
  choices:[
    { text:'改行（旧业折半）', next:'hl_2' },
    { text:'打听行会的门路', effects:{人脉:2}, next:'hl_3' },
    { text:'（改日再说）', next:null }
  ] },
hl_2: { char:'行老 曹大郎', expr:'平', loc:'御街 · 行会', slot:'',
  text:'改行不是换件衣裳。你先前攒的本事，折一半；人情，也要折一半。想清楚了再开口。',
  choices:[
    { text:'改做科举', msg:'转行:keju', next:null },
    { text:'改做经商', msg:'转行:jingshang', next:null },
    { text:'改做技艺', msg:'转行:jiyi', next:null },
    { text:'改做游侠', msg:'转行:youxia', next:null },
    { text:'（暂不改）', next:null }
  ] },
hl_3: { char:'行老 曹大郎', expr:'喜', loc:'御街 · 行会', slot:'',
  text:'门路不是求来的，是换来的。你替行里办过事，行里才替你在官府说话。\n上元那夜的灯棚、货栈、镖路，都是机会。',
  choices:[
    { text:'记下了', next:null },
    { text:'问：行里能不能抬我的位子', next:'hl_5' },
    { text:'奉上五十文茶钱', cond: s => s.money >= 50 && (s.flags.hang_tea || 0) < 3,
      effects:{银钱:-50, 人脉:3}, msg:'count:hang_tea', next:'hl_3b' }
  ] },
hl_3b: { char:'行老 曹大郎', expr:'喜', loc:'御街 · 行会', slot:'',
  text:'（他把钱丢进抽屉，一眼没看，也没数）\n茶钱我收着。行簿上的位子，另算。\n——这话我只说两次。', next:null },

hl_4: { char:'行老 曹大郎', expr:'平', loc:'御街 · 行会', slot:'',
  text:'（他翻开行簿，把你的名字写上去，笔尖在姓上顿了顿）\n人脉到这份上，行里认你半个自己人了。往后有人问起，报我的名字。\n——丑话说在前头：抬位子要三样，一样不够，这页就不翻。',
  choices:[
    { text:'记下了', effects:{名声:2}, setFlags:['hang_named'], next:'hl_5' }
  ] },
hl_5: { char:'行老 曹大郎', expr:'平', loc:'御街 · 行会', slot:'',
  text:'头一样，行内历练——你替行里做过多少活，一格一格记着，就在你眼下那枚行牌上。\n第二样，人情。第三样，本钱。\n三样凑齐，我替你抬；少一样，茶钱送得再多，这页也不会翻。',
  choices:[
    { text:'改行（旧业折半）', next:'hl_2' },
    { text:'哪几处有行里的活', next:'hl_6' },
    { text:'记下了', next:null }
  ] },
hl_6: { char:'行老 曹大郎', expr:'平', loc:'御街 · 行会', slot:'',
  text:'御街东头是夜市的货栈，搬一夜算一夜；中间书铺抄书；州桥修摊棚；镖局守货栈。\n做哪一行的活，才攒哪一行的历练。你在别行挣的钱，行簿上不认。', next:null },
hl_talk: { char:'行老 曹大郎', expr:'平', loc:'御街 · 行会', slot:'',
  text:'（他正拨算盘，抬眼看你）\n行簿上的名字，不是茶钱写上去的。要改行就开口；要打听门路，我就再说一遍。',
  choices:[
    { text:'改行（旧业折半）', next:'hl_2' },
    { text:'打听行会的门路', next:'hl_3' },
    { text:'（不打扰了）', next:null }
  ] },

/* ---------------- 说书人 ---------------- */
shuo_1: { char:'说书人 苟四', expr:'喜', loc:'瓦舍', slot:'',
  text:'话本里什么都有——状元、拐子、私盐、宫里的旧事。\n只是话本也要吃饭。二十文一段，官人听哪段？',
  choices:[
    { text:'听市面上的行情', cond: s => s.money >= 20, effects:{银钱:-20}, msg:'rumor:washe', next:null },
    { text:'只听台上那段', effects:{才学:1}, next:null },
    { text:'（不听了）', next:null }
  ] },

/* ---------------- 义举：乞儿 / 脚夫 ---------------- */
qg_1: { char:'乞儿', expr:'忧', loc:'廊下', slot:'',
  text:'官人……小的三天没吃东西了。不敢讨钱，讨半块饼也成。',
  choices:[
    { text:'买两个馒头给他', cond: s => s.money >= 15, effects:{银钱:-15, 名声:2, 义:1}, setFlags:['yi_beggar'], next:'qg_2', hint:'-15文' },
    { text:'给两文钱', cond: s => s.money >= 2, effects:{银钱:-2, 名声:1}, next:'qg_2' },
    { text:'（走开）', effects:{名声:-1}, next:null }
  ] },
qg_2: { char:'乞儿', expr:'喜', loc:'廊下', slot:'',
  text:'谢谢官人！小的记住了——官人往东走，那家门首挂着黑漆灯笼的，别去。他们专挑生面孔讹。',
  choices:[{ text:'记下这话', effects:{人脉:1}, next:null }] },

jf_1: { char:'脚夫 牛七', expr:'忧', loc:'御街', slot:'',
  text:'一担货八十斤，从州桥挑到万胜门，一趟十二文。今日腿伤了，还差三趟。',
  choices:[
    { text:'替他把剩下的挑完', effects:{体力:-18, 名声:3, 义:1, 身手:1}, setFlags:['yi_kufu'], next:'jf_2' },
    { text:'请他喝一碗酒', cond: s => s.money >= 10, effects:{银钱:-10, 人脉:2, 义:1}, setFlags:['yi_kufu'], next:'jf_2', hint:'-10文' },
    { text:'给他十二文，请他歇着', cond: s => s.money >= 12, effects:{银钱:-12, 名声:2, 义:1}, setFlags:['yi_kufu'], next:'jf_2' },
    { text:'（各人有各人的命）', effects:{名声:-1}, next:null }
  ] },
jf_2: { char:'脚夫 牛七', expr:'喜', loc:'御街', slot:'',
  text:'官人是好人。往后要搬货、要问路、要找个不出卖人的脚夫，只管报牛七的名。',
  choices:[{ text:'好说', effects:{人脉:2}, next:null }] },

/* ---------------- 恶少 / 衙吏 ---------------- */
es_1: { char:'恶少 张衙内', expr:'怒', loc:'州桥', slot:'',
  text:'这摊子的地脚钱交了么？没交，明日就别摆了。\n——你是什么人？替她出头？',
  choices:[
    { text:'这钱不该她出', cond: s => s.attrs.名声 >= 12 || s.attrs.身手 >= 20, effects:{名声:2, 义:1}, setFlags:['es_confront'], next:'es_2' },
    { text:'（记下他的脸，不作声）', effects:{人脉:1}, setFlags:['es_note'], next:null },
    { text:'陪笑替他垫上', cond: s => s.money >= 100, effects:{银钱:-100, 名声:-2}, next:null }
  ] },
es_2: { char:'恶少 张衙内', expr:'怒', loc:'州桥', slot:'',
  text:'好，好胆。你等着。这汴京城里，讲理的地方在开封府，讲拳头的地方在巷子里。你挑一样。',
  choices:[
    { text:'挑理，去开封府', effects:{名声:3}, setFlags:['es_law'], next:null },
    { text:'不挑，看着他', effects:{身手:1, 名声:2}, setFlags:['es_stare'], next:null }
  ] },

yl_1: { char:'衙吏', expr:'平', loc:'街口', slot:'',
  text:'近来上头查得紧。你这摊子，若有「照应」，一切都好说。',
  choices:[
    { text:'给一百文买个安生', cond: s => s.money >= 100, effects:{银钱:-100, 名声:-1}, setFlags:['yali_paid'], next:null },
    { text:'问他上头查什么', effects:{人脉:1}, next:'yl_2' },
    { text:'不理他', effects:{名声:1}, next:null }
  ] },
yl_2: { char:'衙吏', expr:'忧', loc:'街口', slot:'',
  text:'查「关节」。今科的卷子，有人提前卖了题。你若认得读书人，劝他别沾——沾了，一辈子毁了。',
  choices:[{ text:'谢过', effects:{人脉:1}, setFlags:['jied_case_hint'], next:null }] },

/* ---------------- 商线：牙人 / 老鸨 / 豪客 / 族叔 ---------------- */
yr_1: { char:'牙人 胡九', expr:'喜', loc:'御街', slot:'',
  text:'少东家的茶，我出十贯一船。别嫌少——你这货在仓里放一日，就要多蚀十五文。',
  choices:[
    { text:'十贯就十贯，卖了', cond: s => s.flags.prologue_done, effects:{银钱:10000, 人脉:1}, setFlags:['tea_sold'], next:null },
    { text:'再压他两贯', cond: s => s.attrs.人脉 >= 20, effects:{银钱:12000, 人脉:2}, setFlags:['tea_sold'], next:null },
    { text:'不卖，等上元前后', effects:{名声:1}, setFlags:['tea_hold'], next:null }
  ] },
lb_1: { char:'干娘 李二妈', expr:'喜', loc:'瓦舍 · 莲花棚后', slot:'',
  text:'小卿是我一手捧起来的。你要赎她？三百贯，外加本司判状。\n——判状？哈，那得看你有没有那个脸面。',
  choices:[
    { text:'问判状怎么来', effects:{人脉:2}, next:'lb_2' },
    { text:'问她自己攒了多少', effects:{才学:1}, next:'lb_1a' },
    { text:'（记下三百贯这个数）', next:null }
  ] },
lb_1a: { char:'干娘 李二妈', expr:'平', loc:'瓦舍 · 莲花棚后', slot:'',
  text:'「攒？」干娘笑了一声，「唱十贯，到她手里一贯二。\n三百贯要唱多少场，你自己算。」\n（她把算盘珠子一拨，不再说话）', next:null },
lb_2: { char:'干娘 李二妈', expr:'平', loc:'瓦舍 · 莲花棚后', slot:'',
  text:'判状在本司，教坊使画押。有钱也未必行——要有人替她说话。\n她自己也攒了些，压在砖底下，当我不知道。',
  choices:[{ text:'谢过干娘', effects:{人脉:1}, setFlags:['panzhuang_hint'], next:null }] },
hk_1: { char:'豪客 王承议', expr:'喜', loc:'瓦舍', slot:'',
  text:'小卿这样的嗓子，放在棚里唱，可惜了。我已与干娘说过：三百贯，梳拢。\n——你劝她一句，我记你一份人情。',
  choices:[
    { text:'她的事，她自己说', effects:{名声:2, 敬重_liu:4}, setFlags:['hake_refused'], next:null },
    { text:'劝她应下，是条好路', effects:{人脉:3, 名声:-2, 敬重_liu:-8}, setFlags:['hake_pushed'], next:null },
    { text:'问他要不要个抄书的', effects:{人脉:2, 银钱:200}, next:null }
  ] },
zz_1: { char:'族叔 秦仲', expr:'怒', loc:'御街 · 九章堂外', slot:'',
  text:'妇人不当户，这是祖宗的规矩。账钥交出来，铺面由族里代管，每年分她一份红利，已是仁至义尽。',
  choices:[
    { text:'这话该由官府断', cond: s => s.attrs.名声 >= 25, effects:{名声:2, 敬重_qin:6}, setFlags:['zz_confront'], next:'zz_2' },
    { text:'劝她让一步，图个安生', effects:{人脉:2, 敬重_qin:-6}, setFlags:['zz_push'], next:null },
    { text:'（不介入宗族之事）', next:null }
  ] },
zz_2: { char:'族叔 秦仲', expr:'怒', loc:'御街 · 九章堂外', slot:'',
  text:'官府？你替她出头，图什么？一个寡妇的铺子，能给你什么好处？\n——年青人，站队要趁早。',
  choices:[
    { text:'我不要好处，我要道理', effects:{名声:3, 敬重_qin:5}, setFlags:['zz_stance'], next:null },
    { text:'我看中的是九章堂的招牌', effects:{人脉:2, 敬重_qin:-2}, setFlags:['zz_stance'], next:null }
  ] },

/* ---------------- 阿满 ---------------- */
sm_1: { char:'阿满', expr:'喜', loc:'州桥', slot:'',
  text:'先生！我姐姐说你是读书人。你能教我认个字么？就一个。\n（他把手心摊开，掌纹里嵌着炭灰）',
  choices:[
    { text:'教他写「人」字', effects:{才学:1, 情谊_su:5, 义:1}, next:'sm_2' },
    { text:'教他写自己的名字', cond: s => s.attrs.才学 >= 15, effects:{才学:1, 名声:1, 情谊_su:6}, next:'sm_2b' },
    { text:'说改日再教', effects:{情谊_su:-2}, next:null }
  ] },
sm_2: { char:'阿满', expr:'喜', loc:'州桥', slot:'',
  text:'「人」……原来人字是两笔撑着的。\n（他把这两个字抄在手背上，跑了）', next:null },
sm_2b: { char:'阿满', expr:'喜', loc:'州桥', slot:'',
  text:'「阿」……「满」……原来我的名字要写这么多笔。\n（他把手摊平，让你一笔一笔带着他写。写完了，掌心黑成一片）\n「我要写给姐姐看。」', next:null },
sm_talk: { char:'阿满', expr:'喜', loc:'州桥', slot:'',
  text:'（他把写满字的手背举到你眼前，一个字一个字地念，念错了自己先笑）',
  choices:[
    { text:'再教他认一个字', effects:{情谊_su:2, 才学:1}, next:null },
    { text:'考他前日写的那个字', effects:{情谊_su:1, 人脉:1}, next:null }
  ] },

/* ============================================================
   苏羹娘
   ============================================================ */
su_1: { char:'苏羹娘', expr:'喜', loc:'州桥夜市 · 茶摊', slot:'入夜', chat:'su_talk',
  text:'客官生面孔。坐吧，凳子不稳，靠里坐。\n（她把一碗旋煎茶推过来）热的，先喝着。钱的事，喝完再说。',
  choices:[
    { text:'摸出十文钱放在灶边', effects:{银钱:-10, 敬重_su:3, 情谊_su:2}, setFlags:['met_su'], next:'su_1m' },
    { text:'谢过，问夜市几时收摊', effects:{情谊_su:6, 人脉:2}, setFlags:['met_su'], next:'su_1b' },
    { text:'反问：你不怕我赖账', effects:{情谊_su:4, 倾慕_su:2}, setFlags:['met_su'], next:'su_1k' }
  ] },
su_1m: { char:'苏羹娘', expr:'平', loc:'州桥夜市 · 茶摊', slot:'入夜',
  text:'（她把铜钱推回来三枚，压在灶沿上）十文够了，多的不收。\n我这摊子从三更站到入夜，收你十文是茶钱，不是买我陪你说话的钱。', next:'su_1b' },
su_1k: { char:'苏羹娘', expr:'喜', loc:'州桥夜市 · 茶摊', slot:'入夜',
  text:'（她笑了一声，勺子沿锅边磕了两下）怕。\n可我怕的不是赖账——赖账的人下回还会来；摊子没人来，才算真完了。', next:'su_1b' },
su_1b: { char:'苏羹娘', expr:'平', loc:'州桥夜市 · 茶摊', slot:'入夜',
  text:'三更收，五更又开。冬月大风雪也照开——不开，明天的房钱从哪来？\n（她拿勺子敲了敲锅沿）这城里的人，一半在睡，一半在替睡的人烧火。',
  choices:[
    { text:'「你算哪一半？」', effects:{情谊_su:3, 倾慕_su:2}, next:'su_1c' },
    { text:'问她一个人撑得住么', effects:{情谊_su:4, 敬重_su:2}, next:'su_1c' },
    { text:'默不作声把茶喝完', effects:{情谊_su:2, 体力:8}, next:null }
  ] },
su_1c: { char:'苏羹娘', expr:'喜', loc:'州桥夜市 · 茶摊', slot:'入夜',
  text:'撑不住也得撑。我爹走的时候，阿满才六岁。\n——哎，说这些做什么。客官若是没处去，夜里有事就来摊上喊一声，我这条街熟。', next:null },

su_2: { char:'旁白', loc:'州桥夜市 · 茶摊', slot:'入夜',
  text:'三个短衣汉子把摊子围了。为首的拍着灶沿：地脚钱，五百文，今日到期。\n苏羹果然不慌，只是把手里的勺子握紧了。她身后，阿满把头埋到了桌下。',
  choices:[
    { text:'上前一步：这钱不该她出', effects:{名声:3, 义:1, 情谊_su:8, 敬重_su:4}, setFlags:['su_helped','su_extort_done'], next:'su_2b' },
    { text:'掏一百文替她垫上', cond: s => s.money >= 100, effects:{银钱:-100, 情谊_su:5, 敬重_su:-2}, setFlags:['su_paid','su_extort_done'], next:'su_2b' },
    { text:'垂下眼，当作没看见', effects:{情谊_su:-8, 敬重_su:-6, 名声:-1}, setFlags:['su_ignored','su_extort_done'], next:'su_2c' }
  ] },
su_2b: { char:'苏羹娘', expr:'忧', loc:'州桥夜市 · 茶摊', slot:'入夜',
  text:'（她把勺子放下，声音低了些）你不该出头。这些人背后是张衙内。\n可是……多谢。当真。',
  choices:[
    { text:'「明日我去开封府递状」', cond: s => s.attrs.名声 >= 18, effects:{名声:2, 敬重_su:5, 情谊_su:3}, setFlags:['su_law'], next:null },
    { text:'「他们再来，你就喊我」', effects:{情谊_su:5, 敬重_su:2}, next:null },
    { text:'「先收摊，我送你回去」', effects:{情谊_su:4, 体力:-6}, next:null }
  ] },
su_2c: { char:'苏羹娘', expr:'平', loc:'州桥夜市 · 茶摊', slot:'入夜',
  text:'（她把钱数出去，一张一张，数得很慢）\n客官茶钱还没给呢。十文。',
  choices:[
    { text:'放下十文', cond: s => s.money >= 10, effects:{银钱:-10, 情谊_su:2}, next:null },
    { text:'「方才……我该说话的」', effects:{情谊_su:3, 敬重_su:-2}, next:null },
    { text:'起身走了', effects:{情谊_su:-6, 敬重_su:-4}, next:null }
  ] },

su_3: { char:'苏羹娘', expr:'忧', loc:'州桥夜市 · 茶摊', slot:'入夜',
  text:'（她把账本推到你面前，指腹压着两行数）\n阿满的束脩五贯，月底交；对面铺面的转让钱八贯，也是月底。我一年到头，只攒下六贯三百。',
  choices:[
    { text:'替她把两笔账重算一遍', cond: s => s.attrs.才学 >= 18, effects:{才学:2, 敬重_su:7, 情谊_su:3}, setFlags:['su_account'], next:'su_3b' },
    { text:'借她两贯，先把束脩凑齐', cond: s => s.money >= 2000, effects:{银钱:-2000, 情谊_su:10, 敬重_su:2}, setFlags:['su_loan'], next:'su_3b' },
    { text:'「供弟弟，铺面以后再盘」', effects:{敬重_su:5, 情谊_su:2}, setFlags:['su_brother'], next:'su_3b' },
    { text:'「盘铺面，你才有自己的根」', effects:{情谊_su:4, 敬重_su:3}, setFlags:['su_shop'], next:'su_3b' }
  ] },
su_3b: { char:'苏羹娘', expr:'平', loc:'州桥夜市 · 茶摊', slot:'入夜',
  text:'我十六岁就在这摊上站着了。夜市的灯一盏盏灭，我在；一盏盏亮，我也在。\n有时候我想，我这辈子是不是就被这一条摊子拴死了。',
  choices:[
    { text:'「摊子拴不住人，人能拴住摊子」', effects:{情谊_su:6, 敬重_su:4}, next:'su_3c' },
    { text:'「你若想走，我帮你想办法」', effects:{倾慕_su:5, 情谊_su:4}, next:'su_3c' },
    { text:'沉默地替她收拾灶台', effects:{情谊_su:4, 体力:-4}, next:'su_3c' }
  ] },
su_3c: { char:'苏羹娘', expr:'喜', loc:'州桥夜市 · 茶摊', slot:'入夜',
  text:'（她笑起来的时候，眼角的细纹很明显）\n行啦，说得像个读书人。你的茶凉了，我再给你换一碗——这碗不算钱。', next:null },

su_4: { char:'苏羹娘', expr:'忧', loc:'州桥夜市 · 茶摊', slot:'深夜',
  text:'（雪下得很密，她掀开锅盖，白汽扑了满脸）\n你脸都白了。坐下。这碗羹是今日最后一勺，本来留给阿满的。',
  choices:[
    { text:'接过来，全喝了', effects:{体力:45, 情谊_su:9, 敬重_su:2}, setFlags:['su_snow'], next:'su_4b' },
    { text:'留一半给阿满', effects:{体力:25, 情谊_su:12, 敬重_su:6, 义:1}, setFlags:['su_snow'], next:'su_4b' },
    { text:'推回去：我不饿', effects:{体力:10, 情谊_su:4, 敬重_su:-2}, setFlags:['su_snow'], next:null }
  ] },
su_4b: { char:'苏羹娘', expr:'喜', loc:'州桥夜市 · 茶摊', slot:'深夜',
  text:'你这人真怪。\n（她把炉子往你那边挪了挪）暖和些没有？……这几日城里乱，你别在桥上站太久。', next:null },

su_5: { char:'苏羹娘', expr:'平', loc:'州桥夜市 · 茶摊', slot:'入夜',
  text:'（她抬头看了看天上）去年中秋，也是这么个月亮。\n我爹还在，摊子还是两张桌。那晚他喝多了，说等我嫁人，就把摊子当嫁妆。',
  choices:[
    { text:'陪她把一块月饼分完', effects:{情谊_su:7, 敬重_su:2}, setFlags:['su_mid'], next:'su_5b' },
    { text:'讲自己家里的一件旧事', effects:{情谊_su:5, 倾慕_su:3}, setFlags:['su_mid'], next:'su_5b' },
    { text:'「嫁妆你自己挣，不必等人给」', cond: s => s.attrs.才学 >= 25, effects:{敬重_su:8, 情谊_su:3}, setFlags:['su_mid'], next:'su_5b' }
  ] },
su_5b: { char:'苏羹娘', expr:'喜', loc:'州桥夜市 · 茶摊', slot:'入夜',
  text:'（她把月饼掰成很小的块，一块一块吃）\n你说话怪好听的。可惜好听的话不能当房钱。', next:null },

su_guard: { char:'苏羹娘', expr:'平', loc:'州桥夜市 · 茶摊', slot:'入夜',
  text:'（她把碗收得很快，不看你）\n客官这几日来得勤。可是……你除了嘴上热，手上有过什么实在的么？\n我不是要你养我。我是不想再听空话了。',
  choices:[
    { text:'认下这话，替她守一夜摊', effects:{体力:-15, 敬重_su:8, 情谊_su:4}, setFlags:['su_guard'], next:null },
    { text:'辩解说自己也不易', effects:{敬重_su:-4, 情谊_su:2}, next:null },
    { text:'不语，放下一百文就走', cond: s => s.money >= 100, effects:{银钱:-100, 敬重_su:2, 情谊_su:-2}, next:null }
  ] },

su_talk: { char:'苏羹娘', expr:'喜', loc:'州桥夜市 · 茶摊', slot:'',
  text:'又来啦？今日的羹淡了些，别嫌弃。\n（她往你碗底多添了一勺）',
  choices:[
    { text:'谢过，喝完就走', effects:{情谊_su:2, 体力:8}, next:null },
    { text:'替她招呼两个客人', effects:{情谊_su:3, 人脉:1, 体力:-6}, next:null },
    { text:'问街上最近有什么消息', effects:{人脉:1, 才学:1}, next:null }
  ] },

/* ============================================================
   柳婉卿
   ============================================================ */
liu_1: { char:'柳婉卿', expr:'平', loc:'瓦舍 · 莲花棚', slot:'入夜', chat:'liu_talk',
  text:'（一曲既毕，她拂袖下台，从你身侧过去，只停了一瞬）\n客官听得认真。台下那么多人，只有你没在看我的脸。',
  choices:[
    { text:'「我在听词」', effects:{才学:2, 倾慕_liu:3, 情谊_liu:3}, setFlags:['met_liu'], next:'liu_1a' },
    { text:'递上一把钱', cond: s => s.money >= 30, effects:{银钱:-30, 情谊_liu:2, 敬重_liu:-2}, setFlags:['met_liu'], next:'liu_1m' },
    { text:'「你的第三句走了音」', cond: s => s.attrs.才学 >= 22, effects:{才学:1, 敬重_liu:7, 倾慕_liu:2}, setFlags:['met_liu'], next:'liu_1q' }
  ] },
liu_1a: { char:'柳婉卿', expr:'平', loc:'瓦舍 · 莲花棚', slot:'入夜',
  text:'（她脚步一顿，半侧过身来）听词的人少。\n听得出词里那点不甘的人，更少。', next:'liu_1b' },
liu_1m: { char:'柳婉卿', expr:'平', loc:'瓦舍 · 莲花棚', slot:'入夜',
  text:'（她看你手里那串钱，没接）听曲的钱，干娘在前头收。\n你这份，我记着——记在棚里的账外。', next:'liu_1b' },
liu_1q: { char:'柳婉卿', expr:'喜', loc:'瓦舍 · 莲花棚', slot:'入夜',
  text:'（她眉梢一动，倒像松了口气）你听出来了。\n走音是因为台下那位穿紫的爷在数钱，一枚一枚，数得比我还响。', next:'liu_1b' },
liu_1b: { char:'柳婉卿', expr:'喜', loc:'瓦舍 · 莲花棚', slot:'入夜',
  text:'（她嘴角一牵，很快收住）\n这棚里的曲，一半唱给耳朵，一半唱给钱袋。\n唱完了，钱袋归干娘，耳朵归客人——剩下什么归我，不好说。',
  choices:[
    { text:'「哪一半是你的？」', effects:{倾慕_liu:4, 情谊_liu:3}, next:'liu_1c' },
    { text:'问她一日能分到多少', effects:{才学:1, 敬重_liu:3}, next:'liu_1c' },
    { text:'只点头，不多问', effects:{情谊_liu:2}, next:null }
  ] },
liu_1c: { char:'柳婉卿', expr:'平', loc:'瓦舍 · 莲花棚', slot:'入夜',
  text:'分到多少？唱十贯，到我手里一贯二。\n干娘说衣裳、头面、脂粉都是本钱。她说得也没错。\n（她把袖袋里的小算筹摸了摸，又收回去）', next:null },

liu_2: { char:'柳婉卿', expr:'忧', loc:'瓦舍 · 莲花棚后', slot:'入夜',
  text:'（她把账本翻开，指尖点着一行）这个月我唱了二十七场，账上只记了十九场。\n我不识数么？我识。可我不敢问。',
  choices:[
    { text:'替她对一遍账', cond: s => s.attrs.才学 >= 20, effects:{才学:2, 敬重_liu:8, 情谊_liu:5}, setFlags:['liu_account'], next:'liu_2b' },
    { text:'「我替你去问」', effects:{名声:1, 情谊_liu:5, 身手:1}, setFlags:['liu_account'], next:'liu_2b' },
    { text:'「问了又能如何」', effects:{情谊_liu:-4, 敬重_liu:-2}, next:null }
  ] },
liu_2b: { char:'柳婉卿', expr:'平', loc:'瓦舍 · 莲花棚后', slot:'入夜',
  text:'你猜我攒了多少？一百四十七贯。\n（她说完自己先笑了）三百贯才够脱籍。还差一半。\n有人出三百贯买我，我却要自己攒三百贯赎自己——你说这话讲不讲理。',
  choices:[
    { text:'「不讲理。所以我记下了」', effects:{敬重_liu:5, 情谊_liu:4, 倾慕_liu:2}, setFlags:['liu_money_known'], next:null },
    { text:'「我帮你凑」', cond: s => s.money >= 3000, effects:{银钱:-3000, 情谊_liu:9, 敬重_liu:3}, setFlags:['liu_money_known','liu_helped_money'], next:null },
    { text:'「三百贯，买的是自由，也买的是名声」', cond: s => s.attrs.才学 >= 30, effects:{才学:1, 敬重_liu:6}, setFlags:['liu_money_known'], next:null }
  ] },

liu_3: { char:'柳婉卿', expr:'忧', loc:'瓦舍 · 莲花棚', slot:'入夜',
  text:'王承议今日又来。三百贯，梳拢，明日就抬人走。\n干娘已经点过头了，只等我说一个「好」。\n——你说，我这样的人，配不配自己挑一回？',
  choices:[
    { text:'「配。这句话我替你记住」', effects:{敬重_liu:8, 情谊_liu:6, 倾慕_liu:4}, setFlags:['liu_ask_self','liu_ke_done'], next:'liu_3b' },
    { text:'「应下吧，是一条活路」', effects:{敬重_liu:-6, 情谊_liu:2}, setFlags:['liu_ke_done','hake_pushed'], next:'liu_3b' },
    { text:'「等我。上元之前给我信」', cond: s => s.attrs.名声 >= 20 || s.attrs.身手 >= 25, effects:{敬重_liu:5, 情谊_liu:7, 倾慕_liu:5}, setFlags:['liu_wait','liu_ke_done'], next:'liu_3b' }
  ] },
liu_3b: { char:'柳婉卿', expr:'平', loc:'瓦舍 · 莲花棚', slot:'入夜',
  text:'（她把袖子放下来，盖住了手腕上的旧疤）\n好。我等你一句实在话——不是好听话，是能拿去跟本司说话的实在话。', next:null },

liu_4: { char:'柳婉卿', expr:'惊', loc:'瓦舍 · 莲花棚后', slot:'深夜',
  text:'（她从墙砖后摸出一册薄薄的纸本，封皮是空的）\n别笑。我自己抄的词，抄了六年。\n若是被人看见，说「婊子也填词」，这册子就要被烧了。',
  choices:[
    { text:'替她誊一份干净的', cond: s => s.attrs.才学 >= 25, effects:{才学:1, 敬重_liu:7, 情谊_liu:6, 倾慕_liu:3}, setFlags:['liu_book'], next:'liu_4b' },
    { text:'「我谁都不说」', effects:{敬重_liu:5, 情谊_liu:5}, setFlags:['liu_book'], next:'liu_4b' },
    { text:'「该让说书人替你唱出去」', effects:{名声:2, 敬重_liu:-5, 情谊_liu:-2}, setFlags:['liu_book_risk'], next:'liu_4b' }
  ] },
liu_4b: { char:'柳婉卿', expr:'羞', loc:'瓦舍 · 莲花棚后', slot:'深夜',
  text:'（她把纸本按回砖缝里，动作很轻，像埋一件东西）\n这册子里有一句：「愿为西南风，长逝入君怀。」\n抄来的。可抄的时候，我想的是自己。', next:null },

liu_5: { char:'柳婉卿', expr:'平', loc:'瓦舍 · 莲花棚', slot:'入夜',
  text:'去年七夕，我在这台上唱《鹊桥仙》。台下有人哭，我以为是被我唱的。\n后来才知道，那天他娘死了。\n（她摇着团扇）这城里的悲欢，撞在一起，谁也不知道是谁的。',
  choices:[
    { text:'「今年的七夕，我陪你过」', effects:{倾慕_liu:6, 情谊_liu:6}, setFlags:['liu_mid'], next:'liu_5b' },
    { text:'跟她讲一件自己丢脸的旧事', effects:{情谊_liu:5, 敬重_liu:2}, setFlags:['liu_mid'], next:'liu_5b' },
    { text:'「你唱的那首，词是你自己的么」', cond: s => s.flags.liu_book, effects:{倾慕_liu:3, 敬重_liu:6}, setFlags:['liu_mid'], next:'liu_5b' }
  ] },
liu_5b: { char:'柳婉卿', expr:'喜', loc:'瓦舍 · 莲花棚', slot:'入夜',
  text:'（她用扇子遮了半张脸）\n客人，你的话，我记着。可别让我记太久。', next:null },

liu_guard: { char:'柳婉卿', expr:'平', loc:'瓦舍 · 莲花棚', slot:'入夜',
  text:'（她把赏钱推回来，一枚一枚码齐）\n客官待我太热了。热得让我怕。\n——你图我什么？你若说得出口，我反倒安心。',
  choices:[
    { text:'「图你这个人，不图你的曲」', effects:{倾慕_liu:3, 敬重_liu:-4, 情谊_liu:2}, next:null },
    { text:'「图你日后能自己挑」', effects:{敬重_liu:7, 情谊_liu:4}, next:null },
    { text:'「我什么也不图」', effects:{敬重_liu:-6, 情谊_liu:-2}, next:null }
  ] },

liu_talk: { char:'柳婉卿', expr:'平', loc:'瓦舍 · 莲花棚', slot:'',
  text:'（她正在调弦，头也不抬）\n今日唱《鹧鸪天》。客官若听得出第三句的错，我就当你是个知音。',
  choices:[
    { text:'安静听完一曲', effects:{情谊_liu:2, 才学:1}, next:null },
    { text:'替她挡下两位灌酒的客人', effects:{情谊_liu:4, 义:1, 体力:-8}, next:null },
    { text:'问干娘今日抽了多少', effects:{敬重_liu:2, 人脉:1}, next:null }
  ] },

/* ============================================================
   秦九娘
   ============================================================ */
qin_1: { char:'秦九娘', expr:'平', loc:'御街 · 九章堂', slot:'', chat:'qin_talk',
  text:'（她一手拨算盘，一手按住账本，头也不抬）\n买香药？还是来看笑话的？\n外头那位族叔已经站了半个时辰了，等他站累了，我还要回去算账。',
  choices:[
    { text:'「算账要紧，我先买二两沉水香」', cond: s => s.money >= 40, effects:{银钱:-40, 情谊_qin:4, 敬重_qin:2}, setFlags:['met_qin'], next:'qin_1a' },
    { text:'「来看你怎么把账算清」', effects:{才学:1, 敬重_qin:4, 情谊_qin:2}, setFlags:['met_qin'], next:'qin_1b' },
    { text:'「妇人不当户——这话你听着气不气」', effects:{敬重_qin:3, 倾慕_qin:2}, setFlags:['met_qin'], next:'qin_1q' }
  ] },
qin_1a: { char:'秦九娘', expr:'平', loc:'御街 · 九章堂', slot:'',
  text:'（她把沉水香包好推过来，手在纸包上按了按）\n四十文，不多收。\n——你不是来买香的。买香的人，不会等我讲完官司。', next:'qin_1b' },
qin_1q: { char:'秦九娘', expr:'平', loc:'御街 · 九章堂', slot:'',
  text:'气？气能当饭吃么。\n气完了，账还得有人算——我算得清，可我一个妇人，说清也没人听。', next:'qin_1b' },
qin_1b: { char:'秦九娘', expr:'平', loc:'御街 · 九章堂', slot:'',
  text:'（她把算盘拨到一边）\n账是算得清的，人算不清。他们要我交账钥，说是「代管」。\n我交的哪是账钥，是半辈子。这铺子我夫在时一间，如今三间——你说，这三间是谁挣的？',
  choices:[
    { text:'「是你挣的。这不用问人」', effects:{敬重_qin:6, 情谊_qin:4}, setFlags:['qin_stance'], next:'qin_1c' },
    { text:'「宗族的规矩，硬顶不划算」', effects:{敬重_qin:-5, 情谊_qin:2}, setFlags:['qin_flex'], next:'qin_1c' },
    { text:'问她官司几时开', effects:{人脉:1, 才学:1}, setFlags:['qin_case_known'], next:'qin_1c' }
  ] },
qin_1c: { char:'秦九娘', expr:'喜', loc:'御街 · 九章堂', slot:'',
  text:'（她嘴角一牵，极短）\n你倒是会说话。可上公堂不是说话的地方，是拿东西的地方。\n名声、人证、保人——少一样，就是输。', next:null },

qin_2: { char:'秦九娘', expr:'忧', loc:'御街 · 九章堂', slot:'入夜',
  text:'（她把三本账摊开，指尖在中间那页停住）\n这一页的墨色不对。账是我亲手记的，这一笔不是我写的。',
  choices:[
    { text:'对着墨色与笔锋一笔一笔查', cond: s => s.attrs.才学 >= 25, effects:{才学:2, 敬重_qin:9, 情谊_qin:4}, setFlags:['qin_ledger'], next:'qin_2b' },
    { text:'「这本账，我替你抄一份存着」', effects:{才学:1, 敬重_qin:5, 情谊_qin:5}, setFlags:['qin_ledger'], next:'qin_2b' },
    { text:'「墨色不对，未必能当凭」', effects:{敬重_qin:-2, 情谊_qin:1}, next:null }
  ] },
qin_2b: { char:'秦九娘', expr:'平', loc:'御街 · 九章堂', slot:'入夜',
  text:'（她把抄本对着灯看了看，折好，塞进袖子）\n本不想让外人碰这些。\n——你不是外人。这话我只说一遍。', next:null },

qin_3: { char:'衙吏', expr:'平', loc:'开封府外', slot:'入夜',
  text:'秦氏争产案，明日开堂。\n原告是宗族叔伯，告「妇人不当户，私擅鬻卖」。被告秦氏，无保人，无人证。\n——你是何人？',
  choices:[
    { text:'「我是人证」', cond: s => s.attrs.名声 >= 30, effects:{名声:4, 敬重_qin:10, 情谊_qin:6}, setFlags:['qin_won'], next:'qin_3b' },
    { text:'「我是人证」（名声不足）', cond: s => s.attrs.名声 < 30, next:'qin_3c' },
    { text:'劝九娘与宗族和解', effects:{人脉:2, 敬重_qin:-6, 情谊_qin:2}, setFlags:['qin_he','qin_lose'], next:'qin_3b' },
    { text:'沉默，陪她守到开庭', effects:{情谊_qin:8, 体力:-12}, setFlags:['qin_lose','qin_shou'], next:'qin_3b' }
  ] },
qin_3b: { char:'秦九娘', expr:'平', loc:'开封府外', slot:'入夜',
  text:'（她整了整袖口，指节发白）\n判下来是输是赢，我都不后悔。\n我只是想知道：这一夜，有没有人站在我这一边。', next:null },
qin_3c: { char:'衙吏', expr:'平', loc:'开封府外', slot:'入夜',
  text:'人证？你籍册上无名、行里无保。你这句话，上了堂也没人听。\n——回去罢。',
  choices:[
    { text:'退下，记下这份无力', effects:{敬重_qin:-2}, setFlags:['qin_lose'], next:'qin_3b' },
    { text:'回去求人作保', cond: s => s.attrs.人脉 >= 30, effects:{人脉:2, 敬重_qin:5}, setFlags:['qin_won'], next:'qin_3b' }
  ] },

qin_4: { char:'秦九娘', expr:'忧', loc:'御街 · 九章堂', slot:'',
  text:'（铺面已贴了封条，她坐在门槛上，把算盘一粒一粒抹干净）\n你还没走。\n这城里，赢了有人陪你喝酒，输了有人踏一脚——你没走，奇怪。',
  choices:[
    { text:'坐下来，陪她把算盘抹完', effects:{情谊_qin:10, 敬重_qin:8, 体力:-6}, setFlags:['qin_stay'], next:'qin_4b' },
    { text:'「我再去求一趟，翻案」', cond: s => s.attrs.名声 >= 25, effects:{名声:2, 敬重_qin:6}, setFlags:['qin_appeal'], next:'qin_4b' },
    { text:'「改日再来看你」', effects:{情谊_qin:-6, 敬重_qin:-4}, next:null }
  ] },
qin_4b: { char:'秦九娘', expr:'平', loc:'御街 · 九章堂', slot:'',
  text:'（她把算盘收进袖里）\n账我记着。谁来要，我都不给。\n你若是还愿意来，九章堂就还有一间。', next:null },

qin_5: { char:'秦九娘', expr:'平', loc:'大相国寺 · 药市', slot:'午后',
  text:'（她蹲在药摊前，捏起一片沉香对着光）\n去岁端午，我夫还在。他替我把艾插在门楣上，插得歪得很。\n今年端午，这药市里的价涨了三成，我却舍不得买一片回家。',
  choices:[
    { text:'替她挑一片好的，付钱', cond: s => s.money >= 80, effects:{银钱:-80, 情谊_qin:9, 敬重_qin:3}, setFlags:['qin_mid'], next:'qin_5b' },
    { text:'「艾不必买，我替你插」', effects:{情谊_qin:7, 倾慕_qin:3}, setFlags:['qin_mid'], next:'qin_5b' },
    { text:'跟她讲这药的归经与炮制', cond: s => s.attrs.才学 >= 30, effects:{才学:1, 敬重_qin:8}, setFlags:['qin_mid'], next:'qin_5b' }
  ] },
qin_5b: { char:'秦九娘', expr:'喜', loc:'大相国寺 · 药市', slot:'午后',
  text:'（她把香收进荷包，扣子扣得很紧）\n我夫生前说我这人太硬，硬得像药里的苦。\n——你倒是不怕苦。', next:null },

qin_guard: { char:'秦九娘', expr:'平', loc:'御街 · 九章堂', slot:'',
  text:'（她把账本合上，看着你）\n你来得勤。可有一样：你若只图我这里的香药便宜，就直说；\n若图别的，那就先把你自己的事办好。我不收留一个连自己都保不住的人。',
  choices:[
    { text:'「我先把自己站稳」', effects:{敬重_qin:7, 情谊_qin:3}, next:null },
    { text:'「我图什么，你迟早会知道」', effects:{倾慕_qin:4, 敬重_qin:-3}, next:null },
    { text:'把刚挣的钱拍在柜上', cond: s => s.money >= 300, effects:{银钱:-300, 敬重_qin:-2, 情谊_qin:3}, next:null }
  ] },

qin_talk: { char:'秦九娘', expr:'平', loc:'御街 · 九章堂', slot:'',
  text:'（她推过一盏茶，茶很酽）\n坐。别说话，我这一页还没算完。',
  choices:[
    { text:'安安静静坐着', effects:{情谊_qin:2, 体力:6}, next:null },
    { text:'替她把剩下的账对完', effects:{敬重_qin:3, 体力:-6}, next:null },
    { text:'问她宗族今日又来过了么', effects:{情谊_qin:3, 人脉:1}, next:null }
  ] },

/* ============================================================
   李氏闺秀（才学线彩蛋）
   ============================================================ */
li_1: { char:'李氏', expr:'喜', loc:'大相国寺 · 曲水', slot:'午后', chat:'li_talk',
  text:'（石渠边的矮桌上摆着一只白甾盏，茶末打得像雪）\n郎君在书铺抄书？我问过老板，他说你抄《周礼》从不改字。\n——那便请坐。我考你一句：什么是「和」。',
  choices:[
    { text:'「和者，不同而能共」', cond: s => s.attrs.才学 >= 25, effects:{才学:2, 敬重_li:4, 倾慕_li:3}, setFlags:['met_li'], next:'li_1b' },
    { text:'「和者，调也」', effects:{才学:1, 敬重_li:2}, setFlags:['met_li'], next:'li_1b' },
    { text:'如实说：我不知道', effects:{敬重_li:3, 名声:1}, setFlags:['met_li'], next:'li_1x' }
  ] },
li_1x: { char:'李氏', expr:'喜', loc:'大相国寺 · 曲水', slot:'午后',
  text:'（她怔了怔，随即笑出声）肯说不知道的人不多。\n我考这句，不是要听你背注疏。', next:'li_1b' },
li_1b: { char:'李氏', expr:'喜', loc:'大相国寺 · 曲水', slot:'午后',
  text:'（她把茶推到你面前，自己却不喝）\n我爹说，女子读书是「添妆」——妆得好看些，嫁得好些。\n可书里的东西，进了脑子，就不能只当妆了。',
  choices:[
    { text:'「那就当骨头」', effects:{倾慕_li:4, 敬重_li:4}, setFlags:['li_bone'], next:'li_1c' },
    { text:'「嫁人也不是唯一的去处」', effects:{倾慕_li:3, 情谊_li:3}, next:'li_1c' },
    { text:'问她读过什么书', effects:{才学:2, 敬重_li:3}, next:'li_1c' }
  ] },
li_1c: { char:'李氏', expr:'平', loc:'大相国寺 · 曲水', slot:'午后',
  text:'（她低头看盏底的茶痕）\n《金石录》没有，只有半卷《后汉书》。\n——郎君下次来，把你抄的书带来罢。我拿一盒旧墨换。', next:null },

li_2: { char:'李氏', expr:'喜', loc:'大相国寺 · 曲水', slot:'清晨',
  text:'（她怀里抱着一只小匣）\n听说你要应省试。这个送你。\n（匣里是一方旧砚，砚底刻了两个字，磨得只剩轮廓）',
  choices:[
    { text:'郑重接过，不问那两字', effects:{敬重_li:7, 倾慕_li:5, 才学:1}, setFlags:['li_met2','li_inkstone'], next:'li_2b' },
    { text:'问她砚底刻的是什么', effects:{倾慕_li:4, 敬重_li:2}, setFlags:['li_met2','li_inkstone'], next:'li_2b' },
    { text:'推辞：无功不受禄', effects:{敬重_li:9, 名声:2}, setFlags:['li_met2'], next:'li_2b' }
  ] },
li_2b: { char:'李氏', expr:'平', loc:'大相国寺 · 曲水', slot:'清晨',
  text:'（她把匣子硬塞进你手里）\n我父亲说了：李家女儿的东西，从不白给人。\n所以郎君若收了，就要记着——这是要还的。', next:null },

li_3: { char:'李氏', expr:'羞', loc:'大相国寺 · 曲水', slot:'午后',
  text:'（她把书扣在膝上，笑得很轻）\n赌书泼茶，说是雅事，其实是我输了。\n我背书常输，因为每背到「式微」那一章，我就想起家里的事。',
  choices:[
    { text:'「那就背给我听，我听着」', effects:{倾慕_li:8, 情谊_li:5, 才学:1}, setFlags:['li_close'], next:'li_3b' },
    { text:'替她把茶泼湿的书页一一展平', effects:{敬重_li:6, 情谊_li:6}, setFlags:['li_close'], next:'li_3b' },
    { text:'把书拿过来，背给她听', cond: s => s.attrs.才学 >= 50, effects:{才学:2, 倾慕_li:6, 敬重_li:5}, setFlags:['li_close'], next:'li_3b' }
  ] },
li_3b: { char:'李氏', expr:'羞', loc:'大相国寺 · 曲水', slot:'午后',
  text:'（她低声）\n「君家何处住，妾住在横塘。」\n……我只是背诗。郎君不要多想。', next:null },

li_4: { char:'李氏', expr:'忧', loc:'大相国寺 · 山门', slot:'入夜',
  text:'（她站在山门的灯下，手里拢着披帛）\n我父亲说，明年开春就要回南边。\n他说，李家择婿，只看姓氏。郎君……听过这句话么？',
  choices:[
    { text:'「听过。可我不认」', effects:{倾慕_li:6, 敬重_li:4}, setFlags:['li_gate'], next:'li_4b' },
    { text:'「那你自己的意思呢」', effects:{敬重_li:7, 情谊_li:5}, setFlags:['li_gate'], next:'li_4b' },
    { text:'沉默', effects:{情谊_li:-3, 敬重_li:-2}, next:'li_4b' }
  ] },
li_4b: { char:'李氏', expr:'忧', loc:'大相国寺 · 山门', slot:'入夜',
  text:'（她把手拢在袖里）\n我的意思，从来不是要紧的东西。\n——但今夜郎君问了一句，我记住了。', next:null },

li_0: { char:'李氏', expr:'平', loc:'大相国寺 · 曲水', slot:'午后',
  text:'（她抬眼看了看你手里的书，又低下头去点茶）\n郎君抄的是《孟子》罢？字是方的，笔锋却软。\n——坐罢。等你把这一卷抄完，我们再说别的。',
  choices:[
    { text:'坐下来，安静看她点茶', effects:{才学:2, 体悟:1}, next:null },
    { text:'回去继续抄书', effects:{才学:1}, next:null }
  ] },

li_talk: { char:'李氏', expr:'喜', loc:'大相国寺 · 曲水', slot:'',
  text:'（她用茶筅拨开浮沫）\n今日分茶，我点出了一只鹤。\n郎君若看得出，我请你喝一盏。',
  choices:[
    { text:'说看出了一只鹤', effects:{倾慕_li:2, 情谊_li:1}, next:null },
    { text:'老实说：只看出白了', effects:{敬重_li:3, 才学:1}, next:null },
    { text:'问她这手艺从谁学来', effects:{情谊_li:2, 才学:1}, next:null }
  ] },

/* ============================================================
   岁时追忆 · 冬至
   ============================================================ */
gen_5: { char:'旁白', loc:'御街 · 廊下', slot:'清晨',
  text:'去岁冬至，御街两边摆满了卖馉饳儿的担子，一碗热汤下去，耳朵都不疼了。\n今年冬至已过，街上还残着几盏没拆的灯。有人蹲在廊下，把旧帐子拆了缝成夹衣。',
  choices:[
    { text:'把身边的旧衣给廊下那人', effects:{体力:-4, 名声:3, 义:1}, setFlags:['dz_done'], next:'gen_5b' },
    { text:'买两碗馉饳儿，一碗自己吃', cond: s => s.money >= 20, effects:{银钱:-20, 体力:20}, setFlags:['dz_done'], next:'gen_5b' },
    { text:'站着看了一会儿，转身走', effects:{体悟:1}, setFlags:['dz_done'], next:null }
  ] },
gen_5b: { char:'旁白', loc:'御街 · 廊下', slot:'清晨',
  text:'汤是烫的，油花浮在面上。你忽然想起家里冬至那日，也是这个味道。\n——你把碗底的汤也喝了。', next:null },

/* ============================================================
   落魄
   ============================================================ */
luopo_1: { char:'陈三娘', expr:'忧', loc:'脚店', slot:'清晨',
  text:'（她把你的包袄放在门槛上，蹲下来替你系紧结）\n三夜了。不是我心狠，是房东不允。\n你去州桥那边避避风雪罢。',
  choices:[
    { text:'接过包袄，一句不提', effects:{名声:1}, setFlags:['evicted'], next:'luopo_2' },
    { text:'求她再宽限一夜', effects:{名声:-2, 情谊_su:0}, setFlags:['evicted'], next:'luopo_2' }
  ] },
luopo_2: { char:'旁白', loc:'州桥 · 石阶', slot:'深夜',
  text:'石阶凉得像铁。你把包袄垫在身下，听见桥下有人洗菜，水声很响。\n不知过了多久，有人在你面前蹲下来。', next:'luopo_3' },
luopo_3: { char:'苏羹娘', expr:'忧', loc:'州桥 · 石阶', slot:'深夜',
  text:'（她把一碗热羹塞进你手里，自己在旁边坐下）\n我早说过，这条街我熟。\n——吃吧。吃完记得，你不是没人管的人。',
  choices:[
    { text:'吃下去，重新来过', effects:{体力:60, 情谊_su:6}, next:null },
    { text:'「我欠你的，会还」', effects:{体力:40, 敬重_su:6, 名声:2}, next:null }
  ] },

/* ============================================================
   上元夜
   ============================================================ */
yx_intro: { char:'旁白', loc:'御街 · 灯楼', slot:'入夜',
  text:'正月十五，开封府放灯。从御街到州桥，灯棚绵延十余里，乐声嘈杂，一直传到城外。\n这一夜只有八个更次。你手里攥着的每一句话，都要在天亮前说出去。',
  choices:[
    { text:'先去州桥（苏）', msg:'goto:zhouqiao', next:null },
    { text:'先去瓦舍（柳）', msg:'goto:washe', next:null },
    { text:'先去九章堂（秦）', msg:'goto:yujie', next:null }
  ] },

su_6: { char:'苏羹娘', expr:'忧', loc:'州桥夜市 · 茶摊', slot:'入夜',
  text:'（她把一年的账本抱在怀里，摊子已经收了，只留一盏灯）\n行吏今日又来，说这最后一日的地脚钱要加倍。阿满的束脩明日就要交。\n你来了，也好——今夜我不打算再忍了。',
  choices:[
    { text:'站出来，替她挡下行吏', cond: s => s.attrs.名声 >= 25, effects:{名声:3, 敬重_su:8, 情谊_su:6}, setFlags:['su_yuan','su_key_done'], next:'su_6b' },
    { text:'陪她看灯，什么都不说', cond: s => s.hearts.su.情谊 >= 40, effects:{情谊_su:10, 倾慕_su:6}, setFlags:['su_deng','su_key_done'], next:'su_6b' },
    { text:'把铺契放在她账本上', cond: s => s.money >= 8000, effects:{银钱:-8000, 敬重_su:8, 情谊_su:4}, setFlags:['su_pu','su_key_done'], next:'su_6b' },
    { text:'站着，什么也做不了', effects:{情谊_su:-5, 敬重_su:-5}, setFlags:['su_none','su_key_done'], next:'su_6b' }
  ] },
su_6b: { char:'苏羹娘', expr:'喜', loc:'州桥夜市 · 茶摊', slot:'入夜',
  text:'（她抬头看灯，眼睛里有光在动）\n你走吧。灯要灭了，我还有账要算。\n——官人，明年的地脚钱，我大概能自己交了。', next:null },

liu_6: { char:'柳婉卿', expr:'平', loc:'瓦舍 · 莲花棚', slot:'入夜',
  text:'（台上正唱到一半，她看见你，把曲尾收了，拨开人群下来）\n王承议的马车在东门外等。本司的人今夜也在棚里喝酒。\n你有话，现在说。只说一句。',
  choices:[
    { text:'走判状的路子，今夜结清', cond: s => (s.flags.guanshen || (s.career.line === 'youxia' && s.career.stage >= 2)) && s.money >= 8000, effects:{银钱:-8000, 情谊_liu:12, 敬重_liu:10, 倾慕_liu:8, 名声:3}, setFlags:['liu_tuo','liu_key_done'], next:'liu_6b' },
    { text:'别应他，我陪你把这一夜唱完', cond: s => s.hearts.liu.情谊 >= 40, effects:{情谊_liu:8, 倾慕_liu:6, 敬重_liu:2}, setFlags:['liu_ju','liu_key_done'], next:'liu_6b' },
    { text:'什么也不说，听完这一曲', effects:{情谊_liu:-4, 敬重_liu:-2}, setFlags:['liu_qu','liu_key_done'], next:'liu_6b' }
  ] },
liu_6b: { char:'柳婉卿', expr:'羞', loc:'瓦舍 · 莲花棚', slot:'入夜',
  text:'（她把扇子合上，轻轻放在你手里）\n这一句，我记住了。\n——你走吧，台上还有人等我。', next:null },

qin_6: { char:'秦九娘', expr:'平', loc:'御街 · 九章堂', slot:'入夜',
  text:'（铺面封了，她却在门口摆了一张小案，就着灯笼对账，身后满街的灯）\n我找到了新的人证——那本墨色不对的账，能对上一个人。\n只是需要有人明日上堂，把他的名字说我一遍。',
  choices:[
    { text:'「明日我上堂」', cond: s => s.attrs.名声 >= 35, effects:{名声:4, 敬重_qin:12, 情谊_qin:6}, setFlags:['qin_zheng','qin_won','qin_key_done'], next:'qin_6b' },
    { text:'「要不……与宗族和解」', effects:{人脉:3, 敬重_qin:-8, 情谊_qin:3}, setFlags:['qin_he','qin_key_done'], next:'qin_6b' },
    { text:'陪她把这一夜的账对完', effects:{情谊_qin:10, 敬重_qin:4, 体力:-10}, setFlags:['qin_shou','qin_key_done'], next:'qin_6b' }
  ] },
qin_6b: { char:'秦九娘', expr:'喜', loc:'御街 · 九章堂', slot:'入夜',
  text:'（她把笔搭在砚上）\n去吧。灯楼那边快放烟花了。\n——我这人不会说好听的话。你记得明日来就行。', next:null },

yx_miss_su: { char:'旁白', loc:'州桥夜市 · 茶摊', slot:'入夜',
  text:'（你赶到时，摊子上只留一盏灭了的灯。灶是凉的，阿满蹲在阶上，怀里抱着一双新鞋）\n「姐姐跟行吏走了，说去说理。」\n你在桥上站了很久，烟火在很远的地方一声一声地炸。', next:null },
yx_miss_liu: { char:'旁白', loc:'瓦舍 · 莲花棚', slot:'入夜',
  text:'（台上换了人唱。莲花棚的幔帐新换成了红绸）\n干娘在收赏钱，笑得合不拢嘴。\n有人告诉你，小卿的马车已经出了东门。', next:null },
yx_miss_qin: { char:'旁白', loc:'御街 · 九章堂', slot:'入夜',
  text:'（封条被雨水洗得发白。铺子里的账本已经搬空了）\n你站着，看满街的灯一盏一盏从身边流过。', next:null },

yx_final: { char:'旁白', loc:'御街 · 灯楼', slot:'深夜',
  text:'（钟楼上的更鼓敲了三下。灯楼最高处，最后一批烟花升上去）\n该回去了。\n——这八日，你到底想要什么，今夜该有个答案了。',
  choices:[
    { text:'抬头，看完这一场烟火', msg:'ending', next:null }
  ] },

yx_end_note: { char:'旁白', loc:'御街 · 灯楼', slot:'深夜',
  text:'（灯灭了。街上开始有人拆灯棚，竹竿一根一根倒下来）\n你往回走。雪落在肩上，很轻。', next:null }

};

if (typeof module !== 'undefined' && module.exports) module.exports = D;
