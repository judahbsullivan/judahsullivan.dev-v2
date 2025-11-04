import type { Projects } from "@/directus/utils/types";

interface ProjectBuilderProps {
  project?: Projects;
  projects?: Projects[];
}

export default function ProjectBuilder({ project, projects }: ProjectBuilderProps) {
  if (project) {
    // Render single project
    return (
      <div>
        <h1>{project.title}</h1>
        <p>{project.description}</p>
        <div dangerouslySetInnerHTML={{ __html: project.content || "" }} />
      </div>
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
