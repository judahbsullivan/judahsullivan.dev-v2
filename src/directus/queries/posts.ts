import { cachedReadItems } from "../hooks/readItems";
import type { Posts } from "../utils/types";

export async function getPosts(): Promise<Posts[]> {
  try {
    const posts = await cachedReadItems({
      collection: "posts",
      query: {
        filter: {
          status: { _eq: "published" },
        },
        fields: ["*"],
        sort: ["-published_at"],
      },
      cache: {
        tags: ["posts"],
      },
    });
    return posts as Posts[];
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
}

export async function getPostBySlug(slug: string): Promise<Posts | null> {
  try {
    const posts = await cachedReadItems({
      collection: "posts",
      query: {
        filter: {
          slug: { _eq: slug },
          status: { _eq: "published" },
        },
        fields: ["*"],
        limit: 1,
      },
      cache: {
        tags: ["posts"],
      },
    });
    return posts[0] as Posts || null;
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    throw error;
  }
}


