export function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function changeExtension(filePath: string, newExt: string): string {
  return filePath.replace(/\.[^/.]+$/, newExt.startsWith(".") ? newExt : "." + newExt);
}

export function round4(num: number) {
  return Math.round(num * 10000) / 10000
}