"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { PostItem } from "../index";

export const columns: ColumnDef<PostItem>[] = [
  {
    accessorKey: "name",
    header: "Judul",
  },
  {
    accessorKey: "authorName",
    header: "Penulis",
  },
  {
    accessorKey: "categoryName",
    header: "Kategori",
  },
  {
    accessorKey: "tags",
    header: "Tags",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];
