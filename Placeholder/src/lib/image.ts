/**
 * Client-only image helpers for logo/stamp uploads. Images are downscaled to a
 * sane max dimension and stored as data URLs (in localStorage or a Supabase text
 * column) — small enough not to blow the storage quota, and self-contained so
 * html2canvas/jsPDF can render them into the PDF with no CORS or network fetch.
 */

const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

/** Read + downscale an uploaded image file into a PNG data URL (longest side ≤ maxDim). */
export async function fileToDataUrl(file: File, maxDim = 360): Promise<string> {
  if (!ACCEPTED.includes(file.type)) {
    throw new Error("Please choose a PNG, JPG, WEBP, or SVG image.");
  }
  const raw = await readAsDataUrl(file);
  // SVGs are already tiny and scale losslessly — keep as-is.
  if (file.type === "image/svg+xml") return raw;

  const img = await loadImage(raw);
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return raw; // Fallback: store the original if canvas is unavailable.
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/png");
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("That image couldn't be loaded."));
    img.src = src;
  });
}
