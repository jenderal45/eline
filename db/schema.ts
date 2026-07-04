import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  decimal,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const mitra = mysqlTable("mitra", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  namaPemilik: varchar("nama_pemilik", { length: 255 }).notNull(),
  nomorHp: varchar("nomor_hp", { length: 20 }).notNull(),
  alamat: text("alamat"),
  limitKredit: decimal("limit_kredit", { precision: 15, scale: 0 }).notNull().default("2000000"),
  kreditTerpakai: decimal("kredit_terpakai", { precision: 15, scale: 0 }).notNull().default("0"),
  status: mysqlEnum("status", ["aktif", "nonaktif", "kredit_penuh"]).default("aktif").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Mitra = typeof mitra.$inferSelect;
export type InsertMitra = typeof mitra.$inferInsert;

export const transactions = mysqlTable("transactions", {
  id: serial("id").primaryKey(),
  mitraId: bigint("mitra_id", { mode: "number", unsigned: true }).notNull(),
  tipe: mysqlEnum("tipe", ["pulsa", "paket_data"]).notNull(),
  nomorHpTujuan: varchar("nomor_hp_tujuan", { length: 20 }).notNull(),
  nominal: decimal("nominal", { precision: 15, scale: 0 }).notNull(),
  keterangan: text("keterangan"),
  statusPembayaran: mysqlEnum("status_pembayaran", ["lunas", "belum_lunas"]).default("belum_lunas").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export const payments = mysqlTable("payments", {
  id: serial("id").primaryKey(),
  transactionId: bigint("transaction_id", { mode: "number", unsigned: true }).notNull(),
  mitraId: bigint("mitra_id", { mode: "number", unsigned: true }).notNull(),
  jumlahBayar: decimal("jumlah_bayar", { precision: 15, scale: 0 }).notNull(),
  tanggalBayar: timestamp("tanggal_bayar").defaultNow().notNull(),
  metodePembayaran: mysqlEnum("metode_pembayaran", ["tunai", "transfer_bank", "qris", "lainnya"]).default("tunai").notNull(),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
