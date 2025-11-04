import { Section } from '@/components/ui/section';
import { MasonGrid } from '@/components/ui/mason-grid';

interface BlockSelectedProps {
  sectionTitle?: string;
  categories?: string[];
  subtitle?: string;
  viewAllText?: string;
  viewAllHref?: string;
  images?: Array<{
    id: number | string;
    imageUrl: string;
    title?: string;
  }>;
}

function BlockSelected({ 
  sectionTitle = "Selected Work",
  categories = ['Design', 'Development', 'Branding', 'Illustration', 'Photography'],
  subtitle = "From Vision to Version",
  viewAllText = "View All Works",
  viewAllHref = "/projects",
  images = []
}: BlockSelectedProps) {
  // Convert images to posts format for MasonGrid
  const posts = images.map(img => ({
    slug: img.id.toString(),
    title: img.title || 'Image',
    description: null,
    image: img.imageUrl,
    published_at: null,
  }));

  return (
    <Section>
      <MasonGrid 
        posts={posts}
        base="project"
      />
    </Section>
  );
}

export default BlockSelected;
export { BlockSelected };
