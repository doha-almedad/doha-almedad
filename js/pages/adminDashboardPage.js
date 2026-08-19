
const AdminDashboardPage = {
    render() {
        const data = Store.get();
        return `
            <section>
                <h2>⚙️ لوحة تحكم المالكين (Owners Dashboard)</h2>
                <p style="color: var(--text-muted);">إدارة إعدادات المنصة ومتابعة نشاط الأعضاء.</p>
                
                <div class="card" style="margin-top: 20px;">
                    <h3>قائمة الأعضاء المسجلين</h3>
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>اسم العضو</th>
                                <th>المعرف</th>
                                <th>المستوى</th>
                                <th>الأنشطة</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${data.user.name}</td>
                                <td>@${data.user.username}</td>
                                <td>${data.user.level}</td>
                                <td><button onclick="alert('تفعيل مكافأة مخصصة')" style="padding: 4px 8px; border-radius: 4px;">منح وسام</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        `;
    }
};
