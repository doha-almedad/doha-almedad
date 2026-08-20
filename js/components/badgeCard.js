
/* =========================================================
   دوحة المداد — badgeCard.js
   مكوّن بطاقة الوسام: عرض الحالة — رمز وسام حقيقي عند الفتح،
   ورمز قفل عند عدم الاستحقاق بعد. الأوسمة المفتوحة تُعرض أولاً.
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

/** يُعيد HTML لبطاقة وسام واحدة، مع data-badge-id لربط الحدث لاحقاً */
export function renderBadgeCard(described){
  return `
    <div class="card card--hover badge-card ${described.unlocked ? "is-unlocked" : "is-locked"}" data-badge-id="${described.id}" role="button" tabindex="0">
      <div class="badge-card__icon">${icon(described.unlocked ? "medal" : "lock", { size: described.unlocked ? 30 : 22 })}</div>
      <div class="badge-card__name">${described.name}</div>
      <div class="badge-card__desc">${described.text}</div>
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
