
const ReadingPage = {
    render() {
        const data = Store.get();
        return `
            <section>
                <h2>📖 سجّل قراءاتك ومراجعاتك</h2>
                <div class="card" style="margin-top: 15px;">
                    <input type="text" id="book-title" placeholder="اسم الكتاب" style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid var(--border-color); border-radius: 6px;">
                    <textarea id="book-review" rows="4" placeholder="مراجعتك وتقييمك للكتاب..." style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid var(--border-color); border-radius: 6px;"></textarea>
                    <button onclick="ReadingPage.submitReview()" style="background: var(--primary-color); color: white; padding: 10px 20px; border-radius: 6px;">تأكيد قراءة الكتاب</button>
                </div>
                <div style="margin-top: 25px;">
                    <h3>مجموع الكتب المقروءة: ${data.user.stats.booksRead}</h3>
                </div>
            </section>
        `;
    },

    submitReview() {
        const title = document.getElementById('book-title').value;
        if (title.trim()) {
            RewardEngine.processEvent('READ_BOOK', { count: 1 });
            alert(`تم تسجيل قراءة كتاب (${title}) وإضافته لرصيدك!`);
            document.getElementById('book-title').value = '';
            document.getElementById('book-review').value = '';
        } else {
            alert('يرجى إدخال اسم الكتاب.');
        }
    }
};
