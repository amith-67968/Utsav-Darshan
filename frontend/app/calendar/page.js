"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../../lib/api";

const ymd = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function CalendarPage() {
  const [month, setMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [view, setView] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [initialRangeResolved, setInitialRangeResolved] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  const skipNextRangeFetch = useRef(false);
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const cells = useMemo(() => {
    if (view === "week") {
      const monday = new Date(month);
      monday.setDate(month.getDate() - ((month.getDay() + 6) % 7));
      return Array.from({ length: 7 }, (_, index) => { const day = new Date(monday); day.setDate(monday.getDate() + index); return day; });
    }
    return Array.from({ length: offset + days }, (_, index) => index < offset ? null : new Date(month.getFullYear(), month.getMonth(), index - offset + 1));
  }, [offset, days, month, view]);

  useEffect(() => {
    if (skipNextRangeFetch.current) {
      skipNextRangeFetch.current = false;
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const rangeDays = cells.filter(Boolean);
    const visibleFrom = ymd(rangeDays[0]);
    const visibleTo = ymd(rangeDays[rangeDays.length - 1]);
    const initialLoad = !initialRangeResolved;
    const horizon = new Date(month.getFullYear(), month.getMonth() + 13, 0);
    const queryTo = initialLoad ? ymd(horizon) : visibleTo;
    setLoading(true);
    setError("");
    const load = async () => {
      const result = await api(`/events?limit=200&overlapFrom=${visibleFrom}&overlapTo=${queryTo}`, { signal: controller.signal });
      const received = result.data || [];
      const inRange = received.filter((event) => event.start_date <= visibleTo && event.end_date >= visibleFrom);

      if (!initialLoad) {
        setEvents(inRange);
        return;
      }

      const today = ymd(new Date());
      const upcoming = received.filter((event) => event.end_date >= today);
      setInitialRangeResolved(true);
      setEvents(received);
      if (!inRange.length) {
        const nearest = upcoming.find((event) => event.end_date >= today);
        if (nearest) {
        const eventDate = new Date(`${nearest.start_date < today ? today : nearest.start_date}T00:00:00`);
        if (eventDate.getFullYear() !== month.getFullYear() || eventDate.getMonth() !== month.getMonth()) {
          skipNextRangeFetch.current = true;
          setMonth(new Date(eventDate.getFullYear(), eventDate.getMonth(), 1));
        }
        }
      }
    };
    load().catch((err) => { if (err.name !== "AbortError") setError(err.message || "Unable to load calendar events."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [cells, reloadCount]);

  const title = view === "week"
    ? `${cells[0]?.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${cells[6]?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : month.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  function move(amount) {
    if (view === "month") setMonth(new Date(month.getFullYear(), month.getMonth() + amount, 1));
    else { const next = new Date(month); next.setDate(month.getDate() + amount * 7); setMonth(next); }
  }

  return <>
    <div className="page-head"><div className="shell"><span className="eyebrow">Plan a day out</span><h1>Festival calendar</h1><p>A month or week at a glance, filled with local celebrations.</p></div></div>
    <main className="content shell">
      <div className="calendar-top"><div><h2 style={{ margin: "0 0 5px", letterSpacing: "-.04em" }}>{title}</h2><span style={{ fontSize: 12, color: "#888" }}>{loading ? "Updating events…" : "Events across all cities"}</span></div><div style={{ display: "flex", gap: 7 }}><button className={`button ${view === "month" ? "button-soft" : "button-outline"} button-small`} onClick={() => setView("month")}>Month</button><button className={`button ${view === "week" ? "button-soft" : "button-outline"} button-small`} onClick={() => setView("week")}>Week</button><button className="button button-outline button-small" aria-label="Previous period" onClick={() => move(-1)}><ChevronLeft size={17}/></button><button className="button button-outline button-small" aria-label="Next period" onClick={() => move(1)}><ChevronRight size={17}/></button></div></div>
      <div className="calendar-grid" aria-busy={loading}>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <div key={day} className="calendar-cell day">{day}</div>)}{cells.map((day, index) => <div className="calendar-cell" key={index}>{day && <><span>{day.getDate()}</span>{events.filter((event) => { const start = new Date(`${event.start_date}T00:00:00`); const end = new Date(`${event.end_date || event.start_date}T23:59:59`); return day >= start && day <= end; }).map((event) => <Link className="calendar-item" href={`/events/${event.id}`} key={event.id}>{event.event_name}</Link>)}</>}</div>)}</div>
      {error ? <div className="empty calendar-message"><h3>Couldn’t load calendar events</h3><p>{error}</p><button className="button button-outline button-small" onClick={() => setReloadCount((count) => count + 1)}>Try again</button></div> : !loading && events.filter((event) => { const start = new Date(`${event.start_date}T00:00:00`); const end = new Date(`${event.end_date || event.start_date}T23:59:59`); return cells.some((day) => day && day >= start && day <= end); }).length === 0 ? <div className="empty calendar-message"><h3>No approved events in this period</h3><p>Try another month or week to see upcoming celebrations.</p></div> : null}
    </main>
  </>;
}
