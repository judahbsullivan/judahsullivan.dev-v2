"use client";

import { type ReactNode } from "react";
import PageTransition from "@/components/globals/PageTransition";

interface TemplateProps {
  children: ReactNode;
}

export default function Template({ children }: TemplateProps) {
  return <PageTransition>{children}</PageTransition>;
}

