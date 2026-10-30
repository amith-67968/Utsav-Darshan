"use client";
import {useEffect,useRef} from "react";
export default function Reveal({children,className=""}){const ref=useRef(null);useEffect(()=>{const node=ref.current;if(!node||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;node.classList.add("reveal");const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){node.classList.add("reveal-visible");observer.disconnect()}},{threshold:.08,rootMargin:"0px 0px -24px 0px"});observer.observe(node);return()=>observer.disconnect()},[]);return <div className={className} ref={ref}>{children}</div>}
