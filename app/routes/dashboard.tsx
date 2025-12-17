import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/dashboard";
import { getSession, type Session } from "../utils/auth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
    { name: "description", content: "User dashboard" },
  ];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session>({
    token: null,
    refreshToken: null,
    name: null,
    role: null,
    expiresAt: null,
  });

  useEffect(() => {
    const current = getSession();
    if (!current.token) {
      navigate("/login", { replace: true });
    } else {
      setSession(current);
    }
  }, [navigate]);

  if (!session.token) {
    return null;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="mb-4">
        <p>
          Nama: <span className="font-medium">{session.name}</span>
        </p>
        <p>
          Role: <span className="font-medium">{session.role}</span>
        </p>
        <p>
          Token berakhir pada:{" "}
          <span className="font-medium">{session.expiresAt ?? "-"}</span>
        </p>
      </div>
    </main>
  );
}
