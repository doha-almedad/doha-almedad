// ============================================================
// DOHAT AL-MIDAD — APP
// ============================================================

const app = document.getElementById("app");

const state = {
  currentPage: "/",
  mobileMenu: false,
  profile: {
    name: "عضوة دوحة المداد",
    username: "@member",
    bio: "مساحتي في المجتمع الأدبي.",
    points: 0,
    rank: null,
    words: 0,
    books: 0,
    reading: 0,
    badges: []
  }
};


// ============================================================
// DATA
// ============================================================

const sections = [
  {
    id: "writing",
    title: "الكتابة",
    text: "مساحة الكتابات والمشاركات الأدبية.",
    color: "writing"
  },
  {
    id: "reading",
    title: "القراءة",
    text: "اكتشفي الكتب والقراءات والمراجعات.",
    color: "reading"
  },
  {
    id: "articles",
    title: "المقالات والدروس",
    text: "معرفة وأفكار ودروس أدبية.",
    color: "articles"
  },
  {
    id: "activities",
    title: "الفعاليات والأنشطة",
    text: "تحديات وفعاليات المجتمع.",
    color: "activities"
  },
  {
    id: "members",
    title: "الأعضاء",
    text: "تعرّفي على أعضاء دوحة المداد.",
    color: "members"
  },
  {
    id: "statistics",
    title: "الإحصائيات",
    text: "تابعي رحلتك الأدبية.",
    color: "statistics"
  }
];


// ============================================================
// APP
// ============================================================

function render() {

  if (!app) {
    console.error("لم يتم العثور على #app");
    return;
  }

  app.innerHTML = `
    ${renderNavigation()}
    <main id="main-content"></main>
  `;

  renderPage();
  bindEvents();
}


// ============================================================
// NAVIGATION
// ============================================================

function renderNavigation() {

  return `
    <header class="site-header">

      <div class="nav-container">

        <a href="/" class="brand" data-link>
          <img
            src="assets/logo.png"
            alt="دوحة المداد"
            class="brand-logo"
            onerror="this.style.display='none'"
          />

          <span class="brand-name">
            دوحة المداد
          </span>
        </a>


        <nav class="desktop-nav">

          <a href="/" data-link>الرئيسية</a>

          <a href="/writing" data-link>الكتابة</a>

          <a href="/reading" data-link>القراءة</a>

          <a href="/articles" data-link>
            المقالات والدروس
          </a>

          <a href="/activities" data-link>
            الفعاليات والأنشطة
          </a>

          <a href="/statistics" data-link>
            الإحصائيات
          </a>

          <a href="/members" data-link>
            الأعضاء
          </a>

        </nav>


        <div class="nav-actions">

          <a
            href="/profile"
            data-link
            class="nav-profile">
            الملف الشخصي
          </a>

          <button
            class="mobile-menu-button"
            id="mobile-menu-button"
            aria-label="فتح القائمة">
            ☰
          </button>

        </div>

      </div>


      <div
        id="mobile-menu"
        class="mobile-menu">

        <a href="/" data-link>الرئيسية</a>
        <a href="/writing" data-link>الكتابة</a>
        <a href="/reading" data-link>القراءة</a>
        <a href="/articles" data-link>المقالات والدروس</a>
        <a href="/activities" data-link>الفعاليات والأنشطة</a>
        <a href="/statistics" data-link>الإحصائيات</a>
        <a href="/members" data-link>الأعضاء</a>
        <a href="/profile" data-link>الملف الشخصي</a>

      </div>

    </header>
  `;
}


// ============================================================
// PAGE ROUTER
// ============================================================

function getPath() {

  let path = window.location.pathname;

  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path || "/";
}


function renderPage() {

  const main = document.getElementById("main-content");

  if (!main) return;

  const path = getPath();

  state.currentPage = path;


  switch (path) {

    case "/":
      main.innerHTML = renderHome();
      break;

    case "/writing":
      main.innerHTML = renderWriting();
      break;

    case "/reading":
      main.innerHTML = renderReading();
      break;

    case "/articles":
      main.innerHTML = renderArticles();
      break;

    case "/activities":
      main.innerHTML = renderActivities();
      break;

    case "/statistics":
      main.innerHTML = renderStatistics();
      break;

    case "/members":
      main.innerHTML = renderMembers();
      break;

    case "/profile":
      main.innerHTML = renderProfile();
      break;

    default:
      main.innerHTML = renderNotFound();
  }
}


// ============================================================
// HOME
// ============================================================

function renderHome() {

  return `

    <section class="hero">

      <div class="hero-content">

        <span class="eyebrow">
          دوحة المداد
        </span>

        <h1>
          حيث يلتقي
          <span>الشغف الأدبي</span>
          بالمجتمع
        </h1>

        <p>
          مجتمع يجمع القارئات والكاتبات،
          ويصنع مساحة للإبداع والمعرفة والمشاركة.
        </p>

        <a
          href="/members"
          data-link
          class="primary-button">
          استكشفي المجتمع
        </a>

      </div>

      <div class="hero-art">

        <div class="book-art">
          <div></div>
          <div></div>
        </div>

      </div>

    </section>


    <section class="home-content">

      <div class="section-title">

        <span>اكتشفي</span>

        <h2>
          مساحات دوحة المداد
        </h2>

        <p>
          لكل جانب من رحلتك الأدبية مساحة.
        </p>

      </div>


      <div class="section-cards">

        ${sections
          .slice(0, 4)
          .map(section => renderSectionCard(section))
          .join("")}

      </div>

    </section>


    <section class="featured-posts">

      <div class="section-title">

        <span>من المجتمع</span>

        <h2>
          أبرز المنشورات
        </h2>

      </div>


      <div class="empty-content">

        <p>
          ستظهر هنا المنشورات التي يشاركها أعضاء المجتمع.
        </p>

        <a
          href="/writing"
          data-link
          class="secondary-button">
          استكشفي الكتابات
        </a>

      </div>

    </section>

  `;
}


// ============================================================
// SECTION CARD
// ============================================================

function renderSectionCard(section) {

  return `

    <a
      href="/${section.id}"
      data-link
      class="section-card section-card-${section.color}">

      <div class="section-card-symbol">
        <span></span>
      </div>

      <div class="section-card-content">

        <h3>
          ${section.title}
        </h3>

        <p>
          ${section.text}
        </p>

      </div>

      <span class="card-arrow">
        ←
      </span>

    </a>

  `;
}


// ============================================================
// WRITING
// ============================================================

function renderWriting() {

  return renderCommunityPage(
    "الكتابة",
    "مساحة الكتابات والمشاركات الأدبية في المجتمع.",
    "writing",
    `
      <div class="empty-content">

        <h3>
          شاركي صوتك الأدبي
        </h3>

        <p>
          ستظهر هنا المشاركات الأدبية المنشورة من أعضاء المجتمع.
        </p>

        <button class="primary-button">
          + مشاركة جديدة
        </button>

      </div>
    `
  );
}


// ============================================================
// READING
// ============================================================

function renderReading() {

  return renderCommunityPage(
    "القراءة",
    "اكتشفي ما يقرأه المجتمع وما يوصي به أعضاؤه.",
    "reading",
    `
      <div class="content-grid">

        <article class="content-card">

          <div class="content-image"></div>

          <div class="content-card-body">

            <span>قراءة</span>

            <h3>
              كتب ومراجعات المجتمع
            </h3>

            <p>
              ستظهر هنا الكتب والمراجعات التي يشاركها الأعضاء.
            </p>

          </div>

        </article>

      </div>
    `
  );
}


// ============================================================
// ARTICLES
// ============================================================

function renderArticles() {

  return renderCommunityPage(
    "المقالات والدروس",
    "مساحة المعرفة والإلهام الأدبي.",
    "articles",
    `
      <div class="content-grid">

        <article class="content-card">

          <div class="content-image"></div>

          <div class="content-card-body">

            <span>مقال</span>

            <h3>
              المقالات والدروس الأدبية
            </h3>

            <p>
              ستظهر هنا المقالات والدروس المنشورة في المجتمع.
            </p>

            <button class="secondary-button">
              قراءة
            </button>

          </div>

        </article>

      </div>
    `
  );
}


// ============================================================
// ACTIVITIES
// ============================================================

function renderActivities() {

  return renderCommunityPage(
    "الفعاليات والأنشطة",
    "تحديات وفعاليات ومساحات تجمع أعضاء المجتمع.",
    "activities",
    `
      <div class="content-grid">

        <article class="content-card">

          <div class="content-image"></div>

          <div class="content-card-body">

            <span>فعالية</span>

            <h3>
              فعاليات دوحة المداد
            </h3>

            <p>
              ستظهر هنا التحديات والمسابقات والأنشطة القادمة.
            </p>

            <button class="secondary-button">
              التفاصيل
            </button>

          </div>

        </article>

      </div>
    `
  );
}


// ============================================================
// STATISTICS
// ============================================================

function renderStatistics() {

  return `

    <section class="page statistics-page">

      <div class="page-container">

        ${renderBackButton()}

        <div class="page-heading">

          <span>
            رحلتك
          </span>

          <h1>
            الإحصائيات
          </h1>

          <p>
            تابعي تطور رحلتك الأدبية.
          </p>

        </div>


        <div class="stats-grid">

          ${statCard("النقاط", state.profile.points)}
          ${statCard("الكلمات", state.profile.words)}
          ${statCard("الكتب المقروءة", state.profile.reading)}

        </div>


        <div class="literary-passion">

          <span>
            الحماسة الأدبية
          </span>

          <div class="flames">

            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>

          </div>

        </div>

      </div>

    </section>

  `;
}


function statCard(title, value) {

  return `

    <div class="stat-card">

      <span>
        ${title}
      </span>

      <strong>
        ${value}
      </strong>

    </div>

  `;
}


// ============================================================
// MEMBERS
// ============================================================

function renderMembers() {

  return `

    <section class="page members-page">

      <div class="page-container">

        ${renderBackButton()}

        <div class="page-heading">

          <span>
            المجتمع
          </span>

          <h1>
            الأعضاء
          </h1>

          <p>
            تعرّفي على أعضاء دوحة المداد.
          </p>

        </div>


        <div class="members-grid">

          ${renderMember(
            "عضوة دوحة المداد",
            "@member"
          )}

        </div>

      </div>

    </section>

  `;
}


function renderMember(name, username) {

  return `

    <a
      href="/profile"
      data-link
      class="member-card">

      <div class="member-avatar">
        ${name.charAt(0)}
      </div>

      <div>

        <h3>
          ${name}
        </h3>

        <span>
          ${username}
        </span>

      </div>

    </a>

  `;
}


// ============================================================
// PROFILE
// ============================================================

function renderProfile() {

  const p = state.profile;

  return `

    <section class="page profile-page">

      <div class="page-container">

        ${renderBackButton()}


        <div class="profile-header">

          <div class="profile-avatar">
            ${p.name.charAt(0)}
          </div>

          <div class="profile-info">

            <h1>
              ${p.name}
            </h1>

            <span>
              ${p.username}
            </span>

            <p>
              ${p.bio}
            </p>

          </div>

          <a
            href="/settings"
            data-link
            class="icon-button"
            aria-label="الإعدادات">
            ⚙
          </a>

        </div>


        <div class="profile-stats">

          ${profileStat("النقاط", p.points)}
          ${profileStat("الكلمات", p.words)}
          ${profileStat("الكتب المقروءة", p.reading)}

        </div>


        <section class="profile-section">

          <div class="section-title">

            <span>
              الإنجازات
            </span>

            <h2>
              أوسمتك
            </h2>

          </div>


          <div class="badges-row">

            ${
              p.badges.length
                ? p.badges.map(renderBadge).join("")
                : `
                  <div class="empty-content">
                    لم تحصل العضوة على أوسمة بعد.
                  </div>
                `
            }

          </div>

        </section>


        ${
          p.books > 0
            ? `
              <section class="profile-section">

                <div class="section-title">

                  <span>
                    الكتب
                  </span>

                  <h2>
                    الكتب المنشورة
                  </h2>

                </div>

              </section>
            `
            : ""
        }

      </div>

    </section>

  `;
}


function profileStat(title, value) {

  return `

    <div>

      <span>
        ${title}
      </span>

      <strong>
        ${value}
      </strong>

    </div>

  `;
}


function renderBadge(badge) {

  return `

    <button
      class="badge"
      type="button">

      <span class="badge-symbol">
        ✦
      </span>

      <strong>
        ${badge.name}
      </strong>

      <small>
        حصلتِ عليه ${badge.times} مرة
      </small>

    </button>

  `;
}


// ============================================================
// SETTINGS
// ============================================================

function renderSettings() {

  return `

    <section class="page settings-page">

      <div class="page-container">

        ${renderBackButton()}

        <div class="page-heading">

          <span>
            الحساب
          </span>

          <h1>
            الإعدادات
          </h1>

        </div>


        <div class="settings-list">

          <button>
            الحساب
            <span>›</span>
          </button>

          <button>
            الخصوصية
            <span>›</span>
          </button>

          <button>
            الإشعارات
            <span>›</span>
          </button>

          <button>
            الأمان
            <span>›</span>
          </button>

        </div>

      </div>

    </section>

  `;
}


// ============================================================
// COMMUNITY PAGE
// ============================================================

function renderCommunityPage(
  title,
  description,
  theme,
  content
) {

  return `

    <section class="page community-page theme-${theme}">

      <div class="page-container">

        ${renderBackButton()}

        <div class="page-heading">

          <span>
            دوحة المداد
          </span>

          <h1>
            ${title}
          </h1>

          <p>
            ${description}
          </p>

        </div>

        ${content}

      </div>

    </section>

  `;
}


// ============================================================
// BACK
// ============================================================

function renderBackButton() {

  return `

    <button
      class="back-button"
      data-back
      type="button">

      ← العودة

    </button>

  `;
}


// ============================================================
// 404
// ============================================================

function renderNotFound() {

  return `

    <section class="page">

      <div class="page-container">

        <div class="empty-content">

          <h1>
            الصفحة غير موجودة
          </h1>

          <a
            href="/"
            data-link
            class="primary-button">
            العودة للرئيسية
          </a>

        </div>

      </div>

    </section>

  `;
}


// ============================================================
// EVENTS
// ============================================================

function bindEvents() {

  document.querySelectorAll("[data-link]")
    .forEach(link => {

      link.addEventListener("click", event => {

        const href = link.getAttribute("href");

        if (!href || !href.startsWith("/")) return;

        event.preventDefault();

        navigate(href);

      });

    });


  const menuButton =
    document.getElementById("mobile-menu-button");

  const mobileMenu =
    document.getElementById("mobile-menu");


  if (menuButton && mobileMenu) {

    menuButton.addEventListener("click", () => {

      mobileMenu.classList.toggle("open");

    });

  }


  document.querySelectorAll("[data-back]")
    .forEach(button => {

      button.addEventListener("click", () => {

        if (history.length > 1) {
          history.back();
        } else {
          navigate("/");
        }

      });

    });

}


// ============================================================
// NAVIGATION
// ============================================================

function navigate(path) {

  if (window.location.pathname === path) {
    return;
  }

  history.pushState({}, "", path);

  render();

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });

}


// ============================================================
// BROWSER BACK
// ============================================================

window.addEventListener("popstate", () => {

  render();

});


// ============================================================
// START
// ============================================================

render();
