import { DirectusImage } from "./directus-image";
import { PillLink } from "./pill-link";

interface ItemCardProps {
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  published_at?: string | null;
}

export function ItemCard(props: ItemCardProps) {
  const href = `/project/${props.slug}`;

  return (
    <article className="group relative flex flex-col bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200">
      {props.image && typeof props.image !== 'string' && (
        <div className="h-48 w-full overflow-hidden">
          <DirectusImage
            imageId={props.image as string}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {props.title && (
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">{props.title}</h3>
        )}

        {props.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{props.description}</p>
        )}

        <div className="mt-auto">
          <PillLink href={href} className="w-full justify-center">
            View Project
          </PillLink>
        </div>
      </div>
    </article>
  );
}

