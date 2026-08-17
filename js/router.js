// js/router.js

const Router = {
  routes: {},

  register(path, renderFunction) {
    this.routes[path] = renderFunction;
  },

  navigate(path) {
    if (!path) return;

    history.pushState({}, "", path);
    this.render();
  },

  back() {
    history.back();
  },

  getCurrentPath() {
    return window.location.pathname;
  },

  render() {
    const path = this.getCurrentPath();

    const renderFunction =
      this.routes[path] ||
      this.routes["/404"] ||
      this.routes["/"];

    if (typeof renderFunction === "function") {
      renderFunction();
    }
  },

  start() {
    window.addEventListener("popstate", () => {
      this.render();
    });

    this.render();
  }
};

window.Router = Router;
