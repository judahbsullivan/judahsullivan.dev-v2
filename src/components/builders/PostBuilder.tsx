import type { Posts } from "@/directus/utils/types";
import { DirectusImage } from "@/components/ui/directus-image";

interface PostBuilderProps {
  post?: Posts;
  posts?: Posts[];
}

export default function PostBuilder({ post, posts }: PostBuilderProps) {
  if (post) {
    // Render single post
    return (
      <article className="bg-white px-4 md:px-16 py-24 space-y-16">
        {/* Post Header */}
        <div className="space-y-4 max-w-4xl">
          {post.published_at && (
            <p className="text-sm text-gray-500 uppercase tracking-widest">
              {new Date(post.published_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-gray-900">
            {post.title}
          </h1>
          {post.description && (
            <p className="text-lg text-gray-600">{post.description}</p>
          )}
        </div>

        {/* Featured Image */}
        {post.image && (
          <div className="w-full bg-accent rounded-xl flex items-center justify-center">
            <DirectusImage
              imageId={
                typeof post.image === "string"
                  ? post.image
                  : (post.image as unknown as { id?: string })?.id || ""
              }
              className="object-cover w-full rounded"
            />
          </div>
        )}

        {/* Content */}
        {post.content && (
          <div
            className="prose-theme max-w-7xl mx-auto"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />
        )}
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
