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
    >
      <h3 className="text-lg w-1/3 md:text-xl font-medium text-black">{props?.title}</h3>
      <p className="text-sm w-1/3 text-gray-600 translate-2">{props?.description}</p>
      <div className="text-sm text-gray-500">Read More →</div>
      <div></div>
    </a>
  );
}

