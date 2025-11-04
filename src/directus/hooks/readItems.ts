import { unstable_cache } from "next/cache";
import { readItems, readItem } from "@directus/sdk";
import { client } from "../utils/cli";
import type { CustomDirectusTypes } from "../utils/types";

type CollectionName = keyof CustomDirectusTypes;

interface CacheOptions {
  tags?: string[];
  revalidate?: number | false;
}

// Type for Directus query options (simplified to avoid complex SDK type extraction)
type QueryOptions = {
  filter?: unknown;
  fields?: unknown;
  sort?: unknown;
  limit?: number;
  offset?: number;
  search?: string;
  page?: number;
  meta?: unknown;
  aggregate?: unknown;
  groupBy?: unknown;
  deep?: unknown;
} & Record<string, unknown>;

interface ReadItemsOptions<T extends CollectionName> {
  collection: T;
  query?: QueryOptions;
  cache?: CacheOptions;
}

interface ReadItemOptions<T extends CollectionName> {
  collection: T;
  id: string | number;
  query?: Omit<QueryOptions, "limit" | "offset" | "page">;
  cache?: CacheOptions;
}

/**
 * Custom readItems hook with Vercel caching and tag-based revalidation.
 * 
 * @example
 * ```ts
 * const pages = await cachedReadItems({
 *   collection: "pages",
 *   query: {
 *     filter: { status: { _eq: "published" } },
 *     fields: ["*"]
 *   },
 *   cache: {
 *     tags: ["pages"],
 *     revalidate: 3600
 *   }
 * });
 * ```
 */
export async function cachedReadItems<T extends CollectionName>(
  options: ReadItemsOptions<T>
): Promise<CustomDirectusTypes[T]> {
  const { collection, query, cache } = options;

  // Create a unique cache key based on collection and query
  const cacheKey = JSON.stringify({ collection, query });

  // If no cache options provided, fetch directly without caching
  if (!cache) {
    try {
      const result = await client.request(
        readItems(collection as never, query as never)
      );
      return result as unknown as CustomDirectusTypes[T];
    } catch (error) {
      console.error(`Directus query error for collection "${collection}":`, error);
      throw error;
    }
  }

  // Use unstable_cache with tags and revalidate options
  const cachedFetch = unstable_cache(
    async () => {
      try {
        const result = await client.request(
          readItems(collection as never, query as never)
        );
        return result as unknown as CustomDirectusTypes[T];
      } catch (error) {
        console.error(`Directus query error for collection "${collection}":`, error);
        throw error;
      }
    },
    [`directus-${collection}`, cacheKey],
    {
      tags: cache.tags || [`directus-${collection}`],
      revalidate: cache.revalidate,
    }
  );

  return await cachedFetch();
}

/**
 * Custom readItem hook with Vercel caching and tag-based revalidation.
 * Fetches a single item from a collection by ID.
 * 
 * @example
 * ```ts
 * const page = await cachedReadItem({
 *   collection: "pages",
 *   id: "123",
 *   query: {
 *     fields: ["*", { blocks: ["*"] }]
 *   },
 *   cache: {
 *     tags: ["pages", "page-123"],
 *     revalidate: 3600
 *   }
 * });
 * ```
 */
export async function cachedReadItem<T extends CollectionName>(
  options: ReadItemOptions<T>
): Promise<CustomDirectusTypes[T] extends (infer U)[] ? U : never> {
  const { collection, id, query, cache } = options;

  // Create a unique cache key based on collection, id, and query
  const cacheKey = JSON.stringify({ collection, id, query });

  // Extract the array element type for return type
  type ItemType = CustomDirectusTypes[T] extends (infer U)[] ? U : never;

  // If no cache options provided, fetch directly without caching
  if (!cache) {
    try {
      const result = await client.request(
        readItem(collection as never, id as never, query as never)
      );
      return result as unknown as ItemType;
    } catch (error) {
      console.error(`Directus query error for collection "${collection}" item "${id}":`, error);
      throw error;
    }
  }

  // Use unstable_cache with tags and revalidate options
  const cachedFetch = unstable_cache(
    async () => {
      try {
        const result = await client.request(
          readItem(collection as never, id as never, query as never)
        );
        return result as unknown as ItemType;
      } catch (error) {
        console.error(`Directus query error for collection "${collection}" item "${id}":`, error);
        throw error;
      }
    },
    [`directus-${collection}-item`, String(id), cacheKey],
    {
      tags: cache.tags || [`directus-${collection}`, `directus-${collection}-${id}`],
      revalidate: cache.revalidate,
    }
  );

  return await cachedFetch();
}

/**
 * Re-export readItems and readItem from SDK for direct use when caching is not needed
 */
export { readItems, readItem };

