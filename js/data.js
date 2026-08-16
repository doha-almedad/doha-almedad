// ==========================================
// بيانات وهوية المجتمع الأدبي
// ==========================================

const SITE = {
  name: "المجتمع الأدبي",
  tagline: "مساحة تجمع القارئات والكاتبات",
  description:
    "مساحة للإبداع والشغف الأدبي، تجمع القارئات والكاتبات في مجتمع واحد.",

  colors: {
    rawUmber: "#9E6438",
    ecru: "#D3AF7C",
    frenchGray: "#C5CFDF",
    mossGreen: "#8F884F",
    drabDarkBrown: "#3E401F",
    background: "#F4EEE5",
    card: "#FBF8F2",
  },

  sections: [
    {
      id: "home",
      title: "الرئيسية",
    },
    {
      id: "members",
      title: "الأعضاء",
    },
    {
      id: "events",
      title: "الفعاليات",
    },
    {
      id: "goals",
      title: "الأهداف",
    },
    {
      id: "statistics",
      title: "الإحصائيات",
    },
    {
      id: "titles",
      title: "الألقاب",
    },
    {
      id: "books",
      title: "الكتب المنشورة",
    },
    {
      id: "reviews",
      title: "مراجعات الكتب",
    },
    {
      id: "articles",
      title: "المقالات",
    },
  ],
};


// ==========================================
// بيانات تجريبية مؤقتة
// سنربطها لاحقًا بقاعدة البيانات
// ==========================================

const MEMBERS = [];

const EVENTS = [];

const BOOKS = [];

const ARTICLES = [];


// ==========================================
// تصدير البيانات
// ==========================================

window.LITERARY_DATA = {
  SITE,
  MEMBERS,
  EVENTS,
  BOOKS,
  ARTICLES,
};
