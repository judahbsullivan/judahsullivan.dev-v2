import { cachedReadItems } from "../hooks/readItems";
import type { Globals } from "../utils/types";

export async function getGlobals(): Promise<Globals | undefined> {
  try {
    const globals = await cachedReadItems({
      collection: "globals",
      query: {
        fields: ["*", "favicon.*", "logo.*", "logo_dark_mode.*"],
      },
      cache: {
        tags: ["globals"],
      },
    });
    // Globals is a singleton, so readItems returns an array with one item
    return (globals as unknown as Globals[])?.at(0);
  } catch (error) {
    console.error("Error fetching globals:", error);
    throw error;
  }
}


