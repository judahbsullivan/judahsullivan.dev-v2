import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const preview = searchParams.get("preview");

  if (preview) {
    return new Response(
      "Cannot disable preview mode while preview param is present.",
      { status: 400 },
    );
  }

  const draft = await draftMode();
  draft.disable();
  redirect("/");
}
