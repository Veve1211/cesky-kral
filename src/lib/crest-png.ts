"use client";

/**
 * Saves the crest drawn on the page as a PNG: the SVG is turned into an
 * image, drawn on a canvas (800 px wide, transparent background) and
 * downloaded. Nothing leaves the browser.
 */
export async function downloadCrestPng(svgId: string, fileName: string): Promise<boolean> {
  const svg = document.getElementById(svgId);
  if (!(svg instanceof SVGSVGElement)) return false;
  const [, , width, height] = (svg.getAttribute("viewBox") ?? "0 0 200 290").split(" ").map(Number);
  const scale = 4;
  const source = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("image"));
      image.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const context = canvas.getContext("2d");
    if (!context) return false;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return false;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    return true;
  } catch {
    return false;
  } finally {
    URL.revokeObjectURL(url);
  }
}
