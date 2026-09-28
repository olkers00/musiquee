# Musiquee

Osobisty pulpit statystyk słuchania Apple Music — Top 50 utworów, ulubieni artyści, albumy i historia odtwarzania, w dopracowanym, ciemnym interfejsie inspirowanym macOS / Apple Music.

## Stos technologiczny

- **Next.js 16 (App Router)** + TypeScript
- **Tailwind CSS v4** (design tokens w `app/globals.css`, szkło/`backdrop-filter`, mikroanimacje)
- **Framer Motion** — przejścia, staggered fade-in, spinning winyl
- **Recharts** — trend słuchania, podział na gatunki
- **MusicKit JS v3** — integracja z Apple Music (ładowana dynamicznie w przeglądarce)
- **lucide-react** — ikony

## Uruchomienie

```bash
npm install
npm run dev
```

Aplikacja domyślnie startuje w **Trybie Demo** z realistycznymi (ale syntetycznymi, deterministycznie generowanymi) danymi — działa od razu, bez żadnej konfiguracji.

## Konfiguracja Apple Music (opcjonalna)

Aby połączyć prawdziwe konto Apple Music, potrzebujesz **developer tokena** MusicKit — podpisanego JWT wystawianego przez Twoje konto Apple Developer.

1. Zapisz się do [Apple Developer Program](https://developer.apple.com/programs/) (wymaga płatnego członkostwa) i włącz capability **MusicKit**.
2. W **Certificates, Identifiers & Profiles → Keys** utwórz nowy klucz z włączonym MusicKit. Pobierz plik `AuthKey_XXXXXXXXXX.p8` (Apple pozwala pobrać go tylko raz!).
3. Zanotuj:
   - **Key ID** (10 znaków, widoczny przy kluczu),
   - **Team ID** (widoczny w prawym górnym rogu portalu deweloperskiego).
4. Wygeneruj token dołączonym skryptem:

   ```bash
   npm run generate:apple-token -- --key ./AuthKey_XXXXXXXXXX.p8 --keyId XXXXXXXXXX --teamId YYYYYYYYYY
   ```

5. Skopiuj wypisany token do `.env.local` (na podstawie `.env.local.example`):

   ```bash
   cp .env.local.example .env.local
   ```

   ```env
   NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlhYWFhYWFhYWFgifQ...
   ```

6. Zrestartuj `npm run dev` i kliknij **„Połącz z Apple Music”** w bocznym menu — MusicKit JS poprosi o autoryzację i logowanie przez Apple ID z aktywną subskrypcją Apple Music.

> **Ważne:** developer token jest bezpieczny do wysyłki do przeglądarki (stąd prefiks `NEXT_PUBLIC_`) — sam w sobie nie daje dostępu do konta użytkownika, dopóki użytkownik nie autoryzuje aplikacji. Plik `AuthKey_*.p8` (prywatny klucz podpisujący) **nigdy** nie powinien trafić do repozytorium ani do przeglądarki — jest ignorowany przez `.gitignore` i używany wyłącznie lokalnie przez skrypt generujący token. Token wygasa najpóźniej po 6 miesiącach — wygeneruj nowy, gdy przestanie działać.

### Ograniczenia publicznego API Apple Music

Apple Music API nie udostępnia dokładnych liczników odtworzeń ani historycznych statystyk „Top miesiąca” — tylko *Recently Played* i *Heavy Rotation*. Gdy Musiquee jest połączone z prawdziwym kontem, rankingi Top 50 / Top artyści / Top albumy są **szacowane** na podstawie tych sygnałów (stąd też słowo „szacowany” przy łącznym czasie słuchania w interfejsie). Tryb Demo pokazuje w pełni deterministyczne, realistyczne dane mockowe, dokładnie odzwierciedlające docelowy UI.

## Struktura projektu

```
app/                     trasy App Router (Pulpit, Top 50, Artyści, Albumy, Historia)
components/
  ui/                    prymitywy designu (Button, Card, Badge, Skeleton, MusicArtwork z winylem…)
  layout/                Sidebar, mobilna nawigacja, logo, AppShell
  player/                dolny pasek odtwarzacza (MiniPlayer)
  dashboard/, tracks/, artists/, albums/, history/, common/
lib/
  musickit/              serwis MusicKit JS + provider/context (logika oddzielona od UI)
  demo/                  generator danych trybu demo (deterministyczny, offline)
  player/                silnik syntezowanego podglądu audio dla trybu demo
  types/, utils/
hooks/                   useMusicKit, usePlayer, useMounted
scripts/                 generator developer tokena Apple Music
```

## Uwaga o podglądzie audio w Trybie Demo

Prawdziwe 30-sekundowe próbki (`previewUrl`) są dostępne tylko dla utworów pobranych z prawdziwego Apple Music API. W Trybie Demo — gdzie nie ma dostępu do plików audio — dolny odtwarzacz generuje deterministyczny, ambientowy podkład (Web Audio API) na czas trwania „podglądu”, aby interfejs odtwarzacza był w pełni interaktywny bez zależności sieciowych.
