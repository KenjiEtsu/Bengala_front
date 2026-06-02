import { redirect } from "next/navigation";

export default async function TrackPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  redirect(`/share/${encodeURIComponent(token)}`);
}
