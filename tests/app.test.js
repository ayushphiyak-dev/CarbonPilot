/**
 * @jest-environment jsdom
 */

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) { return store[key] || null; },
    setItem: function(key, value) { store[key] = value.toString(); },
    clear: function() { store = {}; },
    removeItem: function(key) { delete store[key]; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Chart.js
window.Chart = class {
  constructor(ctx, config) { this.ctx = ctx; this.config = config; this.options = config.options; this.data = config.data; }
  update() {}
};
window.Chart.defaults = { font: { family: '' }, color: '', borderColor: '' };

// Include the main app logic
const app = require('../js/app.js');

describe('CarbonPilot Application State', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset state before each test by directly mutating it to default
    Object.assign(app.getState(), app.DS);
    document.body.innerHTML = `
      <div id="chartDonut"></div>
      <div id="chartTrend"></div>
      <div id="chartWeekly"></div>
      <div id="chartSimDonut"></div>
      <div id="theme-icon-sun"></div>
      <div id="theme-icon-moon"></div>
    `;
    document.documentElement.setAttribute('data-theme', 'light');
  });

  test('loadState returns default state when localStorage is empty', () => {
    const state = app.loadState();
    expect(state.page).toBe('dash');
    expect(state.assessStep).toBe(1);
    expect(state.assess.car_type).toBe('petrol');
  });

  test('recalc calculates correct footprint for default assessment', () => {
    app.recalc();
    const fp = app.getFp();
    const cats = app.getCats();
    
    expect(fp).toBeGreaterThan(0);
    expect(cats).toHaveLength(5); // Transport, Food, Home, Shopping, Travel
    expect(cats[0].label).toBe('Transport');
  });

  test('applyTheme toggles dark mode correctly', () => {
    app.applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('cp-theme')).toBe('dark');
  });

  test('ALL_ACTIONS contains valid trackable actions', () => {
    expect(Array.isArray(app.ALL_ACTIONS)).toBe(true);
    expect(app.ALL_ACTIONS.length).toBeGreaterThan(0);
    expect(app.ALL_ACTIONS[0]).toHaveProperty('id');
    expect(app.ALL_ACTIONS[0]).toHaveProperty('kg');
  });
});
