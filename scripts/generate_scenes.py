#!/usr/bin/env python3
"""三国志探险 - 生成故事场景插图 + 全身卡牌图"""

import httpx
import base64
import time
from pathlib import Path

N1N_API_KEY = "sk-tVMpRqq7wr1PhCNSkPky2nypUyTr23f0UCsmyO0f8Ug6zNpO"
N1N_BASE_URL = "https://api.n1n.ai"
MODEL = "flux.1-kontext-pro"
OUTPUT_DIR = Path(__file__).parent.parent / "images"

# ===== 10个故事场景 =====
SCENES = [
    {
        "id": "scene_taoyuan",
        "path": "scenes/taoyuan.png",
        "prompt": "Anime illustration of three Chinese warriors kneeling under blooming peach blossom trees, swearing brotherhood oath, burning incense, pink petals falling, warm golden sunset lighting, ancient China setting, emotional dramatic scene, professional anime movie quality, wide cinematic composition, no text"
    },
    {
        "id": "scene_sangumaolu",
        "path": "scenes/sangumaolu.png",
        "prompt": "Anime illustration of a noble Chinese lord visiting a thatched cottage in snowy winter, humble straw hut in bamboo forest, snow falling heavily, the visitor bowing respectfully at the door, misty mountains in background, serene peaceful atmosphere, professional anime movie quality, cinematic composition, no text"
    },
    {
        "id": "scene_guandu",
        "path": "scenes/guandu.png",
        "prompt": "Anime illustration of a massive ancient Chinese battle, two armies clashing on an open plain, war banners and flags flying, dust clouds rising, burning supply depot in the background with flames and smoke, dramatic sky, epic war scene, professional anime movie quality, cinematic wide shot, no text"
    },
    {
        "id": "scene_chibi",
        "path": "scenes/chibi.png",
        "prompt": "Anime illustration of the Battle of Red Cliffs, massive fleet of ancient Chinese warships on fire on a great river, enormous flames reflected in water, dramatic night sky with east wind blowing, small boats approaching the burning fleet, most iconic Three Kingdoms battle scene, professional anime movie quality, epic cinematic, no text"
    },
    {
        "id": "scene_changbanpo",
        "path": "scenes/changbanpo.png",
        "prompt": "Anime illustration of a lone silver-armored warrior on white horse charging through enemy soldiers, carrying a baby wrapped in cloth, dust and chaos of battle, enemy soldiers falling back, heroic desperate rescue scene, dramatic action composition, professional anime movie quality, dynamic motion, no text"
    },
    {
        "id": "scene_caochuan",
        "path": "scenes/caochuan.png",
        "prompt": "Anime illustration of straw boats floating on a misty river at dawn, thousands of arrows flying into the straw-covered boats from the foggy shore, dense white fog over the river, lanterns glowing on the boats, clever military deception scene, atmospheric mysterious mood, professional anime movie quality, cinematic, no text"
    },
    {
        "id": "scene_kongchengji",
        "path": "scenes/kongchengji.png",
        "prompt": "Anime illustration of a wise scholar sitting calmly on top of a fortress gate tower playing a guqin (ancient Chinese instrument), city gates wide open below, a massive enemy army hesitating outside the empty city, tense psychological warfare scene, dramatic contrast between serenity above and military power below, professional anime movie quality, no text"
    },
    {
        "id": "scene_qiqin",
        "path": "scenes/qiqin.png",
        "prompt": "Anime illustration of a Chinese strategist in white robes releasing a captured tribal chieftain in a tropical jungle setting, lush green vegetation and exotic flowers, the chieftain looking surprised and moved, surrounding soldiers watching, merciful and wise atmosphere, professional anime movie quality, cinematic, no text"
    },
    {
        "id": "scene_huoshao",
        "path": "scenes/huoshao.png",
        "prompt": "Anime illustration of a massive fire burning through hundreds of connected military camps stretching across forested hills at night, soldiers fleeing in panic, fire spreading from camp to camp in a chain reaction, devastating inferno scene, dramatic orange and red sky, professional anime movie quality, epic wide shot, no text"
    },
    {
        "id": "scene_guijin",
        "path": "scenes/guijin.png",
        "prompt": "Anime illustration of a grand Chinese imperial coronation ceremony in a magnificent palace hall, a young emperor in golden dragon robes ascending the throne, officials bowing, three broken kingdom banners (blue, green, red) lying on the ground, symbolizing unification, golden triumphant lighting, professional anime movie quality, no text"
    },
]

# ===== 24 全身卡牌图 =====
CARD_ART = [
    {"id": "caocao", "prompt": "Full body anime character art of Cao Cao, Chinese warlord emperor, age 40, wearing golden crown and dark blue dragon-embroidered imperial robes, confident commanding pose with one hand raised, sharp intelligent eyes, short black beard, swirling dark energy aura, professional game card illustration, dynamic pose, ornate golden border frame, dark blue background with golden particles, no text"},
    {"id": "simayi", "prompt": "Full body anime character art of Sima Yi, cunning Chinese strategist, age 50, wearing black scholar hat and dark purple robes, calculating narrow eyes, thin beard, hands clasped behind back in scheming pose, fox shadow behind him, professional game card illustration, dark mysterious purple background with constellation patterns, no text"},
    {"id": "guojia", "prompt": "Full body anime character art of Guo Jia, brilliant young Chinese advisor, age 30, handsome face, windswept hair, wearing casual blue-white scholar robes, holding an elegant folding fan, confident carefree smile, wind swirling around him, professional game card illustration, blue sky background with floating clouds, no text"},
    {"id": "xunyu", "prompt": "Full body anime character art of Xun Yu, refined Chinese court minister, age 35, elegant dignified pose, wearing blue official robes with jade belt, holding a bamboo scroll, calm serene expression, orchid flowers floating around, professional game card illustration, soft blue scholarly background, no text"},
    {"id": "zhangliao", "prompt": "Full body anime character art of Zhang Liao, fierce Chinese warrior general, age 35, wearing blue steel battle armor with tiger shoulder guards, charging forward with crescent halberd raised, fierce tiger-like eyes, battle cry expression, tiger spirit behind him, professional game card illustration, battlefield background with lightning, no text"},
    {"id": "xuchu", "prompt": "Full body anime character art of Xu Chu, massive muscular Chinese warrior, bald head, bare-chested showing muscles, wearing leather battle pants, wielding an enormous broadsword over shoulder, wild battle grin, dust and rocks floating from his power, professional game card illustration, earthy brown battle background, no text"},
    {"id": "xiahoudun", "prompt": "Full body anime character art of Xiahou Dun, one-eyed Chinese warrior general, black leather eyepatch over left eye, wearing dark blue heavy armor with fur collar, wielding a long spear, fierce determined stance, battle scars visible, red lightning energy around his weapon, professional game card illustration, stormy dark background, no text"},
    {"id": "dianwei", "prompt": "Full body anime character art of Dian Wei, powerful Chinese bodyguard warrior, spiky messy hair, wearing dark iron-studded leather armor, dual-wielding heavy iron halberds crossed in defense pose, fearless warrior expression, stone and fire effects at his feet, professional game card illustration, dark iron-grey background, no text"},
    {"id": "liubei", "prompt": "Full body anime character art of Liu Bei, benevolent Chinese emperor, age 40, wearing green and gold dragon robes with jade crown, gentle kind expression with long earlobes, one hand extended in welcoming gesture, warm golden light around him, phoenix silhouette in background, professional game card illustration, warm green-gold background, no text"},
    {"id": "zhugeliang", "prompt": "Full body anime character art of Zhuge Liang the greatest Chinese strategist, wearing flowing white and green crane-feather robe with tall scholar hat, holding iconic white feather fan, serene all-knowing expression, wind swirling his robes, eight trigrams magic circle glowing beneath his feet, starry wisdom aura, professional game card illustration, mystical green-white background, no text"},
    {"id": "guanyu", "prompt": "Full body anime character art of Guan Yu the God of War, red-faced with phoenix eyes and magnificent long black beard reaching chest, wearing green robe over golden battle armor, holding the legendary Green Dragon Crescent Blade (massive polearm), majestic stern expression, green dragon spirit coiling around weapon, professional game card illustration, crimson and green background, no text"},
    {"id": "zhangfei", "prompt": "Full body anime character art of Zhang Fei, fierce loud Chinese warrior, big round angry eyes, wild bushy black beard covering face, dark skin, wearing black leopard-skin battle armor, thrusting forward his serpent spear with a battle roar, fire and dust explosion behind him, professional game card illustration, fiery orange-black background, no text"},
    {"id": "zhaoyun", "prompt": "Full body anime character art of Zhao Yun the perfect hero warrior, young handsome face, wearing shining silver-white battle armor with flowing white cape, riding pose with silver spear in hand, heroic confident smile, white dragon energy spiraling around him, professional game card illustration, silver-white celestial background with sparkles, no text"},
    {"id": "huangzhong", "prompt": "Full body anime character art of Huang Zhong, elderly but powerful Chinese warrior archer, age 65, white hair and white beard, wearing green-gold battle armor, drawing a massive bow with arrow glowing with golden energy, determined fighting spirit in eyes, autumn leaves swirling, professional game card illustration, golden autumn background, no text"},
    {"id": "machao", "prompt": "Full body anime character art of Ma Chao the handsome cavalry general, face like jade, flowing black hair under silver lion-head helmet, wearing gleaming white armor with red cape billowing, mounted on rearing white horse, charging with spear, dashing heroic expression, professional game card illustration, dramatic white-silver background, no text"},
    {"id": "weiyan", "prompt": "Full body anime character art of Wei Yan, fierce rebellious Chinese general, sharp angry eyes, wearing dark green-black heavy armor with horn-like helmet decorations, wielding a massive broadsword in aggressive stance, defiant proud expression, dark purple rebellious energy, professional game card illustration, dark green-purple background, no text"},
    {"id": "sunquan", "prompt": "Full body anime character art of Sun Quan young Chinese emperor, striking green eyes and purple-tinged beard, wearing red and gold imperial dragon robes with jeweled crown, commanding leadership pose pointing forward, tiger spirit behind him, professional game card illustration, regal red-gold background, no text"},
    {"id": "zhouyu", "prompt": "Full body anime character art of Zhou Yu the most handsome military commander, extremely beautiful face, elegant red and white warrior robes flowing in wind, one hand on sword hilt other hand conducting, musical notes floating around him, charming confident smile, professional game card illustration, romantic red-pink background with cherry blossoms, no text"},
    {"id": "luxun", "prompt": "Full body anime character art of Lu Xun young scholarly Chinese general, age 25, calm intelligent expression, wearing red scholar-warrior hybrid outfit, holding a book in one hand and a flame-engulfed sword in the other, dual nature of scholar and warrior, professional game card illustration, fire and knowledge themed red-blue background, no text"},
    {"id": "lusu", "prompt": "Full body anime character art of Lu Su, kind honest Chinese diplomat, age 40, warm friendly eyes, round face, wearing red-brown official robes, holding a peace scroll with both hands, gentle diplomatic smile, bridge and handshake symbolism in background, professional game card illustration, warm diplomatic amber background, no text"},
    {"id": "ganning", "prompt": "Full body anime character art of Gan Ning the pirate warrior, wearing colorful bandana with golden bells attached, light leather armor with sail patterns, wielding a curved blade in dynamic action pose, adventurous wild grin, ship and waves behind him, golden bells glowing, professional game card illustration, ocean blue-gold background, no text"},
    {"id": "taishici", "prompt": "Full body anime character art of Taishi Ci, loyal Chinese warrior archer, strong athletic build, wearing red-brown leather battle armor, carrying a large bow with one arm pulling back a glowing arrow, steady determined expression, mountain and fortress in background, professional game card illustration, earthy red-brown background, no text"},
    {"id": "lvmeng", "prompt": "Full body anime character art of Lv Meng, self-educated Chinese general showing transformation, wearing red military uniform with books tucked under arm and sword at hip, bright intelligent eyes, one side showing rough warrior past other side showing learned scholar present, professional game card illustration, split background (dark to bright transformation), no text"},
    {"id": "huanggai", "prompt": "Full body anime character art of Huang Gai, weathered veteran Chinese warrior, age 55, grey hair and beard, wearing battered red armor with battle scars, holding a burning torch in one hand and chains in the other, fierce loyal determination, fire and smoke swirling around, professional game card illustration, fiery red-orange background, no text"},
]


def generate_image(item: dict, retries: int = 3) -> str | None:
    output_path = OUTPUT_DIR / item["path"]
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if output_path.exists():
        print(f"  ⏭️  {item['id']} 已存在，跳过")
        return str(output_path)

    headers = {
        "Authorization": f"Bearer {N1N_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "prompt": item["prompt"],
        "n": 1,
        "size": item.get("size", "1024x1024"),
    }

    for attempt in range(retries):
        try:
            print(f"  🎨 正在生成 {item['id']}... (尝试 {attempt + 1}/{retries})")
            resp = httpx.post(
                f"{N1N_BASE_URL}/v1/images/generations",
                headers=headers,
                json=payload,
                timeout=300,
            )

            if resp.status_code == 429:
                wait = 30 * (attempt + 1)
                print(f"  ⏳ 限速，等待 {wait}s...")
                time.sleep(wait)
                continue

            resp.raise_for_status()
            data = resp.json()
            items = data.get("data", [])
            if not items:
                continue

            item_data = items[0]
            b64_json = item_data.get("b64_json", "")
            img_url = item_data.get("url", "")

            if b64_json:
                output_path.write_bytes(base64.b64decode(b64_json))
            elif img_url:
                with httpx.Client(timeout=120) as client:
                    r = client.get(img_url, follow_redirects=True)
                    r.raise_for_status()
                    output_path.write_bytes(r.content)
            else:
                continue

            print(f"  ✅ {item['id']} 完成 → {output_path}")
            return str(output_path)

        except Exception as e:
            print(f"  ❌ {item['id']} 错误: {e}")
            if attempt < retries - 1:
                time.sleep(10)

    return None


def main():
    print("🎮 三国志探险 - 场景插图 & 全身卡牌生成")
    print()

    # 场景图
    all_items = []
    for s in SCENES:
        s.setdefault("size", "1536x1024")
        all_items.append(("场景", s))

    # 全身卡牌
    for c in CARD_ART:
        c["path"] = f"cardart/{c['id']}.png"
        c.setdefault("size", "768x1024")
        all_items.append(("卡牌", c))

    total = len(all_items)
    success = 0

    for i, (category, item) in enumerate(all_items):
        print(f"[{i+1}/{total}] [{category}] {item['id']}")
        result = generate_image(item)
        if result:
            success += 1
        if i < total - 1:
            time.sleep(3)

    print(f"\n✨ 完成! 成功: {success}/{total}")


if __name__ == "__main__":
    main()
