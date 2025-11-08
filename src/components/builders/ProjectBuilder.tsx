import type { Projects } from "@/directus/utils/types";
import { DirectusImage } from "@/components/ui/directus-image";
import { PillLink } from "@/components/ui/pill-link";

interface ProjectBuilderProps {
  project?: Projects;
  projects?: Projects[];
}

export default function ProjectBuilder({ project, projects }: ProjectBuilderProps) {
  if (project) {
    // Render single project
    return (
      <article className="bg-white px-4 md:px-16 py-24 space-y-16">
        {/* Header */}
        <div className="space-y-4 max-w-4xl">
          <p className="text-sm text-gray-500 uppercase tracking-widest">
            {project.date_created && new Date(project.date_created).toLocaleDateString()}
          </p>
          <h1 className="tracking-tighter text-[10vw] inline-block text-pretty break-keep leading-[.99] uppercase text-center">
            {project.title}
          </h1>
          {project.description && (
            <p className="text-lg text-gray-600">{project.description}</p>
          )}

          {/* Cover Image */}
          {project.cover_image && (
            <div className="w-full bg-accent rounded-xl flex items-center justify-center">
              <DirectusImage
                imageId={
                  typeof project.cover_image === "string"
                    ? project.cover_image
                    : (project.cover_image as unknown as { id?: string })?.id || ""
                }
                className="object-cover w-full rounded"
              />
            </div>
          )}
        </div>

        {/* Divider + Button */}
        <div className="py-12 relative z-0 w-full">
          <hr className="relative z-0" />
          {(() => {
            const liveUrl =
              (project as unknown as { url?: string })?.url ||
              (project as unknown as { project_url?: string })?.project_url;
            if (!liveUrl) return null;
            return (
              <PillLink
                href={liveUrl}
                className="absolute z-10 right-12 -top-12 md:right-24 md:-top-24"
                target={liveUrl.startsWith("http") ? "_blank" : undefined}
                rel={liveUrl.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                See Live Site
              </PillLink>
            );
          })()}
        </div>

        {/* Content */}
        {project.content && (
          <div
            className="prose-theme prose-lg max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: project.content || "" }}
          />
        )}
      </article>
    );
  }

  if (projects) {
    // Render projects listing
    return (
      <div>
        <h1>Projects</h1>
        {projects.map((project) => (
          <div key={project.id}>
            <h2>{project.title}</h2>
            <p>{project.description}</p>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
