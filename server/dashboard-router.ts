import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { mitra, transactions, payments } from "@db/schema";
import { eq, desc, sql, count, sum } from "drizzle-orm";

export const dashboardRouter = createRouter({
  stats: publicQuery.query(async () => {
    const db = getDb();

    // Total dana tersedia = sum of all limitKredit
    const limitResult = await db
      .select({ total: sum(mitra.limitKredit) })
      .from(mitra)
      .where(eq(mitra.status, "aktif"));

    // Total kredit aktif = sum of kreditTerpakai
    const kreditResult = await db
      .select({ total: sum(mitra.kreditTerpakai) })
      .from(mitra);

    // Mitra aktif count
    const mitraAktifResult = await db
      .select({ count: count() })
      .from(mitra)
      .where(eq(mitra.status, "aktif"));

    // Total mitra
    const totalMitraResult = await db
      .select({ count: count() })
      .from(mitra);

    // Total piutang (belum lunas transactions)
    const piutangResult = await db
      .select({ total: sum(transactions.nominal) })
      .from(transactions)
      .where(eq(transactions.statusPembayaran, "belum_lunas"));

    // Total pembayaran bulan ini
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const pembayaranResult = await db
      .select({ total: sum(payments.jumlahBayar) })
      .from(payments)
      .where(sql`${payments.tanggalBayar} >= ${startOfMonth}`);

    // Transaction count
    const txCountResult = await db
      .select({ count: count() })
      .from(transactions);

    // Lunas count
    const lunasCountResult = await db
      .select({ count: count() })
      .from(transactions)
      .where(eq(transactions.statusPembayaran, "lunas"));

    return {
      totalDanaTersedia: Number(limitResult[0]?.total ?? 0),
      totalKreditAktif: Number(kreditResult[0]?.total ?? 0),
      mitraAktif: mitraAktifResult[0]?.count ?? 0,
      totalMitra: totalMitraResult[0]?.count ?? 0,
      totalPiutang: Number(piutangResult[0]?.total ?? 0),
      totalPembayaranBulanIni: Number(pembayaranResult[0]?.total ?? 0),
      totalTransaksi: txCountResult[0]?.count ?? 0,
      transaksiLunas: lunasCountResult[0]?.count ?? 0,
    };
  }),

  recentTransactions: publicQuery.query(async () => {
    const db = getDb();
    const result = await db
      .select({
        id: transactions.id,
        mitraId: transactions.mitraId,
        mitraNama: mitra.nama,
        tipe: transactions.tipe,
        nomorHpTujuan: transactions.nomorHpTujuan,
        nominal: transactions.nominal,
        statusPembayaran: transactions.statusPembayaran,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .leftJoin(mitra, eq(transactions.mitraId, mitra.id))
      .orderBy(desc(transactions.createdAt))
      .limit(5);
    return result;
  }),

  recentMitra: publicQuery.query(async () => {
    const db = getDb();
    const result = await db
      .select()
      .from(mitra)
      .orderBy(desc(mitra.createdAt))
      .limit(6);
    return result;
  }),

  transactionTrend: publicQuery.query(async () => {
    const db = getDb();
    // Get monthly totals for last 6 months
    const result = await db
      .select({
        month: sql<string>`DATE_FORMAT(${transactions.createdAt}, '%Y-%m')`,
        total: sum(transactions.nominal),
      })
      .from(transactions)
      .groupBy(sql`DATE_FORMAT(${transactions.createdAt}, '%Y-%m')`)
      .orderBy(desc(sql`DATE_FORMAT(${transactions.createdAt}, '%Y-%m')`))
      .limit(6);

    return result.reverse();
  }),

  creditDistribution: publicQuery.query(async () => {
    const db = getDb();
    const result = await db
      .select({
        nama: mitra.nama,
        total: sum(transactions.nominal),
      })
      .from(transactions)
      .leftJoin(mitra, eq(transactions.mitraId, mitra.id))
      .groupBy(mitra.id)
      .orderBy(desc(sum(transactions.nominal)))
      .limit(5);
    return result;
  }),
});
