const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10" x 5.625"

const C = {
  bg: "FFFFFF",
  primary: "1F4E79",   // navy — titles
  accent: "2E75B6",    // mid-blue — headers/highlights
  body: "2D2D2D",
  muted: "777777",
  rule: "CCCCCC",
  alert: "C0392B",     // red — scam verdict / danger
  highlight: "FFF2CC",
  navyText: "A0BBDD",
};
const F = { face: "Arial", title: 26, sec: 22, body: 20, label: 16, cite: 13 };
const M = 0.5;

// ---- helpers ----
function actionTitle(slide, text, h = 0.85) {
  slide.addText(text, {
    x: M, y: 0.22, w: 9.0, h,
    fontSize: F.title, fontFace: F.face, color: C.primary, bold: true, valign: "top",
  });
  slide.addShape(pres.ShapeType.rect, {
    x: M, y: 0.22 + h + 0.05, w: 9.0, h: 0.025, fill: { color: C.rule }, line: { color: C.rule },
  });
}
function screenshotPlaceholder(slide, x, y, w, h, label) {
  slide.addShape(pres.ShapeType.rect, {
    x, y, w, h,
    fill: { color: "F4F6F9" },
    line: { color: C.accent, width: 1.5, dashType: "dash" },
  });
  slide.addText(label, {
    x: x + 0.1, y, w: w - 0.2, h,
    fontSize: 13, fontFace: F.face, color: C.muted, align: "center", valign: "middle", italic: true,
  });
}

// ============ SLIDE 1 — TITLE ============
let s = pres.addSlide();
s.background = { color: C.primary };
s.addText("MAIA", {
  x: 0.7, y: 1.0, w: 8.6, h: 0.9, fontSize: 54, fontFace: F.face, color: "FFFFFF", bold: true, align: "left",
});
s.addText("Verificăm vocea, nu numărul.", {
  x: 0.7, y: 2.0, w: 8.6, h: 0.8, fontSize: 28, fontFace: F.face, color: C.navyText, align: "left",
});
s.addShape(pres.ShapeType.rect, { x: 0.7, y: 3.05, w: 2.2, h: 0.05, fill: { color: C.accent } });
s.addText("Protecție anti-scam telefonic prin biometrie vocală în timp real", {
  x: 0.7, y: 3.3, w: 8.6, h: 0.5, fontSize: 16, fontFace: F.face, color: "CADCFC", align: "left",
});
s.addText("Hackathon · 2026", {
  x: 0.7, y: 4.8, w: 8.6, h: 0.4, fontSize: 14, fontFace: F.face, color: C.navyText, align: "left",
});
s.addNotes(
  "[0:00-0:30] Bună ziua. Suntem MAIA. O singură propoziție rezumă tot ce facem: " +
  "verificăm vocea, nu numărul. Pentru că problema fraudei telefonice nu mai e despre cine sună — " +
  "e despre cine vorbește de fapt la capătul firului. Lăsați-mă să vă arăt cât de gravă a devenit problema."
);

// ============ SLIDE 2 — PROBLEM / DATA ============
s = pres.addSlide();
actionTitle(s, "Frauda telefonică s-a aproape dublat în România în 2025 — și accelerează");
// three stat blocks
const stats = [
  { big: "~2×", small: "creșterea numărului de fraude în România, 2025 vs 2024 (DNSC)" },
  { big: "+442%", small: "creșterea globală a atacurilor vocale (vishing) în 2025, conduse de clonare AI" },
  { big: "×4", small: "pierderile vârstnicilor din 2020 ($600M → $2,4B, FTC)" },
];
stats.forEach((st, i) => {
  const x = M + i * 3.05;
  s.addText(st.big, { x, y: 1.35, w: 2.9, h: 0.9, fontSize: 40, fontFace: F.face, color: C.accent, bold: true, align: "center" });
  s.addText(st.small, { x, y: 2.3, w: 2.9, h: 1.2, fontSize: 14, fontFace: F.face, color: C.body, align: "center", valign: "top" });
});
screenshotPlaceholder(s, M, 3.7, 9.0, 1.25, "SCREENSHOT AICI: titlu știre ProTV — „Rețea de escroci destructurată, prejudiciu 80.000 lei, vârstnici păcăliți” (stirileprotv.ro)");
s.addText("Surse: DNSC; FTC (2025); rapoarte vishing globale 2025", {
  x: M, y: 5.05, w: 9.0, h: 0.3, fontSize: F.cite, fontFace: F.face, color: C.muted,
});
s.addNotes(
  "[0:30-1:05] Numărul fraudelor telefonice în România s-a aproape dublat anul trecut — date DNSC. " +
  "La nivel global, atacurile prin voce au explodat cu 442%, pentru că scammerii folosesc acum clonarea vocală cu AI. " +
  "Pierderile vârstnicilor s-au împătrit din 2020. Aceasta nu e o nișă — e o epidemie în accelerare. " +
  "[Arată screenshot-ul de știre.] Cazuri reale, din România, din ultimele luni."
);

// ============ SLIDE 3 — THE GAP ============
s = pres.addSlide();
actionTitle(s, "Soluțiile bazate pe număr eșuează: scammerii sună de pe numere clonate", 1.0);
s.addText([
  { text: "Bitdefender ", options: { bold: true, breakLine: false } },
  { text: "blochează numere necunoscute — dar numărul clonat pare cunoscut.", options: { breakLine: true } },
  { text: "Truecaller ", options: { bold: true, breakLine: false } },
  { text: "verifică reputația numărului — dar reputația numărului spoofat e curată.", options: { breakLine: true } },
  { text: "Spoofing-ul ", options: { bold: true, breakLine: false } },
  { text: "face ca apelul să afișeze numărul fiului, al băncii, al poliției.", options: { breakLine: true } },
], {
  x: M, y: 1.45, w: 5.2, h: 2.4, fontSize: F.body, fontFace: F.face, color: C.body, bullet: true, paraSpaceAfter: 12,
});
screenshotPlaceholder(s, 5.9, 1.45, 3.6, 2.6, "SCREENSHOT AICI: avertizare oficială SPOOFING — Poliția Română + DNSC + ARB (mai.gov.ro)");
s.addText("Avertizare oficială: Poliția Română, DNSC, Asociația Română a Băncilor (2025)", {
  x: M, y: 5.05, w: 9.0, h: 0.3, fontSize: F.cite, fontFace: F.face, color: C.muted,
});
s.addNotes(
  "[1:05-1:30] Iată golul real. Bitdefender blochează numere. Truecaller verifică reputația numărului. " +
  "Ambele se bazează pe NUMĂR. Dar scammerii clonează acum numărul — apare numărul fiului tău, al băncii tale. " +
  "Numărul e curat, trece de orice filtru. [Arată avertizarea.] Poliția Română a emis deja o avertizare oficială despre spoofing. " +
  "Nimeni nu verifică ce contează cu adevărat: vocea."
);

// ============ SLIDE 4 — THESIS / POSITIONING ============
s = pres.addSlide();
s.background = { color: C.bg };
s.addShape(pres.ShapeType.roundRect, {
  x: 1.0, y: 1.7, w: 8.0, h: 2.2, fill: { color: "EBF3FA" }, line: { color: C.accent, width: 1.5 }, rectRadius: 0.12,
});
s.addText("Identitatea reală nu e în numărul afișat.\nE în voce.", {
  x: 1.2, y: 1.85, w: 7.6, h: 1.0, fontSize: 26, fontFace: F.face, color: C.primary, bold: true, align: "center", valign: "middle",
});
s.addText("Truecaller vede cine sună. Bitdefender blochează numerele.\nMAIA verifică dacă persoana care vorbește e cine pretinde că e.", {
  x: 1.2, y: 2.95, w: 7.6, h: 0.85, fontSize: 17, fontFace: F.face, color: C.body, align: "center", valign: "middle",
});
s.addNotes(
  "[1:30-1:50] Teza noastră, într-o frază. Identitatea reală nu e în numărul afișat — e în voce. " +
  "Truecaller vede cine sună. Bitdefender blochează numerele. Noi verificăm dacă persoana care vorbește e cine pretinde că e. " +
  "Hai să vă arăt cum funcționează — live."
);

// ============ SLIDE 5 — DEMO ============
s = pres.addSlide();
actionTitle(s, "Demo live: un apel scam, detectat și oprit în sub 10 secunde");
screenshotPlaceholder(s, M, 1.3, 6.0, 3.6, "DEMO LIVE AICI (sau video fallback de 60s)\n\nDashboard MAIA: apel intrat → transcript live →\ncuvinte-cheie aprinse → scor 30→55→80 →\nverdict SCAM → intervenție vocală");
s.addText("Ce vede juriul", {
  x: 6.7, y: 1.3, w: 2.8, h: 0.35, fontSize: F.sec, fontFace: F.face, color: C.accent, bold: true,
});
s.addText([
  { text: "Apel intrat de la un număr „curat”", options: { breakLine: true } },
  { text: "Transcriere live în română", options: { breakLine: true } },
  { text: "Cuvinte-cheie scam detectate", options: { breakLine: true } },
  { text: "Scor de risc urcă în timp real", options: { breakLine: true } },
  { text: "Verdict SCAM → agent vocal intervine", options: { breakLine: true } },
], {
  x: 6.7, y: 1.7, w: 2.9, h: 3.0, fontSize: 15, fontFace: F.face, color: C.body, bullet: true, paraSpaceAfter: 10,
});
s.addText("Fallback obligatoriu: dacă apelul nu intră în 5s, comută pe video fără pauză.", {
  x: M, y: 5.05, w: 9.0, h: 0.3, fontSize: F.cite, fontFace: F.face, color: C.alert,
});
s.addNotes(
  "[1:50-2:50] DEMO LIVE. Apelez acum numărul protejat, ca un scammer. " +
  "[Telefon sună.] Priviți ecranul: apelul intră, transcriptul apare live, cuvintele-cheie se aprind — " +
  "transfer, cont, urgent. Scorul de risc urcă: 30, 55, 80. Verdict: SCAM. " +
  "Și acum — agentul vocal intervine automat. [Audiența aude avertizarea.] " +
  "Bunica nu a trebuit să facă nimic. Sistemul a auzit, a înțeles, a intervenit. " +
  "FALLBACK: dacă apelul nu intră în 5 secunde, pornesc video-ul, fără să mă opresc din vorbit."
);

// ============ SLIDE 6 — TECH ARCHITECTURE ============
s = pres.addSlide();
actionTitle(s, "Arhitectură: analiză vocală în timp real, în trei straturi");
const pillars = [
  { h: "1 · Biometrie vocală", b: "ECAPA-TDNN, amprentă vocală 192-dim. Recunoaște vocea reală a celor apropiați." },
  { h: "2 · Analiză în timp real", b: "Transcriere română + detecția cuvintelor-cheie scam pe parcursul apelului." },
  { h: "3 · Anti-spoofing", b: "Detectează vocea sintetică sau clonată cu AI." },
];
pillars.forEach((p, i) => {
  const x = M + i * 3.05;
  s.addShape(pres.ShapeType.roundRect, { x, y: 1.4, w: 2.9, h: 2.6, fill: { color: "F4F6F9" }, line: { color: C.accent, width: 1 }, rectRadius: 0.08 });
  s.addText(p.h, { x: x + 0.15, y: 1.55, w: 2.6, h: 0.6, fontSize: 16, fontFace: F.face, color: C.accent, bold: true, valign: "top" });
  s.addText(p.b, { x: x + 0.15, y: 2.2, w: 2.6, h: 1.7, fontSize: 14, fontFace: F.face, color: C.body, valign: "top" });
});
s.addText("Scor vocal + scor cuvinte-cheie → verdict combinat instant → intervenție automată", {
  x: M, y: 4.25, w: 9.0, h: 0.5, fontSize: 16, fontFace: F.face, color: C.primary, bold: true, align: "center",
});
s.addNotes(
  "[2:50-3:30] Tehnic, sunt trei straturi. Unu: biometrie vocală cu ECAPA-TDNN — o amprentă vocală unică, " +
  "192 de dimensiuni, care recunoaște vocea reală a celor dragi. Doi: analiză în timp real — transcriere în română " +
  "și detecția cuvintelor-cheie de scam pe parcursul apelului. Trei: anti-spoofing — prindem vocea clonată cu AI. " +
  "Combinăm scorul vocal cu cuvintele-cheie și obținem un verdict instant, cu intervenție automată. " +
  "Numărul poate fi clonat. Vocea — nu, cel puțin nu fără să o auzim."
);

// ============ SLIDE 7 — BUSINESS MODEL ============
s = pres.addSlide();
actionTitle(s, "Model: plătește familia, gratuit pentru cei dragi");
s.addText([
  { text: "Persoană protejată (vârstnicul): ", options: { bold: true, breakLine: false } },
  { text: "abonament — protecția activă.", options: { breakLine: true } },
  { text: "Persoană apropiată (fiul/fiica): ", options: { bold: true, breakLine: false } },
  { text: "gratuit — își înregistrează vocea, vede alertele.", options: { breakLine: true } },
  { text: "Cine plătește: ", options: { bold: true, breakLine: false } },
  { text: "familia care vrea liniște, nu vârstnicul.", options: { breakLine: true } },
  { text: "Piață: ", options: { bold: true, breakLine: false } },
  { text: "orice familie din România cu părinți vârstnici.", options: { breakLine: true } },
], {
  x: M, y: 1.5, w: 9.0, h: 3.0, fontSize: F.body, fontFace: F.face, color: C.body, bullet: true, paraSpaceAfter: 14,
});
s.addNotes(
  "[3:30-3:50] Modelul de business. Plătește familia — fiul sau fiica care vor liniște — nu bunica. " +
  "Persoana apropiată își înregistrează vocea gratuit și vede alertele. Persoana protejată are abonamentul. " +
  "Piața: orice familie din România cu părinți vârstnici. Și mâine, oriunde clonarea vocală e o amenințare — adică peste tot."
);

// ============ SLIDE 8 — CONCLUSIONS ============
s = pres.addSlide();
s.background = { color: C.primary };
s.addText("Concluzii", { x: M, y: 0.3, w: 9.0, h: 0.45, fontSize: 20, fontFace: F.face, color: C.navyText });
s.addShape(pres.ShapeType.rect, { x: M, y: 0.78, w: 9.0, h: 0.04, fill: { color: C.accent } });
s.addText([
  { text: "1. Frauda vocală e o epidemie în accelerare — ", options: { bold: true, breakLine: false } },
  { text: "soluțiile bazate pe număr nu o mai opresc.", options: { breakLine: true } },
  { text: "2. MAIA verifică vocea, nu numărul — ", options: { bold: true, breakLine: false } },
  { text: "biometrie + anti-spoofing în timp real.", options: { breakLine: true } },
  { text: "3. Model freemium: ", options: { bold: true, breakLine: false } },
  { text: "plătește familia, protecția e pentru cei dragi.", options: { breakLine: true } },
], {
  x: M, y: 1.0, w: 9.0, h: 3.0, fontSize: 21, fontFace: F.face, color: "FFFFFF", paraSpaceAfter: 20,
});
s.addText("Scammerii au învățat să falsifice numărul. Noi am învățat să le auzim vocea.", {
  x: M, y: 4.2, w: 9.0, h: 0.6, fontSize: 18, fontFace: F.face, color: C.navyText, italic: true,
});
s.addText("MAIA · contact: [email/link aici]", {
  x: M, y: 4.95, w: 9.0, h: 0.4, fontSize: 14, fontFace: F.face, color: C.navyText,
});
s.addNotes(
  "[3:50-4:00] Pe scurt: frauda vocală e o epidemie pe care soluțiile bazate pe număr nu o mai opresc. " +
  "MAIA verifică vocea, nu numărul. Și plătește familia, nu vârstnicul. " +
  "Scammerii au învățat să falsifice numărul. Noi am învățat să le auzim vocea. Mulțumim."
);

// ============ SLIDE 9 — REFERENCES ============
s = pres.addSlide();
s.background = { color: C.bg };
s.addText("Surse", { x: M, y: 0.2, w: 9.0, h: 0.5, fontSize: 24, fontFace: F.face, color: C.primary, bold: true });
s.addShape(pres.ShapeType.rect, { x: M, y: 0.72, w: 9.0, h: 0.025, fill: { color: C.rule } });
s.addText([
  { text: "DNSC — Directoratul Național de Securitate Cibernetică: avertizări fraude telefonice 2025.", options: { breakLine: true } },
  { text: "", options: { breakLine: true } },
  { text: "Poliția Română, DNSC, ARB — avertizare oficială privind frauda de tip spoofing (mai.gov.ro, 2025).", options: { breakLine: true } },
  { text: "", options: { breakLine: true } },
  { text: "Știrile ProTV — rețea de escroci destructurată, prejudiciu 80.000 lei, vârstnici (2025).", options: { breakLine: true } },
  { text: "", options: { breakLine: true } },
  { text: "FTC — „False alarm, real scam: how scammers are stealing older adults' life savings” (2025).", options: { breakLine: true } },
  { text: "", options: { breakLine: true } },
  { text: "Rapoarte globale vishing 2025: creștere +442%, pierderi estimate $40B.", options: { breakLine: true } },
], {
  x: M, y: 0.9, w: 9.0, h: 4.3, fontSize: 13, fontFace: F.face, color: C.body, paraSpaceAfter: 6,
});
s.addNotes("Slide de rezervă pentru întrebări — surse complete pentru toate cifrele din pitch.");

pres.writeFile({ fileName: "c:/Users/HOME/Desktop/Biometric/presentation/MAIA_pitch.pptx" }).then((fn) => {
  console.log("SAVED:", fn);
});
