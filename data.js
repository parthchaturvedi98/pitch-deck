/**
 * data.js — Fabricated market data for Nexaris Technologies (NXRS)
 *
 * Source attribution: All figures are illustrative and represent the style and
 * structure of data sourced from Bloomberg Terminal and PitchBook Data Corp.
 * All company names, tickers, and financial figures are fictitious.
 *
 * Bloomberg data: equity prices, trading multiples, consensus estimates
 * PitchBook data: precedent M&A transactions, deal values, premia
 */

const PITCH_DATA = {

  /* ─── Meta ──────────────────────────────────────────────────────────── */
  meta: {
    pitchDate:       "April 14, 2025",
    dataAsOf:        "March 31, 2025",
    preparedFor:     "Board of Directors — Discussion Purposes Only",
    confidentiality: "Confidential — prepared for discussion purposes only.",
    dataSourceEquity: "Bloomberg Terminal (as of 31-Mar-2025)",
    dataSourceDeals:  "PitchBook Data Corp (transactions 2022–2024)",
    dataSourceFilings:"NXRS 10-K / 10-Q SEC Filings"
  },

  /* ─── Target company ─────────────────────────────────────────────────── */
  target: {
    name:        "Nexaris Technologies",
    ticker:      "NXRS",
    exchange:    "NASDAQ",
    sector:      "Enterprise SaaS / Cloud Infrastructure",
    hq:          "Austin, TX",
    founded:     2011,
    employees:   2400,
    description: "Nexaris Technologies is a leading provider of cloud-native " +
      "infrastructure management and real-time data observability solutions for " +
      "Fortune 500 enterprises and global financial institutions. The Company's " +
      "flagship platform, NexaCloud™, enables customers to monitor, manage, and " +
      "optimize hybrid cloud environments at scale, reducing operational costs by " +
      "an average of 34% versus legacy alternatives. Nexaris serves 680+ enterprise " +
      "clients across financial services, healthcare, and manufacturing verticals, " +
      "with 94% annual net revenue retention.",

    whatsChanged: [
      {
        title: "Accelerating Cloud Migration Tailwinds",
        body:  "Enterprise cloud adoption reached 78% penetration in 2024, expanding " +
               "Nexaris's serviceable addressable market to $42B by 2027E (Bloomberg Intelligence)."
      },
      {
        title: "Peer M&A at Compelling Multiples",
        body:  "Seven sector transactions since April 2022 closed at 17–29× LTM EV/EBITDA, " +
               "with strategic premia averaging 31% to unaffected share price (PitchBook)."
      },
      {
        title: "Management Succession Overhang",
        body:  "CEO transition announced for Q3 2025 creates near-term uncertainty; " +
               "a structured sale process resolves leadership risk for stakeholders."
      }
    ],

    /* LTM = last twelve months ended March 31, 2025 | NTM = next twelve months */
    financials: {
      revenue_ltm:        482.4,   /* $M */
      ebitda_ltm:         144.7,   /* $M */
      ebitda_margin_ltm:   30.0,   /* % */
      revenue_ntm:        551.8,   /* $M — Bloomberg consensus */
      ebitda_ntm:         171.0,   /* $M — Bloomberg consensus */
      revenue_growth_yoy:  14.2,   /* % */
      market_cap:        2118.3,   /* $M — Bloomberg */
      ev:                2305.7,   /* $M — Bloomberg */
      net_debt:           187.4,   /* $M — company filings */
      share_price:         24.50,  /* $ — Bloomberg closing 31-Mar-2025 */
      shares_out:          86.5,   /* M diluted shares — company filings */
      ev_rev_ltm:           4.8,   /* × */
      ev_ebitda_ltm:       15.9,   /* × */
      ev_ebitda_ntm:       13.5,   /* × */
      pe_ntm:              21.2,   /* × — Bloomberg consensus */
      source: "Bloomberg; NXRS 10-K (FY2024) / 10-Q (Q1 2025)"
    }
  },

  /* ─── Trading comps ──────────────────────────────────────────────────── */
  /* Source: Bloomberg Terminal, multiples as of 31-Mar-2025.               */
  /* Calendarized to Dec fiscal year-end. LTM = last twelve months.         */
  /* NTM multiples based on Bloomberg median analyst consensus.              */
  tradingComps: [
    {
      company:      "CloudSync Corp",
      ticker:       "CLSD",
      ev:           4218.5,
      rev_ltm:       698.2,
      ebitda_ltm:    182.3,
      rev_ntm:       812.4,
      ebitda_ntm:    218.7,
      ev_rev_ltm:      6.0,
      ev_ebitda_ltm:  23.1,
      ev_ebitda_ntm:  19.3,
      pe_ntm:         32.4,
      ebitda_margin:  26.1,
      rev_growth:     16.3,
      outlier:        false,
      note:           null
    },
    {
      company:      "DataFlow Systems",
      ticker:       "DFLS",
      ev:           3124.7,
      rev_ltm:       512.4,
      ebitda_ltm:    148.1,
      rev_ntm:       589.2,
      ebitda_ntm:    177.3,
      ev_rev_ltm:      6.1,
      ev_ebitda_ltm:  21.1,
      ev_ebitda_ntm:  17.6,
      pe_ntm:         28.7,
      ebitda_margin:  28.9,
      rev_growth:     15.0,
      outlier:        false,
      note:           null
    },
    {
      company:      "TechBase Inc.",
      ticker:       "TBSE",
      ev:           1792.3,
      rev_ltm:       373.6,
      ebitda_ltm:     96.8,
      rev_ntm:       418.4,
      ebitda_ntm:    113.0,
      ev_rev_ltm:      4.8,
      ev_ebitda_ltm:  18.5,
      ev_ebitda_ntm:  15.9,
      pe_ntm:         24.1,
      ebitda_margin:  25.9,
      rev_growth:     12.0,
      outlier:        false,
      note:           null
    },
    {
      company:      "Orbit Software",
      ticker:       "ORBT",
      ev:           5682.4,
      rev_ltm:       823.1,
      ebitda_ltm:    246.9,
      rev_ntm:      1004.2,
      ebitda_ntm:    311.3,
      ev_rev_ltm:      6.9,
      ev_ebitda_ltm:  23.0,
      ev_ebitda_ntm:  18.3,
      pe_ntm:         34.2,
      ebitda_margin:  30.0,
      rev_growth:     22.0,
      outlier:        false,
      note:           null
    },
    {
      company:      "VectorIQ",
      ticker:       "VCTQ",
      ev:           2381.6,
      rev_ltm:       441.0,
      ebitda_ltm:    119.1,
      rev_ntm:       512.4,
      ebitda_ntm:    143.4,
      ev_rev_ltm:      5.4,
      ev_ebitda_ltm:  20.0,
      ev_ebitda_ntm:  16.6,
      pe_ntm:         27.8,
      ebitda_margin:  27.0,
      rev_growth:     16.2,
      outlier:        false,
      note:           null
    },
    {
      company:      "PlatformX",
      ticker:       "PLTX",
      ev:           6832.1,
      rev_ltm:      1024.3,
      ebitda_ltm:    286.8,
      rev_ntm:      1219.9,
      ebitda_ntm:    352.4,
      ev_rev_ltm:      6.7,
      ev_ebitda_ltm:  23.8,
      ev_ebitda_ntm:  19.4,
      pe_ntm:         35.1,
      ebitda_margin:  28.0,
      rev_growth:     19.1,
      outlier:        false,
      note:           null
    },
    {
      company:      "Helix Networks",
      ticker:       "HLXN",
      ev:          14218.2,
      rev_ltm:      2340.1,
      ebitda_ltm:    468.0,
      rev_ntm:      2668.7,
      ebitda_ntm:    560.4,
      ev_rev_ltm:      6.1,
      ev_ebitda_ltm:  30.4,
      ev_ebitda_ntm:  25.4,
      pe_ntm:         42.6,
      ebitda_margin:  20.0,
      rev_growth:     14.0,
      outlier:        true,
      note:           "Excluded from median — large-cap premium and cloud-transition phase distort comparable margins"
    }
  ],

  /* ─── Precedent transactions ─────────────────────────────────────────── */
  /* Source: PitchBook Data Corp — Enterprise SaaS M&A, Apr 2022–Apr 2024.  */
  /* EV/EBITDA applied to target LTM EBITDA at announcement date.           */
  /* Premium measured to unaffected share price 30 days prior to leak/ann.  */
  precedentTransactions: [
    {
      date:        "Apr 2024",
      acquirer:    "TechVision Partners",
      target:      "CloudEdge Solutions",
      deal_value:  3820.0,
      ev_ebitda:     24.2,
      premium:        32,
      status:      "Closed",
      note:        null
    },
    {
      date:        "Nov 2023",
      acquirer:    "SilverLake Partners",
      target:      "NetStream Technologies",
      deal_value:  2140.0,
      ev_ebitda:     19.8,
      premium:        28,
      status:      "Closed",
      note:        null
    },
    {
      date:        "Jul 2023",
      acquirer:    "Vista Equity Partners",
      target:      "DataCore Systems",
      deal_value:  4630.0,
      ev_ebitda:     26.1,
      premium:        35,
      status:      "Closed",
      note:        null
    },
    {
      date:        "Mar 2023",
      acquirer:    "Thoma Bravo",
      target:      "SyncPoint Software",
      deal_value:  1440.0,
      ev_ebitda:     17.4,
      premium:        24,
      status:      "Closed",
      note:        "Carve-out; adjusted for stranded-cost add-backs"
    },
    {
      date:        "Dec 2022",
      acquirer:    "SAP SE",
      target:      "IntelliOps Inc.",
      deal_value:  2810.0,
      ev_ebitda:     21.3,
      premium:        30,
      status:      "Closed",
      note:        null
    },
    {
      date:        "Aug 2022",
      acquirer:    "Salesforce, Inc.",
      target:      "FlowBridge Technologies",
      deal_value:  5220.0,
      ev_ebitda:     28.6,
      premium:        38,
      status:      "Closed",
      note:        null
    },
    {
      date:        "Apr 2022",
      acquirer:    "KKR & Co.",
      target:      "Apex Infrastructure Software",
      deal_value:  3300.0,
      ev_ebitda:     22.7,
      premium:        29,
      status:      "Closed",
      note:        null
    }
  ],

  /* ─── Valuation summary ──────────────────────────────────────────────── */
  valuation: {
    currentPrice:  24.50,
    sharesOut:     86.5,
    netDebt:      187.4,

    methodologies: [
      {
        id:       "comps",
        name:     "Trading Comps",
        subtext:  "EV/EBITDA 18.5–23.8× · $144.7M LTM EBITDA",
        min:       26.40,
        median:    30.80,
        max:       35.90,
        source:   "Bloomberg; 6 peers (Helix excluded)"
      },
      {
        id:       "precedents",
        name:     "Precedent Transactions",
        subtext:  "EV/EBITDA 19.8–26.1× · $144.7M LTM EBITDA",
        min:       28.20,
        median:    33.40,
        max:       40.80,
        source:   "PitchBook; 7 transactions Apr 2022–Apr 2024"
      },
      {
        id:       "dcf",
        name:     "DCF Analysis",
        subtext:  "WACC 9.0–10.5% · Terminal growth 2.5–3.5%",
        min:       27.80,
        median:    31.60,
        max:       36.10,
        source:   "Mgmt projections; Bloomberg consensus 2025–2026E"
      },
      {
        id:       "lbo",
        name:     "Illustrative LBO",
        subtext:  "Entry 21–23× EV/EBITDA · 5-yr hold · 20–25% IRR",
        min:       26.80,
        median:    29.90,
        max:       33.20,
        source:   "Illustrative; market leverage from Bloomberg loan comps"
      }
    ],

    recommendedRange: { low: 31.00, high: 37.00 },
    recommendedLabel: "Recommended: $31.00–$37.00/share"
  },

  /* ─── DCF projection (Base Case) ─────────────────────────────────────── */
  dcf: {
    years:          [2025, 2026, 2027, 2028, 2029],
    revenue:        [551.8, 630.1, 714.8, 804.9, 900.5],
    ebitda:         [171.0, 201.6, 235.8, 273.7, 315.2],
    ebitda_margin:  [31.0,  32.0,  33.0,  34.0,  35.0],
    capex_pct:      [5.8,   5.5,   5.2,   5.0,   4.8],
    fcf:            [96.4,  118.2, 142.1, 168.3, 197.0],
    wacc_base:       9.75,
    wacc_range:     [9.0, 10.5],
    tgr_base:        3.0,
    tgr_range:      [2.5, 3.5],
    tv_implied_mult: 16.8,
    source:  "Management projections as of Q4 2024; Bloomberg consensus for 2025–2026E"
  },

  /* ─── LBO model (Illustrative) ───────────────────────────────────────── */
  lbo: {
    entry_ev:          2950.0,
    entry_ebitda_mult:   20.4,
    equity_pct:          40.0,
    equity:            1180.0,
    debt:              1770.0,
    debt_ebitda_entry:    6.1,
    interest_rate:        7.2,  /* % — leveraged loan proxy (Bloomberg) */
    exit_mult_base:      19.0,
    exit_year:           2030,
    irr_base:            22.4,
    irr_range:          [18.8, 25.9],
    moic_base:            2.7,
    moic_range:         [2.2, 3.4],
    source:  "Illustrative; market leverage based on Bloomberg leveraged loan comps"
  },

  /* ─── Illustrative sale process ──────────────────────────────────────── */
  process: [
    {
      step: 1,
      title: "Preparation",
      duration: "Weeks 1–2",
      color: "var(--accent)",
      milestones: [
        "Finalize Confidential Information Memorandum (CIM)",
        "Approve virtual data room structure",
        "Sign NDA templates with counsel"
      ]
    },
    {
      step: 2,
      title: "Broad Marketing",
      duration: "Weeks 3–5",
      color: "var(--accent)",
      milestones: [
        "Distribute anonymous teaser to 30+ parties",
        "Execute NDAs with interested parties",
        "Deliver CIM to qualified bidders"
      ]
    },
    {
      step: 3,
      title: "First-Round Bids",
      duration: "Week 6",
      color: "var(--accent)",
      milestones: [
        "Indicative offers (IOIs) due",
        "Evaluate bids with Board",
        "Select 6–8 parties to advance"
      ]
    },
    {
      step: 4,
      title: "Due Diligence",
      duration: "Weeks 7–10",
      color: "var(--accent)",
      milestones: [
        "Management presentations",
        "Site visits & customer calls",
        "Full data room access granted"
      ]
    },
    {
      step: 5,
      title: "Final Bids & Close",
      duration: "Weeks 11–14",
      color: "var(--hilite)",
      milestones: [
        "Final binding bids due",
        "Select winning bidder",
        "Negotiate & execute definitive agreement",
        "Public announcement"
      ]
    }
  ]

};
