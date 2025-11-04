import type { Posts } from "@/directus/utils/types";

interface PostBuilderProps {
  post?: Posts;
  posts?: Posts[];
}

export default function PostBuilder({ post, posts }: PostBuilderProps) {
  if (post) {
    // Render single post
    return (
      <div>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.content || "" }} />
      </div>
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
