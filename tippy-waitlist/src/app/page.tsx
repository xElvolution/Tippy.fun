import { Suspense } from "react";
import { WaitlistPage } from "@/components/WaitlistPage";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-muted">
          <span className="text-sm font-medium">Loading…</span>
        </div>
      }
    >
      <WaitlistPage />
    </Suspense>
  );
}
