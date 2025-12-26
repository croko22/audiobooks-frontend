export const config = {
  defaultFogNodes: (import.meta.env.VITE_DEFAULT_FOG_NODES || "http://localhost:8000")
    .split(",")
    .map((url: string) => url.trim())
    .filter(Boolean),
};
