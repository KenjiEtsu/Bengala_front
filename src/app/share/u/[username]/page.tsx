import { ShareUserClient } from "./share-user-client";

export default async function ShareUserPage({
  params
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <ShareUserClient username={username} />;
}

