/* =========================================================
   دوحة المداد — carousel.js
   عارض صور دائري بسيط (أكثر من صورة لكل منشور)، بلا مكتبات
   خارجية — يدعم التنقل بالأسهم والنقاط
   ========================================================= */

import { icon } from "./icons.js";

let seq = 0;

/** يُعيد HTML لعارض صور — صورة واحدة تُعرض بلا أسهم/نقاط تلقائياً */
export function renderCarousel(images = [], { size = "medium" } = {}){
  if(!images || !images.length) return "";
  const id = "car_" + (seq++);
  const sizeClass = ["small", "medium", "full"].includes(size) ? `feed-carousel--${size}` : "feed-carousel--medium";
  if(images.length === 1){
    return `<div class="feed-carousel ${sizeClass}"><img src="${images[0]}" alt="" class="feed-item__image"></div>`;
  }
  return `
    <div class="feed-carousel ${sizeClass}" data-carousel="${id}" data-index="0">
      <div class="feed-carousel__track">
        ${images.map(src => `<div class="feed-carousel__slide"><img src="${src}" alt="" class="feed-item__image"></div>`).join("")}
      </div>
      <button class="feed-carousel__nav feed-carousel__nav--prev" data-carousel-prev="${id}" aria-label="السابق">${icon("chevronRight", { size: 16 })}</button>
      <button class="feed-carousel__nav feed-carousel__nav--next" data-carousel-next="${id}" aria-label="التالي">${icon("chevronLeft", { size: 16 })}</button>
      <div class="feed-carousel__dots">
        ${images.map((_, i) => `<span class="feed-carousel__dot ${i===0?"is-active":""}" data-carousel-dot="${id}" data-dot-index="${i}"></span>`).join("")}
      </div>
    </div>
  `;
}

function applyIndex(root, id, index){
  const wrap = root.querySelector(`[data-carousel="${id}"]`);
  if(!wrap) return;
  const track = wrap.querySelector(".feed-carousel__track");
  const slides = wrap.querySelectorAll(".feed-carousel__slide");
  const clamped = Math.max(0, Math.min(index, slides.length - 1));
  track.style.transform = `translateX(${clamped * 100}%)`;
  wrap.setAttribute("data-index", String(clamped));
  wrap.querySelectorAll(".feed-carousel__dot").forEach((dot, i) => dot.classList.toggle("is-active", i === clamped));
}

/** يربط كل أزرار التنقل داخل حاوية معيّنة (استدعِه بعد حقن renderCarousel) */
export function bindCarousels(container){
  container.querySelectorAll("[data-carousel-prev]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-carousel-prev");
      const wrap = container.querySelector(`[data-carousel="${id}"]`);
      const current = Number(wrap.getAttribute("data-index"));
      applyIndex(container, id, current - 1 < 0 ? wrap.querySelectorAll(".feed-carousel__slide").length - 1 : current - 1);
    });
  });
  container.querySelectorAll("[data-carousel-next]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-carousel-next");
      const wrap = container.querySelector(`[data-carousel="${id}"]`);
      const current = Number(wrap.getAttribute("data-index"));
      const max = wrap.querySelectorAll(".feed-carousel__slide").length - 1;
      applyIndex(container, id, current + 1 > max ? 0 : current + 1);
    });
  });
  container.querySelectorAll("[data-carousel-dot]").forEach(dot => {
    dot.addEventListener("click", () => {
      applyIndex(container, dot.getAttribute("data-carousel-dot"), Number(dot.getAttribute("data-dot-index")));
    });
  });
}
