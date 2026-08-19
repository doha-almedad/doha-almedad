
const InitialData = {
    user: {
        id: "usr_01",
        name: "غون",
        username: "gon_writer",
        avatar: "🖋️",
        level: 5,
        streak: 7,
        stats: {
            wordsWritten: 14200,
            booksRead: 18,
            eventsJoined: 4
        }
    },
    badges: [
        {
            id: "b1",
            title: "حارس الحرف",
            literaryDescription: "شرف يُمنح لمن شارك في 5 جلسات كتابية مغلقة.",
            icon: "📜",
            unlocked: true
        },
        {
            id: "b2",
            title: "شعلة الأدب",
            literaryDescription: "وسام الاستمرارية لمن حافظ على نشاطه لسبعة أيام متتالية.",
            icon: "🔥",
            unlocked: true
        },
        {
            id: "b3",
            title: "عميد الندوة",
            literaryDescription: "يُنال عند إتمام تقديم 3 مراجعات كتب نقدية.",
            icon: "🏛️",
            unlocked: false
        }
    ],
    events: [
        {
            id: "ev_101",
            title: "مساجلة الربيع الأدبية",
            description: "تحدي كتابة نصوص قصيرة تبدأ بحروف محددة خلال 48 ساعة.",
            status: "active",
            proofType: "text_submission"
        },
        {
            id: "ev_102",
            title: "قراءة في كتب السير",
            description: "جلسة نقاشية حول أعظم السير الذاتية في الأدب العربي.",
            status: "upcoming",
            proofType: "discussion"
        }
    ]
};
