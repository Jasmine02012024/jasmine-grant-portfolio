const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

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
  Object.values(pages).forEach(p => p?.classList.remove("show"));
  pages[key]?.classList.add("show");
  tabs.forEach(t => t.classList.toggle("active", t.dataset.page === key));
}

tabs.forEach(tab => tab.addEventListener("click", () => showPage(tab.dataset.page)));

document.querySelectorAll("[data-jump]").forEach(btn => {
  btn.addEventListener("click", () => showPage(btn.dataset.jump));
});

// Stamp animation
const btnStamp = document.getElementById("btnStamp");
const approvedStamp = document.getElementById("approvedStamp");
btnStamp?.addEventListener("click", () => {
  approvedStamp?.classList.add("show");
  setTimeout(() => approvedStamp?.classList.remove("show"), 1300);
});

// Redaction reveal toggle
const toggleRedactions = document.getElementById("toggleRedactions");
let revealed = false;
toggleRedactions?.addEventListener("click", () => {
  revealed = !revealed;
  document.querySelectorAll(".redact").forEach((r, i) => {
    r.classList.toggle("revealed", revealed);
    if (revealed) {
      const lines = ["AUTHORIZED VIEW", "VERIFIED", "PRIORITY MATCH"];
      r.textContent = lines[i] || "AUTHORIZED VIEW";
    } else {
      r.textContent = "███████████████";
    }
  });
  toggleRedactions.textContent = revealed ? "HIDE REDACTIONS" : "REVEAL REDACTIONS";
});

// Scanline pass
const scanline = document.getElementById("scanline");
const btnScan = document.getElementById("btnScan");

function runScan(){
  if (!scanline) return;
  scanline.style.opacity = "0.85";
  scanline.style.transition = "none";
  scanline.style.top = "-180px";
  requestAnimationFrame(() => {
    scanline.style.transition = "top 900ms linear, opacity 220ms ease";
    scanline.style.top = "110vh";
    setTimeout(() => { scanline.style.opacity = "0"; }, 760);
  });
}

btnScan?.addEventListener("click", runScan);

// Contact demo
const fakeSend = document.getElementById("fakeSend");
const sendNote = document.getElementById("sendNote");
fakeSend?.addEventListener("click", () => {
  sendNote.textContent = "Demo mode. We can connect this to Formspree / Netlify later.";
});