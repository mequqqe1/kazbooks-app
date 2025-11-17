// src/services/offlineBooks.ts
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";

const FS_ANY = FileSystem as any;

const BASE_DIR: string =
  (FS_ANY.documentDirectory as string | undefined) ??
  (FS_ANY.cacheDirectory as string | undefined) ??
  "";

const BOOKS_DIR = BASE_DIR + "books/";

async function ensureBooksDir() {
  const info = await FileSystem.getInfoAsync(BOOKS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(BOOKS_DIR, { intermediates: true });
  }
}

export function getLocalEpubPath(bookId: string): string {
  return BOOKS_DIR + `${bookId}.epub`;
}

export async function isEpubDownloaded(bookId: string): Promise<boolean> {
  await ensureBooksDir();
  const file = await FileSystem.getInfoAsync(getLocalEpubPath(bookId));
  return file.exists && (file.size ?? 0) > 0;
}

export async function downloadEpubWithAuth(bookId: string): Promise<string> {
  await ensureBooksDir();

  const token = await AsyncStorage.getItem("accessToken");
  if (!token) throw new Error("Нет токена, ты не авторизован");

  const url = `${API_BASE_URL}/api/Downloads/${bookId}/ebook`;
  const localPath = getLocalEpubPath(bookId);

  const download = FileSystem.createDownloadResumable(url, localPath, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "*/*",
    },
  });

  const res = await download.downloadAsync();
  if (!res || res.status !== 200) {
    throw new Error(`Ошибка загрузки: ${res?.status}`);
  }

  return localPath;
}
