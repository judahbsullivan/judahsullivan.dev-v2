"use client";
import { lazy, Suspense } from "react";
import type { PageBlocks } from "@/directus/utils/types";

// All block components are Client Components for animations
const blockComponents = {
  block_hero: lazy(() => import("@/components/blocks/blockHero")),
  block_form: lazy(() => import("@/components/blocks/blockForm")),
  block_richtext: lazy(() => import("@/components/blocks/blockRichText")),
  block_gallery: lazy(() => import("@/components/blocks/blockGallery")),
  block_experience: lazy(() => import("@/components/blocks/blockExperience")),
  block_description: lazy(() => import("@/components/blocks/blockDescription")),
  block_posts: lazy(() => import("@/components/blocks/blockPosts")),
  block_collection: lazy(() => import("@/components/blocks/blockCollection")),
  block_timeline: lazy(() => import("@/components/blocks/blockTimeline")),
  block_heading: lazy(() => import("@/components/blocks/blockHeading")),
  block_list: lazy(() => import("@/components/blocks/blockExperience")),
  block_projects: lazy(() => import("@/components/blocks/blockProjects")),
};

export default function BlockBuilder({ blocks }: { blocks?: PageBlocks[] | null }) {
  return (
    <>
      {blocks?.map((block) => {
        const blockType = block.collection; // e.g. "block_hero"
        const BlockComponent = blockType ? blockComponents[blockType as keyof typeof blockComponents] : null;
        
        if (!BlockComponent) {
          return (
            <div key={block.id}>
              <p>Unknown block type: {blockType}</p>
              <pre>{JSON.stringify(block.item, null, 2)}</pre>
            </div>
          );
        }
        
        // Extract the actual block data from block.item and spread it as props
        // Ensure block.item is an object, not a string reference
        const blockData = (block.item && typeof block.item === 'object') ? block.item : {};
        
        return (
          <Suspense key={block.id} fallback={<div>Loading...</div>}>
            <BlockComponent {...blockData} />
          </Suspense>
        );
      })}
    </>
  );
}
