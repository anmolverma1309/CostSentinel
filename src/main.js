import { ANOMALIES } from './data/anomalies.js';
import { PLAYBOOK } from './data/playbook.js';

let currentModalAction = null;
let scanDone = false;
let isScanning = false;
let donutChart = null;
let waterfallChart = null;
let activityFeedInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  // Bind standard events
  document.getElementById('mainScanBtn').addEventListener('click', runFullScan);
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('approveActionBtn').addEventListener('click', approveAction);
  document.getElementById('escalateActionBtn').addEventListener('click', escalateAction);
  document.getElementById('sendBtn').addEventListener('click', sendQuery);
  document.getElementById('exportBtn').addEventListener('click', exportReport); // [U10] Export Report

  // [UX] Tab Switching logic (F5)
  document.querySelectorAll('.nav-tabs .tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-tabs .tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      e.target.classList.add('active');
      e.target.setAttribute('aria-selected', 'true');
      
      const targetId = e.target.getAttribute('data-target');
      document.querySelectorAll('.view-panel').forEach(panel => {
        panel.classList.remove('active');
        panel.style.display = 'none';
      });
      const activePanel = document.getElementById(targetId);
      activePanel.classList.add('active');
      activePanel.style.display = 'block';
    });
  });

  // [UX] Keyboard Shortcuts & Trap (Phase 4)
  document.getElementById('queryInput').addEventListener('keydown', (e) => {
    // Ctrl+Enter or regular Enter to send query
    if (e.key === 'Enter') sendQuery();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('modalOverlay').classList.contains('active')) {
      closeModal();
    }
  });

  // Simple Focus Trap for modal
  const modal = document.getElementById('modal');
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey) { 
        if (document.activeElement === first) { last.focus(); e.preventDefault(); }
      } else { 
        if (document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    }
  });

});

async function runFullScan() {
  if (isScanning) return;
  isScanning = true;

  const btn = document.getElementById('mainScanBtn');
  btn.disabled = true;

  const overlay = document.getElementById('scanOverlay');
  const scanText = document.getElementById('scanText');
  const scanSub = document.getElementById('scanSub');

  const steps = [
    ["CONNECTING TO DATA SOURCES...", "Vendor invoices · ERP · Cloud billing APIs"],
    ["RUNNING SPEND MONITOR AGENT...", "Parsing 14,200 transaction records"],
    ["RUNNING RESOURCE OPTIMIZER...", "Scanning 847 cloud assets"],
    ["RUNNING FINOPS RECONCILER...", "Cross-referencing 3 GL systems"],
    ["GENERATING ACTION PLAYBOOK...", "Ranking by ROI · Preparing approval workflows"],
  ];

  overlay.classList.add('active');
  for (const [t, s] of steps) {
    scanText.textContent = t;
    scanSub.textContent = s;
    // ARIA live region picks this up naturally
    await sleep(900);
  }
  overlay.classList.remove('active');

  const currentKpi1 = parseMoney(document.getElementById('kpi1').textContent);
  const currentKpi2 = parseInt(document.getElementById('kpi2').textContent, 10) || 0;
  const currentKpi3 = parseMoney(document.getElementById('kpi3').textContent);

  animateValue('kpi1', currentKpi1, 385500, '$', '', 1200);
  animateValue('kpi2', currentKpi2, 2, '', '', 800);
  animateValue('kpi3', currentKpi3, 342000, '$', '', 1200);
  
  setTimeout(() => { document.getElementById('kpi4').textContent = '14.2x'; }, 1200);

  setAgent(1, 'ACTIVE', 'badge-active', 'Detected 6 anomalies');
  setAgent(3, 'ACTIVE', 'badge-active', 'Idle assets flagged');

  // Trigger data rendering
  renderCharts();
  populateTable();
  populatePlaybook();
  startLiveFeed();

  if (!scanDone) {
    await typeAgentLog([
      { type:'system', prefix:'SCAN', content:'Deep scan complete — 14,200 records processed across 6 vendors.' },
      { type:'warn-line', prefix:'⚠', content:'HIGH: 2 critical anomalies detected. Estimated leakage: $232,800/yr.' },
      { type:'', prefix:'→', content:'Vendor rate anomaly flagged: Accenture billed $285/hr vs $210/hr contracted.' },
      { type:'', prefix:'→', content:'Cloud idle sprawl: 23 EC2 instances, 60+ days at <2% utilization.' },
      { type:'success-line', prefix:'✓', content:'Action playbook generated. 5 actions ranked by ROI. Total recoverable: $342,000/yr.' },
      { type:'system', prefix:'SYS', content:'Approval workflows ready. Awaiting CFO / ops manager authorization.' },
    ]);
  }

  scanDone = true;
  isScanning = false;
  btn.disabled = false;
}

function parseMoney(str) {
  if (!str || str === '$0') return 0;
  let clean = str.replace(/[^0-9.]/g, '');
  if (str.includes('K')) return parseFloat(clean) * 1000;
  return parseInt(clean, 10) || 0;
}

function setAgent(n, badgeText, badgeClass, statusText) {
  const badge = document.getElementById(`agentBadge${n}`);
  badge.textContent = badgeText;
  badge.className = `agent-badge ${badgeClass}`;
  document.getElementById(`agentStatus${n}`).textContent = statusText;
}

function renderCharts() {
  const ctxDonut = document.getElementById('spendDonutChart').getContext('2d');
  if (donutChart) donutChart.destroy();
  donutChart = new Chart(ctxDonut, {
    type: 'doughnut',
    data: {
      labels: ['Cloud Infrastructure', 'SaaS Licenses', 'Professional Services', 'Facilities'],
      datasets: [{
        data: [148200, 102900, 63400, 29800],
        backgroundColor: ['#00e5ff', '#ff6b35', '#00e676', '#1e2d3a'],
        borderWidth: 0, hoverOffset: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { color: '#c8d8e4', font: { family: "'IBM Plex Mono'", size: 10 } } } },
      cutout: '75%'
    }
  });

  const ctxWaterfall = document.getElementById('savingsWaterfallChart').getContext('2d');
  if (waterfallChart) waterfallChart.destroy();
  waterfallChart = new Chart(ctxWaterfall, {
    type: 'bar',
    data: {
      labels: ['Total Spend', 'Cloud Waste', 'SaaS Waste', 'Rate Anomaly', 'Optimized Total'],
      datasets: [{
        label: 'Financial Flow',
        data: [2500000, -148200, -84600, -63400, 2203800],
        backgroundColor: (ctx) => {
          const val = ctx.raw;
          if (ctx.index === 0 || ctx.index === 4) return '#1e2d3a';
          return val < 0 ? '#ff6b35' : '#1e2d3a';
        },
        borderWidth: 0
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        y: { grid: { color: '#1e2d3a' }, ticks: { color: '#7a99ae', callback: (val) => '$' + (val/1000) + 'K' } },
        x: { grid: { display: false }, ticks: { color: '#7a99ae', font: { size: 10 } } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function startLiveFeed() {
  if (activityFeedInterval) clearInterval(activityFeedInterval);
  const feed = document.getElementById('liveActivityFeed');
  const events = [
    "SLA Guardian checked AWS SLA: 99.99% OK", "Resource Optimizer flagged unattached volume",
    "FinOps Reconciler synced with NetSuite", "Agent orchestration checked heartbeat",
    "Azure Billing API polled successfully"
  ];
  activityFeedInterval = setInterval(() => {
    if (feed.children.length > 5) feed.lastElementChild.remove();
    const event = events[Math.floor(Math.random() * events.length)];
    const div = document.createElement('div');
    div.style.display = 'flex'; div.style.justifyContent = 'space-between'; div.style.animation = 'slideUp 0.3s ease-out';
    div.innerHTML = `<span>${event}</span><span style="opacity:0.5; font-family:var(--mono)">Just now</span>`;
    feed.prepend(div);
  }, 4000);
}

function populateTable() {
  const tbody = document.getElementById('anomalyBody');
  tbody.innerHTML = '';
  ANOMALIES.forEach((a, i) => {
    const tr = document.createElement('tr');
    tr.tabIndex = 0; // Accessible
    
    const tdVendor = document.createElement('td'); tdVendor.style.fontWeight = '500'; tdVendor.textContent = a.vendor;
    const tdType = document.createElement('td'); tdType.style.color = 'var(--text2)'; tdType.style.fontSize = '12px'; tdType.textContent = a.type;
    const tdAmount = document.createElement('td'); tdAmount.className = `amount ${a.severity}`; tdAmount.textContent = formatMoney(a.amount);
    
    const tdSeverity = document.createElement('td');
    const sevSpan = document.createElement('span'); sevSpan.className = `severity ${a.severity}`; sevSpan.textContent = a.severity.toUpperCase();
    tdSeverity.appendChild(sevSpan);
    
    const tdAction = document.createElement('td');
    const actBtn = document.createElement('button'); actBtn.className = 'action-btn-sm'; actBtn.textContent = 'ACT →'; actBtn.setAttribute('aria-label', `Action for ${a.vendor}`);
    actBtn.addEventListener('click', () => openActionModal(a.type, a.vendor, a.amount, a.detail, a.action));
    tdAction.appendChild(actBtn);
    
    tr.append(tdVendor, tdType, tdAmount, tdSeverity, tdAction);
    tbody.appendChild(tr);
  });
}

function populatePlaybook() {
  const c = document.getElementById('playbookContainer');
  c.innerHTML = '';
  PLAYBOOK.forEach(p => {
    const wrapper = document.createElement('div'); wrapper.className = `playbook-item p-${p.priority}`;
    const top = document.createElement('div'); top.className = 'playbook-top';
    const leftDiv = document.createElement('div');
    const title = document.createElement('div'); title.className = 'playbook-title'; title.textContent = p.title;
    const desc = document.createElement('div'); desc.className = 'playbook-desc'; desc.textContent = p.desc;
    
    const actSub = document.createElement('div'); actSub.style.cssText = 'margin-top:6px; font-family:var(--mono); font-size:10px; color:var(--muted);';
    actSub.textContent = `⚡ ACTION: ${p.action}`;
    leftDiv.append(title, desc, actSub);
    
    const roiDiv = document.createElement('div'); roiDiv.className = 'playbook-roi'; roiDiv.textContent = p.roi;
    top.append(leftDiv, roiDiv);
    
    const actions = document.createElement('div'); actions.className = 'playbook-actions';
    const approveBtn = document.createElement('button'); approveBtn.className = 'btn-approve'; approveBtn.textContent = '✓ Approve & Execute';
    approveBtn.addEventListener('click', () => triggerPlaybookApproval(p.type, p.title, p.roi, p.action));
    
    const escalateBtn = document.createElement('button'); escalateBtn.className = 'btn-escalate'; escalateBtn.textContent = '↑ Escalate';
    escalateBtn.addEventListener('click', () => showToast('Escalated', 'Action escalated to CFO dashboard for review.'));
    
    const effortSpan = document.createElement('span'); effortSpan.style.cssText = 'margin-left:auto; font-size:11px; color:var(--muted); font-family:var(--mono);';
    effortSpan.textContent = `Est. effort: ${p.effort}`;
    
    actions.append(approveBtn, escalateBtn, effortSpan);
    wrapper.append(top, actions);
    c.appendChild(wrapper);
  });
}

function appendLog(type, prefix, content, isUser=false) {
  const out = document.getElementById('agentOutput');
  const div = document.createElement('div'); div.className = `output-line ${type}`;
  const prefixSpan = document.createElement('span'); prefixSpan.className = 'prefix'; prefixSpan.textContent = prefix;
  const contentSpan = document.createElement('span'); contentSpan.className = 'content';
  
  if (isUser) {
    const userLabel = document.createElement('span'); userLabel.style.color = 'var(--text2)'; userLabel.textContent = '[YOU] ';
    contentSpan.append(userLabel, document.createTextNode(content));
  } else {
    const timeSpan = document.createElement('span'); const now = new Date(); timeSpan.style.cssText = 'color:var(--muted); margin-right:8px;';
    timeSpan.textContent = `[${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}]`;
    contentSpan.append(timeSpan, document.createTextNode(content));
  }
  div.append(prefixSpan, contentSpan);
  out.appendChild(div); out.scrollTop = out.scrollHeight;
}

async function typeLog(type, prefix, content) {
  const out = document.getElementById('agentOutput');
  const div = document.createElement('div'); div.className = `output-line ${type}`;
  const cursor = document.createElement('span'); cursor.className = 'cursor';
  const prefixSpan = document.createElement('span'); prefixSpan.className = 'prefix'; prefixSpan.textContent = prefix;
  const contentSpan = document.createElement('span'); contentSpan.className = 'content';
  
  const timeSpan = document.createElement('span'); const now = new Date(); timeSpan.style.cssText = 'color:var(--muted); margin-right:8px;';
  timeSpan.textContent = `[${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}]`;
  contentSpan.appendChild(timeSpan);
  
  const textNode = document.createTextNode(''); contentSpan.appendChild(textNode);
  div.append(prefixSpan, contentSpan, cursor); out.appendChild(div);
  
  for (let i = 0; i <= content.length; i++) {
    textNode.nodeValue = content.slice(0, i);
    out.scrollTop = out.scrollHeight;
    await sleep(18);
  }
  cursor.remove();
}

async function typeAgentLog(logs) {
  for (const log of logs) { await typeLog(log.type, log.prefix, log.content); await sleep(180); }
}

async function sendQuery() {
  const input = document.getElementById('queryInput');
  const query = input.value.trim();
  if (!query) return;

  const sendBtn = document.getElementById('sendBtn');
  sendBtn.disabled = true; input.disabled = true;

  appendLog('', '▸', query, true);
  appendLog('system', 'AGENT', 'Analyzing your query...');

  try {
    await sleep(2000);
    let lines = []; const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('duplicate') || lowerQuery.includes('salesforce')) {
      lines = ["I found 142 duplicate Salesforce license seats currently active.", "They are costing $84,600/yr. The root cause appears to be an auto-provisioning script loop.", "I can execute a playbook to de-provision these seats via the Salesforce API."];
    } else if (lowerQuery.includes('sla')) {
      lines = ["SLA Guardian is monitoring 12 active contracts.", "All SLAs are currently within thresholds. No immediate breach risks detected."];
    } else {
      lines = ["Based on current scan: Top priority is CloudCore idle instance sprawl ($148,200/yr).", "Recommend immediate termination of 15 instances + rightsizing 8."];
    }
    for (const line of lines) await typeLog('', '→', line);
  } catch(e) { appendLog('warn-line', '⚠', 'Analysis failed.'); }

  sendBtn.disabled = false; input.disabled = false; input.value = ''; input.focus();
}

function openActionModal(type, vendor, amount, detail, action) {
  currentModalAction = { type, vendor, amount, detail, action };
  const modalBody = document.getElementById('modalBody'); modalBody.innerHTML = '';
  document.getElementById('modalWorkflow').style.display = 'block';
  
  const createField = (label, value, isMono, valColor) => {
    const field = document.createElement('div'); field.className = 'modal-field';
    const lbl = document.createElement('div'); lbl.className = 'modal-label'; lbl.textContent = label;
    const val = document.createElement('div'); val.className = `modal-value ${isMono ? 'mono' : ''}`; if (valColor) val.style.color = valColor; val.textContent = value;
    field.append(lbl, val); return field;
  };
  
  modalBody.appendChild(createField('VENDOR', vendor));
  modalBody.appendChild(createField('ANOMALY DETAIL', detail));
  modalBody.appendChild(createField('FINANCIAL IMPACT', `${formatMoney(amount)}/yr at risk`, true, 'var(--danger)'));
  const extAct = createField('AUTONOMOUS ACTION', action, true, 'var(--accent)'); extAct.children[1].style.fontSize = '11px';
  modalBody.appendChild(extAct);
  
  const mOverlay = document.getElementById('modalOverlay'); mOverlay.classList.add('active');
  document.getElementById('approveActionBtn').focus(); // Trap focus init
}

function triggerPlaybookApproval(type, title, roi, action) {
  currentModalAction = { type, vendor: title, amount: 0, detail: `ROI: ${roi}`, action };
  const modalBody = document.getElementById('modalBody'); modalBody.innerHTML = '';
  document.getElementById('modalWorkflow').style.display = 'block';
  
  const createField = (label, value, isMono, valColor) => {
    const field = document.createElement('div'); field.className = 'modal-field';
    const lbl = document.createElement('div'); lbl.className = 'modal-label'; lbl.textContent = label;
    const val = document.createElement('div'); val.className = `modal-value ${isMono ? 'mono' : ''}`; if (valColor) val.style.color = valColor; val.textContent = value;
    field.append(lbl, val); return field;
  };
  
  modalBody.appendChild(createField('ACTION', title));
  modalBody.appendChild(createField('ESTIMATED ROI', roi, true, 'var(--success)'));
  const extAct = createField('AUTONOMOUS WORKFLOW TRIGGER', action, true, 'var(--accent)'); extAct.children[1].style.fontSize = '11px';
  modalBody.appendChild(extAct);
  
  document.getElementById('modalOverlay').classList.add('active');
  document.getElementById('approveActionBtn').focus(); // Trap focus init
}

function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); currentModalAction = null; }

let toastQueue = []; let isToasting = false;
function processToastQueue() {
  if (toastQueue.length === 0 || isToasting) return;
  isToasting = true; const {title, body} = toastQueue.shift();
  const t = document.getElementById('toast');
  document.getElementById('toastTitle').textContent = title; document.getElementById('toastBody').textContent = body;
  t.classList.add('show');
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => { isToasting = false; processToastQueue(); }, 400); }, 4500);
}

function showToast(title, body) { toastQueue.push({title, body}); processToastQueue(); }

function approveAction() {
  if (!currentModalAction) return;
  const act = currentModalAction.action || 'Executing...';
  closeModal(); showToast('✓ Action Approved', `Workflow triggered → ${act}`);
  appendLog('success-line', '✓', `Action approved. Workflow executing autonomously.`);
  setTimeout(() => { appendLog('system', 'WH', 'Zapier webhook successful → Downstream updated.'); showToast('✓ Webhook Success', `System sync complete.`); }, 2500);
}

function escalateAction() {
  closeModal(); showToast('↑ Escalated to CFO', 'Approval request sent with impact summary.');
  appendLog('warn-line', '↑', `Escalated to CFO. Email dispatched.`);
}

// [U10] Mock Report Generator
function exportReport() {
  if(!scanDone) { showToast('⚠ Error', 'Run a deep scan first to generate data.'); return; }
  let csv = 'Vendor,Type,Amount_at_Risk,Severity,Suggested_Action\n';
  ANOMALIES.forEach(a => csv += `"${a.vendor}","${a.type}",${a.amount},${a.severity},"${a.action}"\n`);
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a'); a.style.display = 'none'; a.href = url; a.download = 'costs_report.csv';
  document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url);
  
  showToast('✓ Export Successful', 'CSV Report generated and downloaded.');
}

function animateValue(id, from, to, prefix='', suffix='', duration=1000) {
  const el = document.getElementById(id); const start = Date.now();
  const tick = () => {
    const p = Math.min((Date.now()-start)/duration, 1);
    const val = Math.round(from + (to-from) * (1 - Math.pow(1-p, 3)));
    el.textContent = prefix + (prefix==='$' ? formatNum(val) : val) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  tick();
}

function formatMoney(n) { return '$' + n.toLocaleString(); }
function formatNum(n) { if (n >= 1000000) return (n/1000000).toFixed(1).replace(/\.0$/, '') + 'M'; if (n >= 1000) return (n/1000).toFixed(1).replace(/\.0$/, '') + 'K'; return n.toString(); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
