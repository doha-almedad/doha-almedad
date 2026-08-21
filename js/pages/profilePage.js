/* =========================================================
   دوحة المداد — profilePage.js
   7. صفحة البروفايل: حماسة الأدب، الأوسمة، وقاعدة إخفاء الصفر
   ========================================================= */

import { store } from "../db/store.js";
import { streakService } from "../services/streakService.js";
import { badgeService } from "../services/badgeService.js";
import { renderBadgeCard, bindBadgeCards, sortBadgesUnlockedFirst } from "../components/badgeCard.js";
import { xpProgressWithinLevel } from "../services/rewardEngine.js";
import { icon, initial, publicRoleLabel } from "../components/icons.js";
import { openModal, closeModal, showToast } from "../components/modals.js";

let showAllBadges = false;

function statBox(value, label, iconName){
  // قاعدة إخفاء الصفر: أي إحصائية قيمتها 0 تُخفى تلقائياً ولا تُعرض إطلاقاً
  if(!value) return "";
  return `<div class="card stat-box"><span class="stat-box__icon">${icon(iconName, { size: 18 })}</span><b>${value.toLocaleString("ar")}</b><span>${label}</span></div>`;
}

function heatmapHtml(user){
  const cells = streakService.buildHeatmapCells(user, 84);
  return `<div class="ink-heatmap">${cells.map(c =>
    `<div class="ink-heatmap__cell" data-level="${c.level}" title="${c.date} · ${c.count} نشاط"></div>`
  ).join("")}</div>`;
}

function activeDaysCount(user){
  return Object.values(user.activityLog || {}).filter(n => n > 0).length;
}

function socialLink(handle){
  const clean = handle.replace(/^@/, "").trim();
  return `<a href="https://x.com/${clean}" target="_blank" rel="noopener" class="badge-pill profile-head__social">${icon("send", { size: 12 })}@${clean}</a>`;
}

function openEditProfileModal(user, root, userId){
  openModal(`
    <div class="modal-box__head"><h3>تعديل الملف الشخصي</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div class="field"><label>الاسم</label><input type="text" id="edit-name" value="${user.displayName}"></div>
    <div class="field"><label>نبذة عنك</label><textarea id="edit-bio" placeholder="اكتب نبذة قصيرة...">${user.bio || ""}</textarea></div>
    <div class="field"><label>حساب التواصل الاجتماعي (اختياري)</label><input type="text" id="edit-social" placeholder="username@" value="${user.socialHandle || ""}"></div>
    <button class="btn btn-primary btn-block" id="save-profile-btn">حفظ التغييرات</button>
  `, {
    onMount(box){
      box.querySelector("#save-profile-btn").addEventListener("click", () => {
        const displayName = box.querySelector("#edit-name").value.trim();
        const bio = box.querySelector("#edit-bio").value.trim();
        const socialHandle = box.querySelector("#edit-social").value.trim();
        if(!displayName) return;
        store.updateUser(user.id, { displayName, bio, socialHandle });
        closeModal();
        showToast("تم تحديث ملفك الشخصي");
        renderProfilePage(root, userId);
      });
    }
  });
}

export function renderProfilePage(root, userId){
  const user = userId ? store.getUser(userId) : store.getCurrentUser();
  if(!user){
    root.innerHTML = `<div class="container section"><div class="empty-state">لم يُعثر على هذا العضو.</div></div>`;
    return;
  }
  const isOwnProfile = user.id === store.getCurrentUser().id;
  const roleTag = publicRoleLabel(user.role);

  const stats = user.stats;
  const statCards = [
    statBox(stats.wordsWritten, "كلمة مكتوبة", "quill"),
    statBox(stats.booksRead, "كتاب مقروء", "book"),
    statBox(stats.booksPublished, "عمل أدبي منشور", "feather"),
    statBox(stats.articlesPublished, "مقال منشور", "document"),
    statBox(stats.challengesJoined, "تحدٍّ خِيض", "target"),
    statBox(Object.keys(user.badges || {}).length, "وسام مكتسب", "medal"),
  ].filter(Boolean);

  const describedBadges = sortBadgesUnlockedFirst(badgeService.describeAllForUser(user));
  const visibleBadges = showAllBadges ? describedBadges : describedBadges.slice(0, 4);
  const userPosts = store.getPosts().filter(p => p.authorId === user.id).slice(0, 3);
  const prog = xpProgressWithinLevel(user);

  root.innerHTML = `
    <section class="section">
      <div class="container">

        <div class="card profile-head">
          <div class="avatar avatar--lg">${initial(user.displayName)}</div>
          <div class="profile-head__id">
            <div class="profile-head__name">
              <h2 style="margin:0;">${user.displayName}</h2>
              ${roleTag ? `<span class="badge-pill badge-pill--sage">${roleTag}</span>` : ""}
            </div>
            <div class="profile-head__handle">@${user.username} · انضم في ${new Date(user.joinedAt).toLocaleDateString("ar")}</div>
            ${user.bio || user.socialHandle ? `
              <div class="profile-head__bio">
                ${user.bio ? `<p>${user.bio}</p>` : ""}
                ${user.socialHandle ? socialLink(user.socialHandle) : ""}
              </div>
            ` : ""}
            <div class="profile-head__level">
              <span class="text-muted" style="font-size:.82rem;">المستوى ${user.level} · ${prog.into}/${prog.step} XP للمستوى التالي</span>
              <div class="progress"><div class="progress__bar" style="width:${prog.ratio*100}%"></div></div>
            </div>
            ${isOwnProfile ? `<button class="btn btn-outline btn-sm" id="edit-profile-btn" style="margin-top:12px;">${icon("feather", { size: 14 })}<span>تعديل الملف الشخصي</span></button>` : ""}
          </div>
          <div class="text-center">
            <div style="font-family:var(--font-display);font-size:1.6rem;color:var(--gold);">${user.xp}</div>
            <div class="text-muted" style="font-size:.78rem;">إجمالي نقاط الخبرة</div>
          </div>
        </div>

        ${statCards.length ? `<div class="grid grid-4 stats-grid">${statCards.join("")}</div>` : `<p class="zero-hint">لا إحصائيات لعرضها بعد — ابدأ أول نشاط أدبي لك.</p>`}

        <div class="section-head"><h2>${icon("flame", { size: 20, cls: "heading-icon" })} حماسة الأدب</h2></div>
        <div class="card streak-panel" style="margin-bottom:34px;">
          <div class="streak-panel__stats">
            <div class="streak-panel__stat"><b>${user.streak || 0}</b><span>السلسلة الحالية</span></div>
            <div class="streak-panel__stat"><b>${user.longestStreak || 0}</b><span>أطول سلسلة</span></div>
            <div class="streak-panel__stat"><b>${activeDaysCount(user)}</b><span>يوم نشِط</span></div>
          </div>
          <div class="streak-panel__map">
            ${heatmapHtml(user)}
          </div>
        </div>

        <div class="section-head">
          <h2>${icon("medal", { size: 20, cls: "heading-icon" })} الأوسمة</h2>
          <button class="btn btn-ghost btn-sm" id="toggle-badges-btn">${showAllBadges ? "عرض أقل" : "عرض الكل"}</button>
        </div>
        <div class="grid grid-4 profile-badges-grid" id="badges-grid">
          ${visibleBadges.map(renderBadgeCard).join("")}
        </div>

        ${userPosts.length ? `
          <div class="section-head" style="margin-top:40px;"><h2>${icon("document", { size: 20, cls: "heading-icon" })} آخر منشورات ${user.displayName}</h2></div>
          <div>
            ${userPosts.map(p => `
              <article class="card feed-item">
                <h3>${p.title}</h3>
                <p>${p.content.slice(0,160)}${p.content.length>160?"…":""}</p>
              </article>
            `).join("")}
          </div>
        ` : ""}

      </div>
    </section>
  `;

  bindBadgeCards(root.querySelector("#badges-grid"), describedBadges);

  root.querySelector("#toggle-badges-btn").addEventListener("click", () => {
    showAllBadges = !showAllBadges;
    renderProfilePage(root, userId);
  });

  root.querySelector("#edit-profile-btn")?.addEventListener("click", () => openEditProfileModal(user, root, userId));
}
