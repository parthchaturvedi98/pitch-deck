/* app.js — Pitch Agent Skill Visualizer */

/* ─── Workflow steps (mirrors SKILL.md §Workflow) ───────────────────── */
const WORKFLOW_STEPS = [
  {
    id: 1,
    title: "Scope the Ask",
    desc: "Confirm target, sector & situation. Identify 5–8 trading comps and 5–10 precedent transactions.",
    skill: null,
    slideRef: null
  },
  {
    id: 2,
    title: "Situation Overview",
    desc: "Draft company snapshot and strategic-rationale narrative — business description, market position, what's changed, why now.",
    skill: "sector-overview",
    slideRef: 1
  },
  {
    id: 3,
    title: "Pull Data",
    desc: "Pull trading multiples, precedent transaction data, and latest filings from Bloomberg and PitchBook.",
    skill: null,
    slideRef: null
  },
  {
    id: 4,
    title: "Spread Peer Set",
    desc: "Lay out trading comps and precedent transactions with consistent metric definitions and outlier flags.",
    skill: "comps-analysis",
    slideRef: 4
  },
  {
    id: 5,
    title: "Sponsor Case (LBO)",
    desc: "Illustrative LBO at market leverage — entry/exit assumptions, sources & uses, returns sensitivity.",
    skill: "lbo-model",
    slideRef: 3
  },
  {
    id: 6,
    title: "DCF & 3-Statement",
    desc: "Build DCF and 3-statement model following audit-xls conventions: blue inputs, black formulas, green cross-sheet links.",
    skill: "dcf-model",
    slideRef: 3
  },
  {
    id: 7,
    title: "Football Field",
    desc: "Compute min/median/max from each methodology. Overlay current trading price as a dashed marker.",
    skill: null,
    slideRef: 3
  },
  {
    id: 8,
    title: "Populate Deck",
    desc: "Populate 6 slides on firm's branded template. Every number traces to a named range in the workbook.",
    skill: "pitch-deck",
    slideRef: null
  },
  {
    id: 9,
    title: "Deck QC",
    desc: "Verify totals tie to model, footnotes present and sourced, dates consistent, football-field bars match summary tab.",
    skill: "ib-check-deck",
    slideRef: null
  }
];

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const fmt = {
  usd:    v => `$${Number(v).toFixed(2)}`,
  usdM:   v => `$${Number(v).toFixed(1)}M`,
  usdB:   v => `$${(Number(v)/1000).toFixed(1)}B`,
  mult:   v => `${Number(v).toFixed(1)}×`,
  pct:    v => `${Number(v).toFixed(1)}%`,
  int:    v => Number(v).toLocaleString()
};

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[m - 1] + sorted[m]) / 2
    : sorted[m];
}

/* ─── Render workflow pipeline ───────────────────────────────────────── */
function renderWorkflow() {
  const container = document.getElementById('workflowSteps');
  if (!container) return;

  container.innerHTML = WORKFLOW_STEPS.map((step, i) => {
    const isLast = i === WORKFLOW_STEPS.length - 1;
    const skillTag = step.skill
      ? `<span class="step-card__skill">${step.skill}</span>`
      : '';
    const arrow = isLast ? '' : `<div class="step-arrow">›</div>`;
    return `
      <div class="workflow-step">
        <div class="step-card" data-slide-ref="${step.slideRef || ''}"
             onclick="handleStepClick(${step.slideRef})">
          <span class="step-card__check">✓</span>
          <div class="step-card__num">Step ${step.id}</div>
          <div class="step-card__title">${step.title}</div>
          <div class="step-card__desc">${step.desc}</div>
          ${skillTag}
        </div>
        ${arrow}
      </div>`;
  }).join('');
}

function handleStepClick(slideRef) {
  if (!slideRef) return;
  switchSlide(slideRef);
  const deck = document.getElementById('deck');
  if (deck) deck.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─── Render skill overview ──────────────────────────────────────────── */
function renderSkillOverview() {
  const card = document.getElementById('skillOverview');
  if (!card) return;
  card.innerHTML = `
    <div class="skill-overview-header">
      <h3>📋 pitch-agent — Skill Definition</h3>
      <button class="skill-desc-btn" onclick="toggleSkillBody()">Show / Hide Details</button>
    </div>
    <div class="skill-overview-body" id="skillBody">
      <p class="skill-what">
        End-to-end investment banking pitch agent for the coverage &amp; advisory workflow.
        Given a target company and a one-line strategic situation, it autonomously pulls trading comps
        and precedent transactions, builds a DCF, an illustrative LBO, and a football-field valuation,
        and generates a branded first-draft pitch deck on the firm's PowerPoint template.
      </p>
      <div class="skill-artifacts">
        <div class="artifact-chip">
          <span class="artifact-chip__icon">📊</span>
          <div>
            <div class="artifact-chip__name">Excel Valuation Workbook</div>
            <div class="artifact-chip__desc">Comps · Precedents · DCF · LBO · Football Field</div>
          </div>
        </div>
        <div class="artifact-chip">
          <span class="artifact-chip__icon">📑</span>
          <div>
            <div class="artifact-chip__name">Pitch Deck (6 Slides)</div>
            <div class="artifact-chip__desc">Situation · Snapshot · Valuation · Comps · Transactions · Process</div>
          </div>
        </div>
      </div>
      <div class="companion-skills">
        <span class="companion-skills__label">Orchestrates:</span>
        ${['sector-overview','comps-analysis','lbo-model','dcf-model','3-statement-model','audit-xls','pitch-deck','ib-check-deck','deck-refresh']
          .map(s => `<span class="companion-badge">${s}</span>`).join('')}
      </div>
    </div>`;
}

function toggleSkillBody() {
  const body = document.getElementById('skillBody');
  if (body) body.style.display = body.style.display === 'none' ? '' : 'none';
}

/* ─── Render input data cards ────────────────────────────────────────── */
function renderInputCards() {
  renderTargetCard();
  renderCompsInputCard();
  renderDealsInputCard();
}

function renderTargetCard() {
  const el = document.getElementById('targetCard');
  if (!el) return;
  const t = PITCH_DATA.target;
  const f = t.financials;
  el.innerHTML = `
    <div class="input-card">
      <div class="input-card__header">
        ${t.name} (${t.ticker})
        <span class="input-card__source">Bloomberg / Filings</span>
      </div>
      <div class="input-card__body">
        <div class="stat-grid">
          <div class="stat-cell">
            <div class="stat-cell__val">${fmt.usd(f.share_price)}</div>
            <div class="stat-cell__lbl">Share Price</div>
            <div class="stat-cell__sub">NASDAQ: ${t.ticker}</div>
          </div>
          <div class="stat-cell">
            <div class="stat-cell__val">${fmt.usdB(f.ev)}</div>
            <div class="stat-cell__lbl">Enterprise Value</div>
            <div class="stat-cell__sub">Market cap + net debt</div>
          </div>
          <div class="stat-cell">
            <div class="stat-cell__val">${fmt.usdM(f.revenue_ltm)}</div>
            <div class="stat-cell__lbl">LTM Revenue</div>
            <div class="stat-cell__sub">+${fmt.pct(f.revenue_growth_yoy)} YoY</div>
          </div>
          <div class="stat-cell">
            <div class="stat-cell__val">${fmt.usdM(f.ebitda_ltm)}</div>
            <div class="stat-cell__lbl">LTM EBITDA</div>
            <div class="stat-cell__sub">${fmt.pct(f.ebitda_margin_ltm)} margin</div>
          </div>
          <div class="stat-cell">
            <div class="stat-cell__val">${fmt.mult(f.ev_ebitda_ltm)}</div>
            <div class="stat-cell__lbl">EV/EBITDA (LTM)</div>
            <div class="stat-cell__sub">NTM: ${fmt.mult(f.ev_ebitda_ntm)}</div>
          </div>
          <div class="stat-cell">
            <div class="stat-cell__val">${fmt.mult(f.ev_rev_ltm)}</div>
            <div class="stat-cell__lbl">EV/Revenue (LTM)</div>
            <div class="stat-cell__sub">P/E NTM: ${fmt.mult(f.pe_ntm)}</div>
          </div>
        </div>
        <div class="source-line mt-8">
          <strong>Source:</strong> ${f.source}
        </div>
      </div>
    </div>`;
}

function renderCompsInputCard() {
  const el = document.getElementById('compsInputCard');
  if (!el) return;
  const peers = PITCH_DATA.tradingComps.filter(c => !c.outlier);
  const mdnEvRev   = median(peers.map(c => c.ev_rev_ltm));
  const mdnEvEbitda = median(peers.map(c => c.ev_ebitda_ltm));
  const mdnPe      = median(peers.map(c => c.pe_ntm));

  el.innerHTML = `
    <div class="input-card">
      <div class="input-card__header">
        Trading Comparables
        <span class="input-card__source">Bloomberg Terminal</span>
      </div>
      <div class="input-card__body">
        <table class="mini-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>EV/Rev</th>
              <th>EV/EBITDA</th>
              <th>Marg.</th>
            </tr>
          </thead>
          <tbody>
            ${PITCH_DATA.tradingComps.map(c => `
              <tr class="${c.outlier ? 'outlier' : ''}">
                <td>${c.ticker}</td>
                <td>${fmt.mult(c.ev_rev_ltm)}</td>
                <td>${fmt.mult(c.ev_ebitda_ltm)}</td>
                <td>${fmt.pct(c.ebitda_margin)}</td>
              </tr>`).join('')}
            <tr class="median">
              <td>Median</td>
              <td>${fmt.mult(mdnEvRev)}</td>
              <td>${fmt.mult(mdnEvEbitda)}</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
        <div class="source-line mt-8">
          <strong>Source:</strong> ${PITCH_DATA.meta.dataSourceEquity}
        </div>
      </div>
    </div>`;
}

function renderDealsInputCard() {
  const el = document.getElementById('dealsInputCard');
  if (!el) return;
  const txns = PITCH_DATA.precedentTransactions;
  const mdnMult = median(txns.map(t => t.ev_ebitda));
  const mdnPrem = median(txns.map(t => t.premium));

  el.innerHTML = `
    <div class="input-card">
      <div class="input-card__header">
        Precedent Transactions
        <span class="input-card__source">PitchBook Data Corp</span>
      </div>
      <div class="input-card__body">
        <table class="mini-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Target</th>
              <th>EV/EBITDA</th>
              <th>Prem.</th>
            </tr>
          </thead>
          <tbody>
            ${txns.map(t => `
              <tr>
                <td>${t.date}</td>
                <td style="font-size:10.5px">${t.target}</td>
                <td>${fmt.mult(t.ev_ebitda)}</td>
                <td>${t.premium}%</td>
              </tr>`).join('')}
            <tr class="median">
              <td colspan="2">Median</td>
              <td>${fmt.mult(mdnMult)}</td>
              <td>${mdnPrem}%</td>
            </tr>
          </tbody>
        </table>
        <div class="source-line mt-8">
          <strong>Source:</strong> ${PITCH_DATA.meta.dataSourceDeals}
        </div>
      </div>
    </div>`;
}

/* ─── Slide rendering ─────────────────────────────────────────────────── */

function renderSlide1() {
  const el = document.getElementById('slide1Body');
  if (!el) return;
  const t = PITCH_DATA.target;
  const cards = t.whatsChanged.map(w => `
    <div class="change-card">
      <h4>${w.title}</h4>
      <p>${w.body}</p>
    </div>`).join('');

  el.innerHTML = `
    <div class="situation-grid">
      <div class="narrative">
        <p><strong style="color:var(--primary)">${t.name}</strong> is a ${t.sector} company headquartered
        in ${t.hq} (founded ${t.founded}, ~${fmt.int(t.employees)} employees, NASDAQ: ${t.ticker}).
        The Company's Board of Directors is exploring strategic alternatives following a period of
        sustained organic growth and a recent wave of sector M&amp;A activity.</p>
        <p>${t.description}</p>
        <p>Revenue has grown at a <strong>${fmt.pct(t.financials.revenue_growth_yoy)} CAGR</strong>
        over the last three years, supported by 94% annual net revenue retention.
        Management projects continued double-digit growth through 2029E, driven by
        cloud-migration tailwinds and expansion within existing accounts.</p>
        <div class="source-line">
          <strong>Source:</strong> ${PITCH_DATA.meta.dataSourceEquity}; ${PITCH_DATA.meta.dataSourceFilings}
        </div>
      </div>
      <div class="cards-col">
        <div style="font-size:12px;font-weight:700;color:var(--secondary);margin-bottom:6px;letter-spacing:0.04em;text-transform:uppercase;">
          What's Changed
        </div>
        ${cards}
      </div>
    </div>`;
}

function renderSlide2() {
  const el = document.getElementById('slide2Body');
  if (!el) return;
  const t = PITCH_DATA.target;
  const f = t.financials;
  el.innerHTML = `
    <div class="snapshot-grid">
      <div>
        <p class="snapshot-desc">${t.description}</p>
        <ul class="snapshot-facts">
          <li><strong>Sector</strong> ${t.sector}</li>
          <li><strong>Headquarters</strong> ${t.hq}</li>
          <li><strong>Founded</strong> ${t.founded}</li>
          <li><strong>Employees</strong> ~${fmt.int(t.employees)}</li>
          <li><strong>Exchange</strong> ${t.exchange}: ${t.ticker}</li>
          <li><strong>Fiscal Period</strong> ${f.fiscal_period}</li>
        </ul>
        <div class="source-line mt-16">
          <strong>Source:</strong> ${f.source}
        </div>
      </div>
      <div>
        <div class="stats-2x3">
          <div class="snap-stat">
            <div class="snap-stat__val">${fmt.usdM(f.revenue_ltm)}</div>
            <div class="snap-stat__lbl">LTM Revenue</div>
          </div>
          <div class="snap-stat">
            <div class="snap-stat__val">${fmt.usdM(f.ebitda_ltm)}</div>
            <div class="snap-stat__lbl">LTM EBITDA</div>
          </div>
          <div class="snap-stat">
            <div class="snap-stat__val">${fmt.pct(f.ebitda_margin_ltm)}</div>
            <div class="snap-stat__lbl">EBITDA Margin</div>
          </div>
          <div class="snap-stat">
            <div class="snap-stat__val">${fmt.usdB(f.market_cap)}</div>
            <div class="snap-stat__lbl">Market Cap</div>
          </div>
          <div class="snap-stat">
            <div class="snap-stat__val">${fmt.usdB(f.ev)}</div>
            <div class="snap-stat__lbl">Enterprise Value</div>
          </div>
          <div class="snap-stat">
            <div class="snap-stat__val">${fmt.usdM(f.net_debt)}</div>
            <div class="snap-stat__lbl">Net Debt</div>
          </div>
        </div>
      </div>
    </div>`;
}

function renderSlide3() {
  const el = document.getElementById('slide3Body');
  if (!el) return;
  const v = PITCH_DATA.valuation;
  const dcf = PITCH_DATA.dcf;
  const lbo = PITCH_DATA.lbo;

  const methodCards = v.methodologies.map(m => `
    <div class="val-method-card">
      <div class="val-method-card__name">${m.name}</div>
      <div class="val-method-card__range">${fmt.usd(m.min)} – ${fmt.usd(m.max)}</div>
      <div class="val-method-card__median">Median: ${fmt.usd(m.median)}</div>
      <div class="val-method-card__sub">${m.subtext}</div>
    </div>`).join('');

  const dcfRows = dcf.years.map((y, i) => `
    <tr>
      <td>${y}E</td>
      <td>${fmt.usdM(dcf.revenue[i])}</td>
      <td>${fmt.pct(dcf.ebitda_margin[i])}</td>
      <td>${fmt.usdM(dcf.ebitda[i])}</td>
      <td>${fmt.usdM(dcf.fcf[i])}</td>
    </tr>`).join('');

  el.innerHTML = `
    <div class="valuation-layout">
      <div>
        <div class="chart-wrap">
          <canvas id="footballFieldChart"></canvas>
        </div>
        <div class="source-line mt-8">
          <strong>Sources:</strong> Bloomberg Terminal; PitchBook Data Corp; Management projections.
          All values per diluted share. Recommended range: <strong style="color:var(--hilite)">${v.recommendedLabel}</strong>
        </div>

        <div class="dcf-mini">
          <h4>DCF — Management Base Case Projections</h4>
          <table class="dcf-table">
            <thead>
              <tr>
                <th style="text-align:left">Year</th>
                <th>Revenue ($M)</th>
                <th>EBITDA Margin</th>
                <th>EBITDA ($M)</th>
                <th>FCF ($M)</th>
              </tr>
            </thead>
            <tbody>
              ${dcfRows}
            </tbody>
          </table>
          <div class="source-line mt-8">
            WACC: ${fmt.pct(dcf.wacc_base)} (range ${fmt.pct(dcf.wacc_range[0])}–${fmt.pct(dcf.wacc_range[1])}) ·
            Terminal growth: ${fmt.pct(dcf.tgr_base)} ·
            Terminal value implied multiple: ${fmt.mult(dcf.tv_implied_mult)} EV/EBITDA ·
            <strong>Source:</strong> ${dcf.source}
          </div>
        </div>

        <div class="dcf-mini" style="margin-top:16px">
          <h4>Illustrative LBO — Sponsor Returns Summary</h4>
          <table class="dcf-table">
            <thead>
              <tr>
                <th style="text-align:left">Metric</th>
                <th>Base Case</th>
                <th>Range</th>
                <th colspan="2">Key Assumptions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>IRR</td>
                <td>${fmt.pct(lbo.irr_base)}</td>
                <td>${fmt.pct(lbo.irr_range[0])} – ${fmt.pct(lbo.irr_range[1])}</td>
                <td colspan="2">Entry: ${fmt.mult(lbo.entry_ebitda_mult)} EV/EBITDA | ${fmt.pct(lbo.equity_pct)} equity</td>
              </tr>
              <tr>
                <td>MOIC</td>
                <td>${lbo.moic_base.toFixed(1)}×</td>
                <td>${lbo.moic_range[0].toFixed(1)}× – ${lbo.moic_range[1].toFixed(1)}×</td>
                <td colspan="2">Exit: ${fmt.mult(lbo.exit_mult_base)} EV/EBITDA | Hold: 5 years</td>
              </tr>
              <tr class="highlight">
                <td>Entry EV</td>
                <td colspan="2">${fmt.usdM(lbo.entry_ev)} (${fmt.mult(lbo.entry_ebitda_mult)} LTM)</td>
                <td colspan="2">Leverage: ${fmt.mult(lbo.debt_ebitda_entry)} debt/EBITDA @ ${fmt.pct(lbo.interest_rate)}</td>
              </tr>
            </tbody>
          </table>
          <div class="source-line mt-8">
            <strong>Source:</strong> ${lbo.source}
          </div>
        </div>
      </div>

      <div>
        <div class="val-methods">
          ${methodCards}
        </div>
        <div class="val-recommended">
          <div class="val-recommended__label">Recommended Range</div>
          <div class="val-recommended__range">${fmt.usd(v.recommendedRange.low)} – ${fmt.usd(v.recommendedRange.high)}<span style="font-size:13px;font-weight:600"> /share</span></div>
          <div style="font-size:11px;color:var(--hilite);margin-top:6px;opacity:0.85">
            Based on precedent transaction medians and DCF base case; reflects control premium over current price of ${fmt.usd(v.currentPrice)}.
          </div>
        </div>
        <div class="source-line mt-8">
          Current trading price: <strong>${fmt.usd(v.currentPrice)}</strong> (NASDAQ, 31-Mar-2025)
        </div>
      </div>
    </div>`;

  /* Initialize chart after DOM insertion */
  requestAnimationFrame(() => initFootballField());
}

function initFootballField() {
  const canvas = document.getElementById('footballFieldChart');
  if (!canvas) return;

  /* Destroy existing instance if re-rendering */
  const existing = Chart.getChart(canvas);
  if (existing) existing.destroy();

  const v = PITCH_DATA.valuation;
  const methods = v.methodologies;

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: methods.map(m => m.name),
      datasets: [
        {
          label: 'Range',
          data: methods.map(m => [m.min, m.max]),
          backgroundColor: 'rgba(27, 108, 168, 0.72)',
          borderColor: '#1B6CA8',
          borderWidth: 1.5,
          borderRadius: 4,
          barThickness: 34
        },
        {
          label: 'Median',
          data: methods.map(m => [m.median - 0.18, m.median + 0.18]),
          backgroundColor: '#0B2545',
          borderColor: '#0B2545',
          borderWidth: 0,
          barThickness: 34,
          borderRadius: 0
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          min: 22,
          max: 46,
          title: {
            display: true,
            text: 'Implied Value per Share ($)',
            color: '#6B7280',
            font: { size: 11 }
          },
          grid: { color: 'rgba(238, 242, 247, 0.9)' },
          ticks: {
            callback: v => `$${v}`,
            color: '#6B7280',
            font: { size: 11 }
          }
        },
        y: {
          grid: { display: false },
          ticks: {
            color: '#1A1A2E',
            font: { weight: '600', size: 12 }
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => ctx[0].dataset.label === 'Median' ? 'Median' : 'Valuation Range',
            label: ctx => {
              const [lo, hi] = ctx.raw;
              if (ctx.dataset.label === 'Median')
                return ` Median: $${((lo + hi) / 2).toFixed(2)}/share`;
              return ` $${lo.toFixed(2)} – $${hi.toFixed(2)}/share`;
            }
          }
        },
        annotation: {
          annotations: {
            currentPrice: {
              type: 'line',
              xMin: v.currentPrice,
              xMax: v.currentPrice,
              borderColor: '#13315C',
              borderWidth: 2,
              borderDash: [5, 4],
              label: {
                display: true,
                content: [`Current`, `$${v.currentPrice.toFixed(2)}`],
                position: 'start',
                yAdjust: -58,
                color: '#13315C',
                backgroundColor: 'rgba(255,255,255,0.90)',
                font: { size: 10, weight: 'bold' },
                padding: 4,
                borderRadius: 3
              }
            },
            recommendedBand: {
              type: 'box',
              xMin: v.recommendedRange.low,
              xMax: v.recommendedRange.high,
              backgroundColor: 'rgba(138, 109, 31, 0.10)',
              borderColor: 'rgba(138, 109, 31, 0.40)',
              borderWidth: 1,
              borderDash: [4, 3],
              label: {
                display: true,
                content: `Rec. $${v.recommendedRange.low}–$${v.recommendedRange.high}`,
                color: '#8A6D1F',
                font: { size: 9.5, weight: 'bold' },
                position: { x: 'center', y: 'start' },
                yAdjust: 6
              }
            }
          }
        }
      }
    }
  });
}

function renderSlide4() {
  const el = document.getElementById('slide4Body');
  if (!el) return;
  const peers = PITCH_DATA.tradingComps;
  const active = peers.filter(p => !p.outlier);
  const mdnEvRevLtm  = median(active.map(p => p.ev_rev_ltm));
  const mdnEvEbLtm   = median(active.map(p => p.ev_ebitda_ltm));
  const mdnEvEbNtm   = median(active.map(p => p.ev_ebitda_ntm));
  const mdnPe        = median(active.map(p => p.pe_ntm));
  const mdnMargin    = median(active.map(p => p.ebitda_margin));
  const mdnGrowth    = median(active.map(p => p.rev_growth));
  const t            = PITCH_DATA.target;

  const rows = peers.map(p => `
    <tr class="${p.outlier ? 'outlier-row' : ''}">
      <td><strong>${p.company}</strong></td>
      <td class="text-muted">${p.ticker}</td>
      <td>${fmt.usdB(p.ev)}</td>
      <td>${fmt.mult(p.ev_rev_ltm)}</td>
      <td>${fmt.mult(p.ev_ebitda_ltm)}</td>
      <td>${fmt.mult(p.ev_ebitda_ntm)}</td>
      <td>${fmt.mult(p.pe_ntm)}</td>
      <td>${fmt.pct(p.ebitda_margin)}</td>
      <td class="text-positive">${fmt.pct(p.rev_growth)}</td>
    </tr>`).join('');

  el.innerHTML = `
    <div class="comps-table-wrap">
      <table class="comps-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Ticker</th>
            <th>EV ($B)</th>
            <th>EV/Rev LTM</th>
            <th>EV/EBITDA LTM</th>
            <th>EV/EBITDA NTM</th>
            <th>P/E NTM</th>
            <th>EBITDA Marg.</th>
            <th>Rev Growth</th>
          </tr>
        </thead>
        <tbody>
          <tr class="target-row">
            <td><strong>${t.name}</strong> ★</td>
            <td>${t.ticker}</td>
            <td>${fmt.usdB(t.financials.ev)}</td>
            <td>${fmt.mult(t.financials.ev_rev_ltm)}</td>
            <td>${fmt.mult(t.financials.ev_ebitda_ltm)}</td>
            <td>${fmt.mult(t.financials.ev_ebitda_ntm)}</td>
            <td>${fmt.mult(t.financials.pe_ntm)}</td>
            <td>${fmt.pct(t.financials.ebitda_margin_ltm)}</td>
            <td class="text-positive">${fmt.pct(t.financials.revenue_growth_yoy)}</td>
          </tr>
          ${rows}
          <tr class="median-row">
            <td colspan="2">Peer Median (ex. outlier)</td>
            <td>—</td>
            <td>${fmt.mult(mdnEvRevLtm)}</td>
            <td>${fmt.mult(mdnEvEbLtm)}</td>
            <td>${fmt.mult(mdnEvEbNtm)}</td>
            <td>${fmt.mult(mdnPe)}</td>
            <td>${fmt.pct(mdnMargin)}</td>
            <td>${fmt.pct(mdnGrowth)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="outlier-note">
      † Helix Networks (HLXN) excluded from median — large-cap premium and cloud-transition phase distort comparable margins.
    </p>
    <div class="source-line mt-8">
      <strong>Source:</strong> ${PITCH_DATA.meta.dataSourceEquity}.
      Multiples calendarized to December fiscal year-end. LTM = last twelve months ended 31-Mar-2025.
      NTM based on Bloomberg median analyst consensus. EV bridge: market cap + net debt − cash.
    </div>`;
}

function renderSlide5() {
  const el = document.getElementById('slide5Body');
  if (!el) return;
  const txns = PITCH_DATA.precedentTransactions;
  const mdnMult = median(txns.map(t => t.ev_ebitda));
  const mdnPrem = median(txns.map(t => t.premium));
  const mdnVal  = median(txns.map(t => t.deal_value));

  const rows = txns.map(t => `
    <tr>
      <td>${t.date}</td>
      <td>${t.acquirer}</td>
      <td><strong>${t.target}</strong></td>
      <td>${fmt.usdB(t.deal_value)}</td>
      <td>${fmt.mult(t.ev_ebitda)}</td>
      <td>${t.premium}%</td>
      <td><span class="status-badge">${t.status}</span></td>
    </tr>${t.note ? `<tr style="background:rgba(238,242,247,0.5)"><td colspan="7" style="font-size:10.5px;color:var(--muted);font-style:italic;padding:3px 12px 6px">† ${t.note}</td></tr>` : ''}`).join('');

  el.innerHTML = `
    <div style="overflow-x:auto">
      <table class="prec-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Acquirer</th>
            <th>Target</th>
            <th>Deal Value</th>
            <th>EV/EBITDA</th>
            <th>Premium¹</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr class="median-row">
            <td colspan="3">Median</td>
            <td>${fmt.usdB(mdnVal)}</td>
            <td>${fmt.mult(mdnMult)}</td>
            <td>${mdnPrem}%</td>
            <td>—</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="source-line mt-8">
      <strong>Source:</strong> ${PITCH_DATA.meta.dataSourceDeals}.
      ¹ Premium to unaffected share price 30 days prior to announcement/leak.
      EV/EBITDA applied to target LTM EBITDA at announcement date.
      All transactions in Enterprise SaaS / Cloud Infrastructure sector, 2022–2024.
    </div>`;
}

function renderSlide6() {
  const el = document.getElementById('slide6Body');
  if (!el) return;
  const steps = PITCH_DATA.process;

  const cards = steps.map((step, i) => {
    const isLast = i === steps.length - 1;
    const milestones = step.milestones.map(m => `<li>${m}</li>`).join('');
    const arrow = isLast ? '' : `<div class="process-arrow">›</div>`;
    return `
      <div class="process-step">
        <div class="process-card ${isLast ? 'final' : ''}">
          <div class="process-card__num">${step.step}</div>
          <div class="process-card__title">${step.title}</div>
          <div class="process-card__duration">${step.duration}</div>
          <ul class="process-card__milestones">${milestones}</ul>
        </div>
        ${arrow}
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="process-timeline">${cards}</div>
    <p class="process-note">
      Illustrative only — timeline subject to Board approval, regulatory requirements, and market conditions.
      This is not a commitment to a process or timeline.
    </p>
    <div class="source-line mt-8">
      <strong>Note:</strong> Process structure based on standard M&amp;A advisory practice.
      Milestone dates and parties are illustrative.
    </div>`;
}

/* ─── Tab switching ───────────────────────────────────────────────────── */
function switchSlide(num) {
  document.querySelectorAll('.slide-tab').forEach(btn => {
    btn.classList.toggle('active', +btn.dataset.slide === +num);
  });
  document.querySelectorAll('.slide-panel').forEach(panel => {
    panel.classList.toggle('active', +panel.dataset.slide === +num);
  });

  /* Lazy-render the football field chart only when its slide is shown */
  if (+num === 3) {
    requestAnimationFrame(() => {
      const canvas = document.getElementById('footballFieldChart');
      if (canvas && !Chart.getChart(canvas)) initFootballField();
    });
  }
}

/* ─── Bootstrap ──────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderSkillOverview();
  renderWorkflow();
  renderInputCards();
  renderSlide1();
  renderSlide2();
  renderSlide3();
  renderSlide4();
  renderSlide5();
  renderSlide6();

  /* Activate slide 1 by default */
  switchSlide(1);

  /* Wire slide tabs */
  document.querySelectorAll('.slide-tab').forEach(btn => {
    btn.addEventListener('click', () => switchSlide(+btn.dataset.slide));
  });
});
