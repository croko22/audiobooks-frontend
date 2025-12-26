import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("nodes", "routes/nodes.tsx"),
] satisfies RouteConfig;
