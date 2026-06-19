/* ============================================================
   CARBONPILOT — Application Logic (v2 — Fully Reactive)
   ============================================================ */

/* ---------- State ---------- */
const DEFAULT_STATE = {
  assess: { household: 2, electricity: 50, heating: 'gas' },
  sim:    { tr: 1, ca: 5, mf: 1, fw: 10, el: 0, fl: 2 },
  actions:{ bus: true, meatfree: true, standby: false, showers: false }
};

let appState;
try {
  appState = JSON.parse(localStorage.getItem('cp-state')) || DEFAULT_STATE;
  // ensure all keys exist (handle stale saved state)
  appState.assess  = Object.assign({}, DEFAULT_STATE.assess,  appState.assess);
  appState.sim     = Object.assign({}, DEFAULT_STATE.sim,     appState.sim);
  appState.actions = Object.assign({}, DEFAULT_STATE.actions, appState.actions);
} catch (e) {
  appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveState() {
  try { localStorage.setItem('cp-state', JSON.stringify(appState)); } catch(e) {}
}

/* ---------- Computed Data ---------- */
let categories    = [];
let totalFootprint = 6200;

function recalcCategories() {
  const eKg      = appState.assess.electricity * 12 * 3;
  const heatingMap = { gas: 1000, heatpump: 200, solar: 50, oil: 1500 };
  const hKg      = (heatingMap[appState.assess.heating] || 1000) / Math.max(1, appState.assess.household);
  const homeTotal = Math.round(eKg + hKg);
  const tTotal = 2542, fTotal = 1488, sTotal = 620, wTotal = 372;
  totalFootprint = tTotal + fTotal + homeTotal + sTotal + wTotal;

  categories = [
    { label:'Transport', color:'#1C1C1E', kg: tTotal },
    { label:'Food',      color:'#E85D4E', kg: fTotal },
    { label:'Home',      color:'#007AFF', kg: homeTotal },
    { label:'Shopping',  color:'#FF9500', kg: sTotal },
    { label:'Waste',     color:'#8E8E93', kg: wTotal }
  ].map(c => ({ ...c, pct: Math.round(c.kg / totalFootprint * 100) }));
}

/* ---------- Theme ---------- */
function initTheme() {
  const saved      = localStorage.getItem('cp-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(saved || (prefersDark ? 'dark' : 'light'));
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('cp-theme', theme);
  const sun  = document.getElementById('theme-icon-sun');
  const moon = document.getElementById('theme-icon-moon');
  if (sun)  sun.style.display  = theme === 'dark' ? 'block' : 'none';
  if (moon) moon.style.display = theme === 'dark' ? 'none'  : 'block';
  updateChartColors();
}

function toggleTheme() {
  setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

/* ---------- Routing ---------- */
function go(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + id);
  if (target) { target.classList.add('active'); setTimeout(observeReveals, 60); }

  ['sidebar-nav a', '.topbar-nav button', '.mobile-nav-item'].forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.classList.toggle('active', el.dataset.page === id);
    });
  });

  const main = document.querySelector('.main');
  if (main) main.scrollTop = 0;
  window.scrollTo(0, 0);
}

/* ---------- Animations ---------- */
function observeReveals() {
  const reveals = document.querySelectorAll('.page.active .reveal');
  reveals.forEach(el => el.classList.remove('visible'));
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  reveals.forEach(el => obs.observe(el));
}

/* ---------- UI Helpers ---------- */
function pickChip(el) {
  const group = el.closest('.chip-group');
  if (!group) return;
  group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

function toggleAction(el, actionId) {
  el.classList.toggle('done');
  el.innerHTML = el.classList.contains('done') ? '<svg width="14" height="14"><use href="#i-check"/></svg>' : '';
  if (actionId) {
    appState.actions[actionId] = el.classList.contains('done');
    saveState();
    renderProgress();
  }
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/* ---------- Charts ---------- */
Chart.defaults.font.family = "'Inter', sans-serif";
const charts = {};

function getChartColors() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    text: dark ? '#A1A1A6' : '#6E6E73',
    grid: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    bg:   dark ? '#1C1C1E' : '#FFFFFF',
    ttBg: dark ? '#2C2C2E' : '#FFFFFF',
    ttTi: dark ? '#FFFFFF' : '#1C1C1E',
    ttBo: dark ? '#A1A1A6' : '#6E6E73',
    ttBr: dark ? '#38383A' : '#E8E8ED'
  };
}

function tooltipDefaults(c) {
  return {
    backgroundColor: c.ttBg, titleColor: c.ttTi,
    bodyColor: c.ttBo, borderColor: c.ttBr,
    borderWidth: 1, padding: 14, cornerRadius: 14
  };
}

function updateChartColors() {
  const c = getChartColors();
  Chart.defaults.color       = c.text;
  Chart.defaults.borderColor = c.grid;
  Object.values(charts).forEach(ch => {
    if (!ch) return;
    if (ch.options.scales?.x) ch.options.scales.x.grid.color = c.grid;
    if (ch.options.scales?.y) ch.options.scales.y.grid.color = c.grid;
    Object.assign(ch.options.plugins.tooltip, tooltipDefaults(c));
    ch.update();
  });
}

function initCharts() {
  const c = getChartColors();

  // Donut chart
  const donutCtx = document.getElementById('chartDonut');
  if (donutCtx && !charts.donut) {
    charts.donut = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: categories.map(x => x.label),
        datasets: [{ data: categories.map(x => x.pct), backgroundColor: categories.map(x => x.color), borderWidth: 2, borderColor: c.bg, hoverOffset: 10 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '72%',
        plugins: { legend: { display: false }, tooltip: { ...tooltipDefaults(c), displayColors: true, callbacks: { label: ctx => ' ' + ctx.label + ': ' + ctx.raw + '%' } } }
      }
    });
  }

  // Trend chart
  const trendCtx = document.getElementById('chartTrend');
  if (trendCtx && !charts.trend) {
    charts.trend = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun'],
        datasets: [{ label:'kg CO₂', data:[580,560,545,530,517,517], borderColor:'#E85D4E', backgroundColor:'rgba(232,93,78,0.06)', tension:0.4, fill:true, pointBackgroundColor:'#E85D4E', pointBorderColor:c.bg, pointBorderWidth:2, pointRadius:5, pointHoverRadius:7 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { x: { ticks:{font:{size:12}}, grid:{display:false} }, y: { ticks:{font:{size:12}, callback: v => v+' kg'}, grid:{color:c.grid} } },
        plugins: { legend:{display:false}, tooltip: tooltipDefaults(c) }
      }
    });
  }

  // Weekly chart
  const weeklyCtx = document.getElementById('chartWeekly');
  if (weeklyCtx && !charts.weekly) {
    charts.weekly = new Chart(weeklyCtx, {
      type: 'bar',
      data: {
        labels: ['Wk 1','Wk 2','Wk 3','Wk 4'],
        datasets: [{ data:[12,9,22,28], backgroundColor:'#E85D4E', borderRadius:8, barThickness:32 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { x: { ticks:{font:{size:12}}, grid:{display:false} }, y: { ticks:{font:{size:12}, callback: v => v+' kg'}, grid:{color:c.grid} } },
        plugins: { legend:{display:false}, tooltip: tooltipDefaults(c) }
      }
    });
  }
}

/* ---------- Render Functions ---------- */
function renderDashboard() {
  const eco = Math.max(0, Math.min(100, Math.round(68 + ((6200 - totalFootprint) / 6200) * 60)));
  const monthly = Math.round(totalFootprint / 12);
  const maxCat  = categories.reduce((a,b) => b.kg > a.kg ? b : a, categories[0]);
  const target  = 450;
  const pctGoal = Math.min(100, Math.round((target / monthly) * 100));

  // Sidebar score
  const sideScore = document.getElementById('sidebar-eco-score');
  if (sideScore) sideScore.textContent = eco;

  // Dashboard stat cards
  const dashScore = document.getElementById('dash-eco-score');
  if (dashScore) dashScore.innerHTML = `${eco}<span style="font-size:22px;font-weight:500;color:var(--text-3);margin-left:6px">/ 100</span>`;

  const vals = document.querySelectorAll('#page-dash .stat-value');
  if (vals[1]) vals[1].innerHTML = (totalFootprint/1000).toFixed(1)+' t';
  if (vals[2]) vals[2].innerHTML = monthly + ' kg';
  if (vals[3]) vals[3].innerHTML = maxCat.label;
  const deltas = document.querySelectorAll('#page-dash .stat-delta');
  if (deltas[3]) deltas[3].innerHTML = maxCat.pct + '% of total';

  // Subtitle
  const sub = document.querySelector('#page-dash .page-subtitle');
  if (sub) sub.innerHTML = `Your complete carbon footprint overview. June 2026 &middot; Household of ${appState.assess.household}.`;

  // Category bars
  const catBarsEl = document.getElementById('catBars');
  if (catBarsEl) {
    catBarsEl.innerHTML = '';
    categories.forEach(c => {
      const div = document.createElement('div');
      div.style.marginBottom = '18px';
      div.innerHTML = `<div class="flex justify-between" style="margin-bottom:8px;font-size:14px"><span style="font-weight:600;color:var(--text)">${c.label}</span><span style="font-weight:700;color:${c.color}">${c.pct}% &middot; ${c.kg} kg</span></div><div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100, c.pct*2)}%;background:${c.color}"></div></div>`;
      catBarsEl.appendChild(div);
    });
  }

  // Donut chart
  if (charts.donut) {
    charts.donut.data.labels = categories.map(c => c.label);
    charts.donut.data.datasets[0].data = categories.map(c => c.pct);
    charts.donut.data.datasets[0].backgroundColor = categories.map(c => c.color);
    charts.donut.update();
  }
  const legend = document.getElementById('donutLegend');
  if (legend) {
    legend.innerHTML = '';
    categories.forEach(c => {
      const s = document.createElement('span');
      s.style.cssText = 'display:flex;align-items:center;gap:8px';
      s.innerHTML = `<span style="width:12px;height:12px;border-radius:4px;background:${c.color};display:inline-block"></span>${c.label} ${c.pct}%`;
      legend.appendChild(s);
    });
  }
}

function renderCoach() {
  const el1 = document.getElementById('coach-profile');
  const el2 = document.getElementById('coach-footprint');
  const heatingLabel = { gas:'gas boiler', heatpump:'heat pump', solar:'solar', oil:'oil' }[appState.assess.heating] || 'gas';
  if (el1) el1.textContent = `${appState.assess.household} people · ${heatingLabel} · avg consumer`;
  if (el2) el2.textContent = `${(totalFootprint/1000).toFixed(1)} t CO₂/year`;
}

function renderProgress() {
  const doneIds  = Object.keys(appState.actions).filter(k => appState.actions[k]);
  const doneCt   = doneIds.length;
  const totalAct = Object.keys(appState.actions).length;
  const savings  = { bus:132, meatfree:264, standby:52, showers:36 };
  const totalSaved = doneIds.reduce((sum, k) => sum + (savings[k] || 0), 0);
  const target   = 450;
  const monthly  = Math.round(totalFootprint / 12);
  const goalPct  = Math.min(100, Math.round((totalSaved / Math.max(1, monthly - target + totalSaved)) * 100));

  const v = document.querySelectorAll('#page-track .stat-value');
  if (v[0]) v[0].innerHTML = totalSaved + ' kg';
  if (v[2]) v[2].innerHTML = doneCt + ' / ' + totalAct;
  if (v[3]) v[3].innerHTML = Math.max(0, goalPct) + '%';

  // Monthly goal section
  const goalSpans = document.querySelectorAll('#page-track .card .flex.justify-between span');
  if (goalSpans[0]) goalSpans[0].textContent = monthly + ' kg now';

  const fill = document.querySelector('#page-track .progress-fill');
  if (fill) fill.style.width = goalPct + '%';

  const goalNote = document.querySelector('#page-track .card div[style*="margin-top:16px"]');
  const diff = monthly - target;
  if (goalNote) goalNote.textContent = diff > 0 ? `${diff} kg to go — keep it up!` : 'Target reached! 🎉';

  // Tree banner
  const treeBanner = document.querySelector('#page-track .tree-banner');
  if (treeBanner) {
    const trees = Math.max(0, (totalSaved / 21.8).toFixed(1));
    treeBanner.innerHTML = `<div style="font-size:18px;color:var(--accent);font-weight:700;margin-bottom:16px">Your ${totalSaved} kg saved equals</div><div style="font-size:52px;font-weight:800;color:var(--accent);letter-spacing:-2px">${trees} trees</div><div style="font-size:16px;color:var(--text-3)">planted and growing for one year</div>`;
  }
}

function renderAssessForm() {
  const hh = document.getElementById('assess-household');
  const el = document.getElementById('assess-electricity');
  const chips = document.querySelectorAll('#assess-heating .chip');

  if (hh) hh.value = appState.assess.household;
  if (el) el.value = appState.assess.electricity;
  if (chips.length) {
    chips.forEach(c => c.classList.remove('active'));
    const active = Array.from(chips).find(c => c.dataset.val === appState.assess.heating);
    if (active) active.classList.add('active');
  }
}

function renderActions() {
  Object.keys(appState.actions).forEach(id => {
    const el = document.querySelector(`.action-check[data-id="${id}"]`);
    if (!el) return;
    const done = appState.actions[id];
    el.classList.toggle('done', done);
    el.innerHTML = done ? '<svg width="14" height="14"><use href="#i-check"/></svg>' : '';
  });
}

/* ---------- Assessment Save ---------- */
function saveAssessment() {
  const hh   = document.getElementById('assess-household');
  const el   = document.getElementById('assess-electricity');
  const chip = document.querySelector('#assess-heating .chip.active');
  if (hh) appState.assess.household    = Number(hh.value);
  if (el) appState.assess.electricity  = Number(el.value);
  if (chip) appState.assess.heating    = chip.dataset.val || 'gas';
  saveState();
  updateAll();
  go('dash');
}

/* ---------- Simulator ---------- */
let simChart = null;
const simColors = ['#1C1C1E','#E85D4E','#007AFF','#FF9500','#8E8E93'];
const simLabels = ['Transport','Food','Home','Shopping','Waste'];

function updateSim() {
  const ids = ['sim-tr','sim-ca','sim-mf','sim-fw','sim-el','sim-fl'];
  const els = ids.map(id => document.getElementById(id));
  if (!els[0]) return; // sim page not loaded yet

  const [tr,ca,mf,fw,el,fl] = els.map(e => +e.value);
  appState.sim = { tr, ca, mf, fw, el, fl };
  saveState();

  document.getElementById('val-tr').textContent = tr;
  document.getElementById('val-ca').textContent = ca;
  document.getElementById('val-mf').textContent = mf;
  document.getElementById('val-fw').textContent = fw + '%';
  document.getElementById('val-el').textContent = el + '%';
  document.getElementById('val-fl').textContent = fl;

  const tSv  = Math.round((5 - ca) * 132 + (tr - 1) * 66);
  const fSv  = Math.round(mf * 132 + (fw / 100) * categories[1].kg * 0.3);
  const hSv  = Math.round((el / 100) * categories[2].kg);
  const flSv = Math.round((2 - fl) * 200);

  const nT  = Math.max(0, categories[0].kg - tSv);
  const nF  = Math.max(0, categories[1].kg - fSv);
  const nH  = Math.max(0, categories[2].kg - hSv);
  const nFl = Math.max(0, 400 - flSv);
  const newTot = nT + nF + nH + categories[3].kg + categories[4].kg + nFl;
  const saved  = totalFootprint - newTot;
  const pct    = Math.round((saved / totalFootprint) * 100);
  const newSc  = Math.min(100, Math.round(68 + pct * 0.6));
  const trees  = Math.max(0, Math.round(saved / 21.8));

  document.getElementById('sim-score').textContent = newSc;
  document.getElementById('sim-total').textContent = (newTot/1000).toFixed(1)+' t';
  document.getElementById('sim-delta').textContent = (saved > 0 ? '−' : '+') + Math.abs(Math.round(saved)) + ' kg CO₂/yr';
  document.getElementById('sim-pct').textContent   = saved > 0 ? pct+'% reduction from baseline' : 'Move sliders to see impact';
  document.getElementById('sim-trees').textContent = trees;
  document.getElementById('sim-trees-label').textContent = trees === 1 ? 'tree planted for a year' : 'trees planted for a year';

  const dd  = [nT, nF, nH, categories[3].kg, categories[4].kg];
  const leg = document.getElementById('simLegend');
  if (leg) {
    leg.innerHTML = simLabels.map((l, i) =>
      `<span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:3px;background:${simColors[i]};display:inline-block"></span>${l}</span>`
    ).join('');
  }

  const c = getChartColors();
  if (simChart) {
    simChart.data.datasets[0].data = dd;
    simChart.update('none');
  } else {
    const simCtx = document.getElementById('chartSimDonut');
    if (simCtx) {
      simChart = new Chart(simCtx, {
        type: 'doughnut',
        data: { labels: simLabels, datasets: [{ data: dd, backgroundColor: simColors, borderWidth: 2, borderColor: c.bg }] },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '68%',
          plugins: { legend:{display:false}, tooltip: tooltipDefaults(c) }
        }
      });
    }
  }
}

function resetSim() {
  const defaults = [1,5,1,10,0,2];
  ['sim-tr','sim-ca','sim-mf','sim-fw','sim-el','sim-fl'].forEach((id,i) => {
    const el = document.getElementById(id);
    if (el) el.value = defaults[i];
  });
  updateSim();
}

function restoreSimSliders() {
  const s = appState.sim;
  const map = { 'sim-tr': s.tr, 'sim-ca': s.ca, 'sim-mf': s.mf, 'sim-fw': s.fw, 'sim-el': s.el, 'sim-fl': s.fl };
  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });
  updateSim();
}

/* ---------- AI Coach ---------- */
const aiResponses = {
  transport: "Your commute is the core driver. Driving solo produces 1.8 kg CO₂ per trip — the Tube emits just 0.05 kg for the same journey. That's a 36× difference. Three swaps a week = 396 kg saved annually.",
  target:    "To hit your 450 kg/month target, your #1 action (3 bus days/wk) saves 33 kg/month alone. Add 2 meat-free days = 22 kg more. That's 55 kg — nearly there from two low-effort changes.",
  vegan:     "You're flexitarian, which is a big win. Going fully vegan saves ~580 kg/yr more. But two extra meat-free days/week gets you 45% of the full vegan benefit with far less commitment.",
  paris:     "Return flight London–Paris emits ~180 kg CO₂ per person. The Eurostar emits ~6 kg return — 30× less. For any trip under ~800 km, train wins on every metric.",
  home:      "Home energy is a huge lever. Switching to a heat pump can cut your home emissions by up to 80%. Even switching to a green energy tariff removes ~210 kg/yr instantly.",
  food:      "Food accounts for about 24% of your footprint. Reducing meat, especially beef, is the single biggest dietary change — beef produces 60× more emissions than vegetables per gram of protein.",
  default:   "Based on your profile, transport is your highest leverage point. Even small changes there outweigh most other actions. Try asking: 'Why is my transport footprint so high?' or 'How do I hit my target?'"
};

function getResponse(q) {
  q = q.toLowerCase();
  if (q.match(/transport|car|commut|driv|bus|tube/)) return aiResponses.transport;
  if (q.match(/target|goal|hit|450|reduc/))          return aiResponses.target;
  if (q.match(/vegan|vegetarian|meat|flexitarian/))   return aiResponses.vegan;
  if (q.match(/paris|train|flight|fly|eurostar/))     return aiResponses.paris;
  if (q.match(/home|energy|electric|heating|boiler/)) return aiResponses.home;
  if (q.match(/food|diet|eat|cook/))                  return aiResponses.food;
  return aiResponses.default;
}

function sendChat() {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const q = input.value.trim();
  if (!q) return;
  const box = document.getElementById('chatBox');
  box.innerHTML += `<div class="chat-bubble user">${escapeHtml(q)}</div>`;
  input.value = '';
  box.scrollTop = box.scrollHeight;
  setTimeout(() => {
    box.innerHTML += `<div class="chat-bubble ai">${getResponse(q)}</div>`;
    box.scrollTop = box.scrollHeight;
  }, 700);
}

function quickChat(q) {
  const input = document.getElementById('chatInput');
  if (input) input.value = q;
  sendChat();
}

/* ---------- Master Update ---------- */
function updateAll() {
  recalcCategories();
  renderDashboard();
  renderCoach();
  renderProgress();
  updateSim();
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  recalcCategories();
  initCharts();
  renderAssessForm();
  renderActions();
  updateAll();
  restoreSimSliders();
  go('dash');
  observeReveals();
});
