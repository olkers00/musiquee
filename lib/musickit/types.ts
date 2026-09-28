export interface MusicKitArtwork {
  url: string;
  width?: number;
  height?: number;
  bgColor?: string;
}

export interface MusicKitPreview {
  url: string;
}

export interface MusicKitSongAttributes {
  name: string;
  artistName: string;
  albumName?: string;
  artwork?: MusicKitArtwork;
  durationInMillis?: number;
  genreNames?: string[];
  contentRating?: "explicit" | "clean";
  previews?: MusicKitPreview[];
  releaseDate?: string;
  playParams?: { id: string; kind: string };
}

export interface MusicKitResource {
  id: string;
  type: string;
  href?: string;
  attributes?: MusicKitSongAttributes;
}

export interface MusicKitHistoryItem extends MusicKitResource {
  attributes?: MusicKitSongAttributes & { lastPlayedDate?: string };
}

export interface MusicKitApiResponse<T = MusicKitResource> {
  data: T[];
  meta?: Record<string, unknown>;
  next?: string;
}

export interface MusicKitAPI {
  music: <T = MusicKitResource>(
    path: string,
    params?: Record<string, unknown>
  ) => Promise<{ data: MusicKitApiResponse<T> }>;
}

export interface MusicKitInstance {
  isAuthorized: boolean;
  musicUserToken?: string;
  storefrontId?: string;
  api: MusicKitAPI;
  authorize: () => Promise<string>;
  unauthorize: () => Promise<void>;
  addEventListener: (name: string, cb: (event?: unknown) => void) => void;
  removeEventListener: (name: string, cb: (event?: unknown) => void) => void;
}

export interface MusicKitConfigureOptions {
  developerToken: string;
  app: {
    name: string;
    build: string;
  };
}

export interface MusicKitStatic {
  configure: (options: MusicKitConfigureOptions) => Promise<MusicKitInstance>;
  getInstance: () => MusicKitInstance;
}

declare global {
  interface Window {
    MusicKit?: MusicKitStatic;
  }
}
