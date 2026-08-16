// ==========================================
// Literary Community — Main Application
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

function initializeApp() {
    console.log("Literary Community app initialized.");

    setupNavigation();
    setupButtons();
}


// ==========================================
// Navigation
// ==========================================

function setupNavigation() {
    const navigationLinks = document.querySelectorAll("[data-page]");

    navigationLinks.forEach((link) => {
        link.addEventListener("click", () => {
            const page = link.dataset.page;

            if (page) {
                navigateTo(page);
            }
        });
    });
}

function navigateTo(page) {
    console.log(`Navigating to: ${page}`);

    window.dispatchEvent(
        new CustomEvent("page:navigate", {
            detail: { page }
        })
    );
}


// ==========================================
// Buttons
// ==========================================

function setupButtons() {
    const buttons = document.querySelectorAll("[data-action]");

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const action = button.dataset.action;

            if (action) {
                handleAction(action, button);
            }
        });
    });
}

function handleAction(action, element) {
    switch (action) {
        case "open-profile":
            openProfile();
            break;

        case "open-settings":
            openSettings();
            break;

        case "logout":
            logout();
            break;

        default:
            console.log(`Unknown action: ${action}`);
    }
}


// ==========================================
// Profile
// ==========================================

function openProfile() {
    navigateTo("profile");
}


// ==========================================
// Settings
// ==========================================

function openSettings() {
    navigateTo("settings");
}


// ==========================================
// Authentication
// ==========================================

function logout() {
    console.log("Logout requested.");
}


// ==========================================
// Global App State
// ==========================================

window.LiteraryApp = {
    navigateTo,
    openProfile,
    openSettings,
    logout
};
