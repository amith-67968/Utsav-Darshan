import "./globals.css";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";

export const metadata = { title: "Utsav Darshan | Find the festivals around you", description: "Discover verified festivals, fairs and cultural events across India's cities." };

export default function RootLayout({ children }) {
  return <html lang="en"><body><SiteHeader/><div className="page-enter">{children}</div><footer className="footer"><div className="shell footer-inner"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">✦</span>utsav darshan</Link><span>Celebrating the places and traditions that bring us together.</span><div className="footer-links"><Link href="/explore">Explore events</Link><Link href="/calendar">Calendar</Link><Link href="/contributor/submit">Share an event</Link></div><span>© {new Date().getFullYear()} Utsav Darshan</span></div></footer></body></html>;
}
