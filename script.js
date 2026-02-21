/*
  ============================================================
  FILE: script.js

  THIS FILE CONTROLS:
    1) Lock screen (access flow, tries, seal break animation)
    2) Folder cover overlay (open dossier button)
    3) Page-flip engine (real page turning effect)
    4) Tabs behavior:
       - right tabs = sections ahead
       - left tabs = sections behind
       - clicking any tab still FLIPS pages to reach it
    5) Table of contents jump:
       - still flips pages sequentially (no teleport switch)
    6) Scan overlay + stamp tool overlays
    7) Modal for “clickable docs” details

  IMPORTANT NOTE ABOUT “PASSWORD”:
    - This is NOT true security. Front-end code can be inspected.
    - It’s for cinematic UX. Real security requires a backend.
  ============================================================
*/

/* ============================================================
  CONFIG YOU EDIT SAFELY
============================================================ */

// TODO: change passcode if you want (cinematic only)
const PASSCODE = "0818";

// TODO: codename text (glitch tag)
const CODENAME = "OBSIDIAN";

// TODO: top headline file id (cosmetic)
const FILE_ID = "JG-0818";

// TODO: section definitions (YOUR CONTENT LIVES HERE)
const SECTIONS = [
  {
    key: "home",
    title: "Home • Access Granted",
    tabColor: "tab-purple",
    badge: "ACTIVE",
    bodyHTML: `
      <p><strong>Welcome.</strong> This dossier was built to prove one thing: Jasmine Grant is hire-ready.</p>

      <div class="doc" data-doc="mission">
        <strong>MISSION OBJECTIVE</strong><br/>
        What I do + why I’m elite.
      </div>

      <div class="doc" data-doc="how">
        <strong>HOW TO NAVIGATE</strong><br/>
        Tabs + table of contents (still flips pages).
      </div>

      <div class="doc" data-doc="next">
        <strong>RECRUITER FLOW</strong><br/>
        Quick route through the file.
      </div>

      <!-- TODO: Add one super short line that feels like “agency file” -->
      <p style="opacity:.75;">Status: Available • Priority: High • Response: Immediate</p>
    `
  },
  {
    key: "case",
    title: "Case Summary",
    tabColor: "tab-red",
    badge: "CONFIDENTIAL",
    bodyHTML: `
      <p>
        <!-- TODO: Put your real 6–10 sentence professional summary here -->
        Jasmine Grant is a customer-focused technical support professional known for calm communication,
        clear documentation, and fast triage under pressure.
      </p>

      <div class="doc" data-doc="caseFull">
        <strong>OPEN FULL REPORT</strong><br/>
        Longer bio + positioning.
      </div>
    `
  },
  {
    key: "experience",
    title: "Experience Timeline",
    tabColor: "tab-blue",
    badge: "LOG",
    bodyHTML: `
      <p><strong>Work + education timeline</strong>, written like an evidence log.</p>

      <div class="doc" data-doc="work">
        <strong>WORK LOG</strong><br/>
        Roles, dates, measurable wins.
      </div>

      <div class="doc" data-doc="school">
        <strong>EDUCATION LOG</strong><br/>
        Programs, coursework, milestones.
      </div>
    `
  },
  {
    key: "evidence",
    title: "Evidence • Projects",
    tabColor: "tab-olive",
    badge: "RESTRICTED",
    bodyHTML: `
      <p><strong>Projects</strong> presented as case files and findings.</p>

      <div class="doc" data-doc="projects">
        <strong>OPEN PROJECT FILES</strong><br/>
        Case studies (what, why, result).
      </div>

      <!-- TODO: You said LinkedIn goes here later -->
      <p style="opacity:.75;">Artifacts (LinkedIn/GitHub) will be placed here (not on Home).</p>
    `
  },
  {
    key: "skills",
    title: "Skills Matrix",
    tabColor: "tab-gray",
    badge: "ASSESSMENT",
    bodyHTML: `
      <p><strong>Skill matrix</strong> (tools + strength + proof).</p>

      <div class="doc" data-doc="skillsMatrix">
        <strong>VIEW MATRIX</strong><br/>
        Replace with your real tool list.
      </div>
    `
  },
  {
    key: "awards",
    title: "Awards + Credentials",
    tabColor: "tab-green",
    badge: "VERIFIED",
    bodyHTML: `
      <p>Certifications, training, and recognition.</p>

      <div class="doc" data-doc="awardsList">
        <strong>OPEN CREDENTIALS</strong><br/>
        Add certs + programs.
      </div>
    `
  },
  {
    key: "references",
    title: "References",
    tabColor: "tab-purple",
    badge: "ON REQUEST",
    bodyHTML: `
      <p>References are available on request.</p>

      <div class="doc" data-doc="refPolicy">
        <strong>REFERENCE POLICY</strong><br/>
        How to request + what’s included.
      </div>
    `
  },
  {
    key: "contact",
    title: "Contact",
    tabColor: "tab-red",
    badge: "ACTIVE",
    bodyHTML: `
      <p><strong>Contact lives here only</strong> (your rule).</p>

      <div class="doc" data-doc="contact">
        <strong>OPEN CONTACT CHANNEL</strong><br/>
        Set up real email delivery (Formspree).
      </div>
    `
  }
];

/* ============================================================
  DOM ELEMENTS (grab everything we need)
============================================================ */

// Lock screen elements
const lockScreen = document.getElementById("lockScreen");
const passcodeInput = document.getElementById("passcode");
const accessBtn = document.getElementById("accessBtn");
const requestAccessBtn = document.getElementById("requestAccessBtn");
const triesLeftEl = document.getElementById("triesLeft");
const lockMsg = document.getElementById("lockMsg");
const sealBreak = document.getElementById("sealBreak");

// Desk scene elements
const deskScene = document.getElementById("deskScene");
const liveDot = document.getElementById("liveDot");
const tocSelect = document.getElementById("tocSelect");

// Folder cover overlay
const coverOverlay = document.getElementById("coverOverlay");
const openFolderBtn = document.getElementById("openFolderBtn");
const readOnlyBtn = document.getElementById("readOnlyBtn");

// Pages
const pageLeft = document.getElementById("pageLeft");
const pageRight = document.getElementById("pageRight");
const leftBadge = document.getElementById("leftBadge");
const leftId = document.getElementById("leftId");
const leftTitle = document.getElementById("leftTitle");
const leftBody = document.getElementById("leftBody");

const rightBadge = document.getElementById("rightBadge");
const rightId = document.getElementById("rightId");
const rightTitle = document.getElementById("rightTitle");
const rightBody = document.getElementById("rightBody");

// Flip sheet overlay on right page
const flipSheet = document.getElementById("flipSheet");

// Navigation buttons
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// Tabs containers
const tabsLeft = document.getElementById("tabsLeft");
const tabsRight = document.getElementById("tabsRight");

// Scan + stamp overlays
const runScanBtn = document.getElementById("runScanBtn");
const scanOverlay = document.getElementById("scanOverlay");
const scanText = document.getElementById("scanText");

const stampApprovalBtn = document.getElementById("stampApprovalBtn");
const stampOverlay = document.getElementById("stampOverlay");

// Modal + toast
const modal = document.getElementById("modal");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const toast = document.getElementById("toast");

// Codename
const codename = document.getElementById("codename");

/* ============================================================
  STATE (current page index, tries, etc.)
============================================================ */

let tries = 3;

// currentIndex = which section is currently on the RIGHT page
let currentIndex = 0;

// leftIndex = last section that was flipped to the left (for realism)
let leftIndex = -1;

// A “busy” flag so users don’t spam flips mid-animation
let isFlipping = false;

/* ============================================================
  SMALL HELPERS (toast, modal)
============================================================ */

function showToast(msg, ms = 2200){
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), ms);
}

function openModal(title, html){
  modalTitle.textContent = title;
  modalBody.innerHTML = html;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden","false");
}
function closeModal(){
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden","true");
}
modalBackdrop?.addEventListener("click", closeModal);
modalClose?.addEventListener("click", closeModal);
document.addEventListener("keydown", (e)=>{ if(e.key === "Escape") closeModal(); });

/* ============================================================
  INITIAL SETUP (codename, toc, initial pages)
============================================================ */

// Set codename text + glitch data-text
codename.textContent = CODENAME;
codename.setAttribute("data-text", CODENAME);

// Build TOC dropdown (top shortcut)
function buildTOC(){
  tocSelect.innerHTML = "";
  SECTIONS.forEach((s, i) => {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i+1}. ${s.title}`;
    tocSelect.appendChild(opt);
  });
}

// Render pages (left + right) from indexes
function renderPages(){
  const right = SECTIONS[currentIndex];
  const left = leftIndex >= 0 ? SECTIONS[leftIndex] : null;

  // Right page (current)
  rightBadge.textContent = right.badge;
  rightId.textContent = `FILE: ${FILE_ID} • PAGE ${currentIndex + 1}/${SECTIONS.length}`;
  rightTitle.textContent = right.title;
  rightBody.innerHTML = right.bodyHTML;

  // Left page (previous) — if none yet, show a placeholder
  if(left){
    leftBadge.textContent = "ARCHIVE";
    leftId.textContent = `ARCHIVE • PAGE ${leftIndex + 1}`;
    leftTitle.textContent = left.title;
    leftBody.innerHTML = `<p style="opacity:.75;">Archived section (already flipped).</p>`;
  } else {
    leftBadge.textContent = "EMPTY";
    leftId.textContent = "ARCHIVE";
    leftTitle.textContent = "—";
    leftBody.innerHTML = `<p style="opacity:.60;">No pages flipped yet.</p>`;
  }

  // Sync TOC selection
  tocSelect.value = String(currentIndex);

  // Rebuild tabs every render
  buildTabs();
}

// Tabs rule you asked for:
// - current section is “open” on the right side
// - previous sections appear on the left side (like divider tabs moved)
function buildTabs(){
  tabsLeft.innerHTML = "";
  tabsRight.innerHTML = "";

  SECTIONS.forEach((s, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `tab-btn ${i === currentIndex ? "active" : ""}`;
    btn.setAttribute("data-target", String(i));
    btn.innerHTML = `
      <span class="tab-label">${s.title.split("•")[0].trim()}</span>
      <span class="tab-color ${s.tabColor}"></span>
    `;

    // If the section index is less than currentIndex, it lives on LEFT
    if(i < currentIndex){
      tabsLeft.appendChild(btn);
    } else {
      // current + future live on RIGHT
      tabsRight.appendChild(btn);
    }
  });
}

/* ============================================================
  LOCK SCREEN FLOW
============================================================ */

function grantAccess(){
  // show cinematic “seal break”
  sealBreak.classList.remove("hidden");
  sealBreak.setAttribute("aria-hidden","false");

  setTimeout(() => {
    // hide lock screen, show desk
    lockScreen.classList.add("hidden");
    lockScreen.setAttribute("aria-hidden","true");

    deskScene.classList.remove("hidden");
    deskScene.setAttribute("aria-hidden","false");

    // mark dot as live
    liveDot.classList.add("live");

    // show cover overlay first (confidential sheet)
    coverOverlay.classList.remove("hidden");
    coverOverlay.setAttribute("aria-hidden","false");

    showToast("ACCESS GRANTED • DOSSIER LOADED", 2400);
  }, 850);
}

function denyAccess(){
  tries--;
  triesLeftEl.textContent = String(tries);
  lockMsg.textContent = `ACCESS DENIED. ${tries} TRIES LEFT.`;
  showToast("ACCESS DENIED", 1300);

  if(tries <= 0){
    lockMsg.textContent = "LOCKED OUT. REFRESH TO TRY AGAIN.";
    passcodeInput.disabled = true;
    accessBtn.disabled = true;
    requestAccessBtn.disabled = true;
  }
}

// ACCESS button click
accessBtn.addEventListener("click", () => {
  const entered = (passcodeInput.value || "").trim();
  if(entered === PASSCODE) grantAccess();
  else denyAccess();
});

// Enter key submits
passcodeInput.addEventListener("keydown", (e) => {
  if(e.key === "Enter") accessBtn.click();
});

// Request view-only access (no password)
requestAccessBtn.addEventListener("click", () => {
  openModal("VIEW-ONLY ACCESS", `
    <p><strong>Welcome.</strong> You can preview a short summary without clearance.</p>
    <p>For full access, request the clearance code.</p>
    <div style="margin-top:12px;">
      <button class="chip mono" id="previewBtn" type="button">PREVIEW SUMMARY</button>
    </div>
  `);

  setTimeout(() => {
    document.getElementById("previewBtn")?.addEventListener("click", () => {
      closeModal();
      grantAccess();
      // Then auto-open a summary-only view:
      setTimeout(() => {
        coverOverlay.classList.add("hidden");
        showToast("SUMMARY MODE • LIMITED", 2400);
        // Jump to Case Summary with flips (still cinematic)
        jumpToIndex(1);
      }, 1100);
    });
  }, 0);
});

/* ============================================================
  COVER OVERLAY BUTTONS
============================================================ */

// Open dossier: hides cover overlay and reveals pages
openFolderBtn.addEventListener("click", () => {
  coverOverlay.classList.add("hidden");
  coverOverlay.setAttribute("aria-hidden","true");
  showToast("DOSSIER OPENED", 1500);
});

// View summary: hides cover overlay but takes you to Case Summary
readOnlyBtn.addEventListener("click", () => {
  coverOverlay.classList.add("hidden");
  coverOverlay.setAttribute("aria-hidden","true");
  showToast("SUMMARY VIEW", 1500);
  jumpToIndex(1);
});

/* ============================================================
  PAGE FLIP ENGINE (realistic turn, not sliding)

  Your rule:
    - flipping is the ONLY way to navigate
    - TOC / tabs still flip pages to reach target
    - after flip, tabs should appear left/right appropriately
============================================================ */

// Flip forward one page (current -> left, next becomes right)
async function flipForwardOnce(){
  if(isFlipping) return;
  if(currentIndex >= SECTIONS.length - 1) return;

  isFlipping = true;

  // Prepare flip sheet to look like current page (visual consistency)
  flipSheet.classList.add("active");
  flipSheet.classList.remove("flip-back");
  flipSheet.classList.add("flip-forward");

  // During flip, we want the left page to become the current page (archive)
  const oldIndex = currentIndex;
  leftIndex = oldIndex;
  currentIndex = oldIndex + 1;

  // Wait mid-animation before swapping content (feels like paper turning)
  await wait(360);
  renderPages();

  // Finish animation
  await wait(400);

  // Reset flip sheet
  flipSheet.classList.remove("flip-forward");
  flipSheet.classList.remove("active");

  isFlipping = false;
}

// Flip backward one page (go back)
async function flipBackOnce(){
  if(isFlipping) return;
  if(currentIndex <= 0) return;

  isFlipping = true;

  // Flip sheet from the right side (reverse turn)
  flipSheet.classList.add("active");
  flipSheet.classList.remove("flip-forward");
  flipSheet.classList.add("flip-back");

  const oldIndex = currentIndex;
  currentIndex = oldIndex - 1;
  leftIndex = currentIndex - 1; // archive becomes one behind

  await wait(360);
  renderPages();

  await wait(400);

  flipSheet.classList.remove("flip-back");
  flipSheet.classList.remove("active");

  isFlipping = false;
}

// Utility: wait helper for animation timing
function wait(ms){
  return new Promise(res => setTimeout(res, ms));
}

/* ============================================================
  JUMP NAVIGATION (tabs + TOC) — still flips pages sequentially
============================================================ */

async function jumpToIndex(targetIndex){
  if(isFlipping) return;
  if(targetIndex === currentIndex) return;

  // Decide direction and flip step-by-step
  if(targetIndex > currentIndex){
    while(currentIndex < targetIndex){
      await flipForwardOnce();
      await wait(80); // small pause so the flips feel readable
    }
  } else {
    while(currentIndex > targetIndex){
      await flipBackOnce();
      await wait(80);
    }
  }
}

// TOC change event
tocSelect.addEventListener("change", (e) => {
  const target = Number(e.target.value);
  jumpToIndex(target);
});

// Tabs click event (left or right)
function handleTabClick(e){
  const btn = e.target.closest(".tab-btn");
  if(!btn) return;
  const target = Number(btn.getAttribute("data-target"));
  jumpToIndex(target);
}
tabsLeft.addEventListener("click", handleTabClick);
tabsRight.addEventListener("click", handleTabClick);

// Prev/Next buttons on the page
prevBtn.addEventListener("click", flipBackOnce);
nextBtn.addEventListener("click", flipForwardOnce);

/* ============================================================
  “CLICKABLE EVERYTHING” DOCS (open modals from page body)
============================================================ */

const DOCS = {
  mission: {
    title: "MISSION OBJECTIVE",
    html: `
      <p><strong>Objective:</strong> Place Jasmine Grant in a Tier 1 / Service Desk role.</p>
      <ul>
        <li>Fast triage + clear resolutions</li>
        <li>Documentation that saves teams time</li>
        <li>Security-minded access handling</li>
      </ul>
      <p style="opacity:.75;"><strong>TODO:</strong> Add ticket stats (SLA %, CSAT, etc.).</p>
    `
  },
  how: {
    title: "HOW TO NAVIGATE",
    html: `
      <p>This site is a <strong>physical folder simulation</strong>.</p>
      <p>Tabs and TOC still <strong>flip pages</strong> so it feels real.</p>
      <p>Everything important opens as a report (clickable).</p>
    `
  },
  next: {
    title: "RECRUITER FLOW",
    html: `
      <ol>
        <li>Case Summary</li>
        <li>Experience</li>
        <li>Evidence</li>
        <li>Skills Matrix</li>
        <li>Contact</li>
      </ol>
      <p style="opacity:.75;">Goal: fast confidence, no confusion.</p>
    `
  },
  caseFull: {
    title: "CASE SUMMARY • FULL REPORT",
    html: `
      <p><strong>TODO:</strong> Paste your final professional bio.</p>
      <p>Keep it proof-based and recruiter-friendly.</p>
    `
  },
  work: {
    title: "WORK LOG",
    html: `
      <p><strong>TODO:</strong> Add your roles, dates, and results.</p>
      <ul>
        <li>Company • Role • Dates</li>
        <li>Tools used</li>
        <li>Wins (SLA, CSAT, ticket volume)</li>
      </ul>
    `
  },
  school: {
    title: "EDUCATION LOG",
    html: `
      <p><strong>TODO:</strong> Add programs and key coursework.</p>
    `
  },
  projects: {
    title: "PROJECT FILES",
    html: `
      <p><strong>TODO:</strong> Add projects as case studies.</p>
      <p>Format:</p>
      <ul>
        <li>Problem</li>
        <li>Action</li>
        <li>Result</li>
      </ul>
    `
  },
  skillsMatrix: {
    title: "SKILLS MATRIX",
    html: `
      <p><strong>TODO:</strong> Add real tools + proof.</p>
      <p>Examples:</p>
      <ul>
        <li>Ticketing: Zendesk / ServiceNow</li>
        <li>OS: Windows, macOS basics</li>
        <li>Networking: basic troubleshooting</li>
      </ul>
    `
  },
  awardsList: {
    title: "AWARDS + CREDENTIALS",
    html: `
      <p><strong>TODO:</strong> Add certs, trainings, and awards.</p>
    `
  },
  refPolicy: {
    title: "REFERENCE POLICY",
    html: `
      <p>References are provided on request.</p>
      <p><strong>TODO:</strong> Add how recruiters can request them.</p>
    `
  },
  contact: {
    title: "CONTACT CHANNEL",
    html: `
      <p><strong>Real email delivery:</strong></p>
      <p>Use Formspree (simple) or a custom backend (advanced).</p>
      <p style="opacity:.75;"><strong>TODO:</strong> If you want Formspree, tell me and I’ll wire it in cleanly.</p>
      <p>For now, we can also use a mailto link.</p>
    `
  }
};

// Click handler for doc cards inside page content
document.addEventListener("click", (e) => {
  const doc = e.target.closest("[data-doc]");
  if(!doc) return;
  const key = doc.getAttribute("data-doc");
  const item = DOCS[key];
  if(!item) return;
  openModal(item.title, item.html);
});

/* ============================================================
  SCAN + STAMP (cinematic overlays)
============================================================ */

function showScan(msg){
  scanText.textContent = msg;
  scanOverlay.classList.remove("hidden");
  scanOverlay.setAttribute("aria-hidden","false");
}
function hideScan(){
  scanOverlay.classList.add("hidden");
  scanOverlay.setAttribute("aria-hidden","true");
}

runScanBtn.addEventListener("click", async () => {
  showScan("REPROCESSING DOSSIER…");
  await wait(900);
  showScan("SCAN IN PROGRESS…");
  await wait(1100);
  showScan("SCAN COMPLETE: HIGH VALUE ASSET AVAILABLE FOR HIRING");
  showToast("SCAN COMPLETE • AVAILABLE FOR HIRING", 3200);
  await wait(2400);
  hideScan();
});

stampApprovalBtn.addEventListener("click", async () => {
  stampOverlay.classList.remove("hidden");
  stampOverlay.setAttribute("aria-hidden","false");
  await wait(900);
  stampOverlay.classList.add("hidden");
  stampOverlay.setAttribute("aria-hidden","true");
  showToast("APPROVAL STAMPED", 1800);
});

/* ============================================================
  BOOT
============================================================ */

buildTOC();
renderPages();