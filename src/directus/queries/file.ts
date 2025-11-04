import { readFile } from "@directus/sdk";
import { client } from "../utils/cli";
import { api } from "../utils/env";

export async function getImage(fileId: string) {

  return client.request(readFile(fileId));
}

export async function fileUrl(key?: string) {


  return `${api.apiUrl}assets/${key}`;
}

export function getExtension(filename: string) {
  return filename.split(".").pop();
}

export type ThumbnailFormat = "jpg" | "png" | "webp" | "tiff";
export type ThumbnailFit = "cover" | "contain" | "inside" | "outside";

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  fit?: ThumbnailFit;
  format?: ThumbnailFormat;
  withoutEnlargement?: boolean;
}

export const getThumbnail = async (
  fileId: string,
  options?: ThumbnailOptions,
): Promise<string> => {
  const url = new URL(await fileUrl(fileId));
  if (options) {
    if (options.width) {
      url.searchParams.append("width", options.width.toFixed(0));
    }
    if (options.height) {
      url.searchParams.append("height", options.height.toFixed(0));
    }
    if (options.quality) {
      url.searchParams.append("quality", options.quality.toFixed(0));
    }
    if (options.withoutEnlargement) {
      url.searchParams.append("withoutEnlargement", "true");
    }
    if (options.fit) {
      url.searchParams.append("fit", options.fit);
    }
    if (options.format) {
      url.searchParams.append("format", options.format);
    }
  }
  return url.href;
};