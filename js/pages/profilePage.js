/* =========================================================
   دوحة المداد — profilePage.js
   7. صفحة البروفايل: حماسة الأدب، الأوسمة، وقاعدة إخفاء الصفر
   ========================================================= */

import { store } from "../db/store.js";
import { streakService } from "../services/streakService.js";
import { badgeService } from "../services/badgeService.js";
import { renderBadgeCard, bindBadgeCards, sortBadgesUnlockedFirst } from "../components/badgeCard.js";
import { xpProgressWithinLevel } from "../services/rewardEngine.js";
import { getLeaderboard } from "../services/rewardEngine.js";
import { icon, initial, publicRoleLabel, parseSocialLink } from "../components/icons.js";
import { openModal, closeModal, showToast } from "../components/modals.js";

let showAllBadges = false;

function miniStat(value, label, iconName){
  if(!value) return "";
  return `<div class="mini-stat"><span class="mini-stat__icon">${icon(iconName, { size: 16 })}</span><b>${value.toLocaleString("ar")}</b><span>${label}</span></div>`;
}

function activeDaysCount(user){
  return Object.values(user.activityLog || {}).filter(n => n > 0).length;
}

function heatmapGridHtml(user){
  const { weeks, monthMarkers, weekdayLabels } = streakService.buildHeatmapWeeks(user, 30);
  const monthRow = weeks.map((_, w) => {
    const marker = monthMarkers.find(m => m.week === w);
    return `<div class="ink-heatmap2__month">${marker ? marker.label : ""}</div>`;
  }).join("");

  const dayRows = weekdayLabels.map((label, row) => {
    const cells = weeks.map(week => {
      const c = week[row];
      if(!c) return `<div class="ink-heatmap2__cell ink-heatmap2__cell--empty"></div>`;
      return `<div class="ink-heatmap2__cell" data-level="${c.level}" title="${c.date} · ${c.count} نشاط"></div>`;
    }).join("");
    return `<div class="ink-heatmap2__row"><span class="ink-heatmap2__label">${label}</span><div class="ink-heatmap2__cells">${cells}</div></div>`;
  }).join("");

  return `
    <div class="ink-heatmap2">
      <div class="ink-heatmap2__months"><span class="ink-heatmap2__label"></span><div class="ink-heatmap2__months-track">${monthRow}</div></div>
      ${dayRows}
    </div>
  `;
}

function socialLinkPill(rawUrl){
  const parsed = parseSocialLink(rawUrl);
  if(!parsed) return "";
  return `<a href="${parsed.url}" target="_blank" rel="noopener" class="badge-pill profile-social-pill">${icon(parsed.platform, { size: 13 })}<span>@${parsed.handle}</span></a>`;
}

function openEditProfileModal(user, root, userId){
  openModal(`
    <div class="modal-box__head"><h3>تعديل الملف الشخصي</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div class="field"><label>الاسم</label><input type="text" id="edit-name" value="${user.displayName}"></div>
    <div class="field"><label>نبذة عنك</label><textarea id="edit-bio" placeholder="اكتب نبذة قصيرة...">${user.bio || ""}</textarea></div>
    <div class="field">
      <label>رابط حساب التواصل الاجتماعي (اختياري)</label>
      <input type="text" id="edit-social" placeholder="https://instagram.com/username" value="${user.socialUrl || ""}">
      <div class="field-hint">يُعرض تلقائياً باسم المستخدم مع أيقونة المنصة.</div>
    </div>
    <button class="btn btn-primary btn-block" id="save-profile-btn">حفظ التغييرات</button>
  `, {
    onMount(box){
      box.querySelector("#save-profile-btn").addEventListener("click", () => {
        const displayName = box.querySelector("#edit-name").value.trim();
        const bio = box.querySelector("#edit-bio").value.trim();
        const socialUrl = box.querySelector("#edit-social").value.trim();
        if(!displayName) return;
        store.updateUser(user.id, { displayName, bio, socialUrl });
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
  const rank = getLeaderboard().findIndex(u => u.id === user.id) + 1;

  const stats = user.stats;
  const miniStats = [
    miniStat(stats.wordsWritten, "الكلمات المكتوبة", "quill"),
    miniStat(stats.booksPublished, "الكتب المنشورة", "book"),
    miniStat(stats.booksRead, "الكتب المقروءة", "book"),
    miniStat(Object.keys(user.badges || {}).length, "الأوسمة", "medal"),
  ].filter(Boolean);

  const describedBadges = sortBadgesUnlockedFirst(badgeService.describeAllForUser(user));
  const visibleBadges = showAllBadges ? describedBadges : describedBadges.slice(0, 7);
  const userPosts = store.getPosts().filter(p => p.authorId === user.id).slice(0, 3);
  const prog = xpProgressWithinLevel(user);

  root.innerHTML = `
    <section class="section">
      <div class="container container--narrow">

        <div class="card profile-head-v2">
          <div class="avatar avatar--xl">${initial(user.displayName)}</div>
          <h2 class="profile-head-v2__name">${user.displayName}</h2>
          <div class="profile-head-v2__handle">@${user.username}</div>
          ${roleTag ? `<div class="profile-head-v2__role">${icon("shield", { size: 13 })}<span>${roleTag}</span></div>` : ""}

          <div class="profile-head-v2__progress">
            <div class="profile-head-v2__progress-label">${prog.into.toLocaleString("ar")} / ${prog.step.toLocaleString("ar")}</div>
            <div class="progress progress--wide"><div class="progress__bar" style="width:${prog.ratio*100}%"></div></div>
          </div>

          <div class="profile-head-v2__meta">
            <span>${icon("star", { size: 16 })} ${user.xp.toLocaleString("ar")} نقطة</span>
            <span class="profile-head-v2__divider"></span>
            <span>${icon("chart", { size: 16 })} #${rank} المركز</span>
          </div>

          ${isOwnProfile ? `<button class="btn btn-primary btn-sm" id="edit-profile-btn">${icon("feather", { size: 14 })}<span>تعديل الملف الشخصي</span></button>` : ""}
        </div>

        <div class="card profile-bio-card">
          <div class="profile-bio-card__head">${icon("document", { size: 16, cls: "heading-icon" })} نبذة العضو</div>
          <div class="profile-bio-card__body">
            <div class="profile-bio-card__text">
              ${user.bio ? `<p>${user.bio}</p>` : (isOwnProfile ? `<p class="text-muted">أضف نبذة عنك من زر التعديل أعلاه.</p>` : "")}
              ${user.socialUrl ? socialLinkPill(user.socialUrl) : ""}
            </div>
            ${miniStats.length ? `
              <div class="profile-bio-card__divider"></div>
              <div class="profile-bio-card__stats">${miniStats.join("")}</div>
            ` : ""}
          </div>
        </div>

        <div class="section-head">
          <h2>${icon("medal", { size: 20, cls: "heading-icon" })} الأوسمة</h2>
          <button class="btn btn-ghost btn-sm" id="toggle-badges-btn">${showAllBadges ? "عرض أقل" : "عرض جميع الأوسمة"}</button>
        </div>
        <div class="badge-hex-row" id="badges-grid">
          ${visibleBadges.map(renderBadgeCard).join("")}
        </div>

        <div class="card profile-streak-card">
          <div class="profile-streak-card__head">
            <div class="profile-streak-card__stat"><b>${user.longestStreak || 0}</b><span>أطول سلسلة</span></div>
            <div class="profile-streak-card__stat"><b>${user.streak || 0}</b><span>السلسلة الحالية</span></div>
            <div class="profile-streak-card__total">
              <b>${activeDaysCount(user).toLocaleString("ar")}</b>
              <span>${icon("flame", { size: 16 })} يوماً نشطاً</span>
            </div>
          </div>
          ${heatmapGridHtml(user)}
        </div>

        ${userPosts.length ? `
          <div class="section-head" style="margin-top:34px;"><h2>${icon("document", { size: 20, cls: "heading-icon" })} آخر منشورات ${user.displayName}</h2></div>
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
