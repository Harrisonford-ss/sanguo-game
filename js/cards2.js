// 三国志探险 - 卡牌图鉴

import { gameState } from './state.js';
import { characters, getCharacter } from '../data/characters.js';
import { avatarHTML } from './avatars.js';

let currentFilter = 'all';

export function initCards() {
  window.cardsModule = { refresh, closeDetail };

  // 筛选按钮
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderGrid();
    });
  });

  refresh();
}

function refresh() {
  renderGrid();
  document.getElementById('cards-collected').textContent = gameState.cardCount;
}

function renderGrid() {
  const grid = document.getElementById('cards-grid');
  let filtered = characters;

  if (currentFilter !== 'all') {
    filtered = characters.filter(c => c.kingdom === currentFilter);
  }

  grid.innerHTML = filtered.map(char => {
    const owned = gameState.hasCard(char.id);
    const level = gameState.getCardLevel(char.id);

    const rb = char.rarity === 'legend' ? '#ffd700' : char.rarity === 'rare' ? '#7c4dff' : '#bbb';
    const rGlow = char.rarity === 'legend' ? '0 0 12px rgba(255,215,0,0.4)' : char.rarity === 'rare' ? '0 0 8px rgba(124,77,255,0.25)' : '0 1px 4px rgba(0,0,0,0.08)';
    const rLabel = char.rarity === 'legend' ? '👑传说' : char.rarity === 'rare' ? '💎稀有' : '';
    const rBg = char.rarity === 'legend' ? 'linear-gradient(135deg,#fffde7,#fff8e1)' : char.rarity === 'rare' ? 'linear-gradient(135deg,#ede7f6,#e8eaf6)' : '#fafafa';

    if (!owned) {
      return `<div style="border-radius:12px;border:2px solid #ddd;opacity:0.35;filter:grayscale(1);
        padding:14px 6px 10px;text-align:center;background:#f5f5f5">
        <div style="width:64px;height:64px;border-radius:50%;background:#ddd;margin:0 auto 6px;
          display:flex;align-items:center;justify-content:center;font-size:28px;color:#bbb">?</div>
        <div style="font-size:12px;font-weight:700;color:#999">???</div>
        <div style="font-size:9px;color:#ccc">${getKingdomName(char.kingdom)}</div>
      </div>`;
    }

    return `
      <div style="border-radius:12px;cursor:pointer;position:relative;
        border:2.5px solid ${rb};box-shadow:${rGlow};
        padding:12px 6px 8px;text-align:center;background:${rBg};transition:all 0.2s"
        onclick="window.cardsModule._showDetail('${char.id}')">
        <!-- 稀有度标签 -->
        ${rLabel ? `<div style="position:absolute;top:4px;left:4px;font-size:8px;color:${rb};font-weight:800">${rLabel}</div>` : ''}
        <div style="position:absolute;top:4px;right:4px;font-size:8px;color:var(--text-light);font-weight:600">Lv${level}</div>
        <!-- Q版大头像 -->
        <div style="margin:4px auto 6px">${avatarHTML(char.id, 72)}</div>
        <!-- 名字 -->
        <div style="font-size:14px;font-weight:800">${char.name}</div>
        <!-- 星级 -->
        <div style="font-size:10px;color:${rb};margin:2px 0">${'★'.repeat(level)}${'☆'.repeat(5-level)}</div>
        <!-- 势力 -->
        <div style="font-size:9px;color:var(--text-light)">${getKingdomName(char.kingdom)} · ${char.title}</div>
      </div>`;
  }).join('');

  // 暴露方法
  window.cardsModule._showDetail = showDetail;
}

function showDetail(charId) {
  if (!gameState.hasCard(charId)) return;

  const char = getCharacter(charId);
  if (!char) return;

  const level = gameState.getCardLevel(charId);
  const statMultiplier = 1 + (level - 1) * 0.1;

  const detailEl = document.getElementById('card-detail');
  const innerEl = document.getElementById('card-detail-inner');

  const stats = {
    武力: Math.round(char.stats.武力 * statMultiplier),
    智力: Math.round(char.stats.智力 * statMultiplier),
    魅力: Math.round(char.stats.魅力 * statMultiplier)
  };

  const rarityLabel = char.rarity === 'legend' ? '传说' : char.rarity === 'rare' ? '稀有' : '普通';
  const rarityColor = char.rarity === 'legend' ? 'var(--legend-gold)' :
                      char.rarity === 'rare' ? 'var(--rare-blue)' : 'var(--common-green)';

  const canUpgrade = level < 5;
  const cost = gameState.getUpgradeCost(char.id);
  const canAfford = gameState.canUpgradeCard(char.id);

  const cardArtPath = `images/cardart/${char.id}.webp`;
  innerEl.innerHTML = `
    <div class="detail-card-art">
      <img src="${cardArtPath}" alt="${char.name}" onerror="this.style.display='none'">
    </div>
    <div style="display:flex;justify-content:center;margin-bottom:12px">
      ${avatarHTML(char.id, 60)}
    </div>
    <div class="detail-name">${char.name}</div>
    <div class="detail-title" style="color: ${rarityColor}">
      ${rarityLabel} · ${char.title} · ${'★'.repeat(level)}
    </div>
    <div class="detail-stats">
      <div class="detail-stat">
        <div class="detail-stat-value">${stats.武力}</div>
        <div class="detail-stat-label">武力</div>
      </div>
      <div class="detail-stat">
        <div class="detail-stat-value">${stats.智力}</div>
        <div class="detail-stat-label">智力</div>
      </div>
      <div class="detail-stat">
        <div class="detail-stat-value">${stats.魅力}</div>
        <div class="detail-stat-label">魅力</div>
      </div>
    </div>
    <div class="detail-section">
      <h4>人物传记</h4>
      <p>${char.bio}</p>
    </div>
    <div class="detail-section">
      <h4>经典名言</h4>
      <div class="detail-quote">"${char.quote}"</div>
    </div>
    ${char.events.length > 0 ? `
      <div class="detail-section">
        <h4>相关事件</h4>
        <p>${char.events.join('、')}</p>
      </div>
    ` : ''}
    ${canUpgrade ? `
      <div class="detail-upgrade">
        <button class="btn ${canAfford ? 'btn-primary' : 'btn-secondary'}"
                onclick="window.cardsModule._upgrade('${char.id}')"
                ${canAfford ? '' : 'disabled'}>
          升级到 Lv${level+1}
        </button>
        <div style="font-size:12px;color:var(--text-light);margin-top:6px;line-height:1.8">
          需要: 💰${cost.gold}金币 + 🧩${cost.fragments}${char.name}碎片<br>
          拥有: 💰${gameState.gold} / 🧩${gameState.getFragments(char.id)}
        </div>
        <div style="font-size:11px;color:#999;margin-top:4px">金币→大富翁 | 碎片→抽卡重复</div>
      </div>
    ` : `
      <div class="detail-upgrade">
        <div style="color: var(--gold); font-weight: 600;">已满级 ★★★★★</div>
      </div>
    `}
  `;

  detailEl.classList.remove('hidden');

  // 暴露升级方法
  window.cardsModule._upgrade = (id) => {
    if (gameState.upgradeCard(id)) {
      showDetail(id); // 刷新详情
      refresh(); // 刷新网格
    }
  };
}

function closeDetail() {
  document.getElementById('card-detail').classList.add('hidden');
}

function getKingdomName(kingdom) {
  return { wei: '魏', shu: '蜀', wu: '吴' }[kingdom] || '';
}
