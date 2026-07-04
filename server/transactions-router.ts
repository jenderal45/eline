import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { transactions, mitra } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export const transactionsRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        tipe: z.string().optional(),
        status: z.string().optional(),
        mitraId: z.number().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { tipe, status, mitraId, page = 1, limit = 10 } = input ?? {};

      const conditions = [];
      if (tipe && tipe !== "semua") {
        conditions.push(eq(transactions.tipe, tipe as "pulsa" | "paket_data"));
      }
      if (status && status !== "semua") {
        conditions.push(eq(transactions.statusPembayaran, status as "lunas" | "belum_lunas"));
      }
      if (mitraId) {
        conditions.push(eq(transactions.mitraId, mitraId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const query = db
        .select({
          id: transactions.id,
          mitraId: transactions.mitraId,
          mitraNama: mitra.nama,
          tipe: transactions.tipe,
          nomorHpTujuan: transactions.nomorHpTujuan,
          nominal: transactions.nominal,
          keterangan: transactions.keterangan,
          statusPembayaran: transactions.statusPembayaran,
          createdAt: transactions.createdAt,
        })
        .from(transactions)
        .leftJoin(mitra, eq(transactions.mitraId, mitra.id))
        .where(whereClause)
        .orderBy(desc(transactions.createdAt));

      const allResults = await query;
      const total = allResults.length;
      const offset = (page - 1) * limit;
      const items = allResults.slice(offset, offset + limit);

      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select({
          id: transactions.id,
          mitraId: transactions.mitraId,
          mitraNama: mitra.nama,
          tipe: transactions.tipe,
          nomorHpTujuan: transactions.nomorHpTujuan,
          nominal: transactions.nominal,
          keterangan: transactions.keterangan,
          statusPembayaran: transactions.statusPembayaran,
          createdAt: transactions.createdAt,
        })
        .from(transactions)
        .leftJoin(mitra, eq(transactions.mitraId, mitra.id))
        .where(eq(transactions.id, input.id));
      return result[0] ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        mitraId: z.number(),
        tipe: z.enum(["pulsa", "paket_data"]),
        nomorHpTujuan: z.string().min(1),
        nominal: z.string().min(1),
        keterangan: z.string().optional(),
        statusPembayaran: z.enum(["lunas", "belum_lunas"]).default("belum_lunas"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const result = await db.insert(transactions).values({
        mitraId: input.mitraId,
        tipe: input.tipe,
        nomorHpTujuan: input.nomorHpTujuan,
        nominal: input.nominal,
        keterangan: input.keterangan,
        statusPembayaran: input.statusPembayaran,
      });

      if (input.statusPembayaran === "belum_lunas") {
        const m = await db.select().from(mitra).where(eq(mitra.id, input.mitraId));
        if (m[0]) {
          const currentKredit = Number(m[0].kreditTerpakai);
          const newKredit = currentKredit + Number(input.nominal);
          const limit = Number(m[0].limitKredit);
          let newStatus = m[0].status;
          if (newKredit >= limit) {
            newStatus = "kredit_penuh";
          }
          await db
            .update(mitra)
            .set({
              kreditTerpakai: String(newKredit),
              status: newStatus as "aktif" | "nonaktif" | "kredit_penuh",
            })
            .where(eq(mitra.id, input.mitraId));
        }
      }

      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        tipe: z.enum(["pulsa", "paket_data"]).optional(),
        nomorHpTujuan: z.string().optional(),
        nominal: z.string().optional(),
        keterangan: z.string().optional(),
        statusPembayaran: z.enum(["lunas", "belum_lunas"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(transactions).set(data).where(eq(transactions.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(transactions).where(eq(transactions.id, input.id));
      return { success: true };
    }),
});
