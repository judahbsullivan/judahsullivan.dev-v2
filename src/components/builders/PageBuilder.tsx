import type { Pages, PageBlocks } from "@/directus/utils/types";
import { Section } from "@/components/ui/section";
import BlockBuilder from "./BlockBuilder";
import { getProjects } from "@/directus/queries/projects";
import { getPosts } from "@/directus/queries/posts";
import type { Posts, Projects } from "@/directus/utils/types";

interface PageBuilderProps {
  pages: Pages;
}

type CardItem = {
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  published_at?: string | null;
};

// Helper function to extract image ID from cover_image or image field
function getImageId(imageValue: unknown): string | null {
  if (!imageValue) return null;
  if (typeof imageValue === 'string') {
    return imageValue.trim() === '' ? null : imageValue;
  }
  if (typeof imageValue === 'object' && imageValue && 'id' in imageValue) {
    const id = (imageValue as { id?: unknown }).id;
    return typeof id === 'string' && id.trim() !== '' ? id : null;
  }
  return null;
}

// Helper function to normalize items
function normalizeItems(items: Posts[] | Projects[], collection: string | null): CardItem[] {
  return items.map((item) => {
    const isProject = collection === 'projects' || collection === 'project';
    const imageValue = isProject ? (item as Projects).cover_image : (item as Posts).image;
    const imageId = getImageId(imageValue);
    
    return {
      slug: item.slug,
      title: item.title,
      description: item.description,
      image: imageId,
      published_at: isProject ? (item as Projects).date_created : (item as Posts).published_at
    };
  });
}

// Helper function to enrich block_collection
async function enrichBlockCollection(block: PageBlocks, blockData: Record<string, unknown>) {
  const collection = blockData.collection as string | null;
  const isProject = collection === 'projects' || collection === 'project';
  const items = isProject ? await getProjects() : await getPosts();
  
  const limit = blockData.limit;
  const limitedItems = limit && Number(limit) > 0 ? items.slice(0, Number(limit)) : items;
  const normalized = normalizeItems(limitedItems, collection);

  return {
    ...block,
    item: {
      ...blockData,
      normalized
    }
  };
}

// Helper function to enrich block_projects
async function enrichBlockProjects(block: PageBlocks, blockData: Record<string, unknown>) {
  const projects = await getProjects();
  return {
    ...block,
    item: {
      ...blockData,
      projects
    }
  };
}

// Helper function to enrich block_posts
async function enrichBlockPosts(block: PageBlocks, blockData: Record<string, unknown>) {
  // block_posts can show posts or projects based on collection field
  const collection = blockData.collection as string | null;
  const isProject = collection === 'projects' || collection === 'project';
  const items = isProject ? await getProjects() : await getPosts();
  
  const limit = blockData.limit;
  const limitedItems = limit && Number(limit) > 0 ? items.slice(0, Number(limit)) : items;
  const normalized = normalizeItems(limitedItems, collection);

  return {
    ...block,
    item: {
      ...blockData,
      normalized
    }
  };
}

export default async function PageBuilder({ pages }: PageBuilderProps) {
  const blocksWithData = await Promise.all(
    (pages?.blocks || []).map(async (block) => {
      const blockType = block.collection;
      const blockData = (block.item && typeof block.item === 'object') ? block.item : {};

      if (blockType === 'block_collection') {
        const enriched = await enrichBlockCollection(block, blockData);
        return enriched;
      }

      if (blockType === 'block_projects') {
        const enriched = await enrichBlockProjects(block, blockData);
        return enriched;
      }

      if (blockType === 'block_posts') {
        const enriched = await enrichBlockPosts(block, blockData);
        return enriched;
      }

      return block;
    })
  );

  return (
    <Section 
      fullWidth
      fullHeight
      className='px-0'
      background='bg-muted'
    >
      <BlockBuilder blocks={blocksWithData} />
    </Section>
  );
}


