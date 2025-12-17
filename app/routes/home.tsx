import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home" },
    { name: "description", content: "Beranda aplikasi berita" },
  ];
}

export default function Home() {
  return <Welcome />;
}
