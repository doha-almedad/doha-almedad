/* =========================================================
   دوحة المداد — badgeCard.js
   مكوّن بطاقة الوسام بشكل سداسي (Hexagon) — رمز حقيقي بريّاق
   عند الفتح، والأوسمة المفتوحة تُعرض أولاً
   ========================================================= */

import { openModal } from "./modals.js";
import { icon } from "./icons.js";

/** يرتّب قائمة أوسمة موصوفة بحيث تتصدّر المفتوحة، ثم الأقرب للاكتمال */
export function sortBadgesUnlockedFirst(describedList){
  return [...describedList].sort((a, b) => {
    if(a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    if(a.unlocked) return new Date(b.unlockedAt) - new Date(a.unlockedAt);
    return b.progressRatio - a.progressRatio;
  });
}

/** يُعيد HTML لوسام سداسي واحد، مع data-badge-id لربط الحدث لاحقاً */
export function renderBadgeCard(described){
  const center = described.unlocked
    ? (described.image ? `<img src="${described.image}" alt="">` : icon(described.icon || "medal", { size:28 }))
    : icon("lock", { size:20 });
  return `
    <div class="badge-hex ${described.unlocked ? "is-unlocked" : "is-locked"}" data-badge-id="${described.id}" role="button" tabindex="0" style="--badge-color:${described.color || "#C98A2E"}">
      <div class="badge-hex__shape"><div class="badge-hex__center">${center}</div></div>
      <div class="badge-hex__name">${described.name}</div>
    </div>
  `;
}

function openBadgeDetail(described){
  const pct = Math.round(described.progressRatio * 100);
  openModal(`
    <div class="modal-box__head">
      <h3 style="display:flex;align-items:center;gap:8px;">${icon(described.unlocked ? "medal" : "lock", { size: 20 })} ${described.name}</h3>
      <button class="modal-close" data-close>${icon("close", { size: 18 })}</button>
    </div>
    <div class="badge-detail-preview" style="--badge-color:${described.color || "#C98A2E"}">
      <div>${described.unlocked ? (described.image ? `<img src="${described.image}" alt="${described.name}">` : icon(described.icon || "medal", {size:38})) : icon("lock", {size:28})}</div>
    </div>
    <p style="font-size:1.02rem;color:var(--paper);">${described.text}</p>
    ${!described.unlocked ? `
      <div class="progress" style="margin:14px 0 6px;"><div class="progress__bar" style="width:${pct}%"></div></div>
      <div class="text-muted" style="font-size:.8rem;">${described.progressValue} من ${described.progressTarget}</div>
    ` : `
      <div class="badge-pill badge-pill--gold" style="margin-top:10px;">فُتح بتاريخ ${new Date(described.unlockedAt).toLocaleDateString("ar")}</div>
    `}
  `);
}

/** يربط أحداث النقر/لوحة المفاتيح على كل بطاقات الأوسمة ضمن حاوية معيّنة */
export function bindBadgeCards(container, describedList){
  container.querySelectorAll("[data-badge-id]").forEach(cardEl => {
    const id = cardEl.getAttribute("data-badge-id");
    const described = describedList.find(b => b.id === id);
    if(!described) return;
    const open = () => openBadgeDetail(described);
    cardEl.addEventListener("click", open);
    cardEl.addEventListener("keydown", (e) => { if(e.key === "Enter" || e.key === " "){ e.preventDefault(); open(); } });
  });
}
