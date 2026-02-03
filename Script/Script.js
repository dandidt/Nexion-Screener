// ───────── Format ───────── //
const formatNumber = (val) => {
  if (val == null || isNaN(val)) return "N/A";

  const abs = Math.abs(val);
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);

  const sign = val > 0 ? "+" : val < 0 ? "-" : "";

  return `${sign}${formatted}`;
};

const formatNumberShort = (val) => {
  if (val == null || isNaN(val)) return "N/A";

  const abs = Math.abs(val);
  const formatted = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(abs);

  const sign = val < 0 ? "-" : "";

  return `${sign}${formatted}`;
};

const formatUSD = (val) => {
  if (val == null || isNaN(val)) return "N/A";

  const abs = Math.abs(val);
  let decimals = 2;

  if (abs !== 0 && abs < 1) {
    decimals = Math.min(10, Math.ceil(Math.abs(Math.log10(abs))) + 2);
  }

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(abs);

  const sign = val > 0 ? "+" : val < 0 ? "-" : "";

  return `${sign}$${formatted}`;
};

const formatUSDClear = (val) => {
  if (val == null || isNaN(val)) return "N/A";

  const abs = Math.abs(val);
  let decimals = 2;

  if (abs !== 0 && abs < 1) {
    decimals = Math.min(10, Math.ceil(Math.abs(Math.log10(abs))) + 2);
  }

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(abs);

  return `$${formatted}`;
};

const formatUSDShort = (val) => {
  if (val == null || isNaN(val)) return "N/A";

  const abs = Math.abs(val);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(abs);

  const sign = val > 0 ? "+" : val < 0 ? "-" : "";

  return `${sign}${formatted}`;
};

const formatUSDShortClear = (val) => {
  if (val == null || isNaN(val)) return "N/A";

  const abs = Math.abs(val);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(abs);

  const sign = val < 0 ? "-" : "";

  return `${sign}${formatted}`;
};

const formatPercent = (val) => {
  if (val == null || isNaN(val)) return "N/A";

  const abs = Math.abs(val);
  let decimals = 2;

  if (abs !== 0 && abs < 1) {
    decimals = Math.min(6, Math.ceil(Math.abs(Math.log10(abs))) + 1);
  }

  const formatted = val.toFixed(decimals);
  const sign = val > 0 ? "+" : "";

  return `${sign}${formatted}%`;
};

const formatPercentClear = (val) => {
  if (val == null || isNaN(val)) return "N/A";

  const abs = Math.abs(val);
  let decimals = 2;

  if (abs !== 0 && abs < 1) {
    decimals = Math.min(6, Math.ceil(Math.abs(Math.log10(abs))) + 1);
  }

  return `${val.toFixed(decimals)}%`;
};

const formatPercentFunding = (val) => {
  if (val == null || isNaN(val)) return "N/A";

  const percent = val * 100;
  const abs = Math.abs(percent);
  let decimals = 2;

  if (abs !== 0 && abs < 1) {
    decimals = Math.min(6, Math.ceil(Math.abs(Math.log10(abs))) + 1);
  }

  const formatted = percent.toFixed(decimals);
  const sign = percent > 0 ? "+" : "";

  return `${sign}${formatted}%`;
};

// ───────── Swap Source ───────── //
const radioButtons = document.querySelectorAll('.btn-radio.source-data');

radioButtons.forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('.btn-radio.source-data.active')?.classList.remove('active');
    button.classList.add('active');

    const sourceName = button.querySelector('span').innerText;
    document.title = `Nexion | ${sourceName}`;

    fetchActiveSource();
    refreshTable();

    resetAllSortIcons();
    activeSortCol = null;
    for (let key in sortStates) delete sortStates[key];
  });
});

const table = document.querySelector(".crypto-table");
const thead = table.querySelector("thead");
const tbody = table.querySelector("tbody");

let dragColIndex = null;
const sortStates = {};
let activeSortCol = null;
let CURRENT_TICKERS = [];
let activeFilters = [];

const FIELDS = [
  // Core
  "price",
  "openInterestUsd",
  "fundingRate",
  "mcap",

  // Change %
  "tf5m.changePercent",
  "tf15m.changePercent",
  "tf1h.changePercent",
  "tf4h.changePercent",
  "tf8h.changePercent",
  "tf12h.changePercent",
  "tf1d.changePercent",

  // Change $
  "tf5m.changeDollar",
  "tf15m.changeDollar",
  "tf1h.changeDollar",
  "tf4h.changeDollar",
  "tf8h.changeDollar",
  "tf12h.changeDollar",
  "tf1d.changeDollar",

  // Volume
  "tf5m.volume",
  "tf15m.volume",
  "tf1h.volume",
  "tf4h.volume",
  "tf8h.volume",
  "tf12h.volume",
  "tf1d.volume",

  // Trades
  "tf5m.trades",
  "tf15m.trades",
  "tf1h.trades",
  "tf4h.trades",
  "tf8h.trades",
  "tf12h.trades",
  "tf1d.trades",

  // Volatility
  "tf5m.volatility",
  "tf15m.volatility",
  "tf1h.volatility",
  "tf4h.volatility",
  "tf8h.volatility",
  "tf12h.volatility",
  "tf1d.volatility",

  // OI Change %
  "tf5m.oiChange",
  "tf15m.oiChange",
  "tf1h.oiChange",
  "tf4h.oiChange",
  "tf8h.oiChange",
  "tf12h.oiChange",
  "tf1d.oiChange",

  // OI Change $
  "tf5m.oiChangeDollar",
  "tf15m.oiChangeDollar",
  "tf1h.oiChangeDollar",
  "tf4h.oiChangeDollar",
  "tf8h.oiChangeDollar",
  "tf12h.oiChangeDollar",
  "tf1d.oiChangeDollar",

  // CVD
  "tf5m.vdelta",
  "tf15m.vdelta",
  "tf1h.vdelta",
  "tf4h.vdelta",
  "tf8h.vdelta",
  "tf12h.vdelta",
  "tf1d.vdelta",

  // Volume Change %
  "tf5m.volumeChange",
  "tf15m.volumeChange",
  "tf1h.volumeChange",
  "tf4h.volumeChange",
  "tf8h.volumeChange",
  "tf12h.volumeChange",
  "tf1d.volumeChange",

  // Volume Change $
  "tf5m.volumeChangeDollar",
  "tf15m.volumeChangeDollar",
  "tf1h.volumeChangeDollar",
  "tf4h.volumeChangeDollar",
  "tf8h.volumeChangeDollar",
  "tf12h.volumeChangeDollar",
  "tf1d.volumeChangeDollar",

  // BTC
  "tf5m.btcCorrelation",
  "tf15m.btcCorrelation",
  "tf1h.btcCorrelation",
  "tf4h.btcCorrelation",
  "tf8h.btcCorrelation",
  "tf12h.btcCorrelation",
  "tf1d.btcCorrelation",
];

const FIELD_LABELS = {
  // Core
  price: "PRICE",
  openInterestUsd: "OI $",
  fundingRate: "FUNDING",
  mcap: "MCAP",

  // Change %
  "tf5m.changePercent": "CHG 5M %",
  "tf15m.changePercent": "CHG 15M %",
  "tf1h.changePercent": "CHG 1H %",
  "tf4h.changePercent": "CHG 4H %",
  "tf8h.changePercent": "CHG 8H %",
  "tf12h.changePercent": "CHG 12H %",
  "tf1d.changePercent": "CHG 1D %",

  // Change $
  "tf5m.changeDollar": "CHG 5M $",
  "tf15m.changeDollar": "CHG 15M $",
  "tf1h.changeDollar": "CHG 1H $",
  "tf4h.changeDollar": "CHG 4H $",
  "tf8h.changeDollar": "CHG 8H $",
  "tf12h.changeDollar": "CHG 12H $",
  "tf1d.changeDollar": "CHG 1D $",

  // Volume
  "tf5m.volume": "VOL 5M",
  "tf15m.volume": "VOL 15M",
  "tf1h.volume": "VOL 1H",
  "tf4h.volume": "VOL 4H",
  "tf8h.volume": "VOL 8H",
  "tf12h.volume": "VOL 12H",
  "tf1d.volume": "VOL 1D",

  // Trades
  "tf5m.trades": "TRD 5M",
  "tf15m.trades": "TRD 15M",
  "tf1h.trades": "TRD 1H",
  "tf4h.trades": "TRD 4H",
  "tf8h.trades": "TRD 8H",
  "tf12h.trades": "TRD 12H",
  "tf1d.trades": "TRD 1D",

  // Volatility
  "tf5m.volatility": "VLT 5M",
  "tf15m.volatility": "VLT 15M",
  "tf1h.volatility": "VLT 1H",
  "tf4h.volatility": "VLT 4H",
  "tf8h.volatility": "VLT 8H",
  "tf12h.volatility": "VLT 12H",
  "tf1d.volatility": "VLT 1D",

  // OI
  "tf5m.oiChange": "OI CHG 5M %",
  "tf15m.oiChange": "OI CHG 15M %",
  "tf1h.oiChange": "OI CHG 1H %",
  "tf4h.oiChange": "OI CHG 4H %",
  "tf8h.oiChange": "OI CHG 8H %",
  "tf12h.oiChange": "OI CHG 12H %",
  "tf1d.oiChange": "OI CHG 1D %",

  "tf5m.oiChangeDollar": "OI CHG 5M $",
  "tf15m.oiChangeDollar": "OI CHG 15M $",
  "tf1h.oiChangeDollar": "OI CHG 1H $",
  "tf4h.oiChangeDollar": "OI CHG 4H $",
  "tf8h.oiChangeDollar": "OI CHG 8H $",
  "tf12h.oiChangeDollar": "OI CHG 12H $",
  "tf1d.oiChangeDollar": "OI CHG 1D $",

  // CVD
  "tf5m.vdelta": "CVD 5M",
  "tf15m.vdelta": "CVD 15M",
  "tf1h.vdelta": "CVD 1H",
  "tf4h.vdelta": "CVD 4H",
  "tf8h.vdelta": "CVD 8H",
  "tf12h.vdelta": "CVD 12H",
  "tf1d.vdelta": "CVD 1D",

  // VOL CHG
  "tf5m.volumeChange": "VOL CHG 5M",
  "tf15m.volumeChange": "VOL CHG 15M",
  "tf1h.volumeChange": "VOL CHG 1H",
  "tf4h.volumeChange": "VOL CHG 4H",
  "tf8h.volumeChange": "VOL CHG 8H",
  "tf12h.volumeChange": "VOL CHG 12H",
  "tf1d.volumeChange": "VOL CHG 1D",

  // VOL CHG $
  "tf5m.volumeChangeDollar": "VOL CHG 5M $",
  "tf15m.volumeChangeDollar": "VOL CHG 15M $",
  "tf1h.volumeChangeDollar": "VOL CHG 1H $",
  "tf4h.volumeChangeDollar": "VOL CHG 4H $",
  "tf8h.volumeChangeDollar": "VOL CHG 8H $",
  "tf12h.volumeChangeDollar": "VOL CHG 12H $",
  "tf1d.volumeChangeDollar": "VOL CHG 1D $",

  // BTC Corr
  "tf5m.btcCorrelation": "COR 5M",
  "tf15m.btcCorrelation": "COR 15M",
  "tf1h.btcCorrelation": "COR 1H",
  "tf4h.btcCorrelation": "COR 4H",
  "tf8h.btcCorrelation": "COR 8H",
  "tf12h.btcCorrelation": "COR 12H",
  "tf1d.btcCorrelation": "COR 1D",
};

const FORMATTERS = {
  // Core
  price: formatUSDClear,
  openInterestUsd: formatUSDShortClear,
  fundingRate: formatPercentFunding,
  mcap: formatUSDShortClear,

  // Change %
  "tf5m.changePercent": formatPercent,
  "tf15m.changePercent": formatPercent,
  "tf1h.changePercent": formatPercent,
  "tf4h.changePercent": formatPercent,
  "tf8h.changePercent": formatPercent,
  "tf12h.changePercent": formatPercent,
  "tf1d.changePercent": formatPercent,

  // Change $
  "tf5m.changeDollar": formatUSD,
  "tf15m.changeDollar": formatUSD,
  "tf1h.changeDollar": formatUSD,
  "tf4h.changeDollar": formatUSD,
  "tf8h.changeDollar": formatUSD,
  "tf12h.changeDollar": formatUSD,
  "tf1d.changeDollar": formatUSD,

  // Volume
  "tf5m.volume": formatUSDShortClear,
  "tf15m.volume": formatUSDShortClear,
  "tf1h.volume": formatUSDShortClear,
  "tf4h.volume": formatUSDShortClear,
  "tf8h.volume": formatUSDShortClear,
  "tf12h.volume": formatUSDShortClear,
  "tf1d.volume": formatUSDShortClear,

  // Trades
  "tf5m.trades": formatNumberShort,
  "tf15m.trades": formatNumberShort,
  "tf1h.trades": formatNumberShort,
  "tf4h.trades": formatNumberShort,
  "tf8h.trades": formatNumberShort,
  "tf12h.trades": formatNumberShort,
  "tf1d.trades": formatNumberShort,

  // Volatility
  "tf5m.volatility": formatPercentClear,
  "tf15m.volatility": formatPercentClear,
  "tf1h.volatility": formatPercentClear,
  "tf4h.volatility": formatPercentClear,
  "tf8h.volatility": formatPercentClear,
  "tf12h.volatility": formatPercentClear,
  "tf1d.volatility": formatPercentClear,

  // OI CHG %
  "tf5m.oiChange": formatPercent,
  "tf15m.oiChange": formatPercent,
  "tf1h.oiChange": formatPercent,
  "tf4h.oiChange": formatPercent,
  "tf8h.oiChange": formatPercent,
  "tf12h.oiChange": formatPercent,
  "tf1d.oiChange": formatPercent,

  // OI CHG $
  "tf5m.oiChangeDollar": formatUSDShort,
  "tf15m.oiChangeDollar": formatUSDShort,
  "tf1h.oiChangeDollar": formatUSDShort,
  "tf4h.oiChangeDollar": formatUSDShort,
  "tf8h.oiChangeDollar": formatUSDShort,
  "tf12h.oiChangeDollar": formatUSDShort,
  "tf1d.oiChangeDollar": formatUSDShort,

  // CVD
  "tf5m.vdelta": formatUSDShort,
  "tf15m.vdelta": formatUSDShort,
  "tf1h.vdelta": formatUSDShort,
  "tf4h.vdelta": formatUSDShort,
  "tf8h.vdelta": formatUSDShort,
  "tf12h.vdelta": formatUSDShort,
  "tf1d.vdelta": formatUSDShort,

  // VOL CHG
  "tf5m.volumeChange": formatPercent,
  "tf15m.volumeChange": formatPercent,
  "tf1h.volumeChange": formatPercent,
  "tf4h.volumeChange": formatPercent,
  "tf8h.volumeChange": formatPercent,
  "tf12h.volumeChange": formatPercent,
  "tf1d.volumeChange": formatPercent,

  // VOL CHG $
  "tf5m.volumeChangeDollar": formatUSDShort,
  "tf15m.volumeChangeDollar": formatUSDShort,
  "tf1h.volumeChangeDollar": formatUSDShort,
  "tf4h.volumeChangeDollar": formatUSDShort,
  "tf8h.volumeChangeDollar": formatUSDShort,
  "tf12h.volumeChangeDollar": formatUSDShort,
  "tf1d.volumeChangeDollar": formatUSDShort,

  // BTC Corr
  "tf5m.btcCorrelation": formatNumber,
  "tf15m.btcCorrelation":formatNumber,
  "tf1h.btcCorrelation": formatNumber,
  "tf4h.btcCorrelation": formatNumber,
  "tf8h.btcCorrelation": formatNumber,
  "tf12h.btcCorrelation": formatNumber,
  "tf1d.btcCorrelation": formatNumber,
};

const CELL_STYLERS = {
  change: (val) => {
    if (val === 0 || val == null || isNaN(val)) return "gray";
    return val > 0 ? "green" : "red";
  },

  correlation: (val) => {
    if (val === 0 || val == null || isNaN(val)) return "gray";
    return val > 0.8 ? "text-yellow" : "";
  },

  muted: () => "gray"
};

const FIELD_STYLE_MAP = {

  // Core
  fundingRate: CELL_STYLERS.change,

  // Change %
  "tf5m.changePercent": CELL_STYLERS.change,
  "tf15m.changePercent": CELL_STYLERS.change,
  "tf1h.changePercent": CELL_STYLERS.change,
  "tf4h.changePercent": CELL_STYLERS.change,
  "tf8h.changePercent": CELL_STYLERS.change,
  "tf12h.changePercent": CELL_STYLERS.change,
  "tf1d.changePercent": CELL_STYLERS.change,

  // Change $
  "tf5m.changeDollar": CELL_STYLERS.change,
  "tf15m.changeDollar": CELL_STYLERS.change,
  "tf1h.changeDollar": CELL_STYLERS.change,
  "tf4h.changeDollar": CELL_STYLERS.change,
  "tf8h.changeDollar": CELL_STYLERS.change,
  "tf12h.changeDollar": CELL_STYLERS.change,
  "tf1d.changeDollar": CELL_STYLERS.change,

  // OI CHG %
  "tf5m.oiChange": CELL_STYLERS.change,
  "tf15m.oiChange": CELL_STYLERS.change,
  "tf1h.oiChange": CELL_STYLERS.change,
  "tf4h.oiChange": CELL_STYLERS.change,
  "tf8h.oiChange": CELL_STYLERS.change,
  "tf12h.oiChange": CELL_STYLERS.change,
  "tf1d.oiChange": CELL_STYLERS.change,

  // OI CHG $
  "tf5m.oiChangeDollar": CELL_STYLERS.change,
  "tf15m.oiChangeDollar": CELL_STYLERS.change,
  "tf1h.oiChangeDollar": CELL_STYLERS.change,
  "tf4h.oiChangeDollar": CELL_STYLERS.change,
  "tf8h.oiChangeDollar": CELL_STYLERS.change,
  "tf12h.oiChangeDollar": CELL_STYLERS.change,
  "tf1d.oiChangeDollar": CELL_STYLERS.change,

  // CVD
  "tf5m.vdelta": CELL_STYLERS.change,
  "tf15m.vdelta": CELL_STYLERS.change,
  "tf1h.vdelta": CELL_STYLERS.change,
  "tf4h.vdelta": CELL_STYLERS.change,
  "tf8h.vdelta": CELL_STYLERS.change,
  "tf12h.vdelta": CELL_STYLERS.change,
  "tf1d.vdelta": CELL_STYLERS.change,

  // VOL CHG %
  "tf5m.volumeChange": CELL_STYLERS.change,
  "tf15m.volumeChange": CELL_STYLERS.change,
  "tf1h.volumeChange": CELL_STYLERS.change,
  "tf4h.volumeChange": CELL_STYLERS.change,
  "tf8h.volumeChange": CELL_STYLERS.change,
  "tf12h.volumeChange": CELL_STYLERS.change,
  "tf1d.volumeChange": CELL_STYLERS.change,

  // VOL CHG $
  "tf5m.volumeChangeDollar": CELL_STYLERS.change,
  "tf15m.volumeChangeDollar": CELL_STYLERS.change,
  "tf1h.volumeChangeDollar": CELL_STYLERS.change,
  "tf4h.volumeChangeDollar": CELL_STYLERS.change,
  "tf8h.volumeChangeDollar": CELL_STYLERS.change,
  "tf12h.volumeChangeDollar": CELL_STYLERS.change,
  "tf1d.volumeChangeDollar": CELL_STYLERS.change,

  // BTC Corr
  "tf5m.btcCorrelation": CELL_STYLERS.change,
  "tf15m.btcCorrelation":CELL_STYLERS.change,
  "tf1h.btcCorrelation": CELL_STYLERS.change,
  "tf4h.btcCorrelation": CELL_STYLERS.change,
  "tf8h.btcCorrelation": CELL_STYLERS.change,
  "tf12h.btcCorrelation": CELL_STYLERS.change,
  "tf1d.btcCorrelation": CELL_STYLERS.change,
};

/* ───────── Tooltip Header ───────── */
const LABELS_TOOLTIP = {
  "OI $": "Total value of all open positions",
  "FUNDING": "Periodic rate paid between longs and shorts",
  "MCAP": "Market Capitalization",

  // Change %
  "CHG 5M %": "Price change as percentage",
  "CHG 15M %": "Price change as percentage",
  "CHG 1H %": "Price change as percentage",
  "CHG 4H %": "Price change as percentage",
  "CHG 8H %": "Price change as percentage",
  "CHG 12H %": "Price change as percentage",
  "CHG 1D %": "Price change as percentage",

  // Change $
  "CHG 5M $": "Price change in USD",
  "CHG 15M $": "Price change in USD",
  "CHG 1H $": "Price change in USD",
  "CHG 4H $": "Price change in USD",
  "CHG 8H $": "Price change in USD",
  "CHG 12H $": "Price change in USD",
  "CHG 1D $": "Price change in USD",

  // Volume
  "VOL 5M": "Trading volume in USD",
  "VOL 15M": "Trading volume in USD",
  "VOL 1H": "Trading volume in USD",
  "VOL 4H": "Trading volume in USD",
  "VOL 8H": "Trading volume in USD",
  "VOL 12H": "Trading volume in USD",
  "VOL 1D": "Trading volume in USD",

  // Trades
  "TRD 5M": "Number of executed trades",
  "TRD 15M": "Number of executed trades",
  "TRD 1H": "Number of executed trades",
  "TRD 4H": "Number of executed trades",
  "TRD 8H": "Number of executed trades",
  "TRD 12H": "Number of executed trades",
  "TRD 1D": "Number of executed trades",

  // Volatility
  "VLT 5M": "Price range as % of average price",
  "VLT 15M": "Price range as % of average price",
  "VLT 1H": "Price range as % of average price",
  "VLT 4H": "Price range as % of average price",
  "VLT 8H": "Price range as % of average price",
  "VLT 12H": "Price range as % of average price",
  "VLT 1D": "Price range as % of average price",

  // OI
  "OI CHG 5M %": "Change in open interest as percentage",
  "OI CHG 15M %": "Change in open interest as percentage",
  "OI CHG 1H %": "Change in open interest as percentage",
  "OI CHG 4H %": "Change in open interest as percentage",
  "OI CHG 8H %": "Change in open interest as percentage",
  "OI CHG 12H %": "Change in open interest as percentage",
  "OI CHG 1D %": "Change in open interest as percentage",

  "OI CHG 5M $": "Change in open interest in USD",
  "OI CHG 15M $": "Change in open interest in USD",
  "OI CHG 1H $": "Change in open interest in USD",
  "OI CHG 4H $": "Change in open interest in USD",
  "OI CHG 8H $": "Change in open interest in USD",
  "OI CHG 12H $": "Change in open interest in USD",
  "OI CHG 1D $": "Change in open interest in USD",

  // CVD
  "CVD 5M": "Cumulative volume delta (buy minus sell pressure)",
  "CVD 15M": "Cumulative volume delta (buy minus sell pressure)",
  "CVD 1H": "Cumulative volume delta (buy minus sell pressure)",
  "CVD 4H": "Cumulative volume delta (buy minus sell pressure)",
  "CVD 8H": "Cumulative volume delta (buy minus sell pressure)",
  "CVD 12H": "Cumulative volume delta (buy minus sell pressure)",
  "CVD 1D": "Cumulative volume delta (buy minus sell pressure)",

  // VOL CHG
  "VOL CHG 5M": "Volume change vs previous preiod",
  "VOL CHG 15M": "Volume change vs previous preiod",
  "VOL CHG 1H": "Volume change vs previous preiod",
  "VOL CHG 4H": "Volume change vs previous preiod",
  "VOL CHG 8H": "Volume change vs previous preiod",
  "VOL CHG 12H": "Volume change vs previous preiod",
  "VOL CHG 1D": "Volume change vs previous preiod",

  // VOL CHG $
  "VOL CHG 5M $": "Volume change USD vs previous preiod",
  "VOL CHG 15M $": "Volume change USD vs previous preiod",
  "VOL CHG 1H $": "Volume change USD vs previous preiod",
  "VOL CHG 4H $": "Volume change USD vs previous preiod",
  "VOL CHG 8H $": "Volume change USD vs previous preiod",
  "VOL CHG 12H $": "Volume change USD vs previous preiod",
  "VOL CHG 1D $": "Volume change USD vs previous preiod",

  // BTC Corr
  "COR 5M": "Price correlation with BTC",
  "COR 15M": "Price correlation with BTC",
  "COR 1H": "Price correlation with BTC",
  "COR 4H": "Price correlation with BTC",
  "COR 8H": "Price correlation with BTC",
  "COR 12H": "Price correlation with BTC",
  "COR 1D": "Price correlation with BTC",
};

let ICON_MAP = {};

/* ───────── Reset Icon Short ───────── */
function resetAllSortIcons() {
  document.querySelectorAll(".arrow-filter").forEach(icon => {
    icon.dataset.sortState = "none";
    icon.className = "arrow-filter";

    const upArrow = icon.querySelector(".arrow-up");
    const downArrow = icon.querySelector(".arrow-down");
    if (upArrow) upArrow.style.fill = "var(--gray)";
    if (downArrow) downArrow.style.fill = "var(--gray)";
  });
}

/* ───────── FETCH JSON ───────── */
let BINANCE_DATA = [];
let HYPERLIQUID_DATA = [];
let ICONS_LOADED = false;
let fetchIntervalId = null;

function getActiveSourceName() {
  return document.querySelector('.btn-radio.source-data.active span')?.innerText || "Binance";
}

async function fetchIconsOnce() {
  if (ICONS_LOADED) return;
  try {
    const iconRes = await fetch("https://screener.orionterminal.com/api/icons");
    ICON_MAP = await iconRes.json();
    ICONS_LOADED = true;
  } catch (err) {
    console.error("Icon fetch error:", err);
  }
}

async function fetchActiveSource() {
  try {
    const activeSource = getActiveSourceName();
    const url =
      activeSource === "Hyperliquid"
        ? "https://screener.orionterminal.com/api/screener?exchange=hl"
        : "https://screener.orionterminal.com/api/screener";

    const res = await fetch(url);
    const data = await res.json();
    const tickers = data.tickers || [];

    if (activeSource === "Hyperliquid") {
      HYPERLIQUID_DATA = tickers;
      CURRENT_TICKERS = [...HYPERLIQUID_DATA];
    } else {
      BINANCE_DATA = tickers;
      CURRENT_TICKERS = [...BINANCE_DATA];
    }

    refreshTable();
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

async function fetchInitialData() {
  try {
    const [binanceRes, hyperliquidRes, iconRes] = await Promise.all([
      fetch("https://screener.orionterminal.com/api/screener"),
      fetch("https://screener.orionterminal.com/api/screener?exchange=hl"),
      fetch("https://screener.orionterminal.com/api/icons")
    ]);

    const binanceData = await binanceRes.json();
    const hyperliquidData = await hyperliquidRes.json();
    const iconData = await iconRes.json();

    BINANCE_DATA = binanceData.tickers || [];
    HYPERLIQUID_DATA = hyperliquidData.tickers || [];
    ICON_MAP = iconData;
    ICONS_LOADED = true;

    const activeSource = getActiveSourceName();
    CURRENT_TICKERS =
      activeSource === "Hyperliquid" ? [...HYPERLIQUID_DATA] : [...BINANCE_DATA];

    refreshTable();
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

function startFetchLoop() {
  if (fetchIntervalId) return;
  fetchActiveSource();
  fetchIntervalId = setInterval(fetchActiveSource, 5000);
}

function stopFetchLoop() {
  if (!fetchIntervalId) return;
  clearInterval(fetchIntervalId);
  fetchIntervalId = null;
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopFetchLoop();
  } else {
    startFetchLoop();
  }
});

fetchInitialData().then(() => {
  buildHeader();
  initDrag();
  startFetchLoop();
});

/* ───────── Header Data ───────── */
function buildHeader() {
  thead.innerHTML = "";
  const trHead = document.createElement("tr");

  const thCoin = document.createElement("th");
  thCoin.setAttribute("data-col-index", 1);
  thCoin.textContent = "PAIRS";
  trHead.appendChild(thCoin);

  getActiveFields().forEach((field, i) => {
    const th = document.createElement("th");
    const colIndex = i + 2;
    th.setAttribute("data-col-index", colIndex);

    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.justifyContent = "space-between";
    wrapper.style.width = "100%";

    // drag handle
    const dragHandle = document.createElement("div");
    dragHandle.classList.add("drag-handle");
    const dragIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    dragIcon.setAttribute("width", "20");
    dragIcon.setAttribute("height", "20");
    dragIcon.setAttribute("viewBox", "0 -960 960 960");
    dragIcon.innerHTML = `<path d="M359.79-192Q330-192 309-213.21t-21-51Q288-294 309.21-315t51-21Q390-336 411-314.79t21 51Q432-234 410.79-213t-51 21Zm240 0Q570-192 549-213.21t-21-51Q528-294 549.21-315t51-21Q630-336 651-314.79t21 51Q672-234 650.79-213t-51 21Zm-240-216Q330-408 309-429.21t-21-51Q288-510 309.21-531t51-21Q390-552 411-530.79t21 51Q432-450 410.79-429t-51 21Zm240 0Q570-408 549-429.21t-21-51Q528-510 549.21-531t51-21Q630-552 651-530.79t21 51Q672-450 650.79-429t-51 21Zm-240-216Q330-624 309-645.21t-21-51Q288-726 309.21-747t51-21Q390-768 411-746.79t21 51Q432-666 410.79-645t-51 21Zm240 0Q570-624 549-645.21t-21-51Q528-726 549.21-747t51-21Q630-768 651-746.79t21 51Q672-666 650.79-645t-51 21Z"/>`;
    dragIcon.style.fill = "var(--gray)";
    dragHandle.appendChild(dragIcon);

    // label
    const label = document.createElement("span");
    label.textContent = FIELD_LABELS[field] || field;
    label.style.flexGrow = "1";
    label.style.textAlign = "center";
    label.style.padding = "0 10px";
    label.style.color = "var(--gray)";
    label.style.cursor = "pointer";

    // sort icon
    const filterIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    filterIcon.setAttribute("width", "18");
    filterIcon.setAttribute("height", "18");
    filterIcon.setAttribute("viewBox", "0 0 24 24");
    filterIcon.classList.add("arrow-filter");
    filterIcon.dataset.sortState = "none";
    filterIcon.innerHTML = `
      <path class="arrow-up" d="M7.5 3.086L12.914 8.5L11.5 9.914l-3-3V15.5h-2V6.914l-3 3L2.086 8.5Z"/>
      <path class="arrow-down" d="M17.5 20.914L12.086 15.5L13.5 14.086l3 3V8.5h2v8.586l3-3l1.414 1.414Z"/>
    `;

    filterIcon.addEventListener("click", () => {
      let currentState = filterIcon.dataset.sortState;
      let newState =
        currentState === "none" ? "asc" :
        currentState === "asc" ? "desc" :
        "none";

      if (activeSortCol !== colIndex) {
        resetAllSortIcons();
        activeSortCol = colIndex;
        newState = "asc";
      }

      filterIcon.dataset.sortState = newState;

      const up = filterIcon.querySelector(".arrow-up");
      const down = filterIcon.querySelector(".arrow-down");
      if (up) up.style.fill = "#888";
      if (down) down.style.fill = "#888";

      if (newState === "asc") {
        if (up) up.style.fill = "#fff";
      } else if (newState === "desc") {
        if (down) down.style.fill = "#fff";
      }

      sortTableByColumn(colIndex, newState);

      if (newState === "none") {
        activeSortCol = null;
        resetAllSortIcons();
      }
    });

    wrapper.appendChild(dragHandle);
    wrapper.appendChild(label);

    const labelText = label.textContent;
    const tooltipText = LABELS_TOOLTIP[labelText];

    label.classList.add("th-label");

    if (tooltipText) {
      const tooltip = document.createElement("div");
      tooltip.className = "th-tooltip";
      tooltip.textContent = tooltipText;
      
      wrapper.appendChild(tooltip);
    } else {
      wrapper.appendChild(label);
    }

    wrapper.appendChild(filterIcon);
    th.appendChild(wrapper);
    trHead.appendChild(th);
  });

  thead.appendChild(trHead);
}

function getDeepValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function handleIconError(img, pair) {
  const fallback = document.createElement("div");
  fallback.className = "icon-pairs-retrun";
  
  fallback.innerHTML = `<span class="named-icon-pairs-retrun">${pair.charAt(0)}</span>`;
  
  img.replaceWith(fallback);
}

window.handleIconError = handleIconError;
/* ───────── Build Body: Init ROW_MAP ───────── */
function buildBody(tickers) {
  tbody.innerHTML = "";
  ROW_MAP.clear();
  originalRows.length = 0;
  ROW_ORDER.length = 0;
  ROW_ORDER_SET.clear();

  if (!Array.isArray(tickers) || tickers.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = getActiveFields().length + 1;
    td.textContent = "No data available";
    td.style.textAlign = "center";
    td.style.padding = "20px";
    tr.appendChild(td);
    tbody.appendChild(tr);
    PREVIOUS_TICKERS = [];
    ROW_ORDER.length = 0;
    ROW_ORDER_SET.clear();
    return;
  }

  tickers.forEach(ticker => {
    const tr = document.createElement("tr");
    tr.appendChild(renderCoinCell(ticker));

    getActiveFields().forEach(field => {
      const td = document.createElement("td");
      const raw = getDeepValue(ticker, field);
      const formatter = FORMATTERS[field];
      td.textContent = formatter ? formatter(raw) : (raw ?? "-");
      td.dataset.rawValue = raw;

      const styler = FIELD_STYLE_MAP[field];
      if (styler) {
        const styleClass = styler(raw);
        if (styleClass) td.classList.add(styleClass);
      }
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
    originalRows.push(tr);
    
    // Init ROW_MAP
    const key = getTickerKey(ticker);
    ROW_MAP.set(key, tr);
    if (key && !ROW_ORDER_SET.has(key)) {
      ROW_ORDER.push(key);
      ROW_ORDER_SET.add(key);
    }
  });

  PREVIOUS_TICKERS = [...tickers];
}

function renderCoinCell(ticker) {
  const td = document.createElement("td");
  
  const pair = ticker.baseAsset;
  const icon = ICON_MAP[pair] || "";

  let displayName = pair;
  if (ticker.quoteCurrency) {
    displayName = `${pair}-${ticker.quoteCurrency}`;
  }
  
  if (!ticker.quoteCurrency && ticker.symbol) { 
    displayName = ticker.symbol;
  }

  let iconKey = pair;
  if (!ICON_MAP[pair] && pair.includes(':')) {
    const withoutPrefix = pair.split(':')[1];
    if (ICON_MAP[withoutPrefix]) {
      iconKey = withoutPrefix;
    }
  }

  const iconSrc = ICON_MAP[iconKey] || "";
  const iconHtml = iconSrc 
    ? `<img class="icon-pairs" src="${iconSrc}" onerror="handleIconError(this, '${displayName}')" />`
    : `<div class="icon-pairs-retrun"><span class="named-icon-pairs-retrun">${displayName.charAt(0)}</span></div>`;

  td.innerHTML = `
    <div class="coin-cell">
      ${iconHtml}
      <span>${displayName}</span>
    </div>
  `;
  
  td.dataset.originalPair = pair;
  
  return td;
}

const originalRows = [];

/* ───────── STATE UNTUK INCREMENTAL UPDATE ───────── */
let PREVIOUS_TICKERS = [];
let ROW_MAP = new Map();
let ROW_ORDER = [];
let ROW_ORDER_SET = new Set();

/* ───────── Helper: Get Unique Key ───────── */
function getTickerKey(ticker) {
  if (ticker?.symbol) return ticker.symbol;
  if (ticker?.baseAsset && ticker?.quoteCurrency) {
    return `${ticker.baseAsset}-${ticker.quoteCurrency}`;
  }
  return ticker?.baseAsset || JSON.stringify(ticker);
}

/* ───────── Body Data: UPDATE INCREMENTAL (FIXED) ───────── */
function updateTableIncremental(newTickers) {
  if (!Array.isArray(newTickers)) {
    newTickers = [];
  }

  const newRowCount = newTickers.length;
  const oldRowCount = PREVIOUS_TICKERS.length;

  const newMap = new Map();
  newTickers.forEach((ticker, idx) => {
    const key = getTickerKey(ticker);
    if (!key) return;
    newMap.set(key, { ticker, index: idx });
    if (!ROW_ORDER_SET.has(key)) {
      ROW_ORDER.push(key);
      ROW_ORDER_SET.add(key);
    }
  });

  newTickers.forEach((newItem, newIndex) => {
    const key = getTickerKey(newItem);
    const oldItem = PREVIOUS_TICKERS.find(t => getTickerKey(t) === key);
    
    let row = ROW_MAP.get(key);
    
    if (!row) {
      row = document.createElement("tr");
      row.appendChild(renderCoinCell(newItem));
      
      getActiveFields().forEach(() => {
        const td = document.createElement("td");
        row.appendChild(td);
      });
      
      tbody.appendChild(row);
      ROW_MAP.set(key, row);
    }

    const coinCell = row.cells[0];
    if (!oldItem || oldItem.baseAsset !== newItem.baseAsset || 
        oldItem.quoteCurrency !== newItem.quoteCurrency ||
        oldItem.symbol !== newItem.symbol) {
      
      const newCoinCell = renderCoinCell(newItem);
      row.replaceChild(newCoinCell, coinCell);
    }

    getActiveFields().forEach((field, colIndex) => {
      const td = row.cells[colIndex + 1];
      if (!td) return;

      const newValue = getDeepValue(newItem, field);
      const oldValue = oldItem ? getDeepValue(oldItem, field) : undefined;
      
      if (newValue !== oldValue || !oldItem) {
        const formatter = FORMATTERS[field];
        const displayValue = formatter ? formatter(newValue) : (newValue ?? "-");
        
        td.textContent = displayValue;
        td.dataset.rawValue = newValue;
        
        td.className = '';
        const styler = FIELD_STYLE_MAP[field];
        if (styler) {
          const styleClass = styler(newValue);
          if (styleClass) td.classList.add(styleClass);
        }
        
        td.classList.add('cell-updated');
        setTimeout(() => td.classList.remove('cell-updated'), 200);
      }
    });
  });

  ROW_MAP.forEach((row, key) => {
    if (!newMap.has(key) && row.parentElement === tbody) {
      tbody.removeChild(row);
      ROW_MAP.delete(key);
    }
  });

  const fragment = document.createDocumentFragment();
  ROW_ORDER.forEach(key => {
    if (!newMap.has(key)) return;
    const row = ROW_MAP.get(key);
    if (row) fragment.appendChild(row);
  });
  tbody.appendChild(fragment);

  PREVIOUS_TICKERS = [...newTickers];
}

/* ───────── Short ───────── */
function sortTableByColumn(colIndex, direction) {
  const idx = colIndex - 1;
  const rows = Array.from(tbody.rows);

  if (direction === "none") {
    tbody.innerHTML = "";
    originalRows.forEach(r => tbody.appendChild(r));
    return;
  }

  rows.sort((a, b) => {
    const cellA = a.children[idx];
    const cellB = b.children[idx];

    const rawA = parseFloat(cellA.dataset.rawValue ?? cellA.textContent);
    const rawB = parseFloat(cellB.dataset.rawValue ?? cellB.textContent);

    if (!isNaN(rawA) && !isNaN(rawB)) {
      return direction === "asc" ? rawA - rawB : rawB - rawA;
    }

    const textA = cellA.textContent.trim();
    const textB = cellB.textContent.trim();
    return direction === "asc"
      ? textA.localeCompare(textB, undefined, { numeric: true })
      : textB.localeCompare(textA, undefined, { numeric: true });
  });

  tbody.innerHTML = "";
  rows.forEach(r => tbody.appendChild(r));
}

/* ───────── Drag Column ───────── */
function initDrag() {
  document.querySelectorAll(".drag-handle").forEach(handle => {
    const th = handle.closest("th");
    const colIndex = parseInt(th.dataset.colIndex, 10);

    handle.draggable = true;

    handle.addEventListener("dragstart", e => {
      e.dataTransfer.setDragImage(new Image(), 0, 0);
      dragColIndex = colIndex;
      handle.classList.add("dragging");
    });

    handle.addEventListener("dragend", () => {
      handle.classList.remove("dragging");
    });
  });

  document.querySelectorAll(".crypto-table thead th").forEach(th => {
    const colIndex = parseInt(th.dataset.colIndex, 10);
    if (colIndex === 1) return;

    th.addEventListener("dragover", e => {
      e.preventDefault();
      th.classList.add("drop-indicator");
    });

    th.addEventListener("dragleave", () => {
      th.classList.remove("drop-indicator");
    });

    th.addEventListener("drop", e => {
      e.preventDefault();
      th.classList.remove("drop-indicator");

      if (dragColIndex === null || dragColIndex === colIndex) return;
      moveColumn(dragColIndex, colIndex);
      dragColIndex = null;
    });
  });
}

/* ───────── Move Column ───────── */
function moveColumn(from, to) {
  const fromIdx = from - 1;
  const toIdx = to - 1;

  [...table.rows].forEach(row => {
    const cells = Array.from(row.children);
    const moved = cells[fromIdx];
    const target = cells[toIdx];
    if (!moved || !target) return;

    if (toIdx > fromIdx) {
      row.insertBefore(moved, target.nextSibling);
    } else {
      row.insertBefore(moved, target);
    }
  });
}

// ───────── ON OFF RENDER ───────── //
const COLUMN_CONFIG_KEY = "column_visibility_v1";

const DEFAULT_COLUMN_CONFIG = {
  "price": true,
  "openInterestUsd": true,
  "fundingRate": true,
  "mcap": true,

  // Change %
  "tf5m.changePercent": true,
  "tf15m.changePercent": true,
  "tf1h.changePercent": true,
  "tf4h.changePercent": true,
  "tf8h.changePercent": true,
  "tf12h.changePercent": true,
  "tf1d.changePercent": true,

  // Change $
  "tf5m.changeDollar": true,
  "tf15m.changeDollar": true,
  "tf1h.changeDollar": true,
  "tf4h.changeDollar": true,
  "tf8h.changeDollar": true,
  "tf12h.changeDollar": true,
  "tf1d.changeDollar": true,

  // Volume
  "tf5m.volume": true,
  "tf15m.volume": true,
  "tf1h.volume": true,
  "tf4h.volume": true,
  "tf8h.volume": true,
  "tf12h.volume": true,
  "tf1d.volume": true,

  // Trades
  "tf5m.trades": true,
  "tf15m.trades": true,
  "tf1h.trades": true,
  "tf4h.trades": true,
  "tf8h.trades": true,
  "tf12h.trades": true,
  "tf1d.trades": true,

  // Volatility
  "tf5m.volatility": true,
  "tf15m.volatility": true,
  "tf1h.volatility": true,
  "tf4h.volatility": true,
  "tf8h.volatility": true,
  "tf12h.volatility": true,
  "tf1d.volatility": true,

  // OI Change %
  "tf5m.oiChange": true,
  "tf15m.oiChange": true,
  "tf1h.oiChange": true,
  "tf4h.oiChange": true,
  "tf8h.oiChange": true,
  "tf12h.oiChange": true,
  "tf1d.oiChange": true,

  // OI Change $
  "tf5m.oiChangeDollar": true,
  "tf15m.oiChangeDollar": true,
  "tf1h.oiChangeDollar": true,
  "tf4h.oiChangeDollar": true,
  "tf8h.oiChangeDollar": true,
  "tf12h.oiChangeDollar": true,
  "tf1d.oiChangeDollar": true,

  // CVD
  "tf5m.vdelta": true,
  "tf15m.vdelta": true,
  "tf1h.vdelta": true,
  "tf4h.vdelta": true,
  "tf8h.vdelta": true,
  "tf12h.vdelta": true,
  "tf1d.vdelta": true,

  // Volume Change %
  "tf5m.volumeChange": true,
  "tf15m.volumeChange": true,
  "tf1h.volumeChange": true,
  "tf4h.volumeChange": true,
  "tf8h.volumeChange": true,
  "tf12h.volumeChange": true,
  "tf1d.volumeChange": true,

  // Volume Change $
  "tf5m.volumeChangeDollar": true,
  "tf15m.volumeChangeDollar": true,
  "tf1h.volumeChangeDollar": true,
  "tf4h.volumeChangeDollar": true,
  "tf8h.volumeChangeDollar": true,
  "tf12h.volumeChangeDollar": true,
  "tf1d.volumeChangeDollar": true,

  // BTC
  "tf5m.btcCorrelation": true,
  "tf15m.btcCorrelation": true,
  "tf1h.btcCorrelation": true,
  "tf4h.btcCorrelation": true,
  "tf8h.btcCorrelation": true,
  "tf12h.btcCorrelation": true,
  "tf1d.btcCorrelation": true,
};

function loadColumnConfig() {
  return {
    ...DEFAULT_COLUMN_CONFIG,
    ...JSON.parse(localStorage.getItem(COLUMN_CONFIG_KEY) || "{}")
  };
}

function saveColumnConfig(cfg) {
  localStorage.setItem(COLUMN_CONFIG_KEY, JSON.stringify(cfg));
}

let COLUMN_CONFIG = loadColumnConfig();

function getActiveFields() {
  return FIELDS.filter(f => COLUMN_CONFIG[f] !== false);
}

function handleColumnConfigChange() {
  buildHeader();
  PREVIOUS_TICKERS = [];
  refreshTable();
  initDrag();
}

document.querySelectorAll("input[type='checkbox'][data-field]").forEach(cb => {
  const field = cb.dataset.field;

  cb.checked = COLUMN_CONFIG[field] !== false;

  cb.addEventListener("change", () => {
    COLUMN_CONFIG[field] = cb.checked;
    saveColumnConfig(COLUMN_CONFIG);
    handleColumnConfigChange();
  });
});

// Hidden All & Show All
document.querySelectorAll(".btn-column").forEach(btn => {
  const wrapper = btn.closest(".wrapper-core, .wrapper-core"); 
  const checkboxes = wrapper.querySelectorAll("input[type='checkbox'][data-field]");

  btn.addEventListener("click", () => {
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    if (allChecked) {
      checkboxes.forEach(cb => {
        cb.checked = false;
        COLUMN_CONFIG[cb.dataset.field] = false;
      });
      btn.classList.remove("hidden-all");
    } else {
      checkboxes.forEach(cb => {
        cb.checked = true;
        COLUMN_CONFIG[cb.dataset.field] = true;
      });
      btn.classList.add("hidden-all");
    }

    saveColumnConfig(COLUMN_CONFIG);
    handleColumnConfigChange();
  });

  const allCheckedInit = Array.from(checkboxes).every(cb => cb.checked);
  if (allCheckedInit) btn.classList.add("hidden-all");
});

// Btn 
const btnAll = document.getElementById("AllShow");
const btnDefaults = document.getElementById("Defaults");
const btnCoreOnly = document.getElementById("CoreOnly");

const CORE_FIELDS = ["price", "openInterestUsd", "fundingRate", "mcap"];
const DEFAULT_FIELDS = [
  ...CORE_FIELDS,
  "tf15m.volume",
  "tf15m.oiChange"
];

function setFieldsActive(activeFields) {
  document.querySelectorAll('input[type="checkbox"][data-field]').forEach(cb => {
    const field = cb.dataset.field;
    const isActive = activeFields.includes(field);
    cb.checked = isActive;
    COLUMN_CONFIG[field] = isActive;
  });

  saveColumnConfig(COLUMN_CONFIG);

  handleColumnConfigChange();

  document.querySelectorAll(".wrapper-core, .wrapper-column").forEach(wrapper => {
    const sectionCheckboxes = wrapper.querySelectorAll('input[type="checkbox"][data-field]');
    const btn = wrapper.querySelector(".btn-column");
    if (!btn) return;
    const allChecked = Array.from(sectionCheckboxes).every(cb => cb.checked);
    if (allChecked) btn.classList.add("hidden-all");
    else btn.classList.remove("hidden-all");
  });
}

btnAll.addEventListener("click", () => {
  setFieldsActive(FIELDS);
});

btnDefaults.addEventListener("click", () => {
  setFieldsActive(DEFAULT_FIELDS);
});

btnCoreOnly.addEventListener("click", () => {
  setFieldsActive(CORE_FIELDS);
});

// ───────── Filter ───────── //
const LABEL_TO_FIELD = {};

for (const [field, label] of Object.entries(FIELD_LABELS)) {
  LABEL_TO_FIELD[label] = field;
}

const filterWrapper = document.querySelector('.wrapper-filter');
const trigger1 = filterWrapper.querySelector('#dropdownWrapper1 .trigger-text');
const trigger2 = filterWrapper.querySelector('#dropdownWrapper2 .trigger-text');
const valueInput = filterWrapper.querySelector('input[type="number"]');
const addFilterBtn = document.getElementById('AddFilters');
const clearFilterBtn = document.getElementById('ClearFilter');

function applyFilters(tickers) {
  if (activeFilters.length === 0) return tickers;

  return tickers.filter(ticker => {
    return activeFilters.every(filter => {
      const rawValue = getDeepValue(ticker, filter.field);
      if (rawValue == null || rawValue === '' || rawValue === '-') return false;

      const num = parseFloat(rawValue);
      if (isNaN(num)) return false;

      const threshold = parseFloat(filter.value);
      if (isNaN(threshold)) return false;

      const op = filter.op;

      switch (op) {
        case '>': return num > threshold;
        case '>=': return num >= threshold;
        case '<': return num < threshold;
        case '<=': return num <= threshold;
        case '=': return Math.abs(num - threshold) < 1e-9;
        case '|x| >': return Math.abs(num) > threshold;
        default: return true;
      }
    });
  });
}

addFilterBtn.addEventListener('click', () => {
  const label1 = trigger1.textContent.trim();
  const operator = trigger2.textContent.trim();
  const inputValue = valueInput.value.trim();

  if (!label1 || !operator || !inputValue) {
    document.querySelectorAll('.dropdown-trigger, #inputFilterValue').forEach(el => {
      el.style.border = '';
    });

    if (!label1 || label1 === 'Select...') {
      const triggerEl = document.querySelector('#dropdownWrapper1 .dropdown-trigger');
      if (triggerEl) triggerEl.style.border = "1px solid var(--red)";
    }
    if (!operator || operator === 'Select...') {
      const triggerEl = document.querySelector('#dropdownWrapper2 .dropdown-trigger');
      if (triggerEl) triggerEl.style.border = "1px solid var(--red)";
    }
    if (!inputValue) {
      const inputEl = document.getElementById('inputFilterValue');
      if (inputEl) inputEl.style.border = "1px solid var(--red)";
    }

    setTimeout(() => {
      document.querySelectorAll('.dropdown-trigger, #inputFilterValue').forEach(el => {
        el.style.border = '';
      });
    }, 2000);

    return;
  }

  const field = LABEL_TO_FIELD[label1];
  if (!field) {
    console.warn("Unknown field label:", label1);
    const triggerEl = document.querySelector('#dropdownWrapper1 .dropdown-trigger');
    if (triggerEl) triggerEl.style.border = "1px solid var(--red)";
    setTimeout(() => {
      if (triggerEl) triggerEl.style.border = "";
    }, 2000);
    return;
  }

  const numValue = parseFloat(inputValue);
  if (isNaN(numValue)) {
    const inputEl = document.getElementById('inputFilterValue');
    if (inputEl) inputEl.style.border = "1px solid var(--red)";
    setTimeout(() => {
      if (inputEl) inputEl.style.border = "";
    }, 2000);
    return;
  }

  activeFilters.push({
    field,
    op: operator,
    value: numValue
  });

  document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.classList.remove('active');
  });

  refreshTable();
});

clearFilterBtn.addEventListener('click', () => {
  activeFilters = [];

  valueInput.value = '';
  trigger1.textContent = 'Select...';
  trigger2.textContent = 'Select...';

  dropdown1Trigger.dataset.selectedValue = '';
  dropdown2Trigger.dataset.selectedValue = '';

  document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.classList.remove('active');
  });

  refreshTable();
});

// ───────── Filter Shortcut ───────── //
const dropdown1Trigger = document.querySelector('#dropdownWrapper1 .dropdown-trigger');
const dropdown2Trigger = document.querySelector('#dropdownWrapper2 .dropdown-trigger');

const PRESET_FILTERS = {
  "FilterHV": {
    id: "high_volume",
    field: "tf1h.volume",
    op: ">",
    value: 10_000_000
  },
  "FilterOS": {
    id: "oi_spike",
    field: "tf1h.oiChange",
    op: ">",
    value: 5
  },
  "FilterBM": {
    id: "big_movers",
    field: "tf1h.changePercent",
    op: ">",
    value: 3
  },
  "FilterHF": {
    id: "high_funding",
    field: "fundingRate",
    op: "|x| >",
    value: 0.05
  }
};

document.querySelectorAll('.btn-filter').forEach(btn => {
  const presetKey = btn.id;
  const preset = PRESET_FILTERS[presetKey];

  if (!preset) return;

  btn.addEventListener('click', () => {
    const wasActive = btn.classList.contains('active');

    document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));

    activeFilters = [];

    if (!wasActive) {
      btn.classList.add('active');

      activeFilters.push({
        id: preset.id,
        field: preset.field,
        op: preset.op,
        value: preset.value
      });

      const label1 = FIELD_LABELS[preset.field] || 'Select...';
      trigger1.textContent = label1;
      dropdown1Trigger.dataset.selectedValue = label1;

      trigger2.textContent = preset.op;
      dropdown2Trigger.dataset.selectedValue = preset.op;

      valueInput.value = preset.value;
    } else {
      trigger1.textContent = 'Select...';
      dropdown1Trigger.dataset.selectedValue = '';

      trigger2.textContent = 'Select...';
      dropdown2Trigger.dataset.selectedValue = '';

      valueInput.value = '';
    }

    refreshTable();
  });
});

// ───────── Search ───────── //
function refreshTable() {
  let data = [...CURRENT_TICKERS];
  
  data = applyFilters(data);
  data = filterBySearch(data, currentSearchTerm);

  // Reset sort state
  if (activeSortCol) {
    resetAllSortIcons();
    activeSortCol = null;
  }

  // Render
  if (PREVIOUS_TICKERS.length === 0 || data.length === 0) {
    buildBody(data);
  } else {
    updateTableIncremental(data);
  }
}

const searchInput = document.querySelector('.box-search input[type="text"]');
let currentSearchTerm = '';

function filterBySearch(tickers, term) {
  if (!term.trim()) return tickers;

  const lowerTerm = term.toLowerCase();

  return tickers.filter(ticker => {
    let displayName = '';

    if (ticker.quoteCurrency) {
      displayName = `${ticker.baseAsset}-${ticker.quoteCurrency}`;
    } else if (ticker.symbol) {
      displayName = ticker.symbol;
    } else {
      displayName = ticker.baseAsset || '';
    }

    return displayName.toLowerCase().includes(lowerTerm);
  });
}

searchInput.addEventListener('input', (e) => {
  currentSearchTerm = e.target.value;
  refreshTable();
});

// ───────── Popup ───────── //
document.addEventListener("DOMContentLoaded", () => {
  const btnFilter = document.getElementById("BtnFilter");
  const btnColumn = document.getElementById("BtnColumn");

  const popupFilter = document.querySelector(".container-filter");
  const popupColumn = document.querySelector(".container-column");

  const closeButtons = document.querySelectorAll(".btn-close");

  if (!btnFilter || !btnColumn || !popupFilter || !popupColumn) return;

  function togglePopup(btn, popup, otherBtn, otherPopup) {
    const isOpening = !popup.classList.contains("show");

    otherPopup.classList.remove("show");
    otherBtn.classList.remove("active");

    const rect = btn.getBoundingClientRect();
    popup.style.position = "absolute";
    popup.style.top = `${rect.bottom + 8 + window.scrollY}px`;
    popup.style.right = `${window.innerWidth - rect.right - window.scrollX}px`;

    popup.classList.toggle("show", isOpening);

    btn.classList.toggle("active", isOpening);
  }

  btnFilter.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePopup(btnFilter, popupFilter, btnColumn, popupColumn);
  });

  btnColumn.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePopup(btnColumn, popupColumn, btnFilter, popupFilter);
  });

  [popupFilter, popupColumn].forEach((popup) => {
    popup.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      popupFilter.classList.remove("show");
      popupColumn.classList.remove("show");
      btnFilter.classList.remove("active");
      btnColumn.classList.remove("active");
    });
  });

  document.addEventListener("click", () => {
    popupFilter.classList.remove("show");
    popupColumn.classList.remove("show");
    btnFilter.classList.remove("active");
    btnColumn.classList.remove("active");
  });
});

// ───────── Chekbox Div ───────── //
document.addEventListener("click", (e) => {
  const box = e.target.closest(".box-column");
  if (!box) return;

  const checkbox = box.querySelector(".ui-checkbox");
  if (!checkbox) return;

  if (e.target !== checkbox) {
    checkbox.checked = !checkbox.checked;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
  }
}, true);

// ───────── Dropdown ───────── //
function initDropdown(triggerEl, panelEl, wrapperEl) {
  triggerEl.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = panelEl.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) {
      panelEl.classList.add('open');
      triggerEl.classList.add('open');
      wrapperEl.classList.add('open-state');
    }
  });

  panelEl.querySelectorAll('.option-item').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      panelEl.querySelectorAll('.option-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const triggerText = triggerEl.querySelector('.trigger-text');
      triggerText.textContent = item.dataset.value;

      triggerEl.dataset.selectedValue = item.dataset.value;

      closeAllDropdowns();
    });
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-wrapper').forEach(wrapper => {
    wrapper.classList.remove('open-state');
    wrapper.querySelector('.dropdown-trigger')?.classList.remove('open');
    wrapper.querySelector('.dropdown-panel')?.classList.remove('open');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.dropdown-trigger .trigger-text').forEach(el => {
    el.textContent = 'Select...';
    el.closest('.dropdown-trigger').dataset.selectedValue = '';
  });

  document.querySelectorAll('.dropdown-wrapper').forEach(wrapper => {
    const trigger = wrapper.querySelector('.dropdown-trigger');
    const panel = wrapper.querySelector('.dropdown-panel');
    if (trigger && panel) {
      initDropdown(trigger, panel, wrapper);
    }
  });
});

document.addEventListener('click', e => {
  if (!e.target.closest('.dropdown-wrapper')) {
    closeAllDropdowns();
  }
});

// ───────── Network ───────── //
// const latencyEl = document.querySelector('.latency');
// const rowConnect = document.querySelector('.row-connect');
// const textConnect = document.querySelector('.text-connect');
// const circle = document.querySelector('.circle-connect');

// function setNetworkStatus(status, latency = null) {
//   latencyEl.className = 'latency';
//   rowConnect.className = 'row-connect';
//   textConnect.className = 'text-connect';
//   circle.className = 'circle-connect';

//   if (latency !== null) latencyEl.textContent = `${latency}ms`;

//   latencyEl.classList.add(status);
//   rowConnect.classList.add(`bg-${status}`);
//   textConnect.classList.add(status);
//   circle.classList.add(status);

//   if (status === 'green') textConnect.textContent = 'Connected';
//   if (status === 'yellow') textConnect.textContent = 'Connected Slow';
//   if (status === 'red') textConnect.textContent = 'Disconnected';
//   if (status === 'gray') textConnect.textContent = 'Idle';
// }

// setNetworkStatus('gray');

// async function checkLatency() {
//   const start = performance.now();
//   try {
//     await fetch('https://1.1.1.1/cdn-cgi/trace', {
//       cache: 'no-store',
//       mode: 'no-cors'
//     });

//     const ms = Math.round(performance.now() - start);

//     if (ms < 80) setNetworkStatus('green', ms);
//     else if (ms < 200) setNetworkStatus('yellow', ms);
//     else setNetworkStatus('red', ms);
//   } catch {
//     setNetworkStatus('red');
//   }
// }

// setInterval(checkLatency, 5000);
// checkLatency();

// ───────── Realtime Price ───────── //
// let solPrice = 0;

// const priceMap = {
//   btcusdt: document.getElementById('RealtimeBitcoin'),
//   ethusdt: document.getElementById('RealtimeEthereum'),
//   solusdt: document.getElementById('RealtimeSolana'),
// };

// const ws = new WebSocket(
//   'wss://stream.binance.com:9443/stream?streams=btcusdt@trade/ethusdt@trade/solusdt@trade'
// );

// ws.onmessage = (e) => {
//   const msg = JSON.parse(e.data);
//   const symbol = msg.stream.replace('@trade', '');
//   const price = parseFloat(msg.data.p);

//   if (symbol === 'solusdt') {
//     solPrice = price;
//   }

//   const el = priceMap[symbol];
//   if (el) {
//     el.textContent = `$${price.toLocaleString('en-US', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     })}`;
//   }
// };

// ws.onclose = () => {
//   Object.values(priceMap).forEach(el => {
//     if (el) el.textContent = 'disconnected';
//   });
//   setTimeout(() => location.reload(), 3000);
// };
