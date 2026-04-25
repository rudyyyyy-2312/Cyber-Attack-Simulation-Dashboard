/* ============================================================
   CYBER DEFENSE COMMAND CENTER — Main JS
   ============================================================ */

'use strict';

// ── Loading Screen ───────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 2200);
});

// ── Live Clock ───────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('live-clock');
  const elMobile = document.getElementById('live-clock-mobile');
  const timeStr = new Date().toUTCString().replace('GMT','UTC');
  if (el) el.textContent = timeStr;
  if (elMobile) elMobile.textContent = timeStr;
}
setInterval(updateClock, 1000);
updateClock();

// ── Mobile Menu Toggle ───────────────────────────────────────
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuIconPath = document.getElementById('menu-icon-path');

if (mobileMenuBtn && mobileMenu && menuIconPath) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('flex');
    if (mobileMenu.classList.contains('hidden')) {
      menuIconPath.setAttribute('d', 'M4 6h16M4 12h16M4 18h16'); // Hamburger
    } else {
      menuIconPath.setAttribute('d', 'M6 18L18 6M6 6l12 12'); // Close X
    }
  });

  // Close menu when a link is clicked
  const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      mobileMenu.classList.remove('flex');
      menuIconPath.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    });
  });
}

// ── Matrix Rain ──────────────────────────────────────────────
(function initMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, cols, drops;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cols = Math.floor(W / 16);
    drops = Array(cols).fill(1);
  }
  resize();
  window.addEventListener('resize', resize);

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?';

  setInterval(() => {
    ctx.fillStyle = 'rgba(2,8,16,0.05)';
    ctx.fillRect(0, 0, W, H);
    ctx.font = '13px Share Tech Mono, monospace';
    for (let i = 0; i < drops.length; i++) {
      const c = chars[Math.floor(Math.random() * chars.length)];
      const x = i * 16;
      const y = drops[i] * 16;
      ctx.fillStyle = Math.random() > 0.95 ? '#ffffff' : '#00f5ff';
      ctx.fillText(c, x, y);
      if (y > H && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }, 45);
})();

// ── Floating Particles ────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['rgba(0,245,255,', 'rgba(191,0,255,', 'rgba(0,102,255,'];
  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2 + 0.5,
    dx: (Math.random() - 0.5) * 0.4,
    dy: (Math.random() - 0.5) * 0.4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: Math.random() * 0.5 + 0.1
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── Live Attack Feed ──────────────────────────────────────────
const ATTACK_DATA = {
  ips: ['185.220.101.47','194.165.16.11','45.33.32.156','92.118.160.12','103.21.244.0',
        '198.54.117.197','91.108.4.0','62.102.148.69','176.10.104.240','212.129.46.30',
        '77.247.181.165','199.87.154.255','185.100.87.41','95.211.109.50','163.172.67.180'],
  types: ['SQL Injection','DDoS Attack','Brute Force','Port Scan','Phishing','Ransomware','XSS Attack',
          'MITM Attack','Zero-Day Exploit','Botnet C&C','DNS Spoofing','ARP Poisoning'],
  severity: ['CRITICAL','HIGH','MEDIUM','LOW'],
  sevClass: { CRITICAL:'sev-critical', HIGH:'sev-high', MEDIUM:'sev-medium', LOW:'sev-low' },
  countries: ['🇷🇺 Russia','🇨🇳 China','🇮🇷 Iran','🇰🇵 N.Korea','🇧🇷 Brazil','🇺🇦 Ukraine',
              '🇩🇪 Germany','🇫🇷 France','🇮🇳 India','🇺🇸 USA','🇹🇷 Turkey','🇮🇩 Indonesia']
};

let feedCount = 0;

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateAttack() {
  const sev = randomFrom(ATTACK_DATA.severity);
  const ts  = new Date().toTimeString().slice(0,8);
  return {
    ip: randomFrom(ATTACK_DATA.ips),
    type: randomFrom(ATTACK_DATA.types),
    severity: sev,
    sevClass: ATTACK_DATA.sevClass[sev],
    country: randomFrom(ATTACK_DATA.countries),
    time: ts
  };
}

function addFeedRow(atk) {
  const tbody = document.getElementById('feed-tbody');
  if (!tbody) return;
  const warn = atk.severity === 'CRITICAL' ? '<span class="warning-blink">⚠</span> ' : '';
  const tr = document.createElement('tr');
  tr.className = 'feed-row';
  tr.innerHTML = `
    <td class="font-mono text-cyan-300">${warn}${atk.ip}</td>
    <td>${atk.type}</td>
    <td><span class="severity-badge ${atk.sevClass}">${atk.severity}</span></td>
    <td class="text-slate-400">${atk.country}</td>
    <td class="font-mono text-slate-500">${atk.time}</td>`;
  tbody.insertBefore(tr, tbody.firstChild);
  if (tbody.children.length > 30) tbody.removeChild(tbody.lastChild);
  feedCount++;
  const counter = document.getElementById('attack-counter');
  if (counter) counter.textContent = feedCount;
}

// Seed initial rows
for (let i = 0; i < 12; i++) addFeedRow(generateAttack());
setInterval(() => addFeedRow(generateAttack()), 1800);

// ── Animated Hero Counters ────────────────────────────────────
function animateCounter(id, target, suffix = '') {
  const el = document.getElementById(id);
  if (!el) return;
  let cur = 0;
  const step = Math.ceil(target / 60);
  const iv = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur.toLocaleString() + suffix;
    if (cur >= target) clearInterval(iv);
  }, 25);
}
setTimeout(() => {
  animateCounter('stat-attacks', 14872);
  animateCounter('stat-blocked', 98, '%');
  animateCounter('stat-nodes', 4231);
}, 2400);

// ── System Monitoring Circular Progress ───────────────────────
const metrics = [
  { id: 'prog-cpu',   val: 73, color: '#00f5ff', label: 'CPU' },
  { id: 'prog-mem',   val: 61, color: '#bf00ff', label: 'RAM' },
  { id: 'prog-fw',    val: 99, color: '#00ff88', label: 'FW'  },
  { id: 'prog-net',   val: 84, color: '#0066ff', label: 'NET' },
  { id: 'prog-srv',   val: 91, color: '#00f5ff', label: 'SRV' },
  { id: 'prog-int',   val: 42, color: '#ff003c', label: 'INT' }
];

function buildCircle(metric) {
  const wrap = document.getElementById(metric.id);
  if (!wrap) return;
  const r = 38, circ = 2 * Math.PI * r;
  const offset = circ - (metric.val / 100) * circ;
  wrap.innerHTML = `
    <svg width="90" height="90" viewBox="0 0 90 90">
      <circle class="track" cx="45" cy="45" r="${r}"/>
      <circle class="prog" cx="45" cy="45" r="${r}"
        stroke="${metric.color}"
        stroke-dasharray="${circ}"
        stroke-dashoffset="${circ}"
        style="transition:stroke-dashoffset 1.8s ease"
        data-offset="${offset}"/>
    </svg>
    <span class="circ-val" style="color:${metric.color};text-shadow:0 0 10px ${metric.color}">${metric.val}%</span>`;
  setTimeout(() => {
    const prog = wrap.querySelector('.prog');
    if (prog) prog.style.strokeDashoffset = offset;
  }, 2600);
}
metrics.forEach(buildCircle);

// Randomly fluctuate metrics every 3 s
setInterval(() => {
  metrics.forEach(m => {
    m.val = Math.min(99, Math.max(5, m.val + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 4)));
    buildCircle(m);
  });
}, 3000);

// ── Network Traffic Graph ─────────────────────────────────────
(function initTrafficGraph() {
  const canvas = document.getElementById('traffic-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const points = Array.from({ length: 60 }, () => Math.random() * 80 + 10);

  function draw() {
    const W = canvas.width  = canvas.offsetWidth;
    const H = canvas.height = 120;
    ctx.clearRect(0, 0, W, H);
    const step = W / (points.length - 1);

    // Fill gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(0,245,255,0.3)');
    grad.addColorStop(1, 'rgba(0,245,255,0)');
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = i * step, y = H - (p / 100) * H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00f5ff'; ctx.shadowBlur = 8;
    points.forEach((p, i) => {
      const x = i * step, y = H - (p / 100) * H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  draw();
  setInterval(() => {
    points.shift();
    points.push(Math.random() * 80 + 10);
    draw();
  }, 600);
})();

// ── Radar Scanner ─────────────────────────────────────────────
(function initRadar() {
  const canvas = document.getElementById('radar-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const S = 180, cx = S / 2, cy = S / 2, R = S / 2 - 10;
  canvas.width = S; canvas.height = S;
  let angle = 0;
  const blips = Array.from({ length: 6 }, () => ({
    a: Math.random() * Math.PI * 2, r: Math.random() * (R - 20) + 10,
    alpha: 0
  }));

  function draw() {
    ctx.clearRect(0, 0, S, S);
    // Rings
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath(); ctx.arc(cx, cy, (R / 3) * i, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,245,255,0.15)'; ctx.lineWidth = 1; ctx.stroke();
    }
    // Cross hairs
    ctx.strokeStyle = 'rgba(0,245,255,0.1)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke();

    // Sweep gradient
    const sweep = ctx.createConicalGradient ? null : null;
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(angle);
    const g = ctx.createLinearGradient(0, 0, R, 0);
    g.addColorStop(0, 'rgba(0,245,255,0.5)');
    g.addColorStop(1, 'rgba(0,245,255,0)');
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.arc(0, 0, R, -0.35, 0); ctx.closePath();
    ctx.fillStyle = g; ctx.fill();
    ctx.restore();

    // Blips
    blips.forEach(b => {
      const diff = ((angle - b.a) + Math.PI * 2) % (Math.PI * 2);
      if (diff < 0.2) b.alpha = 1;
      b.alpha = Math.max(0, b.alpha - 0.008);
      if (b.alpha > 0) {
        const bx = cx + Math.cos(b.a) * b.r;
        const by = cy + Math.sin(b.a) * b.r;
        ctx.beginPath(); ctx.arc(bx, by, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,0,60,${b.alpha})`;
        ctx.shadowColor = '#ff003c'; ctx.shadowBlur = 10;
        ctx.fill(); ctx.shadowBlur = 0;
      }
    });

    angle += 0.025; if (angle > Math.PI * 2) angle -= Math.PI * 2;
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── World Map (SVG dot-grid style) ────────────────────────────
(function initMap() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Attack lines data [from_x%, from_y%, to_x%, to_y%, color]
  const lines = [
    [0.77, 0.28, 0.22, 0.32, '#ff003c'],
    [0.82, 0.35, 0.22, 0.32, '#ff003c'],
    [0.58, 0.22, 0.22, 0.32, '#ffaa33'],
    [0.72, 0.45, 0.22, 0.32, '#ff003c'],
    [0.45, 0.55, 0.22, 0.32, '#bf00ff'],
    [0.60, 0.30, 0.50, 0.30, '#00f5ff'],
    [0.15, 0.40, 0.22, 0.32, '#ffaa33'],
  ];

  // Hot-spot nodes [x%, y%, color]
  const nodes = [
    [0.22, 0.32, '#00f5ff'], // USA
    [0.55, 0.25, '#ff003c'], // Russia
    [0.80, 0.32, '#ff003c'], // China
    [0.62, 0.35, '#ffaa33'], // Middle East
    [0.50, 0.55, '#bf00ff'], // Africa
    [0.72, 0.47, '#ffaa33'], // India
    [0.88, 0.42, '#00f5ff'], // SE Asia
    [0.40, 0.22, '#00f5ff'], // Europe
  ];

  let animFrame = 0;

  function drawMap() {
    const W = canvas.width  = canvas.parentElement.offsetWidth || 600;
    const H = canvas.height = Math.min(W * 0.5, 340);

    ctx.fillStyle = 'rgba(2,8,16,0.95)';
    ctx.fillRect(0, 0, W, H);

    // Grid dots (simplified map)
    for (let x = 0; x < W; x += 8) {
      for (let y = 0; y < H; y += 8) {
        // crude world-shape mask using ellipse logic
        const nx = x / W - 0.5, ny = y / H - 0.5;
        if (Math.abs(ny) > 0.47) continue;
        const inLand = (Math.abs(nx) < 0.5) &&
          !(Math.abs(ny) > 0.35 && Math.abs(nx) > 0.35);
        if (!inLand) continue;
        ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,245,255,0.08)'; ctx.fill();
      }
    }

    // Animated attack lines
    const progress = (Math.sin(animFrame * 0.02) + 1) / 2;
    lines.forEach(([x1p, y1p, x2p, y2p, color], idx) => {
      const x1 = x1p * W, y1 = y1p * H;
      const x2 = x2p * W, y2 = y2p * H;
      const t  = (progress + idx * 0.15) % 1;
      const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 40;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(mx, my, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      ctx.shadowColor = color; ctx.shadowBlur = 8;
      ctx.globalAlpha = 0.7; ctx.stroke();
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;

      // Moving dot
      const dx = x1 + (x2 - x1) * t, dy = y1 + (y2 - y1) * t;
      ctx.beginPath(); ctx.arc(dx, dy, 3, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 12;
      ctx.fill(); ctx.shadowBlur = 0;
    });

    // Pulse nodes
    nodes.forEach(([xp, yp, color]) => {
      const x = xp * W, y = yp * H;
      const pulse = (Math.sin(animFrame * 0.05) + 1) / 2;
      ctx.beginPath(); ctx.arc(x, y, 4 + pulse * 6, 0, Math.PI * 2);
      ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.globalAlpha = 0.4 * (1 - pulse);
      ctx.stroke(); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 10;
      ctx.fill(); ctx.shadowBlur = 0;
    });

    animFrame++;
    requestAnimationFrame(drawMap);
  }
  drawMap();
})();

// ── AI Threat Bars ────────────────────────────────────────────
const AI_THREATS = [
  { id: 'bar-malware', label: 'Malware Probability', val: 78, color: 'linear-gradient(90deg,#ff003c,#ff5577)' },
  { id: 'bar-ddos',    label: 'DDoS Detection',      val: 91, color: 'linear-gradient(90deg,#ff6600,#ffaa33)' },
  { id: 'bar-vuln',    label: 'Vulnerability Scan',  val: 54, color: 'linear-gradient(90deg,#bf00ff,#8800cc)' },
  { id: 'bar-packet',  label: 'Suspicious Packets',  val: 67, color: 'linear-gradient(90deg,#00f5ff,#0066ff)' },
  { id: 'bar-apt',     label: 'APT Intrusion Risk',  val: 45, color: 'linear-gradient(90deg,#ff003c,#bf00ff)' },
];

AI_THREATS.forEach(t => {
  const wrap = document.getElementById(t.id);
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="threat-bar-wrap">
      <div class="threat-bar-label">
        <span>${t.label}</span>
        <span style="color:#00f5ff">${t.val}%</span>
      </div>
      <div class="threat-bar-track">
        <div class="threat-bar-fill" style="width:0%;background:${t.color}" data-target="${t.val}"></div>
      </div>
    </div>`;
  setTimeout(() => {
    const fill = wrap.querySelector('.threat-bar-fill');
    if (fill) fill.style.width = t.val + '%';
  }, 2800);
});

// Fluctuate AI bars every 4 s
setInterval(() => {
  AI_THREATS.forEach(t => {
    t.val = Math.min(99, Math.max(5, t.val + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5)));
    const fill = document.querySelector(`#${t.id} .threat-bar-fill`);
    const pct  = document.querySelector(`#${t.id} .threat-bar-label span:last-child`);
    if (fill) fill.style.width = t.val + '%';
    if (pct)  pct.textContent = t.val + '%';
  });
}, 4000);

// ── Cyber Terminal ────────────────────────────────────────────
const COMMANDS = {
  'scan network': [
    '> Initializing network scan protocol...',
    '> Scanning subnet 192.168.1.0/24',
    '> Discovered 47 active hosts',
    '> Open ports detected: 22, 80, 443, 8080, 3306',
    '> 3 suspicious devices flagged for analysis',
    '> [WARN] Unrecognized MAC: DE:AD:BE:EF:00:01',
    '> Scan complete. Report saved to /logs/scan_001.log',
  ],
  'analyze threat': [
    '> Loading threat intelligence database...',
    '> Cross-referencing 14,872 known threat signatures',
    '> [CRITICAL] Active C2 connection detected on port 4444',
    '> Threat actor: APT-28 (Fancy Bear) — confidence 87%',
    '> Attack vector: Spear-phishing + lateral movement',
    '> Recommended action: Isolate affected nodes immediately',
    '> Pushing IOCs to firewall blocklist...',
    '> Analysis complete.',
  ],
  'detect malware': [
    '> Starting deep packet inspection...',
    '> Scanning 4,096 process memory regions...',
    '> [ALERT] Suspicious process: svchost.exe (PID 9182)',
    '> Entropy score: 7.94 — likely packed/encrypted payload',
    '> Signature match: Emotet variant B (98.2% confidence)',
    '> Quarantining process and dumping memory...',
    '> Hash: 3c9d8f2a1e7b4561d0f2c9a84e6b3712',
    '> Malware neutralized. System integrity: OK',
  ],
  'status': [
    '> CYBER DEFENSE COMMAND CENTER v4.2.1',
    '> Uptime: 14d 7h 32m',
    '> Firewall: ACTIVE | IDS: ACTIVE | VPN: ACTIVE',
    '> Threat level: HIGH',
    '> Active monitors: 4,231 nodes',
    '> Last incident: 00:03:17 ago',
  ],
  'help': [
    '> Available commands:',
    '>   scan network    — Scan local network for threats',
    '>   analyze threat  — Run AI threat analysis',
    '>   detect malware  — Deep malware detection scan',
    '>   status          — System status overview',
    '>   clear           — Clear terminal',
    '>   help            — Show this message',
  ],
  'clear': null,
};

const termBody  = document.getElementById('terminal-body');
const termInput = document.getElementById('terminal-input');

function addTermLine(text, cls = '') {
  if (!termBody) return;
  const div = document.createElement('div');
  div.className = `terminal-line ${cls}`;
  div.textContent = text;
  termBody.appendChild(div);
  termBody.scrollTop = termBody.scrollHeight;
}

function typeLines(lines, delay = 80) {
  lines.forEach((line, i) => {
    setTimeout(() => {
      const isWarn  = line.includes('[WARN]') || line.includes('[ALERT]');
      const isError = line.includes('[CRITICAL]') || line.includes('[ERROR]');
      addTermLine(line, isError ? 'err' : isWarn ? 'warn' : '');
    }, i * delay);
  });
}

// Boot messages
setTimeout(() => {
  typeLines([
    'CDCC Terminal v4.2.1 — Secure Shell',
    'Authentication successful. Welcome, Agent.',
    'Type "help" to see available commands.',
    '─'.repeat(52),
  ], 60);
}, 2500);

if (termInput) {
  termInput.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const cmd = termInput.value.trim().toLowerCase();
    termInput.value = '';
    if (!cmd) return;

    addTermLine(`root@cdcc:~$ ${cmd}`, 'cmd');

    if (cmd === 'clear') {
      termBody.innerHTML = '';
      return;
    }

    if (COMMANDS[cmd]) {
      typeLines(COMMANDS[cmd]);
    } else {
      typeLines([`bash: ${cmd}: command not found. Type "help" for options.`], 60);
    }
  });
}

// Intrusion counter ticker
let intrusionCount = 2847;
setInterval(() => {
  intrusionCount += Math.floor(Math.random() * 3);
  const el = document.getElementById('intrusion-count');
  if (el) el.textContent = intrusionCount.toLocaleString();
}, 2500);

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});
