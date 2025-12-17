import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("dashboard/posts", "routes/post/index.tsx"),
  route("dashboard/posts/new", "routes/post/create.tsx"),
  route("dashboard/posts/:id/edit", "routes/post/edit.tsx"),
] satisfies RouteConfig;
