"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Compass, Menu, X, ChevronDown, UserRound } from "lucide-react";
import { supabase } from "../lib/supabase";
import { api } from "../lib/api";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [account, setAccount] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 4);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    let alive = true;
    const loadAccount = async (session) => {
      if (!session) { if (alive) setAccount(null); return; }
      try {
        const result = await api("/auth/me", { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (alive) setAccount({ ...result.data, email: session.user.email });
      } catch { if (alive) setAccount(null); }
    };
    supabase.auth.getSession().then(({ data }) => loadAccount(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => loadAccount(session));
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  const active = (href) => pathname === href || pathname.startsWith(`${href}/`);
  const closeMenu = () => setOpen(false);
  const logout = async () => { await supabase.auth.signOut(); setAccount(null); router.push("/"); router.refresh(); };

  return <header className={`topbar ${scrolled ? "scrolled" : ""}`}>
    <div className="shell topbar-inner">
      <Link className="brand" href="/" onClick={closeMenu}><span className="brand-mark"><Compass size={19}/></span>utsav darshan</Link>
      <nav className={`nav ${open ? "open" : ""}`} aria-label="Main navigation">
        <Link className={active("/explore") ? "active" : ""} aria-current={active("/explore") ? "page" : undefined} href="/explore" onClick={closeMenu}>Explore</Link>
        <Link className={active("/calendar") ? "active" : ""} aria-current={active("/calendar") ? "page" : undefined} href="/calendar" onClick={closeMenu}>Calendar</Link>
        <Link className={active("/contribute") ? "active" : ""} aria-current={active("/contribute") ? "page" : undefined} href="/contribute" onClick={closeMenu}>Contribute</Link>
        {!account && <Link className="mobile-auth-link" href={`/login?next=${encodeURIComponent("/contributor/submit")}`} onClick={closeMenu}>Log in</Link>}
      </nav>
      <div className="nav-actions">
        {account ? <details className="account-menu"><summary aria-label="Open account menu"><span className="account-avatar"><UserRound size={16}/></span><span className="account-name">{account.full_name || account.email}</span><ChevronDown size={15}/></summary>
          <div className="account-popover">{account.role === "admin" ? <Link href="/admin" onClick={closeMenu}>Admin dashboard</Link> : <><Link href="/contributor" onClick={closeMenu}>My dashboard</Link><Link href="/contributor/submissions" onClick={closeMenu}>My submissions</Link><Link href="/profile" onClick={closeMenu}>Profile</Link></>}<button type="button" onClick={logout}>Log out</button></div>
        </details> : <Link className="button button-outline button-small" href={`/login?next=${encodeURIComponent("/contributor/submit")}`} onClick={closeMenu}>Log in</Link>}
        <Link className="button button-primary button-small nav-cta" href="/contributor/submit" onClick={closeMenu}>Submit an Event</Link>
        <button className="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={21}/> : <Menu size={21}/>}</button>
      </div>
    </div>
  </header>;
}
