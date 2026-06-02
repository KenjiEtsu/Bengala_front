import { ShareLookupClient } from "./share-lookup-client";
import { Suspense } from "react";

export default function ShareIndexPage() {
  return (
    <Suspense>
      <ShareLookupClient />
    </Suspense>
  );
}
