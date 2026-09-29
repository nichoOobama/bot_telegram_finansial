const spreadsheetId = ''; // ID Spreadsheet
const sheetName = '';
const logSheetName = '';
const botToken = '';
const telegramApiUrl = `https://api.telegram.org/bot${botToken}`;

const PENGELUARAN_CATEGORIES = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja',
  'Tagihan & Utilitas',
  'Hiburan',
  'Kesehatan',
  'Lain-lain',
];

const PEMASUKAN_CATEGORIES = [
  'Uang Saku',
  'Gaji',
  'Bonus',
  'Investasi',
  'Penjualan',
  'Lain-lain',
];

const KATEGORI_KEYWORDS = {
  'Makanan & Minuman': [
    'makan', 'minum', 'kopi', 'teh', 'snack', 'jajan', 'warteg', 'bakso',
    'mie', 'nasi', 'ayam', 'sate', 'seblak', 'kantin', 'restoran', 'cafe',
    'bungkus', 'take away', 'delivery', 'gofood', 'grabfood', 'shopeefood',
  ],
  'Transportasi': [
    'bensin', 'pertalite', 'pertamax', 'spbu', 'parkir', 'tol', 'ojek',
    'grab', 'gojek', 'taxi', 'bus', 'kereta', 'tiket', 'bensin', 'kendaraan',
    'sparepart', 'servis', 'cuci motor', 'cuci mobil',
  ],
  'Belanja': [
    'belanja', 'market', 'supermarket', 'alfamart', 'indomaret', 'mart',
    'toko', 'online', 'shopee', 'tokopedia', 'lazada', 'baju', 'sepatu',
    'aksesoris', 'ponsel', 'gadget',
  ],
  'Tagihan & Utilitas': [
    'listrik', 'air', 'pdam', 'internet', 'wifi', 'pulsa', 'token',
    'tagihan', 'bpjs', 'pajak', 'rekening', 'telepon', 'langganan',
  ],
  'Hiburan': [
    'hiburan', 'film', 'bioskop', 'netflix', 'spotify', 'game', 'musik',
    'konser', 'tiket', 'liburan', 'jalan-jalan', 'wisata', 'hotel',
  ],
  'Kesehatan': [
    'obat', 'dokter', 'rumah sakit', 'klinik', 'apotek', 'vitamin',
    'masker', 'vaksin', 'cek lab', 'kesehatan',
  ],
  'Uang Saku': ['uang saku', 'kiriman', 'sangu', 'uang bulanan', 'uang mingguan'],
  'Gaji': ['gaji'],
  'Bonus': ['bonus', 'thr'],
  'Investasi': ['investasi', 'saham', 'crypto', 'deposito', 'reksadana'],
  'Penjualan': ['jual', 'penjualan', 'omset'],
};

function initializeHeader() {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName(sheetName);

  const expectedHeaders = ["Tanggal", "Jenis", "Kategori", "Nominal", "Keterangan"];
    sheet.insertRowBefore(1);
    
    // 1. Manually set values in every 2nd column (matching data layout)
    sheet.getRange(1, 1).setValue(expectedHeaders[0]);  // A
    sheet.getRange(1, 3).setValue(expectedHeaders[1]);  // C
    sheet.getRange(1, 5).setValue(expectedHeaders[2]);  // E
    sheet.getRange(1, 7).setValue(expectedHeaders[3]);  // G
    sheet.getRange(1, 9).setValue(expectedHeaders[4]);  // I
    
    // 2. Merge each header cell with its partner cell horizontally
    sheet.getRange(1, 1, 1, 2).merge();  // Merges A & B
    sheet.getRange(1, 3, 1, 2).merge();  // Merges C & D
    sheet.getRange(1, 5, 1, 2).merge();  // Merges E & F
    sheet.getRange(1, 7, 1, 2).merge();  // Merges G & H
    sheet.getRange(1, 9, 1, 2).merge();  // Merges I & J
    
    // 3. Format the full header block (Spans 10 columns total: Columns 1 to 10)
    var headerRange = sheet.getRange(1, 1, 1, 10);
    headerRange.setFontWeight("bold")
    .setBackground("#808080")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);

    sheet.getRange('A:B').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange('G:H').setNumberFormat('0');
                   
    Logger.log("Headers initialized successfully with 2-column wide layout.");
  } 


function log(message) {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName(logSheetName);
  sheet.appendRow([formatDate(new Date()), message]);
}

function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
}

function formatCurrency(num) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

function sendTelegramMessage(chatId, replyToMessageId, text, keyboard) {
  const data = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_to_message_id: replyToMessageId,
    disable_web_page_preview: true,
  };
  if (keyboard) {
    data.reply_markup = JSON.stringify(keyboard);
  }
  UrlFetchApp.fetch(`${telegramApiUrl}/sendMessage`, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(data),
  });
}

function sendTelegramChatAction(chatId, action) {
  UrlFetchApp.fetch(`${telegramApiUrl}/sendChatAction`, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: chatId, action: action }),
  });
}

// --- Parsing tanggal ---
function parseTanggal(text) {
  const today = new Date();
  const lower = text.toLowerCase().trim();

  if (lower.includes('hari ini')) return today;
  if (lower.includes('kemarin') || lower.includes('kmarin')) {
    const d = new Date(today); d.setDate(d.getDate() - 1); return d;
  }
  if (lower.includes('2 hari lalu')) {
    const d = new Date(today); d.setDate(d.getDate() - 2); return d;
  }
  if (lower.includes('3 hari lalu')) {
    const d = new Date(today); d.setDate(d.getDate() - 3); return d;
  }

  const namedDays = {
    'senin': 1, 'selasa': 2, 'rabu': 3, 'kamis': 4,
    'jumat': 5, 'sabtu': 6, 'minggu': 0,
  };
  for (const [dayName, dayNum] of Object.entries(namedDays)) {
    if (lower.includes(dayName)) {
      const d = new Date(today);
const diff = (d.getDay() - dayNum + 7) % 7;
       d.setDate(d.getDate() - diff);
      return d;
    }
  }

  const bulanMap = {
    'januari': 0, 'februari': 1, 'maret': 2, 'april': 3,
    'mei': 4, 'juni': 5, 'juli': 6, 'agustus': 7,
    'september': 8, 'oktober': 9, 'november': 10, 'desember': 11,
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3,
    'jun': 5, 'jul': 6, 'ags': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'des': 11,
  };

  const dateMatch = lower.match(/(\d{1,2})\s*(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|jun|jul|ags|sep|okt|nov|des)/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const month = bulanMap[dateMatch[2]];
    const year = today.getFullYear();
    return new Date(year, month, day);
  }

  const shortDateMatch = lower.match(/(\d{1,2})[\/-](\d{1,2})[\/-]?(\d{2,4})?/);
  if (shortDateMatch) {
    const day = parseInt(shortDateMatch[1]);
    const month = parseInt(shortDateMatch[2]) - 1;
    const year = shortDateMatch[3] ? parseInt(shortDateMatch[3]) : today.getFullYear();
    return new Date(year < 100 ? 2000 + year : year, month, day);
  }

  return today;
}

function toYYYYMMDD(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

// --- Parsing nominal ---
function parseNominal(text) {
  let cleaned = text.toLowerCase().replace(/[.,\s]/g, '');

  const multipliers = {
    'jt': 1000000, 'juta': 1000000, 'jut': 1000000,
    'm': 1000000, 'miliar': 1000000000, 'b': 1000000000, // orang have 🗿
    'ribu': 1000, 'rb': 1000, 'k': 1000, 'rebu': 1000, 'rebn': 1000,
  };

  for (const [suffix, multiplier] of Object.entries(multipliers)) {
    const regex = new RegExp(`(\\d+)\\s*${suffix}\\b`);
    const match = cleaned.match(regex);
    if (match) {
      return parseInt(match[1]) * multiplier;
    }
  }

  const pureNumber = text.replace(/[^\d]/g, '');
  if (pureNumber) return parseInt(pureNumber);

  return 0;
}

// --- Klasifikasi jenis transaksi ---
function getJenis(text) {
  const lower = text.toLowerCase();
  const pemasukanKeywords = [
    'gaji', 'bonus', 'THR', 'masuk', 'income', 'penjualan', 'jual',
    'omset', 'cuan', 'untung', 'transfer masuk', 'terima', 'dapat',
    'investasi', 'dividen', 'coupon',
  ];
  for (const kw of pemasukanKeywords) {
    if (lower.includes(kw.toLowerCase())) return 'Pemasukan';
  }
  return 'Pengeluaran';
}

// --- Klasifikasi kategori ---
function getKategori(text, jenis) {
  const lower = text.toLowerCase();
  const categories = jenis === 'Pemasukan' ? PEMASUKAN_CATEGORIES : PENGELUARAN_CATEGORIES;

  const keywordMap = {};
  for (const [cat, keywords] of Object.entries(KATEGORI_KEYWORDS)) {
    if (categories.includes(cat)) {
      keywordMap[cat] = keywords;
    }
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const [cat, keywords] of Object.entries(keywordMap)) {
    for (const kw of keywords) {
      if (lower.includes(kw) && kw.length > bestScore) {
        bestMatch = cat;
        bestScore = kw.length;
      }
    }
  }

  return bestMatch || (jenis === 'Pemasukan' ? 'Lain-lain' : 'Lain-lain');
}

// --- Ekstraksi nominal dari teks (ambil angka pertama) ---
function extractFirstNumber(text) {
  const cleaned = text.replace(/[^\d]/g, '');
  return cleaned ? parseInt(cleaned) : 0;
}

// --- Parse transaksi lengkap ---
function parseTransaction(text) {
  const jenis = getJenis(text);
  const kategori = getKategori(text, jenis);
  const tanggal = parseTanggal(text);
  const nominal = parseNominal(text);

  let keterangan = text;
  const removePatterns = [
    /hari ini/gi, /kemarin/gi, /kmarin/gi, /\d+\s*hari\s*lalu/gi,
    /senin|selasa|rabu|kamis|jumat|sabtu|minggu/gi,
    /\d{1,2}\s*(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|jun|jul|ags|sep|okt|nov|des)/gi,
    /\d{1,2}[\/-]\d{1,2}[\/-]?\d{0,4}/gi,
    /rp\.?\s*[\d.,]+/gi,
    /\d+\s*(jt|juta|miliar|ribu|rb|k|rebu|rebn|m|b)\b/gi,
  ];
  for (const pat of removePatterns) {
    keterangan = keterangan.replace(pat, '');
  }
  keterangan = keterangan.replace(/\s+/g, ' ').trim();
  if (!keterangan) keterangan = '-';

  return {
    tanggal: toYYYYMMDD(tanggal),
    jenis: jenis,
    kategori: kategori,
    nominal: nominal,
    keterangan: keterangan,
  };
}

// --- Simpan transaksi ke sheet ---
function saveTransaction(data) {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName(sheetName);
  const currentHeader = sheet.getRange(1, 1).getValue();

  if (!currentHeader) { initializeHeader(); }
 
 const lastRow = sheet.getLastRow() + 1;

  sheet.getRange(lastRow, 1).setValue(new Date(data.tanggal));
  sheet.getRange(lastRow, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange(lastRow, 3).setValue(data.jenis);
  sheet.getRange(lastRow, 5).setValue(data.kategori);
  sheet.getRange(lastRow, 7).setValue(Number(data.nominal));
  sheet.getRange(lastRow, 7).setNumberFormat('0');
  sheet.getRange(lastRow, 9).setValue(data.keterangan);

  sheet.getRange(lastRow, 1, 1, 2).merge();
  sheet.getRange(lastRow, 3, 1, 2).merge();
  sheet.getRange(lastRow, 5, 1, 2).merge();
  sheet.getRange(lastRow, 7, 1, 2).merge();
  sheet.getRange(lastRow, 9, 1, 2).merge();

  var fullRange = sheet.getRange(lastRow, 1, 1, 10);
  fullRange
  .setFontWeight("normal")
  .setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID)
  .setHorizontalAlignment("Left");
  log(`Transaksi disimpan: ${data.jenis} ${data.kategori} ${data.nominal} - ${data.keterangan}`);
}

// --- Riwayat transaksi (10 terakhir) ---
function getHistory() {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const rows = data.slice(1);
  return rows.slice(-10).reverse();
}

// --- Ringkasan bulanan ---
function getSummary() {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { pemasukan: 0, pengeluaran: 0 };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let pemasukan = 0;
  let pengeluaran = 0;

for (let i = 1; i < data.length; i++) {
    const tanggalStr = String(data[i][0]);
    const tgl = new Date(tanggalStr);
    if (tgl.getMonth() === currentMonth && tgl.getFullYear() === currentYear) {
      const jenis = String(data[i][2]).toLowerCase();
      const nominal = Number(data[i][6]) || 0;
      if (jenis === 'pemasukan') pemasukan += nominal;
      else if (jenis === 'pengeluaran') pengeluaran += nominal;
    }
  }

  return { pemasukan, pengeluaran };
}

// --- Reset data transaksi ---
function resetData() {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName(sheetName);
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  log('Semua data transaksi direset');
}

// --- Menu keyboard ---
function getMenuKeyboard() {
  return {
    keyboard: [
      [{ text: 'Riwayat' }, { text: 'Ringkasan' }],
      [{ text: 'Reset' }, { text: 'Export' }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
}

// --- Format pesan konfirmasi ---
function formatConfirmMsg(data) {
  const emoji = data.jenis === 'Pemasukan' ? '💵' : '💸';
  const sign = data.jenis === 'Pemasukan' ? '+' : '-';
  return [
    '✅ <b>Tercatat!</b>',
    '',
    `📅 <b>Tanggal:</b> ${data.tanggal}`,
    `${emoji} <b>Jenis:</b> ${data.jenis}`,
    `📂 <b>Kategori:</b> ${data.kategori}`,
    `💰 <b>Nominal:</b> ${sign}${formatCurrency(data.nominal)}`,
    `📝 <b>Keterangan:</b> ${data.keterangan}`,
  ].join('\n');
}

// --- Format riwayat ---
function formatHistory(rows) {
  if (rows.length === 0) return '📭 Belum ada transaksi.';

  const lines = ['📋 <b>10 Transaksi Terakhir:</b>', ''];
  rows.forEach((row, i) => {
    const tanggal = String(row[0]).substring(5);
    const jenis = String(row[2]).substring(0, 3);
    const kategori = String(row[4]);
    const nominal = Number(row[6]) || 0;
    const keterangan = String(row[8]);
    const sign = row[2] === 'Pemasukan' ? '+' : '-';
    lines.push(
      `${i + 1}. <code>${tanggal}</code> | ${jenis} | ${kategori} | ${sign}${formatCurrency(nominal)} | ${keterangan}`
    );
  });
  return lines.join('\n');
}

// --- Format ringkasan ---
function formatSummary() {
  const now = new Date();
  const bulan = Utilities.formatDate(now, Session.getScriptTimeZone(), 'MMMM yyyy');
  const { pemasukan, pengeluaran } = getSummary();
  const saldo = pemasukan - pengeluaran;

  return [
    `📊 <b>Ringkasan ${bulan}</b>`,
    '',
    `💵 <b>Pemasukan:</b> ${formatCurrency(pemasukan)}`,
    `💸 <b>Pengeluaran:</b> ${formatCurrency(pengeluaran)}`,
    `📈 <b>Saldo:</b> ${formatCurrency(saldo)}`,
  ].join('\n');
}

// ============================================================
// WEBHOOK HANDLER
// ============================================================
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const msg = contents.message;
    if (!msg) return;

    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const text = (msg.text || '').trim();

    if (!text) return;

    sendTelegramChatAction(chatId, 'typing');

    // --- /start ---
    if (text === '/start') {
      const welcome = [
        '👋 <b>Halo! Saya FinBot.</b>',
        '',
        'Saya asisten pencatatan keuangan pribadi Anda.',
        'Ketik <b>/menu</b> untuk melihat semua fitur,',
        'atau langsung ketik transaksi seperti:',
        '',
        '<code>makan siang warteg 25rb</code>',
        '<code>gaji bulanan 8 juta</code>',
        '<code>bensin motor 50k</code>',
      ].join('\n');
      sendTelegramMessage(chatId, messageId, welcome, getMenuKeyboard());
      return;
    }

    // --- /menu ---
    if (text === '/menu') {
      const menu = [
        '📋 <b>Menu FinBot</b>',
        '',
        'Ketik transaksi langsung untuk mencatat,',
        'atau pilih menu di bawah:',
        '',
        '• <b>Riwayat</b> — Lihat 10 transaksi terakhir',
        '• <b>Ringkasan</b> — Total bulan ini',
        '• <b>Reset</b> — Hapus semua data',
        '• <b>Export</b> — Buka Google Sheets',
      ].join('\n');
      sendTelegramMessage(chatId, messageId, menu, getMenuKeyboard());
      return;
    }

    // --- /help ---
    if (text === '/help') {
      const help = [
        '📖 <b>Cara Pakai FinBot</b>',
        '',
        '<b>Catat transaksi:</b>',
        'Ketik langsung dalam bahasa Indonesia.',
        'Contoh:',
        '  <code>makan siang 25rb</code>',
        '  <code>gaji 8jt</code>',
        '  <code>beli baju 150rb kemarin</code>',
        '  <code>transfer masuk 2 juta</code>',
        '',
        '<b>Singkatan nominal:</b>',
        '  <code>k / rb / ribu</code> = ×1.000',
        '  <code>jt / juta / m</code> = ×1.000.000',
        '  <code>b / miliar</code> = ×1.000.000.000',
        '',
        '<b>Perintah:</b>',
        '  /start — Mulai',
        '  /menu — Menu utama',
        '  /help — Bantuan ini',
      ].join('\n');
      sendTelegramMessage(chatId, messageId, help);
      return;
    }

    // --- Menu buttons ---
    if (text === 'Riwayat') {
      const rows = getHistory();
      sendTelegramMessage(chatId, messageId, formatHistory(rows));
      return;
    }

    if (text === 'Ringkasan') {
      sendTelegramMessage(chatId, messageId, formatSummary());
      return;
    }

    if (text === 'Reset') {
      resetData();
      sendTelegramMessage(chatId, messageId, '🗑️ Semua data transaksi berhasil direset.');
      return;
    }

    if (text === 'Export') {
      const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
      sendTelegramMessage(chatId, messageId, `📊 Buka Google Sheets:\n${url}`);
      return;
    }

    // --- Default: parse sebagai transaksi ---
    const data = parseTransaction(text);

    if (data.nominal === 0) {
      sendTelegramMessage(
        chatId,
        messageId,
        '⚠️ Tidak dapat mengenali nominal. Contoh:\n<code>makan siang 25rb</code>\n<code>gaji 8 juta</code>'
      );
      return;
    }

    saveTransaction(data);
    sendTelegramMessage(chatId, messageId, formatConfirmMsg(data));
  } catch (err) {
    log('ERROR doPost: ' + err.message);
    sendTelegramMessage(chatId, messageId, '⚠️ Terjadi kesalahan. Coba lagi atau hubungi admin.');
  }
}