import type { Metadata } from "next";
import { Geist, Geist_Mono, Underdog, Fredericka_the_Great } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from './components/Footer';
import Head from "next/head";
import Script from "next/script";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const underdog = Underdog({
  variable: "--font-underdog",
  subsets: ["latin"],
  weight: "400", // Underdog só tem peso 400
});

const fredericka = Fredericka_the_Great({
  variable: "--font-fredericka",
  subsets: ["latin"],
  weight: "400", // Essa fonte só possui peso 400
});

export const metadata: Metadata = {
  title: "ScrobbleWall – Sua música em forma de arte",
  description: "Transforme seus álbuns mais ouvidos do Last.fm em colagens visuais personalizadas. Compartilhe sua paixão musical com o mundo!",
  icons: {
    icon: '/favicon.ico',
  },
  keywords: [
    "last.fm",
    "collage",
    "colagem last.fm",
    "colagem 5x5",
    "colagem 4x4",
    "colagem 3x3",
    "scrobble last.fm",
    "álbuns mais ouvidos",
    "scrobble",
    "música",
    "Spotify",
    "arte digital",
    "ScrobbleWall"
  ],
  openGraph: {
    title: "ScrobbleWall – Sua música em forma de arte",
    description: "Crie colagens com seus álbuns mais ouvidos no Last.fm e compartilhe sua identidade musical.",
    url: "https://www.scrobblewall.art",
    siteName: "ScrobbleWall",
    type: "website",
    images: [
      {
        url: "https://www.scrobblewall.art/og-image.png", // atualize se tiver imagem gerada para preview
        width: 1200,
        height: 630,
        alt: "Exemplo de colagem do ScrobbleWall"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ScrobbleWall – Sua música em forma de arte",
    images: ["https://www.scrobblewall.art/logo-color.png"]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        {/* Meta tag do AdSense */}
        <meta name="google-adsense-account" content="ca-pub-8940704424317590" />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${underdog.variable} ${fredericka.variable}`}>
        <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8940704424317590"
        crossOrigin="anonymous" />
        {/* Header será exibido em todas as páginas */}
        <Header/>
        <main className="containerPrincipal">{children}</main>
        <Analytics />
        <SpeedInsights />
        <Footer />
      
      </body>
    </html>
  );
}
