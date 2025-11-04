import { ReactNode } from "react";
import { Navigation } from "@/components/globals/navigation/Navigation";
import { Footer } from "@/components/globals/footer/Footer";
import { getNavigationItems } from "@/directus/queries/navigation";

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
  params?: Promise<{ slug: [] }>;
}) {
  let navItems = null;
  try {
    navItems = await getNavigationItems("main");
  } catch (error) {
    console.error("Error fetching navigation:", error);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation navItems={navItems} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
