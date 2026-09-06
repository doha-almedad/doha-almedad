/* =========================================================
   دوحة المداد — initialData.js
   البيانات الأولية للمنصة (تُستخدم فقط أول مرة قبل إنشاء
   قاعدة البيانات المحلية في store.js)
   ========================================================= */

export const INITIAL_USERS = [
  {
    id: "u_ghaith",
    username: "raghad",
    displayName: "رغد",
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
    username: "cocktail",
    displayName: "كوكتيل",
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
    username: "majd",
    displayName: "مجد",
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
  },
  {
    id: "u_noura",
    username: "ghadeer",
    displayName: "غدير",
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
    joinedAt: "2025-04-12T00:00:00.000Z"
  }
];


// مجتمع تجريبي موسّع لنسخة التطوير: 50 عضوًا إجمالًا
const DEMO_NAMES = [
  "سارة","نورة","ريم","هيا","جود","لين","دانة","شهد","أروى","لمى","تالا","رُبى","مي","سمر","عبير","أثير","بيان","لُجين","سديم","رزان","روان","ليان","يارا","مها","وفاء","آلاء","حنين","نجود","شوق","إيلاف","أفنان","ديمة","مرح","سُهى","نجلاء","منار","صفاء","رند","أسيل","جمانة","مريم","ندى","أمل","رهف","غلا","سلسبيل"
];
const DEMO_INTERESTS = ["خيال علمي","فانتازيا","قصة قصيرة","رواية","شعر","فلسفة","أدب كلاسيكي","غموض"];
for(let i=0;i<DEMO_NAMES.length;i++){
  const n=i+5, name=DEMO_NAMES[i];
  INITIAL_USERS.push({id:`u_demo_${n}`,username:`reader${n}`,displayName:name,bio:`قارئ${i%3===0?" وكاتب":""} يهتم بـ${DEMO_INTERESTS[i%DEMO_INTERESTS.length]}.`,socialUrl:"",role:"member",xp:80+(i*73)%2400,level:1+(i%6),streak:i%12,longestStreak:3+(i%25),lastActiveDate:null,activityLog:{},stats:{wordsWritten:(i%3)*1250+(i*97),booksPublished:0,booksRead:2+(i%19),challengesJoined:i%7,articlesPublished:i%4},badges:{},joinedAt:`2026-${String(1+(i%7)).padStart(2,"0")}-${String(1+(i%27)).padStart(2,"0")}T00:00:00.000Z`});
}

// المستخدم الحالي (لأغراض العرض التوضيحي بدون خادم فعلي)
export const CURRENT_USER_ID = "u_ghaith";

export const INITIAL_EVENTS = [
  {
    id: "ev_ramadan_chapters",
    organizerId: "u_ghaith",
    title: "تحدي فصول الليل",
    description: "اكتب فصلًا أدبيًا واحدًا كل ثلاثة أيام حتى نهاية الشهر، وشارك زملاءك رحلة السرد.",
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
    description: "شارك قصيدة أو نصًا شعريًا قصيرًا أمام المجتمع، تُقبل المشاركات المكتوبة خارج المنصة أيضًا.",
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
    description: "قدّم نقدًا بنّاءً لعمل زميل، تُراجَع المشاركات من إدارة الفعالية قبل اعتمادها.",
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
    category: "مقال",
    excerpt: "كيف تحوّل الوصف المباشر إلى مَشاهد حية يعيشها القارئ بدل أن يُقرأ له عنها؟",
    content: "مقال تعليمي حول أدوات التصوير السردي، الحوار، والتفاصيل الحسية التي تنقل القارئ إلى قلب المشهد بدل سرد الأحداث عليه سردًا مباشرًا.",
    author: "u_ghaith",
    date: "2026-07-02T00:00:00.000Z"
  },
  {
    id: "ar_editing_pass",
    title: "جولة التحرير الثانية: ما الذي تحذفه فعلًا؟",
    category: "مقال",
    excerpt: "دليل عملي لمراجعة المسودة الأولى بعين ناقدة دون أن تفقد صوتك الخاص.",
    content: "يتناول المقال خطوات مراجعة النص بعد إتمام المسودة الأولى، والتمييز بين الحذف الذي يخدم الإيقاع والحذف الذي يُفقد النص روحه.",
    author: "u_layla",
    date: "2026-07-18T00:00:00.000Z"
  },
  {
    id: "ar_reading_habit",
    title: "بناء عادة القراءة اليومية دون إرهاق",
    category: "ملخص",
    excerpt: "خطوات بسيطة لجعل القراءة جزءًا من يومك دون أن تتحول إلى عبء.",
    content: "يقترح المقال جدولًا تدريجيًا لبناء عادة قراءة مستدامة، مع التركيز على الاستمرارية بدل الكمية.",
    author: "u_sami",
    date: "2026-08-01T00:00:00.000Z"
  }
];


// محتوى تجريبي كثيف لتخيّل الدوحة بعد امتلائها
const DEMO_POST_TITLES=["مدينة تنام تحت قمرين","رسالة من آخر محطة","حين تكلمت المكتبة","النافذة السابعة","ممر إلى كوكب بعيد","ذاكرة من زجاج","قهوة باردة في ديسمبر","البيت الذي يكتب أسماءنا","ما وراء الضباب","نجمة في جيب المسافر","الوقت المستعار","حديقة الأصوات","قبل أن ينطفئ المصباح","ساعي البريد إلى المريخ","على حافة الحلم","الغرفة رقم صفر","خرائط لا تقود إلى مكان","موسيقى للغائبين","آخر شجرة في المدينة","رسالة لم تُرسل","بحر بلا شاطئ","المصعد إلى الطابق المفقود","صوت بين النجوم","دفتر أبي الأزرق","أثر فراشة على النافذة","حين عاد الشتاء","مقهى آخر الليل","ظلال على السور","الروبوت الذي أحب الشعر","أيام من ورق","نصف حكاية","الطريق إلى سديم أندروميدا"];
const DEMO_TYPES=["story","piece","reflection","chapter","poem","opinion"];
export const INITIAL_POSTS=DEMO_POST_TITLES.map((title,i)=>({id:`p_demo_${i+1}`,authorId:i%5===0?"u_layla":`u_demo_${5+(i%46)}`,title,type:DEMO_TYPES[i%DEMO_TYPES.length],content:`${title} — نص تجريبي من مجتمع دوحة المِداد. يفتح هذا المقطع بابًا إلى ${DEMO_INTERESTS[i%DEMO_INTERESTS.length]}، ويترك للقارئ مساحة للتأمل والنقاش ومتابعة الحكاية.`,wordCount:80+(i*37)%900,images:[],likedBy:["u_ghaith",...(i%2?["u_sami"]:[])],comments:[],date:`2026-09-${String(1+(i%6)).padStart(2,"0")}T${String(8+(i%12)).padStart(2,"0")}:00:00.000Z`}));


const DEMO_MORE_POSTS = Array.from({length:32},(_,i)=>({
  id:`p_demo_more_${i+1}`, authorId:`u_demo_${5+((i*7)%46)}`,
  title:["مجرة في فنجان","المكتبة بعد منتصف الليل","آخر رسالة من الأرض","صوت في الممر","أوراق لا تحترق","شرفة تطل على الغد","حارس النجوم","المدينة التي نسيت أسماءها"][i%8]+` ${i+1}`,
  type:DEMO_TYPES[(i+2)%DEMO_TYPES.length],
  content:`نص تجريبي إضافي رقم ${i+1} لملء قسم الكتابة وإظهار المنصة كمجتمع نشط. يدور حول ${DEMO_INTERESTS[(i+3)%DEMO_INTERESTS.length]} ويحتوي مساحة للنقاش والتفاعل.`,
  wordCount:160+(i*53)%1200,images:[],likedBy:i%3?["u_ghaith"]:["u_layla"],comments:[],
  date:`2026-09-${String(1+(i%6)).padStart(2,"0")}T${String(7+(i%14)).padStart(2,"0")}:15:00.000Z`
}));
INITIAL_POSTS.push(...DEMO_MORE_POSTS);

const DEMO_BOOKS=["مشكلة الأجسام الثلاثة","الكثيب","المريخي","1984","مئة عام من العزلة","الجريمة والعقاب","مكتبة منتصف الليل","عداء الطائرة الورقية","فرانكشتاين","عالم جديد شجاع","رجال في الشمس","الأمير الصغير","اسم الوردة","شرق المتوسط","الطاعون","موبي ديك","الغريب","مرتفعات وذرينغ","اللص والكلاب","ساق البامبو","يوتوبيا","قواعد العشق الأربعون","عزازيل","موسم الهجرة إلى الشمال"];
export const INITIAL_REVIEWS=DEMO_BOOKS.map((bookTitle,i)=>({id:`r_demo_${i+1}`,authorId:`u_demo_${5+(i%46)}`,bookTitle,rating:3+(i%3),content:`مراجعة تجريبية لكتاب «${bookTitle}». أكثر ما لفتني فيه الفكرة والإيقاع والأسئلة التي يتركها بعد الصفحة الأخيرة.`,images:[],likedBy:i%2?["u_ghaith"]:[],comments:[],date:`2026-09-${String(1+(i%6)).padStart(2,"0")}T${String(9+(i%10)).padStart(2,"0")}:30:00.000Z`}));


const DEMO_MORE_REVIEWS = Array.from({length:16},(_,i)=>({
 id:`r_demo_more_${i+1}`,authorId:`u_demo_${5+((i*5+9)%46)}`,
 bookTitle:["دون كيشوت","الأوديسة","سولاريس","آلة الزمن","451 فهرنهايت","قصة مدينتين","الحارس في حقل الشوفان","العطر"][i%8]+(i>=8?` — قراءة ${i+1}`:""),
 rating:3+(i%3),content:`مراجعة تجريبية إضافية رقم ${i+1}. قراءة شخصية تتناول الفكرة والأسلوب والأثر الذي تركه الكتاب بعد الانتهاء منه.`,
 images:[],likedBy:i%2?["u_ghaith","u_sami"]:[],comments:[],date:`2026-09-${String(1+(i%6)).padStart(2,"0")}T${String(8+(i%11)).padStart(2,"0")}:45:00.000Z`
}));
INITIAL_REVIEWS.push(...DEMO_MORE_REVIEWS);

const EXTRA_ARTICLE_TITLES=["كيف تبدأ قصة قصيرة من مشهد واحد؟","لماذا نحب النهايات المفتوحة؟","مدخل إلى الخيال العلمي العربي","بناء العالم دون إغراق القارئ","الشخصية الرمادية أخلاقيًا","كيف تقرأ رواية طويلة؟","دفتر القارئ: طريقة بسيطة للتذكر","الحوار الذي يكشف الشخصية","من الفكرة إلى المسودة الأولى","لماذا نعيد قراءة الكتب؟","الراوي غير الموثوق","الإيقاع في النص القصير","أدب الرحلات بين الواقع والحكاية","كيف تكتب مراجعة نافعة؟","الشعر في زمن السرعة"];
EXTRA_ARTICLE_TITLES.forEach((title,i)=>INITIAL_ARTICLES.push({id:`ar_demo_${i+1}`,title,category:i%4===0?"ملخص":"مقال",excerpt:`مادة تجريبية حول «${title}» ضمن محتوى الدوحة المتنوع.`,content:`هذا محتوى تجريبي موسع يساعد على تصور قسم المقالات حين يصبح المجتمع نشطًا وممتلئًا بالمواد الأدبية.`,author:i%3===0?"u_sami":`u_demo_${5+(i%46)}`,date:`2026-08-${String(10+(i%18)).padStart(2,"0")}T00:00:00.000Z`}));


const EXTRA_ARTICLE_TITLES_2=["كيف يصنع المكان ذاكرة في الرواية؟","الخيال العلمي حين يسأل عن الإنسان","سبع طرق لافتتاح النص","متى يكون الوصف كثيرًا؟","كيف نناقش كتابًا نختلف معه؟","الشخصيات الثانوية التي لا تُنسى","القراءة البطيئة: لماذا تستحق التجربة؟","ما الذي يجعل الحوار طبيعيًا؟","من أين تأتي أفكار القصص؟","كيف تختار كتابك التالي؟","الرمز دون غموض مصطنع","النهاية التي تعيد تفسير البداية","دفتر الاقتباسات: هل يفيد القارئ؟","ماذا نتعلم من إعادة كتابة المشهد؟","بين المراجعة والانطباع الشخصي"];
EXTRA_ARTICLE_TITLES_2.forEach((title,i)=>INITIAL_ARTICLES.push({id:`ar_demo_more_${i+1}`,title,category:i%5===0?"ملخص":"مقال",excerpt:`مادة تجريبية إضافية حول «${title}» لتبدو مكتبة المقالات ممتلئة ومتنوعة.`,content:`محتوى تجريبي موسع لنسخة التطوير، هدفه اختبار تصميم المقالات عندما تحتوي المنصة على مواد كثيرة ومتنوعة.`,author:`u_demo_${5+((i*4)%46)}`,date:`2026-09-${String(1+(i%6)).padStart(2,"0")}T10:00:00.000Z`}));

const EXTRA_EVENTS=["ماراثون القصة القصيرة","أسبوع الخيال العلمي","نادي روايات الغموض","تحدي عشر صفحات يوميًا","مختبر الشخصيات","ليلة الشعر الحر","قراءة جماعية: الكثيب","مناظرة: هل النهاية أهم من الرحلة؟","ورشة بناء العوالم","تحدي مراجعة في 200 كلمة","أمسية النصوص الأولى","نادي الأدب الكلاسيكي"];
EXTRA_EVENTS.forEach((title,i)=>INITIAL_EVENTS.push({id:`ev_demo_${i+1}`,organizerId:i%2?"u_layla":"u_ghaith",title,description:`فعالية تجريبية: ${title}. مساحة للمشاركة والتفاعل واكتشاف أعضاء يشاركونك الاهتمام.`,goal:i%3===0?"reach_word_count":i%3===1?"finish_book":"manual_submission",goalValue:i%3===0?1200:1,verificationMethod:i%3===2?"manual_submission":"automatic",startDate:`2026-09-${String(2+(i%10)).padStart(2,"0")}T00:00:00.000Z`,endDate:`2026-10-${String(2+(i%20)).padStart(2,"0")}T00:00:00.000Z`,participants:Array.from({length:4+(i%8)},(_,j)=>`u_demo_${5+((i*3+j)%46)}`),order:10+i}));


const EXTRA_EVENTS_2=["صالون الفانتازيا","سباق كتابة المشهد","قراءة رواية ديستوبية","نقاش أدب الرعب","ورشة افتتاحيات الروايات","تحدي كتاب من خارج منطقتك","أمسية رسائل أدبية","مختبر الحوار","نادي الرواية التاريخية","جلسة مراجعات بلا حرق"];
EXTRA_EVENTS_2.forEach((title,i)=>INITIAL_EVENTS.push({id:`ev_demo_more_${i+1}`,organizerId:`u_demo_${5+((i*6)%46)}`,title,description:`فعالية تجريبية إضافية: ${title}. أضيفت لعرض المنصة في حالة نشاط كثيف وتنوع في الاهتمامات.`,goal:i%2?"finish_book":"reach_word_count",goalValue:i%2?1:900,verificationMethod:"automatic",startDate:`2026-09-${String(5+(i%10)).padStart(2,"0")}T00:00:00.000Z`,endDate:`2026-10-${String(8+(i%15)).padStart(2,"0")}T00:00:00.000Z`,participants:Array.from({length:8+(i%10)},(_,j)=>`u_demo_${5+((i*5+j)%46)}`),order:30+i}));


// موجة تجريبية كبيرة: تجعل نسخة التطوير أقرب إلى مجتمع حي فعلاً
const DEMO_COMMENT_TEXTS=["أعجبني هذا المدخل جدًا.","الفكرة تستحق نقاشًا أطول.","ذكّرني هذا بكتاب قرأته مؤخرًا.","النهاية فاجأتني.","هل فكرت في توسيع هذا المشهد؟","أتفق معك في جزء وأختلف في آخر.","لغة جميلة وإيقاع هادئ.","أريد قراءة المزيد من هذا النوع."];
function demoUsersFor(i,count){return Array.from({length:count},(_,j)=>`u_demo_${5+((i*7+j*3)%46)}`)}
function demoComments(prefix,i,count){return Array.from({length:count},(_,j)=>{const id=`c_${prefix}_${i}_${j}`;return{id,userId:`u_demo_${5+((i*5+j*11)%46)}`,text:DEMO_COMMENT_TEXTS[(i+j)%DEMO_COMMENT_TEXTS.length],parentCommentId:null,rootCommentId:id,depth:0,likedBy:demoUsersFor(i+j,(i+j)%4),date:`2026-09-${String(1+((i+j)%6)).padStart(2,"0")}T${String(8+((i+j)%12)).padStart(2,"0")}:20:00.000Z`}})}
const DEMO_TOPICS=["الخيال العلمي","الفانتازيا","الغموض","الرعب النفسي","الواقعية","الهوية","الذاكرة","السفر","العائلة","الصداقة","المدينة","العزلة","المستقبل","الذكاء الاصطناعي","الأساطير","التاريخ","الفلسفة","الطبيعة","الطفولة","الأحلام"];
const DEMO_FORMS=["قصة قصيرة","خاطرة","مشهد","فصل روائي","قصيدة نثر","رأي أدبي"];
const BULK_POSTS=Array.from({length:72},(_,i)=>({id:`p_bulk_${i+1}`,authorId:`u_demo_${5+((i*13)%46)}`,title:`${DEMO_FORMS[i%DEMO_FORMS.length]}: ${DEMO_TOPICS[(i*3)%DEMO_TOPICS.length]} ${i+1}`,type:DEMO_TYPES[i%DEMO_TYPES.length],content:`نص تجريبي متنوع حول ${DEMO_TOPICS[(i*3)%DEMO_TOPICS.length]}. صُمم هذا المحتوى لاختبار قسم الكتابة عندما يصبح المجتمع نشطًا، مع اختلاف الموضوعات والأصوات والأطوال والنقاشات بين الأعضاء.`,wordCount:140+(i*67)%1800,images:[],likedBy:demoUsersFor(i,3+(i%14)),comments:demoComments('p',i,1+(i%7)),views:45+(i*29)%780,date:`2026-09-${String(1+(i%6)).padStart(2,"0")}T${String(6+(i%17)).padStart(2,"0")}:10:00.000Z`}));
INITIAL_POSTS.push(...BULK_POSTS);

const BULK_BOOKS=["Solaris","The Left Hand of Darkness","Neuromancer","Never Let Me Go","Piranesi","The Name of the Rose","The Road","Beloved","The Stranger","The Trial","The Picture of Dorian Gray","Jane Eyre","Rebecca","The Secret History","Norwegian Wood","The Shadow of the Wind","The Dispossessed","Foundation","Hyperion","The Martian Chronicles","The Handmaid's Tale","Station Eleven","Cloud Atlas","The Remains of the Day","The Master and Margarita","The Book Thief","The Ocean at the End of the Lane","The Midnight Library","A Gentleman in Moscow","The Little Prince"];
const BULK_REVIEWS=Array.from({length:36},(_,i)=>({id:`r_bulk_${i+1}`,authorId:`u_demo_${5+((i*9)%46)}`,bookTitle:BULK_BOOKS[i%BULK_BOOKS.length]+(i>=30?` — قراءة ${i+1}`:""),rating:2+(i%4),content:`مراجعة تجريبية موسعة تتناول تجربة قراءة «${BULK_BOOKS[i%BULK_BOOKS.length]}»، من الفكرة والشخصيات إلى الإيقاع والأثر بعد النهاية.`,images:[],likedBy:demoUsersFor(i+40,2+(i%12)),comments:demoComments('r',i,1+(i%6)),views:30+(i*31)%620,date:`2026-09-${String(1+(i%6)).padStart(2,"0")}T${String(7+(i%14)).padStart(2,"0")}:35:00.000Z`}));
INITIAL_REVIEWS.push(...BULK_REVIEWS);

const BULK_ARTICLE_TOPICS=["السرد بضمير المتكلم","بناء العوالم","القراءة النقدية","أدب الخيال العلمي","الرواية التاريخية","الشعر الحديث","تقنيات الحوار","الشخصية المضادة","الإيقاع","الترجمة الأدبية","أدب الرحلات","اليوميات","الرمزية","أدب الرعب","المدينة في الرواية","الذاكرة في السرد","النهايات المفتوحة","الراوي غير الموثوق","اختيار العنوان","المراجعة الأدبية"];
Array.from({length:24},(_,i)=>INITIAL_ARTICLES.push({id:`ar_bulk_${i+1}`,title:`${BULK_ARTICLE_TOPICS[i%BULK_ARTICLE_TOPICS.length]}: زاوية ${i+1}`,category:i%5===0?"ملخص":"مقال",excerpt:`مادة تجريبية عن ${BULK_ARTICLE_TOPICS[i%BULK_ARTICLE_TOPICS.length]} لاختبار كثافة قسم المقالات.`,content:`مقال تجريبي كامل نسبيًا يناقش ${BULK_ARTICLE_TOPICS[i%BULK_ARTICLE_TOPICS.length]} بأمثلة وأسئلة للنقاش، ضمن نسخة التطوير الممتلئة.`,author:`u_demo_${5+((i*8)%46)}`,date:`2026-09-${String(1+(i%6)).padStart(2,"0")}T11:00:00.000Z`}));

const BULK_EVENT_NAMES=["نادي الخيال العلمي","مختبر القصة القصيرة","جلسة قراءة صامتة","تحدي ألف كلمة","نقاش رواية غموض","ورشة الشخصيات","ليلة الشعر","قراءة كلاسيكية","صالون الفلسفة والأدب","تحدي مراجعة أسبوعية","ورشة بناء عالم","جلسة تحرير جماعية","نادي الرواية التاريخية","أمسية أدب الرعب","تحدي كتاب جديد"];
Array.from({length:16},(_,i)=>INITIAL_EVENTS.push({id:`ev_bulk_${i+1}`,organizerId:`u_demo_${5+((i*4)%46)}`,title:`${BULK_EVENT_NAMES[i%BULK_EVENT_NAMES.length]} ${i+1}`,description:`فعالية تجريبية نشطة حول ${DEMO_TOPICS[(i*2)%DEMO_TOPICS.length]}، مع مشاركات متعددة لاختبار شكل المنصة الممتلئة.`,goal:i%2?"finish_book":"reach_word_count",goalValue:i%2?1:1000+(i*100),verificationMethod:"automatic",startDate:`2026-09-${String(3+(i%12)).padStart(2,"0")}T00:00:00.000Z`,endDate:`2026-10-${String(5+(i%20)).padStart(2,"0")}T00:00:00.000Z`,participants:demoUsersFor(i,12+(i%20)),order:60+i}));

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

export const LEVELS = [
  { level: 1, name: "بذرة الحرف", xp: 0 },
  { level: 2, name: "قارئ واعد", xp: 100 },
  { level: 3, name: "رفيق الكلمة", xp: 250 },
  { level: 4, name: "صانع الأثر", xp: 500 },
  { level: 5, name: "كاتب متقدم", xp: 900 },
  { level: 6, name: "سادن الأدب", xp: 1500 },
  { level: 7, name: "منارة المِداد", xp: 2500 },
  { level: 8, name: "أديب الدوحة", xp: 4000 }
];
export const LEVEL_XP_STEP = 500; // للتوافق مع الإصدارات السابقة فقط

/* Dense development-only evaluation content */
const EVAL_TOPICS_V4=["الخيال العلمي","الفانتازيا","الغموض","الرعب النفسي","الواقعية","الفلسفة","التاريخ","الأساطير","الذاكرة","المدينة","السفر","الهوية","العائلة","الصداقة","الفقد","الأمل","الذكاء الاصطناعي","الفضاء","المستقبل","الديستوبيا","الطبيعة","البحر","الصحراء","الطفولة","الزمن","الأحلام","الموسيقى","الفن","اللغة","العزلة","التحول","المغامرة"];
const EVAL_TITLES_V4=["حين تأخرت الشمس","نافذة إلى كوكب آخر","المدينة التي تنام واقفة","رسالة من عام ٢١٤٠","أثر قدم على القمر","المكتبة الأخيرة","الباب الذي لا يظهر مرتين","صوت تحت الماء","خرائط لا تقود إلى مكان","مقهى عند نهاية الزمن","البيت الذي يتذكر","الساعة الثالثة عشرة","سماء من ورق","أسماء الريح","الطريق إلى الشمال","المرآة التي كذبت","قبل أن يبرد الضوء","مذكرات روبوت يتعلم الحنين","آخر قطار للصحراء","القرية خلف الضباب","لغة النجوم","ما تركه البحر","غرفة بلا نوافذ","يوميات قارئ مجهول","حديقة الاحتمالات","بين مدينتين","أغنية لم يسمعها أحد","أرشيف الأحلام","الشخص الذي نسي ظله","حكاية الباب الأزرق"];
const EVAL_WRITING_POSTS_V4=Array.from({length:120},(_,i)=>{const topic=EVAL_TOPICS_V4[i%EVAL_TOPICS_V4.length],title=EVAL_TITLES_V4[i%EVAL_TITLES_V4.length]+` — ${i+1}`;return{id:`eval_v4_post_${i+1}`,authorId:i<4?["u_ghaith","u_sami","u_majd","u_ghadeer"][i]:`u_demo_${5+((i*11)%46)}`,title,type:["قصة قصيرة","خاطرة","نص أدبي","شعر","مشهد روائي","مقالة شخصية"][i%6],content:`${title}\n\nنص تجريبي ممتد في موضوع ${topic}. أضيف لنسخة التقييم كي تظهر صفحة الكتابة كمجتمع نشط بموضوعات وأساليب وأطوال مختلفة.`,wordCount:220+((i*71)%1800),images:[],likedBy:Array.from({length:2+(i%11)},(_,j)=>`u_demo_${5+((i+j*3)%46)}`),comments:Array.from({length:i%6},(_,j)=>({id:`eval_v4_pc_${i}_${j}`,authorId:`u_demo_${5+((i+j*7)%46)}`,text:["أحببت الفكرة جدًا.","النهاية جعلتني أعيد القراءة.","الوصف هنا جميل.","أختلف قليلًا لكن النص ممتع.","هل هناك جزء ثانٍ؟","لفتني بناء المشهد."][j%6],date:"2026-09-06T12:00:00.000Z",likedBy:[],replies:[]})),views:35+((i*37)%850),date:`2026-09-0${1+(i%6)}T12:20:00.000Z`}});INITIAL_POSTS.push(...EVAL_WRITING_POSTS_V4);
const EVAL_BOOKS_V4=["سولاريس","الكثيب","1984","فرانكنشتاين","مئة عام من العزلة","الأمير الصغير","الجريمة والعقاب","عداء الطائرة الورقية","دون كيشوت","آلة الزمن","فهرنهايت 451","الطريق","العطر","مزرعة الحيوان","شرق المتوسط","رجال في الشمس","اسم الوردة","الغريب","البؤساء","غاتسبي العظيم","مرتفعات وذرينغ","موبي ديك","الأوديسة","جين آير","الأخوة كارامازوف","حول العالم في 80 يومًا"];
const EVAL_READING_V4=Array.from({length:90},(_,i)=>({id:`eval_v4_review_${i+1}`,authorId:i<4?["u_ghaith","u_sami","u_majd","u_ghadeer"][i]:`u_demo_${5+((i*13)%46)}`,bookTitle:EVAL_BOOKS_V4[i%EVAL_BOOKS_V4.length]+(i>=27?` — قراءة ${Math.floor(i/27)+1}`:""),rating:1+(i%5),content:`مراجعة تجريبية متنوعة. أكثر ما لفتني هو ${EVAL_TOPICS_V4[(i+7)%EVAL_TOPICS_V4.length]} وطريقة بناء الأفكار والشخصيات.`,images:[],views:20+((i*29)%500),likedBy:Array.from({length:1+(i%8)},(_,j)=>`u_demo_${5+((i+j*5)%46)}`),comments:Array.from({length:i%5},(_,j)=>({id:`eval_v4_rc_${i}_${j}`,authorId:`u_demo_${5+((i+j*9)%46)}`,text:["أتفق مع تقييمك.","أضفته لقائمتي.","قراءتي كانت مختلفة.","أعجبني هذا الجزء أيضًا.","مراجعة جميلة."][j%5],date:"2026-09-06T14:00:00.000Z",likedBy:[],replies:[]})),date:`2026-09-0${1+(i%6)}T14:35:00.000Z`}));INITIAL_REVIEWS.push(...EVAL_READING_V4);
const EVAL_ARTICLES_V4=Array.from({length:55},(_,i)=>({id:`eval_v4_article_${i+1}`,title:["كيف نبني عالمًا روائيًا مقنعًا؟","لماذا نعود إلى الكتب القديمة؟","الخيال العلمي مرآة للحاضر","فن البداية القوية","كيف نكتب حوارًا حيًا؟","القارئ شريك في صناعة المعنى","عن النهايات المفتوحة","كيف نقرأ الشعر؟","المكان بوصفه شخصية","الكتابة عن الذاكرة","متى يحتاج النص إلى الحذف؟"][i%11]+` ${i+1}`,category:i%6===0?"ملخص":"مقال",excerpt:`مادة تجريبية في ${EVAL_TOPICS_V4[(i+4)%EVAL_TOPICS_V4.length]}.`,content:"مقال تجريبي موسع لنسخة التقييم، يتضمن أفكارًا وأمثلة وأسئلة للنقاش.",author:i<4?["u_ghaith","u_sami","u_majd","u_ghadeer"][i]:`u_demo_${5+((i*7)%46)}`,views:45+((i*41)%900),likedBy:Array.from({length:2+(i%10)},(_,j)=>`u_demo_${5+((i+j*2)%46)}`),comments:[],date:`2026-09-0${1+(i%6)}T11:00:00.000Z`}));INITIAL_ARTICLES.push(...EVAL_ARTICLES_V4);
const EVAL_EVENTS_V4=Array.from({length:35},(_,i)=>({id:`eval_v4_event_${i+1}`,organizerId:i%4===0?"u_ghaith":`u_demo_${5+((i*5)%46)}`,title:["ماراثون القصة القصيرة","نادي الخيال العلمي","أسبوع الرواية التاريخية","تحدي خمس قراءات","مختبر الشخصيات","أمسية الشعر","نقاش النهايات المفتوحة","ورشة الحوار","قراءة جماعية","تحدي ألف كلمة","صالون الفانتازيا","جلسة مراجعات بلا حرق"][i%12]+` ${i+1}`,description:`فعالية تجريبية في ${EVAL_TOPICS_V4[(i+2)%EVAL_TOPICS_V4.length]}.`,goal:i%2?"finish_book":"reach_word_count",goalValue:i%2?1:1000,verificationMethod:"automatic",startDate:`2026-09-${String(5+(i%20)).padStart(2,"0")}T00:00:00.000Z`,endDate:`2026-10-${String(5+(i%20)).padStart(2,"0")}T00:00:00.000Z`,participants:Array.from({length:6+(i%20)},(_,j)=>`u_demo_${5+((i*3+j)%46)}`),order:100+i}));INITIAL_EVENTS.push(...EVAL_EVENTS_V4);
