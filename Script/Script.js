// ───────── Format ───────── //
const formatUSD = (val) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(val);
};

const formatUSDShort = (val) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(val);
};

const formatPercent = (val) => {
  if (val == null || isNaN(val)) return "-";

  const percent = val * 100;
  const abs = Math.abs(percent);

  let decimals = 2;

  if (abs !== 0 && abs < 1) {
    decimals = Math.min(
      6,
      Math.ceil(Math.abs(Math.log10(abs))) + 1
    );
  }

  return `${percent.toFixed(decimals)}%`;
};

const table = document.querySelector(".crypto-table");
const thead = table.querySelector("thead");
const tbody = table.querySelector("tbody");

let dragColIndex = null;
const sortStates = {};
let activeSortCol = null;

const FIELDS = [
  // Core
  "price", 
  "openInterestUsd", 
  "fundingRate",
  "mcap",

  // Change %
  // Change $
  // Volume
  // Trades
  // Volatility
  // Open Interest Changes %
  // Open Interest Changes $
  // CVD
  // Voume Changes %
  // Voume Changes $
  // Btc Corr
];

const FIELD_LABELS = {
  // Core
  price: "Price",
  openInterestUsd: "OI $",
  fundingRate: "Funding",
  mcap: "Mcap"

  // Change %
  // Change $
  // Volume
  // Trades
  // Volatility
  // Open Interest Changes %
  // Open Interest Changes $
  // CVD
  // Voume Changes %
  // Voume Changes $
  // Btc Corr
};

const FORMATTERS = {
  // Core
  price: formatUSD,
  openInterestUsd: formatUSDShort,
  fundingRate: formatPercent,
  mcap: formatUSDShort,

  // Change %
  // Change $
  // Volume
  // Trades
  // Volatility
  // Open Interest Changes %
  // Open Interest Changes $
  // CVD
  // Voume Changes %
  // Voume Changes $
  // Btc Corr
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
Promise.all([
  fetch("/Apps/Screener/Data/Binance.json").then(r => r.json()),
  fetch("/Apps/Screener/Data/Icon.json").then(r => r.json())
]).then(([binance, icons]) => {
  ICON_MAP = icons;

  buildHeader();
  buildBody(binance.tickers);
  initDrag();
});

/* ───────── BUILD HEADER ───────── */
function buildHeader() {
  thead.innerHTML = "";
  const trHead = document.createElement("tr");

  // === COIN HEADER (INDEX 0) ===
  const thCoin = document.createElement("th");
  thCoin.setAttribute("data-col-index", 1);
  thCoin.textContent = "Pairs";
  trHead.appendChild(thCoin);

  // === DATA HEADERS ===
  FIELDS.forEach((field, i) => {
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
    wrapper.appendChild(filterIcon);
    th.appendChild(wrapper);
    trHead.appendChild(th);
  });

  thead.appendChild(trHead);
}

/* ───────── Body Data ───────── */
function buildBody(tickers) {
  tbody.innerHTML = "";

  tickers.forEach(ticker => {
    const tr = document.createElement("tr");

    // COIN COLUMN
    const tdCoin = document.createElement("td");
    const pair = ticker.baseAsset;
    const icon = ICON_MAP[pair] || "";

    tdCoin.innerHTML = `
      <div class="coin-cell">
        ${icon ? `<img class="icon-pairs" src="${icon}" />` : ""}
        <span>${pair}</span>
      </div>
    `;

    tr.appendChild(tdCoin);

    // DATA COLUMNS
    FIELDS.forEach(field => {
      const td = document.createElement("td");
      const raw = ticker[field];
      const formatter = FORMATTERS[field];

      td.textContent = formatter ? formatter(raw) : raw;
      td.dataset.rawValue = raw;

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  originalRows.length = 0;
  originalRows.push(...Array.from(tbody.rows));
}

const originalRows = [];

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

    return direction === "asc"
      ? A.localeCompare(B)
      : B.localeCompare(A);
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

// ───────── Popup ───────── //
document.addEventListener("DOMContentLoaded", () => {
  const btnFilter = document.getElementById("BtnFilter");
  const btnColumn = document.getElementById("BtnColumn");

  const popupFilter = document.querySelector(".container-filter");
  const popupColumn = document.querySelector(".container-column");

  const closeButtons = document.querySelectorAll(".btn-close");

  if (!btnFilter || !btnColumn || !popupFilter || !popupColumn) return;

  function togglePopup(btn, popup) {
    const rect = btn.getBoundingClientRect();

    popup.style.position = "absolute";
    popup.style.top = `${rect.bottom + 8 + window.scrollY}px`;
    popup.style.right = `${
      window.innerWidth - rect.right - window.scrollX
    }px`;

    popup.classList.toggle("show");
  }

  btnFilter.addEventListener("click", (e) => {
    e.stopPropagation();
    popupColumn.classList.remove("show");
    togglePopup(btnFilter, popupFilter);
  });

  btnColumn.addEventListener("click", (e) => {
    e.stopPropagation();
    popupFilter.classList.remove("show");
    togglePopup(btnColumn, popupColumn);
  });

  // klik di dalam popup → JANGAN close
  [popupFilter, popupColumn].forEach((popup) => {
    popup.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });

  // tombol X
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      popupFilter.classList.remove("show");
      popupColumn.classList.remove("show");
    });
  });

  // klik di luar → close
  document.addEventListener("click", () => {
    popupFilter.classList.remove("show");
    popupColumn.classList.remove("show");
  });
});

// ───────── Dropdown ───────── //
function initDropdown(triggerEl, panelEl, wrapperEl) {
  // Toggle dropdown
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

  // Select option
  panelEl.querySelectorAll('.option-item').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();

      panelEl.querySelectorAll('.option-item')
        .forEach(i => i.classList.remove('active'));

      item.classList.add('active');

      const triggerText = triggerEl.querySelector('.trigger-text');
      triggerText.textContent = item.dataset.value;

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
const latencyEl = document.querySelector('.latency');
const rowConnect = document.querySelector('.row-connect');
const textConnect = document.querySelector('.text-connect');
const circle = document.querySelector('.circle-connect');

function setNetworkStatus(status, latency = null) {
  latencyEl.className = 'latency';
  rowConnect.className = 'row-connect';
  textConnect.className = 'text-connect';
  circle.className = 'circle-connect';

  if (latency !== null) latencyEl.textContent = `${latency}ms`;

  latencyEl.classList.add(status);
  rowConnect.classList.add(`bg-${status}`);
  textConnect.classList.add(status);
  circle.classList.add(status);

  if (status === 'green') textConnect.textContent = 'Connected';
  if (status === 'yellow') textConnect.textContent = 'Connected Slow';
  if (status === 'red') textConnect.textContent = 'Disconnected';
  if (status === 'gray') textConnect.textContent = 'Idle';
}

setNetworkStatus('gray');

async function checkLatency() {
  const start = performance.now();
  try {
    await fetch('https://1.1.1.1/cdn-cgi/trace', {
      cache: 'no-store',
      mode: 'no-cors'
    });

    const ms = Math.round(performance.now() - start);

    if (ms < 80) setNetworkStatus('green', ms);
    else if (ms < 200) setNetworkStatus('yellow', ms);
    else setNetworkStatus('red', ms);
  } catch {
    setNetworkStatus('red');
  }
}

setInterval(checkLatency, 5000);
checkLatency();

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