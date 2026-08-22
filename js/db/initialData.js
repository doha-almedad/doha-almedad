/* =========================================================
   دوحة المداد — initialData.js
   البيانات الأولية للمنصة (تُستخدم فقط أول مرة قبل إنشاء
   قاعدة البيانات المحلية في store.js)
   ========================================================= */

export const INITIAL_USERS = [
  {
    id: "u_ghaith",
    username: "ghaith",
    displayName: "غيث",
    bio: "",
    socialUrl: "",
    role: "owner",
    xp: 0,
    level: 1,
    streak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    activityLog: {},
    stats: { wordsWritten: 0, booksPublished: 0, booksRead: 0, challengesJoined: 0, articlesPublished: 0 },
    badges: {},
    joinedAt: "2025-01-01T00:00:00.000Z"
  },
  {
    id: "u_layla",
    username: "layla_k",
    displayName: "ليلى",
    bio: "",
    socialUrl: "",
    role: "moderator",
    xp: 0,
    level: 1,
    streak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    activityLog: {},
    stats: { wordsWritten: 0, booksPublished: 0, booksRead: 0, challengesJoined: 0, articlesPublished: 0 },
    badges: {},
    joinedAt: "2025-02-14T00:00:00.000Z"
  },
  {
    id: "u_sami",
    username: "sami_r",
    displayName: "سامي",
    bio: "",
    socialUrl: "",
    role: "member",
    xp: 0,
    level: 1,
    streak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    activityLog: {},
    stats: { wordsWritten: 0, booksPublished: 0, booksRead: 0, challengesJoined: 0, articlesPublished: 0 },
    badges: {},
    joinedAt: "2025-03-20T00:00:00.000Z"
  }
];

// المستخدم الحالي (لأغراض العرض التوضيحي بدون خادم فعلي)
export const CURRENT_USER_ID = "u_ghaith";

export const INITIAL_EVENTS = [
  {
    id: "ev_ramadan_chapters",
    organizerId: "u_ghaith",
    title: "تحدي فصول الليل",
    description: "اكتب فصلاً أدبياً واحداً كل ثلاثة أيام حتى نهاية الشهر، وشارك زملاءك رحلة السرد.",
    goal: "reach_word_count",
    goalValue: 15000,
    verificationMethod: "automatic",
    startDate: "2026-08-01T00:00:00.000Z",
    endDate: "2026-09-01T00:00:00.000Z",
    participants: ["u_ghaith", "u_layla"],
    order: 1
  },
  {
    id: "ev_book_circle",
    organizerId: "u_layla",
    title: "مجلس القراءة الشهري",
    description: "أنهِ قراءة كتاب واحد على الأقل هذا الشهر واكتب مراجعة موجزة له.",
    goal: "finish_book",
    goalValue: 1,
    verificationMethod: "select_existing_content",
    startDate: "2026-08-05T00:00:00.000Z",
    endDate: "2026-08-31T00:00:00.000Z",
    participants: ["u_layla", "u_sami"],
    order: 2
  },
  {
    id: "ev_poetry_night",
    organizerId: "u_layla",
    title: "أمسية القوافي المفتوحة",
    description: "شارك قصيدة أو نصاً شعرياً قصيراً أمام المجتمع، تُقبل المشاركات المكتوبة خارج المنصة أيضاً.",
    goal: "submit_poem",
    goalValue: 1,
    verificationMethod: "manual_submission",
    startDate: "2026-08-10T00:00:00.000Z",
    endDate: "2026-08-20T00:00:00.000Z",
    participants: ["u_ghaith"],
    order: 3
  },
  {
    id: "ev_critique_circle",
    organizerId: "u_ghaith",
    title: "حلقة النقد الأدبي",
    description: "قدّم نقداً بنّاءً لعمل زميل، تُراجَع المشاركات من إدارة الفعالية قبل اعتمادها.",
    goal: "submit_critique",
    goalValue: 1,
    verificationMethod: "admin_verification",
    startDate: "2026-08-15T00:00:00.000Z",
    endDate: "2026-09-05T00:00:00.000Z",
    participants: [],
    order: 4
  }
];

export const INITIAL_ARTICLES = [
  {
    id: "ar_show_dont_tell",
    title: "أَرِنا ولا تخبرنا: فن التصوير في السرد",
    category: "تقنيات الكتابة",
    excerpt: "كيف تحوّل الوصف المباشر إلى مَشاهد حية يعيشها القارئ بدل أن يُقرأ له عنها؟",
    content: "مقال تعليمي حول أدوات التصوير السردي، الحوار، والتفاصيل الحسية التي تنقل القارئ إلى قلب المشهد بدل سرد الأحداث عليه سرداً مباشراً.",
    author: "u_ghaith",
    date: "2026-07-02T00:00:00.000Z"
  },
  {
    id: "ar_editing_pass",
    title: "جولة التحرير الثانية: ما الذي تحذفه فعلاً؟",
    category: "التحرير الأدبي",
    excerpt: "دليل عملي لمراجعة المسودة الأولى بعين ناقدة دون أن تفقد صوتك الخاص.",
    content: "يتناول المقال خطوات مراجعة النص بعد إتمام المسودة الأولى، والتمييز بين الحذف الذي يخدم الإيقاع والحذف الذي يُفقد النص روحه.",
    author: "u_layla",
    date: "2026-07-18T00:00:00.000Z"
  },
  {
    id: "ar_reading_habit",
    title: "بناء عادة القراءة اليومية دون إرهاق",
    category: "القراءة",
    excerpt: "خطوات بسيطة لجعل القراءة جزءاً من يومك دون أن تتحول إلى عبء.",
    content: "يقترح المقال جدولاً تدريجياً لبناء عادة قراءة مستدامة، مع التركيز على الاستمرارية بدل الكمية.",
    author: "u_sami",
    date: "2026-08-01T00:00:00.000Z"
  }
];

/* ---------------------------------------------------------
   تعريفات الأوسمة — كل شرط يُصاغ أدبياً وقت العرض عبر
   badgeService.js وليس هنا (هنا نضع الشرط التقني فقط)
   --------------------------------------------------------- */
export const BADGE_DEFINITIONS = [
  {
    id: "bd_first_word",
    name: "أول القلم",
    icon: "feather",
    conditionType: "wordsWritten",
    conditionValue: 1,
    levelRequired: 1,
    literaryDesc: { locked: "لم تُخطّ أول كلماتك بعد", unlocked: "لِمن خطّ أولى كلماته على المنصة" }
  },
  {
    id: "bd_ten_books",
    name: "قارئ نهم",
    icon: "book",
    conditionType: "booksRead",
    conditionValue: 10,
    levelRequired: 1,
    literaryDesc: { locked: "الهدف عشرة كتب مقروءة", unlocked: "لِمن أتمّ قراءة عشرة كتب" }
  },
  {
    id: "bd_ten_thousand_words",
    name: "غزير المداد",
    icon: "quill",
    conditionType: "wordsWritten",
    conditionValue: 10000,
    levelRequired: 1,
    literaryDesc: { locked: "الهدف بلوغ عشرة آلاف كلمة مكتوبة", unlocked: "لِمن بلغت كتاباته عشرة آلاف كلمة" }
  },
  {
    id: "bd_five_challenges",
    name: "فارس التحديات",
    icon: "target",
    conditionType: "challengesJoined",
    conditionValue: 5,
    levelRequired: 1,
    literaryDesc: { locked: "الهدف المشاركة في خمسة تحديات", unlocked: "لِمن شارك في خمسة تحديات أدبية" }
  },
  {
    id: "bd_three_pieces",
    name: "صاحب الأثر",
    icon: "document",
    conditionType: "articlesOrWorksPublished",
    conditionValue: 3,
    levelRequired: 1,
    literaryDesc: { locked: "الهدف نشر ثلاثة أعمال أدبية", unlocked: "لِمن نشر ثلاثة أعمال أدبية" }
  },
  {
    id: "bd_streak_7",
    name: "شعلة لا تنطفئ",
    icon: "flame",
    conditionType: "longestStreak",
    conditionValue: 7,
    levelRequired: 1,
    literaryDesc: { locked: "الهدف أسبوع كامل من النشاط المتواصل", unlocked: "لِمن أشعل حماسته سبعة أيام متتالية" }
  },
  {
    id: "bd_level_5",
    name: "كاتب متقدم",
    icon: "shield",
    conditionType: "level",
    conditionValue: 5,
    levelRequired: 5,
    literaryDesc: { locked: "يُفتح عند الوصول للمستوى الخامس", unlocked: "لِمن بلغ مرتبة الكاتب المتقدم" }
  }
];

export const LEVEL_XP_STEP = 500; // كل 500 نقطة خبرة = مستوى جديد
