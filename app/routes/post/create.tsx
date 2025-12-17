import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "~/utils/api";
import { getSession, type Session } from "~/utils/auth";
import { toast } from "sonner";
import { PostForm } from "./PostForm";

export default function PostCreatePage() {
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

  async function handleSubmit(values: {
    title: string;
    content: string;
    categoryName?: string;
    published: boolean;
  }) {
    try {
      const payload: any = {
        title: values.title,
        content: values.content,
      };
      if (values.published) {
        payload.published = true;
      }
      if (values.categoryName) {
        payload.category_name = values.categoryName;
      }
      await apiFetch<any>("/api/posts", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("Post berhasil dibuat");
      navigate("/dashboard/posts", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal membuat post";
      toast.error(message);
    }
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Buat Post</h1>
      <PostForm mode="create" onSubmit={handleSubmit} showCategory />
    </main>
  );
}
