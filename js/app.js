// ============================================================
// دوحة المداد — APP
// التطبيق الرئيسي
// ============================================================

const app = document.getElementById("app");

const App = {

  // ----------------------------------------------------------
  // تشغيل التطبيق
  // ----------------------------------------------------------

  init() {
    if (!app) {
      console.error("لم يتم العثور على #app");
      return;
    }

    this.render();

    window.addEventListener("popstate", () => {
      this.render();
    });
  },


  // ----------------------------------------------------------
  // تحديد المسار
  // ----------------------------------------------------------

  getPath() {
    let path = window.location.pathname;

    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }

    return path || "/";
  },


  // ----------------------------------------------------------
  // التنقل
  // ----------------------------------------------------------

  navigate(path) {

    if (!path) return;

    if (window.location.pathname === path) {
      this.render();
      return;
    }

    window.history.pushState({}, "", path);

    this.render();

    window.scrollTo({
      top: 0,
      behavior: "instant"
    });
  },


  // ----------------------------------------------------------
  // العودة
  // ----------------------------------------------------------

  back() {

    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.navigate("/");
    }
  },


  // ----------------------------------------------------------
  // بناء التطبيق
  // ----------------------------------------------------------

  render() {

    const path = this.getPath();

    let page = "";

    switch (true) {

      case path === "/":
        page = this.home();
        break;

      case path === "/writing":
        page = this.writing();
        break;

      case path === "/reading":
        page = this.reading();
        break;

      case path === "/articles":
        page = this.articles();
        break;

      case path.startsWith("/articles/"):
        page = this.articleDetails(path);
        break;

      case path === "/events":
      case path === "/activities":
        page = this.events();
        break;

      case path.startsWith("/events/"):
        page = this.eventDetails(path);
        break;

      case path === "/members":
        page = this.members();
        break;

      case path === "/statistics":
        page = this.statistics();
        break;

      case path === "/titles":
        page = this.titles();
        break;

      case path === "/books":
        page = this.books();
        break;

      case path === "/reviews":
        page = this.reviews();
        break;

      case path === "/profile":
        page = this.profile();
        break;

      case path.startsWith("/profile/"):
        page = this.memberProfile(path);
        break;

      case path === "/settings":
        page = this.settings();
        break;

      case path.startsWith("/post/"):
        page = this.postDetails(path);
        break;

      default:
        page = this.notFound();
    }


    app.innerHTML = `
      ${Components.navigation()}

      <main id="main-content">
        ${page}
      </main>

      ${Components.footer()}
    `;


    Components.init();

    this.bindNavigation();
  },


  // ----------------------------------------------------------
  // ربط الروابط
  // ----------------------------------------------------------

  bindNavigation() {

    document.querySelectorAll("[data-route]").forEach(link => {

      link.addEventListener("click", event => {

        const href = link.getAttribute("href");

        if (!href || href.startsWith("http")) {
          return;
        }

        event.preventDefault();

        this.navigate(href);
      });

    });


    document.querySelectorAll("[data-back]").forEach(button => {

      button.addEventListener("click", () => {
        this.back();
      });

    });
  },


  // ==========================================================
  // الصفحة الرئيسية
  // ==========================================================

  home() {

    const data =
      window.SiteData?.posts ||
      [];

    const posts = data.slice(0, 3);

    return `
      <section class="home-page">

        <div class="container">

          <section class="hero-section">

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
                data-route
                class="primary-button">
                استكشفي المجتمع
              </a>

            </div>

            <div class="hero-visual">

              <div class="hero-book">
                <div class="book-cover"></div>
                <div class="book-page"></div>
              </div>

            </div>

          </section>


          <section class="home-sections">

            ${this.sectionTitle(
              "اكتشفي",
              "مساحات دوحة المداد",
              "لكل جانب من رحلتك الأدبية مساحة."
            )}

            <div class="section-cards-grid">

              ${this.sectionCard(
                "writing",
                "الكتابة",
                "مساحة الكتابات والمشاركات الأدبية."
              )}

              ${this.sectionCard(
                "reading",
                "القراءة",
                "اكتشفي الكتب والقراءات والمراجعات."
              )}

              ${this.sectionCard(
                "articles",
                "المقالات والدروس",
                "معرفة وأفكار ودروس أدبية."
              )}

              ${this.sectionCard(
                "events",
                "الفعاليات والأنشطة",
                "تحديات وفعاليات المجتمع."
              )}

            </div>

          </section>


          <section class="featured-section">

            <div class="section-heading-row">

              ${this.sectionTitle(
                "من المجتمع",
                "أبرز المنشورات"
              )}

              <a
                href="/writing"
                data-route
                class="text-link">
                عرض الكل ←
              </a>

            </div>


            ${
              posts.length
                ? `
                  <div class="posts-grid">
                    ${posts
                      .map(post => Components.postCard(post))
                      .join("")}
                  </div>
                `
                : Components.emptyState(
                    "لا توجد منشورات بعد",
                    "ستظهر هنا المشاركات التي ينشرها أعضاء المجتمع."
                  )
            }

          </section>

        </div>

      </section>
    `;
  },


  // ==========================================================
  // بطاقة القسم
  // ==========================================================

  sectionCard(id, title, description) {

    return `
      <a
        href="/${id}"
        data-route
        class="section-card section-card-${id}">

        <div class="section-card-icon">
          <span></span>
        </div>

        <div>

          <h3>
            ${title}
          </h3>

          <p>
            ${description}
          </p>

        </div>

        <span class="card-arrow">
          ←
        </span>

      </a>
    `;
  },


  // ==========================================================
  // الكتابة
  // ==========================================================

  writing() {

    const posts =
      window.SiteData?.posts ||
      [];

    return this.communityPage(
      "الكتابة",
      "مساحة الكتابات والمشاركات الأدبية في المجتمع.",
      "writing",

      posts.length
        ? `
          <div class="posts-grid">
            ${posts
              .map(post => Components.postCard(post))
              .join("")}
          </div>
        `
        : Components.emptyState(
            "لا توجد مشاركات بعد",
            "ستظهر هنا الكتابات التي ينشرها أعضاء المجتمع."
          )
    );
  },


  // ==========================================================
  // القراءة
  // ==========================================================

  reading() {

    const books =
      window.SiteData?.books ||
      [];

    return this.communityPage(
      "القراءة",
      "اكتشفي الكتب والقراءات والمراجعات في المجتمع.",
      "reading",

      books.length
        ? `
          <div class="content-grid">
            ${books.map(book => this.bookCard(book)).join("")}
          </div>
        `
        : Components.emptyState(
            "لا توجد كتب بعد",
            "ستظهر هنا الكتب والقراءات المنشورة."
          )
    );
  },


  // ==========================================================
  // المقالات والدروس
  // ==========================================================

  articles() {

    const articles =
      window.SiteData?.articles ||
      [];

    return this.communityPage(
      "المقالات والدروس",
      "مساحة المعرفة والإلهام الأدبي.",
      "articles",

      articles.length
        ? `
          <div class="content-grid">
            ${articles
              .map(article => Components.articleCard(article))
              .join("")}
          </div>
        `
        : Components.emptyState(
            "لا توجد مقالات أو دروس بعد",
            "سيظهر المحتوى الأدبي هنا عند نشره."
          )
    );
  },


  // ==========================================================
  // تفاصيل المقال
  // ==========================================================

  articleDetails(path) {

    const id =
      decodeURIComponent(
        path.split("/")[2] || ""
      );

    const articles =
      window.SiteData?.articles ||
      [];

    const article =
      articles.find(item =>
        String(item.id) === String(id)
      );


    if (!article) {
      return this.notFound();
    }


    return `
      <section class="page article-details-page">

        <div class="container">

          ${Components.backButton(
            "العودة إلى المقالات والدروس"
          )}

          <article class="single-content">

            ${
              article.image
                ? `
                  <img
                    class="single-content-image"
                    src="${Components.escape(article.image)}"
                    alt="${Components.escape(article.title)}">
                `
                : ""
            }

            ${
              article.type
                ? `
                  <span class="content-type">
                    ${Components.escape(article.type)}
                  </span>
                `
                : ""
            }

            <h1>
              ${Components.escape(article.title)}
            </h1>

            ${
              article.description
                ? `<p>${Components.escape(article.description)}</p>`
                : ""
            }

          </article>

        </div>

      </section>
    `;
  },


  // ==========================================================
  // الفعاليات
  // ==========================================================

  events() {

    const events =
      window.SiteData?.events ||
      [];

    return this.communityPage(
      "الفعاليات والأنشطة",
      "تحديات وفعاليات ومساحات تجمع أعضاء المجتمع.",
      "events",

      events.length
        ? `
          <div class="content-grid">
            ${events
              .map(event => Components.eventCard(event))
              .join("")}
          </div>
        `
        : Components.emptyState(
            "لا توجد فعاليات حاليًا",
            "ستظهر هنا الفعاليات والأنشطة القادمة."
          )
    );
  },


  // ==========================================================
  // تفاصيل فعالية
  // ==========================================================

  eventDetails(path) {

    const id =
      decodeURIComponent(
        path.split("/")[2] || ""
      );

    const events =
      window.SiteData?.events ||
      [];

    const event =
      events.find(item =>
        String(item.id) === String(id)
      );


    if (!event) {
      return this.notFound();
    }


    return `
      <section class="page event-details-page">

        <div class="container">

          ${Components.backButton(
            "العودة إلى الفعاليات والأنشطة"
          )}

          <article class="single-content">

            ${
              event.image
                ? `
                  <img
                    class="single-content-image"
                    src="${Components.escape(event.image)}"
                    alt="${Components.escape(event.title)}">
                `
                : ""
            }

            ${
              event.type
                ? `
                  <span class="content-type">
                    ${Components.escape(event.type)}
                  </span>
                `
                : ""
            }

            <h1>
              ${Components.escape(event.title)}
            </h1>

            ${
              event.description
                ? `<p>${Components.escape(event.description)}</p>`
                : ""
            }

            ${
              event.date
                ? `<time>${Components.escape(event.date)}</time>`
                : ""
            }

          </article>

        </div>

      </section>
    `;
  },


  // ==========================================================
  // الأعضاء
  // ==========================================================

  members() {

    const members =
      window.SiteData?.members ||
      [];

    return this.communityPage(
      "الأعضاء",
      "تعرّفي على أعضاء دوحة المداد.",
      "members",

      members.length
        ? `
          <div class="members-grid">
            ${members
              .map(member => Components.memberCard(member))
              .join("")}
          </div>
        `
        : Components.emptyState(
            "لا يوجد أعضاء للعرض",
            ""
          )
    );
  },


  // ==========================================================
  // الإحصائيات
  // ==========================================================

  statistics() {

    const profile =
      window.SiteData?.currentMember ||
      {};

    const words =
      Number(profile.words || 0);

    const reading =
      Number(profile.reading || 0);

    const points =
      Number(profile.points || 0);


    return `
      <section class="page statistics-page">

        <div class="container">

          <div class="page-heading">
            <span>رحلتك</span>

            <h1>
              الإحصائيات
            </h1>

            <p>
              تابعي رحلتك الأدبية وتطور حماستك الأدبية.
            </p>
          </div>


          <div class="stats-grid">

            ${this.statCard("النقاط", points)}
            ${this.statCard("الكلمات", words)}
            ${this.statCard("الكتب المقروءة", reading)}

          </div>


          <section class="passion-section">

            <span>
              الحماسة الأدبية
            </span>

            <div class="passion-flames">

              <i></i>
              <i></i>
              <i></i>
              <i></i>
              <i></i>

            </div>

          </section>

        </div>

      </section>
    `;
  },


  statCard(title, value) {

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
  },


  // ==========================================================
  // الألقاب
  // ==========================================================

  titles() {

    const badges =
      window.SiteData?.badges ||
      [];

    return this.communityPage(
      "الألقاب",
      "إنجازات وأوسمة أعضاء دوحة المداد.",
      "titles",

      badges.length
        ? `
          <div class="badges-row">
            ${badges
              .map(badge => Components.badgeCard(badge))
              .join("")}
          </div>
        `
        : Components.emptyState(
            "لا توجد أوسمة بعد",
            ""
          )
    );
  },


  // ==========================================================
  // الكتب
  // ==========================================================

  books() {

    const books =
      window.SiteData?.books ||
      [];

    return this.communityPage(
      "الكتب",
      "الكتب المنشورة في دوحة المداد.",
      "books",

      books.length
        ? `
          <div class="content-grid">
            ${books.map(book => this.bookCard(book)).join("")}
          </div>
        `
        : Components.emptyState(
            "لا توجد كتب منشورة",
            ""
          )
    );
  },


  bookCard(book) {

    return `
      <article class="content-card book-card">

        ${
          book.image
            ? `
              <img
                class="content-card-image"
                src="${Components.escape(book.image)}"
                alt="${Components.escape(book.title || "")}">
            `
            : `
              <div class="content-card-image content-card-image-empty"></div>
            `
        }

        <div class="content-card-body">

          <span class="content-type">
            كتاب
          </span>

          <h3>
            ${Components.escape(book.title || "")}
          </h3>

          ${
            book.description
              ? `<p>${Components.escape(book.description)}</p>`
              : ""
          }

        </div>

      </article>
    `;
  },


  // ==========================================================
  // المراجعات
  // ==========================================================

  reviews() {

    return this.communityPage(
      "مراجعات الكتب",
      "آراء وتجارب القراء في الكتب.",
      "reviews",

      Components.emptyState(
        "لا توجد مراجعات بعد",
        ""
      )
    );
  },


  // ==========================================================
  // الملف الشخصي
  // ==========================================================

  profile() {

    const profile =
      window.SiteData?.currentMember ||
      {};

    return this.profileMarkup(profile);
  },


  memberProfile(path) {

    const username =
      decodeURIComponent(
        path.split("/")[2] || ""
      ).replace(/^@/, "");


    const members =
      window.SiteData?.members ||
      [];

    const member =
      members.find(item =>
        item.username === username
      );


    if (!member) {
      return this.notFound();
    }


    return this.profileMarkup(member);
  },


  profileMarkup(profile) {

    const books =
      Number(profile.books || 0);


    return `
      <section class="page profile-page">

        <div class="container">

          ${Components.backButton()}

          <div class="profile-header">

            <div class="profile-avatar">

              ${
                profile.avatar
                  ? `
                    <img
                      src="${Components.escape(profile.avatar)}"
                      alt="${Components.escape(profile.name || "")}">
                  `
                  : `
                    <span>
                      ${Components.initial(
                        profile.name || profile.username
                      )}
                    </span>
                  `
              }

            </div>


            <div class="profile-info">

              <h1>
                ${Components.escape(
                  profile.name || "عضوة دوحة المداد"
                )}
              </h1>

              <span>
                @${Components.escape(
                  String(profile.username || "")
                    .replace(/^@/, "")
                )}
              </span>

              ${
                profile.bio
                  ? `<p>${Components.escape(profile.bio)}</p>`
                  : ""
              }

            </div>


            <a
              href="/settings"
              data-route
              class="icon-button"
              aria-label="الإعدادات">
              ⚙
            </a>

          </div>


          <div class="profile-stats">

            ${this.profileStat(
              "النقاط",
              profile.points
            )}

            ${this.profileStat(
              "الكلمات",
              profile.words
            )}

            ${this.profileStat(
              "الكتب المقروءة",
              profile.reading
            )}

            ${
              books > 0
                ? this.profileStat(
                    "الكتب المنشورة",
                    books
                  )
                : ""
            }

          </div>


          ${
            profile.badges?.length
              ? `
                <section class="profile-section">

                  ${this.sectionTitle(
                    "الإنجازات",
                    "أوسمتك"
                  )}

                  <div class="badges-row">

                    ${profile.badges
                      .map(badge =>
                        Components.badgeCard(badge)
                      )
                      .join("")}

                  </div>

                </section>
              `
              : ""
          }

        </div>

      </section>
    `;
  },


  profileStat(title, value) {

    return `
      <div class="profile-stat">

        <span>
          ${title}
        </span>

        <strong>
          ${Number(value || 0)}
        </strong>

      </div>
    `;
  },


  // ==========================================================
  // الإعدادات
  // ==========================================================

  settings() {

    return `
      <section class="page settings-page">

        <div class="container">

          ${Components.backButton()}

          <div class="page-heading">

            <span>
              الحساب
            </span>

            <h1>
              الإعدادات
            </h1>

            <p>
              إدارة الحساب والخصوصية والإشعارات والأمان.
            </p>

          </div>


          <div class="settings-grid">

            ${this.settingItem(
              "الحساب",
              "تعديل بيانات الملف الشخصي."
            )}

            ${this.settingItem(
              "الخصوصية",
              "التحكم في ظهور بياناتك ونشاطك."
            )}

            ${this.settingItem(
              "الإشعارات",
              "إدارة إشعارات التفاعل والفعاليات."
            )}

            ${this.settingItem(
              "الأمان",
              "إدارة أمان الحساب."
            )}

          </div>

        </div>

      </section>
    `;
  },


  settingItem(title, description) {

    return `
      <button
        type="button"
        class="setting-item">

        <div>
          <strong>
            ${title}
          </strong>

          <span>
            ${description}
          </span>
        </div>

        <span aria-hidden="true">
          ←
        </span>

      </button>
    `;
  },


  // ==========================================================
  // منشور
  // ==========================================================

  postDetails(path) {

    const id =
      decodeURIComponent(
        path.split("/")[2] || ""
      );

    const posts =
      window.SiteData?.posts ||
      [];

    const post =
      posts.find(item =>
        String(item.id) === String(id)
      );


    if (!post) {
      return this.notFound();
    }


    return `
      <section class="page post-details-page">

        <div class="container">

          ${Components.backButton(
            "العودة إلى الكتابة"
          )}

          <article class="single-content">

            ${
              post.type
                ? `
                  <span class="content-type">
                    ${Components.escape(post.type)}
                  </span>
                `
                : ""
            }

            <h1>
              ${Components.escape(post.title || "")}
            </h1>

            ${
              post.author
                ? `
                  <a
                    href="/profile/${encodeURIComponent(
                      post.author.username || ""
                    )}"
                    data-route
                    class="post-author">

                    ${
                      post.author.avatar
                        ? `
                          <img
                            src="${Components.escape(
                              post.author.avatar
                            )}"
                            alt="">
                        `
                        : ""
                    }

                    <span>
                      ${Components.escape(
                        post.author.name ||
                        post.author.username ||
                        "عضو"
                      )}
                    </span>

                  </a>
                `
                : ""
            }

            ${
              post.content
                ? `
                  <div class="post-content">
                    ${Components.escape(post.content)}
                  </div>
                `
                : ""
            }

          </article>

        </div>

      </section>
    `;
  },


  // ==========================================================
  // مساعدات
  // ==========================================================

  communityPage(title, description, theme, content) {

    return `
      <section class="page community-page theme-${theme}">

        <div class="container">

          ${Components.backButton()}

          <div class="page-heading">

            <span>
              دوحة المداد
            </span>

            <h1>
              ${Components.escape(title)}
            </h1>

            <p>
              ${Components.escape(description)}
            </p>

          </div>

          ${content}

        </div>

      </section>
    `;
  },


  sectionTitle(label, title, description = "") {

    return `
      <div class="section-title">

        <span>
          ${Components.escape(label)}
        </span>

        <h2>
          ${Components.escape(title)}
        </h2>

        ${
          description
            ? `<p>${Components.escape(description)}</p>`
            : ""
        }

      </div>
    `;
  },


  notFound() {

    return `
      <section class="page">

        <div class="container">

          <div class="empty-state">

            <h1>
              الصفحة غير موجودة
            </h1>

            <p>
              الصفحة التي تحاولين الوصول إليها غير موجودة.
            </p>

            <a
              href="/"
              data-route
              class="primary-button">
              العودة للرئيسية
            </a>

          </div>

        </div>

      </section>
    `;
  }

};


// ============================================================
// تشغيل التطبيق
// ============================================================

window.App = App;

App.init();
