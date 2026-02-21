/* =========================================================
  FILE: script.js
  PURPOSE:
  - Access gate (0818, 3 tries)
  - Tabs/page switching
  - Scanline + glitch reprocessing + scan complete toast
  - Stamp approval animation
  - Redaction reveal
  - Clickable cards jump to sections
  - Evidence reports expand/collapse
  - Copy-to-clipboard for contact cards
  NOTE: TODO are comments only (won’t break anything)
========================================================= */

/* ===== Constants ===== */
const PASSCODE = "0818"; // TODO: Change passcode here if you ever want

/* ===== Helpers ===== */
const toast = document.getElementById("toast");

function showToast(msg, ms = 2200){
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), ms);
}

function setGlitch(on){
  document.body.classList.toggle("glitching", on);
}

/* =========================================================
   ACCESS GATE
========================================================= */
const gate = document.getElementById("gate");
const gateInput = document.getElementById("gateInput");
const gateBtn = document.getElementById("gateBtn");
const triesLeft = document.getElementById("triesLeft");
const gateMsg = document.getElementById("gateMsg");
const gateCard = document.querySelector(".gate-card");
const bootText = document.getElementById("bootText");

let tries = 3;

function bootSequence(){
  if (!bootText) return;
  const lines = [
    "INITIALIZING SECURE SESSION",
    "VERIFYING CLEARANCE…",
    "LOADING DOSSIER INDEX…"
  ];
  let i = 0;
  const tick = () => {
    bootText.innerHTML = `${lines[i]}<span class="cursor">▌</span>`;
    i = (i + 1) % lines.length;
  };
  tick();
  setInterval(tick, 1100);
}
bootSequence();

function flashError(){
  gateCard?.classList.add("error");
  setTimeout(() => gateCard?.classList.remove("error"), 350);
}

function unlock(){
  sessionStorage.setItem("jg_unlocked", "1");
  gate?.classList.add("hidden");
  showToast("ACCESS GRANTED • OPENING DOSSIER…", 2400);
}

function failAttempt(){
  tries -= 1;
  if (triesLeft) triesLeft.textContent = String(tries);

  flashError();
  setGlitch(true);
  setTimeout(() => setGlitch(false), 450);

  if (tries <= 0){
    gateMsg.textContent = "ACCESS LOCKED. REFRESH TO TRY AGAIN.";
    if (gateInput) gateInput.disabled = true;
    if (gateBtn) gateBtn.disabled = true;
    showToast("ACCESS DENIED • LOCKED OUT", 2400);
    return;
  }
  gateMsg.textContent = `INCORRECT CODE. ${tries} TRIES LEFT.`;
  showToast("ACCESS DENIED", 1600);
}

function checkCode(){
  const val = (gateInput?.value || "").trim();
  if (val === PASSCODE){
    gateMsg.textContent = "ACCESS GRANTED.";
    setGlitch(true);
    setTimeout(() => {
      setGlitch(false);
      unlock();
    }, 650);
  } else {
    failAttempt();
  }
}

/* Gate init */
if (sessionStorage.getItem("jg_unlocked") === "1"){
  gate?.classList.add("hidden");
} else {
  gate?.classList.remove("hidden");
  tries = 3;
  if (triesLeft) triesLeft.textContent = "3";
}

/* Gate actions */
gateBtn?.addEventListener("click", checkCode);
gateInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkCode();
});

/* =========================================================
   Footer Year
========================================================= */
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* =========================================================
   Tabs + Pages
========================================================= */
const tabs = Array.from(document.querySelectorAll(".tab"));
const pages = {
  home: document.getElementById("page-home"),
  bio: document.getElementById("page-bio"),
  experience: document.getElementById("page-experience"),
  evidence: document.getElementById("page-evidence"),
  skills: document.getElementById("page-skills"),
  awards: document.getElementById("page-awards"),
  contact: document.getElementById("page-contact"),
};

function showPage(key){
  Object.entries(pages).forEach(([k, p]) => {
    if (!p) return;
    p.classList.remove("show", "enter");
    if (k === key) p.classList.add("show");
  });

  requestAnimationFrame(() => {
    pages[key]?.classList.add("enter");
  });

  tabs.forEach(t => t.classList.toggle("active", t.dataset.page === key));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

tabs.forEach(tab => tab.addEventListener("click", () => showPage(tab.dataset.page)));

/* Buttons that jump */
document.querySelectorAll("[data-jump]").forEach(btn => {
  btn.addEventListener("click", () => showPage(btn.dataset.jump));
});

/* Make clickable cards jump too (tap + keyboard) */
document.querySelectorAll(".clickable[data-jump]").forEach(el => {
  const target = el.dataset.jump;
  el.addEventListener("click", () => showPage(target));
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") showPage(target);
  });
});

/* =========================================================
   Stamp Approval
========================================================= */
const btnStamp = document.getElementById("btnStamp");
const approvedStamp = document.getElementById("approvedStamp");
btnStamp?.addEventListener("click", () => {
  approvedStamp?.classList.add("show");
  setTimeout(() => approvedStamp?.classList.remove("show"), 1300);
});

/* =========================================================
   Redaction Reveal
========================================================= */
const toggleRedactions = document.getElementById("toggleRedactions");
let revealed = false;

toggleRedactions?.addEventListener("click", () => {
  revealed = !revealed;

  const revealLines = [
    "ELITE PROBLEM SOLVER",
    "LOW RISK • HIGH TRUST",
    "HIGH UPSIDE • HIRE READY"
  ];

  document.querySelectorAll(".redact").forEach((r, i) => {
    r.classList.toggle("revealed", revealed);
    r.textContent = revealed ? (revealLines[i] || "AUTHORIZED VIEW") : "███████████████";
  });

  toggleRedactions.textContent = revealed ? "HIDE REDACTIONS" : "REVEAL REDACTIONS";
});

/* =========================================================
   Run Scan: glitch reprocessing + scanline + completion message
========================================================= */
function runScan(){
  setGlitch(true);
  showToast("REPROCESSING DOSSIER…", 1600);

  const scanline = document.getElementById("scanline");
  if (scanline){
    scanline.style.opacity = "0.85";
    scanline.style.transition = "none";
    scanline.style.top = "-180px";

    requestAnimationFrame(() => {
      scanline.style.transition = "top 900ms linear, opacity 220ms ease";
      scanline.style.top = "110vh";
      setTimeout(() => { scanline.style.opacity = "0"; }, 760);
    });
  }

  setTimeout(() => {
    setGlitch(false);
    showToast("SCAN COMPLETE: HIGH VALUE ASSET AVAILABLE FOR HIRING", 3200);
  }, 1900);
}

document.getElementById("btnScan")?.addEventListener("click", runScan);

/* =========================================================
   Evidence: expand/collapse on tap
========================================================= */
document.querySelectorAll(".report.collapsible").forEach((report) => {
  // Start expanded (remove next line if you want collapsed by default)
  report.classList.remove("collapsed");

  const toggle = () => report.classList.toggle("collapsed");

  report.addEventListener("click", toggle);
  report.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") toggle();
  });
});

/* =========================================================
   Copy to clipboard (contact cards)
========================================================= */
async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    showToast("COPIED TO CLIPBOARD", 1400);
  }catch{
    showToast("COPY FAILED (try manual)", 1600);
  }
}

document.querySelectorAll(".copy[data-copy]").forEach((btn) => {
  btn.addEventListener("click", () => copyText(btn.dataset.copy));
});