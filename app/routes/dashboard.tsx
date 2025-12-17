import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/dashboard";
import { getSession, logout, type Session } from "../utils/auth";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

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

  async function handleLogout() {
    const message = await logout();
    if (message) {
      toast.success(message);
    } else {
      toast.success("Berhasil logout");
    }
    navigate("/login", { replace: true });
  }

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
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin keluar dari sesi ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
