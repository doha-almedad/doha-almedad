const SiteData = {
  site: {
    name: "دوحة المداد",
    description: "مساحة أدبية تجمع القارئات والكاتبات في مجتمع واحد.",
    logo: "/assets/logo.png"
  },

  navigation: [
    {
      id: "home",
      label: "الرئيسية",
      route: "/"
    },
    {
      id: "writing",
      label: "الكتابة",
      route: "/writing"
    },
    {
      id: "reading",
      label: "القراءة",
      route: "/reading"
    },
    {
      id: "articles",
      label: "المقالات والدروس",
      route: "/articles"
    },
    {
      id: "activities",
      label: "الفعاليات والأنشطة",
      route: "/activities"
    },
    {
      id: "statistics",
      label: "الإحصائيات",
      route: "/statistics"
    }
  ],

  sections: {
    home: {
      name: "الرئيسية",
      theme: "home"
    },

    writing: {
      name: "الكتابة",
      theme: "writing"
    },

    reading: {
      name: "القراءة",
      theme: "reading"
    },

    articles: {
      name: "المقالات والدروس",
      theme: "articles"
    },

    activities: {
      name: "الفعاليات والأنشطة",
      theme: "activities"
    },

    statistics: {
      name: "الإحصائيات",
      theme: "statistics"
    }
  },

  member: {
    id: null,
    name: "",
    username: "",
    avatar: "",
    bio: "",

    literaryEnthusiasm: 0,

    points: 0,
    rank: null,

    words: 0,
    booksPublished: 0,
    booksRead: 0,

    badges: []
  },

  posts: [],

  books: [],

  reviews: [],

  articles: [],

  lessons: [],

  activities: [],

  badges: [],

  statistics: {
    literaryEnthusiasm: 0,
    words: 0,
    booksRead: 0,
    booksPublished: 0,
    points: 0,
    rank: null
  }
};


window.SiteData = SiteData;
