const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
// The Express service mounts its routes under /api. Accept either the service
// origin or an origin that already includes /api to avoid /events 404s after deploy.
const apiOrigin = configuredApiUrl.trim().replace(/\/+$/, "").replace(/(?:\/api)+$/i, "");
export const API = `${apiOrigin}/api`;
const publicCache = new Map();
const PUBLIC_CACHE_TTL = 15_000;

function isPublicRead(path, method) {
  return method === "GET" && /^\/(events(?:\/[^/?]+)?|cities|categories)(?:\?|$)/.test(path);
}

export async function api(path, options={}) {
  const method = (options.method || "GET").toUpperCase();
  const publicRead = isPublicRead(path, method) && !options.headers?.Authorization;
  const cacheKey = `${API}${path}`;
  if (publicRead && !options.signal) {
    const cached = publicCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data;
    if (cached) publicCache.delete(cacheKey);
  }

  const headers = { ...(options.headers || {}) };
  // A JSON Content-Type on a cross-origin GET triggers a needless CORS preflight.
  if (options.body != null && !headers["Content-Type"] && !headers["content-type"]) headers["Content-Type"] = "application/json";
  let response;
  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      method,
      headers,
      cache: options.cache || (publicRead ? "default" : "no-store"),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(`Could not reach the API at ${API}. Check the deployed API URL and backend CORS settings.`);
  }
  const data = await response.json().catch(()=>({message:"Unexpected server response"}));
  if (!response.ok) {
    if (response.status === 404 && data.message === "Route not found") {
      throw new Error(`The API route was not found at ${API}${path}. Check that NEXT_PUBLIC_API_URL points to the deployed Express API, then redeploy the frontend.`);
    }
    throw new Error(data.message || "Request failed");
  }
  if (publicRead && !options.signal) {
    if (publicCache.size >= 80) publicCache.delete(publicCache.keys().next().value);
    publicCache.set(cacheKey, { data, expiresAt: Date.now() + PUBLIC_CACHE_TTL });
  }
  return data;
}
