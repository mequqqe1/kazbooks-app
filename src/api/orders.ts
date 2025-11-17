import { http } from "./http";

export async function createOnlineOrder(bookId: string, amountTiyn: number) {
  const res = await http.post("/api/orders", {
    // если у тебя endpoint называется иначе (например /api/orders/online) — поменяй
    bookId,
    amountTiyn,
  });
  return res.data;
}
