import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const preview = searchParams.get("preview");
  const slug = searchParams.get("slug") || "";

  if (!preview) {
    return new Response("Missing preview param", { status: 400 });
  }

  const draft = await draftMode();
  draft.enable();
  redirect(`/${slug}`);
}
