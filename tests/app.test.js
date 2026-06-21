/**
 * @jest-environment jsdom
 */
/* CarbonPilot — Full Test Suite */

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: (query) => ({ matches: false, media: query, addListener: () => {}, removeListener: () => {} })
});

// Mock Chart.js
window.Chart = class {
  constructor(ctx, config) {
    this.ctx = ctx; this.config = config;
    this.options = config.options || {};
    this.data = config.data || {};
  }
  update() {}
  destroy() {}
};
window.Chart.defaults = { font: { family: '' }, color: '', borderColor: '' };

// Mock IntersectionObserver
window.IntersectionObserver = class {
  constructor(cb) { this.cb = cb; }
  observe() {}
  unobserve() {}
  disconnect() {}
};

const app = require('../js/app.js');

// Helper to reset DOM and state
function setupDOM() {
  document.body.innerHTML = `
    <div id="page-dash" class="page active"></div>
    <div id="page-assess" class="page"></div>
    <div id="page-track" class="page"></div>
    <div id="page-sim" class="page"></div>
    <div id="page-coach" class="page"></div>
    <div id="page-nba" class="page"></div>
    <div id="chartDonut"></div>
    <div id="chartTrend"></div>
    <div id="chartWeekly"></div>
    <div id="chartSimDonut"></div>
    <div id="theme-icon-sun"></div>
    <div id="theme-icon-moon"></div>
    <div id="sidebar-eco-score"></div>
    <div id="dash-eco-score"></div>
    <div id="catBars"></div>
    <div id="donutLegend"></div>
    <div id="active-actions-list"></div>
    <div id="track-co2-saved"></div>
    <div id="track-actions-done"></div>
    <div id="track-goal-pct"></div>
    <div id="track-monthly-now"></div>
    <div id="track-goal-fill" style="width:0%"></div>
    <div id="track-goal-note"></div>
    <div id="track-trees-num"></div>
    <div id="track-tree-banner"><div></div></div>
    <div id="modal-add-action" style="display:none"></div>
    <div id="modal-action-list"></div>
    <div id="chatBox"></div>
    <input id="chatInput" type="text">
    <div id="coach-profile"></div>
    <div id="coach-footprint"></div>
    <div id="sim-tr" value="1"><input type="range" value="1"></div>
    <div id="sim-ca" value="5"><input type="range" value="5"></div>
    <input id="sim-tr" type="range" value="1">
    <input id="sim-ca" type="range" value="5">
    <input id="sim-mf" type="range" value="1">
    <input id="sim-fw" type="range" value="10">
    <input id="sim-el" type="range" value="0">
    <input id="sim-fl" type="range" value="2">
    <div id="val-tr"></div><div id="val-ca"></div><div id="val-mf"></div>
    <div id="val-fw"></div><div id="val-el"></div><div id="val-fl"></div>
    <div id="sim-score"></div><div id="sim-total"></div>
    <div id="sim-delta"></div><div id="sim-pct"></div>
    <div id="sim-trees"></div><div id="sim-trees-label"></div>
    <div id="simLegend"></div>
    <div id="assess-step-1" style="display:block"></div>
    <div id="assess-step-2"></div>
    <div id="assess-step-3"></div>
    <div id="assess-step-4"></div>
    <div id="assess-step-5"></div>
    <div id="assess-stepper">
      <div class="stepper-step"></div><div class="stepper-step"></div>
      <div class="stepper-step"></div><div class="stepper-step"></div>
      <div class="stepper-step"></div>
    </div>
  `;
  document.documentElement.setAttribute('data-theme', 'light');
}

// ─────────────────────────────────────────────
// 1. STATE MANAGEMENT
// ─────────────────────────────────────────────
describe('State Management', () => {
  beforeEach(() => { localStorage.clear(); });

  test('loadState returns default when storage is empty', () => {
    const state = app.loadState();
    expect(state.page).toBe('dash');
    expect(state.assessStep).toBe(1);
    expect(state.assess.car_type).toBe('petrol');
    expect(state.assess.diet).toBe('flexitarian');
  });

  test('loadState merges saved state with defaults', () => {
    localStorage.setItem('cp-state', JSON.stringify({ page: 'track', assess: { car_type: 'electric' } }));
    const state = app.loadState();
    expect(state.page).toBe('track');
    expect(state.assess.car_type).toBe('electric');
    expect(state.assess.diet).toBe('flexitarian'); // default preserved
  });

  test('loadState returns default on corrupted JSON', () => {
    localStorage.setItem('cp-state', 'not-valid-json');
    const state = app.loadState();
    expect(state.page).toBe('dash');
  });

  test('save() persists state to localStorage', () => {
    const S = app.getState();
    S.page = 'coach';
    app.save();
    const saved = JSON.parse(localStorage.getItem('cp-state'));
    expect(saved.page).toBe('coach');
  });

  test('default state has all required keys', () => {
    const ds = app.DS;
    expect(ds).toHaveProperty('page');
    expect(ds).toHaveProperty('assessStep');
    expect(ds).toHaveProperty('assess');
    expect(ds).toHaveProperty('sim');
    expect(ds).toHaveProperty('tracked');
    expect(ds).toHaveProperty('actions');
  });
});

// ─────────────────────────────────────────────
// 2. CARBON CALCULATION
// ─────────────────────────────────────────────
describe('Carbon Footprint Calculations', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.assign(app.getState(), JSON.parse(JSON.stringify(app.DS)));
    setupDOM();
  });

  test('recalc produces a positive footprint', () => {
    app.recalc();
    expect(app.getFp()).toBeGreaterThan(0);
  });

  test('recalc returns exactly 5 categories', () => {
    app.recalc();
    expect(app.getCats()).toHaveLength(5);
  });

  test('categories have correct labels', () => {
    app.recalc();
    const labels = app.getCats().map(c => c.label);
    expect(labels).toContain('Transport');
    expect(labels).toContain('Food');
    expect(labels).toContain('Home');
    expect(labels).toContain('Shopping');
    expect(labels).toContain('Travel');
  });

  test('electric car reduces transport footprint vs petrol', () => {
    const S = app.getState();
    S.assess.car_type = 'petrol'; S.assess.car_days = 5;
    app.recalc();
    const petrolFp = app.getFp();

    S.assess.car_type = 'electric';
    app.recalc();
    const electricFp = app.getFp();
    expect(electricFp).toBeLessThan(petrolFp);
  });

  test('vegan diet produces lower footprint than heavy meat', () => {
    const S = app.getState();
    S.assess.diet = 'heavy_meat'; S.assess.meatfree_days = 0;
    app.recalc();
    const meatFp = app.getFp();

    S.assess.diet = 'vegan'; S.assess.meatfree_days = 0;
    app.recalc();
    const veganFp = app.getFp();
    expect(veganFp).toBeLessThan(meatFp);
  });

  test('more electricity usage increases home footprint', () => {
    const S = app.getState();
    S.assess.electricity = 10;
    app.recalc();
    const lowFp = app.getFp();

    S.assess.electricity = 200;
    app.recalc();
    const highFp = app.getFp();
    expect(highFp).toBeGreaterThan(lowFp);
  });

  test('more flights increases travel footprint', () => {
    const S = app.getState();
    S.assess.flights_short = 0; S.assess.flights_long = 0;
    app.recalc();
    const noFlightFp = app.getFp();

    S.assess.flights_short = 5; S.assess.flights_long = 3;
    app.recalc();
    const flightFp = app.getFp();
    expect(flightFp).toBeGreaterThan(noFlightFp);
  });

  test('category percentages sum near 100', () => {
    app.recalc();
    const total = app.getCats().reduce((s, c) => s + c.pct, 0);
    expect(total).toBeGreaterThanOrEqual(95);
    expect(total).toBeLessThanOrEqual(105);
  });

  test('CAR_FACTOR constants are correct', () => {
    expect(app.CAR_FACTOR.petrol).toBe(1);
    expect(app.CAR_FACTOR.electric).toBeLessThan(1);
    expect(app.CAR_FACTOR.none).toBe(0);
  });

  test('DIET_BASE has all expected diet types', () => {
    expect(app.DIET_BASE).toHaveProperty('vegan');
    expect(app.DIET_BASE).toHaveProperty('heavy_meat');
    expect(app.DIET_BASE.vegan).toBeLessThan(app.DIET_BASE.heavy_meat);
  });
});

// ─────────────────────────────────────────────
// 3. THEME
// ─────────────────────────────────────────────
describe('Theme Management', () => {
  beforeEach(() => {
    localStorage.clear();
    setupDOM();
  });

  test('applyTheme sets dark mode attribute', () => {
    app.applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('applyTheme saves theme to localStorage', () => {
    app.applyTheme('dark');
    expect(localStorage.getItem('cp-theme')).toBe('dark');
  });

  test('applyTheme sets light mode attribute', () => {
    app.applyTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  test('toggleTheme switches from light to dark', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    app.toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('toggleTheme switches from dark to light', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    app.toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});

// ─────────────────────────────────────────────
// 4. ACTIONS & TRACKING
// ─────────────────────────────────────────────
describe('Action Tracking', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.assign(app.getState(), JSON.parse(JSON.stringify(app.DS)));
    setupDOM();
    app.recalc();
  });

  test('ALL_ACTIONS is a non-empty array', () => {
    expect(Array.isArray(app.ALL_ACTIONS)).toBe(true);
    expect(app.ALL_ACTIONS.length).toBeGreaterThan(0);
  });

  test('every action has id, label and kg', () => {
    app.ALL_ACTIONS.forEach(a => {
      expect(a).toHaveProperty('id');
      expect(a).toHaveProperty('label');
      expect(a).toHaveProperty('kg');
      expect(typeof a.kg).toBe('number');
      expect(a.kg).toBeGreaterThan(0);
    });
  });

  test('actions with higher kg save more CO2', () => {
    const bus = app.ALL_ACTIONS.find(a => a.id === 'bus');
    const showers = app.ALL_ACTIONS.find(a => a.id === 'showers');
    expect(bus.kg).toBeGreaterThan(showers.kg);
  });

  test('openAddActionModal renders action items', () => {
    app.openAddActionModal();
    const modal = document.getElementById('modal-add-action');
    expect(modal.style.display).toBe('flex');
  });

  test('closeAddActionModal hides the modal', () => {
    const modal = document.getElementById('modal-add-action');
    modal.style.display = 'flex';
    app.closeAddActionModal();
    expect(modal.style.display).toBe('none');
  });
});

// ─────────────────────────────────────────────
// 5. AI COACH
// ─────────────────────────────────────────────
describe('AI Coach', () => {
  test('getAI responds to transport questions', () => {
    const res = app.getAI('how do I reduce my car commute?');
    expect(typeof res).toBe('string');
    expect(res.length).toBeGreaterThan(10);
  });

  test('getAI responds to diet questions', () => {
    const res = app.getAI('should I go vegan?');
    expect(typeof res).toBe('string');
  });

  test('getAI responds to home energy questions', () => {
    const res = app.getAI('help with home energy');
    expect(typeof res).toBe('string');
  });

  test('getAI returns default for unknown questions', () => {
    const res = app.getAI('xyz12345unknown');
    expect(typeof res).toBe('string');
    expect(res.length).toBeGreaterThan(10);
  });
});
