# FinBot — Telegram Bot Pencatatan Keuangan (Bot Automation)

Telegram bot personal untuk pencatatan keuangan harian. Dibangun dengan **Google Apps Script** dan **Google Sheets** sebagai database.

Ketik transaksi dalam bahasa Indonesia, bot akan otomatis mengekstrak data dan mencatatnya ke Google Sheets.

## Fitur

- **Catat transaksi** — Ketik langsung seperti `makan siang 25rb` atau `gaji 8 juta`
- **Riwayat** — Lihat 10 transaksi terakhir
- **Ringkasan** — Total pemasukan & pengeluaran bulan ini
- **Reset** — Hapus semua data transaksi
- **Export** — Buka langsung Google Sheets
- **Auto-kategori** — Bot otomatis mengklasifikasikan kategori dari teks
- **Auto-jenis** — Pemasukan/Pengeluaran terdeteksi dari konteks kata

## Contoh Interaksi

```
User: makan siang warteg 25rb
Bot: ✅ Tercatat!
     📅 Tanggal: 2026-09-04
     💸 Jenis: Pengeluaran
     📂 Kategori: Makanan & Minuman
     💰 Nominal: -Rp 25.000
     📝 Keterangan: makan siang warteg

User: gaji bulanan 8 juta
Bot: ✅ Tercatat!
     📅 Tanggal: 2026-09-04
     💵 Jenis: Pemasukan
     📂 Kategori: Gaji
     💰 Nominal: +Rp 8.000.000
     📝 Keterangan: gaji bulanan

User: /menu
Bot: 📋 Menu FinBot
     • Riwayat — Lihat 10 transaksi terakhir
     • Ringkasan — Total bulan ini
     • Reset — Hapus semua data
     • Export — Buka Google Sheets

User: Ringkasan
Bot: 📊 Ringkasan September 2026
     💵 Pemasukan: Rp 8.000.000
     💸 Pengeluaran: Rp 25.000
     📈 Saldo: Rp 7.975.000
```

## Struktur Google Sheets

| Kolom | Isi |
|-------|-----|
| A | Tanggal (YYYY-MM-DD) |
| B | Jenis (Pengeluaran / Pemasukan) |
| C | Kategori |
| D | Nominal |
| E | Keterangan |
| F | Bulan-ThisYear

Sheet name: `Spend - In` (bisa diubah di variabel `sheetName`)

## Singkatan Nominal yang Didukung

| Singkatan | Nilai |
|-----------|-------|
| `k`, `rb`, `ribu`, `rebu` | ×1.000 |
| `jt`, `juta`, `m` | ×1.000.000 |
| `b`, `miliar` | ×1.000.000.000 |

## Format Chat Dengan Bot yang di Dukung

- Makan ayam geprek 10k.
- Minum kopi capucino 17000 di cafe.
- Terima uang sangu 200ribu.

## pemasukanKeywords = [
    'gaji', 'bonus', 'THR', 'masuk', 'income', 'penjualan', 'jual',
    'omset', 'cuan', 'untung', 'transfer masuk', 'terima', 'dapat',
    'investasi', 'dividen', 'coupon',
  ]; 
  ### keyword chat Selain yang ada di pemasukan keyword maka pesan akan di asumsikan sebagai kategori pengeluaran.

## kategoriKeyword = {
  ### Makanan & Minuman= [
    'makan', 'minum', 'kopi', 'teh', 'snack', 'jajan', 'warteg', 'bakso',
    'mie', 'nasi', 'ayam', 'sate', 'seblak', 'kantin', 'restoran', 'cafe',
    'bungkus', 'take away', 'delivery', 'gofood', 'grabfood', 'shopeefood',
  ] 
  <br>
  ### Transportasi= [
    'bensin', 'pertalite', 'pertamax', 'spbu', 'parkir', 'tol', 'ojek',
    'grab', 'gojek', 'taxi', 'bus', 'kereta', 'tiket', 'bensin', 'kendaraan',
    'sparepart', 'servis', 'cuci motor', 'cuci mobil',
  ]
  <br>
  ### Belanja= [
    'belanja', 'market', 'supermarket', 'alfamart', 'indomaret', 'mart',
    'toko', 'online', 'shopee', 'tokopedia', 'lazada', 'baju', 'sepatu',
    'aksesoris', 'ponsel', 'gadget',
  ]
  <br>
  ### Tagihan & Utilitas= [
    'listrik', 'air', 'pdam', 'internet', 'wifi', 'pulsa', 'token',
    'tagihan', 'bpjs', 'pajak', 'rekening', 'telepon', 'langganan',
  ]
  <br>
  ### Hiburan= [
    'hiburan', 'film', 'bioskop', 'netflix', 'spotify', 'game', 'musik',
    'konser', 'tiket', 'liburan', 'jalan-jalan', 'wisata', 'hotel',
  ]
  <br>
  ### Kesehatan= [
    'obat', 'dokter', 'rumah sakit', 'klinik', 'apotek', 'vitamin',
    'masker', 'vaksin', 'cek lab', 'kesehatan',
  ]
  <br>
  Uang Saku= ['uang saku', 'kiriman', 'sangu', 'uang bulanan', 'uang mingguan']
  <br>
  Gaji= ['gaji']
  <br>
  Bonus= ['bonus','thr']
  <br>
  Investasi= ['investasi', 'saham', 'crypto', 'deposito', 'reksadana']
  <br>
  Penjualan= ['jual', 'penjualan', 'omset'],
}; 
### diatas adalah keyword-keyword yang harus ada dalam keterangan message kalian agar bot dapat mengategorikan.

## Setup

1. Buka [script.google.com](https://script.google.com), buat project baru
2. Salin isi `Code.js` ke project
3. Isi variabel `spreadsheetId` dengan ID Google Sheets kamu
4. Isi variabel `botToken` dengan token dari @BotFather
5. Buat sheet bernama `Terserah Kamu` dengan header kolom A-F (kosongkan, bot akan isi otomatis)
6. Buat sheet `Log` untuk logging
7. Deploy sebagai Web App:
   - Deploy → Manage Deployments → New Deployment
   - Type: Web App
   - Execute as: Me
   - Who has access: Anyone
8. Set webhook Telegram:
   ```
   https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=<YOUR_DEPLOY_URL>
   ```

## Tech Stack

- Google Apps Script
- Telegram Bot API
- Google Sheets

## Tutorial Setup bisa buka di [youtube gua]().

Support Me [Link Saweria](https://saweria.co/nichootak).
