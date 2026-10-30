// Exercise the actual inline dashboard script with a deterministic browser stub.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'dashboard.html'), 'utf8');
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];

async function check(unavailable) {
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, {style: {}, appendChild() {}, getContext() { return {}; }});
      return elements.get(id);
    },
    createElement() { return {}; },
    addEventListener() {},
  };
  const payloads = {
    market: {price: 12345, volume_24h: null, change_24h: null},
    agents: {agents: []}, equity: {data: []}, sentiment: {fear_greed: 42},
    risk: {risk_score: 25, sharpe_ratio: 1.2, volatility_30d: 10},
    performance: {performance: {total_trades: 2, win_rate: 50, total_pnl: 15, avg_pnl: 7.5, max_drawdown: 3}},
  };
  const context = vm.createContext({document, window: {addEventListener() {}}, console, Date, AbortSignal, setInterval() {},
    Chart: class { constructor(ctx, options) { this.data = options.data; } update() {} },
    fetch: async url => ({ok: !unavailable, status: unavailable ? 503 : 200,
      json: async () => ({success: true, ...payloads[url.split('/').pop()]})}),
  });
  vm.runInContext(script, context);
  await vm.runInContext('updateAllData()', context);
  assert.equal(elements.get('btc-price').textContent, unavailable ? 'Unavailable' : '$12345.00');
  assert.equal(elements.get('volume-24h').textContent, 'Unavailable');
  assert.equal(elements.get('market-regime').textContent, 'Unavailable');
  assert.equal(elements.get('avg-return').textContent, unavailable ? 'Unavailable' : '$7.50');
  assert.equal(elements.get('trending').textContent, 'Unavailable');
  assert.equal(vm.runInContext('state.priceData.length', context), unavailable ? 0 : 1);
  assert.equal(vm.runInContext('state.equityData.length', context), 0);
}
(async () => {
  await check(false);
  await check(true);
  console.log('Dashboard success and unavailable-data scenarios passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
