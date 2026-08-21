/* =========================================================
   دوحة المداد — leaderboardPage.js
   5. قسم الإحصائيات: رسوم بيانية عامة + قائمة المتصدرين
   ========================================================= */

import { store } from "../db/store.js";
import { badgeService } from "../services/badgeService.js";
import { getLeaderboard } from "../services/rewardEngine.js";
import { icon, initial } from "../components/icons.js";

const MONTH_NAMES = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

function barChart(labels, values, { width = 560, height = 200, color = "var(--gold)" } = {}){
  const max = Math.max(1, ...values);
  const barW = width / values.length;
  const bars = values.map((v, i) => {
    const h = (v / max) * (height - 30);
    const x = i * barW + barW * 0.2;
    const y = height - h - 22;
    return `
      <rect x="${x}" y="${y}" width="${barW * 0.6}" height="${h}" rx="4" fill="${color}" opacity="${0.55 + 0.45 * (v/max)}"></rect>
      <text x="${x + barW*0.3}" y="${height - 6}" text-anchor="middle" font-size="10" fill="var(--paper-faint)">${labels[i]}</text>
    `;
  }).join("");
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" class="mini-chart">${bars}</svg>`;
}

function donutChart(segments, { size = 180, thickness = 22 } = {}){
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const circles = segments.map(seg => {
    const frac = seg.value / total;
    const dash = frac * circumference;
    const el = `<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${seg.color}"
      stroke-width="${thickness}" stroke-dasharray="${dash} ${circumference - dash}"
      stroke-dashoffset="${-offset}" transform="rotate(-90 ${size/2} ${size/2})"></circle>`;
    offset += dash;
    return el;
  }).join("");
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${circles}</svg>`;
}

function monthlyProductionThisYear(){
  const now = new Date();
  const upto = now.getMonth();
  const months = [];
  for(let m = 0; m <= upto; m++) months.push({ m, label: MONTH_NAMES[m] });
  const all = [...store.getPosts(), ...store.getReviews()];
  const counts = months.map(({ m }) => all.filter(item => {
    const d = new Date(item.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === m;
  }).length);
  return { labels: months.map(mo => mo.label), counts };
}

function statCard(iconName, value, label){
  return `<div class="card stat-box stat-box--stats"><span class="stat-box__icon">${icon(iconName, { size: 17 })}</span><b>${value.toLocaleString("ar")}</b><span>${label}</span></div>`;
}

export function renderLeaderboardPage(root){
  const currentUser = store.getCurrentUser();
  const ranked = getLeaderboard();
  const users = store.getUsers();

  const totalMembers = users.length;
  const totalEvents = store.getEvents().length;
  const totalArticles = store.getArticles().length;
  const totalBooksRead = users.reduce((s,u) => s + u.stats.booksRead, 0);
  const totalTexts = store.getPosts().length;
  const totalBadges = users.reduce((s,u) => s + Object.keys(u.badges || {}).length, 0);
  const totalWords = users.reduce((s,u) => s + u.stats.wordsWritten, 0);
  const totalXp = users.reduce((s,u) => s + u.xp, 0);

  const postsCount = store.getPosts().length;
  const reviewsCount = store.getReviews().length;
  const { labels, counts } = monthlyProductionThisYear();
  const hasActivity = postsCount + reviewsCount > 0;

  root.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">مرآة المجتمع</span><h1>${icon("chart", { size: 26, cls: "heading-icon" })} الإحصائيات</h1></div>
        </div>

        <div class="grid grid-4 stats-grid--stats" id="stats-cards" style="margin-bottom:34px;">
          ${statCard("users", totalMembers, "عدد الأعضاء")}
          ${statCard("calendar", totalEvents, "عدد الفعاليات")}
          ${statCard("document", totalArticles, "عدد المقالات")}
          ${statCard("book", totalBooksRead, "الكتب المقروءة")}
          ${statCard("feather", totalTexts, "عدد النصوص")}
          ${statCard("medal", totalBadges, "الأوسمة المكتسبة")}
          ${statCard("quill", totalWords, "مجموع الكلمات")}
          ${statCard("star", totalXp, "مجموع النقاط")}
        </div>

        <div class="grid grid-2" style="margin-bottom:34px;align-items:stretch;">
          <div class="card">
            <h3 style="margin-bottom:14px;">الإنتاج السنوي</h3>
            ${hasActivity ? barChart(labels, counts) : `<p class="text-muted">لا نشاط كافٍ بعد لعرض الرسم البياني.</p>`}
          </div>
          <div class="card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
            <h3 style="margin-bottom:14px;">توزيع المساهمات</h3>
            ${hasActivity ? `
              ${donutChart([
                { label: "كتابة", value: postsCount, color: "var(--gold)" },
                { label: "قراءة", value: reviewsCount, color: "var(--sage)" },
              ])}
              <div style="display:flex;gap:16px;margin-top:12px;font-size:.82rem;">
                <span><span class="legend-dot" style="background:var(--gold);"></span> كتابة (${postsCount})</span>
                <span><span class="legend-dot" style="background:var(--sage);"></span> قراءة (${reviewsCount})</span>
              </div>
            ` : `<p class="text-muted">لا مساهمات بعد لعرض التوزيع.</p>`}
          </div>
        </div>

        <div class="section-head"><h2>${icon("users", { size: 20, cls: "heading-icon" })} صدارة الأعضاء</h2></div>
        <div class="card">
          ${ranked.map((u, i) => `
            <div class="leader-row ${u.id === currentUser.id ? "leader-row--me" : ""}">
              <div class="leader-row__rank">${i+1}</div>
              <div class="leader-row__user">
                <div class="avatar avatar--sm">${initial(u.displayName)}</div>
                <div>
                  <div>${u.displayName}${u.id === currentUser.id ? ' <span class="text-muted" style="font-size:.75rem;">(أنت)</span>' : ""}</div>
                  <div class="text-muted" style="font-size:.78rem;">المستوى ${u.level}</div>
                </div>
              </div>
              <div class="leader-row__xp">${u.xp} XP</div>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}
