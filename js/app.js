document.addEventListener('DOMContentLoaded', () => {
    // 1. تهيئة قاعدة البيانات والتخزين المحلي
    Store.init();

    // 2. تفعيل نظام التوجيه والصفحات
    Router.init();
});
