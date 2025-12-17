import { useEffect, useState } from "react";

type PostFormValues = {
  title: string;
  content: string;
  categoryName?: string;
  published: boolean;
};

type PostFormProps = {
  mode: "create" | "edit";
  initialValues?: PostFormValues;
  onSubmit: (values: PostFormValues) => Promise<void>;
  showCategory: boolean;
};

export function PostForm({
  mode,
  initialValues,
  onSubmit,
  showCategory,
}: PostFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [categoryName, setCategoryName] = useState(
    initialValues?.categoryName ?? ""
  );
  const [published, setPublished] = useState(initialValues?.published ?? false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTitle(initialValues?.title ?? "");
    setContent(initialValues?.content ?? "");
    setCategoryName(initialValues?.categoryName ?? "");
    setPublished(initialValues?.published ?? false);
  }, [
    initialValues?.title,
    initialValues?.content,
    initialValues?.categoryName,
    initialValues?.published,
  ]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextTitle = title.trim();
    const nextContent = content.trim();
    if (!nextTitle || !nextContent) {
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        title: nextTitle,
        content: nextContent,
        categoryName: categoryName.trim() || undefined,
        published,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mb-4 border rounded-md p-4">
      <h2 className="text-lg font-semibold mb-3">
        {mode === "create" ? "Buat Post Baru" : "Edit Post"}
      </h2>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="block text-sm font-medium">Judul</label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">Konten</label>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="w-full border rounded px-3 py-2 text-sm min-h-30"
          />
        </div>
        {showCategory && (
          <div className="space-y-1">
            <label className="block text-sm font-medium">
              Nama Kategori (opsional)
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            id="published"
            type="checkbox"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="published" className="text-sm">
            Terbitkan sekarang
          </label>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
            disabled={submitting}
          >
            {submitting
              ? mode === "create"
                ? "Menyimpan..."
                : "Memperbarui..."
              : mode === "create"
                ? "Simpan"
                : "Update"}
          </button>
        </div>
      </form>
    </section>
  );
}
