"use client";
import {MapContainer,TileLayer,Marker,Popup} from "react-leaflet";
import L from "leaflet";
const pin=L.divIcon({className:"",html:'<span style="display:block;width:18px;height:18px;background:#e87932;border:3px solid white;border-radius:50%;box-shadow:0 1px 5px #0005"></span>',iconSize:[18,18],iconAnchor:[9,9]});
export default function EventMap({latitude,longitude,name}){if(latitude==null||longitude==null)return null;return <div style={{height:230,borderRadius:12,overflow:"hidden",marginTop:17}}><MapContainer center={[latitude,longitude]} zoom={14} scrollWheelZoom={false} style={{height:"100%",width:"100%"}}><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><Marker position={[latitude,longitude]} icon={pin}><Popup>{name}</Popup></Marker></MapContainer></div>}
