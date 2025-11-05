import { Link } from "./link";

interface ItemListProps {
  id?: string;
  slug?: string | null;
  title?: string | null;
  description?: string | null;
}

export function ItemList(props: ItemListProps) {
  const href = `/project/${props.slug}`;

  return (
    <a
      id={`${props?.id}`}
      href={href}
      className="flex py-12 w-full justify-between"
      aria-label={props?.title ? `Read more about ${props.title}` : 'Read more about this project'}
    >
      <h3 className="text-lg w-1/3 md:text-xl font-medium text-black">{props?.title}</h3>
      <p className="text-sm w-1/3 text-gray-600 translate-2">{props?.description}</p>
      <span className="text-sm text-gray-500">
        {props?.title ? `Read More about ${props.title} →` : 'Read More →'}
      </span>
      <div></div>
    </a>
  );
}

