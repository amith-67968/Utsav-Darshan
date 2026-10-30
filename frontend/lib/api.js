export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export async function api(path, options={}) {
  const response = await fetch(`${API}${path}`, { ...options, headers:{"Content-Type":"application/json", ...(options.headers||{})}, cache:"no-store" });
  const data = await response.json().catch(()=>({message:"Unexpected server response"}));
  if(!response.ok) throw new Error(data.message || "Request failed");
  return data;
}
