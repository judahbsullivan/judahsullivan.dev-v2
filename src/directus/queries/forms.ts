import { cachedReadItems, cachedReadItem } from "../hooks/readItems";
import type { Forms } from "../utils/types";

export async function getForms(): Promise<Forms[]> {
  try {
    const forms = await cachedReadItems({
      collection: "forms",
      query: {
        filter: {
          is_active: { _eq: true },
        },
        fields: [
          "*",
          {
            fields: [
              "*"
            ]
          }
        ],
        sort: ["sort"],
      },
      cache: {
        tags: ["forms"],
      },
    });
    return forms as Forms[];
  } catch (error) {
    console.error("Error fetching forms:", error);
    throw error;
  }
}

export async function getFormById(id: string): Promise<Forms | null> {
  try {
    const form = await cachedReadItem({
      collection: "forms",
      id,
      query: {
        fields: [
          "*",
          {
            fields: [
              "*"
            ]
          }
        ],
      },
      cache: {
        tags: ["forms", `form-${id}`],
      },
    });
    return form as Forms | null;
  } catch (error) {
    console.error("Error fetching form by id:", error);
    throw error;
  }
}


