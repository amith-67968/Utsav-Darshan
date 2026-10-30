"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGate from "../../components/AuthGate";
import { supabase } from "../../lib/supabase";

function ProfileDetails() {
  const [user, setUser] = useState(null);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUser(data.user || null)); }, []);
  return <main className="shell"><div className="form-wrap"><section className="form-card profile-card"><span className="eyebrow">Your account</span><h1>Profile</h1><p>Account details used for your Utsav Darshan contributions.</p><div className="profile-detail"><span>Name</span><strong>{user?.user_metadata?.full_name || "—"}</strong></div><div className="profile-detail"><span>Email address</span><strong>{user?.email || "Loading…"}</strong></div><Link className="button button-outline" href="/contributor">Go to my dashboard</Link></section></div></main>;
}

export default function ProfilePage() { return <AuthGate><ProfileDetails/></AuthGate>; }
