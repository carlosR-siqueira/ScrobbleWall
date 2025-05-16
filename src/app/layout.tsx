import type { Metadata } from "next";
import { Geist, Geist_Mono, Underdog, Fredericka_the_Great } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from './components/Footer';


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
  title: "ScrobbleWall",
  description: "Crie colagens com seus álbuns mais ouvidos so seu Last.fm",
  icons:{
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${underdog.variable} ${fredericka.variable}`}>
        
        {/* Header será exibido em todas as páginas */}
        <Header/>
        <main className="containerPrincipal">{children}</main>
        <Footer />
      
      </body>
    </html>
  );
}
