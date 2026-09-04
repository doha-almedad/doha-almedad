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
          <p class="crop-editor__gesture-hint">حرّك الصورة بإصبعك، وقرّب أو بعّد بإصبعين</p>
          <div class="crop-editor__actions"><button type="button" class="btn btn-ghost" data-crop-cancel>إلغاء</button><button type="button" class="btn btn-primary" data-crop-save>اعتماد الصورة</button></div>
        </div>`;
      document.body.appendChild(overlay);

      const canvas = overlay.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      let zoomFactor = 1, offsetX = 0, offsetY = 0;
      const pointers = new Map();

      function setAspect(value){
        selectedAspect = value === "original" ? img.naturalWidth / img.naturalHeight : Number(value);
        width = selectedAspect < 1 ? Math.round(outputWidth * selectedAspect) : outputWidth;
        height = Math.round(width / selectedAspect);
        canvas.width = width; canvas.height = height;
        zoomFactor = 1; offsetX = 0; offsetY = 0; pointers.clear();
        draw();
      }

      function clampOffsets(drawW, drawH){
        const maxX=Math.max(0,(drawW-width)/2), maxY=Math.max(0,(drawH-height)/2);
        offsetX=Math.max(-maxX,Math.min(maxX,offsetX));
        offsetY=Math.max(-maxY,Math.min(maxY,offsetY));
      }

      function draw(){
        const base = Math.max(width / img.naturalWidth, height / img.naturalHeight);
        const scale = base * zoomFactor;
        const drawW = img.naturalWidth * scale;
        const drawH = img.naturalHeight * scale;
        clampOffsets(drawW,drawH);
        const x = (width - drawW) / 2 + offsetX;
        const y = (height - drawH) / 2 + offsetY;
        ctx.fillStyle = "#F8ECD9";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, x, y, drawW, drawH);
      }

      function close(value){
        overlay.remove();
        URL.revokeObjectURL(imageUrl);
        resolve(value);
      }
      const pointInCanvas=e=>{const rect=canvas.getBoundingClientRect();return{x:(e.clientX-rect.left)*(canvas.width/rect.width),y:(e.clientY-rect.top)*(canvas.height/rect.height)};};
      const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
      const midpoint=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
      canvas.addEventListener("pointerdown",e=>{e.preventDefault();canvas.setPointerCapture?.(e.pointerId);pointers.set(e.pointerId,pointInCanvas(e));});
      canvas.addEventListener("pointermove",e=>{
        if(!pointers.has(e.pointerId))return;e.preventDefault();
        const previous=[...pointers.values()], next=pointInCanvas(e), old=pointers.get(e.pointerId);pointers.set(e.pointerId,next);
        if(pointers.size===1){offsetX+=next.x-old.x;offsetY+=next.y-old.y;}
        else if(pointers.size>=2){const current=[...pointers.values()].slice(0,2), before=previous.slice(0,2);const oldDistance=distance(before[0],before[1]),newDistance=distance(current[0],current[1]);if(oldDistance>0)zoomFactor=Math.max(1,Math.min(4,zoomFactor*(newDistance/oldDistance)));const oldMid=midpoint(before[0],before[1]),newMid=midpoint(current[0],current[1]);offsetX+=newMid.x-oldMid.x;offsetY+=newMid.y-oldMid.y;}
        draw();
      });
      const release=e=>pointers.delete(e.pointerId);
      canvas.addEventListener("pointerup",release);canvas.addEventListener("pointercancel",release);
      canvas.addEventListener("wheel",e=>{e.preventDefault();zoomFactor=Math.max(1,Math.min(4,zoomFactor*(e.deltaY<0?1.08:.92)));draw();},{passive:false});
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
