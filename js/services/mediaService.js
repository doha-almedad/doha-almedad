/* =========================================================
   دوحة المداد — mediaService.js
   يضغط أي صورة يرفعها العضو إلى حد أقصى معقول للأبعاد قبل
   تخزينها، مع الحفاظ على أبعادها الأصلية بالكامل (بلا اقتصاص)
   ========================================================= */

const MAX_DIMENSION = 1000; // بكسل — أطول ضلع للصورة بعد الضغط

export function resizeImageFile(file, maxDimension = MAX_DIMENSION){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if(width > maxDimension || height > maxDimension){
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/** محرّر قص بسيط: تكبير وتحريك الصورة داخل إطار واضح قبل الحفظ. */
export function cropImageFile(file, { aspectRatio = 16/9, outputWidth = 1000, title = "ضبط الصورة", allowTemplates = true } = {}){
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onerror = () => { URL.revokeObjectURL(imageUrl); reject(new Error("تعذر فتح الصورة")); };
    img.onload = () => {
      let selectedAspect = aspectRatio;
      let width = outputWidth;
      let height = Math.round(width / selectedAspect);
      const overlay = document.createElement("div");
      overlay.className = "crop-editor";
      overlay.innerHTML = `
        <div class="crop-editor__panel" role="dialog" aria-modal="true" aria-label="${title}">
          <div class="crop-editor__head"><h3>${title}</h3><button type="button" data-crop-cancel aria-label="إغلاق">×</button></div>
          ${allowTemplates ? `<div class="crop-editor__templates" aria-label="اختيار قالب الصورة">
            <button type="button" data-crop-template="1.7778" class="${Math.abs(aspectRatio-16/9)<.01?"is-active":""}">عرضي</button>
            <button type="button" data-crop-template="1" class="${aspectRatio===1?"is-active":""}">مربّع</button>
            <button type="button" data-crop-template="0.75" class="${Math.abs(aspectRatio-.75)<.01?"is-active":""}">طولي</button>
            <button type="button" data-crop-template="original">الأبعاد الأصلية</button>
          </div>` : ""}
          <div class="crop-editor__frame"><canvas width="${width}" height="${height}"></canvas></div>
          <div class="crop-editor__controls">
            <label>التقريب <input type="range" data-crop-zoom min="100" max="220" value="100"></label>
            <label>تحريك أفقي <input type="range" data-crop-x min="-100" max="100" value="0"></label>
            <label>تحريك عمودي <input type="range" data-crop-y min="-100" max="100" value="0"></label>
          </div>
          <div class="crop-editor__actions"><button type="button" class="btn btn-ghost" data-crop-cancel>إلغاء</button><button type="button" class="btn btn-primary" data-crop-save>اعتماد الصورة</button></div>
        </div>`;
      document.body.appendChild(overlay);

      const canvas = overlay.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const zoom = overlay.querySelector("[data-crop-zoom]");
      const moveX = overlay.querySelector("[data-crop-x]");
      const moveY = overlay.querySelector("[data-crop-y]");

      function setAspect(value){
        selectedAspect = value === "original" ? img.naturalWidth / img.naturalHeight : Number(value);
        width = selectedAspect < 1 ? Math.round(outputWidth * selectedAspect) : outputWidth;
        height = Math.round(width / selectedAspect);
        canvas.width = width; canvas.height = height;
        zoom.value = 100; moveX.value = 0; moveY.value = 0;
        draw();
      }

      function draw(){
        const base = Math.max(width / img.naturalWidth, height / img.naturalHeight);
        const scale = base * (Number(zoom.value) / 100);
        const drawW = img.naturalWidth * scale;
        const drawH = img.naturalHeight * scale;
        const extraX = Math.max(0, (drawW - width) / 2);
        const extraY = Math.max(0, (drawH - height) / 2);
        const x = (width - drawW) / 2 + extraX * (Number(moveX.value) / 100);
        const y = (height - drawH) / 2 + extraY * (Number(moveY.value) / 100);
        ctx.fillStyle = "#F8ECD9";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, x, y, drawW, drawH);
      }

      function close(value){
        overlay.remove();
        URL.revokeObjectURL(imageUrl);
        resolve(value);
      }
      [zoom, moveX, moveY].forEach(input => input.addEventListener("input", draw));
      overlay.querySelectorAll("[data-crop-template]").forEach(btn => btn.addEventListener("click", () => {
        overlay.querySelectorAll("[data-crop-template]").forEach(x => x.classList.remove("is-active"));
        btn.classList.add("is-active"); setAspect(btn.dataset.cropTemplate);
      }));
      overlay.querySelectorAll("[data-crop-cancel]").forEach(btn => btn.addEventListener("click", () => close(null)));
      overlay.querySelector("[data-crop-save]").addEventListener("click", () => { draw(); close(canvas.toDataURL("image/jpeg", .9)); });
      draw();
    };
    img.src = imageUrl;
  });
}
