import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSessionUser();

  if (session) {
    redirect("/board");
  } else {
    redirect("/login");
  }
}
