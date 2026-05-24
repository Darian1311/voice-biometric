const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";

const C = {
  bg: "FFFFFF",
  dark: "0E1B2A",      // cinematic dark for open/close
  primary: "1F4E79",
  accent: "2E75B6",
  body: "2D2D2D",
  muted: "777777",
  rule: "CCCCCC",
  alert: "C0392B",
  navyText: "A9C2E0",
};
const F = { face: "Arial", title: 26, sec: 22, body: 20, label: 16, cite: 13 };
const M = 0.5;

function actionTitle(slide, text, h = 0.85) {
  slide.addText(text, { x: M, y: 0.22, w: 9.0, h, fontSize: F.title, fontFace: F.face, color: C.primary, bold: true, valign: "top" });
  slide.addShape(pres.ShapeType.rect, { x: M, y: 0.22 + h + 0.05, w: 9.0, h: 0.025, fill: { color: C.rule }, line: { color: C.rule } });
}
function placeholder(slide, x, y, w, h, label) {
  slide.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { color: "F4F6F9" }, line: { color: C.accent, width: 1.5, dashType: "dash" } });
  slide.addText(label, { x: x + 0.1, y, w: w - 0.2, h, fontSize: 13, fontFace: F.face, color: C.muted, align: "center", valign: "middle", italic: true });
}

// ===== SLIDE 1 — COLD OPEN (no logo) =====
let s = pres.addSlide();
s.background = { color: C.dark };
s.addText("„Mamă, am avut un accident.\nAm nevoie de bani acum.”", {
  x: 0.8, y: 1.5, w: 8.4, h: 1.8, fontSize: 34, fontFace: F.face, color: "FFFFFF", bold: true, align: "left", valign: "middle",
});
s.addText("Vocea era a fiului ei. Apelantul — nu era el.", {
  x: 0.8, y: 3.5, w: 8.4, h: 0.6, fontSize: 20, fontFace: F.face, color: C.navyText, align: "left",
});
s.addNotes(
  "[0:00-0:25] Nu spuneți nimic 2 secunde. Lăsați replica pe ecran. " +
  "Apoi: Imaginați-vă telefonul vostru sună. La capăt, vocea fiului vostru — perfectă, cunoscută — vă cere bani urgent. " +
  "Doar că nu e fiul vostru. E un scammer care i-a clonat vocea. Asta se întâmplă în România, acum."
);

// ===== SLIDE 2 — WHY NOW (the wedge) =====
s = pres.addSlide();
actionTitle(s, "Clonarea vocii a trecut de la laborator la 30 de secunde și câțiva dolari");
s.addText([
  { text: "Un scammer are nevoie de câteva secunde din vocea ta", options: { bold: true, breakLine: false } },
  { text: " — dintr-un story, dintr-un mesaj vocal — ca să o cloneze convingător.", options: { breakLine: true } },
  { text: "Ce era science-fiction în 2023", options: { bold: true, breakLine: false } },
  { text: " e azi o unealtă ieftină, la îndemâna oricui.", options: { breakLine: true } },
  { text: "Apărarea pentru vocea clonată nu există încă.", options: { bold: true, breakLine: false } },
  { text: " Aici intrăm noi.", options: { breakLine: true } },
], {
  x: M, y: 1.5, w: 9.0, h: 2.8, fontSize: F.body, fontFace: F.face, color: C.body, bullet: true, paraSpaceAfter: 16,
});
s.addNotes(
  "[0:25-0:55] De ce acum? Pentru că clonarea vocală tocmai a devenit trivială. " +
  "Acum un an era cercetare. Azi e un instrument de câțiva dolari care are nevoie de 30 de secunde din vocea ta — " +
  "luate de pe rețele sociale sau dintr-un mesaj vocal. Amenințarea e nouă. Și apărarea pentru ea nu există încă. Acolo construim noi."
);

// ===== SLIDE 3 — SCALE =====
s = pres.addSlide();
actionTitle(s, "Frauda telefonică s-a aproape dublat în România în 2025 — și accelerează");
const stats = [
  { big: "~2×", small: "fraude în România, 2025 vs 2024 (DNSC)" },
  { big: "+442%", small: "atacuri vocale globale în 2025, conduse de AI" },
  { big: "×4", small: "pierderile vârstnicilor din 2020 (FTC)" },
];
stats.forEach((st, i) => {
  const x = M + i * 3.05;
  s.addText(st.big, { x, y: 1.35, w: 2.9, h: 0.9, fontSize: 40, fontFace: F.face, color: C.accent, bold: true, align: "center" });
  s.addText(st.small, { x, y: 2.3, w: 2.9, h: 1.1, fontSize: 14, fontFace: F.face, color: C.body, align: "center", valign: "top" });
});
placeholder(s, M, 3.65, 9.0, 1.3, "SCREENSHOT AICI: titlu știre ProTV — escroci destructurați, vârstnici păcăliți, prejudiciu 80.000 lei");
s.addText("Surse: DNSC; FTC (2025); rapoarte vishing globale 2025", { x: M, y: 5.05, w: 9.0, h: 0.3, fontSize: F.cite, fontFace: F.face, color: C.muted });
s.addNotes(
  "[0:55-1:25] Și nu e o problemă mică. În România, numărul fraudelor s-a aproape dublat anul trecut, date DNSC. " +
  "Global, atacurile vocale au crescut cu 442%. Pierderile vârstnicilor s-au împătrit din 2020. " +
  "[Arată știrea.] Cazuri reale, din România, chiar acum."
);

// ===== SLIDE 4 — THE GAP =====
s = pres.addSlide();
actionTitle(s, "Apărarea bazată pe număr e oarbă la vocea clonată", 0.85);
s.addText([
  { text: "Bitdefender ", options: { bold: true, breakLine: false } },
  { text: "blochează numere necunoscute — numărul clonat pare cunoscut.", options: { breakLine: true } },
  { text: "Truecaller ", options: { bold: true, breakLine: false } },
  { text: "verifică reputația numărului — a numărului spoofat e curată.", options: { breakLine: true } },
  { text: "Rezultat: ", options: { bold: true, breakLine: false } },
  { text: "apelul afișează numărul fiului. Vocea e falsă. Nimeni nu o verifică.", options: { breakLine: true } },
], {
  x: M, y: 1.45, w: 5.2, h: 2.4, fontSize: F.body, fontFace: F.face, color: C.body, bullet: true, paraSpaceAfter: 12,
});
placeholder(s, 5.9, 1.45, 3.6, 2.6, "SCREENSHOT AICI: avertizare oficială SPOOFING — Poliția Română + DNSC + ARB (mai.gov.ro)");
s.addText("Avertizare oficială: Poliția Română, DNSC, ARB (2025)", { x: M, y: 5.05, w: 9.0, h: 0.3, fontSize: F.cite, fontFace: F.face, color: C.muted });
s.addNotes(
  "[1:25-1:50] Iată golul. Bitdefender și Truecaller se bazează pe NUMĂR. Dar vocea clonată sună de pe un număr care pare curat — " +
  "al fiului, al băncii. Apărarea bazată pe număr e oarbă la vocea falsă. " +
  "[Arată avertizarea.] Poliția Română a avertizat deja oficial despre spoofing. Nimeni nu verifică vocea. Noi da."
);

// ===== SLIDE 5 — MAIA REVEAL =====
s = pres.addSlide();
s.background = { color: C.primary };
s.addText("MAIA", { x: M, y: 1.0, w: 9.0, h: 0.9, fontSize: 50, fontFace: F.face, color: "FFFFFF", bold: true, align: "center" });
s.addText("Verificăm vocea, nu numărul.", { x: M, y: 2.0, w: 9.0, h: 0.7, fontSize: 28, fontFace: F.face, color: C.navyText, align: "center" });
s.addShape(pres.ShapeType.rect, { x: 4.0, y: 2.85, w: 2.0, h: 0.05, fill: { color: C.accent } });
s.addText("Truecaller vede cine sună. Bitdefender blochează numerele.\nNoi verificăm dacă persoana care vorbește e cine pretinde că e.", {
  x: 1.0, y: 3.15, w: 8.0, h: 1.0, fontSize: 18, fontFace: F.face, color: "FFFFFF", align: "center", valign: "middle",
});
s.addNotes(
  "[1:50-2:10] Soluția noastră, într-o frază: verificăm vocea, nu numărul. " +
  "Truecaller vede cine sună. Bitdefender blochează numerele. MAIA verifică dacă persoana care vorbește e cine pretinde că e. " +
  "Hai să vă arăt — live."
);

// ===== SLIDE 6 — DEMO =====
s = pres.addSlide();
actionTitle(s, "Demo live: un apel scam detectat și oprit în sub 10 secunde");
placeholder(s, M, 1.3, 6.0, 3.6, "DEMO LIVE AICI (sau video fallback 60s)\n\nApel intrat → transcript live → cuvinte-cheie\naprinse → scor 30→55→80 → SCAM →\nintervenție vocală");
s.addText("Ce vede juriul", { x: 6.7, y: 1.3, w: 2.8, h: 0.35, fontSize: F.sec, fontFace: F.face, color: C.accent, bold: true });
s.addText([
  { text: "Apel de pe un număr „curat”", options: { breakLine: true } },
  { text: "Transcriere live în română", options: { breakLine: true } },
  { text: "Cuvinte-cheie scam detectate", options: { breakLine: true } },
  { text: "Scor de risc urcă în timp real", options: { breakLine: true } },
  { text: "SCAM → agent vocal intervine", options: { breakLine: true } },
], { x: 6.7, y: 1.7, w: 2.9, h: 3.0, fontSize: 15, fontFace: F.face, color: C.body, bullet: true, paraSpaceAfter: 10 });
s.addText("Fallback: dacă apelul nu intră în 5s, comută pe video fără pauză.", { x: M, y: 5.05, w: 9.0, h: 0.3, fontSize: F.cite, fontFace: F.face, color: C.alert });
s.addNotes(
  "[2:10-3:00] DEMO LIVE. Sun acum numărul protejat, ca un scammer. [Telefon sună.] " +
  "Priviți: apelul intră, transcriptul apare live, cuvintele-cheie se aprind — transfer, cont, urgent. " +
  "Scorul urcă: 30, 55, 80. Verdict: SCAM. Și agentul vocal intervine automat. [Audiența aude avertizarea.] " +
  "Bunica nu a făcut nimic. Sistemul a auzit, a înțeles, a intervenit. " +
  "FALLBACK: dacă apelul nu intră în 5 secunde, pornesc video-ul fără să mă opresc."
);

// ===== SLIDE 7 — HOW IT WORKS =====
s = pres.addSlide();
actionTitle(s, "Trei straturi: biometrie vocală, analiză live, anti-spoofing AI");
const pillars = [
  { h: "1 · Biometrie vocală", b: "ECAPA-TDNN, amprentă 192-dim. Recunoaște vocea reală a celor dragi." },
  { h: "2 · Analiză live", b: "Transcriere română + cuvinte-cheie scam pe parcursul apelului." },
  { h: "3 · Anti-spoofing", b: "Detectează vocea sintetică / clonată cu AI." },
];
pillars.forEach((p, i) => {
  const x = M + i * 3.05;
  s.addShape(pres.ShapeType.roundRect, { x, y: 1.4, w: 2.9, h: 2.6, fill: { color: "F4F6F9" }, line: { color: C.accent, width: 1 }, rectRadius: 0.08 });
  s.addText(p.h, { x: x + 0.15, y: 1.55, w: 2.6, h: 0.6, fontSize: 16, fontFace: F.face, color: C.accent, bold: true, valign: "top" });
  s.addText(p.b, { x: x + 0.15, y: 2.2, w: 2.6, h: 1.7, fontSize: 14, fontFace: F.face, color: C.body, valign: "top" });
});
s.addText("Scor vocal + cuvinte-cheie → verdict combinat instant → intervenție automată", {
  x: M, y: 4.25, w: 9.0, h: 0.5, fontSize: 16, fontFace: F.face, color: C.primary, bold: true, align: "center",
});
s.addNotes(
  "[3:00-3:35] Trei straturi. Unu: biometrie vocală ECAPA-TDNN — amprentă vocală de 192 dimensiuni care recunoaște vocea reală a celor dragi. " +
  "Doi: analiză live — transcriere română și cuvinte-cheie scam. Trei: anti-spoofing — prindem vocea clonată cu AI. " +
  "Combinăm scorul vocal cu cuvintele-cheie, verdict instant, intervenție automată. " +
  "Numărul poate fi clonat. Vocea — nu, cel puțin nu fără să o auzim."
);

// ===== SLIDE 8 — BUSINESS =====
s = pres.addSlide();
actionTitle(s, "Plătește familia, gratuit pentru cei dragi");
s.addText([
  { text: "Persoana protejată (vârstnicul): ", options: { bold: true, breakLine: false } },
  { text: "abonament, protecție activă.", options: { breakLine: true } },
  { text: "Persoana apropiată (fiul/fiica): ", options: { bold: true, breakLine: false } },
  { text: "gratuit — își înregistrează vocea, vede alertele.", options: { breakLine: true } },
  { text: "Cine plătește: ", options: { bold: true, breakLine: false } },
  { text: "familia care vrea liniște — nu vârstnicul.", options: { breakLine: true } },
  { text: "Piață: ", options: { bold: true, breakLine: false } },
  { text: "orice familie cu părinți vârstnici. Mâine: oriunde vocea poate fi clonată.", options: { breakLine: true } },
], { x: M, y: 1.5, w: 9.0, h: 3.0, fontSize: F.body, fontFace: F.face, color: C.body, bullet: true, paraSpaceAfter: 14 });
s.addNotes(
  "[3:35-3:50] Modelul: plătește familia, nu bunica. Persoana apropiată își înregistrează vocea gratuit și vede alertele. " +
  "Persoana protejată are abonamentul. Piața: orice familie cu părinți vârstnici — și mâine, oriunde vocea poate fi clonată. Adică peste tot."
);

// ===== SLIDE 9 — CLOSE / VISION =====
s = pres.addSlide();
s.background = { color: C.dark };
s.addText("Scammerii au învățat să falsifice numărul.\nNoi am învățat să le auzim vocea.", {
  x: 0.8, y: 1.7, w: 8.4, h: 1.6, fontSize: 30, fontFace: F.face, color: "FFFFFF", bold: true, align: "left", valign: "middle",
});
s.addShape(pres.ShapeType.rect, { x: 0.8, y: 3.45, w: 2.2, h: 0.05, fill: { color: C.accent } });
s.addText("MAIA — liniște pentru toată familia.", { x: 0.8, y: 3.65, w: 8.4, h: 0.5, fontSize: 20, fontFace: F.face, color: C.navyText, align: "left" });
s.addText("contact: [email / link aici]", { x: 0.8, y: 4.85, w: 8.4, h: 0.4, fontSize: 14, fontFace: F.face, color: C.navyText, align: "left" });
s.addNotes(
  "[3:50-4:00] Pe scurt: scammerii au învățat să falsifice numărul. Noi am învățat să le auzim vocea. " +
  "MAIA — liniște pentru toată familia. Mulțumim. [Rămâi pe acest slide la întrebări.]"
);

pres.writeFile({ fileName: "c:/Users/HOME/Desktop/Biometric/presentation/MAIA_pitch_v2.pptx" }).then((fn) => console.log("SAVED:", fn));
