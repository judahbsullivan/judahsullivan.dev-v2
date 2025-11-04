import { cachedReadItem } from "../hooks/readItems";
import type { Navigation } from "../utils/types";

export async function getNavigationItems(nav: "main" | "footer" = "main"): Promise<Navigation | null> {
  try {
    const navigation = await cachedReadItem({
      collection: "navigation",
      id: nav,
      query: {
        fields: [
          {
            items: [
              "*",
              { page: ["permalink"] },
              {
                children: [
                  "*",
                  { page: ["permalink"] },
                  {
                    children: ["*", { section: ["*"] }, { page: ["permalink"] }],
                  },
                ],
              },
            ],
          },
        ],
      },
      cache: {
        tags: ["navigation", `navigation-${nav}`],
      },
    });
    return navigation as Navigation | null;
  } catch (error) {
    console.error("Error fetching navigation items:", error);
    throw error;
  }
}

