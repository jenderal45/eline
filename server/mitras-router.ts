import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { mitra } from "@db/schema";
import { eq, like, desc, and, sql } from "drizzle-orm";

export const mitrasRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
        sort: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { search, status, sort, page = 1, limit = 10 } = input ?? {};

      const conditions = [];
      if (search) {
        conditions.push(like(mitra.nama, `%${search}%`));
      }
      if (status && status !== "semua") {
        conditions.push(eq(mitra.status, status as "aktif" | "nonaktif" | "kredit_penuh"));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const offset = (page - 1) * limit;

      let orderBy;
      if (sort === "nama_asc") {
        orderBy = mitra.nama;
      } else if (sort === "kredit_tertinggi") {
        orderBy = desc(mitra.kreditTerpakai);
      } else {
        orderBy = desc(mitra.createdAt);
      }

      const allResults = await db
        .select()
        .from(mitra)
        .where(whereClause)
        .orderBy(orderBy);

      const total = allResults.length;
      const items = allResults.slice(offset, offset + limit);

      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(mitra).where(eq(mitra.id, input.id));
      return result[0] ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        nama: z.string().min(1),
        namaPemilik: z.string().min(1),
        nomorHp: z.string().min(1),
        alamat: z.string().optional(),
        limitKredit: z.string().default("2000000"),
        status: z.enum(["aktif", "nonaktif", "kredit_penuh"]).default("aktif"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(mitra).values({
        nama: input.nama,
        namaPemilik: input.namaPemilik,
        nomorHp: input.nomorHp,
        alamat: input.alamat ?? "",
        limitKredit: input.limitKredit,
        status: input.status,
      });
      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        nama: z.string().optional(),
        namaPemilik: z.string().optional(),
        nomorHp: z.string().optional(),
        alamat: z.string().optional(),
        limitKredit: z.string().optional(),
        status: z.enum(["aktif", "nonaktif", "kredit_penuh"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(mitra).set(data).where(eq(mitra.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(mitra).where(eq(mitra.id, input.id));
      return { success: true };
    }),

  dropdown: publicQuery.query(async () => {
    const db = getDb();
    const result = await db
      .select({
        id: mitra.id,
        nama: mitra.nama,
        sisaKredit: sql<string>`CAST(${mitra.limitKredit} AS DECIMAL) - CAST(${mitra.kreditTerpakai} AS DECIMAL)`,
      })
      .from(mitra)
      .where(eq(mitra.status, "aktif"));
    return result;
  }),
});
