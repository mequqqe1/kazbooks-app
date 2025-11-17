import { http } from "./http";

export interface Book {
  id: string;
  title: string;
  author: string;
  slug: string;
  language: number;
  hasEbook: boolean;
  hasAudio: boolean;
  hasPhysical: boolean;
  minPrice: number;
}

export async function fetchBooks(q?: string, genreId?: string) {
  const res = await http.get("/api/books", {
    params: { q, genreId },
  });
  return res.data as { total: number; page: number; pageSize: number; items: Book[] };
}

export async function fetchBookDetails(id: string) {
  const res = await http.get(`/api/books/${id}`);
  return res.data;
}

export async function fetchLibrary() {
  const res = await http.get("/api/me/library");
  return res.data as Array<{
    bookId: string;
    title: string;
    author: string;
    slug: string;
    allowEbook: boolean;
    allowAudio: boolean;
    ebookUrl?: string;
    audioUrl?: string;
    grantedAt: string;
  }>;
}

export async function fetchBookAccess(bookId: string) {
  const res = await http.get(`/api/books/${bookId}/access`);
  return res.data as {
    bookId: string;
    hasLicense: boolean;
    allowEbook: boolean;
    allowAudio: boolean;
    ebookUrl?: string;
    audioUrl?: string;
  };
}
