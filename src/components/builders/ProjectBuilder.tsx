import type { Projects } from "@/directus/utils/types";

interface ProjectBuilderProps {
  project?: Projects;
  projects?: Projects[];
}

export default function ProjectBuilder({ project, projects }: ProjectBuilderProps) {
  if (project) {
    // Render single project
    return (
      <article className="px-6 py-12">
        <header className="max-w-3xl mx-auto mb-8">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">{project.title}</h1>
          {project.description && (
            <p className="mt-3 text-neutral-600 dark:text-neutral-300">{project.description}</p>
          )}
        </header>
        <div className="prose-theme prose-lg md:prose-xl max-w-3xl mx-auto"
             dangerouslySetInnerHTML={{ __html: project.content || "" }} />
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
