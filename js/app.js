// ==========================================
// تشغيل الموقع
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  const data = window.LITERARY_DATA;

  if (!data) {
    console.error("بيانات الموقع غير موجودة.");
    return;
  }

  initializeNavigation();
  initializeApp();
});


// ==========================================
// تهيئة الموقع
// ==========================================

function initializeApp() {
  renderSiteName();
  renderNavigation();
}


// ==========================================
// اسم المجتمع
// ==========================================

function renderSiteName() {
  const elements = document.querySelectorAll("[data-site-name]");

  elements.forEach((element) => {
    element.textContent = window.LITERARY_DATA.SITE.name;
  });
}


// ==========================================
// التنقل
// ==========================================

function renderNavigation() {
  const navigation = document.querySelector("[data-navigation]");

  if (!navigation) return;

  navigation.innerHTML = "";

  window.LITERARY_DATA.SITE.sections.forEach((section) => {
    const link = document.createElement("a");

    link.href = `#${section.id}`;
    link.textContent = section.title;
    link.className = "nav-link";

    navigation.appendChild(link);
  });
}


// ==========================================
// التنقل بين الأقسام
// ==========================================

function initializeNavigation() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');

    if (!link) return;

    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}
