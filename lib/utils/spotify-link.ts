/** Opens a Spotify web URL (track/artist/album) in a new tab. No-ops when
 *  the URL is missing so handlers can call it unconditionally. */
export function openSpotifyLink(url: string | null | undefined): void {
  if (url) window.open(url, "_blank", "noopener,noreferrer");
}
