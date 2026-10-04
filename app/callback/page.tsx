"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, TriangleAlert } from "lucide-react";
import { exchangeCodeForToken, SpotifyAuthError } from "@/lib/spotify/auth";
import { useSpotify } from "@/hooks/useSpotify";
import { Button } from "@/components/ui/button";

/** Reads the auth-code redirect off window.location directly (not
 *  next/navigation's useSearchParams) so this page needs no Suspense
 *  boundary and stays trivially static-exportable. */
export default function CallbackPage() {
  const { notifyAuthenticated } = useSpotify();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const authError = params.get("error");

    async function run() {
      if (authError) throw new SpotifyAuthError("Autoryzacja Spotify została odrzucona.");
      if (!code || !state) throw new SpotifyAuthError("Brak kodu autoryzacji w odpowiedzi Spotify.");
      await exchangeCodeForToken(code, state);
      notifyAuthenticated();
      router.replace("/");
    }

    run().catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[Musiquee/Spotify OAuth] Callback failed:", err);
      setError(err instanceof SpotifyAuthError ? err.message : "Nie udało się połączyć ze Spotify.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      {error ? (
        <>
          <TriangleAlert className="h-8 w-8 text-accent" />
          <p className="max-w-sm text-sm text-ink-soft">{error}</p>
          <Link href="/">
            <Button variant="secondary">Wróć do pulpitu</Button>
          </Link>
        </>
      ) : (
        <>
          <Loader2 className="h-6 w-6 animate-spin text-spotify" />
          <p className="text-sm text-ink-soft">Łączenie ze Spotify…</p>
        </>
      )}
    </div>
  );
}
