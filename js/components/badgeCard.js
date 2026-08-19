/* =========================================================
   دوحة المداد — badgeCard.js
   مكوّن بطاقة الوسام: عرض الحالة 🔓 مفتوح / 🔒 مقفل
   ========================================================= */

import { openModal } from "./modals.js";

/** يُعيد HTML لبطاقة وسام واحدة، مع data-badge-id لربط الحدث لاحقاً */
export function renderBadgeCard(described){
  return `
    <div class="card card--hover badge-card ${described.unlocked ? "" : "is-locked"}" data-badge-id="${described.id}" role="button" tabindex="0">
      <span class="badge-card__state">${described.unlocked ? "🔓" : "🔒"}</span>
      <div class="badge-card__icon">${described.icon}</div>
      <div class="badge-card__name">${described.name}</div>
      <div class="badge-card__desc">${described.text}</div>
    </div>
  `;
}

function openBadgeDetail(described){
  const pct = Math.round(described.progressRatio * 100);
  openModal(`
    <div class="modal-box__head">
      <h3>${described.icon} ${described.name}</h3>
      <button class="modal-close" data-close>✕</button>
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
