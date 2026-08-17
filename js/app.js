// ============================================================
// دوحة المداد — التطبيق الرئيسي
// js/app.js
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
  renderApp();
  setupGlobalEvents();

  if (window.Router) {
    setupRoutes();
    Router.start();
  }
}


// ============================================================
// Routes
// ============================================================

function setupRoutes() {

  Router.register("/", renderHome);

  Router.register("/members", () => renderSimplePage(
    "الأعضاء",
    "اكتشفي أعضاء دوحة المداد"
  ));

  Router.register("/events", () => renderSimplePage(
    "الفعاليات والأنشطة",
    "مساحة تجمع فعاليات المجتمع الأدبي"
  ));

  Router.register("/statistics", () => renderSimplePage(
    "الإحصائيات",
    "تابعي رحلتك الأدبية وتطور نشاطك في المجتمع"
  ));

  Router.register("/titles", () => renderSimplePage(
    "الألقاب",
    "الأوسمة والإنجازات الأدبية"
  ));

  Router.register("/articles", () => renderSimplePage(
    "المقالات والدروس",
    "مساحة المعرفة والإلهام الأدبي"
  ));

  Router.register("/profile", () => renderSimplePage(
    "الملف الشخصي",
    "مساحتك في دوحة المداد"
  ));

  Router.register("/settings", () => renderSimplePage(
    "الإعدادات",
    "إعدادات الحساب والخصوصية"
  ));

  Router.register("/404", () => renderSimplePage(
    "الصفحة غير موجودة",
    "يبدو أن هذه الصفحة غير متاحة حاليًا."
  ));
}


// ============================================================
// App Container
// ============================================================

function renderApp() {

  const app = document.getElementById("app");

  if (!app) return;

  app.innerHTML = `
    ${Components.navigation()}

    <main id="page-content"></main>

    ${Components.footer()}
  `;

  Components.init();
}


// ============================================================
// الصفحة الرئيسية
// ============================================================

function renderHome() {

  const container = document.getElementById("page-content");

  if (!container) return;

  container.innerHTML = `

    <section class="hero section-home">

      <div class="container hero-inner">

        <div class="hero-content">

          <span class="hero-label">
            دوحة المداد
          </span>

          <h1>
            مرحبًا بكِ في
            <span>دوحة المداد</span>
          </h1>

          <p>
            مساحة أدبية تجمع القارئات والكاتبات،
            وتمنح الشغف الأدبي مكانًا للنمو والمشاركة والإبداع.
          </p>

          <div class="hero-actions">

            <a
              href="/members"
              data-route
              class="primary-button">
              استكشفي دوحة المداد
            </a>

          </div>

        </div>

        <div class="hero-decoration" aria-hidden="true">

          <div class="hero-book">
            <span></span>
            <span></span>
          </div>

          <div class="hero-star hero-star-one">✦</div>
          <div class="hero-star hero-star-two">✧</div>
          <div class="hero-star hero-star-three">·</div>

        </div>

      </div>

    </section>


    <section class="home-sections">

      <div class="container">

        <div class="section-heading">

          <span>اكتشفي المجتمع</span>

          <h2>
            مساحات دوحة المداد
          </h2>

          <p>
            تنقلي بين مساحات المجتمع واكتشفي ما يناسب رحلتك الأدبية.
          </p>

        </div>


        <div class="section-grid">

          ${homeSectionCard(
            "الكتابة",
            "مساحة الكتابات والمشاركات الأدبية في المجتمع.",
            "/writing",
            "writing"
          )}

          ${homeSectionCard(
            "القراءة",
            "اكتشفي الكتب والقراءات والمراجعات التي يشاركها الأعضاء.",
            "/reading",
            "reading"
          )}

          ${homeSectionCard(
            "المقالات والدروس",
            "مقالات ودروس تساعدك على توسيع معرفتك الأدبية.",
            "/articles",
            "articles"
          )}

          ${homeSectionCard(
            "الفعاليات والأنشطة",
            "تحديات وفعاليات ومساحات تجمع أعضاء المجتمع.",
            "/events",
            "activities"
          )}

        </div>

      </div>

    </section>


    <section class="home-community">

      <div class="container">

        <div class="community-box">

          <div>

            <span class="section-label">
              المجتمع
            </span>

            <h2>
              للحرف مكان،
              وللشغف مجتمع.
            </h2>

            <p>
              شاركي، اقرئي، اكتشفي، وتابعي رحلتك الأدبية
              وسط مجتمع يشاركك الاهتمام نفسه.
            </p>

          </div>

          <a
            href="/members"
            data-route
            class="secondary-button">
            اكتشفي الأعضاء
          </a>

        </div>

      </div>

    </section>

  `;

  Components.init();
}


// ============================================================
// بطاقة قسم في الرئيسية
// ============================================================

function homeSectionCard(title, description, route, theme) {

  return `

    <a
      href="${route}"
      data-route
      class="home-section-card section-${theme}">

      <div class="home-section-icon" aria-hidden="true">
        ${getSectionSymbol(theme)}
      </div>

      <div>

        <h3>
          ${title}
        </h3>

        <p>
          ${description}
        </p>

      </div>

      <span
        class="home-section-arrow"
        aria-hidden="true">
        ←
      </span>

    </a>

  `;
}


// ============================================================
// رموز الأقسام
// ============================================================

function getSectionSymbol(theme) {

  const symbols = {

    writing: "✒",

    reading: "▤",

    articles: "✦",

    activities: "◇"

  };

  return symbols[theme] || "✦";
}


// ============================================================
// الصفحات المؤقتة
// ============================================================

function renderSimplePage(title, description) {

  const container = document.getElementById("page-content");

  if (!container) return;

  container.innerHTML = `

    <section class="inner-page">

      <div class="container">

        ${Components.backButton()}

        ${Components.pageHeader(title, description)}

        <div class="coming-section">

          <div class="coming-icon" aria-hidden="true">
            ✦
          </div>

          <h2>
            ${title}
          </h2>

          <p>
            هذه المساحة سنبنيها لاحقًا
            وربطها بالبيانات والتفاعل الحقيقي.
          </p>

        </div>

      </div>

    </section>

  `;

  Components.init();
}


// ============================================================
// الأحداث العامة
// ============================================================

function setupGlobalEvents() {

  window.addEventListener("popstate", () => {

    if (window.Router) {
      Router.render();
    }

  });

}


// ============================================================
// أدوات التطبيق
// ============================================================

window.App = {

  navigate(path) {

    if (window.Router) {
      Router.navigate(path);
    }

  },

  back() {

    if (window.Router) {
      Router.back();
    } else {
      history.back();
    }

  },

  refresh() {
    renderApp();

    if (window.Router) {
      Router.render();
    }
  }

};
