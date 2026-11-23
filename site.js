// Charts (simulated from the 555 equations) and a PCB viewer that reads the
// Tinkercad Eagle .brd exports. Plain SVG, no libraries.
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const VCC = 5, HI = VCC * 2 / 3, LO = VCC / 3;

  // ---------- line chart with crosshair + tooltip ----------
  function lineChart(host, o) {
    const W = 640, H = 260, m = { l: 48, r: 16, t: 10, b: 38 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const wrap = document.createElement('div'); wrap.className = 'viz';
    if (o.series.length > 1) {
      const lg = document.createElement('div'); lg.className = 'legend';
      lg.innerHTML = o.series.map(s => `<span><i style="background:${s.color}"></i>${s.name}</span>`).join('');
      host.appendChild(lg);
    }
    host.appendChild(wrap);
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': o.aria }, wrap);
    const [x0, x1] = o.x, [y0, y1] = o.y;
    const ly = v => Math.log10(v);
    const sx = v => m.l + (v - x0) / (x1 - x0) * iw;
    const sy = o.log
      ? v => m.t + ih - (ly(v) - ly(y0)) / (ly(y1) - ly(y0)) * ih
      : v => m.t + ih - (v - y0) / (y1 - y0) * ih;

    o.yTicks.forEach(v => {
      el('line', { x1: m.l, x2: m.l + iw, y1: sy(v), y2: sy(v), stroke: 'var(--grid)' }, svg);
      el('text', { x: m.l - 8, y: sy(v) + 4, 'text-anchor': 'end' }, svg).textContent = o.yFmt(v);
    });
    o.xTicks.forEach(v => {
      el('text', { x: sx(v), y: m.t + ih + 18, 'text-anchor': 'middle' }, svg).textContent = o.xFmt(v);
    });
    el('line', { x1: m.l, x2: m.l + iw, y1: m.t + ih, y2: m.t + ih, stroke: 'var(--axis)' }, svg);
    el('text', { x: m.l + iw, y: H - 2, 'text-anchor': 'end' }, svg).textContent = o.xLabel;
    const yl = el('text', { x: m.l + 4, y: m.t + 12 }, svg); yl.textContent = o.yLabel;

    (o.refs || []).forEach(r => {
      el('line', { x1: m.l, x2: m.l + iw, y1: sy(r.y), y2: sy(r.y), stroke: 'var(--axis)', 'stroke-dasharray': '4 4' }, svg);
      el('text', { x: m.l + iw - 2, y: sy(r.y) - 5, 'text-anchor': 'end' }, svg).textContent = r.label;
    });

    o.series.forEach(s => {
      const d = s.pts.map((p, i) => (i ? 'L' : 'M') + sx(p[0]).toFixed(1) + ' ' + sy(p[1]).toFixed(1)).join('');
      el('path', { d, fill: 'none', stroke: s.color, 'stroke-width': 2, 'stroke-linejoin': 'round' }, svg);
    });
    (o.marks || []).forEach(p => {
      el('circle', { cx: sx(p.x), cy: sy(p.y), r: 4.5, fill: o.series[0].color, stroke: 'var(--card)', 'stroke-width': 2 }, svg);
      el('text', { x: sx(p.x) + 8, y: sy(p.y) - 8, class: 'lbl' }, svg).textContent = p.label;
    });

    // hover layer
    const cross = el('line', { y1: m.t, y2: m.t + ih, stroke: 'var(--axis)', visibility: 'hidden' }, svg);
    const dots = o.series.map(s => el('circle', { r: 4.5, fill: s.color, stroke: 'var(--card)', 'stroke-width': 2, visibility: 'hidden' }, svg));
    const hit = el('rect', { x: m.l, y: m.t, width: iw, height: ih, fill: 'transparent' }, svg);
    const tip = document.createElement('div'); tip.className = 'tip'; wrap.appendChild(tip);
    function move(ev) {
      const r = svg.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width * W;
      const xv = Math.min(x1, Math.max(x0, x0 + (px - m.l) / iw * (x1 - x0)));
      const pts = o.series[0].pts;
      let lo = 0, hi = pts.length - 1;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (pts[mid][0] < xv) lo = mid; else hi = mid; }
      const i = Math.abs(pts[lo][0] - xv) < Math.abs(pts[hi][0] - xv) ? lo : hi;
      const X = sx(pts[i][0]);
      cross.setAttribute('x1', X); cross.setAttribute('x2', X); cross.setAttribute('visibility', 'visible');
      let rows = `<b>${o.xFmtTip(pts[i][0])}</b>`;
      o.series.forEach((s, k) => {
        const p = s.pts[i];
        dots[k].setAttribute('cx', X); dots[k].setAttribute('cy', sy(p[1])); dots[k].setAttribute('visibility', 'visible');
        rows += `<br><i style="background:${s.color}"></i>${s.name}: ${o.yFmtTip(p[1])}`;
      });
      tip.innerHTML = rows; tip.style.display = 'block';
      const left = X / W * r.width;
      tip.style.left = Math.min(r.width - tip.offsetWidth, Math.max(0, left + 12)) + 'px';
      tip.style.top = '8px';
    }
    function leave() { cross.setAttribute('visibility', 'hidden'); dots.forEach(d => d.setAttribute('visibility', 'hidden')); tip.style.display = 'none'; }
    hit.addEventListener('pointermove', move); hit.addEventListener('pointerleave', leave);
  }

  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const C = { s1: css('--s1'), s2: css('--s2'), s3: css('--s3') };
  const ms = t => (t * 1000).toFixed(0) + ' ms';
  const volts = v => v.toFixed(2) + ' V';

  // Part 1a: astable, R1 = 1k, R2 = 100k, C = 1uF
  (function () {
    const host = document.getElementById('chartAstable'); if (!host) return;
    const R1 = 1e3, R2 = 100e3, Cc = 1e-6, dt = 0.0005;
    let v = 0, out = 1; const vc = [], vo = [];
    for (let t = 0; t <= 0.5 + 1e-9; t += dt) {
      vc.push([t, v]); vo.push([t, out ? VCC : 0]);
      if (out) { v = VCC + (v - VCC) * Math.exp(-dt / ((R1 + R2) * Cc)); if (v >= HI) { v = HI; out = 0; } }
      else { v = v * Math.exp(-dt / (R2 * Cc)); if (v <= LO) { v = LO; out = 1; } }
    }
    lineChart(host, {
      aria: 'Astable 555: capacitor voltage ramps between 1.67 and 3.33 volts while the output square wave switches at 7.18 hertz',
      series: [{ name: 'Capacitor (pins 2, 6)', color: C.s1, pts: vc }, { name: 'Output (pin 3)', color: C.s2, pts: vo }],
      x: [0, 0.5], y: [0, 5.4], xTicks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], yTicks: [0, 1, 2, 3, 4, 5],
      xFmt: ms, yFmt: v => v + ' V', xFmtTip: ms, yFmtTip: volts, xLabel: 'time', yLabel: 'volts',
      refs: [{ y: HI, label: '⅔ VCC 3.33 V' }, { y: LO, label: '⅓ VCC 1.67 V' }]
    });
  })();

  // Part 1b: frequency vs pot, R2 = 1k + pot
  (function () {
    const host = document.getElementById('chartPot'); if (!host) return;
    const f = p => 1 / (Math.LN2 * (1e3 + 2 * (1e3 + p * 1e3)) * 1e-6);
    const pts = [];
    for (let p = 0; p <= 1000; p += 2) pts.push([p, f(p)]);
    lineChart(host, {
      aria: 'Clock frequency falls from about 480 hertz at 0 ohms to 0.72 hertz at 1 megaohm',
      log: true,
      series: [{ name: 'Clock frequency', color: C.s1, pts }],
      x: [0, 1000], y: [0.5, 1000], xTicks: [0, 200, 400, 600, 800, 1000], yTicks: [1, 10, 100, 1000],
      xFmt: v => v + ' kΩ', yFmt: v => v >= 1000 ? '1 kHz' : v + ' Hz',
      xFmtTip: v => 'Pot ' + v + ' kΩ', yFmtTip: v => v >= 100 ? v.toFixed(0) + ' Hz' : v.toFixed(2) + ' Hz',
      xLabel: 'potentiometer resistance', yLabel: 'frequency (log scale)',
      marks: [{ x: 0, y: f(0), label: '481 Hz' }, { x: 1000, y: f(1000), label: '0.72 Hz' }]
    });
  })();

  // Part 2: monostable, R = 1M, C = 0.1uF, bouncy button press at 40 ms
  (function () {
    const host = document.getElementById('chartMono'); if (!host) return;
    const tau = 1e6 * 0.1e-6, dt = 0.00025;
    const bounce = [[0.040, 0], [0.0412, 1], [0.0418, 0], [0.0431, 1], [0.0440, 0], [0.0452, 1], [0.0460, 0], [0.120, 1]];
    let trig = 1, v = 0, out = 0, bi = 0; const tr = [], vc = [], vo = [];
    for (let t = 0; t <= 0.25 + 1e-9; t += dt) {
      while (bi < bounce.length && t >= bounce[bi][0]) trig = bounce[bi++][1];
      if (!trig && !out) out = 1;
      if (out) { v = VCC + (v - VCC) * Math.exp(-dt / tau); if (v >= HI) { out = trig ? 0 : 1; if (!out) v = 0; else v = HI; } }
      tr.push([t, trig ? VCC : 0]); vc.push([t, v]); vo.push([t, out ? VCC : 0]);
    }
    lineChart(host, {
      aria: 'Monostable 555: the button bounces several times but the output gives a single 110 millisecond pulse',
      series: [{ name: 'Button (pin 2)', color: C.s3, pts: tr }, { name: 'Capacitor (pins 6, 7)', color: C.s1, pts: vc }, { name: 'Output (pin 3)', color: C.s2, pts: vo }],
      x: [0, 0.25], y: [0, 5.4], xTicks: [0, 0.05, 0.1, 0.15, 0.2, 0.25], yTicks: [0, 1, 2, 3, 4, 5],
      xFmt: ms, yFmt: v => v + ' V', xFmtTip: t => (t * 1000).toFixed(1) + ' ms', yFmtTip: volts,
      xLabel: 'time', yLabel: 'volts', refs: [{ y: HI, label: '⅔ VCC 3.33 V' }]
    });
  })();

  // ---------- PCB viewer ----------
  const BOARDS = [
    { label: 'Part 1a: Astable', file: 'hardware/tinkercad/part1a-astable.brd' },
    { label: 'Part 1b: Astable + pot', file: 'hardware/tinkercad/part1b-astable-pot.brd' },
    { label: 'Part 2: Monostable', file: 'hardware/tinkercad/part2-monostable.brd' },
    { label: 'Part 3: Clock select', file: 'hardware/tinkercad/part3-clock-select.brd' }
  ];
  const KIND = {
    'DIP826W53P254L959H508Q8B': '555 timer (DIP-8)', 'RESAD1016W63L850D250B': 'Resistor',
    'CAP-THRU-2.54MM': 'Ceramic capacitor', 'CAPPRD254W65D500H1150B': 'Electrolytic capacitor',
    'LEDRD254W60D565H860B': 'LED', 'LEDRD254W60D565H860B_Y': 'LED', 'HA-06-SM065': 'Potentiometer',
    'SWITCH-MOMENTARY-PTH-6.5MM': 'Push button', 'SWITCH-SPDT-PTH-8.5X3.7MM': 'SPDT switch',
    'BATTERY-GENERIC': '5 V supply'
  };
  const nice = v => ({ LM555_DIP: 'LM555', BATTERYGENERIC: '5 V', SWITCH_MOMENTARY: 'momentary', TOGGLE: 'toggle' }[v] ||
    v.replace(/^(\d+(?:\.\d+)?)u$/, '$1 µF').replace(/^(\d+)n$/, '$1 nF').replace(/^(\d+)k$/, '$1 kΩ').replace(/^(\d+)M$/, '$1 MΩ').replace(/^(\d+)$/, '$1 Ω'));

  const view = document.getElementById('pcbView'), tabs = document.getElementById('pcbTabs');
  if (!view) return;
  const cache = {};
  BOARDS.forEach((b, i) => {
    const bt = document.createElement('button'); bt.type = 'button'; bt.role = 'tab'; bt.textContent = b.label;
    bt.addEventListener('click', () => show(i)); tabs.appendChild(bt);
  });

  async function show(i) {
    [...tabs.children].forEach((b, k) => b.setAttribute('aria-selected', k === i));
    document.getElementById('pcbDownload').href = BOARDS[i].file;
    try {
      if (!cache[i]) {
        const txt = await (await fetch(BOARDS[i].file)).text();
        cache[i] = new DOMParser().parseFromString(txt, 'application/xml');
      }
      draw(cache[i]);
    } catch (e) {
      view.innerHTML = '<p style="padding:16px">Could not load the board file. Open this page from the website (not as a local file).</p>';
    }
  }

  function draw(doc) {
    view.innerHTML = '';
    const num = (n, a) => parseFloat(n.getAttribute(a) || 0);
    const outline = [...doc.querySelectorAll('plain > wire[layer="20"]')];
    const BW = Math.max(...outline.map(w => Math.max(num(w, 'x1'), num(w, 'x2'))));
    const BH = Math.max(...outline.map(w => Math.max(num(w, 'y1'), num(w, 'y2'))));
    const pad = 4, Y = y => BH - y;
    const svg = el('svg', { viewBox: `${-pad} ${-pad} ${BW + 2 * pad} ${BH + 2 * pad}`, role: 'img', 'aria-label': 'PCB layout' }, view);
    el('rect', { x: 0, y: 0, width: BW, height: BH, fill: 'none', stroke: 'var(--axis)', 'stroke-width': .3, rx: 1 }, svg);

    const pkgs = {};
    doc.querySelectorAll('packages > package').forEach(p => { pkgs[p.getAttribute('name')] = p; });
    const tip = document.createElement('div'); tip.className = 'tip'; view.appendChild(tip);
    const rows = [];

    doc.querySelectorAll('elements > element').forEach(e => {
      const name = e.getAttribute('name'), value = e.getAttribute('value'), pk = e.getAttribute('package');
      const ex = num(e, 'x'), ey = num(e, 'y');
      const rot = parseFloat((e.getAttribute('rot') || 'R0').replace(/[^\d.]/g, '')) * Math.PI / 180;
      const T = (x, y) => [ex + x * Math.cos(rot) - y * Math.sin(rot), Y(ey + x * Math.sin(rot) + y * Math.cos(rot))];
      const g = el('g', { class: 'part' }, svg);
      const pkg = pkgs[pk]; const xs = [], ys = [];
      if (pkg) {
        pkg.querySelectorAll('wire[layer="21"]').forEach(w => {
          const [a, b] = T(num(w, 'x1'), num(w, 'y1')), [c, d] = T(num(w, 'x2'), num(w, 'y2'));
          el('line', { x1: a, y1: b, x2: c, y2: d, stroke: 'var(--silk)', 'stroke-width': Math.max(.15, num(w, 'width')), 'stroke-linecap': 'round' }, g);
          xs.push(a, c); ys.push(b, d);
        });
        pkg.querySelectorAll('circle[layer="21"]').forEach(c => {
          const [a, b] = T(num(c, 'x'), num(c, 'y')); const r = num(c, 'radius');
          el('circle', { cx: a, cy: b, r, fill: num(c, 'width') ? 'none' : 'var(--silk)', stroke: 'var(--silk)', 'stroke-width': Math.max(.12, num(c, 'width')) }, g);
          xs.push(a - r, a + r); ys.push(b - r, b + r);
        });
        pkg.querySelectorAll('pad').forEach(p => {
          const [a, b] = T(num(p, 'x'), num(p, 'y'));
          el('circle', { cx: a, cy: b, r: num(p, 'diameter') / 2, fill: 'var(--copper)' }, g);
          el('circle', { cx: a, cy: b, r: num(p, 'drill') / 2, fill: 'var(--board)' }, g);
          xs.push(a); ys.push(b);
        });
      }
      if (xs.length) {
        const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
        el('rect', { class: 'body', x: x0 - .8, y: y0 - .8, width: x1 - x0 + 1.6, height: y1 - y0 + 1.6, rx: .8, fill: 'transparent', stroke: 'none' }, g);
        const t = el('text', { x: (x0 + x1) / 2, y: y0 - 1.3, 'text-anchor': 'middle', 'font-size': 2 }, g);
        t.textContent = name;
      }
      const kind = KIND[pk] || pk;
      g.addEventListener('pointermove', ev => {
        const r = view.getBoundingClientRect();
        tip.innerHTML = `<b>${name}</b><br>${kind}<br>${nice(value)}`;
        tip.style.display = 'block';
        tip.style.left = Math.min(r.width - tip.offsetWidth, ev.clientX - r.left + 14) + 'px';
        tip.style.top = Math.max(0, ev.clientY - r.top - 10) + 'px';
      });
      g.addEventListener('pointerleave', () => { tip.style.display = 'none'; });
      rows.push([name, kind, nice(value)]);
    });

    // airwires: unrouted connections between pads
    doc.querySelectorAll('signals > signal > wire[layer="19"]').forEach(w => {
      el('line', { x1: num(w, 'x1'), y1: Y(num(w, 'y1')), x2: num(w, 'x2'), y2: Y(num(w, 'y2')), stroke: 'var(--air)', 'stroke-width': .25, 'stroke-dasharray': '.8 .6', 'pointer-events': 'none' }, svg);
    });

    rows.sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));
    document.getElementById('pcbParts').innerHTML = '<tr><th>Ref</th><th>Part</th><th>Value</th></tr>' +
      rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
  }
  show(0);
})();
