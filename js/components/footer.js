
const Footer = {
    render() {
        return `
            <footer style="text-align: center; padding: 20px; color: var(--text-muted); border-top: 1px solid var(--border-color); margin-top: 40px;">
                <p>جميع الحقوق محفوظة © دوحة المِداد ${new Date().getFullYear()}</p>
            </footer>
        `;
    }
};
