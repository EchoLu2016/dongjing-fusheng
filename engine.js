/* ============================================================
   东京梦华 · 市井浮生  |  ENGINE
   渲染在世界层（Canvas），文本与面板用 DOM（中文断行与排版更稳）。
   ============================================================ */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const SAVE_KEY = 'djfh_save_v1';
  const CODEX_KEY = 'djfh_codex_v1';
  const CHAR_CODEX_KEY = 'djfh_char_codex_v1';

  /* ---------------- 全局 ---------------- */
  let state = null;
  let mode = 'title';          // title | play | yx | ending
  let dlg = null;              // 当前节点
  let choices = [];            // 当前可见选项
  let typing = false, typeI = 0, curText = '';
  let paused = true;
  let cam = { x: 0, y: 0 };
  const keys = {};
  let lastTick = 0, frame = 0, acc = 0;
  let particles = [], floats = [];
  let groundCache = {}, decoCache = {};
  let animPref = true;   // 减少动画设定：新周目沿用
  let hudSig = '';
  let cv, ctx, W = 1, H = 1, DPR = 1;
  let titleBg = 0;

  /* ---------------- 状态 ---------------- */
  function newState(key) {
    const o = D.ORIGINS[key];
    return {
      origin: key,
      name: (o.who || '').split(' · ')[0],
      attrs: Object.assign({}, o.attrs),
      money: o.money, stamina: 100,
      day: 1, slot: 0, t: 0,
      loc: 'inn', x: D.LOCATIONS.inn.spawn.x, y: D.LOCATIONS.inn.spawn.y,
      dir: 1, walk: false, phase: 0,
      career: { line: o.career, stage: 0, exp: 0 },
      hearts: {
        su: { 情谊: 0, 敬重: 0, 倾慕: 0 }, liu: { 情谊: 0, 敬重: 0, 倾慕: 0 },
        qin: { 情谊: 0, 敬重: 0, 倾慕: 0 }, li: { 情谊: 0, 敬重: 0, 倾慕: 0 }
      },
      flags: {}, yi: 0, e: 0, seen: {}, fired: {}, chat: {}, missed: { su: false, liu: false, qin: false },
      owed: 0, lastWork: {}, rumorDone: {}, log: [], anim: animPref, face: 'down',
      yx: { done: { su: false, liu: false, qin: false }, t: D.META.yuanxiaoMs }
    };
  }

  /* ---------------- 时间 ---------------- */
  function nextSlot() {
    if (mode === 'yx') return;
    state.slot++;
    if (state.slot > 3) { nightSettle(); return; }
    toast(D.SLOTS[state.slot] + '了');
    addParticles('ambient');
    checkEvents();
    refreshHUD();
  }

  function nightSettle() {
    const fee = D.META.roomFee;
    let lines = [];
    if (state.money >= fee) {
      state.money -= fee; state.owed = 0;
      lines.push(['房钱', '-' + fee + '文']);
    } else {
      state.owed++;
      lines.push(['房钱', '欠 ' + fee + '文（第' + state.owed + '夜）']);
      if (state.owed >= 3 && !state.flags.evicted) {
        state.flags.evicted = true;
        state.day++; state.slot = 0; state.t = 0;
        autosave();
        openNode('luopo_1');
        return;
      }
    }
    state.stamina = clamp(state.stamina + 60, 0, 100);
    lines.push(['体力', '+60']);
    state.day++; state.slot = 0; state.t = 0;
    if (state.day > D.META.days) { finish(); return; }
    checkMissed();
    autosave();
    showCard(D.dateName(state.day) + ' · 清晨', lines.map(x => x[0] + '　' + x[1]), '起身');
    refreshHUD();
  }

  function checkMissed() {
    const d = state.day;
    if (d >= 6 && state.seen.su_1 && state.hearts.su.情谊 < 25 && !state.missed.su) {
      state.missed.su = true;
      showCard('她自己的生活', [
        '州桥的摊子换了模样：灶台新砌过，招牌旁多了一块「苏记」的小木牌。',
        '行吏来过三趟，最后一趟没要钱，只留下一句「往后自有照应」。',
        '阿满的书包里多了两本新册子，封皮是绸的。'
      ], '知道了');
    }
    if (d >= 7 && state.seen.liu_1 && state.hearts.liu.情谊 < 30 && !state.missed.liu) {
      state.missed.liu = true;
      showCard('她自己的生活', [
        '莲花棚换了新幔帐。干娘说，小卿的场子减了半数，另有贵客包着。',
        '你去的时候，她正在台上唱，唱完就下了后台，没有回头。'
      ], '知道了');
    }
    if (d >= 7 && state.seen.qin_1 && state.hearts.qin.敬重 < 30 && !state.missed.qin) {
      state.missed.qin = true;
      showCard('她自己的生活', [
        '九章堂的封条换成了族里的封条，字更端正。',
        '有人说秦氏娘子搬去了城南，替人代账，一月三百文。'
      ], '知道了');
    }
  }

  /* ---------------- 场景 ---------------- */
  function area() { return D.LOCATIONS[state.loc]; }

  function travel(to, silent) {
    if (!D.LOCATIONS[to]) return;
    const prev = state.loc;
    state.loc = to;
    const a = D.LOCATIONS[to];
    state.x = a.spawn.x; state.y = a.spawn.y;
    cam.x = -1; cam.y = -1;
    if (!silent) {
      toast(a.name + '　·　' + a.blurb);
      particles = [];
      addParticles('ambient');
    }
    if (mode === 'yx' && prev !== to) yxArrive(to);
    checkEvents();
    refreshHUD();
  }

  /* ---------------- 事件 ---------------- */
  function checkEvents() {
    if (!state || mode === 'yx') return;
    for (const ev of D.EVENTS) {
      if (state.fired[ev.id]) continue;
      if (!evDue(ev)) continue;
      if (ev.loc !== state.loc) continue;
      if (ev.cond && !ev.cond(state)) continue;
      state.fired[ev.id] = true;
      setTimeout(() => openNode(ev.node), 240);
      return;
    }
  }
  /* 事件窗口：到点之后两日内、人到了地方，都还能遇上。
     原先必须是「那一日、那一时段、那一处」三者同时具备，错过一次就永久丢失，
     玩家很容易把某条线的中段整个漏掉，之后只剩重复闲聊。 */
  function evDue(ev) {
    const d = state.day - ev.day;
    if (d < 0 || d > 2) return false;
    if (d === 0 && state.slot < ev.slot) return false;
    return true;
  }

  /* ---------------- 数值 ---------------- */
  function applyEffects(eff) {
    if (!eff) return;
    for (const k in eff) {
      const v = eff[k];
      if (!v) continue;
      if (k === '银钱') { state.money = Math.max(0, state.money + v); float((v > 0 ? '+' : '') + v + '文'); }
      else if (k === '体力') state.stamina = clamp(state.stamina + v, 0, 100);
      else if (k === '义') state.yi += v;
      else if (k === '恶') state.e += v;
      else if (k === '体悟') { /* 彩蛋计数，不影响判定 */ }
      else if (k in state.attrs) state.attrs[k] = clamp(state.attrs[k] + v, 0, 100);
      else {
        const m = /^(情谊|敬重|倾慕)_(su|liu|qin|li)$/.exec(k);
        if (m) {
          const h = state.hearts[m[2]];
          h[m[1]] = clamp(h[m[1]] + v, 0, 100);
        }
      }
    }
    refreshHUD();
  }

  function setFlags(list) {
    if (!list) return;
    (Array.isArray(list) ? list : [list]).forEach(f => { if (f) state.flags[f] = true; });
  }

  /* ---------------- 对话 ---------------- */
  /* 按顺序取第一个满足条件的链节点；idle 标记的是「只能闲聊」的兜底节点 */
  function chainPick(npcId) {
    const chain = D.CHAINS[npcId];
    if (!chain) return { node: D.NPCS[npcId].talk, idle: true };
    for (const c of chain) if (!c.cond || c.cond(state)) return { node: c.node, idle: !!c.idle };
    return { node: D.NPCS[npcId].talk, idle: true };
  }

  /* 下一段被门槛拦住时，告诉玩家差在哪，而不是让她把同一句话再说一遍 */
  function chainBlockedHint(npcId) {
    const chain = D.CHAINS[npcId];
    if (!chain) return '';
    for (const c of chain) {
      if (!c.hint || state.seen[c.node]) continue;
      if (!c.cond || c.cond(state)) continue;
      return c.hint(state);
    }
    return '';
  }

  function talk(npcId) {
    const n = D.NPCS[npcId];
    if (!n) return;
    if (mode === 'yx') {
      const key = { su: 'su_6', liu: 'liu_6', qin: 'qin_6' }[npcId];
      if (key && !state.yx.done[npcId]) {
        state.yx.done[npcId] = true;
        openNode(key);
        return;
      }
    }
    const pickNext = chainPick(npcId);
    const id = pickNext.node, idle = pickNext.idle;
    const hint = idle ? chainBlockedHint(npcId) : '';
    if (idle) {
      const key = state.day + '|' + state.slot;
      if (state.chat[npcId] === key) {
        // 同一时段只算一次：再聊只留一句闲话与方向，不再刷数值
        openNode(id, {
          text: (n.chatAgain || '（她正忙着，抬头朝你点了一下头）') + (hint ? '\n' + hint : ''),
          choices: [], next: null
        });
        return;
      }
      state.chat[npcId] = key;
    }
    if (hint) openNode(id, { text: D.DIALOGUES[id].text + '\n' + hint });
    else openNode(id);
  }

  function openNode(id, over) {
    const base = D.DIALOGUES[id];
    if (!base) { console.warn('[dialogue] missing node:', id); return; }
    const n = over ? Object.assign({}, base, over) : base;
    state.seen[id] = true;
    dlg = n;
    dlg.id = id;
    paused = true;
    $('dlg').classList.remove('hidden');
    $('card').classList.add('hidden');
    $('dName').textContent = n.char || '';
    $('dMeta').textContent = [n.loc, n.slot].filter(Boolean).join(' · ');
    curText = n.text || '';
    typeI = 0; typing = true;
    $('dText').textContent = '';
    choices = (n.choices || []).filter(c => !c.cond || c.cond(state));
    renderChoices();
    $('dNext').style.display = 'none';
    if (n.next && choices.length === 0) $('dNext').style.display = 'block';
    setPortrait(n.char);
  }

  /* 对话头像：有原画的角色用裁好的胸像，其余继续用程序化小人 */
  let curPortrait = '', faceImgs = {};

  function setPortrait(name) {
    let p = $('dPortrait');
    if (!p) {
      p = document.createElement('canvas');
      p.id = 'dPortrait'; p.width = 118; p.height = 138;
      p.style.cssText = 'float:left;margin:2px 14px 8px 0;border-radius:3px;' +
        'border:1px solid rgba(120,96,64,.5);' +
        'background:radial-gradient(circle at 50% 40%, rgba(255,244,222,.9), rgba(200,180,150,.35))';
      $('dbox').insertBefore(p, $('dhead'));
    }
    curPortrait = name;
    const pctx = p.getContext('2d');
    pctx.clearRect(0, 0, p.width, p.height);
    p.style.filter = 'none';

    const src = D.FACES && D.FACES[name];
    if (src) {
      p.style.filter = 'sepia(.14) saturate(.93) contrast(1.04)';
      let im = faceImgs[src];
      if (!im) { im = new Image(); im.src = src; faceImgs[src] = im; }
      const paint = () => { if (curPortrait === name) paintFace(pctx, p, im); };
      im.onload = paint;
      if (im.complete && im.naturalWidth) paint();
      return;
    }

    const npc = Object.values(D.NPCS).find(n => n.name === name);
    const o = state.origin && D.ORIGINS[state.origin];
    const color = npc ? npc.color : (o ? o.color : '#8a7c68');
    const hair = npc ? npc.hair : '#2a2520';
    drawChar(pctx, p.width / 2, p.height - 4, {
      color, hair, dir: 'down', phase: 0, scale: 1.7, idle: npc ? npc.idle : 'none', expr: '平'
    });
  }

  /* cover 裁切 + 底部淡入纸色，避免肩膀被一条硬线切断 */
  function paintFace(ctx, p, im) {
    ctx.clearRect(0, 0, p.width, p.height);
    const k = Math.max(p.width / im.width, p.height / im.height);
    const w = im.width * k, h = im.height * k;
    ctx.drawImage(im, (p.width - w) / 2, (p.height - h) / 2, w, h);
    const g = ctx.createLinearGradient(0, p.height - 28, 0, p.height);
    g.addColorStop(0, 'rgba(244,236,220,0)');
    g.addColorStop(1, 'rgba(244,236,220,.85)');
    ctx.fillStyle = g;
    ctx.fillRect(0, p.height - 28, p.width, 28);
  }

  function renderChoices() {
    const box = $('dChoices');
    box.innerHTML = '';
    if (!choices.length) return;
    choices.forEach((c, i) => {
      const b = document.createElement('button');
      b.innerHTML = c.text + (c.hint ? '<small>' + c.hint + '</small>' : '');
      b.onclick = () => pick(i);
      box.appendChild(b);
    });
  }

  function pick(i) {
    const c = choices[i];
    if (!c) return;
    applyEffects(c.effects);
    setFlags(c.setFlags);
    const msg = c.msg;
    if (msg) { handleMsg(msg, c); return; }
    if (c.next) openNode(c.next);
    else closeDlg();
  }

  function handleMsg(msg, c) {
    closeDlg();
    if (msg === 'ending') { setTimeout(finish, 120); return; }
    if (msg.indexOf('goto:') === 0) { travel(msg.slice(5)); return; }
    if (msg.indexOf('rumor:') === 0) { setTimeout(() => buyRumor(msg.slice(6)), 200); return; }
    if (msg.indexOf('转行:') === 0) { switchCareer(msg.slice(3)); return; }
    if (msg.indexOf('count:') === 0) {      // 数值型计数 flag：给行老的茶钱、重复次数这类
      const k = msg.slice(6);
      state.flags[k] = (typeof state.flags[k] === 'number' ? state.flags[k] : 0) + 1;
    }
    if (c && c.next) openNode(c.next);
  }

  function advanceDialog() {
    if (!dlg) return;
    if (typing) { typeI = curText.length; $('dText').textContent = curText; typing = false; return; }
    if (choices.length) return;
    if (dlg.next) { openNode(dlg.next); return; }
    closeDlg();
  }

  function closeDlg() {
    dlg = null; typing = false;
    $('dlg').classList.add('hidden');
    paused = false;
    checkEvents();
    refreshHUD();
  }

  /* ---------------- 职业 ---------------- */
  function doWork(spotId) {
    if (spotId === 'bed') { restNow(); return; }
    const w = D.WORKS[spotId];
    if (!w) return;
    const key = spotId + '|' + state.day + '|' + state.slot;
    if (state.lastWork[key]) { toast('这一时段已经做过这活了'); return; }
    if (state.stamina < w.stam) { toast('体力不济，先吃口热的'); return; }
    const pay = Math.round(w.pay(state));
    state.money += pay;
    state.stamina = clamp(state.stamina - w.stam, 0, 100);
    state.lastWork[key] = 1;
    if (w.gain) for (const k in w.gain) state.attrs[k] = clamp(state.attrs[k] + w.gain[k], 0, 100);
    const mine = !!w.line && w.line === state.career.line;
    if (mine && w.exp) state.career.exp += w.exp;
    float('+' + pay + '文', '#f0b35a');
    const lineName = w.line ? D.CAREERS[w.line].name : '';
    if (mine) toast(w.verb + '　' + lineName + '历练 +' + w.exp);
    else if (lineName) toast(w.verb + '　——这是' + lineName + '行的活，你在' + D.CAREERS[state.career.line].name +
      '行，不算历练（御街找行老可改行）');
    else toast(w.verb + '　（杂活，不计行内历练）');
    tryPromote();
    refreshHUD();
  }

  function tryPromote() {
    const line = state.career.line, c = D.CAREERS[line], st = state.career.stage;
    if (st >= 3) return;
    if (state.career.exp < c.need[st]) return;
    const gate = c.gate[st] || {};
    for (const k in gate) {
      if (k === '银钱') { if (state.money < gate[k]) { toast('银钱不够，行里不肯抬你的位子'); return; } }
      else if ((state.attrs[k] || 0) < gate[k]) { toast(c.name + '进阶：' + k + '尚差 ' + (gate[k] - (state.attrs[k] || 0))); return; }
    }
    if (gate.银钱) state.money -= gate.银钱;
    state.career.stage = st + 1;
    state.career.exp = 0;
    if (line === 'keju' && state.career.stage >= 3) state.flags.guanshen = true;
    const title = c.name + ' · 进阶';
    showCard(title, [
      '你现在是「' + c.stages[state.career.stage] + '」了。',
      line === 'keju' ? '学官把名帖递进了礼部。榜上有名，只差最后一道殿试。'
        : line === 'jingshang' ? '行老把你的名号写进了行簿，往后进货、放货都有个说法。'
          : line === 'jiyi' ? '都料匠看过你交的活，说了句「可」。这两个字比工钱值钱。'
            : '镖局把「燕」字旗挂上了门头。走镖的人开始叫你一声「师父」。'
    ], '受之');
    if (line === 'keju' && state.career.stage === 3) state.flags.guanshen = true;
    refreshHUD();
  }

  function switchCareer(line) {
    if (!D.CAREERS[line]) return;
    if (state.career.line === line) { toast('本就在这一行'); return; }
    const old = D.CAREERS[state.career.line];
    const oldStage = state.career.stage;
    state.career.stage = Math.floor(state.career.stage / 2);
    state.career.exp = Math.floor(state.career.exp / 2);
    state.career.line = line;
    showCard('改行', [
      '你改做了「' + D.CAREERS[line].name + '」。',
      '旧行当的进度折去一半：' + old.name + '　' + old.stages[oldStage] + ' → ' + old.stages[state.career.stage] + '。',
      '人情与本钱，都带不走全部。'
    ], '知道了');
    refreshHUD();
  }

  function restNow() {
    if (state.day >= D.META.days && state.slot < 2) { toast('今夜上元，这一觉睡不得'); return; }
    const fee = D.META.roomFee;
    if (state.money < fee) { toast('房钱不够，先在椅上靠一会儿'); state.stamina = clamp(state.stamina + 20, 0, 100); return; }
    state.money -= fee;
    state.stamina = clamp(state.stamina + 70, 0, 100);
    state.slot = 0; state.t = 0; state.day++;
    if (state.day > D.META.days) { finish(); return; }
    checkMissed();
    autosave();
    showCard(D.dateName(state.day) + ' · 清晨', ['房钱　-' + fee + '文', '体力　+70'], '起身');
    refreshHUD();
  }

  /* ---------------- 消息 ---------------- */
  function buyRumor(place) {
    const r = D.RUMORS.find(x => x.from === place && !state.rumorDone[x.id]);
    if (!r) { toast('今日没什么新消息了'); return; }
    state.rumorDone[r.id] = true;
    const lines = ['「' + r.text + '」'];
    if (r.truth) {
      applyEffects(r.gain);
      lines.push('你照着这条消息做了一手准备——事后看，是真的。');
    } else {
      applyEffects(r.loss);
      lines.push('你照着这条消息下了本钱。后来才知道，是有人借你的手清货。');
    }
    showCard('市井消息', lines, '知道了');
  }

  /* ---------------- 上元 ---------------- */
  function startYx() {
    mode = 'yx';
    state.yx.t = D.META.yuanxiaoMs;
    // 直接落位御街，不走 travel，避免一入场就触发九娘线
    state.loc = 'yujie';
    state.x = D.LOCATIONS.yujie.spawn.x; state.y = D.LOCATIONS.yujie.spawn.y;
    cam.x = -1; cam.y = -1;
    particles = [];
    paused = true;
    showCard('上元 · 正月十五', [
      '灯楼高三层，灯棚绵延十余里。从御街往南看，全是人的头顶和火的光。',
      '这一夜只有八个更次。州桥、瓦舍、九章堂，三处都有人在等你。',
      '你走不到的地方，就再也走不到了。'
    ], '去看灯', () => openNode('yx_intro'));
    addParticles('firework');
  }

  function yxArrive(areaKey) {
    const map = { zhouqiao: 'su', washe: 'liu', yujie: 'qin' };
    const who = map[areaKey];
    if (!who) return;
    if (state.yx.done[who]) return;
    if (dlg || paused) return;          // 忙时改由交谈触发，避免叠对话
    state.yx.done[who] = true;
    const node = { su: 'su_6', liu: 'liu_6', qin: 'qin_6' }[who];
    setTimeout(() => { if (mode === 'yx') openNode(node); }, 560);
  }

  function yxTimeout() {
    if (mode !== 'yx') return;
    const miss = [];
    if (!state.yx.done.su) { miss.push('州桥的灯灭了。'); state.missed.su = true; }
    if (!state.yx.done.liu) { miss.push('莲花棚的幔帐换成了红绸。'); state.missed.liu = true; }
    if (!state.yx.done.qin) { miss.push('九章堂的封条被雨洗干净了。'); state.missed.qin = true; }
    showCard('更漏已尽', miss.length ? miss : ['三处都去过了。'], '回灯楼', () => finish());
  }

  /* ---------------- 结局 ---------------- */
  function finish() {
    if (mode === 'ending') return;
    mode = 'ending';
    paused = true;
    closeDlgForce();
    const e = D.checkEnding(state);
    let codex = [];
    try { codex = JSON.parse(localStorage.getItem(CODEX_KEY) || '[]'); } catch (x) { codex = []; }
    if (!codex.includes(e.id)) codex.push(e.id);
    try { localStorage.setItem(CODEX_KEY, JSON.stringify(codex)); } catch (x) { }
    const h = state.hearts;
    const recall = [
      ['职业', D.CAREERS[state.career.line].name + ' · ' + D.CAREERS[state.career.line].stages[state.career.stage]],
      ['银钱', D.fmtMoney(state.money)],
      ['才学', state.attrs.才学 + ''], ['身手', state.attrs.身手 + ''],
      ['人脉', state.attrs.人脉 + ''], ['名声', state.attrs.名声 + ''],
      ['义举', state.yi + ' 次'],
      ['苏羹娘', '情' + h.su.情谊 + ' 敬' + h.su.敬重 + ' 慕' + h.su.倾慕],
      ['柳婉卿', '情' + h.liu.情谊 + ' 敬' + h.liu.敬重 + ' 慕' + h.liu.倾慕],
      ['秦九娘', '情' + h.qin.情谊 + ' 敬' + h.qin.敬重 + ' 慕' + h.qin.倾慕],
      ['李氏', '情' + h.li.情谊 + ' 敬' + h.li.敬重 + ' 慕' + h.li.倾慕],
      ['结局图鉴', codex.length + ' / ' + D.ENDINGS.length]
    ];
    const charGot = getCharCodex();
    if (charGot.length) recall.push(['人物图鉴', charGot.length + ' / ' + ((window.Intro && Intro.codex) || []).length]);
    const box = $('ending');
    box.classList.remove('hidden');
    box.innerHTML =
      '<div id="scroll">' +
      '<div class="seal">梦华<br>终卷</div>' +
      '<h2>' + e.title + '</h2>' +
      '<div class="sub">' + e.sub + '</div>' +
      e.text.map(p => '<p>' + p + '</p>').join('') +
      '<div class="recall">' + recall.map(r => '<div><b>' + r[0] + '</b><br>' + r[1] + '</div>').join('') + '</div>' +
      '<p style="font-size:13px;color:#6b6155">这一世的账，记到这里。</p>' +
      '<div class="acts">' +
      '<button id="btnNew">再入东京（新周目）</button>' +
      '<button class="ghost" id="btnCodex">结局图鉴</button>' +
      '</div></div>';
    $('btnNew').onclick = () => { box.classList.add('hidden'); showTitle(); };
    $('btnCodex').onclick = () => openCodex();
    try { localStorage.removeItem(SAVE_KEY); } catch (x) { }
  }

  function closeDlgForce() {
    dlg = null; typing = false;
    $('dlg').classList.add('hidden');
  }

  /* ---------------- 存档 ---------------- */
  function autosave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (x) { } }
  function saveGame() {
    if (!state) { toast('还没有可存的进度'); return; }
    autosave(); toast('已存档（本地）');
  }
  function loadGame() {
    let raw = null;
    try { raw = localStorage.getItem(SAVE_KEY); } catch (x) { }
    if (!raw) { toast('没有找到存档'); return; }
    try {
      const s = JSON.parse(raw);
      state = Object.assign(newState(s.origin || 'shizi'), s);
      if (!state.flags) state.flags = {};
      state.flags.introPlayed = true;   // 老存档：序章不再播
      mode = 'play'; paused = false; hudSig = '';
      $('title').classList.add('hidden');
      dlg = null; $('dlg').classList.add('hidden');
      $('card').classList.add('hidden');
      $('ending').classList.add('hidden');
      travel(state.loc, true);
      toast('已读档');
      refreshHUD();
    } catch (x) { toast('存档损坏'); }
  }
  function hasSave() {
    try { return !!localStorage.getItem(SAVE_KEY); } catch (x) { return false; }
  }

  /* ---------------- UI ---------------- */
  let toastT = 0;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('on'), 2600);
  }

  let cardCb = null;
  function showCard(title, lines, btn, cb) {
    paused = true;
    const c = $('card');
    c.innerHTML = '<h4>' + title + '</h4>' +
      lines.map(l => '<div class="li"><span>' + l + '</span></div>').join('') +
      '<div class="go"><button id="cardGo">' + (btn || '知道了') + '</button></div>';
    c.classList.remove('hidden');
    cardCb = cb || null;
    $('cardGo').onclick = () => {
      c.classList.add('hidden');
      const f = cardCb; cardCb = null;
      paused = false;
      if (f) f();
      refreshHUD();
    };
  }

  function refreshHUD() {
    if (!state) return;
    $('date').textContent = D.dateName(state.day);
    $('slotname').textContent = D.SLOTS[state.slot];
    if ($('today')) $('today').textContent = todayHint();
    const total = mode === 'yx' ? D.META.yuanxiaoMs : D.META.slotMs;
    const left = mode === 'yx' ? state.yx.t : state.t;
    $('tbar').style.width = clamp(100 - (left / total) * 100, 0, 100) + '%';
    const sig = [state.money, state.attrs.才学, state.attrs.身手, state.attrs.人脉, state.attrs.名声,
      Math.round(state.stamina), state.career.line, state.career.stage, state.career.exp].join('|');
    if (sig === hudSig) return;
    hudSig = sig;
    const c = D.CAREERS[state.career.line];
    const needNow = state.career.stage < 3 ? c.need[state.career.stage] : 0;
    const chips = [
      ['🪙', D.fmtMoney(state.money), true],
      ['📜', state.attrs.才学, false],
      ['✊', state.attrs.身手, false],
      ['👥', state.attrs.人脉, false],
      ['🥁', state.attrs.名声, false],
      ['⚡', Math.round(state.stamina), state.stamina < 30],
      ['🏮', c.name + state.career.stage + (needNow ? ' ' + state.career.exp + '/' + needNow : ' 满阶'), false]
    ];
    $('attrs').innerHTML = chips.map(x =>
      '<div class="chip' + (x[2] ? ' hot' : '') + '"><span>' + x[0] + '</span><b>' + x[1] + '</b></div>').join('');
  }

  function openCast() {
    const rows = [
      ['su', '苏羹娘', '州桥夜市 · 旋煎茶', '相守 · 情谊 55 / 敬重 40｜上元夜在州桥要有抉择（名声 25，或 8000 文铺契）'],
      ['liu', '柳婉卿', '莲花棚 · 小卿', '脱籍离京 · 情谊 50 / 敬重 45 / 倾慕 40｜上元夜走判状：需官身或游侠二阶 + 8000 文'],
      ['qin', '秦九娘', '九章堂 · 香药', '并肩 · 敬重 55｜上元夜上堂作证（名声 35）'],
      ['li', '李氏', '士族闺秀 · 寓京', '门第 · 倾慕 40 + 才学 55（这一步，她父亲说了算）']
    ];
    const html = rows.map(([k, nm, tag, goal]) => {
      const h = state.hearts[k];
      const face = D.FACES && D.FACES[nm] ? '<img class="fc" src="' + D.FACES[nm] + '" alt="">' : '';
      const miss = state.missed[k] ? '<div class="miss">她已有了自己的去处</div>' : '';
      const met = state.seen['met_' + k] || state.seen[k + '_1'] ? '<div class="ok">已相识</div>' : '';
      const metOK = !!(state.seen['met_' + k] || state.seen[k + '_1']);
      const nx = metOK && !state.missed[k] ? chainBlockedHint(k) : '';
      return '<div class="p"><div class="nm">' + face + nm + '<i>' + tag + '</i></div><div>' +
        bar('情谊', h.情谊, 'c1') + bar('敬重', h.敬重, 'c2') + bar('倾慕', h.倾慕, 'c3') +
        miss + met + (nx ? '<div class="nx">' + nx + '</div>' : '') +
        (metOK ? '<div class="goal">' + goal + '</div>' : '') + '</div></div>';
    }).join('');
    /* 抬头先写「我是谁」：出身原画也挂上去，免得 4 张出身图只躺在素材目录里 */
    const o = state.origin && D.ORIGINS[state.origin];
    const meName = o ? o.who.split('·')[0].trim() : '';
    const me = o ? '<div class="me">' +
      (D.FACES && D.FACES[meName] ? '<img class="fc" src="' + D.FACES[meName] + '" alt="">' : '') +
      '<div><b>' + meName + '</b><i>' + o.name + ' · ' +
      D.CAREERS[state.career.line].name + state.career.stage + '</i></div></div>' : '';
    $('cast').innerHTML = '<span class="close" id="castClose">关闭 · Esc</span><h3>人情帐</h3>' +
      '<div class="cast">' + me + html + '</div>' +
      '<p style="font-size:12px;color:#5a534a;line-height:1.9;margin:12px 0 0">' +
      '情谊靠共患难，敬重靠你自己站得住，倾慕只在双向的窗口里长。三者失衡时，她们会往后退。',
      '上元那一夜，三条线只够你亲口说一句话——先想清楚要哪一个。</p>' +
      '<style>.cast .goal{font-size:11px;color:#7a6a52;line-height:1.75;margin-top:6px;padding-top:5px;border-top:1px dashed rgba(140,110,70,.35)}</style>';
    $('cast').classList.remove('hidden');
    $('castClose').onclick = () => { $('cast').classList.add('hidden'); paused = false; };
    paused = true;
  }
  function bar(label, v, cls) {
    return '<div class="dim"><span>' + label + '</span><span class="b ' + cls + '"><i style="width:' +
      clamp(v, 0, 100) + '%"></i></span><span class="v">' + D.fmtNum(v) + '</span></div>';
  }

  /* 钟面第二行：把「今天该往哪跑」摆在明处，免得只能一无所获地转场所 */
  function todayHint() {
    if (!state) return '';
    const out = [];
    for (const ev of D.EVENTS) {
      if (state.fired[ev.id]) continue;
      const d = ev.day - state.day;
      if (d < 0 || d > 2) continue;
      if (ev.cond && !ev.cond(state)) continue;
      const a = D.LOCATIONS[ev.loc];
      if (!a) continue;
      const when = (d === 0 ? '今日 ' : d === 1 ? '明日 ' : '后日 ') + D.SLOTS[ev.slot];
      out.push(when + ' · ' + a.name.split(' · ')[0]);
      if (out.length >= 2) break;
    }
    if (state.day === 7) out.push('明夜上元');
    return out.join('　／　');
  }

  /* ---------------- 图鉴（人物 + 结局） ---------------- */
  function getCharCodex() {
    try {
      const a = JSON.parse(localStorage.getItem(CHAR_CODEX_KEY) || '[]');
      return Array.isArray(a) ? a : [];
    } catch (x) { return []; }
  }
  function getEndingCodex() {
    try {
      const a = JSON.parse(localStorage.getItem(CODEX_KEY) || '[]');
      return Array.isArray(a) ? a : [];
    } catch (x) { return []; }
  }
  function codexHTML() {
    const list = (window.Intro && Intro.codex) || [];
    const got = getCharCodex();
    const ends = getEndingCodex();
    const chars = list.map(c => {
      const has = got.indexOf(c.id) >= 0;
      const src = (window.Intro && Intro.assets && Intro.assets[c.img])
        ? Intro.assets[c.img].src : 'assets/fig-' + c.id + '.jpg';
      return '<div class="c' + (has ? '' : ' lock') + '">' +
        '<img src="' + src + '" alt="' + (has ? c.name : '未识') + '">' +
        '<div><div class="nm">' + (has ? c.name : '未　识') + '</div>' +
        '<div class="tg">' + (has ? c.tag : '序章中未曾谋面') + '</div>' +
        '<div class="ln">' + (has ? c.line : '　') + '</div>' +
        (has && c.hint ? '<div class="hn">' + c.hint + '</div>' : '') +
        '</div></div>';
    }).join('');
    const els = D.ENDINGS.map(e => {
      const read = ends.indexOf(e.id) >= 0;
      return '<div class="' + (read ? '' : 'un') + '"><b>' + (read ? '【已读】' : '【未读】') +
        e.title + '</b><br>' + (read ? e.sub : '　') + '</div>';
    }).join('');
    return '<span class="close" id="codexClose">关闭 · Esc</span>' +
      '<h3>图鉴<small>人物 ' + got.length + ' / ' + list.length +
      '　结局 ' + ends.length + ' / ' + D.ENDINGS.length + '</small></h3>' +
      '<div class="sub2">人物 · 序章里打过照面的人</div>' +
      '<div class="cx">' + chars + '</div>' +
      '<div class="sub2">结局 · 此后再入东京，可再翻</div>' +
      '<div class="ends">' + els + '</div>' +
      '<p style="font-size:12px;color:#5a534a;line-height:1.9;margin:12px 0 0">' +
      '序章里登场一位，便记一位。跳过序章不会留下人物图鉴。</p>';
  }
  function openCodex() {
    if (!state) { toast('先入京，再翻图鉴'); return; }
    const p = $('codexP');
    p.innerHTML = codexHTML();
    p.classList.remove('hidden');
    $('codexClose').onclick = closeCodex;
    paused = true;
  }
  function closeCodex() {
    $('codexP').classList.add('hidden');
    if (mode === 'play') paused = false;
  }

  function openMap() {
    const keys = ['zhouqiao', 'washe', 'siguo', 'yujie', 'inn'];
    $('mapP').innerHTML = '<span class="close" id="mapClose">关闭 · Esc</span><h3>汴京舆图</h3><div class="mgrid">' +
      keys.map(k => {
        const a = D.LOCATIONS[k];
        return '<button data-go="' + k + '" class="' + (state.loc === k ? 'here' : '') + '">' +
          a.name + '<small>' + a.blurb + '</small></button>';
      }).join('') + '</div>' +
      '<p style="font-size:12px;color:#5a534a;line-height:1.9;margin:12px 0 0">' +
      '换区耗六分体力。步行也行。上元夜可借舆图赶场。</p>';
    $('mapP').classList.remove('hidden');
    $('mapClose').onclick = () => { $('mapP').classList.add('hidden'); paused = false; };
    Array.from($('mapP').querySelectorAll('[data-go]')).forEach(b => {
      b.onclick = () => {
        const to = b.dataset.go;
        $('mapP').classList.add('hidden'); paused = false;
        if (to === state.loc) return;
        state.stamina = clamp(state.stamina - 6, 0, 100);
        travel(to);
      };
    });
    paused = true;
  }

  /* ---------------- 交互 ---------------- */
  function visibleNpcs() {
    const out = [];
    const a = area();
    for (const id in D.NPCS) {
      const n = D.NPCS[id];
      const sched = (n.sched && n.sched[state.slot]) || [];
      if (!sched.includes(state.loc)) continue;
      const p = a.npcs && a.npcs[id];
      if (!p) continue;
      if (mode === 'yx' && (id === 'su' || id === 'liu' || id === 'qin')) {
        if (!state.yx.done[id === 'su' ? 'su' : id === 'liu' ? 'liu' : 'qin']) { /* 仍然出现 */ }
      }
      out.push({ id, x: p.x, y: p.y, npc: n });
    }
    return out;
  }

  function interactables() {
    const a = area(), list = [];
    visibleNpcs().forEach(n => list.push({ kind: 'npc', id: n.id, x: n.x, y: n.y, label: '与' + n.npc.name + '说话' }));
    (a.spots || []).forEach(s => {
      let label = s.id === 'bed' ? '歇下（房钱二十文）' : (D.WORKS[s.id] ? D.WORKS[s.id].label : s.id);
      list.push({ kind: 'spot', id: s.id, x: s.x, y: s.y, label });
    });
    (a.portals || []).forEach(p => list.push({ kind: 'portal', id: p.to, x: p.x + p.w / 2, y: p.y + p.h / 2, label: p.label }));
    if (mode === 'yx' && state.loc === 'yujie') {
      list.push({ kind: 'tower', id: 'loudeng', x: 800, y: 150, label: '登灯楼' });
    }
    return list;
  }

  function nearest() {
    let best = null, bd = 78;
    for (const it of interactables()) {
      const d = Math.hypot(it.x - state.x, it.y - state.y);
      if (d < bd) { bd = d; best = it; }
    }
    return best;
  }

  function interact() {
    if (paused || mode === 'title' || mode === 'ending') return;
    const it = nearest();
    if (!it) return;
    if (it.kind === 'npc') talk(it.id);
    else if (it.kind === 'spot') doWork(it.id);
    else if (it.kind === 'portal') travel(it.id);
    else if (it.kind === 'tower') {
      const done = state.yx.done;
      if (done.su || done.liu || done.qin) openNode('yx_final');
      else toast('先去见她们。灯楼不等人。');
    }
  }

  /* ---------------- 主循环 ---------------- */
  function update(dt) {
    frame++;
    // 打字机
    if (typing) {
      typeI += Math.max(1, Math.round(dt / 16));
      if (typeI >= curText.length) { typeI = curText.length; typing = false; }
      $('dText').textContent = curText.slice(0, typeI);
    }
    if (!paused && (mode === 'play' || mode === 'yx')) {
      // 时间
      if (mode === 'yx') {
        state.yx.t -= dt;
        if (state.yx.t <= 0) { state.yx.t = 0; yxTimeout(); }
      } else {
        state.t += dt;
        if (state.t >= D.META.slotMs) { state.t = 0; nextSlot(); }
      }
      // 移动
      let dx = 0, dy = 0;
      if (keys['a'] || keys['arrowleft']) dx--;
      if (keys['d'] || keys['arrowright']) dx++;
      if (keys['w'] || keys['arrowup']) dy--;
      if (keys['s'] || keys['arrowdown']) dy++;
      if (dx || dy) {
        const len = Math.hypot(dx, dy) || 1;
        const sp = 168 * (state.stamina < 15 ? 0.62 : 1);
        moveBy(dx / len * sp * dt / 1000, dy / len * sp * dt / 1000);
        state.walk = true;
        state.phase += dt * 0.013;
        state.dir = dx === 0 ? state.dir : (dx > 0 ? 1 : -1);
        state.face = dy < 0 ? 'up' : dy > 0 ? 'down' : (dx > 0 ? 'right' : 'left');
      } else state.walk = false;
      // 体力耗尽强制回栈
      if (state.stamina <= 0.5) {
        state.stamina = 18;
        toast('体力耗尽，你扶着墙回了脚店，先歇一歇');
        travel('inn', true);
        state.x = D.LOCATIONS.inn.spawn.x; state.y = D.LOCATIONS.inn.spawn.y + 120;
      }
    }
    // 摄像机
    const a = area();
    const tx = clamp(state.x - W / 2, 0, Math.max(0, a.w - W));
    const ty = clamp(state.y - H / 2, 0, Math.max(0, a.h - H));
    if (cam.x < 0) { cam.x = tx; cam.y = ty; }
    cam.x += (tx - cam.x) * Math.min(1, dt / 120);
    cam.y += (ty - cam.y) * Math.min(1, dt / 120);
    // 粒子
    if (state.anim) updateParticles(dt);
    floats = floats.filter(f => { f.life -= dt; return f.life > 0; });
    // 提示
    const it = paused ? null : nearest();
    const hint = $('hint');
    if (it) { hint.textContent = 'E　' + it.label; hint.classList.add('on'); }
    else hint.classList.remove('on');
    // 上元自动进入
    if (mode === 'play' && state.day === 8 && state.slot === 2 && !state.fired['__yx']) {
      state.fired['__yx'] = true;
      startYx();
    }
    if (mode === 'play' && state.day === 8 && state.slot === 3 && state.t > D.META.slotMs * 0.5 && !state.fired['__yxend']) {
      state.fired['__yxend'] = true;
      finish();
    }
    refreshHUD();
  }

  function moveBy(dx, dy) {
    const a = area();
    const R = 12;
    const solids = decoSolids(a);
    let nx = clamp(state.x + dx, 20, a.w - 20);
    let ny = state.y;
    if (!hitsSolid(nx, ny, R, solids)) state.x = nx;
    ny = clamp(state.y + dy, 40, a.h - 20);
    if (!hitsSolid(state.x, ny, R, solids)) state.y = ny;
  }
  function hitsSolid(x, y, r, solids) {
    for (const s of solids) {
      if (x > s.x - r && x < s.x + s.w + r && y > s.y - r && y < s.y + s.h + r) return true;
    }
    return false;
  }

  /* ---------------- 粒子 ---------------- */
  function float(text, color) {
    floats.push({ text, color: color || '#efe6d3', x: state.x + rnd(-10, 10), y: state.y - 26, life: 1200, max: 1200 });
  }

  function addParticles(kind) {
    if (!state) return;
    const a = area();
    if (!state.anim) return;
    if (kind === 'ambient') {
      for (let i = 0; i < 10; i++) {
        particles.push({
          t: 'petal', x: rnd(0, a.w), y: rnd(0, a.h * 0.4),
          vx: rnd(-14, 14), vy: rnd(6, 18), life: rnd(4000, 9000),
          r: rnd(2, 4), rot: rnd(0, 6.28), vr: rnd(-2, 2)
        });
      }
    }
    if (kind === 'firework') {
      for (let i = 0; i < 34; i++) {
        const ang = (i / 34) * Math.PI * 2, sp = rnd(60, 180);
        particles.push({
          t: 'spark', x: rnd(400, 1200), y: rnd(80, 340),
          vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
          life: rnd(1200, 2200), r: rnd(1.2, 2.4), hue: rnd(0, 1)
        });
      }
    }
    if (particles.length > 240) particles.splice(0, particles.length - 240);
  }

  function updateParticles(dt) {
    const s = dt / 1000;
    for (const p of particles) {
      p.x += (p.vx || 0) * s; p.y += (p.vy || 0) * s;
      if (p.t === 'steam') { p.r += s * 6; p.vy -= s * 2; p.life -= dt; }
      if (p.t === 'spark') { p.vy += 90 * s; p.vx *= 0.985; p.vy *= 0.985; p.life -= dt; }
      if (p.t === 'petal') { p.rot += (p.vr || 0) * s; p.x += Math.sin(p.y * 0.01) * 6 * s; p.life -= dt; }
    }
    particles = particles.filter(p => p.life > 0);
  }

  /* ---------------- 存档入口 / 标题 ---------------- */
  function showTitle() {
    mode = 'title'; paused = true; state = null; hudSig = '';
    particles = []; floats = [];
    $('title').classList.remove('hidden');
    $('ending').classList.add('hidden');
    $('dlg').classList.add('hidden');
    $('card').classList.add('hidden');
    $('cast').classList.add('hidden');
    $('mapP').classList.add('hidden');
    const wrap = $('origins');
    wrap.innerHTML = Object.values(D.ORIGINS).map(o =>
      '<button class="origin" data-o="' + o.key + '">' +
      '<h4>' + o.name + '</h4><div class="who">' + o.who + '</div>' +
      '<p>' + o.desc + '</p>' +
      '<div class="st">才学 ' + o.attrs.才学 + '　身手 ' + o.attrs.身手 + '　人脉 ' + o.attrs.人脉 +
      '　名声 ' + o.attrs.名声 + '　银钱 ' + D.fmtMoney(o.money) + '</div>' +
      '</button>').join('');
    Array.from(wrap.querySelectorAll('.origin')).forEach(b => {
      b.onclick = () => startGame(b.dataset.o);
    });
    const cont = $('cont');
    cont.innerHTML = hasSave() ? '<button id="btnCont">继续上回（读档）</button>' : '';
    if (hasSave()) $('btnCont').onclick = () => loadGame();
  }

  function startGame(key) {
    state = newState(key);
    state.flags.introPlayed = true;
    mode = 'play'; paused = false; hudSig = '';
    $('title').classList.add('hidden');
    travel('inn', true);
    refreshHUD();
    autosave();
    const o = D.ORIGINS[key];
    setTimeout(() => openNode(o.start), 260);
  }

  /* ---------------- 输入 ---------------- */
  function bindInput() {
    window.addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (mode === 'title' || mode === 'ending') return;
      if (k === 'e' || k === ' ') {
        if (dlg) { advanceDialog(); e.preventDefault(); return; }
        if (!$('card').classList.contains('hidden')) { $('cardGo') && $('cardGo').click(); return; }
        interact(); e.preventDefault();
      }
      if (k === 'escape') {
        if (dlg) { closeDlg(); return; }
        ['cast', 'mapP', 'codexP'].forEach(id => $(id).classList.add('hidden'));
        if ($('card').classList.contains('hidden')) paused = false;
      }
      if (k === 'tab') { e.preventDefault(); if (!dlg) { openCast(); } }
      if (k === 'm') { if (!dlg) { openMap(); } }
      if (k === 'f') { toggleAnim(); }
      // 数字键选选项
      if (dlg && /^[1-9]$/.test(k)) {
        const i = parseInt(k, 10) - 1;
        if (choices[i]) pick(i);
      }
    });
    window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
    $('dbox').addEventListener('click', e => {
      if (e.target.tagName === 'BUTTON') return;
      advanceDialog();
    });
    document.querySelectorAll('#dock button').forEach(b => {
      b.onclick = () => {
        const act = b.dataset.act;
        if (act === 'cast') openCast();
        if (act === 'codex') openCodex();
        if (act === 'map') openMap();
        if (act === 'save') saveGame();
        if (act === 'load') loadGame();
        if (act === 'anim') toggleAnim();
      };
    });
    window.addEventListener('resize', resize);
  }

  function animOn() { return state ? state.anim : animPref; }

  function toggleAnim() {
    const on = !animOn();
    animPref = on;
    if (state) { state.anim = on; if (!on) particles = []; }
    document.querySelector('[data-act="anim"]').classList.toggle('on', !on);
    toast(on ? '动画已开' : '已减少动画（粒子关闭、降帧）');
  }

  /* ============================================================
     渲染
     ============================================================ */
  const PAL = {
    paper: '#efe6d3', ink: '#2b2723', zhu: '#9c3a2e', yan: '#b8574a',
    deng: '#f0b35a', wa: '#3c4d5a', zhu2: '#7b2f3a'
  };
  const TINT = [
    { c: '#f6e6c8', a: 0.16 }, { c: '#ffffff', a: 0.03 },
    { c: '#3a2d4a', a: 0.30 }, { c: '#0d1420', a: 0.56 }
  ];

  function rng(seed) {
    let s = (seed >>> 0) || 12345;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function seedOf(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  function drawTitleBg() {
    const g = ctx;
    const grd = g.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, '#141a26'); grd.addColorStop(0.55, '#20182a'); grd.addColorStop(1, '#0c0e14');
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 22; i++) {
      const t = titleBg / 1000;
      const x = (i * 137.5 + Math.sin(t * 0.3 + i) * 24) % W;
      const y = (i * 91.3 + Math.cos(t * 0.22 + i * 1.7) * 18) % (H * 0.8) + H * 0.06;
      const r = 16 + (i % 5) * 9;
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      const hue = i % 3 === 0 ? 'rgba(184,87,74,' : 'rgba(240,179,90,';
      rg.addColorStop(0, hue + '0.34)'); rg.addColorStop(1, hue + '0)');
      g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
    }
    g.fillStyle = 'rgba(240,179,90,.55)';
    for (let i = 0; i < 18; i++) {
      const x = (i * 211 + titleBg * 0.012) % W;
      const y = (i * 143 + titleBg * 0.006) % H;
      g.fillRect(x, y, 1.5, 1.5);
    }
  }

  function draw() {
    if (!state) return;
    const a = area();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0b0e14'; ctx.fillRect(0, 0, W, H);

    const gc = buildGround(a);
    const sx = clamp(cam.x, 0, Math.max(0, a.w - W)), sy = clamp(cam.y, 0, Math.max(0, a.h - H));
    const viewW = Math.min(W, a.w), viewH = Math.min(H, a.h);
    // 小地图居中，不把场景挤在左上角
    const ox = a.w < W ? Math.round((W - a.w) / 2) : 0;
    const oy = a.h < H ? Math.round((H - a.h) / 2) : 0;
    ctx.drawImage(gc, sx, sy, viewW, viewH, ox, oy, viewW, viewH);

    ctx.save();
    ctx.translate(ox - Math.round(cam.x), oy - Math.round(cam.y));

    const deco = getDeco(a);
    // 后层道具
    for (const p of deco.back) drawProp(p);
    // 人物（按 y 排序）
    const chars = [];
    visibleNpcs().forEach(n => chars.push({ y: n.y, kind: 'npc', data: n }));
    chars.push({ y: state.y, kind: 'pc' });
    chars.sort((p, q) => p.y - q.y);
    for (const c of chars) {
      if (c.kind === 'pc') drawPlayer();
      else drawNpc(c.data);
    }
    // 前层道具
    for (const p of deco.front) drawProp(p);
    // 蒸汽/花瓣/火星
    drawParticles();
    // 浮动文字
    for (const f of floats) {
      const k = f.life / f.max;
      ctx.globalAlpha = k;
      ctx.fillStyle = f.color; ctx.font = '600 15px "Songti SC",serif'; ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y - (1 - k) * 22);
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    drawTint(a);
    drawGlow(a, sx, sy, ox, oy);
    vignette();
  }

  /* ---------- 地面缓存 ---------- */
  function buildGround(a) {
    const key = state.loc;
    if (groundCache[key]) return groundCache[key];
    const c = document.createElement('canvas');
    c.width = a.w; c.height = a.h;
    const g = c.getContext('2d');
    const R = rng(seedOf(key));
    g.fillStyle = a.ground; g.fillRect(0, 0, a.w, a.h);

    if (a.deco === 'market') {
      // 不规则石板
      for (let y = 0; y < a.h; y += 46) {
        for (let x = 0; x < a.w; x += 62) {
          const w = 54 + R() * 12, h = 38 + R() * 8;
          const v = 0.82 + R() * 0.3;
          g.fillStyle = 'rgba(120,98,76,' + (0.10 * v).toFixed(3) + ')';
          g.fillRect(x + R() * 6, y + R() * 5, w, h);
          g.strokeStyle = 'rgba(24,18,14,.28)'; g.lineWidth = 1;
          g.strokeRect(x + 2, y + 2, w, h);
        }
      }
      // 中央土路
      g.fillStyle = 'rgba(96,76,58,.35)';
      g.fillRect(0, a.h * 0.42, a.w, a.h * 0.26);
    } else if (a.deco === 'goulan') {
      for (let y = 0; y < a.h; y += 34) {
        g.fillStyle = 'rgba(255,235,205,.028)'; g.fillRect(0, y, a.w, 16);
        g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, y + 16, a.w, 2);
      }
      for (let x = 0; x < a.w; x += 220) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, 0, 3, a.h); }
      const rg = g.createRadialGradient(850, 380, 20, 850, 380, 520);
      rg.addColorStop(0, 'rgba(240,179,90,.18)'); rg.addColorStop(1, 'rgba(240,179,90,0)');
      g.fillStyle = rg; g.fillRect(0, 0, a.w, a.h);
    } else if (a.deco === 'temple') {
      for (let y = 0; y < a.h; y += 40) {
        for (let x = 0; x < a.w; x += 40) {
          const on = (Math.floor(x / 40) + Math.floor(y / 40)) % 2 === 0;
          g.fillStyle = on ? 'rgba(180,190,196,.055)' : 'rgba(20,26,30,.20)';
          g.fillRect(x + 2, y + 2, 36, 36);
        }
      }
    } else if (a.deco === 'street') {
      // 御街宽石道
      for (let y = 0; y < a.h; y += 70) {
        for (let x = 0; x < a.w; x += 96) {
          g.fillStyle = 'rgba(150,165,175,' + (0.05 + R() * 0.05).toFixed(3) + ')';
          g.fillRect(x + 3, y + 3, 90, 64);
        }
      }
      g.fillStyle = 'rgba(180,196,206,.10)';
      g.fillRect(a.w * 0.34, 0, a.w * 0.32, a.h);
      g.strokeStyle = 'rgba(180,196,206,.16)'; g.lineWidth = 2;
      g.strokeRect(a.w * 0.34, 0, a.w * 0.32, a.h);
    } else {
      // 脚店：木地板 + 四壁 + 门洞
      for (let y = 0; y < a.h; y += 28) {
        g.fillStyle = 'rgba(255,238,210,.04)'; g.fillRect(0, y, a.w, 13);
        g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, y + 13, a.w, 2);
      }
      g.fillStyle = '#3a2e23';
      g.fillRect(0, 0, a.w, 96); g.fillRect(0, 0, 54, a.h);
      g.fillRect(a.w - 54, 0, 54, a.h); g.fillRect(0, a.h - 38, a.w, 38);
      g.strokeStyle = 'rgba(20,14,10,.35)'; g.lineWidth = 2;
      for (let x = 0; x < a.w; x += 46) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 96); g.stroke(); }
      // 门洞
      g.fillStyle = '#171310'; g.fillRect(400, 0, 120, 92);
      g.fillStyle = '#4a3a2c'; g.fillRect(392, 0, 12, 96); g.fillRect(516, 0, 12, 96);
      g.fillStyle = '#5e3a34'; g.fillRect(432, 14, 56, 38);
      g.strokeStyle = 'rgba(240,230,205,.45)'; g.lineWidth = 1.5; g.strokeRect(432, 14, 56, 38);
      g.fillStyle = 'rgba(246,238,222,.92)'; g.font = '600 15px "Songti SC",serif'; g.textAlign = 'center';
      g.fillText('脚店', 460, 39);
    }
    // 边缘压暗
    const vg = g.createLinearGradient(0, 0, 0, a.h);
    vg.addColorStop(0, 'rgba(0,0,0,.35)'); vg.addColorStop(0.18, 'rgba(0,0,0,0)');
    vg.addColorStop(0.85, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.42)');
    g.fillStyle = vg; g.fillRect(0, 0, a.w, a.h);
    groundCache[key] = c;
    return c;
  }

  /* ---------- 装饰生成 ---------- */
  function getDeco(a) {
    if (decoCache[state.loc]) return decoCache[state.loc];
    const d = buildDeco(a);
    decoCache[state.loc] = d;
    return d;
  }

  function buildDeco(a) {
    const R = rng(seedOf(state.loc) + 7);
    const back = [], front = [], lanterns = [], solids = [];
    const push = (t, x, y, o) => back.push(Object.assign({ t, x, y }, o || {}));

    if (a.deco === 'market') {
      // 桥
      back.push({ t: 'bridge', x: 780, y: 560 });
      solids.push({ x: 690, y: 520, w: 180, h: 40 });
      // 摊棚两排
      for (let i = 0; i < 6; i++) {
        const x = 220 + i * 215, y = 700 + (i % 2) * 40;
        back.push({ t: 'stall', x, y, seed: i });
        solids.push({ x: x - 62, y: y - 20, w: 124, h: 46 });
        for (let k = 0; k < 3; k++) lanterns.push({ x: x - 40 + k * 40, y: y - 66, r: 16, ph: R() * 6.28 });
      }
      for (let i = 0; i < 5; i++) {
        const x = 330 + i * 230, y = 250;
        back.push({ t: 'stall', x, y, seed: i + 9 });
        solids.push({ x: x - 62, y: y - 20, w: 124, h: 46 });
        lanterns.push({ x, y: y - 70, r: 18, ph: R() * 6.28 });
      }
      // 布幔
      for (let i = 0; i < 8; i++) front.push({ t: 'banner', x: 120 + i * 190, y: 60 + (i % 2) * 22, hue: i % 2 });
    }

    if (a.deco === 'goulan') {
      back.push({ t: 'stage', x: 860, y: 400 });
      solids.push({ x: 700, y: 330, w: 320, h: 90 });
      for (let i = 0; i < 4; i++) back.push({ t: 'beam', x: 620 + i * 150, y: 380, ph: i * 1.3 });
      for (let i = 0; i < 10; i++) {
        const x = 180 + i * 130, y = 700 + (i % 3) * 26;
        back.push({ t: 'bench', x, y });
        solids.push({ x: x - 34, y: y - 12, w: 68, h: 26 });
      }
      for (let i = 0; i < 7; i++) lanterns.push({ x: 160 + i * 210, y: 120 + (i % 3) * 20, r: 20, ph: R() * 6.28 });
      for (let i = 0; i < 5; i++) front.push({ t: 'drape', x: 90 + i * 330, y: 0, h: 210 + i * 16 });
    }

    if (a.deco === 'temple') {
      back.push({ t: 'hall', x: 800, y: 250 });
      solids.push({ x: 480, y: 190, w: 640, h: 150 });
      back.push({ t: 'burner', x: 780, y: 640 });
      solids.push({ x: 742, y: 612, w: 76, h: 56 });
      for (let i = 0; i < 4; i++) back.push({ t: 'tree', x: 240 + i * 380, y: 700 + (i % 2) * 60 });
      for (let i = 0; i < 6; i++) lanterns.push({ x: 300 + i * 200, y: 340, r: 14, ph: R() * 6.28 });
      for (let i = 0; i < 7; i++) front.push({ t: 'pigeon', x: 200 + i * 180, y: 150, ph: i * 0.9 });
    }

    if (a.deco === 'street') {
      back.push({ t: 'gate', x: 800, y: 470 });
      solids.push({ x: 700, y: 430, w: 34, h: 60 }, { x: 870, y: 430, w: 34, h: 60 });
      for (let i = 0; i < 4; i++) {
        back.push({ t: 'shop', x: 250, y: 300 + i * 200, side: -1, seed: i });
        solids.push({ x: 120, y: 250 + i * 200, w: 150, h: 100 });
      }
      for (let i = 0; i < 4; i++) {
        back.push({ t: 'shop', x: 1350, y: 300 + i * 200, side: 1, seed: i + 5 });
        solids.push({ x: 1230, y: 250 + i * 200, w: 150, h: 100 });
      }
      for (let i = 0; i < 8; i++) lanterns.push({ x: 150 + i * 190, y: 160, r: 16, ph: R() * 6.28 });
      for (let i = 0; i < 4; i++) front.push({ t: 'banner', x: 380 + i * 300, y: 520, hue: i % 2 });
    }

    if (a.deco === 'inn') {
      back.push({ t: 'counter', x: 620, y: 230 });
      solids.push({ x: 540, y: 200, w: 170, h: 52 });
      back.push({ t: 'bed', x: 200, y: 470 });
      solids.push({ x: 150, y: 440, w: 100, h: 60 });
      for (let i = 0; i < 3; i++) back.push({ t: 'table', x: 380 + i * 150, y: 520 + (i % 2) * 40 });
      for (let i = 0; i < 3; i++) lanterns.push({ x: 250 + i * 230, y: 130, r: 15, ph: R() * 6.28 });
      back.push({ t: 'stairs', x: 760, y: 560 });
      solids.push({ x: 700, y: 520, w: 110, h: 90 });
    }

    return { back, front, lanterns, solids };
  }

  function decoSolids(a) {
    const d = getDeco(a);
    const ex = [];
    // 城墙/边界不额外处理，地图边界已限制
    return d.solids.concat(ex);
  }

  /* ---------- 道具绘制 ---------- */
  function drawProp(p) {
    const g = ctx;
    switch (p.t) {
      case 'stall': {
        g.fillStyle = 'rgba(28,20,16,.55)';
        g.fillRect(p.x - 60, p.y - 8, 120, 34);
        g.fillStyle = p.seed % 2 ? '#6d4a3a' : '#5d4a3c';
        g.fillRect(p.x - 58, p.y - 6, 116, 12);
        // 棚顶
        g.fillStyle = p.seed % 2 ? '#8d4b3c' : '#7a5340';
        g.beginPath();
        g.moveTo(p.x - 68, p.y - 46); g.lineTo(p.x + 68, p.y - 46);
        g.lineTo(p.x + 54, p.y - 26); g.lineTo(p.x - 54, p.y - 26); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(20,14,10,.45)'; g.lineWidth = 2; g.stroke();
        // 蒸汽
        if (state.anim && frame % 7 === 0) {
          particles.push({ t: 'steam', x: p.x + rnd(-20, 20), y: p.y - 40, vx: rnd(-6, 6), vy: -18, r: rnd(6, 12), life: 2200 });
        }
        // 锅
        g.fillStyle = '#2b2622'; g.beginPath(); g.arc(p.x - 14, p.y - 16, 11, 0, 6.28); g.fill();
        g.fillStyle = '#3a332c'; g.beginPath(); g.arc(p.x - 14, p.y - 18, 8, 0, 6.28); g.fill();
        break;
      }
      case 'banner': {
        g.save(); g.translate(p.x, p.y);
        g.fillStyle = p.hue ? 'rgba(156,58,46,.75)' : 'rgba(60,77,90,.72)';
        const sway = Math.sin(frame * 0.02 + p.x) * 3;
        g.beginPath(); g.moveTo(-7, 0); g.lineTo(7, 0); g.lineTo(6, 54); g.lineTo(-6, 54); g.closePath(); g.fill();
        g.fillStyle = 'rgba(240,230,210,.85)'; g.font = '600 12px "Songti SC",serif'; g.textAlign = 'center';
        g.fillText(p.hue ? '酒' : '茶', sway, 30);
        g.restore();
        break;
      }
      case 'bridge': {
        g.fillStyle = '#4a4038';
        g.beginPath(); g.moveTo(p.x - 120, p.y + 40); g.quadraticCurveTo(p.x, p.y - 60, p.x + 120, p.y + 40);
        g.lineTo(p.x + 120, p.y + 70); g.quadraticCurveTo(p.x, p.y - 26, p.x - 120, p.y + 70); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(20,16,12,.5)'; g.lineWidth = 2; g.stroke();
        g.fillStyle = 'rgba(240,230,205,.10)';
        g.fillRect(p.x - 130, p.y + 6, 260, 24);
        g.fillStyle = '#5d5348'; g.fillRect(p.x - 132, p.y + 2, 16, 78); g.fillRect(p.x + 116, p.y + 2, 16, 78);
        break;
      }
      case 'stage': {
        g.fillStyle = '#241b26'; g.fillRect(p.x - 160, p.y - 70, 320, 96);
        g.fillStyle = '#3a2b3c'; g.fillRect(p.x - 160, p.y - 8, 320, 34);
        g.fillStyle = 'rgba(156,58,46,.55)';
        g.fillRect(p.x - 158, p.y - 66, 316, 12);
        g.strokeStyle = 'rgba(240,179,90,.35)'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(p.x - 140, p.y - 54); g.lineTo(p.x + 140, p.y - 54); g.stroke();
        // 台上人影
        g.fillStyle = 'rgba(240,220,200,.20)';
        for (let i = 0; i < 3; i++) {
          const x = p.x - 60 + i * 60;
          g.beginPath(); g.arc(x, p.y - 8 + Math.sin(frame * 0.01 + i) * 2, 8, 0, 6.28); g.fill();
          g.fillRect(x - 7, p.y + 2, 14, 20);
        }
        g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(p.x - 168, p.y + 26, 336, 12);
        break;
      }
      case 'beam': {
        const sway = Math.sin(frame * 0.012 + p.ph) * 8;
        const grd = g.createLinearGradient(p.x, p.y, p.x + sway, p.y + 460);
        grd.addColorStop(0, 'rgba(240,190,120,.20)');
        grd.addColorStop(1, 'rgba(240,190,120,0)');
        g.fillStyle = grd;
        g.beginPath();
        g.moveTo(p.x - 22, p.y); g.lineTo(p.x + 22, p.y);
        g.lineTo(p.x + 96 + sway, p.y + 460); g.lineTo(p.x - 96 + sway, p.y + 460);
        g.closePath(); g.fill();
        break;
      }
      case 'bench': {
        g.fillStyle = '#3b3028'; g.fillRect(p.x - 30, p.y - 6, 60, 14);
        g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(p.x - 30, p.y + 8, 60, 5);
        break;
      }
      case 'drape': {
        g.fillStyle = 'rgba(52,32,56,.85)';
        g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x + 74, p.y);
        g.quadraticCurveTo(p.x + 60, p.h * 0.5, p.x + 74, p.h); g.lineTo(p.x, p.h - 16); g.closePath(); g.fill();
        g.fillStyle = 'rgba(156,58,46,.35)';
        g.fillRect(p.x, p.y + 8, 70, 6);
        break;
      }
      case 'hall': {
        // 大雄殿：屋顶 + 檐 + 廊柱
        g.fillStyle = '#2f3840'; g.fillRect(p.x - 320, p.y - 90, 640, 150);
        g.fillStyle = '#3c4d5a';
        g.beginPath(); g.moveTo(p.x - 370, p.y - 90); g.lineTo(p.x, p.y - 190);
        g.lineTo(p.x + 370, p.y - 90); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(150,170,180,.25)'; g.lineWidth = 2;
        for (let i = 0; i < 9; i++) {
          g.beginPath(); g.moveTo(p.x - 360 + i * 90, p.y - 96); g.lineTo(p.x - 20 + i * 20, p.y - 180); g.stroke();
        }
        g.fillStyle = '#1f262c';
        for (let i = 0; i < 6; i++) g.fillRect(p.x - 280 + i * 112, p.y - 20, 22, 80);
        g.fillStyle = 'rgba(240,179,90,.18)';
        g.fillRect(p.x - 60, p.y - 60, 120, 60);
        break;
      }
      case 'burner': {
        g.fillStyle = '#3a3f44'; g.fillRect(p.x - 34, p.y - 18, 68, 44);
        g.fillStyle = '#4b5157'; g.fillRect(p.x - 38, p.y - 24, 76, 10);
        g.fillStyle = 'rgba(240,179,90,.5)'; g.fillRect(p.x - 30, p.y - 16, 60, 4);
        if (state.anim && frame % 6 === 0) {
          particles.push({ t: 'steam', x: p.x + rnd(-16, 16), y: p.y - 30, vx: rnd(-8, 8), vy: -22, r: rnd(8, 16), life: 3200 });
        }
        break;
      }
      case 'tree': {
        g.fillStyle = '#3a2f26'; g.fillRect(p.x - 6, p.y - 40, 12, 46);
        g.fillStyle = 'rgba(74,92,68,.9)';
        for (let i = 0; i < 3; i++) {
          g.beginPath(); g.arc(p.x + (i - 1) * 22, p.y - 52 - (i % 2) * 12, 26, 0, 6.28); g.fill();
        }
        break;
      }
      case 'pigeon': {
        const t = frame * 0.02 + p.ph;
        const x = p.x + Math.sin(t * 0.6) * 120, y = p.y + Math.cos(t * 0.4) * 22;
        g.fillStyle = 'rgba(230,230,235,.75)';
        g.beginPath(); g.ellipse(x, y, 6, 3, Math.sin(t) * 0.4, 0, 6.28); g.fill();
        g.strokeStyle = 'rgba(230,230,235,.6)'; g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x - 8, y - 5 + Math.sin(t * 3) * 2); g.stroke();
        g.beginPath(); g.moveTo(x + 3, y); g.lineTo(x + 8, y - 5 + Math.sin(t * 3) * 2); g.stroke();
        break;
      }
      case 'gate': {
        g.fillStyle = '#4a3c3a';
        g.fillRect(p.x - 130, p.y - 120, 26, 190);
        g.fillRect(p.x + 104, p.y - 120, 26, 190);
        g.fillStyle = '#5e3a34';
        g.fillRect(p.x - 150, p.y - 140, 300, 26);
        g.fillStyle = '#6d271e'; g.fillRect(p.x - 90, p.y - 128, 180, 26);
        g.fillStyle = 'rgba(240,230,205,.9)'; g.font = '600 15px "Songti SC",serif'; g.textAlign = 'center';
        g.fillText('御 街', p.x, p.y - 109);
        break;
      }
      case 'shop': {
        const s = p.side;
        g.fillStyle = '#2f343a';
        g.fillRect(s < 0 ? p.x - 130 : p.x - 20, p.y - 60, 150, 110);
        // 窗内灯火与柜后的人影
        const warm = state.slot >= 2 ? 0.5 : 0.3;
        g.fillStyle = 'rgba(240,179,90,' + warm + ')';
        g.fillRect(s < 0 ? p.x - 118 : p.x - 8, p.y - 46, 60, 52);
        g.fillStyle = 'rgba(70,50,38,.55)';
        
        g.fillRect(s < 0 ? p.x - 96 : p.x + 14, p.y - 30, 14, 36);
        g.fillStyle = 'rgba(240,179,90,.9)';
        g.beginPath(); g.arc(s < 0 ? p.x - 64 : p.x + 46, p.y - 40, 3.2, 0, 6.28); g.fill();
        g.fillStyle = p.seed % 2 ? 'rgba(156,58,46,.8)' : 'rgba(60,77,90,.8)';
        g.fillRect(s < 0 ? p.x - 24 : p.x + 76, p.y - 96, 34, 74);
        g.fillStyle = 'rgba(240,230,205,.85)'; g.font = '600 13px "Songti SC",serif'; g.textAlign = 'center';
        const names = ['香药', '书铺', '茶坊', '绢帛'];
        for (let i = 0; i < 2; i++) {
          g.fillText(names[(p.seed + i) % 4][i], s < 0 ? p.x - 7 : p.x + 93, p.y - 72 + i * 22);
        }
        break;
      }
      case 'counter': {
        g.fillStyle = '#4a3a2e'; g.fillRect(p.x - 80, p.y - 30, 160, 46);
        g.fillStyle = '#5f4a38'; g.fillRect(p.x - 84, p.y - 34, 168, 10);
        g.fillStyle = 'rgba(240,230,205,.25)'; g.fillRect(p.x - 60, p.y - 8, 40, 4);
        break;
      }
      case 'bed': {
        g.fillStyle = '#4b3a2c'; g.fillRect(p.x - 46, p.y - 20, 92, 44);
        g.fillStyle = '#8a7a62'; g.fillRect(p.x - 44, p.y - 24, 88, 22);
        g.fillStyle = 'rgba(240,230,210,.35)'; g.fillRect(p.x - 40, p.y - 26, 80, 12);
        break;
      }
      case 'table': {
        g.fillStyle = '#3c2f26'; g.beginPath(); g.arc(p.x, p.y - 12, 20, 0, 6.28); g.fill();
        g.fillStyle = '#4a3a2e'; g.beginPath(); g.arc(p.x, p.y - 14, 16, 0, 6.28); g.fill();
        break;
      }
      case 'stairs': {
        g.fillStyle = '#3a2e24';
        for (let i = 0; i < 5; i++) g.fillRect(p.x - 50 + i * 4, p.y - i * 14, 100 - i * 8, 12);
        break;
      }
    }
  }

  /* ---------- 人物 ---------- */
  function drawPlayer() {
    const o = D.ORIGINS[state.origin];
    drawChar(ctx, state.x, state.y, {
      color: o.color, hair: o.hair, dir: state.walk ? (state.face || 'down') : 'down',
      phase: state.phase, walk: state.walk, scale: 1.06,
      idle: 'held_' + state.career.line, expr: '平', name: state.name
    });
  }

  function drawNpc(n) {
    const npc = n.npc;
    const t = frame * 0.02;
    drawChar(ctx, n.x, n.y, {
      color: npc.color, hair: npc.hair, dir: 'down',
      phase: t, walk: false, scale: 1, idle: npc.idle, expr: '平', name: npc.name
    });
    // 可交互标记
    const ev = (mode === 'yx' && (n.id === 'su' || n.id === 'liu' || n.id === 'qin')) || hasPendingTalk(n.id);
    if (ev) {
      ctx.globalAlpha = 0.6 + Math.sin(frame * 0.08) * 0.25;
      ctx.fillStyle = PAL.deng;
      ctx.beginPath(); ctx.arc(n.x, n.y - 74 + Math.sin(frame * 0.06) * 2, 4, 0, 6.28); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function hasPendingTalk(id) {
    const chain = D.CHAINS[id];
    if (!chain) return false;
    for (const c of chain) {
      if (c.cond && !c.cond(state)) continue;
      return !c.idle && !state.seen[c.node];
    }
    return false;
  }

  function drawChar(g, x, y, o) {
    const sc = o.scale || 1;
    const walk = !!o.walk;
    const ph = o.phase || 0;
    g.save();
    g.translate(x, y);
    g.scale(sc, sc);
    const back = o.dir === 'up';
    if (o.dir === 'left') g.scale(-1, 1);

    // 影子
    g.fillStyle = 'rgba(0,0,0,.28)';
    g.beginPath(); g.ellipse(0, 0, 13, 5, 0, 0, 6.28); g.fill();

    const legSw = walk ? Math.sin(ph * 2.6) * 5 : 0;
    // 腿
    g.strokeStyle = '#332c26'; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-4, -16); g.lineTo(-4 + legSw, -1); g.stroke();
    g.beginPath(); g.moveTo(4, -16); g.lineTo(4 - legSw, -1); g.stroke();
    // 身
    g.fillStyle = o.color;
    roundRect(g, -9, -36, 18, 24, 7); g.fill();
    g.strokeStyle = 'rgba(20,16,12,.35)'; g.lineWidth = 1.2; g.stroke();
    // 衣带
    g.fillStyle = 'rgba(30,22,18,.35)';
    g.fillRect(-9, -24, 18, 3);
    // 臂
    const armSw = walk ? Math.sin(ph * 2.6 + 3.14) * 4 : 0;
    g.strokeStyle = o.color; g.lineWidth = 4.5;
    g.beginPath(); g.moveTo(-9, -32); g.lineTo(-12, -20 + armSw); g.stroke();
    g.beginPath(); g.moveTo(9, -32); g.lineTo(12, -20 - armSw); g.stroke();
    // 手
    g.fillStyle = '#f0d4b8';
    g.beginPath(); g.arc(-12, -19 + armSw, 2.6, 0, 6.28); g.fill();
    g.beginPath(); g.arc(12, -19 - armSw, 2.6, 0, 6.28); g.fill();

    // 头
    g.fillStyle = '#f2d8bd';
    g.beginPath(); g.arc(0, -45, 9.4, 0, 6.28); g.fill();
    g.strokeStyle = 'rgba(30,24,18,.25)'; g.lineWidth = 1; g.stroke();
    // 发
    g.fillStyle = o.hair || '#241f1a';
    g.beginPath();
    g.arc(0, -47.5, 9.6, Math.PI * 1.05, Math.PI * 1.95);
    g.lineTo(8, -44); g.lineTo(-8, -44); g.closePath(); g.fill();
    g.beginPath(); g.arc(0, -55, 4.2, 0, 6.28); g.fill();
    // 面
    if (!back) {
      g.fillStyle = '#2b2521';
      const ey = -46;
      g.beginPath(); g.arc(-3.2, ey, 1.15, 0, 6.28); g.fill();
      g.beginPath(); g.arc(3.2, ey, 1.15, 0, 6.28); g.fill();
      // 眉（按表情）
      g.strokeStyle = '#3a302a'; g.lineWidth = 1;
      const eb = o.expr === '忧' ? 1.2 : o.expr === '怒' ? -1.4 : 0;
      g.beginPath(); g.moveTo(-5.4, -49 + eb); g.lineTo(-1.6, -49.6 - eb * 0.4); g.stroke();
      g.beginPath(); g.moveTo(5.4, -49 + eb); g.lineTo(1.6, -49.6 - eb * 0.4); g.stroke();
      // 嘴
      g.strokeStyle = 'rgba(150,70,60,.8)'; g.lineWidth = 1.1;
      g.beginPath();
      if (o.expr === '喜') g.arc(0, -41.4, 2.6, 0.2, Math.PI - 0.2);
      else if (o.expr === '忧') { g.moveTo(-2.4, -41.2); g.quadraticCurveTo(0, -42.6, 2.4, -41.2); }
      else if (o.expr === '怒') { g.moveTo(-2.4, -40.6); g.lineTo(2.4, -41.4); }
      else if (o.expr === '惊') { g.arc(0, -41.6, 1.8, 0, 6.28); }
      else if (o.expr === '羞') { g.arc(0, -41.6, 2.0, 0.4, Math.PI - 0.4); }
      else { g.moveTo(-2, -41); g.lineTo(2, -41); }
      g.stroke();
      // 腮红
      if (o.expr === '羞' || o.expr === '喜') {
        g.fillStyle = 'rgba(184,87,74,.25)';
        g.beginPath(); g.arc(-6, -43.4, 2.4, 0, 6.28); g.fill();
        g.beginPath(); g.arc(6, -43.4, 2.4, 0, 6.28); g.fill();
      }
    }

    // 手持物 / 小动作
    const t = ph;
    if (o.idle === 'stir') {
      g.strokeStyle = '#c9b18a'; g.lineWidth = 2;
      const a = t * 1.8;
      g.beginPath(); g.moveTo(12, -22); g.lineTo(12 + Math.cos(a) * 6, -22 + Math.sin(a) * 4); g.stroke();
      g.fillStyle = '#5a4a38'; g.beginPath(); g.arc(12 + Math.cos(a) * 8, -21 + Math.sin(a) * 6, 4.2, 0, 6.28); g.fill();
    } else if (o.idle === 'sleeve') {
      g.fillStyle = 'rgba(220,200,225,.55)';
      g.beginPath();
      g.moveTo(9, -30); g.quadraticCurveTo(20 + Math.sin(t) * 6, -22, 14, -12);
      g.quadraticCurveTo(12, -20, 8, -26); g.closePath(); g.fill();
    } else if (o.idle === 'abacus') {
      g.fillStyle = '#6b4a33'; g.fillRect(10, -24, 12, 9);
      g.fillStyle = '#d9c9a4';
      for (let i = 0; i < 4; i++) g.fillRect(11 + i * 3, -23 + (Math.sin(t * 3 + i) > 0 ? 0 : 3), 1.6, 5);
    } else if (o.idle === 'fan') {
      g.fillStyle = 'rgba(240,235,225,.8)';
      g.beginPath(); g.moveTo(11, -22); g.arc(11, -22, 9, -1.2 + Math.sin(t) * 0.3, 0.4 + Math.sin(t) * 0.3); g.closePath(); g.fill();
    } else if (o.idle === 'held_keju') {
      g.fillStyle = '#e6ddc8'; g.fillRect(9, -26, 7, 10);
      g.strokeStyle = '#9c3a2e'; g.lineWidth = 1; g.strokeRect(9, -26, 7, 10);
    } else if (o.idle === 'held_jingshang') {
      g.fillStyle = '#c9a06a'; g.fillRect(9, -26, 9, 9);
      g.fillStyle = '#7a5a34'; g.fillRect(11, -24, 5, 2);
    } else if (o.idle === 'held_jiyi') {
      g.strokeStyle = '#8a8f96'; g.lineWidth = 2.6;
      g.beginPath(); g.moveTo(11, -28); g.lineTo(13, -14); g.stroke();
      g.fillStyle = '#6a6f76'; g.fillRect(9, -30, 8, 4);
    } else if (o.idle === 'held_youxia') {
      g.strokeStyle = '#4a4f58'; g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(11, -30); g.lineTo(16, -12); g.stroke();
      g.fillStyle = '#2b2622'; g.fillRect(9, -31, 8, 3);
    }
    g.restore();

    // 名字
    if (o.name) {
      g.save();
      g.font = '600 11px "Songti SC",serif';
      g.textAlign = 'center';
      const ty = y - 64 * sc;
      g.fillStyle = 'rgba(16,12,10,.55)';
      const w = g.measureText(o.name).width + 10;
      roundRect(g, x - w / 2, ty - 11, w, 15, 3); g.fill();
      g.fillStyle = 'rgba(246,238,222,.94)';
      g.fillText(o.name, x, ty);
      g.restore();
    }
  }

  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
    g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
  }

  /* ---------- 粒子 ---------- */
  function drawParticles() {
    for (const p of particles) {
      if (p.t === 'petal') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot || 0);
        ctx.fillStyle = 'rgba(214,168,150,.55)';
        ctx.beginPath(); ctx.ellipse(0, 0, p.r * 1.4, p.r * 0.7, 0, 0, 6.28); ctx.fill();
        ctx.restore();
      } else if (p.t === 'steam') {
        const a = clamp(p.life / 2600, 0, 1) * 0.22;
        ctx.fillStyle = 'rgba(240,230,215,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
      } else if (p.t === 'spark') {
        const a = clamp(p.life / 1800, 0, 1);
        ctx.fillStyle = p.hue > 0.5 ? 'rgba(240,179,90,' + a + ')' : 'rgba(216,120,110,' + a + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
      }
    }
  }

  /* ---------- 时段色温 / 灯光 ---------- */
  function drawTint() {
    const ti = TINT[state.slot] || TINT[1];
    let a = ti.a;
    if (state.slot === 3) a += 0.04;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = ti.c;
    ctx.globalAlpha = a;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  function drawGlow(a, sx, sy, ox, oy) {
    const deco = getDeco(a);
    const night = state.slot >= 2;
    const boost = night ? 1.35 : 0.75;
    ox = ox || 0; oy = oy || 0;
    ctx.globalCompositeOperation = 'lighter';
    for (const l of deco.lanterns) {
      if (l.x < sx - 80 || l.x > sx + W + 80 || l.y < sy - 80 || l.y > sy + H + 80) continue;
      const breathe = 0.82 + Math.sin(frame * 0.03 + l.ph) * 0.18;
      const r = l.r * 6.2 * breathe * boost;
      const x = l.x - cam.x + Math.sin(frame * 0.02 + l.ph) * 2 + ox;
      const y = l.y - cam.y + oy;
      const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, 'rgba(240,179,90,' + (0.20 * boost).toFixed(3) + ')');
      rg.addColorStop(0.45, 'rgba(220,140,80,' + (0.07 * boost).toFixed(3) + ')');
      rg.addColorStop(1, 'rgba(220,140,80,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.28); ctx.fill();
      // 灯体
      ctx.fillStyle = 'rgba(228,80,60,.85)';
      ctx.beginPath(); ctx.ellipse(x, y + 14, 7, 9, 0, 0, 6.28); ctx.fill();
      ctx.fillStyle = 'rgba(240,179,90,.9)';
      ctx.beginPath(); ctx.ellipse(x, y + 16, 4, 6, 0, 0, 6.28); ctx.fill();
      ctx.fillStyle = 'rgba(60,40,30,.6)';
      ctx.fillRect(x - 7, y + 4, 14, 2);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function vignette() {
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.78);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,.55)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  /* ---------------- 启动 ---------------- */
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.floor(W * DPR); cv.height = Math.floor(H * DPR);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    groundCache = {};
  }

  function loop(now) {
    const dt = Math.min(60, now - lastTick || 16);
    lastTick = now;
    if (mode === 'title' || mode === 'ending') {
      titleBg += dt;
      drawTitleBg();
    } else {
      update(dt);
      draw();
    }
    requestAnimationFrame(loop);
  }

  function boot() {
    cv = $('cv'); ctx = cv.getContext('2d');
    resize(); bindInput();
    if (D.FACES) for (const k in D.FACES) {          // 预载对话胸像，免得第一次开口时空白一帧
      const s = D.FACES[k];
      if (!faceImgs[s]) { const im = new Image(); im.src = s; faceImgs[s] = im; }
    }
    showTitle();
    // 第一次进京（无存档）自动播序章；结束后直接落进主游戏。
    // 老存档 / 已看过序章：照旧停在标题页。
    if (window.Intro && !hasSave()) {
      try {
        Intro.play({ onDone: key => startGame(key) });
      } catch (e) {
        if (window.console) console.warn('序章启动失败，直接进标题页', e);
        showTitle();
      }
    }
    requestAnimationFrame(loop);
    // 标题页的灯影由 drawTitleBg 绘制，无需场景粒子
  }

  /* 暴露给渲染段；_h 为本地 headless 回归的钩子（不改状态机，只调入口函数） */
  window.__ENGINE__ = {
    get state() { return state; }, get mode() { return mode; }, get cam() { return cam; },
    get W() { return W; }, get H() { return H; }, get frame() { return frame; },
    get particles() { return particles; }, get floats() { return floats; },
    get groundCache() { return groundCache; }, get decoCache() { return decoCache; },
    get animOff() { return !animOn(); },
    _h: {
      start: startGame, talk, openCast, travel, refreshHUD, work: id => doWork(id),
      get state() { return state; },
      pick: i => pick(i),
      dlg: () => dlg, choices: () => choices, portrait: () => curPortrait, faces: () => D.FACES || {},
      setHeart: (k, dim, v) => { state.hearts[k][dim] = v; },
      setAttr: (k, v) => { state.attrs[k] = v; },
      setDay: (d, s) => { state.day = d; state.slot = s; refreshHUD(); },
      setCareer: (line, stage) => { state.career.line = line; state.career.stage = stage || 0; refreshHUD(); },
      setLoc: k => travel(k, true)
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
