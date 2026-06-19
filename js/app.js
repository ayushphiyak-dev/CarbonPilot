/* ============================================================
   CARBONPILOT — Application Logic
   ============================================================ */

// ─── Navigation ───
const pages = ['assess', 'dash', 'nba', 'sim', 'coach', 'track'];

function navTo(id) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Show target page
  const target = document.getElementById('page-' + id);
  if (target) target.classList.add('active');

  // Update sidebar nav
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    a.classList.remove('active');
    if (a.dataset.page === id) a.classList.add('active');
  });

  // Update topbar nav
  document.querySelectorAll('.topbar-nav button').forEach(b => {
    b.classList.remove('active');
    if (b.dataset.page === id) b.classList.add('active');
  });

  // Update mobile nav
  document.querySelectorAll('.mobile-nav-item').forEach(b => {
    b.classList.remove('active');
    if (b.dataset.page === id) b.classList.add('active');
  });

  // Scroll to top
  document.querySelector('.main').scrollTop = 0;
  window.scrollTo(0, 0);
}

// ─── Chip Selection ───
function pickChip(el) {
  const group = el.closest('.chip-group');
  if (!group) return;
  group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

// ─── Action Toggle ───
function toggleAction(el) {
  el.classList.toggle('done');
  el.innerHTML = el.classList.contains('done') 
    ? '<svg width="14" height="14"><use href="#icon-check"/></svg>' 
    : '';
}

// ─── Chart.js Theme Detection ───
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const chartText = isDark ? '#a0a8b8' : '#6b6b6b';
const chartGrid = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
const chartBg = isDark ? '#1a1f2e' : '#ffffff';

Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = chartText;
Chart.defaults.borderColor = chartGrid;

// ─── Data ───
const categories = [
  { label: 'Transport', pct: 41, color: '#1a5f4a', kg: 2542 },
  { label: 'Food', pct: 24, color: '#2a9d5a', kg: 1488 },
  { label: 'Home', pct: 19, color: '#2874a6', kg: 1178 },
  { label: 'Shopping', pct: 10, color: '#d4a017', kg: 620 },
  { label: 'Waste', pct: 6, color: '#9a9894', kg: 372 }
];

// ─── Category Bars ───
const catBarsEl = document.getElementById('catBars');
if (catBarsEl) {
  categories.forEach(c => {
    const div = document.createElement('div');
    div.style.marginBottom = '14px';
    div.innerHTML = `
      <div class="flex justify-between" style="margin-bottom:6px;font-size:13px">
        <span style="font-weight:500">${c.label}</span>
        <span style="font-weight:600;color:${c.color}">${c.pct}% · ${c.kg} kg</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${c.pct * 2}%;background:${c.color}"></div>
      </div>
    `;
    catBarsEl.appendChild(div);
  });
}

// ─── Donut Chart ───
const donutCtx = document.getElementById('chartDonut');
if (donutCtx) {
  new Chart(donutCtx, {
    type: 'doughnut',
    data: {
      labels: categories.map(c => c.label),
      datasets: [{
        data: categories.map(c => c.pct),
        backgroundColor: categories.map(c => c.color),
        borderWidth: 2,
        borderColor: chartBg,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? '#232838' : '#ffffff',
          titleColor: isDark ? '#f0f0f0' : '#1a1a1a',
          bodyColor: isDark ? '#a0a8b8' : '#6b6b6b',
          borderColor: isDark ? '#2a3040' : '#e8e6e1',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.raw}%`
          }
        }
      }
    }
  });

  // Custom legend
  const legend = document.getElementById('donutLegend');
  if (legend) {
    categories.forEach(c => {
      const span = document.createElement('span');
      span.style.display = 'flex';
      span.style.alignItems = 'center';
      span.style.gap = '6px';
      span.innerHTML = `<span style="width:10px;height:10px;border-radius:3px;background:${c.color};display:inline-block"></span>${c.label} ${c.pct}%`;
      legend.appendChild(span);
    });
  }
}

// ─── Trend Chart ───
const trendCtx = document.getElementById('chartTrend');
if (trendCtx) {
  new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'kg CO₂',
        data: [580, 560, 545, 530, 517, 517],
        borderColor: '#1a5f4a',
        backgroundColor: 'rgba(26, 95, 74, 0.08)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#1a5f4a',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { font: { size: 11 } },
          grid: { display: false }
        },
        y: {
          ticks: { 
            font: { size: 11 },
            callback: v => v + ' kg'
          },
          grid: { color: chartGrid }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? '#232838' : '#ffffff',
          titleColor: isDark ? '#f0f0f0' : '#1a1a1a',
          bodyColor: isDark ? '#a0a8b8' : '#6b6b6b',
          borderColor: isDark ? '#2a3040' : '#e8e6e1',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10
        }
      }
    }
  });
}

// ─── Weekly Savings Chart ───
const weeklyCtx = document.getElementById('chartWeekly');
if (weeklyCtx) {
  new Chart(weeklyCtx, {
    type: 'bar',
    data: {
      labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
      datasets: [{
        data: [12, 9, 22, 28],
        backgroundColor: '#1a5f4a',
        borderRadius: 6,
        barThickness: 24
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { font: { size: 11 } },
          grid: { display: false }
        },
        y: {
          ticks: { 
            font: { size: 11 },
            callback: v => v + ' kg'
          },
          grid: { color: chartGrid }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? '#232838' : '#ffffff',
          titleColor: isDark ? '#f0f0f0' : '#1a1a1a',
          bodyColor: isDark ? '#a0a8b8' : '#6b6b6b',
          borderColor: isDark ? '#2a3040' : '#e8e6e1',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10
        }
      }
    }
  });
}

// ─── Simulator ───
let simChart = null;
const simColors = ['#1a5f4a', '#2a9d5a', '#2874a6', '#d4a017', '#9a9894'];
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
    leg.innerHTML = simLabels.map((l, i) => `
      <span style="display:flex;align-items:center;gap:4px">
        <span style="width:8px;height:8px;border-radius:2px;background:${simColors[i]};display:inline-block"></span>${l}
      </span>
    `).join('');
  }

  if (simChart) {
    simChart.data.datasets[0].data = dd;
    simChart.update('none');
  } else {
    simChart = new Chart(document.getElementById('chartSimDonut'), {
      type: 'doughnut',
      data: {
        labels: simLabels,
        datasets: [{
          data: dd,
          backgroundColor: simColors,
          borderWidth: 2,
          borderColor: chartBg
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? '#232838' : '#ffffff',
            titleColor: isDark ? '#f0f0f0' : '#1a1a1a',
            bodyColor: isDark ? '#a0a8b8' : '#6b6b6b',
            borderColor: isDark ? '#2a3040' : '#e8e6e1',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 10
          }
        }
      }
    });
  }
}

function resetSim() {
  ['sim-tr', 'sim-ca', 'sim-mf', 'sim-fw', 'sim-el', 'sim-fl'].forEach((id, i) => {
    document.getElementById(id).value = [1, 5, 1, 10, 0, 2][i];
  });
  updateSim();
}

// Initialize simulator
updateSim();

// ─── AI Coach ───
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
  box.innerHTML += `<div class="chat-bubble user">${escapeHtml(q)}</div>`;
  input.value = '';
  box.scrollTop = box.scrollHeight;

  setTimeout(() => {
    box.innerHTML += `<div class="chat-bubble ai">${getResponse(q)}</div>`;
    box.scrollTop = box.scrollHeight;
  }, 600);
}

function quickChat(q) {
  document.getElementById('chatInput').value = q;
  sendChat();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ─── Dark Mode Listener ───
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  // Reload to pick up new CSS variables
  // In a real app, you'd update Chart.js colors dynamically
});

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  // Set initial active state
  navTo('dash');
});
