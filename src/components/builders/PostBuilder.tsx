import type { Posts } from "@/directus/utils/types";

interface PostBuilderProps {
  post?: Posts;
  posts?: Posts[];
}

export default function PostBuilder({ post, posts }: PostBuilderProps) {
  if (post) {
    // Render single post
    return (
      <article className="px-6 py-12">
        <header className="max-w-3xl mx-auto mb-8">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">{post.title}</h1>
          {post.description && (
            <p className="mt-3 text-neutral-600 dark:text-neutral-300">{post.description}</p>
          )}
        </header>
        <div className="prose-theme prose-lg md:prose-xl max-w-3xl mx-auto"
             dangerouslySetInnerHTML={{ __html: post.content || "" }} />
      </article>
    );
  }

  if (posts) {
    // Render posts listing
    return (
      <div>
        <h1>Blog Posts</h1>
        {posts.map((post) => (
          <div key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.description}</p>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
