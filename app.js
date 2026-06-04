/* app.js — Pitch Agent Skill Visualizer (interactive) */

/* ─── Workflow definition (mirrors SKILL.md §Workflow) ──────────────── */
const WORKFLOW_STEPS = [
  {
    id: 1, title: "Scope the Ask",
    desc: "Confirm target, sector & situation. Identify peer set.",
    skill: null, slideRef: null
  },
  {
    id: 2, title: "Situation Overview",
    desc: "Draft company snapshot and strategic-rationale narrative.",
    skill: "sector-overview", slideRef: 1
  },
  {
    id: 3, title: "Pull Data",
    desc: "Load Bloomberg multiples, PitchBook transactions, SEC filings.",
    skill: null, slideRef: null
  },
  {
    id: 4, title: "Spread Peer Set",
    desc: "Lay out comps & precedents with consistent metric definitions.",
    skill: "comps-analysis", slideRef: 4
  },
  {
    id: 5, title: "Sponsor Case (LBO)",
    desc: "Illustrative LBO at market leverage — sources & uses, returns sensitivity.",
    skill: "lbo-model", slideRef: 3
  },
  {
    id: 6, title: "DCF & 3-Statement",
    desc: "Build DCF and 3-statement model with audit-xls conventions.",
    skill: "dcf-model", slideRef: 3
  },
  {
    id: 7, title: "Football Field",
    desc: "Compute min/median/max per methodology. Overlay current price.",
    skill: null, slideRef: 3
  },
  {
    id: 8, title: "Populate Deck",
    desc: "Populate 6 slides on firm template. All numbers trace to workbook.",
    skill: "pitch-deck", slideRef: null
  },
  {
    id: 9, title: "Deck QC",
    desc: "Verify totals, footnotes, dates, football-field bars match model.",
    skill: "ib-check-deck", slideRef: null
  }
];

/* ─── Step execution log messages ───────────────────────────────────── */
const STEP_LOGS = [
  /* Step 1 — Scope */
  [
    { t: 'info',    m: 'Target confirmed: Nexaris Technologies (NXRS)' },
    { t: 'data',    m: 'Sector: Enterprise SaaS / Cloud Infrastructure' },
    { t: 'data',    m: 'Situation: Exploring Strategic Alternatives' },
    { t: 'data',    m: 'Exchange: NASDAQ · Share price: $24.50 (31-Mar-2025)' },
    { t: 'success', m: 'Peer universe: 7 companies identified (1 potential outlier)' },
    { t: 'success', m: 'Precedent universe: 7 transactions (Apr 2022 – Apr 2024)' },
  ],
  /* Step 2 — Situation Overview */
  [
    { t: 'invoke',  m: '↳ sector-overview' },
    { t: 'data',    m: 'Drafting company narrative — 680+ enterprise clients, 94% NRR' },
    { t: 'data',    m: 'Theme 1: Cloud migration tailwinds — SAM expanding to $42B by 2027E' },
    { t: 'data',    m: 'Theme 2: Peer M&A at 17–29× EV/EBITDA (PitchBook, 7 transactions)' },
    { t: 'data',    m: 'Theme 3: CEO transition Q3 2025 — structured process resolves overhang' },
    { t: 'success', m: 'Slide 01 content ready: Situation Overview (3 strategic themes)' },
  ],
  /* Step 3 — Pull Data */
  [
    { t: 'invoke',  m: '↳ Bloomberg Terminal — loading trading multiples' },
    { t: 'data',    m: 'Loaded: CLSD, DFLS, TBSE, ORBT, VCTQ, PLTX, HLXN' },
    { t: 'data',    m: 'LTM period: 12 months ended 31-Mar-2025 (calendarized Dec FYE)' },
    { t: 'invoke',  m: '↳ PitchBook Data Corp — loading M&A transactions' },
    { t: 'data',    m: 'Loaded: 7 closed deals · $1.4B–$5.2B deal value range' },
    { t: 'invoke',  m: '↳ SEC EDGAR — loading NXRS 10-K / 10-Q filings' },
    { t: 'data',    m: 'Filed: FY2024 10-K (Rev $482.4M, EBITDA $144.7M, 30.0% margin)' },
    { t: 'success', m: 'All data loaded. Full filings read — no summarized snippets.' },
  ],
  /* Step 4 — Spread Peer Set */
  [
    { t: 'invoke',  m: '↳ comps-analysis' },
    { t: 'data',    m: 'Calendarized all 7 peers to December fiscal year-end' },
    { t: 'warn',    m: 'Outlier flagged: HLXN — large-cap premium + cloud-transition phase' },
    { t: 'data',    m: 'Peer median (ex. outlier) EV/EBITDA LTM: 21.6× | NTM: 17.9×' },
    { t: 'data',    m: 'NXRS current multiple: 15.9× LTM — discount to peer median of 5.7 turns' },
    { t: 'data',    m: 'Precedent median: 22.7× EV/EBITDA · 30% unaffected price premium' },
    { t: 'success', m: 'Slides 04–05 content ready: Trading Comps & Precedent Transactions' },
  ],
  /* Step 5 — LBO */
  [
    { t: 'invoke',  m: '↳ lbo-model' },
    { t: 'data',    m: 'Entry: 20.4× LTM EV/EBITDA → entry EV $2,950M' },
    { t: 'data',    m: 'Equity: 40% ($1,180M) | Debt: 60% ($1,770M)' },
    { t: 'data',    m: 'Leverage: 6.1× debt/EBITDA @ 7.2% (Bloomberg leveraged loan comps)' },
    { t: 'data',    m: 'Exit: 19.0× EV/EBITDA in 2030E (5-year hold)' },
    { t: 'success', m: 'IRR base case: 22.4% | MOIC: 2.7× | Range: 18.8%–25.9%' },
    { t: 'success', m: 'LBO floor: $26.80–$33.20/share (supports $31+ offer price)' },
  ],
  /* Step 6 — DCF */
  [
    { t: 'invoke',  m: '↳ dcf-model + 3-statement-model + audit-xls' },
    { t: 'data',    m: 'Revenue: $551.8M (2025E) → $900.5M (2029E) · +13% CAGR' },
    { t: 'data',    m: 'EBITDA margin expanding: 31.0% (2025E) → 35.0% (2029E)' },
    { t: 'data',    m: 'FCF: $96.4M (2025E) → $197.0M (2029E)' },
    { t: 'data',    m: 'WACC: 9.75% (range 9.0–10.5%) · Terminal growth: 3.0%' },
    { t: 'data',    m: 'Terminal value implied multiple: 16.8× EV/EBITDA' },
    { t: 'success', m: 'DCF value: $27.80–$36.10/share · Base case: $31.60/share' },
  ],
  /* Step 7 — Football Field */
  [
    { t: 'data',    m: 'Trading Comps:           $26.40 ────── $35.90  (median $30.80)' },
    { t: 'data',    m: 'Precedent Transactions:  $28.20 ────────────── $40.80  (median $33.40)' },
    { t: 'data',    m: 'DCF Analysis:            $27.80 ──────── $36.10  (median $31.60)' },
    { t: 'data',    m: 'Illustrative LBO:        $26.80 ────── $33.20  (median $29.90)' },
    { t: 'warn',    m: 'Current price $24.50 trades at discount to ALL four methodologies' },
    { t: 'success', m: 'Recommended range: $31.00–$37.00/share (+27% to +51% to current)' },
    { t: 'success', m: 'Slide 03 ready: Valuation Summary (Football Field)' },
  ],
  /* Step 8 — Populate Deck */
  [
    { t: 'invoke',  m: '↳ pitch-deck · reading deck-template.md' },
    { t: 'data',    m: 'Applying palette: PRIMARY #0B2545 · ACCENT #1B6CA8 · HILITE #8A6D1F' },
    { t: 'data',    m: 'Slide 01: Situation Overview ✓  — every figure traces to filings' },
    { t: 'data',    m: 'Slide 02: Company Snapshot  ✓  — 2×3 stat grid, sourced to Bloomberg' },
    { t: 'data',    m: 'Slide 03: Football Field     ✓  — bars bound to comps/DCF/LBO ranges' },
    { t: 'data',    m: 'Slide 04: Trading Comps      ✓  — 7 peers, 1 outlier footnoted' },
    { t: 'data',    m: 'Slide 05: Precedent Txns     ✓  — 7 deals with PitchBook sourcing' },
    { t: 'data',    m: 'Slide 06: Illustrative Process ✓  — 5-step timeline, labeled "Illustrative"' },
    { t: 'success', m: 'All 6 slides populated. Every number traces to named range in workbook.' },
  ],
  /* Step 9 — Deck QC */
  [
    { t: 'invoke',  m: '↳ ib-check-deck' },
    { t: 'data',    m: 'Checking: totals tie to model…         ✓ PASS' },
    { t: 'data',    m: 'Checking: footnotes present & sourced…  ✓ PASS (0 [UNSOURCED] flags)' },
    { t: 'data',    m: 'Checking: dates consistent (all show 31-Mar-2025)… ✓ PASS' },
    { t: 'data',    m: 'Checking: football-field bars match summary tab… ✓ PASS' },
    { t: 'data',    m: 'Checking: confidentiality footer on all slides…   ✓ PASS' },
    { t: 'success', m: 'QC PASSED — 0 issues flagged. Deck ready for banker review.' },
  ]
];

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const fmt = {
  usd:  v => `$${Number(v).toFixed(2)}`,
  usdM: v => `$${Number(v).toFixed(1)}M`,
  usdB: v => `$${(Number(v)/1000).toFixed(1)}B`,
  mult: v => `${Number(v).toFixed(1)}×`,
  pct:  v => `${Number(v).toFixed(1)}%`,
  int:  v => Number(v).toLocaleString()
};

function median(arr) {
  const s = [...arr].sort((a,b) => a-b);
  const m = Math.floor(s.length/2);
  return s.length%2===0 ? (s[m-1]+s[m])/2 : s[m];
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ─── State ──────────────────────────────────────────────────────────── */
let isRunning = false;

/* ─── Step list render ───────────────────────────────────────────────── */
function renderStepsList() {
  const el = document.getElementById('stepsList');
  if (!el) return;
  el.innerHTML = WORKFLOW_STEPS.map((s, i) => `
    <div class="step-item pending" id="step-${i}">
      <div class="step-item__badge">${s.id}</div>
      <div class="step-item__body">
        <div class="step-item__title">${s.title}</div>
        ${s.skill ? `<div class="step-item__skill">↳ ${s.skill}</div>` : ''}
      </div>
      <div class="step-item__state" id="step-state-${i}">
        <span class="state-dot state-dot--pending"></span>
      </div>
    </div>`).join('');
}

/* ─── Execution engine ───────────────────────────────────────────────── */
async function runSkill() {
  if (isRunning) return;
  isRunning = true;

  const btn = document.getElementById('runBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="run-btn__icon spin">⟳</span><span class="run-btn__text">Running…</span>';

  /* Update nav */
  document.getElementById('navCompany').textContent = PITCH_DATA.target.name + ' (' + PITCH_DATA.target.ticker + ')';
  document.getElementById('navSituation').textContent = 'Exploring Strategic Alternatives';
  document.getElementById('navStatus').textContent = 'RUNNING';
  document.getElementById('navStatus').style.color = '#f59e0b';

  /* Show exec section and render steps */
  const execEl = document.getElementById('execSection');
  execEl.style.display = 'block';
  renderStepsList();
  clearLog();
  execEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

  await sleep(400);
  await appendLog('▶ pitch-agent started', 'step');
  await appendLog('Target: ' + PITCH_DATA.target.name + ' (' + PITCH_DATA.target.ticker + ')', 'info');
  await appendLog('Situation: Exploring Strategic Alternatives', 'info');
  await appendLog('Data: Bloomberg Terminal · PitchBook Data Corp · SEC EDGAR', 'info');
  setLogStatus('Running…');
  await sleep(300);

  /* Execute each step */
  for (let i = 0; i < WORKFLOW_STEPS.length; i++) {
    await runStep(i);

    /* Progressive reveals */
    if (i === 2) {
      renderInputCards();
      const ds = document.getElementById('dataSection');
      ds.style.display = 'block';
      ds.classList.add('reveal');
    }
    if (i === 7) {
      renderAllSlides();
    }
  }

  /* Done */
  await appendLog('', 'separator');
  await appendLog('✅ All 9 steps complete — artifacts ready for banker review', 'done');
  await appendLog('📊 Excel workbook: valuation model with live traceable formulas', 'done');
  await appendLog('📑 Pitch deck: 6 slides on firm template, QC passed', 'done');
  setLogStatus('Complete ✓');

  /* Show output */
  const out = document.getElementById('outputSection');
  out.style.display = 'block';
  out.classList.add('reveal');
  await sleep(400);
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  /* Update nav + button */
  document.getElementById('navStatus').textContent = 'COMPLETE';
  document.getElementById('navStatus').style.color = '#3fb950';
  btn.disabled = false;
  btn.innerHTML = '<span class="run-btn__icon">↺</span><span class="run-btn__text">Run Again</span>';
  btn.onclick = resetAndRun;

  isRunning = false;
}

async function runStep(i) {
  const step = WORKFLOW_STEPS[i];
  const itemEl   = document.getElementById(`step-${i}`);
  const stateEl  = document.getElementById(`step-state-${i}`);

  /* Running */
  itemEl.className = 'step-item running';
  stateEl.innerHTML = '<span class="state-dot state-dot--running"></span>';
  setProgress(i, 'running');
  await appendLog(`─── Step ${step.id}: ${step.title}${step.skill ? ' (' + step.skill + ')' : ''}`, 'step');

  /* Log entries */
  const entries = STEP_LOGS[i];
  for (const e of entries) {
    await sleep(110);
    await appendLog(e.m, e.t);
  }

  await sleep(Math.max(50, 600 - entries.length * 110));

  /* Complete */
  itemEl.className = 'step-item complete';
  stateEl.innerHTML = '<span class="state-dot state-dot--done">✓</span>';
  setProgress(i + 1, 'done');
}

function setProgress(done, _state) {
  const pct = Math.round((done / WORKFLOW_STEPS.length) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressLabel').textContent = `${done} / ${WORKFLOW_STEPS.length} steps`;
}

function setLogStatus(text) {
  const el = document.getElementById('logStatus');
  if (el) el.textContent = text;
}

async function appendLog(text, type) {
  const log = document.getElementById('execLog');
  if (!log) return;

  const div = document.createElement('div');

  if (type === 'separator') {
    div.innerHTML = '<div class="log-sep"></div>';
  } else {
    const now = new Date().toLocaleTimeString('en-US', { hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit' });
    const timeSpan = type === 'step' || type === 'done'
      ? `<span class="log-time">[${now}]</span> ` : '<span class="log-indent"></span>';
    div.className = `log-entry log-${type}`;
    div.innerHTML = timeSpan + escHtml(text);
  }

  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function clearLog() {
  const log = document.getElementById('execLog');
  if (log) log.innerHTML = '';
}

function resetAndRun() {
  /* Reset all steps to pending */
  document.querySelectorAll('.step-item').forEach(el => {
    el.className = 'step-item pending';
  });
  document.querySelectorAll('.state-dot').forEach(el => {
    el.className = 'state-dot state-dot--pending';
    el.textContent = '';
  });
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('progressLabel').textContent = '0 / 9 steps';
  document.getElementById('dataSection').style.display = 'none';
  document.getElementById('outputSection').style.display = 'none';
  document.getElementById('navStatus').textContent = 'READY';
  document.getElementById('navStatus').style.color = '';

  const btn = document.getElementById('runBtn');
  btn.onclick = runSkill;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(runSkill, 600);
}

/* ─── Input cards ────────────────────────────────────────────────────── */
function renderInputCards() {
  renderTargetCard();
  renderCompsInputCard();
  renderDealsInputCard();
}

function renderTargetCard() {
  const el = document.getElementById('targetCard');
  if (!el) return;
  const t = PITCH_DATA.target, f = t.financials;
  el.innerHTML = `
    <div class="input-card">
      <div class="input-card__header">${t.name} (${t.ticker})<span class="input-card__source">Bloomberg / Filings</span></div>
      <div class="input-card__body">
        <div class="stat-grid">
          <div class="stat-cell"><div class="stat-cell__val">${fmt.usd(f.share_price)}</div><div class="stat-cell__lbl">Share Price</div><div class="stat-cell__sub">NASDAQ: ${t.ticker}</div></div>
          <div class="stat-cell"><div class="stat-cell__val">${fmt.usdB(f.ev)}</div><div class="stat-cell__lbl">Enterprise Value</div><div class="stat-cell__sub">Market cap + net debt</div></div>
          <div class="stat-cell"><div class="stat-cell__val">${fmt.usdM(f.revenue_ltm)}</div><div class="stat-cell__lbl">LTM Revenue</div><div class="stat-cell__sub">+${fmt.pct(f.revenue_growth_yoy)} YoY</div></div>
          <div class="stat-cell"><div class="stat-cell__val">${fmt.usdM(f.ebitda_ltm)}</div><div class="stat-cell__lbl">LTM EBITDA</div><div class="stat-cell__sub">${fmt.pct(f.ebitda_margin_ltm)} margin</div></div>
          <div class="stat-cell"><div class="stat-cell__val">${fmt.mult(f.ev_ebitda_ltm)}</div><div class="stat-cell__lbl">EV/EBITDA LTM</div><div class="stat-cell__sub">NTM: ${fmt.mult(f.ev_ebitda_ntm)}</div></div>
          <div class="stat-cell"><div class="stat-cell__val">${fmt.mult(f.ev_rev_ltm)}</div><div class="stat-cell__lbl">EV/Revenue LTM</div><div class="stat-cell__sub">P/E NTM: ${fmt.mult(f.pe_ntm)}</div></div>
        </div>
        <div class="source-line mt-8"><strong>Source:</strong> ${f.source}</div>
      </div>
    </div>`;
}

function renderCompsInputCard() {
  const el = document.getElementById('compsInputCard');
  if (!el) return;
  const peers = PITCH_DATA.tradingComps.filter(c => !c.outlier);
  const mER = median(peers.map(c=>c.ev_rev_ltm));
  const mEE = median(peers.map(c=>c.ev_ebitda_ltm));
  el.innerHTML = `
    <div class="input-card">
      <div class="input-card__header">Trading Comparables<span class="input-card__source">Bloomberg Terminal</span></div>
      <div class="input-card__body">
        <table class="mini-table"><thead><tr><th>Company</th><th>EV/Rev</th><th>EV/EBITDA</th><th>Margin</th></tr></thead>
        <tbody>
          ${PITCH_DATA.tradingComps.map(c=>`<tr class="${c.outlier?'outlier':''}"><td>${c.ticker}</td><td>${fmt.mult(c.ev_rev_ltm)}</td><td>${fmt.mult(c.ev_ebitda_ltm)}</td><td>${fmt.pct(c.ebitda_margin)}</td></tr>`).join('')}
          <tr class="median"><td>Median</td><td>${fmt.mult(mER)}</td><td>${fmt.mult(mEE)}</td><td>—</td></tr>
        </tbody></table>
        <div class="source-line mt-8"><strong>Source:</strong> ${PITCH_DATA.meta.dataSourceEquity}</div>
      </div>
    </div>`;
}

function renderDealsInputCard() {
  const el = document.getElementById('dealsInputCard');
  if (!el) return;
  const txns = PITCH_DATA.precedentTransactions;
  const mM = median(txns.map(t=>t.ev_ebitda));
  const mP = median(txns.map(t=>t.premium));
  el.innerHTML = `
    <div class="input-card">
      <div class="input-card__header">Precedent Transactions<span class="input-card__source">PitchBook Data Corp</span></div>
      <div class="input-card__body">
        <table class="mini-table"><thead><tr><th>Date</th><th>Target</th><th>EV/EBITDA</th><th>Prem.</th></tr></thead>
        <tbody>
          ${txns.map(t=>`<tr><td>${t.date}</td><td style="font-size:10.5px">${t.target}</td><td>${fmt.mult(t.ev_ebitda)}</td><td>${t.premium}%</td></tr>`).join('')}
          <tr class="median"><td colspan="2">Median</td><td>${fmt.mult(mM)}</td><td>${mP}%</td></tr>
        </tbody></table>
        <div class="source-line mt-8"><strong>Source:</strong> ${PITCH_DATA.meta.dataSourceDeals}</div>
      </div>
    </div>`;
}

/* ─── Slide renders ──────────────────────────────────────────────────── */
function renderAllSlides() {
  renderSlide1(); renderSlide2(); renderSlide3();
  renderSlide4(); renderSlide5(); renderSlide6();

  document.querySelectorAll('.slide-tab').forEach(btn => {
    btn.addEventListener('click', () => switchSlide(+btn.dataset.slide));
  });
  switchSlide(1);
}

function switchSlide(num) {
  document.querySelectorAll('.slide-tab').forEach(b => b.classList.toggle('active', +b.dataset.slide===+num));
  document.querySelectorAll('.slide-panel').forEach(p => p.classList.toggle('active', +p.dataset.slide===+num));
  if (+num === 3) requestAnimationFrame(() => {
    const c = document.getElementById('footballFieldChart');
    if (c && !Chart.getChart(c)) initFootballField();
  });
}

function renderSlide1() {
  const el = document.getElementById('slide1Body'); if (!el) return;
  const t = PITCH_DATA.target;
  el.innerHTML = `
    <div class="situation-grid">
      <div class="narrative">
        <p><strong style="color:var(--primary)">${t.name}</strong> is a ${t.sector} company headquartered
        in ${t.hq} (founded ${t.founded}, ~${fmt.int(t.employees)} employees, NASDAQ: ${t.ticker}).
        The Board is exploring strategic alternatives following sustained organic growth and accelerating sector M&amp;A.</p>
        <p>${t.description}</p>
        <p>Revenue has grown at a <strong>${fmt.pct(t.financials.revenue_growth_yoy)} CAGR</strong> over three years,
        supported by 94% annual net revenue retention. Management projects continued double-digit growth through 2029E.</p>
        <div class="source-line"><strong>Source:</strong> ${PITCH_DATA.meta.dataSourceEquity}; ${PITCH_DATA.meta.dataSourceFilings}</div>
      </div>
      <div class="cards-col">
        <div style="font-size:12px;font-weight:700;color:var(--secondary);margin-bottom:6px;letter-spacing:0.04em;text-transform:uppercase;">What's Changed</div>
        ${t.whatsChanged.map(w=>`<div class="change-card"><h4>${w.title}</h4><p>${w.body}</p></div>`).join('')}
      </div>
    </div>`;
}

function renderSlide2() {
  const el = document.getElementById('slide2Body'); if (!el) return;
  const t = PITCH_DATA.target, f = t.financials;
  el.innerHTML = `
    <div class="snapshot-grid">
      <div>
        <p class="snapshot-desc">${t.description}</p>
        <ul class="snapshot-facts">
          <li><strong>Sector</strong>${t.sector}</li>
          <li><strong>Headquarters</strong>${t.hq}</li>
          <li><strong>Founded</strong>${t.founded}</li>
          <li><strong>Employees</strong>~${fmt.int(t.employees)}</li>
          <li><strong>Exchange</strong>${t.exchange}: ${t.ticker}</li>
          <li><strong>Fiscal Period</strong>${f.fiscal_period}</li>
        </ul>
        <div class="source-line mt-16"><strong>Source:</strong> ${f.source}</div>
      </div>
      <div>
        <div class="stats-2x3">
          <div class="snap-stat"><div class="snap-stat__val">${fmt.usdM(f.revenue_ltm)}</div><div class="snap-stat__lbl">LTM Revenue</div></div>
          <div class="snap-stat"><div class="snap-stat__val">${fmt.usdM(f.ebitda_ltm)}</div><div class="snap-stat__lbl">LTM EBITDA</div></div>
          <div class="snap-stat"><div class="snap-stat__val">${fmt.pct(f.ebitda_margin_ltm)}</div><div class="snap-stat__lbl">EBITDA Margin</div></div>
          <div class="snap-stat"><div class="snap-stat__val">${fmt.usdB(f.market_cap)}</div><div class="snap-stat__lbl">Market Cap</div></div>
          <div class="snap-stat"><div class="snap-stat__val">${fmt.usdB(f.ev)}</div><div class="snap-stat__lbl">Enterprise Value</div></div>
          <div class="snap-stat"><div class="snap-stat__val">${fmt.usdM(f.net_debt)}</div><div class="snap-stat__lbl">Net Debt</div></div>
        </div>
      </div>
    </div>`;
}

function renderSlide3() {
  const el = document.getElementById('slide3Body'); if (!el) return;
  const v = PITCH_DATA.valuation, dcf = PITCH_DATA.dcf, lbo = PITCH_DATA.lbo;
  el.innerHTML = `
    <div class="valuation-layout">
      <div>
        <div class="chart-wrap"><canvas id="footballFieldChart"></canvas></div>
        <div class="source-line mt-8">
          <strong>Sources:</strong> Bloomberg; PitchBook; Mgmt projections. Per diluted share.
          Recommended: <strong style="color:var(--hilite)">${v.recommendedLabel}</strong>
        </div>
        <div class="dcf-mini">
          <h4>DCF — Management Base Case Projections</h4>
          <table class="dcf-table">
            <thead><tr><th style="text-align:left">Year</th><th>Revenue ($M)</th><th>EBITDA Margin</th><th>EBITDA ($M)</th><th>FCF ($M)</th></tr></thead>
            <tbody>${dcf.years.map((y,i)=>`<tr><td>${y}E</td><td>${fmt.usdM(dcf.revenue[i])}</td><td>${fmt.pct(dcf.ebitda_margin[i])}</td><td>${fmt.usdM(dcf.ebitda[i])}</td><td>${fmt.usdM(dcf.fcf[i])}</td></tr>`).join('')}</tbody>
          </table>
          <div class="source-line mt-8">WACC: ${fmt.pct(dcf.wacc_base)} · Terminal growth: ${fmt.pct(dcf.tgr_base)} · TV implied: ${fmt.mult(dcf.tv_implied_mult)} EV/EBITDA · <strong>Source:</strong> ${dcf.source}</div>
        </div>
        <div class="dcf-mini" style="margin-top:16px">
          <h4>Illustrative LBO — Sponsor Returns</h4>
          <table class="dcf-table">
            <thead><tr><th style="text-align:left">Metric</th><th>Base</th><th>Range</th><th colspan="2">Key Assumptions</th></tr></thead>
            <tbody>
              <tr><td>IRR</td><td>${fmt.pct(lbo.irr_base)}</td><td>${fmt.pct(lbo.irr_range[0])}–${fmt.pct(lbo.irr_range[1])}</td><td colspan="2">Entry ${fmt.mult(lbo.entry_ebitda_mult)} · ${fmt.pct(lbo.equity_pct)} equity</td></tr>
              <tr><td>MOIC</td><td>${lbo.moic_base.toFixed(1)}×</td><td>${lbo.moic_range[0].toFixed(1)}×–${lbo.moic_range[1].toFixed(1)}×</td><td colspan="2">Exit ${fmt.mult(lbo.exit_mult_base)} · 5-year hold</td></tr>
              <tr class="highlight"><td>Entry EV</td><td colspan="2">${fmt.usdM(lbo.entry_ev)}</td><td colspan="2">Leverage ${fmt.mult(lbo.debt_ebitda_entry)} @ ${fmt.pct(lbo.interest_rate)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <div class="val-methods">
          ${v.methodologies.map(m=>`
            <div class="val-method-card">
              <div class="val-method-card__name">${m.name}</div>
              <div class="val-method-card__range">${fmt.usd(m.min)} – ${fmt.usd(m.max)}</div>
              <div class="val-method-card__median">Median: ${fmt.usd(m.median)}</div>
              <div class="val-method-card__sub">${m.subtext}</div>
            </div>`).join('')}
        </div>
        <div class="val-recommended">
          <div class="val-recommended__label">Recommended Range</div>
          <div class="val-recommended__range">${fmt.usd(v.recommendedRange.low)} – ${fmt.usd(v.recommendedRange.high)}<span style="font-size:13px;font-weight:600"> /share</span></div>
          <div style="font-size:11px;color:var(--hilite);margin-top:6px;opacity:0.85">Reflects control premium over current price of ${fmt.usd(v.currentPrice)}.</div>
        </div>
        <div class="source-line mt-8">Current price: <strong>${fmt.usd(v.currentPrice)}</strong> (NASDAQ, 31-Mar-2025)</div>
      </div>
    </div>`;
  requestAnimationFrame(initFootballField);
}

function initFootballField() {
  const canvas = document.getElementById('footballFieldChart'); if (!canvas) return;
  const existing = Chart.getChart(canvas); if (existing) existing.destroy();
  const v = PITCH_DATA.valuation, methods = v.methodologies;
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: methods.map(m => m.name),
      datasets: [
        { label:'Range',  data: methods.map(m=>[m.min,m.max]),               backgroundColor:'rgba(27,108,168,0.72)', borderColor:'#1B6CA8', borderWidth:1.5, borderRadius:4, barThickness:34 },
        { label:'Median', data: methods.map(m=>[m.median-0.18,m.median+0.18]), backgroundColor:'#0B2545', borderColor:'#0B2545', borderWidth:0, barThickness:34 }
      ]
    },
    options: {
      indexAxis:'y', responsive:true, maintainAspectRatio:false,
      scales: {
        x: { min:22, max:46, title:{display:true,text:'Implied Value per Share ($)',color:'#6B7280',font:{size:11}}, grid:{color:'rgba(238,242,247,0.9)'}, ticks:{callback:v=>`$${v}`,color:'#6B7280',font:{size:11}} },
        y: { grid:{display:false}, ticks:{color:'#1A1A2E',font:{weight:'600',size:12}} }
      },
      plugins: {
        legend:{display:false},
        tooltip:{ callbacks:{ title:ctx=>ctx[0].dataset.label==='Median'?'Median':'Range', label:ctx=>{ const [lo,hi]=ctx.raw; return ctx.dataset.label==='Median'?` Median: $${((lo+hi)/2).toFixed(2)}/sh`:` $${lo.toFixed(2)} – $${hi.toFixed(2)}/sh`; } } },
        annotation:{ annotations:{
          currentPrice:{ type:'line', xMin:v.currentPrice, xMax:v.currentPrice, borderColor:'#13315C', borderWidth:2, borderDash:[5,4], label:{display:true,content:[`Current`,`$${v.currentPrice.toFixed(2)}`],position:'start',yAdjust:-58,color:'#13315C',backgroundColor:'rgba(255,255,255,0.9)',font:{size:10,weight:'bold'},padding:4,borderRadius:3} },
          recBand:{ type:'box', xMin:v.recommendedRange.low, xMax:v.recommendedRange.high, backgroundColor:'rgba(138,109,31,0.10)', borderColor:'rgba(138,109,31,0.40)', borderWidth:1, borderDash:[4,3], label:{display:true,content:`Rec. $${v.recommendedRange.low}–$${v.recommendedRange.high}`,color:'#8A6D1F',font:{size:9.5,weight:'bold'},position:{x:'center',y:'start'},yAdjust:6} }
        }}
      }
    }
  });
}

function renderSlide4() {
  const el = document.getElementById('slide4Body'); if (!el) return;
  const peers = PITCH_DATA.tradingComps, active = peers.filter(p=>!p.outlier), t = PITCH_DATA.target;
  const mER=median(active.map(p=>p.ev_rev_ltm)), mEL=median(active.map(p=>p.ev_ebitda_ltm));
  const mEN=median(active.map(p=>p.ev_ebitda_ntm)), mPE=median(active.map(p=>p.pe_ntm));
  const mMa=median(active.map(p=>p.ebitda_margin)), mGr=median(active.map(p=>p.rev_growth));
  el.innerHTML = `
    <div class="comps-table-wrap"><table class="comps-table">
      <thead><tr><th>Company</th><th>Ticker</th><th>EV ($B)</th><th>EV/Rev LTM</th><th>EV/EBITDA LTM</th><th>EV/EBITDA NTM</th><th>P/E NTM</th><th>EBITDA Marg.</th><th>Rev Growth</th></tr></thead>
      <tbody>
        <tr class="target-row"><td><strong>${t.name}</strong> ★</td><td>${t.ticker}</td><td>${fmt.usdB(t.financials.ev)}</td><td>${fmt.mult(t.financials.ev_rev_ltm)}</td><td>${fmt.mult(t.financials.ev_ebitda_ltm)}</td><td>${fmt.mult(t.financials.ev_ebitda_ntm)}</td><td>${fmt.mult(t.financials.pe_ntm)}</td><td>${fmt.pct(t.financials.ebitda_margin_ltm)}</td><td class="text-positive">${fmt.pct(t.financials.revenue_growth_yoy)}</td></tr>
        ${peers.map(p=>`<tr class="${p.outlier?'outlier-row':''}"><td><strong>${p.company}</strong></td><td class="text-muted">${p.ticker}</td><td>${fmt.usdB(p.ev)}</td><td>${fmt.mult(p.ev_rev_ltm)}</td><td>${fmt.mult(p.ev_ebitda_ltm)}</td><td>${fmt.mult(p.ev_ebitda_ntm)}</td><td>${fmt.mult(p.pe_ntm)}</td><td>${fmt.pct(p.ebitda_margin)}</td><td class="text-positive">${fmt.pct(p.rev_growth)}</td></tr>`).join('')}
        <tr class="median-row"><td colspan="2">Peer Median (ex. outlier)</td><td>—</td><td>${fmt.mult(mER)}</td><td>${fmt.mult(mEL)}</td><td>${fmt.mult(mEN)}</td><td>${fmt.mult(mPE)}</td><td>${fmt.pct(mMa)}</td><td>${fmt.pct(mGr)}</td></tr>
      </tbody>
    </table></div>
    <p class="outlier-note">† Helix Networks (HLXN) excluded from median — large-cap premium and cloud-transition phase distort margins.</p>
    <div class="source-line mt-8"><strong>Source:</strong> ${PITCH_DATA.meta.dataSourceEquity}. LTM ended 31-Mar-2025. NTM = Bloomberg median consensus.</div>`;
}

function renderSlide5() {
  const el = document.getElementById('slide5Body'); if (!el) return;
  const txns = PITCH_DATA.precedentTransactions;
  const mM=median(txns.map(t=>t.ev_ebitda)), mP=median(txns.map(t=>t.premium)), mV=median(txns.map(t=>t.deal_value));
  el.innerHTML = `
    <div style="overflow-x:auto"><table class="prec-table">
      <thead><tr><th>Date</th><th>Acquirer</th><th>Target</th><th>Deal Value</th><th>EV/EBITDA</th><th>Premium¹</th><th>Status</th></tr></thead>
      <tbody>
        ${txns.map(t=>`<tr><td>${t.date}</td><td>${t.acquirer}</td><td><strong>${t.target}</strong></td><td>${fmt.usdB(t.deal_value)}</td><td>${fmt.mult(t.ev_ebitda)}</td><td>${t.premium}%</td><td><span class="status-badge">${t.status}</span></td></tr>${t.note?`<tr style="background:rgba(238,242,247,0.5)"><td colspan="7" style="font-size:10.5px;color:var(--muted);font-style:italic;padding:3px 12px 6px">† ${t.note}</td></tr>`:''}`).join('')}
        <tr class="median-row"><td colspan="3">Median</td><td>${fmt.usdB(mV)}</td><td>${fmt.mult(mM)}</td><td>${mP}%</td><td>—</td></tr>
      </tbody>
    </table></div>
    <div class="source-line mt-8"><strong>Source:</strong> ${PITCH_DATA.meta.dataSourceDeals}. ¹ Premium to unaffected price 30 days prior to announcement.</div>`;
}

function renderSlide6() {
  const el = document.getElementById('slide6Body'); if (!el) return;
  el.innerHTML = `
    <div class="process-timeline">
      ${PITCH_DATA.process.map((s,i)=>`
        <div class="process-step">
          <div class="process-card ${i===PITCH_DATA.process.length-1?'final':''}">
            <div class="process-card__num">${s.step}</div>
            <div class="process-card__title">${s.title}</div>
            <div class="process-card__duration">${s.duration}</div>
            <ul class="process-card__milestones">${s.milestones.map(m=>`<li>${m}</li>`).join('')}</ul>
          </div>
          ${i<PITCH_DATA.process.length-1?'<div class="process-arrow">›</div>':''}
        </div>`).join('')}
    </div>
    <p class="process-note">Illustrative only — not a commitment to a process or timeline.</p>`;
}

/* ─── Boot ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  /* Nothing to pre-render — everything waits for Run click */
});
