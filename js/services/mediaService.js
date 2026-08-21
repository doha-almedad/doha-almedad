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
