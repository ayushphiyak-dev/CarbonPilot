/* ============================================================
   CARBONPILOT — Application Logic
   ============================================================ */

/* ---------- Theme ---------- */
function initTheme() {
  const saved = localStorage.getItem('cp-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  setTheme(theme);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('cp-theme', theme);
  const sun = document.getElementById('theme-icon-sun');
  const moon = document.getElementById('theme-icon-moon');
  if (sun && moon) {
    sun.style.display = theme === 'dark' ? 'block' : 'none';
    moon.style.display = theme === 'dark' ? 'none' : 'block';
  }
  updateChartColors();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  setTheme(current === 'light' ? 'dark' : 'light');
}

/* ---------- Routing ---------- */
function go(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + id);
  if (target) { target.classList.add('active'); setTimeout(() => observeReveals(), 50); }

  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    a.classList.remove('active');
    if (a.dataset.page === id) a.classList.add('active');
  });
  document.querySelectorAll('.topbar-nav button').forEach(b => {
    b.classList.remove('active');
    if (b.dataset.page === id) b.classList.add('active');
  });
  document.querySelectorAll('.mobile-nav-item').forEach(b => {
    b.classList.remove('active');
    if (b.dataset.page === id) b.classList.add('active');
  });

  const main = document.querySelector('.main');
  if (main) main.scrollTop = 0;
  window.scrollTo(0, 0);
}

/* ---------- Animations ---------- */
function observeReveals() {
  const reveals = document.querySelectorAll('.page.active .reveal');
  reveals.forEach(el => el.classList.remove('visible'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  reveals.forEach(el => observer.observe(el));
}

/* ---------- UI Helpers ---------- */
function pickChip(el) {
  const group = el.closest('.chip-group');
  if (!group) return;
  group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

function toggleAction(el) {
  el.classList.toggle('done');
  el.innerHTML = el.classList.contains('done') ? '<svg width="14" height="14"><use href="#i-check"/></svg>' : '';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ---------- Charts ---------- */
Chart.defaults.font.family = "'Inter', sans-serif";
let charts = {};

function getChartColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    text: isDark ? '#A1A1A6' : '#6E6E73',
    grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    bg: isDark ? '#1C1C1E' : '#FFFFFF'
  };
}

function updateChartColors() {
  const c = getChartColors();
  Chart.defaults.color = c.text;
  Chart.defaults.borderColor = c.grid;
  Object.values(charts).forEach(chart => {
    if (!chart) return;
    if (chart.options.scales.x) chart.options.scales.x.grid.color = c.grid;
    if (chart.options.scales.y) chart.options.scales.y.grid.color = c.grid;
    const tooltipBg = c.bg === '#1C1C1E' ? '#2C2C2E' : '#FFFFFF';
    const tooltipTitle = c.bg === '#1C1C1E' ? '#FFFFFF' : '#1C1C1E';
    const tooltipBody = c.bg === '#1C1C1E' ? '#A1A1A6' : '#6E6E73';
    const tooltipBorder = c.bg === '#1C1C1E' ? '#38383A' : '#E8E8ED';
    chart.options.plugins.tooltip.backgroundColor = tooltipBg;
    chart.options.plugins.tooltip.titleColor = tooltipTitle;
    chart.options.plugins.tooltip.bodyColor = tooltipBody;
    chart.options.plugins.tooltip.borderColor = tooltipBorder;
    chart.update();
  });
}

const categories = [
  { label: 'Transport', pct: 41, color: '#1C1C1E', kg: 2542 },
  { label: 'Food', pct: 24, color: '#E85D4E', kg: 1488 },
  { label: 'Home', pct: 19, color: '#007AFF', kg: 1178 },
  { label: 'Shopping', pct: 10, color: '#FF9500', kg: 620 },
  { label: 'Waste', pct: 6, color: '#8E8E93', kg: 372 }
];

/* Category bars */
const catBarsEl = document.getElementById('catBars');
if (catBarsEl) {
  categories.forEach(c => {
    const div = document.createElement('div');
    div.style.marginBottom = '18px';
    div.innerHTML = '<div class="flex justify-between" style="margin-bottom:8px;font-size:14px"><span style="font-weight:600;color:var(--text)">' + c.label + '</span><span style="font-weight:700;color:' + c.color + '">' + c.pct + '% &middot; ' + c.kg + ' kg</span></div><div class="progress-bar"><div class="progress-fill" style="width:' + (c.pct * 2) + '%;background:' + c.color + '"></div></div>';
    catBarsEl.appendChild(div);
  });
}

/* Donut chart */
const donutCtx = document.getElementById('chartDonut');
if (donutCtx) {
  const c = getChartColors();
  charts.donut = new Chart(donutCtx, {
    type: 'doughnut',
    data: {
      labels: categories.map(c => c.label),
      datasets: [{
        data: categories.map(c => c.pct),
        backgroundColor: categories.map(c => c.color),
        borderWidth: 2,
        borderColor: c.bg,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: c.bg === '#1C1C1E' ? '#2C2C2E' : '#FFFFFF',
          titleColor: c.bg === '#1C1C1E' ? '#FFFFFF' : '#1C1C1E',
          bodyColor: c.bg === '#1C1C1E' ? '#A1A1A6' : '#6E6E73',
          borderColor: c.bg === '#1C1C1E' ? '#38383A' : '#E8E8ED',
          borderWidth: 1,
          padding: 14,
          cornerRadius: 14,
          displayColors: true,
          callbacks: { label: (ctx) => ' ' + ctx.label + ': ' + ctx.raw + '%' }
        }
      }
    }
  });

  const legend = document.getElementById('donutLegend');
  if (legend) {
    categories.forEach(c => {
      const span = document.createElement('span');
      span.style.display = 'flex';
      span.style.alignItems = 'center';
      span.style.gap = '8px';
      span.innerHTML = '<span style="width:12px;height:12px;border-radius:4px;background:' + c.color + ';display:inline-block"></span>' + c.label + ' ' + c.pct + '%';
      legend.appendChild(span);
    });
  }
}

/* Trend chart */
const trendCtx = document.getElementById('chartTrend');
if (trendCtx) {
  const c = getChartColors();
  charts.trend = new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'kg CO₂',
        data: [580, 560, 545, 530, 517, 517],
        borderColor: '#E85D4E',
        backgroundColor: 'rgba(232,93,78,0.06)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#E85D4E',
        pointBorderColor: c.bg,
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { font: { size: 12 } }, grid: { display: false } },
        y: { ticks: { font: { size: 12 }, callback: v => v + ' kg' }, grid: { color: c.grid } }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: c.bg === '#1C1C1E' ? '#2C2C2E' : '#FFFFFF',
          titleColor: c.bg === '#1C1C1E' ? '#FFFFFF' : '#1C1C1E',
          bodyColor: c.bg === '#1C1C1E' ? '#A1A1A6' : '#6E6E73',
          borderColor: c.bg === '#1C1C1E' ? '#38383A' : '#E8E8ED',
          borderWidth: 1,
          padding: 14,
          cornerRadius: 14
        }
      }
    }
  });
}

/* Weekly chart */
const weeklyCtx = document.getElementById('chartWeekly');
if (weeklyCtx) {
  const c = getChartColors();
  charts.weekly = new Chart(weeklyCtx, {
    type: 'bar',
    data: {
      labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
      datasets: [{
        data: [12, 9, 22, 28],
        backgroundColor: '#E85D4E',
        borderRadius: 8,
        barThickness: 32
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { font: { size: 12 } }, grid: { display: false } },
        y: { ticks: { font: { size: 12 }, callback: v => v + ' kg' }, grid: { color: c.grid } }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: c.bg === '#1C1C1E' ? '#2C2C2E' : '#FFFFFF',
          titleColor: c.bg === '#1C1C1E' ? '#FFFFFF' : '#1C1C1E',
          bodyColor: c.bg === '#1C1C1E' ? '#A1A1A6' : '#6E6E73',
          borderColor: c.bg === '#1C1C1E' ? '#38383A' : '#E8E8ED',
          borderWidth: 1,
          padding: 14,
          cornerRadius: 14
        }
      }
    }
  });
}

/* ---------- Simulator ---------- */
let simChart = null;
const simColors = ['#1C1C1E', '#E85D4E', '#007AFF', '#FF9500', '#8E8E93'];
const simLabels = ['Transport', 'Food', 'Home', 'Shopping', 'Waste'];

function updateSim() {
  const tr = +document.getElementById('sim-tr').value;
  const ca = +document.getElementById('sim-ca').value;
  const mf = +document.getElementById('sim-mf').value;
  const fw = +document.getElementById('sim-fw').value;
  const el = +document.getElementById('sim-el').value;
  const fl = +document.getElementById('sim-fl').value;

  document.getElementById('val-tr').textContent = tr;
  document.getElementById('val-ca').textContent = ca;
  document.getElementById('val-mf').textContent = mf;
  document.getElementById('val-fw').textContent = fw + '%';
  document.getElementById('val-el').textContent = el + '%';
  document.getElementById('val-fl').textContent = fl;

  const tSv = Math.round((5 - ca) * 132 + (tr - 1) * 66);
  const fSv = Math.round(mf * 132 + (fw / 100) * 1488 * 0.3);
  const hSv = Math.round((el / 100) * 1178);
  const flSv = Math.round((2 - fl) * 200);

  const nT = Math.max(0, 2542 - tSv);
  const nF = Math.max(0, 1488 - fSv);
  const nH = Math.max(0, 1178 - hSv);
  const nFl = Math.max(0, 400 - flSv);

  const newTot = nT + nF + nH + 620 + 372 + nFl;
  const saved = 6200 - newTot;
  const pct = Math.round((saved / 6200) * 100);
  const newSc = Math.min(100, Math.round(68 + pct * 0.6));
  const trees = Math.max(0, Math.round(saved / 21.8));

  document.getElementById('sim-score').textContent = newSc;
  document.getElementById('sim-total').textContent = (newTot / 1000).toFixed(1) + ' t';
  document.getElementById('sim-delta').textContent = (saved > 0 ? '−' : '') + Math.abs(Math.round(saved)) + ' kg CO₂/yr';
  document.getElementById('sim-pct').textContent = saved > 0 ? pct + '% reduction from baseline' : 'Move sliders to see impact';
  document.getElementById('sim-trees').textContent = trees;
  document.getElementById('sim-trees-label').textContent = trees === 1 ? 'tree planted for a year' : 'trees planted for a year';

  const dd = [nT, nF, nH, 620, 372];
  const leg = document.getElementById('simLegend');
  if (leg) {
    leg.innerHTML = simLabels.map((l, i) =>
      '<span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:3px;background:' + simColors[i] + ';display:inline-block"></span>' + l + '</span>'
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
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: c.bg === '#1C1C1E' ? '#2C2C2E' : '#FFFFFF',
              titleColor: c.bg === '#1C1C1E' ? '#FFFFFF' : '#1C1C1E',
              bodyColor: c.bg === '#1C1C1E' ? '#A1A1A6' : '#6E6E73',
              borderColor: c.bg === '#1C1C1E' ? '#38383A' : '#E8E8ED',
              borderWidth: 1,
              padding: 14,
              cornerRadius: 14
            }
          }
        }
      });
    }
  }
}

function resetSim() {
  ['sim-tr', 'sim-ca', 'sim-mf', 'sim-fw', 'sim-el', 'sim-fl'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.value = [1, 5, 1, 10, 0, 2][i];
  });
  updateSim();
}
updateSim();

/* ---------- AI Coach ---------- */
const aiResponses = {
  transport: "Your commute is the core driver. Driving solo produces 1.8 kg CO₂ per trip — the Tube emits just 0.05 kg for the same journey. That's a 36× difference. Three swaps a week = 396 kg saved annually, outweighing almost every other change you could make.",
  target: "To drop from 517 kg to 450 kg/month you need 67 kg more savings. Your #1 action (3 bus days/wk) saves 33 kg/month alone. Add 2 meat-free days = 22 kg more. That's 55 kg — nearly there, from two low-effort changes.",
  vegan: "You're already flexitarian, which is a big win. Going fully vegan saves around 580 kg/yr more. But going from flexitarian to vegetarian saves ~390 kg. The biggest jump is actually from meat-heavy to flexitarian — which you've already done. Two extra meat-free days/week gets you 45% of the full vegan benefit with far less commitment.",
  paris: "Return flight London–Paris emits ~180 kg CO₂ per person. The Eurostar emits ~6 kg return — 30× less. And door-to-door, Eurostar is often faster than flying once you account for airports. For any European trip under ~800 km, train wins on every metric.",
  default: "Based on your 6.2 t/yr profile, transport is your highest leverage point. Even small changes there outweigh most other actions. Want me to walk through a personalised 30-day plan?"
};

function getResponse(q) {
  q = q.toLowerCase();
  if (q.includes('transport') || q.includes('car') || q.includes('commut') || q.includes('high')) return aiResponses.transport;
  if (q.includes('target') || q.includes('450') || q.includes('goal') || q.includes('hit')) return aiResponses.target;
  if (q.includes('vegan') || q.includes('worth')) return aiResponses.vegan;
  if (q.includes('paris') || q.includes('train') || q.includes('fly')) return aiResponses.paris;
  return aiResponses.default;
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const q = input.value.trim();
  if (!q) return;
  const box = document.getElementById('chatBox');
  box.innerHTML += '<div class="chat-bubble user">' + escapeHtml(q) + '</div>';
  input.value = '';
  box.scrollTop = box.scrollHeight;
  setTimeout(() => {
    box.innerHTML += '<div class="chat-bubble ai">' + getResponse(q) + '</div>';
    box.scrollTop = box.scrollHeight;
  }, 700);
}

function quickChat(q) {
  document.getElementById('chatInput').value = q;
  sendChat();
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  go('dash');
  observeReveals();
});
