"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";

const EventMap = lazy(() => import("./EventMap"));

export default function LazyEventMap(props) {
  const wrapper = useRef(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const node = wrapper.current;
    if (!node || props.latitude == null || props.longitude == null) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearViewport(true);
        observer.disconnect();
      }
    }, { rootMargin: "160px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [props.latitude, props.longitude]);

  if (props.latitude == null || props.longitude == null) return null;
  return <div ref={wrapper} style={{ height: 230, marginTop: 17, borderRadius: 12, overflow: "hidden", background: "#f5f3ef" }} aria-label="Event map">
    {nearViewport && <Suspense fallback={<div className="map-loading">Loading map…</div>}><EventMap {...props}/></Suspense>}
  </div>;
}
