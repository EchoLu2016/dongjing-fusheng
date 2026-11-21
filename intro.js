/* ============================================================
   东京梦华 · 市井浮生  |  INTRO · 序章「入京」
   独立模块：不依赖 engine.js / data.js，主游戏只调 Intro.play(onDone)。
   文案全部在 INTRO_DATA / INTRO_ORIGINS 内，可逐句改。
   ============================================================ */
(function (global) {
  'use strict';

  const CODEX_CHAR_KEY = 'djfh_char_codex_v1';
  const MUTE_KEY = 'djfh_intro_mute_v1';

  /* ------------------------------------------------------------
     素材表：16 张（8 景 + 4 女主 + 4 出身）
     原始 2K PNG 已压成 1600px / 1500px 长的 JPEG，放在 assets/
     ------------------------------------------------------------ */
  const INTRO_ASSETS = {
    'scene-yujie': { src: 'assets/scene-yujie.jpg', kind: 'scene', name: '御街 · 清晨' },
    'scene-siguo': { src: 'assets/scene-siguo.jpg', kind: 'scene', name: '大相国寺 · 晴日' },
    'scene-zhouqiao': { src: 'assets/scene-zhouqiao.jpg', kind: 'scene', name: '州桥夜市 · 夜' },
    'scene-washe': { src: 'assets/scene-washe.jpg', kind: 'scene', name: '瓦舍勾栏 · 午后' },
    'scene-yuanxiao': { src: 'assets/scene-yuanxiao.jpg', kind: 'scene', name: '上元灯节 · 主视觉' },
    'scene-kezhan': { src: 'assets/scene-kezhan.jpg', kind: 'scene', name: '客栈客房 · 深夜' },
    'scene-houtai': { src: 'assets/scene-houtai.jpg', kind: 'scene', name: '瓦舍后台' },
    'scene-jiuzhang': { src: 'assets/scene-jiuzhang.jpg', kind: 'scene', name: '九章堂 · 香药铺' },
    'fig-su': { src: 'assets/fig-su.jpg', kind: 'figure', name: '苏羹娘' },
    'fig-liu': { src: 'assets/fig-liu.jpg', kind: 'figure', name: '柳婉卿' },
    'fig-qin': { src: 'assets/fig-qin.jpg', kind: 'figure', name: '秦九娘' },
    'fig-gui': { src: 'assets/fig-gui.jpg', kind: 'figure', name: '李氏', strong: true },
    'hero-shizi': { src: 'assets/hero-shizi.jpg', kind: 'figure', name: '寒门士子' },
    'hero-shang': { src: 'assets/hero-shang.jpg', kind: 'figure', name: '南商之子' },
    'hero-jiang': { src: 'assets/hero-jiang.jpg', kind: 'figure', name: '匠户弟子' },
    'hero-xia': { src: 'assets/hero-xia.jpg', kind: 'figure', name: '将门遗孤' }
  };

  /* 图鉴条目：序章中逐张解锁，主游戏「图鉴」可回看。
     只写冰山一角，不剧透故事线。 */
  const INTRO_CODEX = [
    {
      id: 'su', name: '苏羹娘', tag: '州桥夜市 · 旋煎茶', img: 'fig-su',
      line: '一盏灯，一口锅，一本记满名字却从不催的赊账簿。',
      hint: '她说，茶要趁热，账可以慢慢算。'
    },
    {
      id: 'liu', name: '柳婉卿', tag: '瓦舍 · 莲花棚', img: 'fig-liu',
      line: '台上唱尽别人的悲欢，台下攒着自己的赎身钱。',
      hint: '妆匣最底下，压着一张没有写完的状纸。'
    },
    {
      id: 'qin', name: '秦九娘', tag: '御街 · 九章堂', img: 'fig-qin',
      line: '九章堂的账，算的从来不只是钱。',
      hint: '族里说她不该当户，她便把算盘拨得更响。'
    },
    {
      id: 'gui', name: '李氏', tag: '士族闺秀 · 寓京', img: 'fig-gui',
      line: '门第是她的护身，也是她的围墙。',
      hint: '她读遍经史，出门看灯却要先问过母亲。'
    }
  ];

  /* ------------------------------------------------------------
     Ken Burns：每张图一套「起幅 → 落幅」参数（与图一一对应）
     s 缩放 / x,y 位移（百分比）/ ox,oy 变焦中心 / dur 时长(ms)
     ------------------------------------------------------------ */
  const INTRO_SCENES = {
    'scene-yujie': { s0: 1.04, s1: 1.16, x0: 0, x1: -2.2, y0: 0, y1: -1.2, ox: 50, oy: 46, dur: 26000 },
    'scene-siguo': { s0: 1.14, s1: 1.04, x0: 1.6, x1: -1.4, y0: -0.8, y1: 0.6, ox: 50, oy: 48, dur: 18000 },
    'scene-zhouqiao': { s0: 1.08, s1: 1.20, x0: 1.2, x1: -2.4, y0: 0.4, y1: -1.0, ox: 56, oy: 50, dur: 22000 },
    'scene-washe': { s0: 1.14, s1: 1.03, x0: -1.4, x1: 1.4, y0: -0.8, y1: 0.8, ox: 46, oy: 50, dur: 18000 },
    'scene-kezhan': { s0: 1.12, s1: 1.02, x0: 0, x1: 2.0, y0: -1.0, y1: 0.6, ox: 50, oy: 46, dur: 22000 },
    'scene-houtai': { s0: 1.06, s1: 1.16, x0: -1.0, x1: 1.6, y0: 0, y1: -1.4, ox: 44, oy: 50, dur: 22000 },
    'scene-jiuzhang': { s0: 1.34, s1: 1.26, x0: 0, x1: -2.0, y0: 0, y1: 0.8, ox: 50, oy: 47, dur: 22000 },
    'scene-yuanxiao': { s0: 1.40, s1: 1.48, x0: 0, x1: -1.5, y0: 0, y1: -1.0, ox: 60, oy: 55, dur: 18000 }
  };

  const INTRO_FIGS = {
    'fig-su': { s0: 1.00, s1: 1.05, ox: 50, oy: 42, dur: 22000 },
    'fig-liu': { s0: 1.03, s1: 1.0, ox: 50, oy: 40, dur: 22000 },
    'fig-qin': { s0: 1.00, s1: 1.05, ox: 50, oy: 38, dur: 22000 },
    'fig-gui': { s0: 1.04, s1: 1.0, ox: 50, oy: 42, dur: 22000 },
    'hero-shizi': { s0: 1.02, s1: 1.07, ox: 50, oy: 38, dur: 16000 },
    'hero-shang': { s0: 1.02, s1: 1.07, ox: 50, oy: 38, dur: 16000 },
    'hero-jiang': { s0: 1.02, s1: 1.07, ox: 50, oy: 38, dur: 16000 },
    'hero-xia': { s0: 1.02, s1: 1.07, ox: 50, oy: 38, dur: 16000 }
  };

  /* ------------------------------------------------------------
     INTRO_DATA：顺序即时间轴
     type: 旁白 / 台词 / 图鉴 / 人物 / 选择
     字段: img, bg, kb, type, speaker, meta, text, dur, codex, layout
     ------------------------------------------------------------ */
  const INTRO_DATA = [
    /* ---------- 一 · 东京梦华（约 60 秒） ---------- */
    { seg: 1, type: '旁白', img: 'scene-yujie', dur: 6000, kb: 'scene-yujie',
      text: '政和年间，天下太平日久。汴京百万人家，八荒争凑，万国咸通。' },
    { seg: 1, type: '旁白', img: 'scene-yujie', dur: 6400,
      text: '御街自宣德门直抵南薰门，宽二百余步。天光未亮，御沟里的莲叶还挂着夜露。' },
    { seg: 1, type: '旁白', img: 'scene-yujie', dur: 6000,
      text: '更夫收了梆子，卖早点的铺子先支起灶火。这座城，是在炊烟里醒来的。' },
    { seg: 1, type: '旁白', img: 'scene-siguo', dur: 6000, kb: 'scene-siguo',
      text: '大相国寺每月五次开放，万姓交易。殿前廊下，百物皆集。' },
    { seg: 1, type: '旁白', img: 'scene-siguo', dur: 6200,
      text: '僧人撞钟，香客跪拜；卖药的、算命的、说书的，在佛前各做各的营生。' },
    { seg: 1, type: '旁白', img: 'scene-zhouqiao', dur: 6200, kb: 'scene-zhouqiao',
      text: '州桥夜市直至三更尽，才五更又复开张。若要闹处，通宵不绝。' },
    { seg: 1, type: '旁白', img: 'scene-zhouqiao', dur: 6400,
      text: '旋煎茶、灌浆馒头、浮沃石、荔枝膏——一盏灯下，就是一家人的生计。' },
    { seg: 1, type: '旁白', img: 'scene-washe', dur: 6600, kb: 'scene-washe',
      text: '大小勾栏五十余座，可容数千人。说三分、弄傀儡、踢瓶弄碗，昼夜不歇。' },
    { seg: 1, type: '旁白', img: 'scene-washe', dur: 5400,
      text: '台上唱的是别人的悲欢，台下坐的是自己的日子。' },
    { seg: 1, type: '旁白', img: 'scene-washe', dur: 7000,
      text: '只是这万丈繁华之下，撑起火炉的是一双双手，藏起眼泪的是一颗颗心。' },

    /* ---------- 二 · 众生入画（约 84 秒） ---------- */
    { seg: 2, type: '台词', speaker: '苏羹娘', meta: '州桥 · 茶摊', img: 'fig-su', bg: 'scene-zhouqiao', dur: 6600,
      text: '客官生面孔。先坐，凳子不稳，靠里坐。这碗旋煎茶，钱的事，喝完再说。' },
    { seg: 2, type: '旁白', img: 'fig-su', bg: 'scene-zhouqiao', dur: 6000,
      text: '苏羹娘，州桥茶摊的当垆人。父亲留下的债，和一口总也填不满的灶。' },
    { seg: 2, type: '旁白', img: 'fig-su', bg: 'scene-zhouqiao', dur: 6000,
      text: '她记得每个赊账的名字，却从不催。有人说她傻，她只低头搅羹。' },
    { seg: 2, type: '图鉴', codex: 'su', img: 'fig-su', bg: 'scene-zhouqiao', dur: 2400 },

    { seg: 2, type: '台词', speaker: '柳婉卿', meta: '瓦舍 · 莲花棚', img: 'fig-liu', bg: 'scene-houtai', dur: 5800,
      text: '台上唱的是别人的词。台下这一句，才是我的。' },
    { seg: 2, type: '旁白', img: 'fig-liu', bg: 'scene-houtai', dur: 5800,
      text: '柳婉卿，莲花棚的台柱子。一手好词，一副乐籍。' },
    { seg: 2, type: '旁白', img: 'fig-liu', bg: 'scene-houtai', dur: 6200,
      text: '她攒了七年的钱，锁在一只妆匣里。匣底压着一张没写完的状纸。' },
    { seg: 2, type: '图鉴', codex: 'liu', img: 'fig-liu', bg: 'scene-houtai', dur: 2400 },

    { seg: 2, type: '台词', speaker: '秦九娘', meta: '御街 · 九章堂', img: 'fig-qin', bg: 'scene-jiuzhang', dur: 5400,
      text: '九章堂的账，算的从来不只是钱。' },
    { seg: 2, type: '旁白', img: 'fig-qin', bg: 'scene-jiuzhang', dur: 5800,
      text: '秦九娘，九章堂的女掌柜。丈夫去后，族里说她不该当户。' },
    { seg: 2, type: '旁白', img: 'fig-qin', bg: 'scene-jiuzhang', dur: 6200,
      text: '她把算盘拨得极响，仿佛这样，就没人敢把账本从她手里拿走。' },
    { seg: 2, type: '图鉴', codex: 'qin', img: 'fig-qin', bg: 'scene-jiuzhang', dur: 2400 },

    { seg: 2, type: '台词', speaker: '李氏', meta: '相国寺 · 曲水', img: 'fig-gui', bg: 'scene-siguo', dur: 6000,
      text: '这院里的人都识得我。可我要的，是有人识得我写的字。' },
    { seg: 2, type: '旁白', img: 'fig-gui', bg: 'scene-siguo', dur: 5800,
      text: '李氏，寓京士族的闺秀。门第是她的护身，也是她的围墙。' },
    { seg: 2, type: '旁白', img: 'fig-gui', bg: 'scene-siguo', dur: 5800,
      text: '她读遍经史，却连出门看一场灯，都要先问过母亲。' },
    { seg: 2, type: '图鉴', codex: 'gui', img: 'fig-gui', bg: 'scene-siguo', dur: 2400 },

    { seg: 2, type: '旁白', img: 'scene-yuanxiao', dur: 5200, kb: 'scene-yuanxiao',
      text: '上元之夜，三线交汇。' },
    { seg: 2, type: '旁白', img: 'scene-yuanxiao', dur: 5000,
      text: '你的故事，就从这里开始。' },

    /* ---------- 三 · 你是谁（约 30 秒 + 选择） ---------- */
    { seg: 3, type: '旁白', img: 'scene-yuanxiao', dur: 5400, stage: 'blur',
      text: '八日之后便是上元。这座城会给你机会，也会收走代价。' },
    { seg: 3, type: '人物', speaker: '赵墨卿', meta: '寒门士子 · 二十岁', img: 'hero-shizi', bg: 'scene-yuanxiao',
      layout: 'center', dur: 5000, text: '文章憎命达，我就不信命。' },
    { seg: 3, type: '人物', speaker: '沈行舟', meta: '南商之子 · 十八岁', img: 'hero-shang', bg: 'scene-yuanxiao',
      layout: 'center', dur: 5000, text: '爹的病，我一人押货也要走完。' },
    { seg: 3, type: '人物', speaker: '鲁小山', meta: '匠户弟子 · 十九岁', img: 'hero-jiang', bg: 'scene-yuanxiao',
      layout: 'center', dur: 5000, text: '师父的手，就是我的前程。' },
    { seg: 3, type: '人物', speaker: '燕青锋', meta: '将门遗孤 · 二十一岁', img: 'hero-xia', bg: 'scene-yuanxiao',
      layout: 'center', dur: 5000, text: '燕家的刀，还没断。' },
    { seg: 3, type: '选择', dur: 0 }
  ];

  /* 第三段：四出身与专属开场白（选择后逐行说出） */
  const INTRO_ORIGINS = {
    shizi: {
      key: 'shizi', name: '寒门士子', who: '赵墨卿 · 二十岁', img: 'hero-shizi',
      quote: '文章憎命达，我就不信命。', tag: '一箱旧书，半囊残墨',
      lines: [
        '榜下看了三遍，才确信没有我的名字。',
        '盘缠只剩一箱旧书、半囊残墨。',
        '州桥南边有家脚店，房钱二十文一夜。先住下。'
      ]
    },
    shang: {
      key: 'shang', name: '南商之子', who: '沈行舟 · 十八岁', img: 'hero-shang',
      quote: '爹的病，我一人押货也要走完。', tag: '两船茶货，一纸病书',
      lines: [
        '两船茶货停在汴河，父亲在陈州病倒。',
        '他烧得说胡话，清醒时只剩一句：货不能等。',
        '脚店在州桥南。先把货押进城，再寻郎中。'
      ]
    },
    jiang: {
      key: 'jiang', name: '匠户弟子', who: '鲁小山 · 十九岁', img: 'hero-jiang',
      quote: '师父的手，就是我的前程。', tag: '一柄尺，一身好筋骨',
      lines: [
        '师父的右手被桥栏砸了，三个月不能使力。',
        '工期压顶，工钱还欠着，郎中已收了三十文。',
        '先回州桥的脚店歇一夜，天亮上工。'
      ]
    },
    xia: {
      key: 'xia', name: '将门遗孤', who: '燕青锋 · 二十一岁', img: 'hero-xia',
      quote: '燕家的刀，还没断。', tag: '十二贯抚恤，一封旧信',
      lines: [
        '抚恤银十二贯，缝在贴身的布袋里。',
        '父亲旧部的信是三年前写的，人未必还在。',
        '先进城。州桥南的脚店，一夜二十文。'
      ]
    }
  };

  global.INTRO_DATA = INTRO_DATA;
  global.INTRO_ORIGINS = INTRO_ORIGINS;
  global.INTRO_ASSETS = INTRO_ASSETS;

  /* node 侧静态校验用；浏览器里没有 module，不受影响 */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { INTRO_DATA, INTRO_ORIGINS, INTRO_ASSETS, INTRO_CODEX, INTRO_SCENES, INTRO_FIGS };
  }

  if (typeof document === 'undefined') return;

  /* ============================================================
     以下为播放器：DOM 与样式都在本模块内自建，不碰主游戏
     ============================================================ */
  const CSS = `
  .iv-root{position:fixed;inset:0;z-index:80;background:#07080b;color:#e9dfc9;
    font-family:"Songti SC","STSong","SimSun","Noto Serif CJK SC",serif;
    overflow:hidden;opacity:0;transition:opacity .5s ease;user-select:none;-webkit-user-select:none;
    -webkit-tap-highlight-color:transparent}
  .iv-root.on{opacity:1}
  .iv-root *{box-sizing:border-box}
  .iv-stage{position:absolute;inset:0;overflow:hidden;background:#07080b}
  .iv-scene{position:absolute;inset:0;opacity:0;transition:opacity 1s ease}
  .iv-scene.on{opacity:1}
  .iv-scene img{width:100%;height:100%;object-fit:cover;display:block;will-change:transform;
    transform-origin:var(--ox) var(--oy)}
  .iv-scene.running img{animation:ivkb var(--kd) linear forwards}
  @keyframes ivkb{
    from{transform:translate(var(--x0),var(--y0)) scale(var(--s0))}
    to{transform:translate(var(--x1),var(--y1)) scale(var(--s1))}
  }
  .iv-figure{position:absolute;right:0;bottom:0;height:84vh;z-index:2;
    opacity:0;transform:translateY(26px) scale(.99);
    transition:opacity .9s ease,transform 1.15s cubic-bezier(.2,.7,.2,1);
    -webkit-mask-image:
      linear-gradient(90deg,transparent 0,#000 15%,#000 88%,transparent 100%),
      linear-gradient(180deg,transparent 0,#000 10%,#000 97%,transparent 100%);
    mask-image:
      linear-gradient(90deg,transparent 0,#000 15%,#000 88%,transparent 100%),
      linear-gradient(180deg,transparent 0,#000 10%,#000 97%,transparent 100%);
    -webkit-mask-composite:source-in;
    mask-composite:intersect;
    -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
    -webkit-mask-size:100% 100%;mask-size:100% 100%;
    filter:drop-shadow(0 18px 44px rgba(0,0,0,.55))}
  .iv-figure.on{opacity:1;transform:translateY(0) scale(1)}
  /* 立绘身后的暗场：把原图底色降成夜景里的暗角，避免出现硬边方块 */
  .iv-glow{display:none;position:absolute;right:-4vw;bottom:-2vh;width:80vh;height:104vh;z-index:1;
    pointer-events:none;opacity:0;transition:opacity .9s ease;
    background:radial-gradient(38% 34% at 60% 44%,rgba(4,5,8,.9) 0%,rgba(4,5,8,.68) 46%,
      rgba(4,5,8,.34) 70%,rgba(4,5,8,.1) 86%,transparent 100%)}
  .iv-glow.on{opacity:1}
  .iv-glow.center{right:auto;left:50%;transform:translateX(-50%)}
  .iv-figure img{height:100%;width:auto;object-fit:contain;object-position:bottom center;display:block;
    will-change:transform;transform-origin:50% 40%;filter:brightness(.82) contrast(1.03) saturate(.9)}
  .iv-figure::after{content:'';position:absolute;inset:0;pointer-events:none;background:
    linear-gradient(90deg,rgba(7,8,11,.9) 0%,rgba(7,8,11,.42) 11%,transparent 26%,transparent 78%,rgba(7,8,11,.5) 90%,rgba(7,8,11,.9) 100%),
    linear-gradient(180deg,rgba(7,8,11,.8) 0%,rgba(7,8,11,.3) 7%,transparent 17%,transparent 84%,rgba(7,8,11,.6) 95%,rgba(7,8,11,.92) 100%)}
  /* 浅底立绘（如李氏）：加宽羽化、加深四周，让原图底色溶进夜景 */
  .iv-figure.strong{
    -webkit-mask-image:
      linear-gradient(90deg,transparent 0,#000 18%,#000 84%,transparent 100%),
      linear-gradient(180deg,transparent 0,#000 9%,#000 96%,transparent 100%);
    mask-image:
      linear-gradient(90deg,transparent 0,#000 18%,#000 84%,transparent 100%),
      linear-gradient(180deg,transparent 0,#000 9%,#000 96%,transparent 100%)}
  .iv-figure.strong img{filter:brightness(.8) contrast(1.05) saturate(.88)}
  .iv-figure.run img{animation:ivfig var(--fd) ease-out forwards}
  @keyframes ivfig{from{transform:scale(var(--fs0))}to{transform:scale(var(--fs1))}}
  .iv-figure.center{right:auto;left:50%;height:82vh;transform:translate(-50%,26px) scale(.99)}
  .iv-figure.center.on{transform:translate(-50%,0) scale(1)}
  .iv-veil{position:absolute;inset:0;z-index:3;pointer-events:none;
    background:
      radial-gradient(120% 90% at 50% 40%,transparent 40%,rgba(4,5,8,.55) 100%),
      linear-gradient(180deg,rgba(4,5,8,.55) 0%,transparent 18%,transparent 62%,rgba(4,5,8,.72) 100%)}
  .iv-grain{position:absolute;inset:0;z-index:4;pointer-events:none;opacity:.055;
    background-image:radial-gradient(#fff 1px,transparent 1px);background-size:4px 4px}
  .iv-stage.blur .iv-scene img{filter:blur(9px) brightness(.52) saturate(.9)}
  .iv-stage.plain{background:radial-gradient(120% 90% at 50% 34%,#241b16 0%,#0a0a0d 62%,#06070a 100%)}
  .iv-stage.plain .iv-scene{opacity:0!important}

  .iv-top{position:absolute;left:0;right:0;top:0;z-index:8;display:flex;justify-content:space-between;
    align-items:flex-start;gap:12px;padding:clamp(12px,2vh,22px) clamp(14px,2.6vw,34px);
    background:linear-gradient(180deg,rgba(4,5,8,.6) 0%,rgba(4,5,8,.26) 62%,rgba(4,5,8,0) 100%)}
  .iv-chapter{display:flex;align-items:center;gap:11px;pointer-events:none}
  /* 明亮场景（如白日御街）下章号会发灰，垫一层淡墨底保证可读 */
  .iv-chapter>div:last-child{padding:3px 12px 4px 10px;border-radius:2px;
    background:linear-gradient(90deg,rgba(8,8,10,.62),rgba(8,8,10,.16))}
  .iv-seal{width:38px;height:38px;flex:none;border:2px solid #b8574a;color:#d98b7d;border-radius:2px;
    display:flex;align-items:center;justify-content:center;font-size:17px;letter-spacing:0;
    transform:rotate(-3deg);background:rgba(140,40,32,.18)}
  .iv-chapter b{display:block;font-size:clamp(14px,1.7vh,17px);letter-spacing:5px;font-weight:600;color:#f1e7d3;
    text-shadow:0 1px 2px rgba(0,0,0,.95),0 2px 14px rgba(0,0,0,.9)}
  .iv-chapter span{display:block;font-size:clamp(10px,1.2vh,12px);letter-spacing:3px;color:rgba(233,223,201,.72);margin-top:3px;
    text-shadow:0 1px 2px rgba(0,0,0,.95),0 2px 10px rgba(0,0,0,.85)}
  .iv-tools{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
  .iv-tools button{font-family:inherit;cursor:pointer;font-size:clamp(11px,1.3vh,13px);letter-spacing:1.5px;
    color:#e9dfc9;background:rgba(18,16,18,.55);border:1px solid rgba(233,223,201,.26);
    border-radius:2px;padding:6px 10px;transition:.15s;backdrop-filter:blur(4px)}
  .iv-tools button:hover{background:rgba(40,32,26,.8);border-color:rgba(240,179,90,.5)}
  .iv-tools button.off{opacity:.55}
  .iv-tools button.warn{border-color:rgba(184,87,74,.55);color:#e6b6ab}
  .iv-progress{position:absolute;left:0;right:0;top:0;height:2px;z-index:9;background:rgba(255,255,255,.06)}
  .iv-progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#9c3a2e,#f0b35a);transition:width .5s ease}

  .iv-cap{position:absolute;left:0;right:0;bottom:0;z-index:7;display:flex;justify-content:center;
    padding:0 clamp(10px,2.4vw,34px) clamp(12px,2.2vh,26px);pointer-events:none;
    transition:opacity .35s ease,transform .35s ease}
  /* 选择屏与收束屏没有台词，整条对话框退场，避免留一条空白纸 */
  .iv-root.choosing .iv-cap{opacity:0;transform:translateY(16px)}
  .iv-card{width:min(1080px,96vw);padding:clamp(14px,2.1vh,22px) clamp(16px,2.4vw,30px) clamp(12px,1.8vh,18px);
    position:relative;border-radius:3px;border-left:5px solid #9c3a2e;
    background-color:rgba(241,233,216,.96);
    background-image:
      repeating-linear-gradient(0deg,rgba(120,100,70,.05) 0 1px,transparent 1px 4px),
      repeating-linear-gradient(90deg,rgba(120,100,70,.04) 0 1px,transparent 1px 7px),
      linear-gradient(180deg,rgba(246,239,224,.97),rgba(233,222,199,.97));
    box-shadow:0 14px 46px rgba(0,0,0,.58),inset 0 0 0 1px rgba(120,95,60,.3);
    backdrop-filter:blur(5px);pointer-events:auto}
  .iv-card::after{content:'序';position:absolute;right:13px;top:8px;font-size:11px;letter-spacing:2px;
    color:rgba(156,58,46,.5)}
  .iv-speaker{display:flex;align-items:baseline;gap:10px;margin-bottom:5px;min-height:1.2em}
  .iv-speaker b{font-size:clamp(13px,1.6vh,16px);letter-spacing:4px;color:#9c3a2e;font-weight:600}
  .iv-speaker em{font-style:normal;font-size:clamp(10px,1.15vh,12px);letter-spacing:2px;color:#8a7d68}
  .iv-text{font-size:clamp(16px,1.35vw + .7vh,22px);line-height:1.95;letter-spacing:.9px;
    min-height:2em;white-space:pre-wrap;color:#17130f;text-shadow:0 1px 0 rgba(255,255,255,.35)}
  .iv-text.nar{color:#6b6155}
  .iv-text.nar::first-letter{letter-spacing:0}
  .iv-cur{display:inline-block;width:.5em;height:1.05em;vertical-align:-2px;margin-left:2px;
    background:#9c3a2e;opacity:.7;animation:ivblink .9s steps(1) infinite}
  @keyframes ivblink{50%{opacity:0}}
  .iv-foot{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:6px;
    font-size:clamp(10px,1.15vh,12px);letter-spacing:2px;color:#8a7d68}
  .iv-foot .iv-go{color:#9c3a2e;opacity:.85}
  .iv-foot .iv-go.hide{visibility:hidden}

  .iv-codexToast{position:absolute;z-index:10;left:50%;top:clamp(64px,10vh,96px);transform:translate(-50%,-12px);
    display:flex;align-items:center;gap:12px;padding:10px 16px 10px 10px;border-radius:3px;
    background:linear-gradient(180deg,rgba(244,236,219,.96),rgba(232,221,197,.94));
    border:1px solid rgba(156,58,46,.45);box-shadow:0 14px 40px rgba(0,0,0,.55);
    opacity:0;pointer-events:none;transition:opacity .35s,transform .45s}
  .iv-codexToast.on{opacity:1;transform:translate(-50%,0)}
  .iv-codexToast img{width:44px;height:58px;object-fit:cover;object-position:center 18%;border-radius:2px;
    border:1px solid rgba(90,70,40,.35)}
  .iv-codexToast .t{font-size:11px;letter-spacing:3px;color:#9c3a2e}
  .iv-codexToast .n{font-size:16px;letter-spacing:3px;color:#2b2723;margin-top:2px}

  .iv-choice{position:absolute;inset:0;z-index:11;display:none;place-items:center;
    background:radial-gradient(90% 70% at 50% 40%,rgba(6,7,10,.35),rgba(6,7,10,.82))}
  .iv-choice.on{display:grid}
  /* 收束屏：立绘整幅留在背后，文字落到下三分之一，加一道压暗渐变保可读 */
  .iv-choice.closing{background:linear-gradient(180deg,rgba(6,7,10,.34) 0%,rgba(6,7,10,.04) 30%,
    rgba(6,7,10,.6) 58%,rgba(6,7,10,.95) 100%)}
  .iv-choice.closing .iv-choiceBox{align-self:end;margin-bottom:7vh}
  .iv-choice.closing h4{text-shadow:0 2px 20px rgba(0,0,0,.92)}
  .iv-choice.closing p{color:rgba(233,223,201,.8);text-shadow:0 1px 12px rgba(0,0,0,.92)}
  .iv-choice.closing .iv-pick{background:linear-gradient(180deg,rgba(28,22,18,.9),rgba(10,9,10,.94));
    box-shadow:0 14px 40px rgba(0,0,0,.6)}
  .iv-choiceBox{width:min(1180px,94vw);margin-bottom:7vh;pointer-events:auto}
  .iv-choiceBox h4{margin:0 0 4px;text-align:center;font-size:clamp(17px,2.6vh,24px);letter-spacing:8px;
    color:#f1e7d3;font-weight:600}
  .iv-choiceBox p{margin:0 0 clamp(12px,2vh,22px);text-align:center;font-size:clamp(11px,1.4vh,13px);
    letter-spacing:3px;color:rgba(233,223,201,.62)}
  .iv-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(8px,1.2vw,16px)}
  .iv-pick{font-family:inherit;cursor:pointer;padding:0;border:1px solid rgba(233,223,201,.24);
    background:linear-gradient(180deg,rgba(26,22,20,.86),rgba(12,11,12,.9));color:#e9dfc9;
    border-radius:3px;overflow:hidden;transition:.18s;text-align:center}
  .iv-pick:hover,.iv-pick:focus-visible{transform:translateY(-3px);border-color:rgba(240,179,90,.7);
    box-shadow:0 12px 30px rgba(0,0,0,.55)}
  .iv-pick .ph{height:clamp(140px,30vh,300px);background:radial-gradient(80% 70% at 50% 40%,#2a2320,#0d0c0e)}
  .iv-pick img{width:100%;height:100%;object-fit:cover;object-position:50% 6%;display:block}
  .iv-pick b{display:block;font-size:clamp(13px,1.7vh,16px);letter-spacing:4px;color:#f1e7d3;
    font-weight:600;padding-top:8px}
  .iv-pick i{display:block;font-style:normal;font-size:clamp(10px,1.2vh,12px);letter-spacing:1.5px;
    color:rgba(233,223,201,.58);padding:3px 0 9px}
  .iv-pick span{display:block;font-size:clamp(11px,1.35vh,13px);line-height:1.6;color:#cfc0a6;
    padding:0 10px 12px;letter-spacing:.5px}

  .iv-loading{position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;align-items:center;
    justify-content:center;gap:18px;background:radial-gradient(120% 90% at 50% 30%,#221a17,#08090c 66%)}
  .iv-loading .lk{width:54px;height:54px;border:2px solid #b8574a;color:#d98b7d;display:flex;
    align-items:center;justify-content:center;font-size:20px;letter-spacing:1px;border-radius:2px;
    transform:rotate(-3deg);background:rgba(140,40,32,.14)}
  .iv-loading h3{margin:0;font-size:clamp(18px,3vh,26px);letter-spacing:10px;color:#f1e7d3;font-weight:600}
  .iv-loading .ld{font-size:clamp(11px,1.4vh,13px);letter-spacing:4px;color:rgba(233,223,201,.55)}
  .iv-loadbar{width:min(380px,70vw);height:3px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden}
  .iv-loadbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#9c3a2e,#f0b35a);
    transition:width .25s ease}
  .iv-loadnum{font-size:11px;letter-spacing:3px;color:rgba(233,223,201,.45)}

  .iv-modal{position:absolute;inset:0;z-index:30;display:none;place-items:center;background:rgba(4,5,8,.72)}
  .iv-modal.on{display:grid}
  .iv-modal .box{width:min(440px,88vw);padding:24px 26px 20px;border-radius:3px;
    background:linear-gradient(180deg,#f4ecdb,#e8ddc5);border-top:5px solid #6d271e;
    box-shadow:0 24px 60px rgba(0,0,0,.65);color:#2b2723}
  .iv-modal h4{margin:0 0 10px;font-size:17px;letter-spacing:4px;color:#9c3a2e}
  .iv-modal p{margin:0;font-size:13.5px;line-height:1.95;letter-spacing:.6px;color:#413a31}
  .iv-modal .acts{display:flex;gap:10px;justify-content:flex-end;margin-top:18px}
  .iv-modal button{font-family:inherit;cursor:pointer;padding:8px 16px;font-size:13px;letter-spacing:2px;
    border-radius:3px;border:1px solid #9c3a2e;background:transparent;color:#9c3a2e}
  .iv-modal button.pri{background:#9c3a2e;color:#f8f0de;border-color:#6d271e}
  .iv-modal button:hover{filter:brightness(1.06)}

  @media (max-width:820px),(max-aspect-ratio:4/5){
    .iv-figure{right:auto;left:50%;height:58vh;bottom:22vh;transform:translate(-50%,24px) scale(.99);
      -webkit-mask-image:
        linear-gradient(90deg,transparent 0,#000 20%,#000 80%,transparent 100%),
        linear-gradient(180deg,transparent 0,#000 8%,#000 90%,transparent 100%);
      mask-image:
        linear-gradient(90deg,transparent 0,#000 20%,#000 80%,transparent 100%),
        linear-gradient(180deg,transparent 0,#000 8%,#000 90%,transparent 100%)}
    .iv-figure.on{transform:translate(-50%,0) scale(1)}
    .iv-figure.center{height:60vh;bottom:22vh}
    .iv-figure.center.on{transform:translate(-50%,0) scale(1)}
    .iv-glow{display:block;right:auto;left:50%;transform:translateX(-50%);width:96vw;height:86vh;bottom:8vh;
      background:radial-gradient(42% 36% at 50% 42%,rgba(4,5,8,.9) 0%,rgba(4,5,8,.66) 46%,
        rgba(4,5,8,.32) 72%,transparent 100%)}
    .iv-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
    .iv-choiceBox{margin-bottom:3vh}
    .iv-pick .ph{height:clamp(110px,20vh,190px)}
    .iv-cap{padding-bottom:clamp(8px,1.6vh,18px)}
    .iv-text{line-height:1.85;letter-spacing:.6px}
    .iv-tools button{padding:5px 8px;letter-spacing:1px}
  }
  @media (max-height:520px){
    .iv-figure{height:64vh;bottom:18vh}
    .iv-figure.center{height:64vh}
    .iv-glow{display:none}
    .iv-text{font-size:14px;line-height:1.7;min-height:1.6em}
    .iv-card{padding:10px 14px 8px}
    .iv-speaker b{font-size:12px}
    .iv-chapter b{font-size:13px;letter-spacing:3px}
    .iv-chapter span{display:none}
    .iv-pick .ph{height:100px}
    .iv-grid{gap:8px}
  }
  @media (max-width:520px){
    /* 窄屏：章号与控件挤在一行，全部收紧并禁止折行 */
    .iv-top{padding:10px 10px 0;gap:6px;align-items:flex-start}
    .iv-seal{width:30px;height:30px;font-size:14px;border-width:1.5px}
    .iv-chapter{gap:7px;min-width:0}
    .iv-chapter b{font-size:12px;letter-spacing:3px;white-space:nowrap}
    .iv-chapter span{font-size:9px;letter-spacing:1px;white-space:nowrap;margin-top:1px}
    .iv-tools{gap:4px;flex-wrap:nowrap}
    .iv-tools button{font-size:10px;letter-spacing:1px;padding:4px 6px}
  }
  @media (prefers-reduced-motion:reduce){
    .iv-scene.running img,.iv-figure.run img{animation:none}
  }
  `;

  function injectCSS() {
    if (document.getElementById('ivStyle')) return;
    const s = document.createElement('style');
    s.id = 'ivStyle';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ---------------- 状态 ---------------- */
  let root = null, el = {}, S = null, ctxAudio = null;

  function charCodex() {
    try {
      const a = JSON.parse(localStorage.getItem(CODEX_CHAR_KEY) || '[]');
      return Array.isArray(a) ? a : [];
    } catch (e) { return []; }
  }
  function unlockCodex(id) {
    const arr = charCodex();
    if (arr.indexOf(id) < 0) arr.push(id);
    try { localStorage.setItem(CODEX_CHAR_KEY, JSON.stringify(arr)); } catch (e) { }
    return arr;
  }

  function mutedPref() {
    try { return localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { return false; }
  }
  function saveMute(v) {
    try { localStorage.setItem(MUTE_KEY, v ? '1' : '0'); } catch (e) { }
  }

  /* 极简「嗒」声：方波 + 极短包络 */
  function tick() {
    if (!S || S.muted) return;
    if (!ctxAudio || ctxAudio.state !== 'running') return;   // 未获得用户手势前不发声
    try {
      const t = ctxAudio.currentTime;
      const o = ctxAudio.createOscillator(), g = ctxAudio.createGain();
      o.type = 'square';
      o.frequency.value = 1450 + Math.random() * 520;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.022, t + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.028);
      o.connect(g); g.connect(ctxAudio.destination);
      o.start(t); o.stop(t + 0.04);
    } catch (e) { }
  }
  function unlockAudio() {
    if (!ctxAudio) {
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return;
      ctxAudio = new AC();
    }
    if (ctxAudio.state === 'suspended') ctxAudio.resume();
  }

  /* ---------------- DOM ---------------- */
  function buildDom() {
    injectCSS();
    root = document.createElement('div');
    root.id = 'ivRoot';
    root.className = 'iv-root';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', '序章 · 入京');
    root.innerHTML =
      '<div class="iv-stage" id="ivStage">' +
        '<div id="ivScenes"></div>' +
        '<div class="iv-glow" id="ivGlow"></div>' +
        '<div class="iv-figure" id="ivFigure"><img id="ivFigImg" alt=""></div>' +
        '<div class="iv-veil"></div><div class="iv-grain"></div>' +
      '</div>' +
      '<div class="iv-progress"><i id="ivProg"></i></div>' +
      '<div class="iv-top">' +
        '<div class="iv-chapter"><div class="iv-seal">序</div><div>' +
          '<b id="ivTitle">入京</b><span id="ivSeg">一 · 东京梦华</span></div></div>' +
        '<div class="iv-tools">' +
          '<button type="button" id="ivAuto">自动 · 开</button>' +
          '<button type="button" id="ivMute">声 · 开</button>' +
          '<button type="button" id="ivSkip" class="warn">跳过序章</button>' +
        '</div>' +
      '</div>' +
      '<div class="iv-cap" id="ivCap"><div class="iv-card">' +
        '<div class="iv-speaker"><b id="ivSpeaker"></b><em id="ivMeta"></em></div>' +
        '<div class="iv-text" id="ivText"></div>' +
        '<div class="iv-foot"><span>点击 / 空格 推进</span><span class="iv-go" id="ivGo">继续 ▸</span></div>' +
      '</div></div>' +
      '<div class="iv-codexToast" id="ivCodex"><img id="ivCodexImg" alt=""><div>' +
        '<div class="t">图鉴新增</div><div class="n" id="ivCodexName"></div></div></div>' +
      '<div class="iv-choice" id="ivChoice"><div class="iv-choiceBox" id="ivChoiceBox"></div></div>' +
      '<div class="iv-loading" id="ivLoading">' +
        '<div class="lk">入京</div><h3>序章 · 入京</h3>' +
        '<div class="ld">第一次进汴京，正在铺开画卷</div>' +
        '<div class="iv-loadbar"><i id="ivLoadBar"></i></div>' +
        '<div class="iv-loadnum" id="ivLoadNum">0 / 16</div>' +
      '</div>' +
      '<div class="iv-modal" id="ivModal"><div class="box">' +
        '<h4>跳过序章</h4>' +
        '<p>跳过之后，这一段将无法回顾；尚未登场的<strong>人物图鉴也不会留下</strong>。<br>' +
        '跳过会直接进入「你是谁」，选好出身便可入京。</p>' +
        '<div class="acts"><button type="button" id="ivStay">继续观看</button>' +
        '<button type="button" class="pri" id="ivGoSkip">跳过序章</button></div>' +
      '</div></div>';
    document.body.appendChild(root);

    ['stage', 'scenes', 'glow', 'figure', 'figImg', 'prog', 'seg', 'auto', 'mute', 'skip', 'cap',
      'speaker', 'meta', 'text', 'go', 'codex', 'codexImg', 'codexName', 'choice', 'choiceBox',
      'loading', 'loadBar', 'loadNum', 'modal', 'stay', 'goSkip'].forEach(k => {
      el[k] = root.querySelector('#iv' + k.charAt(0).toUpperCase() + k.slice(1));
    });

    root.addEventListener('click', onTap, true);
    el.auto.onclick = e => { e.stopPropagation(); setAuto(!S.auto); };
    el.mute.onclick = e => { e.stopPropagation(); setMute(!S.muted); };
    el.skip.onclick = e => { e.stopPropagation(); openSkip(); };
    el.stay.onclick = e => { e.stopPropagation(); closeSkip(); };
    el.goSkip.onclick = e => { e.stopPropagation(); doSkip(); };
    document.addEventListener('keydown', onKey);
    global.addEventListener('resize', () => { /* 布局全用 vh/vw，无需重排 */ });
  }

  function onKey(e) {
    if (!S || !S.playing) return;
    unlockAudio();
    const k = e.key;
    if (k === ' ' || k === 'Enter' || k === 'ArrowRight' || k === 'PageDown') {
      e.preventDefault(); e.stopPropagation();
      if (S.modal) return;
      advance();
    } else if (k === 'Escape') {
      e.preventDefault(); e.stopPropagation();
      if (S.modal) closeSkip(); else openSkip();
    } else if (k === 'm' || k === 'M') { setMute(!S.muted); }
    else if (k === 'a' || k === 'A') { setAuto(!S.auto); }
  }

  function onTap(e) {
    if (!S || !S.playing) return;
    if (e.target.closest('button')) return;
    if (e.target.closest('.iv-choice')) return;
    if (S.modal) return;
    if (S.selecting) return;
    advance();
  }

  /* ---------------- 预载 ---------------- */
  function preload(keys, onOne) {
    return Promise.all(keys.map(k => new Promise(res => {
      const im = new Image();
      im.onload = () => { onOne(); res(); };
      im.onerror = () => { onOne(); res(); };
      im.src = INTRO_ASSETS[k].src;
    })));
  }

  function usedAssets() {
    const set = {};
    INTRO_DATA.forEach(s => {
      if (s.img && INTRO_ASSETS[s.img]) set[s.img] = 1;
      if (s.bg && INTRO_ASSETS[s.bg]) set[s.bg] = 1;
    });
    Object.keys(INTRO_ORIGINS).forEach(k => { set[INTRO_ORIGINS[k].img] = 1; });
    return Object.keys(set);
  }

  /* ---------------- 场景层 ---------------- */
  function sceneLayer(key, animate) {
    const sc = INTRO_SCENES[key];
    const layer = document.createElement('div');
    layer.className = 'iv-scene';
    layer.dataset.key = key;
    const img = document.createElement('img');
    img.alt = INTRO_ASSETS[key].name;
    img.src = INTRO_ASSETS[key].src;
    layer.appendChild(img);
    if (sc) {
      layer.style.setProperty('--s0', sc.s0); layer.style.setProperty('--s1', sc.s1);
      layer.style.setProperty('--x0', sc.x0 + '%'); layer.style.setProperty('--y0', sc.y0 + '%');
      layer.style.setProperty('--x1', sc.x1 + '%'); layer.style.setProperty('--y1', sc.y1 + '%');
      layer.style.setProperty('--ox', sc.ox + '%'); layer.style.setProperty('--oy', sc.oy + '%');
      layer.style.setProperty('--kd', sc.dur + 'ms');
    }
    el.scenes.appendChild(layer);
    // 同帧加入 on 会跳过过渡，强制一次重排
    void layer.offsetWidth;
    layer.classList.add('on');
    if (animate && sc) layer.classList.add('running');
    return layer;
  }

  function setScene(key, animate) {
    if (S.sceneKey === key) return;
    const old = el.scenes.querySelectorAll('.iv-scene');
    S.sceneKey = key;
    if (!key) {
      old.forEach(n => { n.classList.remove('on'); setTimeout(() => n.remove(), 1100); });
      return;
    }
    const layer = sceneLayer(key, animate !== false);
    old.forEach((n, i) => {
      n.classList.remove('on');
      setTimeout(() => n.remove(), 1100 + i * 10);
    });
  }

  function setFigure(key, layout) {
    el.figure.classList.toggle('center', layout === 'center');
    el.glow.classList.toggle('center', layout === 'center');
    el.glow.classList.toggle('on', !!key);
    if (!key) {
      el.figure.classList.remove('on', 'run');
      S.figKey = null;
      return;
    }
    if (S.figKey === key && el.figure.classList.contains('on')) return;
    S.figKey = key;
    el.figure.classList.toggle('strong', !!INTRO_ASSETS[key].strong);
    el.figImg.src = INTRO_ASSETS[key].src;
    el.figImg.alt = INTRO_ASSETS[key].name;
    const kb = INTRO_FIGS[key];
    if (kb) {
      el.figure.style.setProperty('--fs0', kb.s0);
      el.figure.style.setProperty('--fs1', kb.s1);
      el.figure.style.setProperty('--fd', kb.dur + 'ms');
      el.figImg.style.transformOrigin = '50% ' + kb.oy + '%';
    }
    el.figure.classList.remove('on', 'run');
    // 换人时先把旧图收掉再起新人，避免残影
    setTimeout(() => {
      el.figure.classList.add('on');
      void el.figImg.offsetWidth;
      if (kb) el.figure.classList.add('run');
    }, 60);
  }

  /* ---------------- 文本 ---------------- */
  const PAUSE = { '，': 110, '。': 190, '；': 120, '：': 100, '、': 70, '！': 190, '？': 190, '—': 60, '…': 90 };

  function typeText(str, cls, done) {
    S.typing = true;
    S.fullText = str;
    el.text.className = 'iv-text' + (cls ? ' ' + cls : '');
    el.text.innerHTML = '';
    const chars = Array.from(str);
    let i = 0;
    S.typeTimer = 0;
    const step = () => {
      if (!S.playing) return;
      if (i >= chars.length) {
        S.typing = false;
        el.text.innerHTML = esc(str);
        el.go.classList.remove('hide');
        el.go.textContent = S.auto ? '继续 ▸' : '点击继续 ▸';
        if (done) done();
        return;
      }
      const ch = chars[i++];
      el.text.innerHTML = esc(chars.slice(0, i).join('')) + '<span class="iv-cur"></span>';
      if (ch.trim() && !PAUSE[ch] && i % 2 === 0) tick();
      const wait = 30 + (PAUSE[ch] || 0);
      S.typeTimer = setTimeout(step, S.fast ? 0 : wait);
    };
    step();
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function finishTyping() {
    if (!S.typing) return false;
    clearTimeout(S.typeTimer);
    S.typing = false;
    el.text.innerHTML = esc(S.fullText);
    el.go.classList.remove('hide');
    schedule();
    return true;
  }

  /* ---------------- 推进 ---------------- */
  function clearTimers() {
    clearTimeout(S.typeTimer); clearTimeout(S.holdTimer);
    S.typeTimer = S.holdTimer = 0;
  }

  function schedule() {
    clearTimeout(S.holdTimer);
    if (!S.auto || S.typing || S.selecting || S.modal) return;
    const shot = S.shots[S.i];
    if (!shot || shot.type === '选择') return;
    S.holdTimer = setTimeout(advance, Math.max(1200, shot.dur || 4000));
  }

  function advance() {
    if (!S || !S.playing || S.modal || S.selecting) return;
    if (S.typing) { finishTyping(); return; }
    clearTimers();
    if (S.i >= S.shots.length - 1) return;
    go(S.i + 1);
  }

  function chapterOf(seg) {
    return seg === 1 ? '一 · 东京梦华' : seg === 2 ? '二 · 众生入画' : '三 · 你是谁';
  }

  function go(i) {
    clearTimers();
    S.i = i;
    const shot = S.shots[i];
    if (!shot) return;
    el.prog.style.width = Math.round((i / Math.max(1, S.shots.length - 1)) * 100) + '%';
    el.seg.textContent = chapterOf(shot.seg || 1);

    // 场景
    const bg = shot.bg || (INTRO_ASSETS[shot.img] && INTRO_ASSETS[shot.img].kind === 'scene' ? shot.img : null);
    el.stage.classList.toggle('blur', shot.stage === 'blur');
    el.stage.classList.toggle('plain', shot.stage === 'plain');
    // 没有指定底图的镜头（选择屏 / 收束屏）沿用上一张场景，不要清成黑场
    if (bg && bg !== S.sceneKey) setScene(bg, true);

    // 立绘
    const isFig = !!(shot.img && INTRO_ASSETS[shot.img] && INTRO_ASSETS[shot.img].kind === 'figure');
    // 收束屏沿用玩家已选出身的大立绘定格，别让最后一屏空成纯黑
    const keepFig = shot.type === '再见' && S.origin ? INTRO_ORIGINS[S.origin].img : null;
    setFigure(isFig ? shot.img : keepFig, shot.layout || (keepFig ? 'center' : undefined));

    // 选择卡 / 收束
    if (shot.type === '选择') { openChoice(); return; }
    if (shot.type === '再见') { finalScreen(); return; }
    el.choice.classList.remove('on');
    el.choice.classList.remove('closing');
    root.classList.remove('choosing');

    // 图鉴卡：解锁 + 自动过
    if (shot.type === '图鉴') {
      const c = INTRO_CODEX.find(x => x.id === shot.codex);
      if (c) {
        unlockCodex(c.id);
        el.codexImg.src = INTRO_ASSETS[c.img].src;
        el.codexName.textContent = c.name;
        el.codex.classList.add('on');
        S.codexOn = true;
        setTimeout(() => { el.codex.classList.remove('on'); S.codexOn = false; }, 1700);
      }
    }

    // 文案
    if (shot.type === '图鉴') {
      el.speaker.innerHTML = '';
      el.meta.textContent = '';
      typeText('图鉴新增：' + (INTRO_CODEX.find(x => x.id === shot.codex) || {}).name, 'nar', schedule);
      el.go.classList.add('hide');
    } else {
      const isSay = shot.type === '台词' || shot.type === '人物';
      el.speaker.innerHTML = shot.speaker ? '<b>' + esc(shot.speaker) + '</b>' : '';
      el.meta.textContent = shot.meta || '';
      if (shot.type === '人物') {
        el.speaker.innerHTML = '<b>' + esc(shot.speaker) + '</b>';
      }
      typeText(shot.text || '', isSay ? 'say' : 'nar', schedule);
      el.go.classList.add('hide');
    }
    if (!S.auto) el.go.classList.remove('hide');
  }

  /* ---------------- 第三段：选择 ---------------- */
  function openChoice() {
    S.selecting = true;
    clearTimers();
    setFigure(null);
    root.classList.add('choosing');
    el.stage.classList.add('blur');
    el.speaker.innerHTML = ''; el.meta.textContent = ''; el.text.innerHTML = '';
    el.go.classList.add('hide');
    el.choiceBox.innerHTML =
      '<h4>你是谁</h4><p>四种出身，四条路。选定之后，不能反悔。</p>' +
      '<div class="iv-grid">' + Object.keys(INTRO_ORIGINS).map(k => {
        const o = INTRO_ORIGINS[k];
        return '<button type="button" class="iv-pick" data-o="' + k + '">' +
          '<div class="ph"><img src="' + INTRO_ASSETS[o.img].src + '" alt="' + o.name + '"></div>' +
          '<b>' + o.name + '</b><i>' + o.who + '</i>' +
          '<span>' + o.quote + '</span></button>';
      }).join('') + '</div>';
    el.choice.classList.add('on');
    Array.from(el.choiceBox.querySelectorAll('.iv-pick')).forEach(b => {
      b.onclick = e => { e.stopPropagation(); choose(b.dataset.o); };
    });
  }

  function choose(key) {
    if (!S.selecting) return;
    const o = INTRO_ORIGINS[key];
    if (!o) return;
    S.selecting = false;
    S.origin = key;
    el.choice.classList.remove('on');
    el.stage.classList.remove('blur');
    el.stage.classList.add('plain');
    // 放大定格
    setFigure(o.img, 'center');
    el.figure.style.transition = 'opacity .5s ease, transform .9s cubic-bezier(.2,.7,.2,1)';
    const base = S.shots.length;
    const shots = o.lines.map((t, n) => ({
      seg: 3, type: '台词', speaker: o.who.split(' · ')[0], meta: o.name + ' · 开场',
      img: o.img, stage: 'plain', layout: 'center', text: t, dur: 5200,
      _base: base + n
    }));
    shots.push({ seg: 3, type: '再见', stage: 'plain', dur: 0 });
    S.shots = S.shots.slice(0, base).concat(shots);
    go(base);
  }

  function finalScreen() {
    S.selecting = true;
    clearTimers();
    root.classList.add('choosing');
    el.go.classList.add('hide');
    el.speaker.innerHTML = '';
    el.meta.textContent = '';
    el.text.innerHTML = '';
    el.choiceBox.innerHTML =
      '<h4>' + INTRO_ORIGINS[S.origin].name + '</h4>' +
      '<p>' + INTRO_ORIGINS[S.origin].who + ' · 盘缠 ' +
      ({ shizi: '一贯五百文', shang: '三贯五百文', jiang: '一贯二百文', xia: '一贯' })[S.origin] + '</p>' +
      '<div style="display:flex;justify-content:center"><button type="button" class="iv-pick" id="ivEnter" ' +
      'style="max-width:320px"><b style="padding-top:14px">入 京</b>' +
      '<i style="padding-bottom:14px">序止于此，往后由你</i></button></div>';
    el.choice.classList.add('on');
    el.choice.classList.add('closing');
    el.choiceBox.querySelector('#ivEnter').onclick = e => { e.stopPropagation(); complete(); };
  }

  function complete() {
    if (S.done) return;
    S.done = true;
    S.playing = false;
    clearTimers();
    try { localStorage.setItem('djfh_intro_seen_v1', '1'); } catch (e) { }
    const cb = S.onDone, key = S.origin;
    root.classList.remove('on');
    setTimeout(() => {
      teardown();
      if (typeof cb === 'function') cb(key);
    }, 620);
  }

  /* ---------------- 跳过 ---------------- */
  function openSkip() {
    if (!S || !S.playing || S.done) return;
    if (S.typing) finishTyping();
    S.modal = true;
    clearTimers();
    el.modal.classList.add('on');
  }
  function closeSkip() {
    if (!S) return;
    S.modal = false;
    el.modal.classList.remove('on');
    schedule();
  }
  function doSkip() {
    S.modal = false;
    S.typing = false;
    el.modal.classList.remove('on');
    if (!S.skipped) {
      S.skipped = true;
      S.shots = S.shots.slice(0, S.i + 1).concat([{ seg: 3, type: '选择', dur: 0, stage: 'blur' }]);
    }
    el.codex.classList.remove('on');
    go(S.shots.length - 1);
  }

  /* ---------------- 控制 ---------------- */
  function setAuto(v) {
    if (!S) return;
    S.auto = !!v;
    el.auto.textContent = '自动 · ' + (S.auto ? '开' : '关');
    el.auto.classList.toggle('off', !S.auto);
    if (S.auto) { if (!S.typing) schedule(); }
    else clearTimeout(S.holdTimer);
  }
  function setMute(v) {
    if (!S) return;
    S.muted = !!v;
    saveMute(S.muted);
    el.mute.textContent = '声 · ' + (S.muted ? '关' : '开');
    el.mute.classList.toggle('off', S.muted);
    if (!S.muted) { unlockAudio(); tick(); }
  }

  function teardown() {
    if (S && S.audioUnlock) document.removeEventListener('pointerdown', S.audioUnlock);
    S.playing = false;
    document.removeEventListener('keydown', onKey);
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null; el = {}; S = null;
  }

  /* ---------------- 入口 ---------------- */
  function play(opts) {
    opts = opts || {};
    if (S && S.playing) return;
    if (!root) buildDom();
    else document.body.appendChild(root);

    S = {
      shots: INTRO_DATA.slice(), i: -1, playing: true, auto: opts.auto !== false,
      muted: opts.muted === undefined ? mutedPref() : !!opts.muted,
      typing: false, fullText: '', typeTimer: 0, holdTimer: 0, modal: false, selecting: false,
      origin: null, done: false, skipped: false, sceneKey: undefined, figKey: null,
      onDone: opts.onDone || null, fast: !!opts.fast, codexOn: false
    };
    el.auto.textContent = '自动 · ' + (S.auto ? '开' : '关');
    el.auto.classList.toggle('off', !S.auto);
    el.mute.textContent = '声 · ' + (S.muted ? '关' : '开');
    el.mute.classList.toggle('off', S.muted);
    el.modal.classList.remove('on');
    el.choice.classList.remove('on');
    el.loading.style.display = '';
    el.scenes.innerHTML = '';
    el.figure.classList.remove('on', 'run');
    el.prog.style.width = '0';

    requestAnimationFrame(() => root.classList.add('on'));

    const keys = usedAssets();
    let n = 0;
    el.loadNum.textContent = '0 / ' + keys.length;
    el.loadBar.style.width = '0';
    preload(keys, () => {
      n++;
      el.loadNum.textContent = n + ' / ' + keys.length;
      el.loadBar.style.width = Math.round(n / keys.length * 100) + '%';
    }).then(() => {
      if (!S) return;
      setTimeout(() => {
        if (!S) return;
        el.loading.style.display = 'none';
        go(0);
        setTimeout(() => { if (S && !S.typing) schedule(); }, 80);
      }, 420);
    });

    // 首次点击/按键解锁音频（浏览器策略）
    const once = () => { unlockAudio(); document.removeEventListener('pointerdown', once); };
    document.addEventListener('pointerdown', once);
    S.audioUnlock = once;
  }

  const Intro = {
    play,
    stop: () => { if (S) complete(); },
    isPlaying: () => !!(S && S.playing),
    get state() {
      return S ? {
        i: S.i, playing: S.playing, auto: S.auto, muted: S.muted, typing: S.typing,
        selecting: S.selecting, origin: S.origin, skipped: S.skipped, shots: S.shots.length
      } : null;
    },
    data: INTRO_DATA,
    origins: INTRO_ORIGINS,
    assets: INTRO_ASSETS,
    scenes: INTRO_SCENES,
    figures: INTRO_FIGS,
    codex: INTRO_CODEX,
    charCodex,
    unlockCodex
  };

  global.Intro = Intro;
  if (global.__INTRO_TEST__) global.__INTRO__ = Intro;
})(typeof window !== 'undefined' ? window : globalThis);
