import { getDb } from "../api/queries/connection";
import { mitra, transactions, payments } from "./schema";

async function seed() {
  const db = getDb();

  // Seed mitra
  const mitraData = [
    { nama: "PT Sumber Pulsa", namaPemilik: "Budi Santoso", nomorHp: "081234567890", alamat: "Jl. Sudirman No. 123, Jakarta Pusat", limitKredit: "5000000", kreditTerpakai: "3200000", status: "aktif" as const },
    { nama: "CV Digital Nusantara", namaPemilik: "Ani Wijaya", nomorHp: "081345678901", alamat: "Jl. Thamrin No. 45, Jakarta Selatan", limitKredit: "8000000", kreditTerpakai: "5800000", status: "aktif" as const },
    { nama: "Toko Makmur", namaPemilik: "Dedi Kurniawan", nomorHp: "081456789012", alamat: "Jl. Gatot Subroto No. 78, Jakarta Selatan", limitKredit: "3000000", kreditTerpakai: "2100000", status: "aktif" as const },
    { nama: "Konter Jaya", namaPemilik: "Siti Rahayu", nomorHp: "081567890123", alamat: "Jl. MH Thamrin No. 15, Bekasi", limitKredit: "4500000", kreditTerpakai: "3800000", status: "aktif" as const },
    { nama: "Pulsa Sejahtera", namaPemilik: "Ahmad Fauzi", nomorHp: "081678901234", alamat: "Jl. Pahlawan No. 56, Tangerang", limitKredit: "6000000", kreditTerpakai: "6000000", status: "kredit_penuh" as const },
    { nama: "Cellular Point", namaPemilik: "Rina Susanti", nomorHp: "081789012345", alamat: "Jl. Merdeka No. 89, Depok", limitKredit: "4000000", kreditTerpakai: "1500000", status: "aktif" as const },
    { nama: "Mega Pulsa", namaPemilik: "Hendra Wijaya", nomorHp: "081890123456", alamat: "Jl. Diponegoro No. 34, Bogor", limitKredit: "3500000", kreditTerpakai: "2800000", status: "aktif" as const },
    { nama: "Graha Telkom", namaPemilik: "Maya Indah", nomorHp: "081901234567", alamat: "Jl. Imam Bonjol No. 67, Jakarta Pusat", limitKredit: "10000000", kreditTerpakai: "7200000", status: "aktif" as const },
    { nama: "Seluler Nusantara", namaPemilik: "Yusuf Hamzah", nomorHp: "082012345678", alamat: "Jl. Teuku Umar No. 12, Jakarta Barat", limitKredit: "2500000", kreditTerpakai: "0", status: "nonaktif" as const },
    { nama: "Pulsa Express", namaPemilik: "Dewi Lestari", nomorHp: "082123456789", alamat: "Jl. Ahmad Yani No. 90, Jakarta Timur", limitKredit: "5500000", kreditTerpakai: "4200000", status: "aktif" as const },
  ];

  await db.insert(mitra).values(mitraData);
  console.log("Seeded 10 mitra");

  // Seed transactions
  const txData = [
    { mitraId: 1, tipe: "pulsa" as const, nomorHpTujuan: "081298765432", nominal: "50000", statusPembayaran: "lunas" as const },
    { mitraId: 1, tipe: "paket_data" as const, nomorHpTujuan: "081298765433", nominal: "100000", statusPembayaran: "belum_lunas" as const },
    { mitraId: 2, tipe: "pulsa" as const, nomorHpTujuan: "081298765434", nominal: "25000", statusPembayaran: "lunas" as const },
    { mitraId: 2, tipe: "paket_data" as const, nomorHpTujuan: "081298765435", nominal: "150000", statusPembayaran: "lunas" as const },
    { mitraId: 3, tipe: "pulsa" as const, nomorHpTujuan: "081298765436", nominal: "50000", statusPembayaran: "belum_lunas" as const },
    { mitraId: 4, tipe: "paket_data" as const, nomorHpTujuan: "081298765437", nominal: "125000", statusPembayaran: "lunas" as const },
    { mitraId: 5, tipe: "pulsa" as const, nomorHpTujuan: "081298765438", nominal: "100000", statusPembayaran: "belum_lunas" as const },
    { mitraId: 6, tipe: "pulsa" as const, nomorHpTujuan: "081298765439", nominal: "50000", statusPembayaran: "lunas" as const },
    { mitraId: 7, tipe: "paket_data" as const, nomorHpTujuan: "081298765440", nominal: "200000", statusPembayaran: "belum_lunas" as const },
    { mitraId: 8, tipe: "pulsa" as const, nomorHpTujuan: "081298765441", nominal: "75000", statusPembayaran: "lunas" as const },
    { mitraId: 1, tipe: "pulsa" as const, nomorHpTujuan: "081298765442", nominal: "100000", statusPembayaran: "belum_lunas" as const },
    { mitraId: 2, tipe: "paket_data" as const, nomorHpTujuan: "081298765443", nominal: "75000", statusPembayaran: "belum_lunas" as const },
    { mitraId: 3, tipe: "pulsa" as const, nomorHpTujuan: "081298765444", nominal: "25000", statusPembayaran: "lunas" as const },
    { mitraId: 4, tipe: "pulsa" as const, nomorHpTujuan: "081298765445", nominal: "50000", statusPembayaran: "belum_lunas" as const },
    { mitraId: 6, tipe: "paket_data" as const, nomorHpTujuan: "081298765446", nominal: "100000", statusPembayaran: "lunas" as const },
  ];

  await db.insert(transactions).values(txData);
  console.log("Seeded 15 transactions");

  // Seed payments
  const paymentData = [
    { transactionId: 1, mitraId: 1, jumlahBayar: "50000", metodePembayaran: "tunai" as const },
    { transactionId: 3, mitraId: 2, jumlahBayar: "25000", metodePembayaran: "transfer_bank" as const },
    { transactionId: 4, mitraId: 2, jumlahBayar: "150000", metodePembayaran: "qris" as const },
    { transactionId: 6, mitraId: 4, jumlahBayar: "125000", metodePembayaran: "tunai" as const },
    { transactionId: 8, mitraId: 6, jumlahBayar: "50000", metodePembayaran: "transfer_bank" as const },
    { transactionId: 10, mitraId: 8, jumlahBayar: "75000", metodePembayaran: "qris" as const },
    { transactionId: 13, mitraId: 3, jumlahBayar: "25000", metodePembayaran: "tunai" as const },
    { transactionId: 15, mitraId: 6, jumlahBayar: "100000", metodePembayaran: "transfer_bank" as const },
  ];

  await db.insert(payments).values(paymentData);
  console.log("Seeded 8 payments");
}

seed().catch(console.error);
