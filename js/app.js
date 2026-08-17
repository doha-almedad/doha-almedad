// js/app.js

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
  setupNavigation();
  setupMobileMenu();
  setupInteractiveElements();

  // تشغيل الـ Router إذا كان موجودًا
  if (window.Router) {
    window.Router.start();
  }
}

/* =========================================
   Navigation
========================================= */

function setupNavigation() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-route]");

    if (!link) return;

    event.preventDefault();

    const route = link.dataset.route;

    if (window.Router && route) {
      window.Router.navigate(route);
    }
  });
}

/* =========================================
   Mobile Menu
========================================= */

function setupMobileMenu() {
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const closeButton = document.querySelector("[data-menu-close]");

  if (!menuButton || !mobileMenu) return;

  menuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("is-open");
    document.body.classList.toggle("menu-open");
  });

  if (closeButton) {
    closeButton.addEventListener("click", closeMobileMenu);
  }

  mobileMenu.addEventListener("click", (event) => {
    const link = event.target.closest("[data-route]");

    if (link) {
      closeMobileMenu();
    }
  });
}

function closeMobileMenu() {
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (mobileMenu) {
    mobileMenu.classList.remove("is-open");
  }

  document.body.classList.remove("menu-open");
}

/* =========================================
   Interactive Elements
========================================= */

function setupInteractiveElements() {
  setupBackButtons();
  setupModals();
  setupTabs();
}

/* =========================================
   Back Buttons
========================================= */

function setupBackButtons() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-back]");

    if (!button) return;

    event.preventDefault();

    if (window.history.length > 1) {
      window.history.back();
    } else if (window.Router) {
      window.Router.navigate("/");
    }
  });
}

/* =========================================
   Modals
========================================= */

function setupModals() {
  document.addEventListener("click", (event) => {
    const openButton = event.target.closest("[data-modal-open]");

    if (openButton) {
      const modalId = openButton.dataset.modalOpen;
      openModal(modalId);
      return;
    }

    const closeButton = event.target.closest("[data-modal-close]");

    if (closeButton) {
      const modalId = closeButton.dataset.modalClose;
      closeModal(modalId);
      return;
    }

    if (event.target.classList.contains("modal-overlay")) {
      closeModal(event.target.id);
    }
  });
}

function openModal(modalId) {
  if (!modalId) return;

  const modal = document.getElementById(modalId);

  if (!modal) return;

  modal.classList.add("is-open");
  document.body.classList.add("modal-open");
}

function closeModal(modalId) {
  if (!modalId) return;

  const modal = document.getElementById(modalId);

  if (!modal) return;

  modal.classList.remove("is-open");

  if (!document.querySelector(".modal-overlay.is-open")) {
    document.body.classList.remove("modal-open");
  }
}

/* =========================================
   Tabs
========================================= */

function setupTabs() {
  document.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-tab]");

    if (!tab) return;

    const tabGroup = tab.closest("[data-tabs]");

    if (!tabGroup) return;

    const target = tab.dataset.tab;

    tabGroup.querySelectorAll("[data-tab]").forEach((item) => {
      item.classList.remove("active");
    });

    tab.classList.add("active");

    tabGroup.querySelectorAll("[data-tab-content]").forEach((content) => {
      content.classList.remove("active");

      if (content.dataset.tabContent === target) {
        content.classList.add("active");
      }
    });
  });
}

/* =========================================
   Utility Functions
========================================= */

window.App = {
  navigate(path) {
    if (window.Router) {
      window.Router.navigate(path);
    }
  },

  back() {
    if (window.Router) {
      window.Router.back();
    } else {
      window.history.back();
    }
  },

  openModal,

  closeModal,

  closeMobileMenu
};
