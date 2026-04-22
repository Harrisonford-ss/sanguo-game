// 三国志探险 - Supabase v45 客户端（轻量封装，不用SDK，直接 REST API）

const SUPABASE_URL = 'https://bszfcyftnpvfxjdqrikm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzemZjeWZ0bnB2ZnhqZHFyaWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MzEwNjAsImV4cCI6MjA5MDAwNzA2MH0.MEh_yyAQxDTLzbKyVH9ZufMZfQDwwdUB20Ssieucagw';

const REST = `${SUPABASE_URL}/rest/v1`;
const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// ===== 通用请求 =====
async function query(table, params = '') {
  const res = await fetch(`${REST}/${table}?${params}`, { headers: HEADERS });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function insert(table, data) {
  const res = await fetch(`${REST}/${table}`, {
    method: 'POST', headers: HEADERS, body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function update(table, match, data) {
  const res = await fetch(`${REST}/${table}?${match}`, {
    method: 'PATCH', headers: HEADERS, body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function upsert(table, data) {
  const res = await fetch(`${REST}/${table}`, {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'return=representation,resolution=merge-duplicates' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ===== 简易密码哈希（纯JS实现，不依赖crypto.subtle，兼容HTTP）=====
function hashPassword(pwd) {
  const str = pwd + 'sanguo_salt_2026';
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36) + (4294967296 * (2097151 & h1) + (h2 >>> 0)).toString(36);
}

// ===== 用户认证 =====
let currentUser = null;

function loadSession() {
  try {
    const s = localStorage.getItem('sanguo_session');
    if (s) currentUser = JSON.parse(s);
  } catch(e) {}
}

function saveSession() {
  if (currentUser) localStorage.setItem('sanguo_session', JSON.stringify(currentUser));
  else localStorage.removeItem('sanguo_session');
}

export function getUser() { return currentUser; }
export function isLoggedIn() { return !!currentUser; }

export async function register(username, password, nickname) {
  const hash = hashPassword(password);
  const nick = nickname || username;
  try {
    const rows = await insert('sanguo_users', { username, password_hash: hash, nickname: nick });
    currentUser = rows[0];
    saveSession();
    // 自动创建排行榜和擂台初始数据
    await upsert('sanguo_leaderboard', { user_id: currentUser.id, nickname: nick, power: 0, card_count: 0, win_count: 0 });
    await upsert('sanguo_arena', { user_id: currentUser.id, nickname: nick, team: [], power: 0 });
    return { ok: true, user: currentUser };
  } catch(e) {
    if (e.message.includes('duplicate') || e.message.includes('unique')) {
      return { ok: false, error: '用户名已存在' };
    }
    return { ok: false, error: '注册失败: ' + e.message };
  }
}

export async function login(username, password) {
  const hash = hashPassword(password);
  try {
    const rows = await query('sanguo_users', `username=eq.${encodeURIComponent(username)}&password_hash=eq.${hash}`);
    if (rows.length === 0) return { ok: false, error: '用户名或密码错误' };
    currentUser = rows[0];
    // 更新最后登录时间
    update('sanguo_users', `id=eq.${currentUser.id}`, { last_login: new Date().toISOString() });
    saveSession();
    return { ok: true, user: currentUser };
  } catch(e) {
    return { ok: false, error: '登录失败: ' + e.message };
  }
}

export function logout() {
  currentUser = null;
  saveSession();
}

// ===== PATCH优先的保存（先更新，不存在则插入）=====
async function patchOrInsert(table, matchField, matchValue, data) {
  const existing = await query(table, `${matchField}=eq.${matchValue}`);
  if (existing.length > 0) {
    await update(table, `${matchField}=eq.${matchValue}`, data);
  } else {
    await insert(table, { [matchField]: matchValue, ...data });
  }
}

// ===== 云存档 =====
export async function saveGameToCloud(gameData, power) {
  if (!currentUser) return;
  await patchOrInsert('sanguo_saves', 'user_id', currentUser.id, {
    game_data: gameData,
    power: power,
    updated_at: new Date().toISOString()
  });
  // 同步排行榜（upsert 确保每个 user_id 只有一行）
  await upsert('sanguo_leaderboard', {
    user_id: currentUser.id,
    nickname: currentUser.nickname,
    avatar: currentUser.avatar || 'liubei',
    power: power,
    card_count: Object.keys(gameData.ownedCards || {}).length,
    win_count: gameData.battleWins || 0,
    updated_at: new Date().toISOString()
  });
}

export async function loadGameFromCloud() {
  if (!currentUser) return null;
  const rows = await query('sanguo_saves', `user_id=eq.${currentUser.id}`);
  return rows.length > 0 ? rows[0].game_data : null;
}

// ===== 排行榜 =====
export async function getLeaderboard(limit = 50) {
  return query('sanguo_leaderboard', `order=power.desc&limit=${limit}`);
}

export async function getFloorLeaderboard(limit = 30) {
  // 从存档表读 dungeonMaxFloor，从排行榜读昵称/头像，客户端合并
  const [saves, lb] = await Promise.all([
    query('sanguo_saves', `select=user_id,game_data&limit=200`),
    query('sanguo_leaderboard', `select=user_id,nickname,avatar,card_count,win_count&limit=200`)
  ]);
  const lbMap = Object.fromEntries(lb.map(r => [r.user_id, r]));
  return saves
    .map(s => {
      const floor = s.game_data?.dungeonMaxFloor || 0;
      const info  = lbMap[s.user_id] || {};
      return { user_id: s.user_id, dungeon_floor: floor, ...info };
    })
    .filter(r => r.dungeon_floor > 0)
    .sort((a, b) => b.dungeon_floor - a.dungeon_floor)
    .slice(0, limit);
}

let _monopolyLbCache = null;
let _monopolyLbTime  = 0;
export async function getMonopolyLeaderboard(limit = 30) {
  if (_monopolyLbCache && Date.now() - _monopolyLbTime < 60000) return _monopolyLbCache;
  try {
    // 只取有大富翁积分的存档（game_data->monopolyScore 不为 null 且 > 0）
    // 分两批并行：存档只选 user_id + game_data 的两个子字段，减少传输量
    const [saves, lb] = await Promise.all([
      query('sanguo_saves', `select=user_id,game_data->>monopolyScore,game_data->>monopolyWins&game_data->>monopolyScore=gt.0&order=updated_at.desc&limit=200`),
      query('sanguo_leaderboard', `select=user_id,nickname,avatar&limit=500`)
    ]);
    const lbMap = Object.fromEntries(lb.map(r => [r.user_id, r]));
    const seen = new Set();
    const rows = [];
    for (const s of saves) {
      if (seen.has(s.user_id)) continue;
      seen.add(s.user_id);
      const score = parseInt(s.monopolyScore) || 0;
      if (score <= 0) continue;
      const info = lbMap[s.user_id] || {};
      rows.push({ user_id: s.user_id, monopoly_score: score, monopoly_wins: parseInt(s.monopolyWins) || 0, ...info });
    }
    const result = rows.sort((a, b) => b.monopoly_score - a.monopoly_score).slice(0, limit);
    _monopolyLbCache = result;
    _monopolyLbTime  = Date.now();
    return result;
  } catch (e) {
    console.error('[monopoly lb]', e);
    return _monopolyLbCache || [];
  }
}

// ===== 擂台 =====
export async function setArenaTeam(team, power) {
  if (!currentUser) return;
  await patchOrInsert('sanguo_arena', 'user_id', currentUser.id, {
    nickname: currentUser.nickname,
    avatar: currentUser.avatar || 'liubei',
    team: team,
    power: power,
    updated_at: new Date().toISOString()
  });
  // 同时同步排行榜
  await upsert('sanguo_leaderboard', {
    user_id: currentUser.id,
    nickname: currentUser.nickname,
    avatar: currentUser.avatar || 'liubei',
    power: power,
    card_count: team.length,
    win_count: 0,
    updated_at: new Date().toISOString()
  });
}

export async function getMyArenaTeam() {
  if (!currentUser) return null;
  const rows = await query('sanguo_arena', `user_id=eq.${currentUser.id}`);
  return rows.length > 0 ? rows[0] : null;
}

export async function getArenaOpponents(limit = 20) {
  if (!currentUser) return [];
  // 获取擂台对手（排除自己）
  return query('sanguo_arena', `user_id=neq.${currentUser.id}&order=power.desc&limit=${limit}`);
}

export async function recordArenaResult(defenderId, defenderName, winner, detail) {
  if (!currentUser) return;
  await insert('sanguo_arena_log', {
    attacker_id: currentUser.id,
    defender_id: defenderId,
    attacker_name: currentUser.nickname,
    defender_name: defenderName,
    winner,
    detail
  });
  // 更新胜负计数
  if (winner === 'attacker') {
    const me = await query('sanguo_arena', `user_id=eq.${currentUser.id}`);
    if (me.length) await update('sanguo_arena', `user_id=eq.${currentUser.id}`, { wins: (me[0].wins || 0) + 1 });
    const def = await query('sanguo_arena', `user_id=eq.${defenderId}`);
    if (def.length) await update('sanguo_arena', `user_id=eq.${defenderId}`, { losses: (def[0].losses || 0) + 1 });
  }
}

export async function getArenaLog(limit = 20) {
  if (!currentUser) return [];
  return query('sanguo_arena_log', `or=(attacker_id.eq.${currentUser.id},defender_id.eq.${currentUser.id})&order=created_at.desc&limit=${limit}`);
}

// 初始化
loadSession();
