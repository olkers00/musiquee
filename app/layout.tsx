import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppShell } from "@/components/layout/app-shell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Musiquee — Twoje statystyki Spotify",
  description:
    "Musiquee analizuje Twoje osobiste statystyki Spotify: Top 50 utworów, ulubionych artystów, albumy i historię odtwarzania.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#060608" },
  ],
  colorScheme: "light dark",
};

const THEME_INIT_SCRIPT = `(function(){try{var m=localStorage.getItem("musiquee:theme")||"dark";var d=m==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):m;document.documentElement.setAttribute("data-theme",d);}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pl"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
