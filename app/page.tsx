"use client";

import Link from "next/link";
import { ArrowRight, Flame, Music2, Sparkles, Users } from "lucide-react";
import { useSpotify } from "@/hooks/useSpotify";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { NumberOneCard } from "@/components/dashboard/number-one-card";
import { ListeningTrendChart } from "@/components/dashboard/listening-trend-chart";
import { GenreBreakdown } from "@/components/dashboard/genre-breakdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrackRow } from "@/components/tracks/track-row";
import { StatCardSkeleton, TrackRowSkeleton } from "@/components/common/skeletons";

export default function DashboardPage() {
  const { dataset, status, mode } = useSpotify();
  const isLoading = status === "connecting";
  const { stats } = dataset;
  const topTracks = dataset.topTracks.medium_term;

  return (
    <div>
      <PageHeader
        eyebrow={mode === "demo" ? "Tryb demo" : "Połączono ze Spotify"}
        eyebrowClassName={mode === "spotify" ? "text-spotify" : undefined}
        title="Pulpit"
        subtitle="Twoje statystyki Spotify — ostatnie 6 miesięcy"
      />

      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Śr. popularność"
              value={`${stats.avgPopularity}/100`}
              sublabel="w Twoim Top 50"
              icon={Sparkles}
              accent
              delay={0}
            />
            <StatCard
              label={stats.avgDanceability !== null ? "Śr. taneczność" : "Popularność artystów"}
              value={
                stats.avgDanceability !== null
                  ? `${Math.round(stats.avgDanceability)}/100`
                  : `${stats.avgArtistPopularity}/100`
              }
              sublabel={stats.avgDanceability !== null ? "wg Spotify Audio Features" : "zastępczy wskaźnik — Audio Features niedostępne"}
              icon={Music2}
              delay={0.05}
            />
            <StatCard
              label="Ulubiony gatunek"
              value={stats.topGenre}
              sublabel={`${stats.genreBreakdown[0]?.percentage ?? 0}% Twoich artystów`}
              icon={Flame}
              delay={0.1}
            />
            <StatCard
              label="Artyści"
              value={String(stats.uniqueArtists)}
              sublabel="unikalnych w Top 50"
              icon={Users}
              accent="spotify"
              delay={0.15}
            />
          </>
        )}
      </div>

      <div className="mt-4">
        <NumberOneCard track={stats.numberOneTrack} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Popularność Top 50</CardTitle>
            <span className="text-xs text-ink-faint">wg pozycji w rankingu</span>
          </CardHeader>
          <CardContent>
            <ListeningTrendChart data={stats.popularityTrend} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Gatunki</CardTitle>
          </CardHeader>
          <CardContent>
            <GenreBreakdown data={stats.genreBreakdown} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Top w ostatnich 6 miesiącach</CardTitle>
          <Link
            href="/top-tracks"
            className="flex items-center gap-1 text-xs font-medium text-accent hover:gap-1.5 transition-all"
          >
            Zobacz wszystkie 50
            <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="space-y-0.5">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <TrackRowSkeleton key={i} />)
              : topTracks.slice(0, 5).map((track, i) => <TrackRow key={track.id} track={track} rank={i + 1} index={i} />)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
