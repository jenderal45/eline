import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { payments, transactions, mitra } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export const paymentsRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        mitraId: z.number().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { mitraId, page = 1, limit = 10 } = input ?? {};

      const conditions = [];
      if (mitraId) {
        conditions.push(eq(payments.mitraId, mitraId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const query = db
        .select({
          id: payments.id,
          transactionId: payments.transactionId,
          mitraId: payments.mitraId,
          mitraNama: mitra.nama,
          jumlahBayar: payments.jumlahBayar,
          tanggalBayar: payments.tanggalBayar,
          metodePembayaran: payments.metodePembayaran,
          keterangan: payments.keterangan,
          transactionNominal: transactions.nominal,
          transactionStatus: transactions.statusPembayaran,
          createdAt: payments.createdAt,
        })
        .from(payments)
        .leftJoin(mitra, eq(payments.mitraId, mitra.id))
        .leftJoin(transactions, eq(payments.transactionId, transactions.id))
        .where(whereClause)
        .orderBy(desc(payments.createdAt));

      const allResults = await query;
      const total = allResults.length;
      const offset = (page - 1) * limit;
      const items = allResults.slice(offset, offset + limit);

      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  create: publicQuery
    .input(
      z.object({
        transactionId: z.number(),
        mitraId: z.number(),
        jumlahBayar: z.string().min(1),
        tanggalBayar: z.string().optional(),
        metodePembayaran: z.enum(["tunai", "transfer_bank", "qris", "lainnya"]).default("tunai"),
        keterangan: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const result = await db.insert(payments).values({
        transactionId: input.transactionId,
        mitraId: input.mitraId,
        jumlahBayar: input.jumlahBayar,
        tanggalBayar: input.tanggalBayar ? new Date(input.tanggalBayar) : new Date(),
        metodePembayaran: input.metodePembayaran,
        keterangan: input.keterangan,
      });

      const tx = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, input.transactionId));

      if (tx[0]) {
        const allPayments = await db
          .select()
          .from(payments)
          .where(eq(payments.transactionId, input.transactionId));

        const totalPaid = allPayments.reduce(
          (sum, p) => sum + Number(p.jumlahBayar),
          0
        );

        if (totalPaid >= Number(tx[0].nominal)) {
          await db
            .update(transactions)
            .set({ statusPembayaran: "lunas" })
            .where(eq(transactions.id, input.transactionId));
        }

        const m = await db
          .select()
          .from(mitra)
          .where(eq(mitra.id, input.mitraId));

        if (m[0]) {
          const newKredit = Math.max(
            0,
            Number(m[0].kreditTerpakai) - Number(input.jumlahBayar)
          );
          let newStatus: "aktif" | "nonaktif" | "kredit_penuh" = "aktif";
          if (m[0].status === "kredit_penuh" && newKredit < Number(m[0].limitKredit)) {
            newStatus = "aktif";
          }
          await db
            .update(mitra)
            .set({
              kreditTerpakai: String(newKredit),
              status: newStatus,
            })
            .where(eq(mitra.id, input.mitraId));
        }
      }

      return { id: Number(result[0].insertId) };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(payments).where(eq(payments.id, input.id));
      return { success: true };
    }),
});
