/* ============================================================
   UI Layer — Teazzi Loyalty
   Data disediakan oleh data.js (Supabase). File ini hanya render.
   ============================================================ */

const $ = s => document.querySelector(s);
const app = $('#app');
const nav = $('#nav');

const now = new Date();
const MONTH = now.getMonth() + 1;
const SEASON = MONTH >= 11;
const YR = now.getFullYear();

let S = { me: null, rw: [], tx: [], hist: [0,0,0,0,0,0,0], users: [], lb: [] };

const me = () => S.users.find(u => u.id === S.me);
const members = () => (me() && me().role == 'customer') ? S.lb : S.users.filter(u => u.role == 'customer');
const lvl = n => n >= 150 ? ['Level 4','Master'] : n >= 60 ? ['Level 3','Legend'] : n >= 20 ? ['Level 2','Regular'] : ['Level 1','Rookie'];
const fmt = t => new Date(t).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const isDark = () => document.documentElement.dataset.theme
  ? document.documentElement.dataset.theme == 'dark'
  : matchMedia('(prefers-color-scheme: dark)').matches;

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

// Logo Image Function
const logo = c => `<img src="assets/logo.png" class="logo-img ${c ? 'white' : ''}" alt="Teazzi">`;

let lang = localStorage.getItem('tz_lang') || 'id';
document.documentElement.lang = lang;

const MONTHS = {
  id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December']
};
const DAYS = {
  id: ['Min','Sen','Sel','Rab','Kam','Jum','Sab'],
  en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
};

const I18N = {
  id: {
    tagline: 'Kumpulkan stamp, tukar reward favoritmu.',
    signIn: 'Masuk', signUp: 'Daftar', createAcc: 'Buat akun',
    fullName: 'Nama lengkap', pickBday: 'Pilih bulan lahir',
    pwHintPh: 'Kata sandi (min. 6 karakter)',
    forgotPw: 'Lupa kata sandi?',
    forgotTitle: 'Reset Kata Sandi',
    forgotDesc: 'Masukkan email akunmu. Kami akan mengirimkan link untuk membuat kata sandi baru.',
    sendReset: 'Kirim Link Reset',
    resetSent: 'Link reset kata sandi telah dikirim ke email kamu ✓',
    newPwTitle: 'Kata Sandi Baru',
    newPwDesc: 'Masukkan kata sandi baru untuk akun Teazzi kamu.',
    newPwPh: 'Kata sandi baru (min. 6 karakter)',
    savePw: 'Simpan Kata Sandi',
    pwUpdated: 'Kata sandi berhasil diperbarui ✓',
    nameReq: 'Isi nama lengkap terlebih dahulu',
    bmReq: 'Pilih bulan lahir terlebih dahulu',
    emailBad: 'Format email tidak valid', emailReq: 'Isi alamat email terlebih dahulu',
    pwMin: 'Kata sandi minimal 6 karakter',
    navHome: 'Beranda', navCard: 'Kartu', navRewards: 'Reward', navAct: 'Aktivitas', navMe: 'Profil',
    navScan: 'Kasir', navOv: 'Ringkasan', navMb: 'Member', navRw: 'Reward', navSf: 'Staff',
    tapQr: 'ketuk untuk QR', tapStamps: 'ketuk untuk stamp', loyaltyCard: 'LOYALTY CARD',
    qrHelp: 'Tunjukkan QR ke kasir<br>saat membayar.',
    qrIdle: 'Ketuk kartu untuk menampilkan QR',
    qrExpired: 'QR kadaluarsa — refresh otomatis',
    qrWarn: s => `Segera refresh · ${s} detik`,
    qrActive: s => `Berlaku ${s} detik`,
    nextRw: (i, n) => `Menuju ${i} ${n}`,
    moreStamps: n => `${n} stamp lagi. Semangat!`,
    cardFull: 'Kartu penuh!',
    cardFullDesc: 'Tukar Free Drink ke kasir untuk kartu baru.',
    rwReadyCount: n => `${n} reward siap`,
    bdayTitle: 'Hadiah ulang tahun!',
    bdayDesc: 'Bulan ini kamu dapat 1 minuman gratis. Tunjukkan ke kasir.',
    seasonDesc: 'Stamp bertema spesial selama musim akhir tahun. Kumpulkan semuanya!',
    myCard: 'Kartu Saya', stampCol: 'Koleksi stamp',
    of20: n => `${n} dari 20`,
    staffOnly: 'Stamp hanya bisa ditambahkan oleh staff Teazzi.',
    rewards: 'Reward', redeemed: 'Ditukar', readyBang: 'Siap!', ready: 'Siap', locked: 'Terkunci',
    bdaySub: 'Di bulan ulang tahun', spinVouchers: 'Voucher spin', fromSpin: 'Dari Lucky Spin',
    redeemCashier: 'Penukaran diproses oleh staff di kasir.',
    activity: 'Aktivitas', spinDesc: 'Putar sekali sehari, menangkan voucher',
    tomorrow: 'Besok lagi', spinBtn: 'Putar!',
    missions: 'Misi', done: 'Selesai',
    m1: '3 stamp minggu ini', m2: 'Dapatkan stamp musiman', m3: 'Tukar 1 reward', m4: 'Putar Lucky Spin hari ini',
    leaderboard: 'Peringkat member', noLb: 'Belum ada data peringkat.',
    history: 'Riwayat', noTx: 'Belum ada transaksi.',
    seasonalTag: ' (Musiman)', redeemWord: 'Tukar ', receiptWord: ' · Struk ',
    achievements: 'Pencapaian', unlocked: 'Tercapai',
    a1: 'Stamp Pertama', a2: '10 Stamp', a3: 'Kartu Penuh', a4: 'Reward Pertama', a5: 'Kolektor Musiman', a6: 'Level Regular', a7: 'Level Legend', a8: 'Level Master',
    profile: 'Profil',
    statsStamps: 'Stamp', statsLife: 'Total', statsRedeem: 'Ditukar',
    saveShareTitle: 'Simpan & Bagikan Kartu',
    saveShareSub: 'Unduh atau bagikan kartu & koleksi stamp',
    openStudio: 'Buat Kartu',
    prefTitle: 'Preferensi',
    layoutCollage: 'Collage (Depan + Stamp)', layoutFront: 'Depan', layoutBack: 'Stamp',
    downloadPng: 'Simpan PNG', shareCardBtn: 'Bagikan',
    cardSaved: 'Kartu berhasil disimpan ✓', cardShared: 'Kartu siap dibagikan ✓',
    shareFallback: 'Gambar diunduh & kode disalin ✓',
    lvlDesc: 'Naik level berdasarkan total stamp: Rookie (0), Regular (20), Legend (60), Master (150).',
    bdayNotSet: 'Belum diatur', bdayClaimed: 'Sudah diklaim tahun ini',
    bdayReady: 'Aktif bulan ini!', bdayWait: 'Gratis 1 minuman di bulan ulang tahun',
    referTitle: 'Ajak teman', referSub: c => `Bagikan kode ${c}`, copyCode: 'Salin kode',
    darkTitle: 'Mode gelap', darkSub: 'Tampilan nyaman di malam hari',
    langTitle: 'Bahasa', langSub: 'Pilih bahasa aplikasi',
    signOut: 'Keluar',
    cashier: 'Kasir', todayStamps: n => `Hari ini: ${n} stamp`,
    scanQr: 'Pindai QR member', orSelect: 'atau pilih member / ketik ID',
    idPh: 'mis. TZ-0001', notFound: 'Member tidak ditemukan.',
    bdayMonth: 'Ulang tahun bulan ini', rcPh: 'No. struk / transaksi (wajib)',
    addStamp: 'Tambah Stamp', redeemBtn: 'Tukar', useBtn: 'Pakai',
    noAct: 'Belum ada aktivitas.',
    panelTitle: 'Panel Teazzi', stamps7d: 'Stamp 7 hari terakhir', recentAct: 'Aktivitas terbaru',
    nameCol: 'Nama', atStamp: n => `Pada stamp ke-${n}`, editBtn: 'Ubah',
    rwNote: 'Perubahan berlaku untuk semua member.', active: 'Aktif',
    addStaff: 'Tambah staff',
    addStaffDesc: 'Orang tersebut harus daftar dulu lewat halaman Daftar, lalu masukkan emailnya di sini.',
    makeStaff: 'Jadikan staff',
    branchPh: 'Cabang / Outlet (mis. Grand Indonesia)',
    staffNamePh: 'Nama tampilan (opsional)',
    noBranch: 'Belum ada cabang',
    removeBtn: 'Hapus',
    confirmRemove: n => `Hapus ${n} dari daftar staff? Akun akan dikembalikan menjadi customer.`,
    staffRemoved: 'Staff berhasil dihapus ✓',
    staffUpdated: 'Data staff diperbarui ✓',
    editStaffTitle: 'Edit Staff',
    saveBtn: 'Simpan',
    searchMember: 'Cari nama, ID, atau email...',
    noStaff: 'Belum ada staff terdaftar.',
    editRwTitle: 'Ubah Reward',
    rwNamePh: 'Nama reward',
    rwIconPh: 'Ikon (emoji)',
    rwAtPh: 'Stamp ke berapa (1–20)',
    rwUpdated: 'Reward diperbarui ✓',
    invalidInput: 'Input tidak valid',
    todayBadge: n => `Hari ini +${n}`,
    vTitle: 'Cek Email Kamu', vSent: 'Link verifikasi telah dikirim ke',
    vBody: 'Klik link di email untuk mengaktifkan akun Teazzi kamu. Setelah diverifikasi, kamu bisa langsung login dan mulai mengumpulkan stamp.',
    vBack: 'Kembali ke Login', vSpam: 'Tidak menerima email? Cek folder Spam atau Promosi.',
    errDup: 'Nomor struk sudah pernah dipakai', errLoad: 'Gagal memuat data. Cek koneksi.',
    errCfg: 'Isi config.js dengan URL & anon key Supabase', errSrv: 'Gagal terhubung ke server',
    errAuth: 'Email atau sandi salah', errSignup: 'Lengkapi data (sandi min. 6 karakter)',
    errProf: 'Profil belum siap, coba lagi', errRc: 'Isi nomor struk untuk validasi transaksi',
    rwUnlock: n => `🎉 Reward terbuka: ${n}`,
    fullReset: 'Kartu penuh ditukar. Kartu baru dimulai!',
    redeemOk: 'Penukaran tercatat ✓', vNotFound: 'Voucher tidak ditemukan', vUsed: 'Voucher dipakai ✓',
    shareText: c => `Gabung Teazzi pakai kode ${c}`, shareOk: c => `Kode ${c} disalin 🎉`,
    spunToday: 'Sudah diputar hari ini',
    spinWin: n => `Kamu dapat ${n}!`, spinLose: 'Belum beruntung. Coba lagi besok!',
    close: 'Tutup', staffOk: 'Akun dijadikan staff ✓', fillEmail: 'Isi email',
    scanAim: 'Arahkan ke QR member', cancel: 'Batal',
    scanUnavail: 'Scanner tidak tersedia. Ketik ID member.',
    qrValid: n => `QR valid: ${n}`, camErr: 'Kamera tidak bisa dibuka. Ketik ID member.'
  },
  en: {
    tagline: 'Collect stamps, redeem your favorite rewards.',
    signIn: 'Sign In', signUp: 'Sign Up', createAcc: 'Create Account',
    fullName: 'Full name', pickBday: 'Select birth month',
    pwHintPh: 'Password (min. 6 characters)',
    forgotPw: 'Forgot password?',
    forgotTitle: 'Reset Password',
    forgotDesc: 'Enter your account email. We will send you a link to set a new password.',
    sendReset: 'Send Reset Link',
    resetSent: 'Password reset link sent to your email ✓',
    newPwTitle: 'New Password',
    newPwDesc: 'Enter a new password for your Teazzi account.',
    newPwPh: 'New password (min. 6 characters)',
    savePw: 'Save Password',
    pwUpdated: 'Password updated successfully ✓',
    nameReq: 'Please enter your full name',
    bmReq: 'Please select your birth month first',
    emailBad: 'Invalid email format', emailReq: 'Please enter your email first',
    pwMin: 'Password must be at least 6 characters',
    navHome: 'Home', navCard: 'Card', navRewards: 'Rewards', navAct: 'Activity', navMe: 'Profile',
    navScan: 'Cashier', navOv: 'Overview', navMb: 'Members', navRw: 'Rewards', navSf: 'Staff',
    tapQr: 'tap for QR', tapStamps: 'tap for stamps', loyaltyCard: 'LOYALTY CARD',
    qrHelp: 'Show QR to cashier<br>at checkout.',
    qrIdle: 'Tap card to show QR',
    qrExpired: 'QR expired — auto refreshing',
    qrWarn: s => `Refreshing soon · ${s}s`,
    qrActive: s => `Valid for ${s}s`,
    nextRw: (i, n) => `Next: ${i} ${n}`,
    moreStamps: n => `${n} more stamp${n > 1 ? 's' : ''} to go!`,
    cardFull: 'Card full!',
    cardFullDesc: 'Redeem Free Drink at the cashier for a new card.',
    rwReadyCount: n => `${n} reward${n === 1 ? '' : 's'} ready`,
    bdayTitle: 'Birthday treat!',
    bdayDesc: 'You get 1 free drink this month. Show this to the cashier.',
    seasonDesc: 'Special themed stamps for the year-end season. Collect them all!',
    myCard: 'My Card', stampCol: 'Stamp collection',
    of20: n => `${n} of 20`,
    staffOnly: 'Stamps can only be added by Teazzi staff.',
    rewards: 'Rewards', redeemed: 'Redeemed', readyBang: 'Ready!', ready: 'Ready', locked: 'Locked',
    bdaySub: 'During your birth month', spinVouchers: 'Spin vouchers', fromSpin: 'From Lucky Spin',
    redeemCashier: 'Redemptions are processed by staff at the cashier.',
    activity: 'Activity', spinDesc: 'Spin once a day to win vouchers',
    tomorrow: 'Tomorrow', spinBtn: 'Spin!',
    missions: 'Missions', done: 'Done',
    m1: '3 stamps this week', m2: 'Get a seasonal stamp', m3: 'Redeem 1 reward', m4: 'Spin Lucky Spin today',
    leaderboard: 'Leaderboard', noLb: 'No leaderboard data yet.',
    history: 'History', noTx: 'No transactions yet.',
    seasonalTag: ' (Seasonal)', redeemWord: 'Redeem ', receiptWord: ' · Receipt ',
    achievements: 'Achievements', unlocked: 'Unlocked',
    a1: 'First Stamp', a2: '10 Stamps', a3: 'Full Card', a4: 'First Reward', a5: 'Seasonal Collector', a6: 'Regular Level', a7: 'Legend Level', a8: 'Master Level',
    profile: 'Profile',
    statsStamps: 'Stamps', statsLife: 'Lifetime', statsRedeem: 'Redeemed',
    saveShareTitle: 'Save & Share Card',
    saveShareSub: 'Download or share your card & stamps',
    openStudio: 'Export Card',
    prefTitle: 'Preferences',
    layoutCollage: 'Collage (Front + Stamps)', layoutFront: 'Front', layoutBack: 'Stamps',
    downloadPng: 'Save PNG', shareCardBtn: 'Share',
    cardSaved: 'Card saved ✓', cardShared: 'Card ready to share ✓',
    shareFallback: 'Image downloaded & code copied ✓',
    lvlDesc: 'Level up by total stamps: Rookie (0), Regular (20), Legend (60), Master (150).',
    bdayNotSet: 'Not set', bdayClaimed: 'Claimed this year',
    bdayReady: 'Active this month!', bdayWait: '1 free drink in your birth month',
    referTitle: 'Refer a friend', referSub: c => `Share code ${c}`, copyCode: 'Copy code',
    darkTitle: 'Dark mode', darkSub: 'Comfortable view at night',
    langTitle: 'Language', langSub: 'Choose app language',
    signOut: 'Sign out',
    cashier: 'Cashier', todayStamps: n => `Today: ${n} stamp${n === 1 ? '' : 's'}`,
    scanQr: 'Scan member QR', orSelect: 'or select member / type ID',
    idPh: 'e.g. TZ-0001', notFound: 'Member not found.',
    bdayMonth: 'Birthday this month', rcPh: 'Receipt / transaction no. (required)',
    addStamp: 'Add Stamp', redeemBtn: 'Redeem', useBtn: 'Use',
    noAct: 'No activity yet.',
    panelTitle: 'Teazzi Panel', stamps7d: 'Stamps (last 7 days)', recentAct: 'Recent activity',
    nameCol: 'Name', atStamp: n => `At stamp #${n}`, editBtn: 'Edit',
    rwNote: 'Changes apply to all members.', active: 'Active',
    addStaff: 'Add staff',
    addStaffDesc: 'The person must sign up first, then enter their email here.',
    makeStaff: 'Make staff',
    branchPh: 'Branch / Outlet (e.g. Grand Indonesia)',
    staffNamePh: 'Display name (optional)',
    noBranch: 'No branch assigned',
    removeBtn: 'Remove',
    confirmRemove: n => `Remove ${n} from staff? Account will revert to customer.`,
    staffRemoved: 'Staff removed ✓',
    staffUpdated: 'Staff updated ✓',
    editStaffTitle: 'Edit Staff',
    saveBtn: 'Save',
    searchMember: 'Search name, ID, or email...',
    noStaff: 'No staff registered yet.',
    editRwTitle: 'Edit Reward',
    rwNamePh: 'Reward name',
    rwIconPh: 'Icon (emoji)',
    rwAtPh: 'At stamp (1–20)',
    rwUpdated: 'Reward updated ✓',
    invalidInput: 'Invalid input',
    todayBadge: n => `Today +${n}`,
    vTitle: 'Check Your Email', vSent: 'A verification link has been sent to',
    vBody: 'Click the link in the email to activate your Teazzi account. Once verified, you can sign in and start collecting stamps.',
    vBack: 'Back to Login', vSpam: "Didn't receive the email? Check your Spam or Promotions folder.",
    errDup: 'Receipt number already used', errLoad: 'Failed to load data. Check connection.',
    errCfg: 'Fill config.js with your Supabase URL & anon key', errSrv: 'Failed to connect to server',
    errAuth: 'Invalid email or password', errSignup: 'Complete all fields (password min. 6 chars)',
    errProf: 'Profile not ready yet, try again', errRc: 'Enter receipt number to validate transaction',
    rwUnlock: n => `🎉 Reward unlocked: ${n}`,
    fullReset: 'Full card redeemed. New card started!',
    redeemOk: 'Redemption recorded ✓', vNotFound: 'Voucher not found', vUsed: 'Voucher used ✓',
    shareText: c => `Join Teazzi with code ${c}`, shareOk: c => `Code ${c} copied 🎉`,
    spunToday: 'Already spun today',
    spinWin: n => `You won ${n}!`, spinLose: 'Better luck tomorrow!',
    close: 'Close', staffOk: 'Account promoted to staff ✓', fillEmail: 'Enter email',
    scanAim: 'Point at member QR', cancel: 'Cancel',
    scanUnavail: 'Scanner unavailable. Type member ID.',
    qrValid: n => `QR valid: ${n}`, camErr: 'Cannot open camera. Type member ID.'
  }
};

const t = (k, ...a) => {
  const v = (I18N[lang] && I18N[lang][k]) || I18N.id[k] || k;
  return typeof v === 'function' ? v(...a) : v;
};

function setLang(l) {
  if (lang == l) return;
  const sy = window.scrollY;
  const snap = !me() ? {
    nm: $('#nm')?.value, bm: $('#bm')?.value, em: $('#em')?.value, pw: $('#pw')?.value, fpEm: $('#fpEm')?.value
  } : null;
  lang = l;
  try { localStorage.setItem('tz_lang', l); } catch (e) {}
  document.documentElement.lang = l;
  document.querySelectorAll('.lang-sw').forEach(sw => {
    sw.style.setProperty('--l', l == 'en' ? 1 : 0);
    sw.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.textContent.toLowerCase() == l));
  });
  app.classList.add('lang-out');
  setTimeout(() => {
    navKey = '';
    app.classList.remove('lang-out');
    render();
    window.scrollTo(0, sy);
    if (snap) {
      if ($('#nm') && snap.nm !== undefined) $('#nm').value = snap.nm;
      if ($('#bm') && snap.bm) pickBm(+snap.bm, false);
      if ($('#em') && snap.em !== undefined) $('#em').value = snap.em;
      if ($('#pw') && snap.pw !== undefined) $('#pw').value = snap.pw;
      if ($('#fpEm') && snap.fpEm !== undefined) $('#fpEm').value = snap.fpEm;
    }
  }, 160);
}

const langBtn = () => `<div class="lang-sw" style="--l:${lang == 'en' ? 1 : 0}" role="group" aria-label="Language"><i></i><button type="button" class="${lang == 'id' ? 'on' : ''}" onclick="setLang('id')">ID</button><button type="button" class="${lang == 'en' ? 'on' : ''}" onclick="setLang('en')">EN</button></div>`;

const greet = () => {
  const h = new Date().getHours();
  if (lang == 'en') return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
};
const bdayOk = u => u.bday == MONTH && u.bd != YR;

let tab = 'home', mode = 'in', flipped = false, selId = '', lastPop = -1, quiet = 0, navKey = '', mbQuery = '';
let qrTimerInt = null;

// Icons SVG
const ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
  card: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`,
  reward: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>`,
  act: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
  me: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  scan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  staff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;display:inline-block;vertical-align:middle;margin-right:6px;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
};

const DT = { customer: 'home', staff: 'scan', admin: 'ov' };
const NAVS = {
  customer: [['home', ICONS.home, 'navHome'],['card', ICONS.card, 'navCard'],['rewards', ICONS.reward, 'navRewards'],['act', ICONS.act, 'navAct'],['me', ICONS.me, 'navMe']],
  staff:    [['scan', ICONS.scan, 'navScan'],['act', ICONS.clock, 'navAct']],
  admin:    [['ov', ICONS.chart, 'navOv'],['mb', ICONS.users, 'navMb'],['rw', ICONS.reward, 'navRw'],['sf', ICONS.staff, 'navSf']]
};

/* ---------- TOAST & EFFECTS ---------- */
const toast = m => {
  const d = document.createElement('div');
  d.className = 'toast gl';
  d.textContent = m;
  document.body.append(d);
  setTimeout(() => d.classList.add('out'), 2400);
  setTimeout(() => d.remove(), 2800);
};

function burst(n, E) {
  try { navigator.vibrate && navigator.vibrate(n > 14 ? [30,40,60] : 25); } catch (e) {}
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span'), a = Math.random() * 6.28, d = 80 + Math.random() * 150;
    s.className = 'pt';
    s.textContent = E[i % E.length];
    s.style.cssText = `--x:${Math.cos(a)*d}px;--y:${Math.sin(a)*d-50}px;--r:${Math.random()*360}deg`;
    document.body.append(s);
    setTimeout(() => s.remove(), 1300);
  }
}

/* ---------- GLOBAL LISTENERS ---------- */
document.addEventListener('pointermove', e => {
  const f = e.target.closest && e.target.closest('.flip');
  if (!f) return;
  const r = f.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - .5;
  const y = (e.clientY - r.top) / r.height - .5;
  f.classList.add('t');
  f.style.setProperty('--ry', x * 18 + 'deg');
  f.style.setProperty('--rx', -y * 18 + 'deg');
  f.style.setProperty('--sx', (x + .5) * 100 + '%');
});

document.addEventListener('pointerout', e => {
  const f = e.target.closest && e.target.closest('.flip');
  if (f && !f.contains(e.relatedTarget)) {
    f.classList.remove('t');
    f.style.setProperty('--rx', '0deg');
    f.style.setProperty('--ry', '0deg');
  }
});

document.addEventListener('pointerdown', e => {
  const bm = $('.bm-wrap');
  if (bm && bm.classList.contains('open') && !bm.contains(e.target)) bm.classList.remove('open');
});

document.addEventListener('keydown', e => {
  if (e.key != 'Enter' || e.isComposing) return;
  const t = e.target;
  if (!t || (t.tagName != 'INPUT' && t.tagName != 'SELECT' && t.id != 'bmBtn')) return;
  if (!me()) {
    e.preventDefault();
    if (t.id == 'nm') {
      if (checkName(true)) {
        const b = $('#bmBtn');
        if (b) { b.focus(); if (!$('#bm').value) $('.bm-wrap')?.classList.add('open'); }
        else $('#em')?.focus();
      }
    } else if (t.id == 'bmBtn') {
      if (checkBm(true)) $('#em')?.focus();
      else $('.bm-wrap')?.classList.add('open');
    } else if (t.id == 'em') {
      if (mode == 'up' && !checkName(true)) { $('#nm')?.focus(); return; }
      if (mode == 'up' && !checkBm(true)) { $('#bmBtn')?.focus(); $('.bm-wrap')?.classList.add('open'); return; }
      if (checkEmail(true)) $('#pw')?.focus();
    } else if (t.id == 'pw') {
      if (mode == 'up' && !checkName(true)) { $('#nm')?.focus(); return; }
      if (mode == 'up' && !checkBm(true)) { $('#bmBtn')?.focus(); $('.bm-wrap')?.classList.add('open'); return; }
      if (!checkEmail(true)) { $('#em')?.focus(); return; }
      if (checkPw(true)) auth();
    } else if (t.id == 'fpEm') { if (checkEmail(true, '#fpEm')) sendReset(); }
    else if (t.id == 'newPw') { if (checkPw(true, '#newPw', '#newPwMsg')) saveNewPw(); }
    else auth();
  } else if (t.id == 'rc') {
    e.preventDefault();
    const b = document.querySelector('[onclick^="addStamp"]');
    b && b.click();
  } else if (t.id == 'sn' || t.id == 'se' || t.id == 'sbName' || t.id == 'sbBranch') {
    e.preventDefault();
    addStaff();
  } else if (t.id == 'esN' || t.id == 'esB') {
    e.preventDefault();
    $('#esSv')?.click();
  } else if (t.id == 'rwN' || t.id == 'rwI' || t.id == 'rwA') {
    e.preventDefault();
    $('#rwSv')?.click();
  }
});

/* ---------- STAMP ANIMATION ---------- */
function stampFx(n, seas) {
  const o = document.createElement('div');
  o.className = 'fx';
  let L = '';
  for (let i = 0; i < 9; i++) L += `<b style="transform:translateZ(${i*2}px);background:hsl(225 62% ${24+i*2.4}%)"></b>`;
  for (let i = 0; i < 12; i++) L += `<b class="nk" style="transform:translateZ(${18+i*3}px);background:hsl(222 14% ${56+i*2}%)"></b>`;
  for (let i = 0; i < 8; i++) L += `<b class="kn" style="transform:translateZ(${54+i*2}px);background:hsl(10 82% ${40+i*2.5}%)"></b>`;
  o.innerHTML = `<div class="stage"><div class="ink3">${seas ? '❄' : '🍃'}<span>${n}</span></div><div class="st3">${L}</div></div><p class="fxt">Stamp ke-${n}!</p>`;
  document.body.append(o);
  setTimeout(() => burst(10, ['★', '✦', '✧']), 1050);
  const x = () => { o.classList.add('out'); setTimeout(() => o.remove(), 450); };
  o.onclick = x;
  setTimeout(x, 3100);
}

/* ---------- NAV & RENDER ---------- */
function setNav(u) {
  if (!u) { nav.style.display = 'none'; navKey = ''; return; }
  const L = NAVS[u.role];
  nav.style.display = '';
  if (navKey != u.role) {
    navKey = u.role;
    nav.innerHTML = '<i></i>' + L.map(n => `<button data-k="${n[0]}" onclick="go('${n[0]}')">${n[1]}<span>${t(n[2])}</span></button>`).join('');
  }
  nav.style.setProperty('--n', L.length);
  nav.style.setProperty('--i', Math.max(0, L.findIndex(n => n[0] == tab)));
  nav.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.k == tab));
}

function go(k) { tab = k; render(); }

function render() {
  hideQR();
  flipped = false;

  const u = me();
  setNav(u);
  if (!u) login();
  else ({ customer, staff, admin })[u.role]();

  if (quiet) {
    app.classList.remove('pg');
  } else {
    app.classList.remove('pg');
    void app.offsetWidth;
    app.classList.add('pg');
    [...app.children].forEach((c, i) => c.style.animationDelay = Math.min(i, 8) * .07 + 's');
    window.scrollTo(0, 0);
  }
  quiet = 0;

  if (u && u.role == 'customer' && u.seen < u.stamps && (tab == 'home' || tab == 'card')) {
    const n = u.stamps;
    u.seen = n;
    dbSeen();
    setTimeout(() => {
      stampFx(n, u.st && u.st[n-1]);
      const r = S.rw.find(x => x.at == n);
      if (r) setTimeout(() => {
        toast('Reward terbuka: ' + r.n);
        burst(15, ['★', '✦', '✧']);
      }, 3300);
    }, 800);
  }
}

/* ---------- LOGIN / SIGNUP ---------- */
const isValidEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

function checkName(pop) {
  const el = $('#nm');
  if (!el) return true;
  const ok = !!el.value.trim();
  el.classList.toggle('err', !ok);
  if (!ok && pop) fail(t('nameReq'));
  return ok;
}

function checkBm(pop) {
  const inp = $('#bm'), btn = $('#bmBtn');
  if (!inp) return true;
  const ok = +inp.value >= 1 && +inp.value <= 12;
  if (btn) btn.classList.toggle('err', !ok);
  if (!ok && pop) fail(t('bmReq'));
  return ok;
}

function checkEmail(pop, sel = '#em') {
  const el = $(sel);
  if (!el) return true;
  const v = el.value.trim();
  const ok = isValidEmail(v);
  el.classList.toggle('err', !ok);
  if (!ok && pop) fail(t(v ? 'emailBad' : 'emailReq'));
  return ok;
}

function checkPw(pop, sel = '#pw', msgSel = '#pwMsg') {
  const el = $(sel), msg = $(msgSel);
  if (!el) return true;
  const ok = el.value.length >= 6;
  el.classList.toggle('err', !ok);
  if (msg) msg.textContent = ok ? '' : t('pwMin');
  if (!ok && pop) fail(t('pwMin'));
  return ok;
}

function togglePw(sel = '#pw', btnSel = '.pw-eye') {
  const pw = $(sel), btn = $(btnSel);
  if (!pw || !btn) return;
  const show = pw.type === 'password';
  pw.type = show ? 'text' : 'password';
  btn.innerHTML = show ? ICONS.eyeOff : ICONS.eye;
  btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
}

function toggleBm() {
  const w = $('.bm-wrap');
  if (w) w.classList.toggle('open');
}

function pickBm(m, goNext = true) {
  const inp = $('#bm'), btn = $('#bmBtn'), lbl = $('#bmLbl'), w = $('.bm-wrap');
  if (inp) inp.value = m;
  if (lbl) lbl.textContent = MONTHS[lang][m - 1] || t('pickBday');
  if (btn) { btn.classList.toggle('ph', !m); btn.classList.remove('err'); }
  document.querySelectorAll('.bm-opt').forEach((b, i) => b.classList.toggle('on', i + 1 === m));
  if (w) w.classList.remove('open');
  if (goNext && m) $('#em')?.focus();
}

function lf() {
  const bdayOpts = MONTHS[lang].map((m, i) => `<button type="button" class="bm-opt" onclick="pickBm(${i + 1})">${m}</button>`).join('');
  const bmPicker = `<div class="bm-wrap"><input type="hidden" id="bm" value=""><button type="button" class="bm-btn ph" id="bmBtn" onclick="toggleBm()"><span id="bmLbl">${t('pickBday')}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></button><div class="bm-menu gl">${bdayOpts}</div></div>`;
  return `${mode == 'up' ? `<input id="nm" placeholder="${t('fullName')}" enterkeyhint="next" oninput="this.classList.remove('err')">${bmPicker}` : ''}<input id="em" type="email" placeholder="Email" autocomplete="email" enterkeyhint="next" oninput="if(this.classList.contains('err')&&isValidEmail(this.value.trim()))this.classList.remove('err')" onblur="if(this.value.trim()&&!isValidEmail(this.value.trim()))checkEmail(true)"><div class="pw-wrap"><input id="pw" type="password" placeholder="${t('pwHintPh')}" autocomplete="${mode == 'in' ? 'current-password' : 'new-password'}" enterkeyhint="go" oninput="if(this.value.length>0||this.classList.contains('err'))checkPw(false)"><button type="button" class="pw-eye" onclick="togglePw()" aria-label="Show password">${ICONS.eye}</button></div><p class="field-msg" id="pwMsg"></p>${mode == 'in' ? `<div class="link-row"><button type="button" class="link-btn" onclick="forgotPwUI()">${t('forgotPw')}</button></div>` : ''}<button class="btn" style="margin-top:10px" onclick="auth()">${mode == 'in' ? t('signIn') : t('createAcc')}</button>`;
}

function forgotPwUI() {
  const preset = ($('#em') && $('#em').value.trim()) || '';
  app.innerHTML = `
    <div class="lang-bar">${langBtn()}</div>
    <div class="hero">${logo()}</div>
    <div class="gl card" id="fm" style="margin-top:8px">
      <h3 style="font-size:18px;margin-bottom:6px">${t('forgotTitle')}</h3>
      <p class="m" style="margin-bottom:14px;line-height:1.5">${t('forgotDesc')}</p>
      <input id="fpEm" type="email" placeholder="Email" autocomplete="email" value="${esc(preset)}" enterkeyhint="go" oninput="if(this.classList.contains('err')&&isValidEmail(this.value.trim()))this.classList.remove('err')">
      <button class="btn" style="margin-top:10px" onclick="sendReset()">${t('sendReset')}</button>
      <button type="button" class="chip" style="width:100%;margin-top:10px" onclick="mode='in';render()">${t('vBack')}</button>
    </div>
  `;
}

function resetPwUI() {
  nav.style.display = 'none';
  app.innerHTML = `
    <div class="lang-bar">${langBtn()}</div>
    <div class="hero">${logo()}</div>
    <div class="gl card" id="fm" style="margin-top:8px">
      <h3 style="font-size:18px;margin-bottom:6px">${t('newPwTitle')}</h3>
      <p class="m" style="margin-bottom:14px;line-height:1.5">${t('newPwDesc')}</p>
      <div class="pw-wrap"><input id="newPw" type="password" placeholder="${t('newPwPh')}" autocomplete="new-password" enterkeyhint="go" oninput="if(this.value.length>0||this.classList.contains('err'))checkPw(false,'#newPw','#newPwMsg')"><button type="button" class="pw-eye" onclick="togglePw('#newPw','.pw-eye')" aria-label="Show password">${ICONS.eye}</button></div>
      <p class="field-msg" id="newPwMsg"></p>
      <button class="btn" style="margin-top:10px" onclick="saveNewPw()">${t('savePw')}</button>
    </div>
  `;
}

function setMode(m) {
  mode = m;
  $('.seg').style.setProperty('--i', m == 'in' ? 0 : 1);
  document.querySelectorAll('.seg button').forEach((b, i) => b.classList.toggle('on', i == (m == 'in' ? 0 : 1)));
  $('#fm').innerHTML = lf();
}

function login() {
  app.innerHTML = `
    <div class="lang-bar">${langBtn()}</div>
    <div class="hero">
      ${logo()}
      <p class="m" style="margin-top:16px;font-size:14px;font-weight:500;">${t('tagline')}</p>
    </div>
    <div class="seg gl" style="--i:${mode == 'in' ? 0 : 1}">
      <i></i>
      <button class="${mode == 'in' ? 'on' : ''}" onclick="setMode('in')">${t('signIn')}</button>
      <button class="${mode == 'up' ? 'on' : ''}" onclick="setMode('up')">${t('signUp')}</button>
    </div>
    <div class="gl card" id="fm" style="margin-top:0">${lf()}</div>
  `;
}

/* ---------- CARD + QR ---------- */
function cardHtml(u, backMode = 'qr') {
  const L = lvl(u.life);
  const isQr = backMode === 'qr';
  const backHtml = isQr
    ? `<div class="face back">
        <div class="qr" id="qrbox"></div>
        <div>
          <div style="font:800 18px 'Poppins'">${esc(u.id)}</div>
          <p style="font-size:11px;opacity:.8;margin-top:6px;font-weight:500">${t('qrHelp')}</p>
        </div>
      </div>`
    : `<div class="face back stamps-back">
        <div class="row"><span style="font:700 10px 'Poppins';letter-spacing:1.6px;opacity:.8">${t('stampCol').toUpperCase()}</span><span style="font:700 12px 'Poppins'">${u.stamps}/20</span></div>
        <div class="mini-grid">${Array.from({ length: 20 }, (_, i) => {
          const n = i + 1, on = n <= u.stamps, rw = S.rw.find(x => x.at == n);
          return `<div class="mini-dot ${on ? 'on' : ''} ${rw ? 'rw' : ''}">${on ? '✓' : n}</div>`;
        }).join('')}</div>
      </div>`;

  return `<div class="flip ${flipped ? 'f' : ''}" onclick="toggleCard(this,'${backMode}')"><div class="fi">
    <div class="face">
      <div class="row" style="align-items:flex-start">${logo(1)}<span style="font-size:10px;opacity:.72;font-weight:500">${t(isQr ? 'tapQr' : 'tapStamps')}</span></div>
      <div style="position:absolute;left:22px;bottom:18px">
        <div style="font:600 10px 'Poppins';letter-spacing:2px;opacity:.75">${t('loyaltyCard')}</div>
        <div style="font:800 22px 'Poppins';margin:4px 0">${esc(u.name)}</div>
        <div style="font-size:12px;opacity:.86;font-weight:500">${L[0]} – ${L[1]} · ${esc(u.id)}</div>
      </div>
      <div style="position:absolute;right:22px;bottom:16px;font:800 34px 'Poppins'">${u.stamps}<span style="font-size:14px;opacity:.7">/20</span></div>
    </div>
    ${backHtml}
  </div></div>${isQr ? `
  <div class="qr-timer" id="qrTimer" data-state="idle">
    <div class="qr-timer-content">
      ${ICONS.clock.replace('<svg ', '<svg class="qr-timer-icon" ')}
      <span class="qr-timer-text">${t('qrIdle')}</span>
    </div>
    <div class="qr-timer-bar"><i></i></div>
  </div>` : ''}`;
}

async function toggleCard(el, backMode = 'qr') {
  flipped = !flipped;
  el.classList.toggle('f');
  if (backMode !== 'qr') return;
  if (flipped) {
    const u = me();
    if (u) await showQR(u);
  } else {
    hideQR();
  }
}

async function showQR(u) {
  const box = $('#qrbox');
  if (!box) return;

  let token = qrCache.token;
  let expires = qrCache.expires;
  if (!token || expires - Date.now() < 30000) {
    const fresh = await refreshQRToken();
    if (!fresh || !flipped || !$('#qrbox')) return;
    token = fresh.token;
    expires = fresh.expires;
  }

  box.innerHTML = '';
  try {
    new QRCode(box, { text: token, width: 122, height: 122 });
  } catch (e) {
    box.innerHTML = '<b style="color:#000;font:700 10px monospace">' + token.slice(0, 8) + '...</b>';
  }

  const total = 120000;
  clearInterval(qrTimerInt);
  const upd = () => {
    const el = $('#qrTimer');
    if (!el) { clearInterval(qrTimerInt); return; }
    const txt = el.querySelector('.qr-timer-text');
    const bar = el.querySelector('.qr-timer-bar i');
    const rem = Math.max(0, expires - Date.now());
    const sec = Math.ceil(rem / 1000);
    const pct = Math.min(100, Math.max(0, rem / total * 100));

    if (rem <= 0) {
      el.dataset.state = 'expired';
      txt.textContent = t('qrExpired');
    } else if (rem < 30000) {
      el.dataset.state = 'warn';
      txt.textContent = t('qrWarn', sec);
    } else {
      el.dataset.state = 'active';
      txt.textContent = t('qrActive', sec);
    }
    if (bar) bar.style.width = pct + '%';

    if (rem <= 0) {
      clearInterval(qrTimerInt);
      if (flipped && me()) setTimeout(() => showQR(me()), 800);
    }
  };
  upd();
  qrTimerInt = setInterval(upd, 1000);
}

function hideQR() {
  clearInterval(qrTimerInt);
  qrTimerInt = null;
  const el = $('#qrTimer');
  if (el) {
    el.dataset.state = 'idle';
    const txt = el.querySelector('.qr-timer-text');
    const bar = el.querySelector('.qr-timer-bar i');
    if (txt) txt.textContent = t('qrIdle');
    if (bar) bar.style.width = '0%';
  }
}

/* ---------- CARD GRID ---------- */
function gridHtml(u) {
  let h = '<div class="grid">';
  for (let i = 1; i <= 20; i++) {
    const r = S.rw.find(x => x.at == i);
    const on = i <= u.stamps;
    const se = u.st && u.st[i-1];
    h += `<div class="cell ${on ? 'on' : ''} ${r ? 'rw' : ''} ${i == lastPop ? 'pop' : ''}" style="--r:${on ? (i*47%11)-5 : 0}deg;animation-delay:${on ? i*30 : 0}ms">${r ? r.i + '<br>' + (on ? '✓' : r.n.split(' ').slice(-1)[0]) : (on ? (se ? '❄' : '🍃') : i)}</div>`;
  }
  lastPop = -1;
  return h + '</div>';
}

const ring = (v, max, lab, sub) => {
  const c = 2 * Math.PI * 52, p = Math.min(1, v / max);
  return `<svg viewBox="0 0 130 130" width="116" height="116" style="flex:none">
    <defs><linearGradient id="rgd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8452c"/><stop offset="1" stop-color="#ff9a3d"/></linearGradient></defs>
    <circle cx="65" cy="65" r="52" fill="none" stroke="var(--ln)" stroke-width="12"/>
    <circle class="rg" cx="65" cy="65" r="52" fill="none" stroke="url(#rgd)" stroke-width="12" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}" style="--to:${c*(1-p)}" transform="rotate(-90 65 65)"/>
    <text x="65" y="68" text-anchor="middle" font-size="26" font-family="Poppins" font-weight="800" fill="var(--t)">${lab}</text>
    <text x="65" y="86" text-anchor="middle" font-size="10" font-family="Poppins" font-weight="600" fill="var(--m)">${sub}</text>
  </svg>`;
};

const st = (u, r) => u.red.includes(r.at) ? 'ok' : u.stamps >= r.at ? 'rd' : '';

function ach(u) {
  const A = [
    [t('a1'), u.life >= 1],
    [t('a2'), u.life >= 10],
    [t('a3'), u.life >= 20],
    [t('a4'), S.tx.some(t => t.id == u.id && t.type == 'redeem') || u.red.length > 0],
    [t('a5'), (u.st || []).some(x => x)],
    [t('a6'), u.life >= 20],
    [t('a7'), u.life >= 60],
    [t('a8'), u.life >= 150]
  ];
  return '<div class="ach">' + A.map(a => `<div class="gl ${a[1] ? '' : 'lk'}" style="border-radius:18px"><b>${a[0]}</b><div class="m" style="margin-top:4px">${a[1] ? t('unlocked') : t('locked')}</div></div>`).join('') + '</div>';
}

function fail(m) {
  toast(m);
  const f = $('#fm');
  if (f) { f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); }
  try { navigator.vibrate && navigator.vibrate([40,30,40]); } catch (e) {}
}

const SP = [['+TOP','Extra Topping'],['UP','Free Upsize'],['10%','Diskon 10%'],['5%','Diskon 5%'],['TRY','Coba lagi besok'],['15%','Diskon 15%']];

function toggleTheme() {
  const root = document.documentElement;
  root.classList.add('theme-anim');
  const next = isDark() ? 'light' : 'dark';
  root.dataset.theme = next;
  const sw = $('.sw');
  if (sw) sw.classList.toggle('on', next === 'dark');
  setTimeout(() => root.classList.remove('theme-anim'), 500);
}

/* ---------- CUSTOMER VIEWS ---------- */
function customer() {
  const u = me(), L = lvl(u.life);
  let h = '';

  if (tab == 'home') {
    const n = S.rw.filter(r => r.at > u.stamps).sort((a,b) => a.at - b.at)[0];
    const rd = S.rw.filter(r => st(u, r) == 'rd').length;
    const isFull = u.stamps >= 20 || (S.rw.length > 0 && !n);
    h = `<div class="hd">
      <div><p class="m">${greet()},</p><h1>${esc((u.name || '').split(' ')[0])}</h1></div>
      <div class="av" onclick="go('me')">${esc((u.name || '?')[0])}</div>
    </div>
    ${cardHtml(u)}
    <div class="gl card row" style="gap:16px">
      ${ring(u.stamps, n ? n.at : 20, u.stamps, 'stamp')}
      <div style="flex:1">
        ${n ? `<h3 style="font-size:15px">${t('nextRw', esc(n.i), esc(n.n))}</h3><p class="m" style="margin-top:4px">${t('moreStamps', n.at - u.stamps)}</p>` : isFull ? `<h3 style="font-size:15px">${t('cardFull')}</h3><p class="m" style="margin-top:4px">${t('cardFullDesc')}</p>` : `<h3 style="font-size:15px">${t('stampCol')}</h3><p class="m" style="margin-top:4px">${t('of20', u.stamps)}</p>`}
        <div class="chips" style="margin-top:12px;margin-bottom:0"><span class="pill">${L[1]}</span><span class="pill ${rd ? 'rd' : ''}">${t('rwReadyCount', rd)}</span></div>
      </div>
    </div>
    ${bdayOk(u) ? `<div class="ban"><b>${t('bdayTitle')}</b><p style="font-size:12px;margin-top:4px;font-weight:500">${t('bdayDesc')}</p></div>` : ''}
    ${SEASON ? `<div class="gl card"><h3>Year-End Collection</h3><p class="m" style="margin-top:4px">${t('seasonDesc')}</p></div>` : ''}`;
  }

  if (tab == 'card') {
    h = `<div class="hd"><h1>${t('myCard')}</h1></div>
    ${cardHtml(u, 'stamps')}
    <div class="gl card">
      <div class="row" style="margin-bottom:14px"><h3>${t('stampCol')}</h3><span class="m">${t('of20', u.stamps)}</span></div>
      ${gridHtml(u)}
    </div>
    <button class="btn" style="margin:6px 0 10px" onclick="openCardStudio()">${t('saveShareTitle')}</button>
    <p class="m c">${t('staffOnly')}</p>`;
  }

  if (tab == 'rewards') {
    h = `<div class="hd"><h1>${t('rewards')}</h1></div>` + S.rw.map(r => {
      const s = st(u, r);
      return `<div class="gl card rc ${s == 'rd' ? 'rd' : ''}">
        <div class="ic">${esc(r.i)}</div>
        <div style="flex:1">
          <h3 style="font-size:15px">${esc(r.n)}</h3>
          <p class="m">${Math.min(u.stamps, r.at)}/${r.at} stamp</p>
          <div class="bar" style="height:6px;margin:7px 0 0"><i style="width:${Math.min(100, u.stamps/r.at*100)}%"></i></div>
        </div>
        <span class="pill ${s}">${s == 'ok' ? t('redeemed') : s == 'rd' ? t('readyBang') : t('locked')}</span>
      </div>`;
    }).join('') +
    `<div class="gl card rc ${bdayOk(u) ? 'rd' : ''}">
      <div class="ic">🎂</div>
      <div style="flex:1"><h3 style="font-size:15px">Birthday Treat</h3><p class="m">${t('bdaySub')}</p></div>
      <span class="pill ${bdayOk(u) ? 'rd' : u.bd == YR ? 'ok' : ''}">${bdayOk(u) ? t('readyBang') : u.bd == YR ? t('redeemed') : t('locked')}</span>
    </div>` +
    ((u.vc || []).length
      ? `<h3 style="margin:18px 2px 8px">${t('spinVouchers')}</h3>` + u.vc.map(v => `<div class="gl card rc" style="margin:8px 0"><div class="ic">${esc(v.i)}</div><div style="flex:1"><h3 style="font-size:15px">${esc(v.n)}</h3><p class="m">${t('fromSpin')}</p></div><span class="pill rd">${t('ready')}</span></div>`).join('')
      : '') +
    `<p class="m c" style="margin-top:12px">${t('redeemCashier')}</p>`;
  }

  if (tab == 'act') {
    const mine = S.tx.filter(x => x.id == u.id);
    const wk = Date.now() - 6048e5;
    const today = new Date().toDateString();
    const M = [
      [t('m1'), mine.filter(x => x.type == 'stamp' && x.t > wk).length, 3],
      [t('m2'), (u.st || []).filter(x => x).length, 1],
      [t('m3'), mine.filter(x => x.type == 'redeem').length + u.red.length, 1],
      [t('m4'), u.spin == today ? 1 : 0, 1]
    ];
    const top = members().sort((a,b) => b.life - a.life).slice(0, 5);
    const mx = (top[0] && top[0].life) || 1;

    h = `<div class="hd"><h1>${t('activity')}</h1></div>
    <div class="gl card row">
      <div><h3 style="font-size:15px">Lucky Spin</h3><p class="m">${t('spinDesc')}</p></div>
      <button class="btn s o" ${u.spin == today ? 'disabled' : ''} onclick="spinUI()">${u.spin == today ? t('tomorrow') : t('spinBtn')}</button>
    </div>
    <div class="gl card">
      <h3 style="margin-bottom:10px">${t('missions')}</h3>
      ${M.map(x => {
        const d = x[1] >= x[2];
        return `<div class="ln">
          <div style="flex:1">
            <b style="font-size:13px">${x[0]}</b>
            <div class="bar" style="height:6px;margin:6px 0 0"><i style="width:${Math.min(100, x[1]/x[2]*100)}%"></i></div>
          </div>
          <span class="pill ${d ? 'ok' : ''}" style="margin-left:12px">${d ? t('done') : Math.min(x[1], x[2]) + '/' + x[2]}</span>
        </div>`;
      }).join('')}
    </div>
    <div class="gl card">
      <h3 style="margin-bottom:10px">${t('leaderboard')}</h3>
      ${top.length
        ? top.map((m, i) => `<div class="lb"><b>${i+1}</b><span style="width:70px;font-weight:${m.id == u.id ? 800 : 500};font-size:13px">${esc((m.name || '').split(' ')[0])}</span><div class="bar"><i style="width:${m.life/mx*100}%"></i></div><span class="m">${m.life}</span></div>`).join('')
        : `<p class="m">${t('noLb')}</p>`}
    </div>
    <div class="gl card">
      <h3 style="margin-bottom:10px">${t('history')}</h3>
      ${mine.length
        ? mine.map(x => `<div class="ln"><div><b style="font-size:13px">${x.type == 'stamp' ? '+1 Stamp' + (x.season ? t('seasonalTag') : '') : t('redeemWord') + esc(x.r)}</b><div class="m" style="margin-top:2px">${fmt(x.t)}${x.rc ? t('receiptWord') + esc(x.rc) : ''}</div></div><span class="pill ${x.type == 'stamp' ? '' : 'ok'}">${x.type == 'stamp' ? 'Stamp' : 'Reward'}</span></div>`).join('')
        : `<p class="m">${t('noTx')}</p>`}
    </div>
    <h3 style="margin:18px 2px 10px">${t('achievements')}</h3>
    ${ach(u)}`;
  }

  if (tab == 'me') {
    const nx = u.life >= 150 ? 999 : u.life >= 60 ? 150 : u.life >= 20 ? 60 : 20;
    const redCnt = S.tx.filter(x => x.id == u.id && x.type == 'redeem').length + (u.red || []).length;
    const bMonth = u.bday >= 1 && u.bday <= 12 ? MONTHS[lang][u.bday - 1] : t('bdayNotSet');
    const bPill = bdayOk(u) ? `<span class="pill rd">${t('readyBang')}</span>` : u.bd == YR ? `<span class="pill ok">${t('redeemed')}</span>` : `<span class="pill">${esc(bMonth)}</span>`;
    const bDesc = bdayOk(u) ? t('bdayReady') : u.bd == YR ? t('bdayClaimed') : t('bdayWait');
    h = `<div class="hd"><h1>${t('profile')}</h1></div>
    <div class="gl card">
      <div class="row" style="gap:14px;justify-content:flex-start">
        <div class="av" style="width:58px;height:58px;font-size:24px;flex:none">${esc((u.name || '?')[0])}</div>
        <div style="min-width:0;flex:1">
          <h3>${esc(u.name)}</h3>
          <p class="m" style="word-break:break-all">${esc(u.email)}</p>
          <div class="chips" style="margin:6px 0 0"><span class="pill">${esc(u.id)}</span><span class="pill ok">${L[1]}</span></div>
        </div>
      </div>
      <div class="stats-row">
        <div><b>${u.stamps}/20</b><span>${t('statsStamps')}</span></div>
        <div><b>${u.life}</b><span>${t('statsLife')}</span></div>
        <div><b>${redCnt}</b><span>${t('statsRedeem')}</span></div>
      </div>
    </div>
    <div class="gl card">
      <div class="row"><h3>${L[0]} – ${L[1]}</h3><span class="m">${u.life}/${nx}</span></div>
      <div class="bar"><i style="width:${Math.min(100, u.life/nx*100)}%"></i></div>
      <p class="m">${t('lvlDesc')}</p>
    </div>
    <div class="gl card row">
      <div><h3>Birthday Treat</h3><p class="m">${bDesc}</p></div>
      ${bPill}
    </div>
    <div class="gl card row">
      <div><h3>${t('saveShareTitle')}</h3><p class="m">${t('saveShareSub')}</p></div>
      <button class="btn s" onclick="openCardStudio()">${t('openStudio')}</button>
    </div>
    <div class="gl card">
      <h3 style="margin-bottom:6px">${t('prefTitle')}</h3>
      <div class="ln">
        <div><b style="font-size:13px">${t('darkTitle')}</b><div class="m">${t('darkSub')}</div></div>
        <div class="sw ${isDark() ? 'on' : ''}" onclick="toggleTheme()"></div>
      </div>
      <div class="ln">
        <div><b style="font-size:13px">${t('langTitle')}</b><div class="m">${t('langSub')}</div></div>
        ${langBtn()}
      </div>
    </div>
    <button class="btn o" onclick="out()">${t('signOut')}</button>`;
  }

  app.innerHTML = h;
}

/* ---------- CARD STUDIO (EXPORT & SHARE COLLAGE) ---------- */
let _whiteLogo = null;
function getWhiteLogo() {
  if (_whiteLogo) return Promise.resolve(_whiteLogo);
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0);
      x.globalCompositeOperation = 'source-in';
      x.fillStyle = '#ffffff';
      x.fillRect(0, 0, c.width, c.height);
      _whiteLogo = c;
      res(c);
    };
    img.onerror = () => res(null);
    img.src = 'assets/logo.png';
  });
}

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCardBg(ctx, x, y, w, h) {
  ctx.save();
  rrect(ctx, x, y, w, h, 36);
  ctx.clip();
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, '#2a4bc0');
  g.addColorStop(1, '#142a75');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  const rg = ctx.createRadialGradient(x + w * 1.02, y + h * 1.05, 10, x + w * 1.02, y + h * 1.05, w * 0.65);
  rg.addColorStop(0, 'rgba(255, 122, 69, 0.45)');
  rg.addColorStop(1, 'rgba(255, 122, 69, 0)');
  ctx.fillStyle = rg;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let px = x + 28; px < x + w; px += 36) {
    for (let py = y + 28; py < y + h; py += 36) {
      ctx.beginPath(); ctx.arc(px, py, 2.2, 0, 6.28); ctx.fill();
    }
  }
  ctx.restore();
}

function drawCardFront(ctx, u, logoImg, x, y, w, h) {
  drawCardBg(ctx, x, y, w, h);
  if (logoImg) {
    const lh = 76, lw = logoImg.width * (lh / logoImg.height);
    ctx.drawImage(logoImg, x + 36, y + 28, lw, lh);
  } else {
    ctx.fillStyle = '#fff';
    ctx.font = '800 34px Poppins, sans-serif';
    ctx.fillText('teazzi', x + 36, y + 70);
  }
  const L = lvl(u.life);
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = '600 16px Poppins, sans-serif';
  ctx.fillText('LOYALTY CARD', x + 36, y + h - 104);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 34px Poppins, sans-serif';
  ctx.fillText((u.name || '').slice(0, 22), x + 36, y + h - 62);
  ctx.fillStyle = 'rgba(255,255,255,0.86)';
  ctx.font = '500 20px Poppins, sans-serif';
  ctx.fillText(`${L[0]} – ${L[1]} · ${u.id}`, x + 36, y + h - 30);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 52px Poppins, sans-serif';
  const stTxt = `${u.stamps}`;
  ctx.fillText(stTxt, x + w - 76, y + h - 32);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '600 22px Poppins, sans-serif';
  ctx.fillText('/20', x + w - 34, y + h - 32);
  ctx.textAlign = 'left';
}

function drawCardBackStamps(ctx, u, x, y, w, h) {
  drawCardBg(ctx, x, y, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  ctx.font = '700 16px Poppins, sans-serif';
  ctx.fillText(t('stampCol').toUpperCase(), x + 36, y + 48);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#fff';
  ctx.font = '700 18px Poppins, sans-serif';
  ctx.fillText(`${u.stamps} / 20`, x + w - 36, y + 48);
  ctx.textAlign = 'left';

  const cols = 5, rows = 4, padX = 38, topY = 74;
  const cw = (w - padX * 2) / cols, ch = (h - topY - 26) / rows;
  const rad = Math.min(cw, ch) * 0.37;

  for (let i = 1; i <= 20; i++) {
    const col = (i - 1) % cols, row = Math.floor((i - 1) / cols);
    const cx = x + padX + cw * col + cw / 2;
    const cy = y + topY + ch * row + ch / 2;
    const on = i <= u.stamps;
    const rw = S.rw.find(r => r.at == i);

    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, 6.28);
    if (on) {
      ctx.fillStyle = rw ? 'rgba(232, 69, 44, 0.92)' : 'rgba(255, 255, 255, 0.92)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = rw ? '#ff9a3d' : '#ffffff';
      ctx.stroke();
      ctx.fillStyle = rw ? '#ffffff' : '#1e3a94';
      ctx.font = '800 22px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(on ? '✓' : String(i), cx, cy + 1);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fill();
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = rw ? 'rgba(255, 154, 61, 0.8)' : 'rgba(255, 255, 255, 0.32)';
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = rw ? '#ff9a3d' : 'rgba(255,255,255,0.65)';
      ctx.font = '700 16px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i), cx, cy + 1);
    }
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

async function renderStudioCanvas(canvas, layout) {
  const u = me();
  if (!u || !canvas) return;
  const logoImg = await getWhiteLogo();
  const cw = 760, ch = 460, pad = 36;
  const ctx = canvas.getContext('2d');

  if (layout === 'collage') {
    canvas.width = cw + pad * 2;
    canvas.height = ch * 2 + pad * 3;
    const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bg.addColorStop(0, isDark() ? '#080d24' : '#e3eafc');
    bg.addColorStop(1, isDark() ? '#160f2c' : '#fdeee8');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCardFront(ctx, u, logoImg, pad, pad, cw, ch);
    drawCardBackStamps(ctx, u, pad, pad * 2 + ch, cw, ch);
  } else {
    canvas.width = cw + pad * 2;
    canvas.height = ch + pad * 2;
    const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bg.addColorStop(0, isDark() ? '#080d24' : '#e3eafc');
    bg.addColorStop(1, isDark() ? '#160f2c' : '#fdeee8');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (layout === 'front') drawCardFront(ctx, u, logoImg, pad, pad, cw, ch);
    else drawCardBackStamps(ctx, u, pad, pad, cw, ch);
  }
}

function openCardStudio() {
  let layout = 'collage';
  const o = openModal(`
    <h3 style="font-size:18px;margin-bottom:4px">${t('saveShareTitle')}</h3>
    <p class="m">${t('saveShareSub')}</p>
    <div class="studio-tabs">
      <button type="button" class="chip on" data-l="collage">${t('layoutCollage')}</button>
      <button type="button" class="chip" data-l="front">${t('layoutFront')}</button>
      <button type="button" class="chip" data-l="back">${t('layoutBack')}</button>
    </div>
    <div class="studio-preview"><canvas id="stCv"></canvas></div>
    <div class="row" style="gap:8px;margin-top:12px">
      <button type="button" class="chip" style="flex:1" id="stDl">${t('downloadPng')}</button>
      <button type="button" class="btn" style="flex:1" id="stSh">${t('shareCardBtn')}</button>
    </div>
    <button type="button" class="chip" style="width:100%;margin-top:8px" id="stCx">${t('close')}</button>
  `);
  const cv = $('#stCv');
  renderStudioCanvas(cv, layout);
  o.querySelectorAll('.studio-tabs .chip').forEach(b => {
    b.onclick = () => {
      layout = b.dataset.l;
      o.querySelectorAll('.studio-tabs .chip').forEach(x => x.classList.toggle('on', x === b));
      renderStudioCanvas(cv, layout);
    };
  });
  const dl = () => {
    const a = document.createElement('a');
    a.download = `teazzi-${me().id}-${layout}.png`;
    a.href = cv.toDataURL('image/png');
    a.click();
  };
  $('#stCx').onclick = () => closeModal(o);
  $('#stDl').onclick = () => { dl(); toast(t('cardSaved')); };
  $('#stSh').onclick = () => withLoad($('#stSh'), async () => {
    const u = me();
    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    const file = blob && new File([blob], `teazzi-${u.id}-${layout}.png`, { type: 'image/png' });
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Teazzi Loyalty Card', text: t('shareText', u.id) });
        toast(t('cardShared'));
        return;
      } catch (e) { if (e.name === 'AbortError') return; }
    }
    dl();
    try { navigator.clipboard.writeText(t('shareText', u.id)); } catch (e) {}
    toast(t('shareFallback'));
  });
}

/* ---------- STAFF VIEWS ---------- */
function act(txs) {
  return txs.length
    ? txs.map(x => `<div class="ln"><div><b style="font-size:13px">${esc(x.name)}</b><div class="m" style="margin-top:2px">${x.type == 'stamp' ? '+1 stamp' : t('redeemWord') + esc(x.r)} · ${fmt(x.t)}</div></div><span class="m">${esc(x.by)}</span></div>`).join('')
    : `<p class="m">${t('noAct')}</p>`;
}

function staff() {
  const ms = members();
  const m = ms.find(x => x.id == selId.toUpperCase());
  let h = '';

  if (tab == 'scan') {
    const todayCnt = S.tx.filter(x => x.type == 'stamp' && new Date(x.t).toDateString() == new Date().toDateString()).length;
    h = `<div class="hd">
      <div><p class="m">${esc(me().name)}${me().branch ? ' · ' + esc(me().branch) : ''}</p><h1>${t('cashier')}</h1></div>
      <div class="row" style="gap:8px">${langBtn()}<button class="chip o" onclick="out()">${t('signOut')}</button></div>
    </div>
    <div class="gl card">
      <div class="row" style="margin-bottom:12px">
        <span class="m" style="font-weight:600">${esc(me().branch || t('cashier'))}</span>
        <span class="pill ok">${t('todayStamps', todayCnt)}</span>
      </div>
      <button class="btn o" onclick="doScan()">${ICONS.camera} ${t('scanQr')}</button>
      <p class="m c" style="margin-top:12px">${t('orSelect')}</p>
      <div class="chips">${ms.map(x => `<button class="chip ${x.id == selId ? 'on' : ''}" onclick="selId='${esc(x.id)}';quiet=1;render()">${esc((x.name || '').split(' ')[0])}</button>`).join('')}</div>
      <input id="sid" placeholder="${t('idPh')}" value="${esc(selId)}" oninput="selId=this.value" onchange="quiet=1;render()">
    </div>`;

    if (selId && !m) h += `<p class="m c">${t('notFound')}</p>`;

    if (m) {
      h += `<div class="gl card">
        <div class="row">
          <div><h3>${esc(m.name)}</h3><p class="m">${esc(m.id)} · ${lvl(m.life).join(' – ')}</p></div>
          <b style="font-size:28px;font-family:'Poppins'">${m.stamps}<span class="m">/20</span></b>
        </div>
        ${bdayOk(m) ? `<p style="color:var(--o);font-weight:700;margin-top:8px;font-size:13px">${t('bdayMonth')}</p>` : ''}
        <input id="rc" placeholder="${t('rcPh')}" style="margin-top:12px">
        <button class="btn o" ${m.stamps >= 20 ? 'disabled' : ''} onclick="addStamp('${esc(m.id)}')">${ICONS.plus} ${t('addStamp')}</button>
        <div style="margin-top:12px">
          ${S.rw.map(r => {
            const rd = m.stamps >= r.at && !m.red.includes(r.at);
            return `<div class="ln"><span>${esc(r.i)} ${esc(r.n)} <span class="m">(${r.at})</span></span><button class="btn s" ${rd ? '' : 'disabled'} onclick="redeem('${esc(m.id)}',${r.at})">${m.red.includes(r.at) ? t('redeemed') : t('redeemBtn')}</button></div>`;
          }).join('')}
          ${bdayOk(m) ? `<div class="ln"><span>Birthday Treat</span><button class="btn s" onclick="redeem('${esc(m.id)}','bd')">${t('redeemBtn')}</button></div>` : ''}
          ${(m.vc || []).map((v, i) => `<div class="ln"><span>${esc(v.i)} ${esc(v.n)}</span><button class="btn s" onclick="useV('${esc(m.id)}',${i})">${t('useBtn')}</button></div>`).join('')}
        </div>
      </div>`;
    }
  } else {
    h = `<div class="hd"><h1>${t('activity')}</h1></div><div class="gl card">${act(S.tx.slice(0, 15))}</div>`;
  }

  app.innerHTML = h;
}

function openModal(html) {
  const o = document.createElement('div');
  o.className = 'fx';
  o.innerHTML = `<div class="gl modal-box">${html}</div>`;
  o.onclick = e => { if (e.target === o) closeModal(o); };
  document.body.append(o);
  return o;
}

function closeModal(o) {
  if (!o) return;
  o.classList.add('out');
  setTimeout(() => o.remove(), 350);
}

async function withLoad(btn, fn) {
  if (btn) {
    if (btn.classList.contains('loading')) return;
    btn.classList.add('loading');
    btn.disabled = true;
  }
  try { return await fn(); }
  finally {
    if (btn && btn.isConnected) {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }
}

/* ---------- ADMIN VIEWS ---------- */
function admin() {
  const ms = members();
  const sf = S.users.filter(u => u.role == 'staff');
  let h = `<div class="hd"><div><p class="m">Admin</p><h1>${t('panelTitle')}</h1></div><div class="row" style="gap:8px">${langBtn()}<button class="chip o" onclick="out()">${t('signOut')}</button></div></div>`;

  if (tab == 'ov') {
    const sN = S.tx.filter(x => x.type == 'stamp').length;
    const rN = S.tx.filter(x => x.type == 'redeem').length;
    const d = [...S.hist];
    const cur = new Date();
    const tN = S.tx.filter(x => x.type == 'stamp' && new Date(x.t).toDateString() == cur.toDateString()).length;
    d[6] += tN;
    const mx = Math.max(...d, 1);
    const D = DAYS[lang];

    h += `<div class="chips" style="flex-wrap:nowrap">
      ${[[t('navMb'), ms.length], ['Stamp', sN], ['Redeem', rN], [t('navSf'), sf.length]].map(x => `<div class="gl card c" style="flex:1;margin:10px 0;padding:14px 4px"><b style="font-size:22px;font-family:'Poppins'">${x[1]}</b><div class="m" style="margin-top:2px;font-size:11px">${x[0]}</div></div>`).join('')}
    </div>
    <div class="gl card">
      <div class="row"><h3>${t('stamps7d')}</h3><span class="pill ok">${t('todayBadge', tN)}</span></div>
      <svg viewBox="0 0 290 130" style="width:100%;margin-top:10px">
        <defs><linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9a3d"/><stop offset="1" stop-color="#e8452c"/></linearGradient></defs>
        ${d.map((v, i) => `<rect class="bar2" style="--k:${i}" x="${i*41+8}" y="${105-v/mx*90}" width="28" height="${v/mx*90}" rx="9" fill="url(#bg2)"/><text x="${i*41+22}" y="123" text-anchor="middle" font-size="10" font-family="Poppins" font-weight="600" fill="var(--m)">${D[(cur.getDay()-6+i+7)%7]}</text><text x="${i*41+22}" y="${99-v/mx*90}" text-anchor="middle" font-size="10" font-family="Poppins" font-weight="700" fill="var(--t)">${v}</text>`).join('')}
      </svg>
    </div>
    <div class="gl card"><h3 style="margin-bottom:10px">${t('recentAct')}</h3>${act(S.tx.slice(0, 8))}</div>`;
  }

  if (tab == 'mb') {
    const q = mbQuery.trim().toLowerCase();
    const list = q ? ms.filter(m => (m.name || '').toLowerCase().includes(q) || (m.id || '').toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q)) : ms;
    h += `<div class="gl card" style="padding:12px 16px"><input id="mbQ" placeholder="${t('searchMember')}" value="${esc(mbQuery)}" oninput="mbQuery=this.value;quiet=1;render();setTimeout(()=>{const el=$('#mbQ');if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);}},0)" style="margin:0"></div>
    <div class="gl card wrap"><table>
      <tr><th>ID</th><th>${t('nameCol')}</th><th>Stamp</th><th>Level</th></tr>
      ${list.map(m => `<tr><td>${esc(m.id)}</td><td>${esc(m.name)}</td><td>${m.stamps}/20</td><td>${lvl(m.life)[1]}</td></tr>`).join('')}
    </table></div>`;
  }

  if (tab == 'rw') {
    h += S.rw.map((r, i) => `<div class="gl card rc"><div class="ic">${esc(r.i)}</div><div style="flex:1"><h3 style="font-size:15px">${esc(r.n)}</h3><p class="m">${t('atStamp', r.at)}</p></div><button class="chip" onclick="editRw(${i})">${t('editBtn')}</button></div>`).join('') +
      `<p class="m c" style="margin-top:12px">${t('rwNote')}</p>`;
  }

  if (tab == 'sf') {
    h += `<div class="gl card">${sf.length ? sf.map(s => `<div class="ln" style="gap:10px">
      <div style="min-width:0;flex:1">
        <b>${esc(s.name)}</b>
        <div class="m" style="margin-top:2px;word-break:break-all">${esc(s.email)}</div>
        <span class="branch-pill">📍 ${esc(s.branch || t('noBranch'))}</span>
      </div>
      <div class="staff-actions">
        <button class="chip" onclick="editStaff('${esc(s.uid)}')">${t('editBtn')}</button>
        <button class="chip danger" onclick="removeStaff('${esc(s.uid)}')">${t('removeBtn')}</button>
      </div>
    </div>`).join('') : `<p class="m">${t('noStaff')}</p>`}</div>
    <div class="gl card">
      <h3>${t('addStaff')}</h3>
      <p class="m" style="margin:4px 0 8px">${t('addStaffDesc')}</p>
      <input id="se" type="email" placeholder="Email">
      <input id="sbName" placeholder="${t('staffNamePh')}">
      <input id="sbBranch" placeholder="${t('branchPh')}">
      <button class="btn" style="margin-top:8px" onclick="addStaff()">${t('makeStaff')}</button>
    </div>`;
  }

  app.innerHTML = h;
}

/* ---------- VERIFY EMAIL UI ---------- */
function showVerifyUI(email) {
  if (!document.getElementById('verify-anim')) {
    const s = document.createElement('style');
    s.id = 'verify-anim';
    s.textContent = `
      @keyframes mailFlyIn { 0% { opacity: 0; transform: translateY(36px) scale(.55) rotate(-10deg); } 55% { opacity: 1; transform: translateY(-10px) scale(1.08) rotate(3deg); } 100% { opacity: 1; transform: translateY(0) scale(1) rotate(0); } }
      @keyframes mailGlow { 0%, 100% { box-shadow: 0 18px 38px rgba(30,58,148,.28); } 50% { box-shadow: 0 24px 50px rgba(30,58,148,.42); } }
      @keyframes mailFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
      @keyframes dotPulse { 0%, 80%, 100% { opacity: .25; transform: scale(.75); } 40% { opacity: 1; transform: scale(1); } }
      @keyframes shimmer { 0% { background-position: -220% 0; } 100% { background-position: 220% 0; } }
      .verify-wrap > * { animation: up .85s cubic-bezier(.2,.8,.2,1) both; }
      .verify-wrap > *:nth-child(1) { animation-delay: .05s; }
      .verify-wrap > *:nth-child(2) { animation-delay: .18s; }
      .verify-wrap > *:nth-child(3) { animation-delay: .34s; }
      .verify-wrap > *:nth-child(4) { animation-delay: .5s; }
      .verify-mail-icon { width: 96px; height: 96px; margin: 0 auto; border-radius: 28px; background: linear-gradient(135deg, var(--b), var(--b2)); display: flex; align-items: center; justify-content: center; position: relative; animation: mailFlyIn .95s cubic-bezier(.34,1.56,.64,1) both, mailGlow 3s ease-in-out 1s infinite; }
      .verify-mail-icon::after { content: ""; position: absolute; inset: 0; border-radius: 28px; background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent); background-size: 220% 100%; animation: shimmer 3.6s linear infinite; pointer-events: none; }
      .verify-mail-icon svg { width: 50px; height: 50px; position: relative; z-index: 1; animation: mailFloat 3.2s ease-in-out infinite; }
      .verify-email-badge { display: inline-flex; align-items: center; gap: 8px; background: var(--gl); border: 1px solid var(--gb); padding: 9px 16px; border-radius: 30px; font-weight: 700; font-size: 13px; margin-top: 14px; backdrop-filter: blur(20px); color: var(--t); max-width: 100%; word-break: break-all; }
      .verify-dots { display: inline-flex; gap: 4px; flex: none; }
      .verify-dots i { width: 5px; height: 5px; border-radius: 50%; background: var(--b); display: inline-block; animation: dotPulse 1.4s ease-in-out infinite; }
      .verify-dots i:nth-child(2) { animation-delay: .2s; }
      .verify-dots i:nth-child(3) { animation-delay: .4s; }
    `;
    document.head.appendChild(s);
  }

  app.innerHTML = `
    <div class="verify-wrap">
      <div class="hd" style="justify-content: center; padding-top: 24px;">${logo()}</div>
      <div class="verify-mail-icon" style="margin-top: 40px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 7l9 6 9-6"/></svg>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <h1 style="font-size: 28px; letter-spacing: -1px;">${t('vTitle')}</h1>
        <p class="m" style="margin-top: 10px; line-height: 1.6; font-size: 14px;">${t('vSent')}</p>
        <div class="verify-email-badge"><span>${esc(email)}</span><span class="verify-dots"><i></i><i></i><i></i></span></div>
      </div>
      <div class="gl card" style="text-align: center; padding: 24px; margin-top: 26px;">
        <p class="m" style="line-height: 1.65; font-size: 13px;">${t('vBody')}</p>
        <button class="btn" style="margin-top: 22px" onclick="mode='in'; render()">${t('vBack')}</button>
        <p class="m" style="margin-top: 20px; font-size: 11px; opacity: .7;">${t('vSpam')}</p>
      </div>
    </div>
  `;
}