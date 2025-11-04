import { getPageBySlug } from "@/directus/queries/pages";
import { getPostBySlug } from "@/directus/queries/posts";
import { getProjectBySlug } from "@/directus/queries/projects";
import { notFound } from "next/navigation";
import PageBuilder from "@/components/builders/PageBuilder";
import PostBuilder from "@/components/builders/PostBuilder";
import ProjectBuilder from "@/components/builders/ProjectBuilder";
import type { Metadata } from "next";

type Params = { slug?: string[] };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const slugArray = slug || [];
  const slugString = slugArray.join("/");
  const pathname = `/${slugString}`;

  try {
    const searchPath = slugArray.length === 0 ? "/" : pathname;
    const page = await getPageBySlug(searchPath);

    if (!page) {
      return {
        title: "Page Not Found",
        description: "The requested page could not be found.",
      };
    }

    const seoDescription = 
      page.seo && 
      typeof page.seo === 'object' && 
      'seo_description' in page.seo && 
      typeof page.seo.seo_description === 'string'
        ? page.seo.seo_description
        : null;

    return {
      title: page.title || "Untitled Page",
      description: seoDescription || page.title || "No description available",
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error",
      description: "An error occurred while loading the page.",
    };
  }
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const slugArray = slug || [];
  const slugString = slugArray.join("/");
  const pathname = `/${slugString}`;

  const isPost = pathname.startsWith("/blog/") && slugArray.length === 2;
  const isProject = pathname.startsWith("/projects/") && slugArray.length === 2;
  const isPage = !isPost && !isProject;

  let post, project, page;

  try {
    if (isPost) {
      post = await getPostBySlug(slugArray[1]);
      if (!post) {
        notFound();
      }
    } else if (isProject) {
      project = await getProjectBySlug(slugArray[1]);
      if (!project) {
        notFound();
      }
    } else if (isPage) {
      const searchPath = slugArray.length === 0 ? "/" : pathname;
      page = await getPageBySlug(searchPath);
      if (!page) {
        notFound();
      }
    } else {
      notFound();
    }
  } catch (error) {
    console.error("Error loading page:", error);
    notFound();
  }

  if (post) {
    return <PostBuilder post={post} />;
  }

  if (project) {
    return <ProjectBuilder project={project} />;
  }

  if (page) {
    return <PageBuilder pages={page} />;
  }

  notFound();
}
