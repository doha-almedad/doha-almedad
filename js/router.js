/* =========================================================
   دوحة المداد — router.js
   موجّه الصفحات: محلّل الرابط والتنقل السلس بين الصفحات
   (Real Multipage Application عبر توجيه قائم على الـ hash،
   مناسب للاستضافة الساكنة على GitHub Pages بلا خادم خلفي)
   ========================================================= */

import { renderHeader } from "./components/header.js";
import { icon } from "./components/icons.js";
import { renderHomePage } from "./pages/homePage.js";
import { renderEventsPage, renderEventParticipantsPage } from "./pages/eventsPage.js";
import { renderEventDetailsPage } from "./pages/eventDetailsPage.js";
import { renderWritingPage, renderPostViewPage } from "./pages/writingPage.js";
import { renderReadingPage, renderReviewViewPage } from "./pages/readingPage.js";
import { renderArticlesPage, renderArticleViewPage } from "./pages/articlesPage.js";
import { renderProfilePage } from "./pages/profilePage.js";
import { renderAdminDashboardPage } from "./pages/adminDashboardPage.js";

const root = () => document.getElementById("app-root");

/** كل مسار: نمط بأجزاء ديناميكية تبدأ بـ ":" + الدالة المسؤولة عن العرض */
const ROUTES = [
  { pattern: "/",                render: (r) => renderHomePage(r) },
  { pattern: "/events",           render: (r) => renderEventsPage(r) },
  { pattern: "/events/:id",        render: (r, p) => renderEventDetailsPage(r, p.id) },
  { pattern: "/events/:id/participants", render: (r, p) => renderEventParticipantsPage(r, p.id) },
  { pattern: "/writing",          render: (r) => renderWritingPage(r) },
  { pattern: "/writing/:id",       render: (r, p) => renderPostViewPage(r, p.id) },
  { pattern: "/reading",          render: (r) => renderReadingPage(r) },
  { pattern: "/reading/:id",       render: (r, p) => renderReviewViewPage(r, p.id) },
  { pattern: "/articles",         render: (r) => renderArticlesPage(r) },
  { pattern: "/articles/:id",      render: (r, p) => renderArticleViewPage(r, p.id) },
  // إبقاء الرابط القديم متوافقاً مع النسخ المحفوظة، مع تحويله إلى الإدارة.
  { pattern: "/leaderboard",       render: (r) => renderAdminDashboardPage(r) },
  { pattern: "/profile",          render: (r) => renderProfilePage(r) },
  { pattern: "/profile/:id",       render: (r, p) => renderProfilePage(r, p.id) },
  { pattern: "/admin",            render: (r) => renderAdminDashboardPage(r) },
];

function matchRoute(path){
  for(const route of ROUTES){
    const patternParts = route.pattern.split("/").filter(Boolean);
    const pathParts = path.split("/").filter(Boolean);
    if(patternParts.length !== pathParts.length) continue;

    const params = {};
    const isMatch = patternParts.every((part, i) => {
      if(part.startsWith(":")){ params[part.slice(1)] = decodeURIComponent(pathParts[i]); return true; }
      return part === pathParts[i];
    });
    if(isMatch) return { route, params };
  }
  return null;
}

function currentPath(){
  const hash = window.location.hash || "#/";
  return hash.slice(1) || "/";
}

function notFoundPage(r){
  r.innerHTML = `
    <div class="container section text-center">
      <div class="empty-state">
        <div class="empty-state__icon">${icon("search", { size: 34 })}</div>
        <h2 style="justify-content:center;">الصفحة غير موجودة</h2>
        <p>لعل الرابط الذي اتّبعته قد تغيّر أو لم يعد قائمًا.</p>
        <a href="#/" class="btn btn-primary">العودة للرئيسية</a>
      </div>
    </div>
  `;
}

let lastActivePath = "#/";

function navigate(){
  const path = currentPath();
  const matched = matchRoute(path);
  const appRoot = root();

  if(matched){
    matched.route.render(appRoot, matched.params);
  }else{
    notFoundPage(appRoot);
  }

  const baseSegment = path.split("/").filter(Boolean)[0] || "";
  lastActivePath = "#/" + baseSegment;
  renderHeader(lastActivePath);
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  appRoot.focus();
}

export function initRouter(){
  window.addEventListener("hashchange", navigate);
  navigate();
}

/** يعيد رسم الشريط العلوي فقط دون إعادة تحميل الصفحة (يُستخدم عند تدوير الجهاز) */
export function rerenderCurrentHeader(){
  renderHeader(lastActivePath);
}

export function goTo(path){
  window.location.hash = path;
}
