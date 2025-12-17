import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "~/utils/api";
import { getSession, type Session } from "~/utils/auth";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Spinner } from "~/components/ui/spinner";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "~/components/table/data-table";
import { columns as baseColumns } from "./table/columns";

export type PostItem = {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string | null;
  content: string;
  authorName: string;
  categoryName: string;
  tags: string;
};

type PostsResponse = {
  items: any[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

const ALL_TAGS = [
  "technology",
  "tech",
  "ai",
  "web",
  "javascript",
  "health",
  "wellness",
  "fitness",
  "nutrition",
  "lifestyle",
  "sports",
  "football",
  "basketball",
  "training",
  "competition",
];

export function meta() {
  return [
    { title: "Posts Saya" },
    { name: "description", content: "Daftar post milik pengguna" },
  ];
}

export default function DashboardPosts() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session>({
    token: null,
    refreshToken: null,
    name: null,
    role: null,
    expiresAt: null,
  });
  const [items, setItems] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [userName, setUserName] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  const columns: ColumnDef<PostItem>[] = useMemo(
    () => [
      ...baseColumns,
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
          const post = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => navigate(`/dashboard/posts/${post.id}/edit`)}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(post.id)}
              >
                Delete
              </Button>
            </div>
          );
        },
      },
    ],
    [navigate, handleDelete]
  );

  function mapItem(it: any): PostItem {
    return {
      id: typeof it.id === "bigint" ? it.id.toString() : String(it.id),
      name: it.name ?? "",
      slug: it.slug ?? "",
      status: it.status ?? "",
      created_at: it.created_at ?? null,
      content: it.content ?? "",
      authorName: it.users?.name ?? "",
      categoryName: it.categori_posts?.name ?? "",
      tags: it.tags ?? "",
    };
  }

  useEffect(() => {
    const current = getSession();
    if (!current.token) {
      navigate("/login", { replace: true });
      return;
    }
    setSession(current);
    let cancelled = false;
    async function load() {
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));
        const normalizedTitle = title.trim();
        if (normalizedTitle) {
          params.set("title", normalizedTitle);
        }
        if (selectedTags.length > 0) {
          params.set("tags", selectedTags.join(","));
        }
        const isAdmin = current.role === "admin";
        const normalizedUserName = userName.trim();
        if (isAdmin && normalizedUserName) {
          params.set("user_name", normalizedUserName);
        }
        const path = isAdmin ? "/api/posts" : "/api/posts/mine";
        const data = await apiFetch<PostsResponse>(
          `${path}?${params.toString()}`
        );
        if (!cancelled) {
          const mapped = data.items.map((it) => mapItem(it));
          setItems(mapped);
          setPage(data.pagination.page || 1);
          setTotalPages(data.pagination.totalPages || 1);
          setPageSize(data.pagination.pageSize || pageSize);
          setTotalItems(data.pagination.total || 0);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Gagal memuat posts";
          toast.error(message);
        }
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
  }, [navigate, page, selectedTags, title, userName, pageSize]);

  const filteredTags = useMemo(
    () =>
      ALL_TAGS.filter((tag) => {
        const matchesSearch = tag
          .toLowerCase()
          .includes(tagSearch.toLowerCase().trim());
        const notSelected = !selectedTags.includes(tag);
        return matchesSearch && notSelected;
      }),
    [tagSearch, selectedTags]
  );

  function handleAddTag(tag: string) {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev;
      }
      return [...prev, tag];
    });
    setPage(1);
  }

  function handleRemoveTag(tag: string) {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
    setPage(1);
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    setPage(1);
  }

  function handleUserNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUserName(e.target.value);
    setPage(1);
  }

  function handlePrevPage() {
    setPage((prev) => (prev > 1 ? prev - 1 : prev));
  }

  function handleNextPage() {
    setPage((prev) => (prev < totalPages ? prev + 1 : prev));
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Yakin ingin menghapus post ini?");
    if (!confirmed) {
      return;
    }
    try {
      await apiFetch<null>(`/api/posts/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((it) => it.id !== id));
      toast.success("Post berhasil dihapus");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menghapus post";
      toast.error(message);
    }
  }

  if (!session.token) {
    return null;
  }

  return (
    <main className="pt-16 p-4 container mx-auto space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Posts Saya</h1>
        <Button size="sm" onClick={() => navigate("/dashboard/posts/new")}>
          Create Post
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Filter Posts</CardTitle>
          <CardDescription>Atur pencarian dan filter post</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium">
                  Pencarian Judul
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Cari judul post..."
                  className="w-full md:w-60"
                />
              </div>
              {session.role === "admin" && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium">
                    Filter User (Nama)
                  </label>
                  <Input
                    type="text"
                    value={userName}
                    onChange={handleUserNameChange}
                    placeholder="Nama user pembuat post..."
                    className="w-full md:w-60"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2 md:min-w-65">
              <label className="block text-sm font-medium">Filter Tags</label>
              <Input
                type="text"
                placeholder="Cari tag..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="max-w-xs"
              />
              <Select
                onValueChange={(value) => {
                  if (!value) return;
                  handleAddTag(value);
                  setTagSearch("");
                }}
              >
                <SelectTrigger className="w-60">
                  <SelectValue placeholder="Pilih tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tags</SelectLabel>
                    {filteredTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedTags.map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <span>{tag}</span>
                      <span className="text-muted-foreground">×</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {loading ? (
        <Empty className="w-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Spinner className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Memuat posts</EmptyTitle>
            <EmptyDescription>
              Mohon tunggu, sedang memuat daftar posts.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {items.length === 0 ? (
            <Empty className="w-full">
              <EmptyHeader>
                <EmptyTitle>Belum ada post</EmptyTitle>
                <EmptyDescription>
                  Kamu belum memiliki post. Buat post pertama sekarang.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  size="sm"
                  onClick={() => navigate("/dashboard/posts/new")}
                >
                  Create Post
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <DataTable
              columns={columns}
              data={items}
              pagination={{
                pageCount: totalPages,
                pageIndex: page - 1,
                pageSize,
                totalItems,
                onPaginationChange: ({ pageIndex, pageSize }) => {
                  setPage(pageIndex + 1);
                  setPageSize(pageSize);
                },
              }}
            />
          )}
        </div>
      )}
    </main>
  );
}
