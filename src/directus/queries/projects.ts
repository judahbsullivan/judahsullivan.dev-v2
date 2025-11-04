import { cachedReadItems } from "../hooks/readItems";
import type { Projects } from "../utils/types";

export async function getProjects(): Promise<Projects[]> {
  try {
    const projects = await cachedReadItems({
      collection: "projects",
      query: {
        filter: {
          status: { _eq: "published" },
        },
        fields: ["*"],
        sort: ["sort"],
      },
      cache: {
        tags: ["projects"],
      },
    });
    return projects as Projects[];
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
}

export async function getProjectBySlug(slug: string): Promise<Projects | null> {
  try {
    const projects = await cachedReadItems({
      collection: "projects",
      query: {
        filter: {
          slug: { _eq: slug },
          status: { _eq: "published" },
        },
        fields: ["*"],
        limit: 1,
      },
      cache: {
        tags: ["projects"],
      },
    });
    return projects[0] as Projects || null;
  } catch (error) {
    console.error("Error fetching project by slug:", error);
    throw error;
  }
}
