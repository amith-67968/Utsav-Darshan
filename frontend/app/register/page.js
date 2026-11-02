"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        const requested = new URLSearchParams(window.location.search).get("next");
        const destination = requested?.startsWith("/") && !requested.startsWith("//")
          ? requested
          : "/contributor";
        router.replace(destination);
        router.refresh();
        return;
      }

      setMessage("Your account has been created. You can now log in.");
    } catch {
      setError("We couldn’t create your account. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <div className="form-wrap">
        <form className="form-card" onSubmit={submit}>
          <span className="eyebrow">Be part of the story</span>
          <h1>Create an account</h1>
          <p>Help local traditions find a wider audience.</p>

          <div className="field">
            <label htmlFor="register-name">Your name</label>
            <input
              id="register-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="field">
            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
            <span className="field-help">Use at least 8 characters.</span>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
          {message && <p className="form-success" role="status">{message}</p>}

          <button className="button button-primary" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Creating account…" : "Create account"}
          </button>
          <p style={{ textAlign: "center", marginTop: 20 }}>
            Already a member? <Link className="text-link" href="/login">Log in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
