import { cachedReadItems } from "../hooks/readItems";
import type { Pages } from "../utils/types";

export async function getPages(): Promise<Pages[]> {
  try {
    const pages = await cachedReadItems({
      collection: "pages",
      query: {
        filter: {
          status: { _eq: "published" },
        },
        fields: [
          "*",
          {
            blocks: [
              "*",
              {
                item: [
                  "*.*.*.*"
                ]
              }
            ]
          }
        ],
      },
      cache: {
        tags: ["pages"],
      },
    });
    return pages as Pages[];
  } catch (error) {
    console.error("Directus query error:", error);
    throw error;
  }
}

export async function getPageBySlug(slug: string): Promise<Pages | null> {
  try {
    // Use the slug as-is since it's already formatted correctly
    const searchSlug = slug;

    const pages = await cachedReadItems({
      collection: "pages",
      query: {
        filter: {
          permalink: { _eq: searchSlug },
          status: { _eq: "published" },
        },
        fields: [
          "*",
          {
          blocks: ["*.*.*.*",]
          }
        ],
        limit: 1,
      },
      cache: {
        tags: ["pages"],
      },
    });

    return pages[0] as Pages || null;
  } catch (error) {
    console.error("Directus query error:", error);
    throw error;
  }
}




