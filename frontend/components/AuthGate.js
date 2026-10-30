"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { api } from "../lib/api";

export default function AuthGate({ children, role }) {
  const [state, setState] = useState("loading");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    const verify = async (session) => {
      if (!session) {
        if (alive) setState("signed-out");
        return;
      }
      try {
        const result = await api("/auth/me", { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (alive) setState(role && result.data.role !== role ? "denied" : "ready");
      } catch {
        if (alive) setState("error");
      }
    };
    supabase.auth.getSession().then(({ data }) => verify(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => verify(session));
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, [role]);

  useEffect(() => {
    if (state === "signed-out") router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [pathname, router, state]);

  if (state === "loading" || state === "signed-out") return <main className="shell"><div className="auth-loading" aria-live="polite">Checking your account…</div></main>;
  if (state === "denied") return <main className="shell"><div className="empty auth-denied"><h1>Administrator access required</h1><p>This area is available to authorized administrators only.</p><Link className="button button-outline" href="/">Back to event discovery</Link></div></main>;
  if (state === "error") return <main className="shell"><div className="empty auth-denied"><h1>We couldn’t verify your account</h1><p>Please sign in again to continue.</p><Link className="button button-primary" href={`/login?next=${encodeURIComponent(pathname)}`}>Log in</Link></div></main>;
  return children;
}
