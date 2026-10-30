"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {Search,SlidersHorizontal} from "lucide-react";
import EventCard from "../../components/EventCard";
import EventSkeleton from "../../components/EventSkeleton";
import {api} from "../../lib/api";

export default function Explore(){
  const [events,setEvents]=useState([]),[cities,setCities]=useState([]),[categories,setCategories]=useState([]),[error,setError]=useState(""),[loading,setLoading]=useState(true),[q,setQ]=useState(""),[city,setCity]=useState(""),[category,setCategory]=useState("");
  useEffect(()=>{api('/cities').then(d=>setCities(d.data||[])).catch(()=>{});api('/categories?active=true').then(d=>setCategories(d.data||[])).catch(()=>{})},[]);
  useEffect(()=>{const params=new URLSearchParams(window.location.search);setQ(params.get("q")||"");setCity(params.get("city")||"");setCategory(params.get("category")||"")},[]);
  useEffect(()=>{const query=new URLSearchParams();if(q)query.set("q",q);if(city)query.set("city",city);if(category)query.set("category",category);const controller=new AbortController();setLoading(true);setError("");api(`/events?${query}`,{signal:controller.signal}).then(d=>setEvents(d.data||[])).catch(e=>{if(e.name!=="AbortError")setError(e.message)}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});return()=>controller.abort()},[q,city,category]);
  return <><div className="page-head"><div className="shell"><span className="eyebrow">Discover local culture</span><h1>Explore events</h1><p>Find a festival, fair or gathering worth stepping out for.</p></div></div><main className="content shell"><div className="filterbar"><Search size={17} color="#999"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search events or places" aria-label="Search events"/><SlidersHorizontal size={16} color="#999"/><select value={city} onChange={e=>setCity(e.target.value)} aria-label="Filter by city"><option value="">All cities</option>{cities.map(x=><option key={x}>{x}</option>)}</select><select value={category} onChange={e=>setCategory(e.target.value)} aria-label="Filter by category"><option value="">All categories</option>{categories.map(x=><option key={x.id} value={x.name}>{x.name}</option>)}</select></div>{error?<div className="empty"><h3>Events are not available yet</h3><p>{error}. Check the API configuration and try again.</p></div>:loading?<div className="grid-events" aria-label="Loading events" aria-busy="true">{Array.from({length:6},(_,i)=><EventSkeleton key={i}/>)}</div>:events.length?<div className="grid-events">{events.map(e=><EventCard key={e.id} event={e}/>)}</div>:<div className="empty"><h3>No approved events found</h3><p>Try another search, or <Link className="text-link" href="/contributor/submit">share an event</Link> with the community.</p></div>}</main></>;
}
