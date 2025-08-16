export const MIN_DELTA = 0.5;

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

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getFileName(fullPath: string): string {
  return fullPath.split(/[/\\]/).pop() || "";
}