export function getApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured !== undefined) {
    return configured.replace(/\/$/, "");
  }
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    // Same-origin deployment (e.g. Vercel Services or Nginx reverse proxy)
    return "";
  }
  return "http://localhost:8000";
}

export const API_BASE = getApiBase();

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function getDownloadUrl(downloadId: string, deleteAfter = false): string {
  return `${getApiBase()}/api/files/download/${downloadId}${deleteAfter ? "?delete_after=true" : ""}`;
}

export function dataUriToBlobUrl(dataUri: string): string | null {
  try {
    const [header, b64] = dataUri.split(",", 2);
    if (!header || !b64) return null;
    const mimeMatch = header.match(/data:([^;]+);base64/i);
    const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export async function parseApiError(response: Response, defaultMessage: string): Promise<string> {
  if (response.status === 413) {
    return "File is too large for serverless upload limit. Please try a smaller file (under 4.5MB on Vercel) or run via Docker/VPS.";
  }
  try {
    const data = await response.json();
    if (data.detail) {
      if (typeof data.detail === "string") return data.detail;
      if (Array.isArray(data.detail) && data.detail[0]?.msg) return data.detail[0].msg;
    }
  } catch {
    // fallback
  }
  return defaultMessage;
}
