/* ============================================================
   Lapisan Data Supabase — Teazzi Loyalty
   Menimpa fungsi demo di script.js dengan versi server.
   ============================================================ */

let sb = null;
let ch = null;

const errMsg = e => /duplicate|receipt_uq/i.test(e.message)
  ? t('errDup')
  : e.message;

const jkt = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
const getStaffMeta = email => {
  try { return JSON.parse(localStorage.getItem('tz_staff_meta') || '{}')[email] || {}; } catch (e) { return {}; }
};
const setStaffMeta = (email, patch) => {
  try {
    const all = JSON.parse(localStorage.getItem('tz_staff_meta') || '{}');
    all[email] = { ...(all[email] || {}), ...patch };
    localStorage.setItem('tz_staff_meta', JSON.stringify(all));
  } catch (e) {}
};

/* ---------- LOAD DATA ---------- */
async function load() {
  try {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { S.me = null; return; }

    const [P, R, T, V] = await Promise.all([
      sb.from('profiles').select('*').order('created_at'),
      sb.from('rewards').select('*').order('at'),
      sb.from('transactions')
        .select('*,member:profiles!transactions_member_id_fkey(member_code,name),staff:profiles!transactions_staff_id_fkey(name)')
        .order('created_at', { ascending: false })
        .limit(300),
      sb.from('vouchers').select('*').eq('used', false)
    ]);

    if (P.error) toast('Gagal memuat data: ' + P.error.message);

    const vs = V.data || [];
    const today = jkt();

    S.users = (P.data || []).map(p => {
      const meta = getStaffMeta(p.email);
      return {
        uid: p.id,
        id: p.member_code,
        name: (p.role == 'staff' && meta.name) ? meta.name : p.name,
        email: p.email,
        role: p.role,
        branch: p.branch || meta.branch || '',
        stamps: p.stamps,
        seen: p.seen,
        life: p.lifetime,
        red: p.redeemed || [],
        st: p.seasonal || [],
        bday: p.birth_month || 0,
        bd: p.bday_year || 0,
        spin: p.spin_date == today ? new Date().toDateString() : '',
        ref: p.referred,
        vc: vs.filter(v => v.member_id == p.id).map(v => ({ id: v.id, i: v.icon, n: v.name }))
      };
    });

    const m = S.users.find(u => u.uid == user.id);
    S.me = m ? m.id : null;

    S.rw = (R.data || []).map(r => ({ id: r.id, at: r.at, n: r.name, i: r.icon }));

    S.tx = (T.data || []).map(t => ({
      id: t.member && t.member.member_code,
      name: t.member ? t.member.name : '',
      type: t.type,
      t: new Date(t.created_at).getTime(),
      by: ((t.staff && t.staff.name) || '').split(' ')[0],
      r: t.reward,
      rc: t.receipt,
      season: t.season
    }));

    S.lb = [];
    S.hist = [0, 0, 0, 0, 0, 0, 0];

    if (m && m.role == 'customer') {
      const l = await sb.rpc('leaderboard');
      S.lb = (l.data || []).map(x => ({ id: x.member_code, name: x.name, life: x.lifetime }));
    } else if (m) {
      const h = await sb.rpc('stamps_by_day');
      if (h.data) S.hist = h.data;
    }
  } catch (e) {
    console.error('[load]', e);
    toast(t('errLoad'));
  }
}

/* ---------- REALTIME ---------- */
function listen() {
  const u = me();
  if (ch || !u || u.role != 'customer') return;

  ch = sb.channel('me')
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'profiles', filter: 'id=eq.' + u.uid },
      async () => { await load(); quiet = 1; render(); })
    .subscribe();
}

/* ---------- QR SECURITY ---------- */
let qrCache = { token: null, expires: 0 };

async function refreshQRToken() {
  const { data, error } = await sb.rpc('refresh_qr_token');
  if (error) { toast(errMsg(error)); return null; }
  qrCache.token = data.token;
  qrCache.expires = new Date(data.expires).getTime();
  return { token: data.token, expires: qrCache.expires };
}

async function validateQRToken(token) {
  const { data, error } = await sb.rpc('validate_qr_token', { p_token: token });
  if (error) { toast(errMsg(error)); return null; }
  return data;
}

/* ---------- BOOT ---------- */
async function boot() {
  if (!window.CFG || /YOUR_/.test(CFG.url) || !window.supabase) {
    render();
    toast(t('errCfg'));
    return;
  }
  try {
    sb = supabase.createClient(CFG.url, CFG.key);
    await load();
    const u = me();
    if (u) tab = DT[u.role];
    render();
    listen();

    sb.auth.onAuthStateChange(ev => {
      if (ev == 'SIGNED_OUT') { S.me = null; render(); }
      if (ev == 'PASSWORD_RECOVERY') resetPwUI();
    });
  } catch (e) {
    console.error('[boot]', e);
    toast(t('errSrv'));
  }
}

/* ---------- AUTH ---------- */
async function auth() {
  if (!sb) return fail(t('errCfg'));
  if (mode == 'up') {
    if (!checkName(true)) { $('#nm')?.focus(); return; }
    if (!checkBm(true)) { $('#bmBtn')?.focus(); $('.bm-wrap')?.classList.add('open'); return; }
  }
  if (!checkEmail(true)) { $('#em')?.focus(); return; }
  if (!checkPw(true)) { $('#pw')?.focus(); return; }

  const e = $('#em').value.trim().toLowerCase();
  const p = $('#pw').value;

  await withLoad($('#fm .btn'), async () => {
    if (mode == 'in') {
      const { error } = await sb.auth.signInWithPassword({ email: e, password: p });
      if (error) return fail(t('errAuth'));
    } else {
      const n = $('#nm').value.trim();
      const bm = +$('#bm').value;

      const { data, error } = await sb.auth.signUp({
        email: e,
        password: p,
        options: { data: { name: n, birth_month: bm >= 1 && bm <= 12 ? bm : '' } }
      });
      if (error) return fail(error.message);

      // Email confirmation aktif → session null → tampilkan UI verifikasi
      if (!data.session) {
        showVerifyUI(e);
        return;
      }
    }

    await load();
    const u = me();
    if (!u) return fail(t('errProf'));
    tab = DT[u.role];
    render();
    listen();
  });
}

async function sendReset() {
  if (!sb) return fail(t('errCfg'));
  if (!checkEmail(true, '#fpEm')) return;
  const e = $('#fpEm').value.trim().toLowerCase();
  await withLoad($('#fm .btn'), async () => {
    const { error } = await sb.auth.resetPasswordForEmail(e, { redirectTo: window.location.origin });
    if (error) return fail(error.message);
    toast(t('resetSent'));
    mode = 'in';
    render();
  });
}

async function saveNewPw() {
  if (!sb) return fail(t('errCfg'));
  if (!checkPw(true, '#newPw', '#newPwMsg')) return;
  await withLoad($('#fm .btn'), async () => {
    const { error } = await sb.auth.updateUser({ password: $('#newPw').value });
    if (error) return fail(error.message);
    toast(t('pwUpdated'));
    await load();
    const u = me();
    if (u) { tab = DT[u.role]; listen(); }
    render();
  });
}

async function out() {
  if (ch) { sb.removeChannel(ch); ch = null; }
  await sb.auth.signOut();
  S.me = null;
  S.users = [];
  S.tx = [];
  S.lb = [];
  S.hist = [0, 0, 0, 0, 0, 0, 0];
  selId = '';
  qrCache = { token: null, expires: 0 };
  render();
}

function dbSeen() { sb && sb.rpc('mark_seen'); }

/* ---------- STAMP / REDEEM ---------- */
async function addStamp(id) {
  const rcEl = $('#rc');
  const rc = rcEl.value.trim();
  if (!rc) return toast(t('errRc'));

  await withLoad(rcEl.closest('.card')?.querySelector('.btn.o'), async () => {
    const { data, error } = await sb.rpc('add_stamp', { p_code: id, p_receipt: rc });
    if (error) return toast(errMsg(error));

    lastPop = data.stamps;
    stampFx(data.stamps, data.season);

    const r = S.rw.find(x => x.at == data.stamps);
    if (r) setTimeout(() => {
      toast(t('rwUnlock', r.n));
      burst(30, ['🎉', '✨', '🧋', '🍃']);
    }, 3300);

    await load();
    quiet = 1;
    render();
  });
}

async function redeem(id, at) {
  const { data, error } = at == 'bd'
    ? await sb.rpc('redeem_birthday', { p_code: id })
    : await sb.rpc('redeem_reward', { p_code: id, p_at: at });

  if (error) return toast(errMsg(error));

  toast(data && data.reset ? t('fullReset') : t('redeemOk'));
  burst(20, ['🎁', '✨', '🥤']);
  await load();
  quiet = 1;
  render();
}

async function useV(id, i) {
  const m = S.users.find(u => u.id == id);
  if (!m || !m.vc || !m.vc[i]) return toast(t('vNotFound'));

  const v = m.vc[i];
  const { error } = await sb.rpc('use_voucher', { p_id: v.id });
  if (error) return toast(errMsg(error));

  toast(t('vUsed'));
  burst(16, ['🎟️', '✨']);
  await load();
  quiet = 1;
  render();
}

/* ---------- SHARE / SPIN ---------- */
function share() {
  const u = me();
  try { navigator.clipboard.writeText(t('shareText', u.id)); } catch (e) {}

  u.ref = 1;
  sb.rpc('mark_shared');
  toast(t('shareOk', u.id));
  quiet = 1;
  render();
}

function spinUI() {
  const u = me();
  if (u.spin == new Date().toDateString()) return toast(t('spunToday'));

  const o = document.createElement('div');
  o.className = 'fx';
  o.innerHTML = `
    <div class="wheel-wrap">
      <div class="ptr"></div>
      <div class="wheel" id="wh">${SP.map((p, i) => `<span style="transform:rotate(${i * 60 + 30}deg) translateY(-84px)">${p[0]}</span>`).join('')}</div>
    </div>
    <button class="btn o" id="sb" style="width:200px;margin-top:30px">${t('spinBtn')}</button>`;
  document.body.append(o);

  $('#sb').onclick = async () => {
    const b = $('#sb');
    b.disabled = true;

    const { data, error } = await sb.rpc('spin');
    if (error) { b.disabled = false; return toast(errMsg(error)); }

    const k = data.k;
    const a = 360 * 6 - (k * 60 + 30) + (Math.random() * 30 - 15);
    $('#wh').style.transform = `rotate(${a}deg)`;

    setTimeout(() => {
      if (k != 4) {
        burst(26, ['★', '✦', '✧', '◆']);
        toast(t('spinWin', data.name));
      } else {
        toast(t('spinLose'));
      }
      b.textContent = t('close');
      b.disabled = false;
      b.onclick = async () => {
        o.classList.add('out');
        await load();
        setTimeout(() => { o.remove(); quiet = 1; render(); }, 450);
      };
    }, 4300);
  };
}

/* ---------- ADMIN ---------- */
function editRw(i) {
  const r = S.rw[i];
  const o = openModal(`
    <h3 style="font-size:18px;margin-bottom:12px">${t('editRwTitle')}</h3>
    <input id="rwN" placeholder="${t('rwNamePh')}" value="${esc(r.n)}">
    <input id="rwI" placeholder="${t('rwIconPh')}" value="${esc(r.i)}">
    <input id="rwA" type="number" min="1" max="20" placeholder="${t('rwAtPh')}" value="${r.at}">
    <div class="row" style="gap:8px;margin-top:12px">
      <button type="button" class="chip" style="flex:1" id="rwCx">${t('cancel')}</button>
      <button type="button" class="btn" style="flex:1" id="rwSv">${t('saveBtn')}</button>
    </div>
  `);
  $('#rwCx').onclick = () => closeModal(o);
  $('#rwSv').onclick = () => withLoad($('#rwSv'), async () => {
    const n = $('#rwN').value.trim();
    const ic = $('#rwI').value.trim() || r.i;
    const a = parseInt($('#rwA').value, 10);
    if (!n || !(a >= 1 && a <= 20)) return toast(t('invalidInput'));
    const { error } = await sb.from('rewards').update({ name: n, icon: ic, at: a }).eq('id', r.id);
    if (error) return toast(errMsg(error));
    closeModal(o);
    toast(t('rwUpdated'));
    await load();
    quiet = 1;
    render();
  });
}

async function saveProfileMeta(email, name, branch) {
  if (branch !== undefined) setStaffMeta(email, { branch });
  const rpcRes = await sb.rpc('update_staff', { p_email: email, p_name: name || null, p_branch: branch ?? null });
  if (!rpcRes.error) {
    setStaffMeta(email, { name: '' });
    return true;
  }
  const patch = {};
  if (name) patch.name = name;
  if (branch !== undefined) patch.branch = branch;
  if (!Object.keys(patch).length) return true;
  let { data, error } = await sb.from('profiles').update(patch).eq('email', email).select('id');
  if (error && branch !== undefined && /branch/i.test(error.message) && name) {
    ({ data, error } = await sb.from('profiles').update({ name }).eq('email', email).select('id'));
  }
  if (!error && data && data.length > 0) {
    setStaffMeta(email, { name: '' });
    return true;
  }
  if (name) setStaffMeta(email, { name });
  return false;
}

async function addStaff() {
  const e = $('#se').value.trim().toLowerCase();
  const n = ($('#sbName') && $('#sbName').value.trim()) || '';
  const br = ($('#sbBranch') && $('#sbBranch').value.trim()) || '';
  if (!e) return toast(t('fillEmail'));

  await withLoad($('#se')?.closest('.card')?.querySelector('.btn'), async () => {
    const { error } = await sb.rpc('set_role', { p_email: e, p_role: 'staff' });
    if (error) return toast(errMsg(error));
    if (n || br) await saveProfileMeta(e, n, br);
    toast(t('staffOk'));
    await load();
    quiet = 1;
    render();
  });
}

function editStaff(uid) {
  const s = S.users.find(u => u.uid == uid);
  if (!s) return;
  const o = openModal(`
    <h3 style="font-size:18px;margin-bottom:4px">${t('editStaffTitle')}</h3>
    <p class="m" style="margin-bottom:12px">${esc(s.email)}</p>
    <input id="esN" placeholder="${t('nameCol')}" value="${esc(s.name)}">
    <input id="esB" placeholder="${t('branchPh')}" value="${esc(s.branch || '')}">
    <div class="row" style="gap:8px;margin-top:12px">
      <button type="button" class="chip" style="flex:1" id="esCx">${t('cancel')}</button>
      <button type="button" class="btn" style="flex:1" id="esSv">${t('saveBtn')}</button>
    </div>
  `);
  $('#esCx').onclick = () => closeModal(o);
  $('#esSv').onclick = () => withLoad($('#esSv'), async () => {
    const n = $('#esN').value.trim();
    const br = $('#esB').value.trim();
    if (!n) return toast(t('nameReq'));
    await saveProfileMeta(s.email, n, br);
    closeModal(o);
    toast(t('staffUpdated'));
    await load();
    quiet = 1;
    render();
  });
}

function removeStaff(uid) {
  const s = S.users.find(u => u.uid == uid);
  if (!s) return;
  const o = openModal(`
    <h3 style="font-size:18px;margin-bottom:8px">${t('removeBtn')} Staff</h3>
    <p class="m" style="line-height:1.5;margin-bottom:16px">${esc(t('confirmRemove', s.name))}</p>
    <div class="row" style="gap:8px">
      <button type="button" class="chip" style="flex:1" id="rmCx">${t('cancel')}</button>
      <button type="button" class="btn o" style="flex:1" id="rmOk">${t('removeBtn')}</button>
    </div>
  `);
  $('#rmCx').onclick = () => closeModal(o);
  $('#rmOk').onclick = () => withLoad($('#rmOk'), async () => {
    const { error } = await sb.rpc('set_role', { p_email: s.email, p_role: 'customer' });
    if (error) return toast(errMsg(error));
    setStaffMeta(s.email, { name: '', branch: '' });
    closeModal(o);
    toast(t('staffRemoved'));
    await load();
    quiet = 1;
    render();
  });
}

/* ---------- SCANNER (kamera asli + downscale) ---------- */
async function doScan() {
  const o = document.createElement('div');
  o.className = 'fx';
  o.innerHTML = `
    <div class="vf">
      <video id="cam" playsinline muted style="width:100%;height:100%;object-fit:cover"></video>
      <u></u>
    </div>
    <p class="fxt" style="animation:none;font-size:18px">${t('scanAim')}</p>
    <button class="chip" style="margin-top:18px" id="cx">${t('cancel')}</button>`;
  document.body.append(o);

  if (!window.jsQR) {
    o.remove();
    return toast(t('scanUnavail'));
  }

  let stop = false, stream;
  const end = () => {
    stop = true;
    if (stream) stream.getTracks().forEach(t => t.stop());
    o.remove();
  };
  $('#cx').onclick = end;

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const v = $('#cam');
    v.srcObject = stream;
    await v.play();

    const c = document.createElement('canvas');
    const x = c.getContext('2d', { willReadFrequently: true });
    const MAX = 480;

    const tick = () => {
      if (stop) return;
      if (v.videoWidth) {
        const scale = Math.min(1, MAX / v.videoWidth);
        c.width = Math.round(v.videoWidth * scale);
        c.height = Math.round(v.videoHeight * scale);
        x.drawImage(v, 0, 0, c.width, c.height);

        const d = x.getImageData(0, 0, c.width, c.height);
        const r = jsQR(d.data, d.width, d.height);

        if (r && /^[a-f0-9]{32}$/.test(r.data)) {
          const token = r.data;
          end();
          validateQRToken(token).then(res => {
            if (!res) return;
            selId = res.member_code;
            toast(t('qrValid', res.name));
            quiet = 1;
            render();
          });
          return;
        }
      }
      setTimeout(tick, 120); 
    };
    tick();
  } catch (e) {
    end();
    toast(t('camErr'));
  }
}

/* ---------- GO ---------- */
boot();