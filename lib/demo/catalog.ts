export interface CatalogTrack {
  title: string;
  durationMs: number;
  explicit?: boolean;
}

export interface CatalogAlbum {
  title: string;
  year: number;
  tracks: CatalogTrack[];
}

export interface CatalogArtist {
  name: string;
  genre: string;
  albums: CatalogAlbum[];
}

export const GENRES = [
  "Pop",
  "Hip-Hop/Rap",
  "Elektronika",
  "Indie Rock",
  "R&B/Soul",
  "Alternatywny",
  "Chill/Lo-fi",
] as const;

export const CATALOG: CatalogArtist[] = [
  {
    name: "Nova Lindqvist",
    genre: "Pop",
    albums: [
      {
        title: "Afterglow",
        year: 2025,
        tracks: [
          { title: "Afterglow", durationMs: 201000 },
          { title: "Neon Tide", durationMs: 187000 },
          { title: "Paper Moons", durationMs: 213000 },
          { title: "Glass Heart", durationMs: 194000 },
          { title: "Velvet Static", durationMs: 179000 },
        ],
      },
      {
        title: "Midnight Radio",
        year: 2023,
        tracks: [
          { title: "Midnight Radio", durationMs: 209000 },
          { title: "Copper Skies", durationMs: 198000 },
        ],
      },
    ],
  },
  {
    name: "Kairo Vance",
    genre: "Hip-Hop/Rap",
    albums: [
      {
        title: "Concrete Halo",
        year: 2024,
        tracks: [
          { title: "Concrete Halo", durationMs: 221000, explicit: true },
          { title: "Low Beam", durationMs: 176000, explicit: true },
          { title: "8th & Vine", durationMs: 203000, explicit: true },
          { title: "Marble Floors", durationMs: 188000 },
          { title: "Static Crown", durationMs: 233000, explicit: true },
        ],
      },
    ],
  },
  {
    name: "Wilhelmina Cruz",
    genre: "R&B/Soul",
    albums: [
      {
        title: "Slow Bloom",
        year: 2025,
        tracks: [
          { title: "Slow Bloom", durationMs: 244000 },
          { title: "Honeyed", durationMs: 218000 },
          { title: "Undertow", durationMs: 229000 },
          { title: "Porcelain", durationMs: 205000 },
        ],
      },
    ],
  },
  {
    name: "Echo District",
    genre: "Indie Rock",
    albums: [
      {
        title: "Lowlight Cities",
        year: 2022,
        tracks: [
          { title: "Lowlight Cities", durationMs: 251000 },
          { title: "Radio Silence", durationMs: 199000 },
          { title: "Amber Room", durationMs: 214000 },
          { title: "Sundial", durationMs: 187000 },
        ],
      },
      {
        title: "Tin Roof",
        year: 2024,
        tracks: [
          { title: "Tin Roof", durationMs: 196000 },
          { title: "Harbor Lights", durationMs: 222000 },
          { title: "Paperweight", durationMs: 178000 },
        ],
      },
    ],
  },
  {
    name: "PULSE//RGN",
    genre: "Elektronika",
    albums: [
      {
        title: "Synaptic",
        year: 2025,
        tracks: [
          { title: "Synaptic", durationMs: 267000 },
          { title: "Chrome Rain", durationMs: 241000 },
          { title: "Vector Bloom", durationMs: 255000 },
          { title: "Halcyon Grid", durationMs: 233000 },
          { title: "Afterparty Physics", durationMs: 249000 },
        ],
      },
    ],
  },
  {
    name: "Sable Winters",
    genre: "Alternatywny",
    albums: [
      {
        title: "Bruises & Bonfires",
        year: 2023,
        tracks: [
          { title: "Bruises & Bonfires", durationMs: 208000 },
          { title: "Wolf Teeth", durationMs: 191000 },
          { title: "Static Kiss", durationMs: 217000 },
        ],
      },
    ],
  },
  {
    name: "Marlow & Finch",
    genre: "Chill/Lo-fi",
    albums: [
      {
        title: "Study Hall Sessions",
        year: 2024,
        tracks: [
          { title: "Rainy Window", durationMs: 162000 },
          { title: "Study Hall", durationMs: 154000 },
          { title: "Corner Booth", durationMs: 171000 },
          { title: "3AM Kettle", durationMs: 148000 },
        ],
      },
    ],
  },
  {
    name: "Dorian Ashe",
    genre: "Pop",
    albums: [
      {
        title: "Technicolor",
        year: 2025,
        tracks: [
          { title: "Technicolor", durationMs: 195000 },
          { title: "Fever Dream", durationMs: 183000 },
          { title: "Sugar Static", durationMs: 201000 },
        ],
      },
    ],
  },
  {
    name: "Ruth Okafor",
    genre: "R&B/Soul",
    albums: [
      {
        title: "Terracotta",
        year: 2022,
        tracks: [
          { title: "Terracotta", durationMs: 236000 },
          { title: "Gold Dust", durationMs: 212000 },
          { title: "Evenfall", durationMs: 224000 },
        ],
      },
    ],
  },
  {
    name: "Blackwood Radio",
    genre: "Indie Rock",
    albums: [
      {
        title: "Static & Salt",
        year: 2024,
        tracks: [
          { title: "Static & Salt", durationMs: 204000 },
          { title: "Rust Belt Waltz", durationMs: 227000 },
          { title: "Driftwood", durationMs: 189000 },
        ],
      },
    ],
  },
  {
    name: "Juno Esparza",
    genre: "Hip-Hop/Rap",
    albums: [
      {
        title: "Cactus Flower",
        year: 2025,
        tracks: [
          { title: "Cactus Flower", durationMs: 198000, explicit: true },
          { title: "Desert Line", durationMs: 172000 },
          { title: "Mirage", durationMs: 210000, explicit: true },
        ],
      },
    ],
  },
  {
    name: "Ambient Halls",
    genre: "Chill/Lo-fi",
    albums: [
      {
        title: "Quiet Rooms",
        year: 2023,
        tracks: [
          { title: "Quiet Rooms", durationMs: 301000 },
          { title: "Soft Machinery", durationMs: 284000 },
          { title: "Low Tide", durationMs: 266000 },
        ],
      },
    ],
  },
];
