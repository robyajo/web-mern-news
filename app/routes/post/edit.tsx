import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { apiFetch } from "~/utils/api";
import { getSession, type Session } from "~/utils/auth";
import { toast } from "sonner";
import { PostForm } from "./PostForm";

type PostFormValues = {
  title: string;
  content: string;
  categoryName?: string;
  published: boolean;
};

type PostItem = {
  id: string;
  name: string;
  content: string;
  status: string;
};

export default function PostEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const [session, setSession] = useState<Session>({
    token: null,
    refreshToken: null,
    name: null,
    role: null,
    expiresAt: null,
  });
  const [initialValues, setInitialValues] = useState<PostFormValues | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = getSession();
    if (!current.token) {
      navigate("/login", { replace: true });
      return;
    }
    setSession(current);
  }, [navigate]);

  useEffect(() => {
    if (!session.token || !id) {
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const data = await apiFetch<{ items: PostItem[]; pagination: any }>(
          "/api/posts/mine?page=1&pageSize=100"
        );
        if (cancelled) {
          return;
        }
        const target = data.items.find((it: any) => {
          const rawId =
            typeof it.id === "bigint" ? it.id.toString() : String(it.id);
          return rawId === id;
        });
        if (!target) {
          toast.error("Post tidak ditemukan");
          navigate("/dashboard/posts", { replace: true });
          return;
        }
        setInitialValues({
          title: target.name ?? "",
          content: target.content ?? "",
          categoryName: undefined,
          published: target.status === "published",
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Gagal memuat data post";
        toast.error(message);
        navigate("/dashboard/posts", { replace: true });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, navigate, session.token]);

  if (!session.token) {
    return null;
  }

  if (!id) {
    return (
      <main className="pt-16 p-4 container mx-auto">
        <p>Parameter id tidak valid.</p>
      </main>
    );
  }

  async function handleSubmit(values: PostFormValues) {
    try {
      const payload: any = {
        title: values.title,
        content: values.content,
        published: values.published,
      };
      await apiFetch<any>(`/api/posts/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast.success("Post berhasil diperbarui");
      navigate("/dashboard/posts", { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal memperbarui post";
      toast.error(message);
    }
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Edit Post</h1>
      {loading || !initialValues ? (
        <p>Memuat data post...</p>
      ) : (
        <PostForm
          mode="edit"
          initialValues={initialValues}
          onSubmit={handleSubmit}
          showCategory={false}
        />
      )}
    </main>
  );
}
