/* =========================================================
  FILE: script.js

  WHY THIS FILE EXISTS:
  - Controls the Restricted Access gate (password + tries)
  - Plays the red-folder opening animation on unlock
  - Handles page switching + page-flip animation
  - Makes everything clickable open a modal (your dossier reports)
  - Runs scan + stamping animations
  - Copies email on contact

  EDIT SAFELY:
  - PASSCODE
  - TOP_SECRET_SCORE
  - modalContent text (your real portfolio content)

  DONT TOUCH (unless you know why):
  - sessionStorage key: "jg_unlocked"
  - showPage timing + classes (affects transitions)
========================================================= */

/* =========================================================
  CONFIG (EDIT THESE)
========================================================= */

// EDIT: The clearance code (this is what your resume references)
const PASSCODE = "0818";

// EDIT: Top secret rating out of 100 (for the Top Secret modal)
const TOP_SECRET_SCORE = 92;

/* =========================================================
  ELEMENTS (DON'T EDIT IDs unless you update HTML too)
========================================================= */

const gate = document.getElementById("gate");
const gateCard = document.getElementById("gateCard");
const gateInput = document.getElementById("gateInput");
const gateBtn = document.getElementById("gateBtn");
const guestBtn = document.getElementById("guestBtn");
const triesLeft = document.getElementById("triesLeft");
const gateMsg = document.getElementById("gateMsg");
const bootText = document.getElementById("bootText");

const unlockStage = document.getElementById("unlockStage");
const redFolder = document.getElementById("redFolder");

const app = document.getElementById("app");
const statusDot = document.getElementById("statusDot");
const year = document.getElementById("year");

const pageFrame = document.getElementById("pageFrame");
const tabs = Array.from(document.querySelectorAll(".tab"));

const pages = {
  home: document.getElementById("page-home"),
  bio: document.getElementById("page-bio"),
  experience: document.getElementById("page-experience"),
  evidence: document.getElementById("page-evidence"),
  skills: document.getElementById("page-skills"),
  awards: document.getElementById("page-awards"),
  references: document.getElementById("page-references"),
  contact: document.getElementById("page-contact"),
};

// Top actions
const btnScan = document.getElementById("btnScan");
const btnStampBtn = document.getElementById("btnStampBtn");

// Stamp tool visuals
const stampTool = document.getElementById("stampTool");
const approvedStamp = document.getElementById("approvedStamp");

// Stamps
const topSecretStamp = document.getElementById("topSecretStamp");
const confStamp = document.getElementById("confStamp");

/* =========================================================
  TOAST (small messages)
========================================================= */

const toast = document.getElementById("toast");

function showToast(msg, ms = 2400){
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), ms);
}

/* =========================================================
  MODAL (everything clickable)
========================================================= */

const modal = document.getElementById("modal");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

function openModal(title, html){
  modalTitle.textContent = title;
  modalBody.innerHTML = html;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(){
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

modalBackdrop?.addEventListener("click", closeModal);
modalClose?.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* =========================================================
  BOOT TEXT LOOP (gate vibe)
========================================================= */

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

/* =========================================================
  STATUS DOT (turns red when user is in)
========================================================= */

function setLive(on){
  statusDot?.classList.toggle("live", on);
}

/* =========================================================
  GATE LOGIC (0818 + 3 tries)
========================================================= */

let tries = 3;

// WHY: visually shake gate card on wrong code
function flashError(){
  gateCard?.classList.add("error");
  setTimeout(() => gateCard?.classList.remove("error"), 350);
}

// WHY: plays the "red folder open" animation and then shows HOME only
function playUnlockAnimation(){
  unlockStage?.classList.remove("hidden");
  redFolder?.classList.add("opening");

  setTimeout(() => {
    unlockStage?.classList.add("hidden");
    redFolder?.classList.remove("opening");

    // save unlocked state for this browser tab session
    sessionStorage.setItem("jg_unlocked", "1");

    // hide gate, show app
    gate?.classList.add("hidden");
    app?.classList.remove("hidden");

    // show HOME first only (as requested)
    showPage("home", true);

    setLive(true);
    showToast("ACCESS APPROVED • DOSSIER OPENED", 2600);
  }, 1150);
}

function checkCode(){
  const val = (gateInput?.value || "").trim();

  if (val === PASSCODE){
    gateMsg.textContent = "ACCESS APPROVED.";
    playUnlockAnimation();
    return;
  }

  // wrong code
  tries -= 1;
  if (triesLeft) triesLeft.textContent = String(tries);
  flashError();

  if (tries <= 0){
    gateMsg.textContent = "ACCESS LOCKED. REFRESH TO TRY AGAIN.";
    gateInput.disabled = true;
    gateBtn.disabled = true;
    showToast("ACCESS DENIED • LOCKED OUT", 2400);
    return;
  }

  gateMsg.textContent = `INCORRECT CODE. ${tries} TRIES LEFT.`;
  showToast("ACCESS DENIED", 1600);
}

// Q1 = A: temp access does NOT unlock site
function tempAccessRequest(){
  openModal("TEMP ACCESS REQUEST", `
    <p><strong>Restricted dossier.</strong> Clearance is required.</p>
    <p>Refer to the <strong>resume</strong> for the clearance code.</p>
    <p class="tiny" style="opacity:.75;">If you are reviewing for hiring, use Contact to request access.</p>
  `);
}

/* =========================================================
  GATE INIT (hide app until unlocked)
========================================================= */

if (sessionStorage.getItem("jg_unlocked") === "1"){
  // already unlocked this session
  gate?.classList.add("hidden");
  app?.classList.remove("hidden");
  setLive(true);
} else {
  // locked
  gate?.classList.remove("hidden");
  app?.classList.add("hidden");
  tries = 3;
  if (triesLeft) triesLeft.textContent = "3";
}

/* Gate events */
gateBtn?.addEventListener("click", checkCode);
gateInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkCode();
});
guestBtn?.addEventListener("click", tempAccessRequest);

/* =========================================================
  YEAR FOOTER
========================================================= */

if (year) year.textContent = new Date().getFullYear();

/* =========================================================
  PAGE SWITCHING + PAGE FLIP ANIMATION
  NOTE: Switching tabs flips pages like a folder
========================================================= */

function showPage(key, skipFlip = false){
  // tabs active state
  tabs.forEach(t => t.classList.toggle("active", t.dataset.page === key));

  // show/hide pages
  Object.entries(pages).forEach(([k, p]) => {
    if (!p) return;
    p.classList.remove("show", "enter");
    if (k === key) p.classList.add("show");
  });

  // allow display:block to apply before adding animation class
  requestAnimationFrame(() => {
    pages[key]?.classList.add("enter");
  });

  // add page flip animation
  if (!skipFlip && pageFrame){
    pageFrame.classList.add("pageFlip");
    setTimeout(() => pageFrame.classList.remove("pageFlip"), 450);
  }

  // keep it clean: always scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* Tabs */
tabs.forEach(tab => tab.addEventListener("click", () => showPage(tab.dataset.page)));

/* =========================================================
  MODAL CONTENT (EDIT THIS SECTION FOR YOUR REAL PORTFOLIO)
========================================================= */

const modalContent = {
  mission: {
    title: "MISSION OBJECTIVE • REPORT",
    html: `
      <p><strong>Objective:</strong> Position Jasmine Grant in a role where she can resolve issues fast, document cleanly, and operate under SLA pressure.</p>
      <ul>
        <li>High-volume ticket triage + fast resolution</li>
        <li>Clear documentation and calm communication</li>
        <li>Security-minded support habits (least privilege, visibility)</li>
      </ul>
      <p class="tiny" style="opacity:.75;"><strong>TODO:</strong> Add real metrics (tickets/day, CSAT, SLA %).</p>
    `
  },
  brief: {
    title: "REDACTED BRIEF • AUTHORIZED VIEW",
    html: `
      <p><strong>Assessment:</strong> Elite problem solver with strong reliability and growth upside.</p>
      <p><strong>Risk:</strong> Low. Coachable. Consistent.</p>
      <p><strong>Edge:</strong> Communication + execution under pressure.</p>
      <p class="tiny" style="opacity:.75;"><strong>TODO:</strong> Add 2–3 “proof bullets” from your resume.</p>
    `
  },
  fileIndex: {
    title: "FILE INDEX • NAVIGATION",
    html: `
      <p>This dossier is organized by folder tabs:</p>
      <ol>
        <li>Case Summary</li>
        <li>Experience</li>
        <li>Evidence</li>
        <li>Skills Matrix</li>
        <li>Awards</li>
        <li>References</li>
        <li>Contact</li>
      </ol>
      <p class="tiny" style="opacity:.75;">Each tab flip is intentional: it should feel like pages in a file.</p>
    `
  },
  bioReport: {
    title: "CASE SUMMARY • FULL REPORT",
    html: `
      <p><strong>Summary:</strong> Jasmine Grant is a Tier 1 Help Desk / Service Desk professional with strong ticket triage, documentation habits, and customer communication.</p>
      <p><strong>Positioning:</strong> High volume + SLA driven support asset.</p>
      <p><strong>Next Path:</strong> Cloud security foundations and security-adjacent support roles.</p>
      <p class="tiny" style="opacity:.75;"><strong>TODO:</strong> Paste your real “Professional Summary” here.</p>
    `
  },
  experienceReport: {
    title: "EXPERIENCE • TIMELINE FILE",
    html: `
      <p><strong>TODO:</strong> Paste your roles as “case entries.”</p>
      <ul>
        <li>Role • Company • Dates • Tools</li>
        <li>Impact metrics (tickets, SLA, CSAT)</li>
        <li>Notable wins (process improvements)</li>
      </ul>
    `
  },
  evidenceReport: {
    title: "EVIDENCE • REPORTS",
    html: `
      <p><strong>Evidence is framed as findings (professional).</strong></p>
      <ul>
        <li>Ticket ops + SLA performance</li>
        <li>Documentation artifacts</li>
        <li>Process improvements</li>
      </ul>
      <p class="tiny" style="opacity:.75;"><strong>TODO:</strong> Add LinkedIn/GitHub here later as “Artifacts.”</p>
    `
  },
  skillsReport: {
    title: "SKILLS MATRIX • ASSESSMENT",
    html: `
      <p><strong>Core:</strong> Troubleshooting, ticketing, documentation, customer support.</p>
      <p><strong>Tools:</strong> TODO: Add your ticketing/tools stack.</p>
      <p><strong>Security Path:</strong> cloud basics, access control mindset, security hygiene.</p>
      <p class="tiny" style="opacity:.75;"><strong>TODO:</strong> We can turn this into a real matrix later (levels + proof).</p>
    `
  },
  awardsReport: {
    title: "AWARDS + CREDENTIALS • FILE",
    html: `
      <p><strong>TODO:</strong> Add certifications, cohorts, awards.</p>
      <ul>
        <li>TODO: Certification</li>
        <li>TODO: Training</li>
        <li>TODO: Recognition</li>
      </ul>
    `
  },
  ref1: {
    title: "REFERENCE 01 • CONTACT ON REQUEST",
    html: `
      <p><strong>TODO: Name</strong></p>
      <p>TODO: Title • Company</p>
      <p class="tiny" style="opacity:.75;">Available upon request via Contact.</p>
    `
  },
  ref2: {
    title: "REFERENCE 02 • CONTACT ON REQUEST",
    html: `
      <p><strong>TODO: Name</strong></p>
      <p>TODO: Title • Company</p>
      <p class="tiny" style="opacity:.75;">Available upon request via Contact.</p>
    `
  },
};

/* Wire clickable elements to modals */
function wireClickable(el){
  const key = el.dataset.modal;
  if (!key || !modalContent[key]) return;

  const { title, html } = modalContent[key];

  // click
  el.addEventListener("click", () => openModal(title, html));

  // keyboard accessibility
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") openModal(title, html);
  });
}

document.querySelectorAll("[data-modal].clickable").forEach(wireClickable);

/* =========================================================
  TOP SECRET + CONFIDENTIAL STAMPS (click actions)
========================================================= */

topSecretStamp?.addEventListener("click", () => {
  openModal("TOP SECRET • CLEARANCE SCALE", `
    <p><strong>Top Secret Scale:</strong> <span style="color:#d61f2c; font-weight:800;">${TOP_SECRET_SCORE}/100</span></p>
    <p>This file contains restricted evaluation material.</p>
    <p class="tiny" style="opacity:.75;">Clearance code is provided inside the resume.</p>
  `);
});

confStamp?.addEventListener("click", () => {
  openModal("CONFIDENTIAL • SUPERVISOR REQUIRED", `
    <p><strong>Report to supervisor</strong> for more information.</p>
    <p class="tiny" style="opacity:.75;">References are available in the References file.</p>
    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
      <button class="btn mono primary" id="goRefsBtn" type="button">GO TO REFERENCES</button>
      <button class="btn mono" id="closeModalBtn" type="button">CLOSE</button>
    </div>
  `);

  // wire buttons after modal renders
  setTimeout(() => {
    document.getElementById("goRefsBtn")?.addEventListener("click", () => {
      closeModal();
      showPage("references");
    });
    document.getElementById("closeModalBtn")?.addEventListener("click", closeModal);
  }, 0);
});

/* =========================================================
  STAMP APPROVAL BUTTON (tool hit + green stamp)
========================================================= */

btnStampBtn?.addEventListener("click", () => {
  stampTool?.classList.add("hit");
  setTimeout(() => approvedStamp?.classList.add("show"), 320);

  setTimeout(() => stampTool?.classList.remove("hit"), 900);
  setTimeout(() => approvedStamp?.classList.remove("show"), 1800);
});

/* =========================================================
  RUN SCAN (glitchy processing + final message)
========================================================= */

btnScan?.addEventListener("click", () => {
  showToast("REPROCESSING DOSSIER…", 1400);
  setTimeout(() => showToast("SCAN IN PROGRESS…", 1400), 900);
  setTimeout(() => showToast("SCAN COMPLETE: HIGH VALUE ASSET AVAILABLE FOR HIRING", 3200), 1900);
});

/* =========================================================
  COPY EMAIL (Contact)
========================================================= */

async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    showToast("COPIED TO CLIPBOARD", 1400);
  }catch{
    showToast("COPY FAILED (try manual)", 1600);
  }
}

document.querySelectorAll("[data-copy]").forEach(btn => {
  btn.addEventListener("click", () => copyText(btn.dataset.copy));
});