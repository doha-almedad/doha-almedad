// ============================================================
// دوحة المداد — المكونات المشتركة
// js/components.js
// ============================================================

const Components = {

  // ----------------------------------------------------------
  // النافيقيشن
  // ----------------------------------------------------------
  navigation() {
    return `
      <header class="site-header">
        <div class="container header-inner">

          <a href="/" data-route class="site-logo">
            <img src="logo.png" alt="دوحة المداد">
          </a>

          <nav class="main-nav" aria-label="التنقل الرئيسي">

            <a href="/" data-route class="nav-link">
              <span class="nav-icon" aria-hidden="true">⌂</span>
              <span>الرئيسية</span>
            </a>

            <a href="/members" data-route class="nav-link">
              <span class="nav-icon" aria-hidden="true">◌</span>
              <span>الأعضاء</span>
            </a>

            <a href="/events" data-route class="nav-link">
              <span class="nav-icon" aria-hidden="true">◇</span>
              <span>الفعاليات</span>
            </a>

            <a href="/statistics" data-route class="nav-link">
              <span class="nav-icon" aria-hidden="true">◫</span>
              <span>الإحصائيات</span>
            </a>

            <a href="/titles" data-route class="nav-link">
              <span class="nav-icon" aria-hidden="true">✦</span>
              <span>الألقاب</span>
            </a>

            <a href="/articles" data-route class="nav-link">
              <span class="nav-icon" aria-hidden="true">▤</span>
              <span>المقالات والدروس</span>
            </a>

          </nav>

          <div class="header-actions">

            <a href="/profile" data-route
               class="icon-button"
               aria-label="الملف الشخصي"
               title="الملف الشخصي">
              <span aria-hidden="true">◯</span>
            </a>

            <a href="/settings" data-route
               class="icon-button"
               aria-label="الإعدادات"
               title="الإعدادات">
              <span aria-hidden="true">⚙</span>
            </a>

            <button
              type="button"
              class="mobile-menu-button"
              data-mobile-menu
              aria-label="فتح القائمة">
              <span></span>
              <span></span>
              <span></span>
            </button>

          </div>

        </div>

        <div class="mobile-nav" data-mobile-nav hidden>
          <a href="/" data-route>الرئيسية</a>
          <a href="/members" data-route>الأعضاء</a>
          <a href="/events" data-route>الفعاليات</a>
          <a href="/statistics" data-route>الإحصائيات</a>
          <a href="/titles" data-route>الألقاب</a>
          <a href="/articles" data-route>المقالات والدروس</a>
          <a href="/profile" data-route>الملف الشخصي</a>
          <a href="/settings" data-route>الإعدادات</a>
        </div>
      </header>
    `;
  },


  // ----------------------------------------------------------
  // عنوان الصفحة
  // ----------------------------------------------------------
  pageHeader(title, description = "", section = "") {
    return `
      <div class="page-header ${section ? `section-${section}` : ""}">
        ${section ? `<span class="section-label">${section}</span>` : ""}

        <h1>${this.escape(title)}</h1>

        ${
          description
            ? `<p>${this.escape(description)}</p>`
            : ""
        }
      </div>
    `;
  },


  // ----------------------------------------------------------
  // زر العودة
  // ----------------------------------------------------------
  backButton(label = "العودة") {
    return `
      <button
        type="button"
        class="back-button"
        data-back>
        <span aria-hidden="true">←</span>
        <span>${this.escape(label)}</span>
      </button>
    `;
  },


  // ----------------------------------------------------------
  // بطاقة عضو
  // ----------------------------------------------------------
  memberCard(member) {
    if (!member) return "";

    return `
      <article class="member-card">

        <a
          href="/profile/${encodeURIComponent(member.username)}"
          data-route
          class="member-card-link">

          <div class="member-avatar">
            ${
              member.avatar
                ? `<img src="${this.escape(member.avatar)}"
                        alt="${this.escape(member.name || member.username)}">`
                : `<span>${this.initial(member.name || member.username)}</span>`
            }
          </div>

          <div class="member-card-info">
            <h3>${this.escape(member.name || member.username)}</h3>

            <p class="member-username">
              @${this.escape(member.username)}
            </p>

            ${
              member.bio
                ? `<p class="member-bio">${this.escape(member.bio)}</p>`
                : ""
            }
          </div>

        </a>

      </article>
    `;
  },


  // ----------------------------------------------------------
  // بطاقة منشور
  // ----------------------------------------------------------
  postCard(post) {
    if (!post) return "";

    const author = post.author || {};

    return `
      <article class="post-card">

        <div class="post-card-header">

          <a
            href="/profile/${encodeURIComponent(author.username || "")}"
            data-route
            class="post-author">

            <div class="post-author-avatar">
              ${
                author.avatar
                  ? `<img src="${this.escape(author.avatar)}"
                          alt="${this.escape(author.name || "")}">`
                  : `<span>${this.initial(author.name || author.username)}</span>`
              }
            </div>

            <div>
              <strong>
                ${this.escape(author.name || author.username || "عضو")}
              </strong>

              ${
                author.username
                  ? `<span>@${this.escape(author.username)}</span>`
                  : ""
              }
            </div>

          </a>

          ${
            post.type
              ? `<span class="post-type">${this.escape(post.type)}</span>`
              : ""
          }

        </div>

        <div class="post-card-content">

          ${
            post.title
              ? `<h3>${this.escape(post.title)}</h3>`
              : ""
          }

          ${
            post.excerpt || post.content
              ? `
                <p>
                  ${this.escape(
                    post.excerpt ||
                    this.truncate(post.content, 180)
                  )}
                </p>
              `
              : ""
          }

        </div>

        <div class="post-card-footer">

          ${
            post.date
              ? `<time>${this.escape(post.date)}</time>`
              : ""
          }

          <a
            href="/post/${post.id}"
            data-route
            class="text-link">
            قراءة المنشور
            <span aria-hidden="true">←</span>
          </a>

        </div>

      </article>
    `;
  },


  // ----------------------------------------------------------
  // بطاقة مقال / درس
  // ----------------------------------------------------------
  articleCard(article) {
    if (!article) return "";

    const author = article.author || {};

    return `
      <article class="content-card article-card">

        ${
          article.image
            ? `
              <a
                href="/articles/${article.id}"
                data-route
                class="content-card-image">

                <img
                  src="${this.escape(article.image)}"
                  alt="${this.escape(article.title || "")}">
              </a>
            `
            : `
              <a
                href="/articles/${article.id}"
                data-route
                class="content-card-image content-card-image-empty">

                <span aria-hidden="true">✦</span>

              </a>
            `
        }

        <div class="content-card-body">

          ${
            article.type
              ? `<span class="content-type">${this.escape(article.type)}</span>`
              : ""
          }

          <h3>
            <a href="/articles/${article.id}" data-route>
              ${this.escape(article.title || "")}
            </a>
          </h3>

          ${
            article.description
              ? `<p>${this.escape(article.description)}</p>`
              : ""
          }

          <div class="content-card-meta">

            <a
              href="/profile/${encodeURIComponent(author.username || "")}"
              data-route
              class="small-author">

              ${
                author.avatar
                  ? `<img src="${this.escape(author.avatar)}"
                          alt="">`
                  : `<span>${this.initial(author.name || author.username)}</span>`
              }

              <span>
                ${this.escape(author.name || "دوحة المداد")}
              </span>

            </a>

            ${
              article.date
                ? `<time>${this.escape(article.date)}</time>`
                : ""
            }

          </div>

        </div>

      </article>
    `;
  },


  // ----------------------------------------------------------
  // بطاقة فعالية
  // ----------------------------------------------------------
  eventCard(event) {
    if (!event) return "";

    return `
      <article class="content-card event-card">

        ${
          event.image
            ? `
              <a
                href="/events/${event.id}"
                data-route
                class="content-card-image">

                <img
                  src="${this.escape(event.image)}"
                  alt="${this.escape(event.title || "")}">
              </a>
            `
            : `
              <a
                href="/events/${event.id}"
                data-route
                class="content-card-image content-card-image-empty">

                <span aria-hidden="true">◇</span>

              </a>
            `
        }

        <div class="content-card-body">

          ${
            event.type
              ? `<span class="content-type">${this.escape(event.type)}</span>`
              : ""
          }

          <h3>
            <a href="/events/${event.id}" data-route>
              ${this.escape(event.title || "")}
            </a>
          </h3>

          ${
            event.description
              ? `<p>${this.escape(event.description)}</p>`
              : ""
          }

          <div class="event-meta">

            ${
              event.date
                ? `
                  <span>
                    <span aria-hidden="true">◷</span>
                    ${this.escape(event.date)}
                  </span>
                `
                : ""
            }

            ${
              event.status
                ? `
                  <span class="event-status">
                    ${this.escape(event.status)}
                  </span>
                `
                : ""
            }

          </div>

        </div>

      </article>
    `;
  },


  // ----------------------------------------------------------
  // بطاقة وسام
  // ----------------------------------------------------------
  badgeCard(badge) {
    if (!badge) return "";

    const locked = badge.isUnlocked === false;

    return `
      <button
        type="button"
        class="badge-card ${locked ? "badge-locked" : "badge-earned"}"
        data-badge-id="${this.escape(badge.id)}"
        data-badge-flip>

        <span class="badge-card-inner">

          <span class="badge-face badge-front">

            <span class="badge-symbol" aria-hidden="true">
              ${badge.icon || "✦"}
            </span>

            <strong>
              ${this.escape(badge.name || "")}
            </strong>

            ${
              locked
                ? `<small>مقفل</small>`
                : `
                  <small>
                    حصل عليه العضو
                    ${Number(badge.timesEarned || 0)} مرة
                  </small>
                `
            }

          </span>

          <span class="badge-face badge-back">

            <strong>
              ${this.escape(badge.name || "")}
            </strong>

            ${
              badge.description
                ? `<small>${this.escape(badge.description)}</small>`
                : ""
            }

            ${
              !locked
                ? `
                  <small>
                    عدد مرات الحصول:
                    ${Number(badge.timesEarned || 0)}
                  </small>
                `
                : `<small>لم يُكتسب بعد</small>`
            }

          </span>

        </span>

      </button>
    `;
  },


  // ----------------------------------------------------------
  // نافذة بسيطة
  // ----------------------------------------------------------
  modal(content, options = {}) {
    const title = options.title || "";
    const id = options.id || "modal";

    return `
      <div
        class="modal-overlay"
        id="${this.escape(id)}"
        data-modal
        hidden>

        <div
          class="modal"
          role="dialog"
          aria-modal="true">

          <button
            type="button"
            class="modal-close"
            data-modal-close
            aria-label="إغلاق">
            ×
          </button>

          ${
            title
              ? `<h2 class="modal-title">${this.escape(title)}</h2>`
              : ""
          }

          <div class="modal-body">
            ${content}
          </div>

        </div>

      </div>
    `;
  },


  // ----------------------------------------------------------
  // حالة عدم وجود بيانات
  // ----------------------------------------------------------
  emptyState(title, description = "") {
    return `
      <div class="empty-state">

        <div class="empty-state-icon" aria-hidden="true">
          ✦
        </div>

        <h3>${this.escape(title)}</h3>

        ${
          description
            ? `<p>${this.escape(description)}</p>`
            : ""
        }

      </div>
    `;
  },


  // ----------------------------------------------------------
  // تحميل
  // ----------------------------------------------------------
  loading() {
    return `
      <div class="loading-state" aria-live="polite">
        <span class="loading-spinner"></span>
        <span>جاري التحميل...</span>
      </div>
    `;
  },


  // ----------------------------------------------------------
  // تنبيه
  // ----------------------------------------------------------
  alert(message, type = "info") {
    return `
      <div class="site-alert alert-${this.escape(type)}" role="alert">
        ${this.escape(message)}
      </div>
    `;
  },


  // ----------------------------------------------------------
  // Footer
  // ----------------------------------------------------------
  footer() {
    return `
      <footer class="site-footer">

        <div class="container footer-inner">

          <div class="footer-brand">

            <img
              src="logo.png"
              alt="دوحة المداد">

            <p>
              مساحة أدبية تجمع القارئات والكاتبات
              وتصنع للحرف مكانًا.
            </p>

          </div>

          <div class="footer-links">

            <a href="/" data-route>الرئيسية</a>
            <a href="/members" data-route>الأعضاء</a>
            <a href="/events" data-route>الفعاليات</a>
            <a href="/articles" data-route>المقالات والدروس</a>

          </div>

        </div>

      </footer>
    `;
  },


  // ----------------------------------------------------------
  // تشغيل المكونات والتفاعلات المشتركة
  // ----------------------------------------------------------
  init() {

    // روابط الـ SPA
    document.querySelectorAll("[data-route]").forEach((link) => {

      link.addEventListener("click", (event) => {

        const href = link.getAttribute("href");

        if (!href || href.startsWith("http")) {
          return;
        }

        event.preventDefault();

        if (typeof Router !== "undefined") {
          Router.navigate(href);
        }

      });

    });


    // زر العودة
    document.querySelectorAll("[data-back]").forEach((button) => {

      button.addEventListener("click", () => {

        if (typeof Router !== "undefined") {
          Router.back();
        } else {
          window.history.back();
        }

      });

    });


    // القائمة في الهاتف
    const menuButton =
      document.querySelector("[data-mobile-menu]");

    const mobileNav =
      document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {

      menuButton.addEventListener("click", () => {

        const isHidden = mobileNav.hasAttribute("hidden");

        if (isHidden) {
          mobileNav.removeAttribute("hidden");
        } else {
          mobileNav.setAttribute("hidden", "");
        }

        menuButton.classList.toggle("is-open");

      });

    }


    // إغلاق القائمة بعد اختيار رابط
    document
      .querySelectorAll("[data-mobile-nav] [data-route]")
      .forEach((link) => {

        link.addEventListener("click", () => {

          if (mobileNav) {
            mobileNav.setAttribute("hidden", "");
          }

          if (menuButton) {
            menuButton.classList.remove("is-open");
          }

        });

      });


    // إغلاق النوافذ
    document.querySelectorAll("[data-modal-close]").forEach((button) => {

      button.addEventListener("click", () => {

        const modal = button.closest("[data-modal]");

        if (modal) {
          modal.setAttribute("hidden", "");
        }

      });

    });


    // إغلاق النافذة عند الضغط خارجها
    document.querySelectorAll("[data-modal]").forEach((modal) => {

      modal.addEventListener("click", (event) => {

        if (event.target === modal) {
          modal.setAttribute("hidden", "");
        }

      });

    });


    // Flip للأوسمة
    document.querySelectorAll("[data-badge-flip]").forEach((badge) => {

      badge.addEventListener("click", () => {
        badge.classList.toggle("is-flipped");
      });

    });

  },


  // ----------------------------------------------------------
  // أدوات مساعدة
  // ----------------------------------------------------------

  escape(value) {

    if (value === null || value === undefined) {
      return "";
    }

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },


  initial(name) {

    if (!name) return "د";

    return String(name).trim().charAt(0);
  },


  truncate(text, length = 180) {

    if (!text) return "";

    const value = String(text);

    if (value.length <= length) {
      return value;
    }

    return `${value.slice(0, length).trim()}…`;
  }

};


// ------------------------------------------------------------
// جعل Components متاحًا لبقية الملفات
// ------------------------------------------------------------
window.Components = Components;
