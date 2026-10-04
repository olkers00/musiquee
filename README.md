# Musiquee

Osobisty pulpit statystyk Spotify — Top 50 utworów, ulubieni artyści, albumy i historia odtwarzania, w dopracowanym, ciemnym interfejsie.

## Stos technologiczny

- **Next.js 16 (App Router, static export)** + TypeScript
- **Tailwind CSS v4** (design tokens w `app/globals.css`, szkło/`backdrop-filter`, mikroanimacje)
- **Framer Motion** — przejścia, staggered fade-in, spinning winyl
- **Recharts** — popularność Top 50, podział na gatunki
- **Spotify Web API** — OAuth 2.0 Authorization Code + PKCE, wywoływane bezpośrednio z przeglądarki (bez backendu)
- **lucide-react** — ikony

## Uruchomienie

```bash
npm install
npm run dev
```

Aplikacja domyślnie startuje w **Trybie Demo** z realistycznymi, w pełni offline'owymi danymi mockowymi — działa od razu, bez żadnej konfiguracji.

## Konfiguracja Spotify (opcjonalna)

Aby połączyć prawdziwe konto Spotify:

1. Utwórz aplikację w [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. W ustawieniach aplikacji dodaj **Redirect URI**: `http://127.0.0.1:3000/callback` (dopasuj port/domenę do środowiska, w którym uruchamiasz Musiquee — Spotify wymaga dokładnego dopasowania, w tym `127.0.0.1` zamiast `localhost`).
3. Skopiuj **Client ID** z panelu aplikacji.
4. Skopiuj `.env.local.example` do `.env.local` i uzupełnij:

   ```bash
   cp .env.local.example .env.local
   ```

   ```env
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=twoj_client_id
   NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/callback
   ```

5. Zrestartuj `npm run dev` i kliknij **„Połącz ze Spotify”** w bocznym menu.

> Musiquee używa przepływu **Authorization Code z PKCE** — nie wymaga client secret ani żadnego backendu, więc działa jako w pełni statyczna aplikacja (`next.config.ts` ma `output: "export"`). Tokeny dostępu i odświeżania trzymane są wyłącznie w przeglądarce użytkownika (`localStorage`).

### Uprawnienia (scope)

Aplikacja prosi o: `user-top-read`, `user-read-recently-played`, `user-read-private`.

### Ograniczenia publicznego Spotify Web API

- Spotify **nie udostępnia** liczby odtworzeń ani łącznego czasu słuchania — tylko rankingi Top Tracks/Artists w trzech oknach czasowych (`short_term` / `medium_term` / `long_term`) i ostatnie 50 odtworzonych utworów. Statystyki na pulpicie (popularność, gatunki, unikalni artyści) są liczone z tych właśnie danych.
- **`preview_url`** (30-sekundowa próbka audio) bywa `null` dla wielu utworów — dolny odtwarzacz wtedy przechodzi w tryb symulowanego podglądu (pasek postępu bez dźwięku, oznaczony odznaką „Podgląd demo”), zamiast się wyłączać.
- **Audio Features** (taneczność) bywają niedostępne (`403`) dla aplikacji utworzonych po zaostrzeniu polityki dostępu przez Spotify w listopadzie 2024 — dashboard wykrywa to i pokazuje „Niedostępne” zamiast się wywalać.
- **Top albumy** nie istnieją jako osobny endpoint Spotify — są wyprowadzane z albumów występujących w Twoim Top 50 utworów.

## Struktura projektu

```
app/                     trasy App Router (Pulpit, Top 50, Artyści, Albumy, Historia, /callback OAuth)
components/
  ui/                    prymitywy designu (Button, Card, Badge, Skeleton, MusicArtwork z winylem…)
  layout/                Sidebar, mobilna nawigacja, logo, AppShell
  player/                dolny pasek odtwarzacza (MiniPlayer)
  dashboard/, tracks/, artists/, albums/, history/, common/
lib/
  spotify/               PKCE OAuth, klient API, mapowanie odpowiedzi, agregacja datasetu
  mock/                  generator danych trybu demo (deterministyczny, offline)
  theme/, types/, utils/
hooks/                   useSpotify, usePlayer, useMounted
```

## Odtwarzacz próbek

Dolny pasek odtwarza prawdziwe 30-sekundowe próbki (`preview_url`) przez natywny `<audio>`, gdy są dostępne. Gdy próbka nie istnieje (typowe w Trybie Demo i dla części prawdziwych utworów), pasek symuluje 30-sekundowy podgląd bez dźwięku, żeby interfejs pozostał w pełni interaktywny.
