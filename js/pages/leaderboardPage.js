/* =========================================================
   دوحة المداد — leaderboardPage.js
   5. قسم الإحصائيات: رسوم بيانية عامة + قائمة المتصدرين
   ========================================================= */

import { store } from "../db/store.js";
import { getLeaderboard } from "../services/rewardEngine.js";
import { icon, initial } from "../components/icons.js";

const MONTH_NAMES = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

/** رسم بياني شريطي بسيط بصيغة SVG — بلا مكتبات خارجية */
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

/** رسم بياني دائري (Donut) بسيط عبر stroke-dasharray — بلا مكتبات خارجية */
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

function lastSixMonthsCounts(){
  const now = new Date();
  const months = [];
  for(let i = 5; i >= 0; i--){
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ y: d.getFullYear(), m: d.getMonth(), label: MONTH_NAMES[d.getMonth()] });
  }
  const all = [...store.getPosts(), ...store.getReviews()];
  const counts = months.map(({ y, m }) => all.filter(item => {
    const d = new Date(item.date);
    return d.getFullYear() === y && d.getMonth() === m;
  }).length);
  return { labels: months.map(mo => mo.label), counts };
}

export function renderLeaderboardPage(root){
  const ranked = getLeaderboard();
  const totalWords = store.getUsers().reduce((s,u) => s + u.stats.wordsWritten, 0);
  const totalBooks = store.getUsers().reduce((s,u) => s + u.stats.booksRead, 0);
  const totalEvents = store.getEvents().length;
  const postsCount = store.getPosts().length;
  const reviewsCount = store.getReviews().length;

  const { labels, counts } = lastSixMonthsCounts();
  const hasActivity = postsCount + reviewsCount > 0;

  root.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">مرآة المجتمع</span><h1>${icon("chart", { size: 26, cls: "heading-icon" })} الإحصائيات</h1></div>
        </div>

        <div class="grid grid-3 stats-grid" style="margin-bottom:34px;">
          <div class="card stat-box"><span class="stat-box__icon">${icon("quill", { size: 18 })}</span><b>${totalWords.toLocaleString("ar")}</b><span>كلمة مكتوبة في الدوحة</span></div>
          <div class="card stat-box"><span class="stat-box__icon">${icon("book", { size: 18 })}</span><b>${totalBooks.toLocaleString("ar")}</b><span>كتاب أُنهيت قراءته</span></div>
          <div class="card stat-box"><span class="stat-box__icon">${icon("calendar", { size: 18 })}</span><b>${totalEvents}</b><span>فعالية أدبية أُقيمت</span></div>
        </div>

        <div class="grid grid-2" style="margin-bottom:34px;align-items:stretch;">
          <div class="card">
            <h3 style="margin-bottom:14px;">النشاط خلال الأشهر الستة الأخيرة</h3>
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
            <div class="leader-row ${i===0?"leader-row--top1":i===1?"leader-row--top2":i===2?"leader-row--top3":""}">
              <div class="leader-row__rank">${i+1}</div>
              <div class="leader-row__user">
                <div class="avatar avatar--sm">${initial(u.displayName)}</div>
                <div>
                  <div>${u.displayName}</div>
                  <div class="text-muted" style="font-size:.78rem;">${u.literaryTitle} · المستوى ${u.level}</div>
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
