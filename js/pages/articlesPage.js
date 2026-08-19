
const ArticlesPage = {
    render() {
        return `
            <section>
                <h2>📚 المقالات والدروس الأدبية</h2>
                <div class="card" style="margin-top: 15px;">
                    <h4>أساسيات بناء الحبكة الأدبية</h4>
                    <p style="color: var(--text-muted); margin: 10px 0;">مقالة تعليمية تناقش آليات تصاعد الأحداث وتقنيات subverting expectations.</p>
                    <button onclick="Modals.show('أساسيات بناء الحبكة', 'تعتمد الحبكة الناجحة على توزيع الصراعات بشكل متوازن بين الشخصيات الرئيسية وإعطاء القرّاء مساحات للتوقع قبل كسرها بأحداث منطقية.')" style="background: var(--primary-color); color: white; padding: 6px 12px; border-radius: 4px;">قراءة المقال</button>
                </div>
            </section>
        `;
    }
};
