/* =========================================================
   دوحة المداد — eventDetailsPage.js
   8. تفاصيل الفعالية: الصفحة المستقلة للفعالية وآليات الإثبات الـ 4
   ========================================================= */

import { store } from "../db/store.js";
import { processActivity } from "../services/rewardEngine.js";
import { showToast, bindParticipantLinks } from "../components/modals.js";
import { icon, initial, publicRoleLabel, arNum } from "../components/icons.js";

const VERIFY_INFO = {
  automatic: {
    ic: "chart", title: "التحقّق التلقائي",
    desc: "يتحقّق النظام برمجياً وفورياً من بيانات نشاطك داخل المنصة، مثل عدد الكلمات المكتوبة، دون حاجة لأي إجراء إضافي منك."
  },
  select_existing_content: {
    ic: "book", title: "اختيار من أعمالك",
    desc: "اختر من قائمة أعمالك الأدبية المنشورة سابقاً على المنصة العمل المناسب لهذه الفعالية."
  },
  manual_submission: {
    ic: "document", title: "إثبات خارجي",
    desc: "للأنشطة التي تمت خارج المنصة، أرفق وصفاً أو رابطاً يوثّق إتمامك للنشاط."
  },
  admin_verification: {
    ic: "shield", title: "الاعتماد الإداري",
    desc: "تخضع مشاركتك لمراجعة إدارة الفعالية، وتبقى حالة الإنجاز «بانتظار التحقق» حتى اعتمادها."
  }
};

function submissionForm(ev, user){
  const posts = store.getPosts().filter(p => p.authorId === user.id);

  if(ev.verificationMethod === "automatic"){
    return `<p class="text-muted">لا حاجة لأي إجراء — سيُحتسب تقدّمك تلقائياً كلما نشرت وكتبت ضمن المنصة.</p>`;
  }

  if(ev.verificationMethod === "select_existing_content"){
    return `
      <div class="field">
        <label>اختر عملاً من أعمالك المنشورة</label>
        <select id="select-content">
          <option value="">— اختر —</option>
          ${posts.map(p => `<option value="${p.id}">${p.title}</option>`).join("")}
        </select>
      </div>
      <button class="btn btn-primary btn-sm" id="submit-proof-btn">إرسال</button>
    `;
  }

  if(ev.verificationMethod === "manual_submission"){
    return `
      <div class="field"><label>وصف أو رابط الإثبات</label><input type="text" id="manual-proof" placeholder="مثال: رابط تسجيل الأمسية أو وصف مختصر"></div>
      <button class="btn btn-primary btn-sm" id="submit-proof-btn">إرسال الإثبات</button>
    `;
  }

  if(ev.verificationMethod === "admin_verification"){
    const existing = store.getEventSubmissions().find(s => s.eventId === ev.id && s.userId === user.id);
    if(existing){
      const map = { pending: "status-pill--pending", approved: "status-pill--approved", rejected: "status-pill--rejected" };
      const label = { pending: "بانتظار التحقق", approved: "معتمَد", rejected: "مرفوض" };
      return `<span class="status-pill ${map[existing.status]}">${label[existing.status]}</span>`;
    }
    return `
      <div class="field"><label>وصف مشاركتك</label><textarea id="admin-proof" placeholder="اشرح بإيجاز إنجازك ليتم اعتماده"></textarea></div>
      <button class="btn btn-primary btn-sm" id="submit-proof-btn">إرسال للمراجعة</button>
    `;
  }
  return "";
}

export function renderEventDetailsPage(root, eventId){
  const ev = store.getEvent(eventId);
  const user = store.getCurrentUser();

  if(!ev){
    root.innerHTML = `<div class="container section"><div class="empty-state"><div class="empty-state__icon">${icon("search", { size: 26 })}</div><p>لم يُعثر على هذه الفعالية.</p></div></div>`;
    return;
  }

  const info = VERIFY_INFO[ev.verificationMethod];
  const joined = ev.participants.includes(user.id);
  const organizer = ev.organizerId ? store.getUser(ev.organizerId) : null;

  root.innerHTML = `
    <section class="section">
      <div class="container">
        <a href="#/events" class="text-muted" style="font-size:.85rem;display:inline-flex;align-items:center;gap:6px;">${icon("chevronRight", { size: 14 })}<span>العودة إلى الفعاليات</span></a>

        <div class="card event-detail-head" style="margin-top:16px;">
          <div class="event-detail-head__badges">
            <span class="badge-pill badge-pill--gold">${icon(info.ic, { size: 14 })} ${info.title}</span>
            <span class="badge-pill">${icon("users", { size: 14 })} ${arNum(ev.participants.length)} مشارك</span>
          </div>
          <h1>${ev.title}</h1>
          <p>${ev.description}</p>
          <div class="text-muted" style="font-size:.85rem;">من ${new Date(ev.startDate).toLocaleDateString("ar")} إلى ${new Date(ev.endDate).toLocaleDateString("ar")}</div>
        </div>

        <div class="event-detail-grid">
          <div>
            <div class="card" style="margin-bottom:20px;">
              <h3>آلية الإثبات</h3>
              <div class="verify-method">
                <span class="verify-method__icon">${icon(info.ic, { size: 20 })}</span>
                <div><b>${info.title}</b><p style="margin:4px 0 0;">${info.desc}</p></div>
              </div>
            </div>

            <div class="card" id="proof-panel">
              <h3>${joined ? "أثبت مشاركتك" : "انضمّ أولاً للمشاركة"}</h3>
              ${joined ? submissionForm(ev, user) : `<button class="btn btn-primary" id="join-btn">انضمام إلى الفعالية</button>`}
            </div>
          </div>

          <div class="card">
            <h3>${icon("users", { size: 16, cls: "heading-icon" })} عدد المشاركين</h3>
            <div class="text-center" style="padding:10px 0;">
              <div style="font-family:var(--font-display);font-size:2.2rem;color:var(--gold);">${arNum(ev.participants.length)}</div>
              <div class="text-muted" style="font-size:.82rem;">عضو مشارك</div>
            </div>
            ${organizer ? `
              <div class="divider"></div>
              <div class="text-muted" style="font-size:.82rem;margin-bottom:8px;">المسؤول عن الفعالية</div>
              <div style="display:flex;align-items:center;gap:10px;" class="participant-link" data-user-id="${organizer.id}">
                <div class="avatar avatar--sm">${initial(organizer.displayName)}</div>
                <span>${organizer.displayName}</span>
                ${publicRoleLabel(organizer.role) ? `<span class="badge-pill badge-pill--sage">${publicRoleLabel(organizer.role)}</span>` : ""}
              </div>
            ` : ""}
          </div>
        </div>
      </div>
    </section>
  `;

  bindParticipantLinks(root);

  root.querySelector("#join-btn")?.addEventListener("click", () => {
    store.joinEvent(ev.id, user.id);
    processActivity(user.id, "join_event", { eventId: ev.id });
    showToast("انضممت إلى الفعالية");
    renderEventDetailsPage(root, eventId);
  });

  root.querySelector("#submit-proof-btn")?.addEventListener("click", () => {
    if(ev.verificationMethod === "select_existing_content"){
      const val = root.querySelector("#select-content").value;
      if(!val){ showToast("يرجى اختيار عمل أولاً"); return; }
      processActivity(user.id, "submit_event_proof", { eventId: ev.id, postId: val });
      showToast("أُرسل عملك واحتُسبت مشاركتك");
    }
    if(ev.verificationMethod === "manual_submission"){
      const val = root.querySelector("#manual-proof").value.trim();
      if(!val){ showToast("يرجى إدخال وصف أو رابط الإثبات"); return; }
      processActivity(user.id, "submit_event_proof", { eventId: ev.id, proof: val });
      showToast("أُرسل إثباتك واحتُسبت مشاركتك");
    }
    if(ev.verificationMethod === "admin_verification"){
      const val = root.querySelector("#admin-proof").value.trim();
      if(!val){ showToast("يرجى وصف مشاركتك أولاً"); return; }
      store.submitEventProof(ev.id, user.id, { text: val });
      showToast("أُرسلت مشاركتك — بانتظار اعتماد الإدارة");
    }
    renderEventDetailsPage(root, eventId);
  });
}
