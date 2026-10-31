"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import EventCard from "../../components/EventCard";
import EventSkeleton from "../../components/EventSkeleton";
import { api } from "../../lib/api";

export default function Explore() {
  const [events, setEvents] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filtersReady, setFiltersReady] = useState(false);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([api("/cities"), api("/categories?active=true")]).then(([cityData, categoryData]) => {
      if (!active) return;
      setCities(cityData.data || []);
      setCategories(categoryData.data || []);
    }).catch(() => {});

    const params = new URLSearchParams(window.location.search);
    setQ(params.get("q") || "");
    setCity(params.get("city") || "");
    setCategory(params.get("category") || "");
    setFiltersReady(true);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!filtersReady) return;
    const controller = new AbortController();
    const query = new URLSearchParams();
    if (q.trim()) query.set("q", q.trim());
    if (city) query.set("city", city);
    if (category) query.set("category", category);
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      api(`/events?${query}`, { signal: controller.signal })
        .then((data) => setEvents(data.data || []))
        .catch((err) => { if (err.name !== "AbortError") setError(err.message); })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 220);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [filtersReady, q, city, category]);

  return <>
    <div className="page-head"><div className="shell"><span className="eyebrow">Discover local culture</span><h1>Explore events</h1><p>Find a festival, fair or gathering worth stepping out for.</p></div></div>
    <main className="content shell">
      <div className="filterbar"><Search size={17} color="#999"/><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events or places" aria-label="Search events"/><SlidersHorizontal size={16} color="#999"/><select value={city} onChange={(e) => setCity(e.target.value)} aria-label="Filter by city"><option value="">All cities</option>{cities.map((name) => <option key={name}>{name}</option>)}</select><select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category"><option value="">All categories</option>{categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></div>
      {error ? <div className="empty"><h3>Events are not available yet</h3><p>{error}. Check the API configuration and try again.</p></div> : loading && events.length === 0 ? <div className="grid-events" aria-label="Loading events" aria-busy="true">{Array.from({ length: 6 }, (_, index) => <EventSkeleton key={index}/>)}</div> : events.length ? <div className="grid-events" aria-busy={loading}>{events.map((event) => <EventCard key={event.id} event={event}/>)}</div> : <div className="empty"><h3>No approved events found</h3><p>Try another search, or <Link className="text-link" href="/contributor/submit">share an event</Link> with the community.</p></div>}
    </main>
  </>;
}
