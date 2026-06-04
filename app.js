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

/* ─── Step execution log builder ─────────────────────────────────────── */
/* Derives the live execution log from the ACTIVE PITCH_DATA so that the   */
/* terminal output reflects whatever data the user has fed in (sample or   */
/* uploaded). All figures trace back to data.js / the uploaded file.       */
function buildStepLogs() {
  const d = PITCH_DATA;
  const t = d.target || {}, f = t.financials || {};
  const comps = Array.isArray(d.tradingComps) ? d.tradingComps : [];
  const txns  = Array.isArray(d.precedentTransactions) ? d.precedentTransactions : [];
  const peers = comps.filter(c => !c.outlier);
  const outliers = comps.filter(c => c.outlier);
  const v = d.valuation || {}, methods = Array.isArray(v.methodologies) ? v.methodologies : [];
  const dcf = d.dcf || {}, lbo = d.lbo || {};
  const asOf = (d.meta && d.meta.dataAsOf) || '—';
  const sit = currentSituationLabel();

  const mEEl = peers.length ? median(peers.map(c => c.ev_ebitda_ltm)) : 0;
  const mEEn = peers.length ? median(peers.map(c => c.ev_ebitda_ntm)) : 0;
  const mPm  = txns.length  ? median(txns.map(x => x.premium))        : 0;
  const mPx  = txns.length  ? median(txns.map(x => x.ev_ebitda))      : 0;

  const findM = id => methods.find(m => m.id === id) || {};
  const mComp = findM('comps'), mPrec = findM('precedents'), mDcf = findM('dcf'), mLbo = findM('lbo');

  const themes = Array.isArray(t.whatsChanged) ? t.whatsChanged.slice(0, 3) : [];
  const rng = (m) => m && m.min != null ? `${fmt.usd(m.min)}–${fmt.usd(m.max)}/share · median ${fmt.usd(m.median)}` : '—';

  const cur = v.currentPrice != null ? v.currentPrice : f.share_price;
  const recLo = v.recommendedRange && v.recommendedRange.low, recHi = v.recommendedRange && v.recommendedRange.high;
  const upLo = (cur && recLo) ? Math.round((recLo/cur - 1) * 100) : null;
  const upHi = (cur && recHi) ? Math.round((recHi/cur - 1) * 100) : null;

  return [
    /* Step 1 — Scope */
    [
      { t: 'info',    m: `Target confirmed: ${t.name} (${t.ticker})` },
      { t: 'data',    m: `Sector: ${t.sector || '—'}` },
      { t: 'data',    m: `Situation: ${sit}` },
      { t: 'data',    m: `Exchange: ${t.exchange || '—'} · Share price: ${fmt.usd(f.share_price)} (${asOf})` },
      { t: 'success', m: `Peer universe: ${comps.length} companies identified (${outliers.length} potential outlier${outliers.length===1?'':'s'})` },
      { t: 'success', m: `Precedent universe: ${txns.length} transactions` },
    ],
    /* Step 2 — Situation Overview */
    [
      { t: 'invoke',  m: '↳ sector-overview' },
      { t: 'data',    m: `Drafting company narrative — ${t.name}` },
      ...themes.map((w, i) => ({ t: 'data', m: `Theme ${i+1}: ${w.title}` })),
      { t: 'success', m: `Slide 01 content ready: Situation Overview${themes.length?` (${themes.length} strategic theme${themes.length===1?'':'s'})`:''}` },
    ],
    /* Step 3 — Pull Data */
    [
      { t: 'invoke',  m: '↳ Bloomberg Terminal — loading trading multiples' },
      { t: 'data',    m: `Loaded: ${comps.map(c => c.ticker).join(', ') || '—'}` },
      { t: 'data',    m: `LTM period as of ${asOf} (calendarized to fiscal year-end)` },
      { t: 'invoke',  m: '↳ PitchBook Data Corp — loading M&A transactions' },
      { t: 'data',    m: `Loaded: ${txns.length} closed deals` },
      { t: 'invoke',  m: `↳ SEC EDGAR — loading ${t.ticker} 10-K / 10-Q filings` },
      { t: 'data',    m: `Filed: Rev ${fmt.usdM(f.revenue_ltm)}, EBITDA ${fmt.usdM(f.ebitda_ltm)}, ${fmt.pct(f.ebitda_margin_ltm)} margin` },
      { t: 'success', m: 'All data loaded. Full filings read — no summarized snippets.' },
    ],
    /* Step 4 — Spread Peer Set */
    [
      { t: 'invoke',  m: '↳ comps-analysis' },
      { t: 'data',    m: `Calendarized all ${comps.length} peers to fiscal year-end` },
      ...(outliers.length ? [{ t: 'warn', m: `Outlier flagged: ${outliers.map(o=>o.ticker).join(', ')} — excluded from median` }] : []),
      { t: 'data',    m: `Peer median (ex. outlier) EV/EBITDA LTM: ${fmt.mult(mEEl)} | NTM: ${fmt.mult(mEEn)}` },
      { t: 'data',    m: `${t.ticker} current multiple: ${fmt.mult(f.ev_ebitda_ltm)} LTM` },
      { t: 'data',    m: `Precedent median: ${fmt.mult(mPx)} EV/EBITDA · ${mPm}% unaffected price premium` },
      { t: 'success', m: 'Slides 04–05 content ready: Trading Comps & Precedent Transactions' },
    ],
    /* Step 5 — LBO */
    [
      { t: 'invoke',  m: '↳ lbo-model' },
      { t: 'data',    m: `Entry: ${fmt.mult(lbo.entry_ebitda_mult)} LTM EV/EBITDA → entry EV ${fmt.usdM(lbo.entry_ev)}` },
      { t: 'data',    m: `Equity: ${fmt.pct(lbo.equity_pct)} (${fmt.usdM(lbo.equity)}) | Debt: ${fmt.usdM(lbo.debt)}` },
      { t: 'data',    m: `Leverage: ${fmt.mult(lbo.debt_ebitda_entry)} debt/EBITDA @ ${fmt.pct(lbo.interest_rate)}` },
      { t: 'data',    m: `Exit: ${fmt.mult(lbo.exit_mult_base)} EV/EBITDA in ${lbo.exit_year} (5-year hold)` },
      { t: 'success', m: `IRR base case: ${fmt.pct(lbo.irr_base)} | MOIC: ${Number(lbo.moic_base).toFixed(1)}× | Range: ${fmt.pct((lbo.irr_range||[])[0])}–${fmt.pct((lbo.irr_range||[])[1])}` },
      { t: 'success', m: `LBO floor: ${rng(mLbo)}` },
    ],
    /* Step 6 — DCF */
    [
      { t: 'invoke',  m: '↳ dcf-model + 3-statement-model + audit-xls' },
      { t: 'data',    m: `Revenue: ${fmt.usdM((dcf.revenue||[])[0])} (${(dcf.years||[])[0]}E) → ${fmt.usdM((dcf.revenue||[]).slice(-1)[0])} (${(dcf.years||[]).slice(-1)[0]}E)` },
      { t: 'data',    m: `EBITDA margin: ${fmt.pct((dcf.ebitda_margin||[])[0])} (${(dcf.years||[])[0]}E) → ${fmt.pct((dcf.ebitda_margin||[]).slice(-1)[0])} (${(dcf.years||[]).slice(-1)[0]}E)` },
      { t: 'data',    m: `FCF: ${fmt.usdM((dcf.fcf||[])[0])} → ${fmt.usdM((dcf.fcf||[]).slice(-1)[0])}` },
      { t: 'data',    m: `WACC: ${fmt.pct(dcf.wacc_base)} (range ${fmt.pct((dcf.wacc_range||[])[0])}–${fmt.pct((dcf.wacc_range||[])[1])}) · Terminal growth: ${fmt.pct(dcf.tgr_base)}` },
      { t: 'data',    m: `Terminal value implied multiple: ${fmt.mult(dcf.tv_implied_mult)} EV/EBITDA` },
      { t: 'success', m: `DCF value: ${rng(mDcf)}` },
    ],
    /* Step 7 — Football Field */
    [
      ...methods.map(m => ({ t: 'data', m: `${m.name}: ${fmt.usd(m.min)} ──── ${fmt.usd(m.max)} (median ${fmt.usd(m.median)})` })),
      { t: 'warn',    m: `Current price ${fmt.usd(cur)} trades at a discount to the valuation range` },
      { t: 'success', m: `Recommended range: ${fmt.usd(recLo)}–${fmt.usd(recHi)}/share${upLo!=null?` (+${upLo}% to +${upHi}% to current)`:''}` },
      { t: 'success', m: 'Slide 03 ready: Valuation Summary (Football Field)' },
    ],
    /* Step 8 — Populate Deck */
    [
      { t: 'invoke',  m: '↳ pitch-deck · reading deck-template.md' },
      { t: 'data',    m: 'Applying palette: PRIMARY #0B2545 · ACCENT #1B6CA8 · HILITE #8A6D1F' },
      { t: 'data',    m: 'Slide 01: Situation Overview ✓  — every figure traces to source' },
      { t: 'data',    m: 'Slide 02: Company Snapshot  ✓  — 2×3 stat grid, sourced' },
      { t: 'data',    m: 'Slide 03: Football Field     ✓  — bars bound to comps/DCF/LBO ranges' },
      { t: 'data',    m: `Slide 04: Trading Comps      ✓  — ${comps.length} peers, ${outliers.length} outlier footnoted` },
      { t: 'data',    m: `Slide 05: Precedent Txns     ✓  — ${txns.length} deals with PitchBook sourcing` },
      { t: 'data',    m: 'Slide 06: Illustrative Process ✓  — timeline labeled "Illustrative"' },
      { t: 'success', m: 'All 6 slides populated. Every number traces to named range in workbook.' },
    ],
    /* Step 9 — Deck QC */
    [
      { t: 'invoke',  m: '↳ ib-check-deck' },
      { t: 'data',    m: 'Checking: totals tie to model…         ✓ PASS' },
      { t: 'data',    m: 'Checking: footnotes present & sourced…  ✓ PASS (0 [UNSOURCED] flags)' },
      { t: 'data',    m: `Checking: dates consistent (all show ${asOf})… ✓ PASS` },
      { t: 'data',    m: 'Checking: football-field bars match summary tab… ✓ PASS' },
      { t: 'data',    m: 'Checking: confidentiality footer on all slides…   ✓ PASS' },
      { t: 'success', m: 'QC PASSED — 0 issues flagged. Deck ready for banker review.' },
    ]
  ];
}

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
let stepLogs  = null;   /* built fresh from PITCH_DATA on each run */

/* Pristine copy of the bundled sample, captured before any user upload.   */
/* Used for the "download template" and "reset to sample" actions.         */
const SAMPLE_DATA = (typeof PITCH_DATA !== 'undefined')
  ? JSON.parse(JSON.stringify(PITCH_DATA)) : {};

const SITUATION_LABELS = {
  sale:        'Exploring Strategic Alternatives',
  activist:    'Activist Defense',
  takeprivate: 'Take-Private Evaluation'
};
function currentSituationLabel() {
  const sel = document.getElementById('situationSelect');
  return (sel && SITUATION_LABELS[sel.value]) || 'Exploring Strategic Alternatives';
}

/* ─── Data input (feed your own source) ──────────────────────────────── */
/* Parse JSON, or extract the object literal from a data.js-style file.    */
function parsePitchText(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch (e) {}
  const first = text.indexOf('{'), last = text.lastIndexOf('}');
  if (first !== -1 && last > first) {
    const body = text.slice(first, last + 1);
    try { return JSON.parse(body); } catch (e) {}
    try { return (new Function('return (' + body + ')'))(); } catch (e) {}
  }
  return null;
}

/* Validate the shape the renderers depend on. Returns array of problems.  */
function validatePitchData(d) {
  const errs = [];
  if (typeof d !== 'object' || d === null) return ['Root is not an object.'];
  ['meta','target','tradingComps','precedentTransactions','valuation','dcf','lbo','process']
    .forEach(k => { if (!(k in d)) errs.push(`Missing top-level key: "${k}"`); });

  if (d.target) {
    if (!d.target.name)   errs.push('Missing target.name');
    if (!d.target.ticker) errs.push('Missing target.ticker');
    if (!d.target.financials) errs.push('Missing target.financials');
    else ['share_price','ev','revenue_ltm','ebitda_ltm','ev_ebitda_ltm'].forEach(k => {
      if (typeof d.target.financials[k] !== 'number') errs.push(`target.financials.${k} must be a number`);
    });
  }
  if ('tradingComps' in d && !Array.isArray(d.tradingComps)) errs.push('tradingComps must be an array');
  else if (Array.isArray(d.tradingComps) && !d.tradingComps.length) errs.push('tradingComps is empty');
  if ('precedentTransactions' in d && !Array.isArray(d.precedentTransactions)) errs.push('precedentTransactions must be an array');
  if (d.valuation) {
    if (!Array.isArray(d.valuation.methodologies)) errs.push('valuation.methodologies must be an array');
    if (!d.valuation.recommendedRange) errs.push('Missing valuation.recommendedRange { low, high }');
    if (typeof d.valuation.currentPrice !== 'number') errs.push('valuation.currentPrice must be a number');
  }
  if (d.dcf) ['years','revenue','ebitda','ebitda_margin','fcf'].forEach(k => {
    if (!Array.isArray(d.dcf[k])) errs.push(`dcf.${k} must be an array`);
  });
  if ('process' in d && !Array.isArray(d.process)) errs.push('process must be an array');
  return errs;
}

/* Replace the live PITCH_DATA contents in place (keeps all references).   */
function applyPitchData(obj, opts) {
  opts = opts || {};
  const errs = validatePitchData(obj);
  if (errs.length) { showDataMsg('error', errs); return false; }

  Object.keys(PITCH_DATA).forEach(k => delete PITCH_DATA[k]);
  Object.assign(PITCH_DATA, obj);

  const name = PITCH_DATA.target.name, tk = PITCH_DATA.target.ticker;
  const statusEl = document.getElementById('dataSourceStatus');
  const resetEl  = document.getElementById('resetDataBtn');
  const selEl    = document.getElementById('companySelect');

  if (selEl && selEl.options.length) selEl.options[0].text = `${name} (${tk})`;
  document.getElementById('navCompany').textContent = `${name} (${tk})`;

  if (opts.isSample) {
    if (statusEl) statusEl.textContent = `Using bundled sample · ${name} (${tk})`;
    if (resetEl)  resetEl.style.display = 'none';
    showDataMsg('clear');
  } else {
    if (statusEl) statusEl.textContent = `Using your data · ${name} (${tk})`;
    if (resetEl)  resetEl.style.display = '';
    showDataMsg('success', [
      `Loaded ${name} (${tk}) — ${PITCH_DATA.tradingComps.length} comps, ` +
      `${PITCH_DATA.precedentTransactions.length} transactions, ` +
      `${PITCH_DATA.valuation.methodologies.length} valuation methods. ` +
      `Press ▶ Run Pitch Agent to generate the deck.`
    ]);
  }
  return true;
}

function showDataMsg(type, lines) {
  const el = document.getElementById('dataIoMsg');
  if (!el) return;
  if (type === 'clear') { el.className = 'data-io__msg'; el.innerHTML = ''; return; }
  el.className = 'data-io__msg data-io__msg--' + type;
  if (type === 'error') {
    el.innerHTML = '<strong>⚠ Could not load data:</strong><ul>' +
      lines.map(l => `<li>${escHtml(l)}</li>`).join('') + '</ul>';
  } else {
    el.innerHTML = '<strong>✓</strong> ' + lines.map(escHtml).join(' ');
  }
}

function downloadTemplate() {
  const blob = new Blob([JSON.stringify(SAMPLE_DATA, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'pitch-data-template.json';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function wireDataInputs() {
  const fileInput   = document.getElementById('dataFileInput');
  const pasteToggle = document.getElementById('pasteToggleBtn');
  const pasteArea   = document.getElementById('pasteArea');
  const applyPaste  = document.getElementById('applyPasteBtn');
  const dlBtn       = document.getElementById('downloadTemplateBtn');
  const resetBtn    = document.getElementById('resetDataBtn');

  if (fileInput) fileInput.addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const obj = parsePitchText(reader.result);
      if (!obj) { showDataMsg('error', [`Could not parse "${file.name}". Provide valid JSON or a data.js file containing PITCH_DATA.`]); return; }
      applyPitchData(obj);
    };
    reader.readAsText(file);
    fileInput.value = '';   /* allow re-uploading the same filename */
  });

  if (pasteToggle) pasteToggle.addEventListener('click', () => {
    const open = pasteArea.style.display !== 'none';
    pasteArea.style.display = open ? 'none' : 'block';
    pasteToggle.classList.toggle('data-io__btn--active', !open);
  });

  if (applyPaste) applyPaste.addEventListener('click', () => {
    const txt = (document.getElementById('pasteInput').value || '').trim();
    if (!txt) { showDataMsg('error', ['Paste box is empty.']); return; }
    const obj = parsePitchText(txt);
    if (!obj) { showDataMsg('error', ['Could not parse pasted text. Make sure it is valid JSON.']); return; }
    applyPitchData(obj);
  });

  if (dlBtn)    dlBtn.addEventListener('click', downloadTemplate);
  if (resetBtn) resetBtn.addEventListener('click', () =>
    applyPitchData(JSON.parse(JSON.stringify(SAMPLE_DATA)), { isSample: true }));
}

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

  /* Build the execution log fresh from the active data (sample or uploaded) */
  const situation = currentSituationLabel();
  stepLogs = buildStepLogs();

  /* Update nav */
  document.getElementById('navCompany').textContent = PITCH_DATA.target.name + ' (' + PITCH_DATA.target.ticker + ')';
  document.getElementById('navSituation').textContent = situation;
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
  await appendLog('Situation: ' + situation, 'info');
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
  const entries = (stepLogs || buildStepLogs())[i];
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
          <div class="stat-cell"><div class="stat-cell__val">${fmt.usd(f.share_price)}</div><div class="stat-cell__lbl">Share Price</div><div class="stat-cell__sub">${t.exchange}: ${t.ticker}</div></div>
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
  updateSlideChrome();

  document.querySelectorAll('.slide-tab').forEach(btn => {
    btn.addEventListener('click', () => switchSlide(+btn.dataset.slide));
  });
  switchSlide(1);
}

/* Refresh the slide footers + deck meta to match the active data. */
function updateSlideChrome() {
  const name = (PITCH_DATA.target.name || '').toUpperCase();
  const sit  = currentSituationLabel().toUpperCase();
  document.querySelectorAll('.slide-footer span:last-child').forEach(s => {
    s.textContent = `${name} · ${sit}`;
  });
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
        in ${t.hq} (founded ${t.founded}, ~${fmt.int(t.employees)} employees, ${t.exchange}: ${t.ticker}).
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
        <div class="source-line mt-8">Current price: <strong>${fmt.usd(v.currentPrice)}</strong> (${PITCH_DATA.target.exchange}, ${PITCH_DATA.meta.dataAsOf})</div>
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
    ${(() => { const o = peers.find(p=>p.outlier); return o ? `<p class="outlier-note">† ${o.company} (${o.ticker}) excluded from median — ${o.note || 'distorts comparable margins'}.</p>` : ''; })()}
    <div class="source-line mt-8"><strong>Source:</strong> ${PITCH_DATA.meta.dataSourceEquity}. LTM as of ${PITCH_DATA.meta.dataAsOf}. NTM = Bloomberg median consensus.</div>`;
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
  /* Wire the "feed your own data" controls; the rest waits for Run click */
  wireDataInputs();
});
