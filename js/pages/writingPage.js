
const WritingPage = {
    render() {
        return `
            <section>
                <h2>✍️ محترف الكتابة والنشر</h2>
                <div class="card" style="margin-top: 15px;">
                    <textarea id="writing-text" rows="8" placeholder="اكتب نصك الأدبي هنا..." style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; font-family: inherit; margin-bottom: 15px;"></textarea>
                    <button onclick="WritingPage.submitText()" style="background: var(--primary-color); color: white; padding: 10px 20px; border-radius: 6px;">نشر النص الأدبي</button>
                </div>
            </section>
        `;
    },

    submitText() {
        const text = document.getElementById('writing-text').value;
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

        if (wordCount > 0) {
            RewardEngine.processEvent('WRITE_WORDS', { count: wordCount });
            alert(`تم نشر نصك المكون من ${wordCount} كلمة بنجاح!`);
            document.getElementById('writing-text').value = '';
        } else {
            alert('يرجى كتابة نص قبل الضغط على نشر.');
        }
    }
};
