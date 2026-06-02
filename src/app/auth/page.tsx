import { Suspense } from "react";
import { AuthClient } from "./ui";

export default function AuthPage() {
  return (
    <Suspense>
      <AuthClient />
    </Suspense>
  );
}

