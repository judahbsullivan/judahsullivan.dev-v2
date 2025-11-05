"use client";

import {
  SiTailwindcss,
  SiTypescript,
  SiPython,
  SiReact,
  SiGithub,
  SiVercel,
  SiNodedotjs,
  SiDocker,
  SiGraphql,
} from 'react-icons/si';
import { RiNextjsFill } from 'react-icons/ri';
import { LiaAws } from 'react-icons/lia';
import { TbBrandThreejs } from 'react-icons/tb';
import { IconType } from 'react-icons';

interface LinkBoxProps {
  Icon: IconType;
  href: string;
  label?: string;
}

function LinkBox({ Icon, href, label }: LinkBoxProps) {
  return (
    <a
      href={href}
      className="relative grid h-20 w-full place-content-center sm:h-28 md:h-36 hover:bg-neutral-900 transition-colors"
      aria-label={label || 'Technology link'}
    >
      <Icon className="text-xl sm:text-3xl lg:text-4xl" aria-hidden="true" />
    </a>
  );
}

export function ClipPathLinks() {
  return (
    <div className="divide-y divide-neutral-900 border border-neutral-900">
      <div className="grid grid-cols-2 divide-x divide-neutral-900">
        <LinkBox Icon={RiNextjsFill} href="#" label="Next.js" />
        <LinkBox Icon={SiReact} href="#" label="React" />
      </div>
      <div className="grid grid-cols-4 divide-x divide-neutral-900">
        <LinkBox Icon={LiaAws} href="#" label="AWS" />
        <LinkBox Icon={SiTailwindcss} href="#" label="Tailwind CSS" />
        <LinkBox Icon={SiTypescript} href="#" label="TypeScript" />
        <LinkBox Icon={TbBrandThreejs} href="#" label="Three.js" />
      </div>
      <div className="grid grid-cols-3 divide-x divide-neutral-900">
        <LinkBox Icon={SiDocker} href="#" label="Docker" />
        <LinkBox Icon={SiGraphql} href="#" label="GraphQL" />
        <LinkBox Icon={SiGithub} href="#" label="GitHub" />
      </div>
    </div>
  );
}

