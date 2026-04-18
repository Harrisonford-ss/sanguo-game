#!/usr/bin/env python3
"""三国志探险 - 使用 N1N API 批量生成Q版武将立绘"""

import httpx
import base64
import time
import json
from pathlib import Path

# API 配置
N1N_API_KEY = "sk-tVMpRqq7wr1PhCNSkPky2nypUyTr23f0UCsmyO0f8Ug6zNpO"
N1N_BASE_URL = "https://api.n1n.ai"
MODEL = "flux.1-kontext-pro"
OUTPUT_DIR = Path(__file__).parent.parent / "images" / "characters"

# 24 武将的外观描述
CHARACTERS = [
    # ===== 魏国 =====
    {
        "id": "caocao",
        "name": "曹操",
        "desc": "A powerful Chinese warlord, age 40, sharp intelligent eyes, short black beard, wearing a golden imperial crown with red jewels, dark blue and gold dragon-embroidered royal robes, confident smirk expression, commanding aura"
    },
    {
        "id": "simayi",
        "name": "司马懿",
        "desc": "A cunning Chinese strategist, age 50, narrow calculating eyes, thin long beard, wearing a black scholar hat (纶巾), dark purple and black official robes, subtle mysterious smile, fox-like expression"
    },
    {
        "id": "guojia",
        "name": "郭嘉",
        "desc": "A young brilliant Chinese advisor, age 30, bright sparkling eyes, no beard, handsome face, wearing a casual blue-white scholar robe with a folding fan, carefree confident smile, windswept hair"
    },
    {
        "id": "xunyu",
        "name": "荀彧",
        "desc": "A refined Chinese court official, age 35, calm gentle eyes, neat short beard, wearing an elegant blue official robe with jade belt ornament, holding a bamboo scroll, dignified serene expression"
    },
    {
        "id": "zhangliao",
        "name": "张辽",
        "desc": "A fierce Chinese warrior general, age 35, sharp tiger-like eyes, short black beard, wearing a blue steel battle armor with a tiger-head shoulder guard, holding a crescent blade halberd, fierce determined expression"
    },
    {
        "id": "xuchu",
        "name": "许褚",
        "desc": "A massive muscular Chinese warrior, age 30, round fierce eyes, bald head, dark skin, bare-chested showing muscles, wearing simple leather armor pants, wielding a huge broadsword, wild battle-ready grin"
    },
    {
        "id": "xiahoudun",
        "name": "夏侯惇",
        "desc": "A one-eyed Chinese warrior general, age 38, left eye covered with a black leather eyepatch, right eye fierce and determined, wearing dark blue heavy battle armor with fur collar, short black beard, battle-scarred face"
    },
    {
        "id": "dianwei",
        "name": "典韦",
        "desc": "A powerful Chinese bodyguard warrior, age 32, fierce round eyes, spiky messy black hair, wearing dark iron-studded leather armor, wielding twin heavy iron halberds, muscular build, fearless warrior expression"
    },
    # ===== 蜀国 =====
    {
        "id": "liubei",
        "name": "刘备",
        "desc": "A benevolent Chinese emperor, age 40, kind warm eyes with long earlobes, short neat black beard, wearing a green and gold dragon robe with jade crown, gentle compassionate smile, noble but humble bearing"
    },
    {
        "id": "zhugeliang",
        "name": "诸葛亮",
        "desc": "The greatest Chinese strategist, age 35, wise calm eyes with starlike sparkle, wearing a tall white scholar hat (纶巾), flowing white and green crane-feather robe, holding a white feather fan (鹅毛扇), serene all-knowing expression"
    },
    {
        "id": "guanyu",
        "name": "关羽",
        "desc": "The Chinese God of War, age 42, red-faced (赤面) with phoenix eyes (丹凤眼), magnificent long black beard reaching his chest, wearing a green robe over battle armor, green cloth hat, holding the Green Dragon Crescent Blade (青龙偃月刀), majestic stern expression"
    },
    {
        "id": "zhangfei",
        "name": "张飞",
        "desc": "A fierce loud Chinese warrior, age 38, big round angry eyes (环眼), wild bushy black beard covering his face, dark skin, wearing black leopard-skin battle armor, wielding a long serpent spear (丈八蛇矛), roaring battle expression with open mouth"
    },
    {
        "id": "zhaoyun",
        "name": "赵云",
        "desc": "The perfect Chinese warrior hero, age 28, handsome bright eyes, no beard, young noble face, wearing shining silver-white battle armor with white cape, riding posture, holding a silver spear, heroic confident smile"
    },
    {
        "id": "huangzhong",
        "name": "黄忠",
        "desc": "An elderly Chinese warrior archer, age 65, white hair and white beard, but strong determined eyes full of fighting spirit, wearing green-gold battle armor, holding a huge bow with arrow drawn, weathered but powerful face"
    },
    {
        "id": "machao",
        "name": "马超",
        "desc": "A handsome young Chinese cavalry general, age 25, face like jade (面如冠玉), flowing black hair, wearing shining silver lion-head helmet and white armor with red cape, holding a long spear on horseback, dashingly handsome expression"
    },
    {
        "id": "weiyan",
        "name": "魏延",
        "desc": "A fierce rebellious Chinese general, age 35, sharp angry eyes, short messy black beard, wearing dark green-black heavy armor with horn-like helmet decorations, wielding a large broadsword, defiant proud expression"
    },
    # ===== 吴国 =====
    {
        "id": "sunquan",
        "name": "孙权",
        "desc": "A young Chinese emperor with green eyes and purple beard (碧眼紫髯), age 30, unusual striking appearance, wearing red and gold imperial dragon robe with a jeweled crown, confident commanding expression, strong jaw"
    },
    {
        "id": "zhouyu",
        "name": "周瑜",
        "desc": "The most handsome Chinese military commander, age 28, extremely beautiful face, gentle yet sharp eyes, wearing elegant red and white warrior robes with a music instrument (guqin) nearby, charming intelligent smile, windswept black hair"
    },
    {
        "id": "luxun",
        "name": "陆逊",
        "desc": "A young scholarly Chinese general, age 25, calm intelligent eyes behind a youthful face, wearing a red scholar-warrior hybrid outfit, holding both a book and a sword, composed studious expression, neat black hair in topknot"
    },
    {
        "id": "lusu",
        "name": "鲁肃",
        "desc": "A kind honest Chinese diplomat, age 40, warm friendly eyes, round face with neat short beard, wearing a red-brown official robe, gentle diplomatic smile, holding a scroll, trustworthy appearance"
    },
    {
        "id": "ganning",
        "name": "甘宁",
        "desc": "A dashing pirate-warrior Chinese general, age 30, fierce grinning eyes, wearing a colorful bandana headband with bells (铃铛) attached, light leather armor with sail patterns, wielding a curved blade, adventurous wild smile"
    },
    {
        "id": "taishici",
        "name": "太史慈",
        "desc": "A loyal archer Chinese warrior, age 32, strong determined eyes, short beard, wearing red-brown leather battle armor, carrying a large bow and quiver of arrows on his back, steady reliable expression, athletic build"
    },
    {
        "id": "lvmeng",
        "name": "吕蒙",
        "desc": "A self-educated Chinese general, age 33, bright intelligent eyes showing growth and wisdom, neat appearance, wearing a red military uniform with books tucked under arm, transformed from rough warrior to cultured general, proud studious expression"
    },
    {
        "id": "huanggai",
        "name": "黄盖",
        "desc": "A weathered veteran Chinese warrior, age 55, grey hair and grey beard, battle-scarred but determined face, wearing battered red armor with burn marks, holding a torch in one hand, fierce loyal old warrior expression"
    },
]

# Q版风格的通用 prompt 前缀
Q_STYLE_PREFIX = """Chibi anime style character portrait, cute Q-version (Q版) with big head and small body proportions (2:1 head-to-body ratio),
colorful vibrant illustration, thick black outlines, soft cel-shading,
clean solid pastel background, game character card art style,
high quality digital illustration, centered composition, full character visible.
Character: """

Q_STYLE_SUFFIX = """
Style requirements: Japanese chibi/super-deformed proportions, adorable cute expression even for fierce characters,
big sparkly expressive eyes, simplified but recognizable costume details,
soft rounded shapes, pastel color palette with vivid accents,
professional game card illustration quality, white or light gradient background."""


def generate_portrait(char: dict, retries: int = 3) -> str | None:
    """用 N1N API 生成单个武将的Q版立绘"""
    output_path = OUTPUT_DIR / f"{char['id']}.png"

    if output_path.exists():
        print(f"  ⏭️  {char['name']} 已存在，跳过")
        return str(output_path)

    prompt = Q_STYLE_PREFIX + char["desc"] + Q_STYLE_SUFFIX

    headers = {
        "Authorization": f"Bearer {N1N_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "n": 1,
        "size": "1024x1024",
    }

    for attempt in range(retries):
        try:
            print(f"  🎨 正在生成 {char['name']}... (尝试 {attempt + 1}/{retries})")
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
                print(f"  ❌ 无返回数据: {data}")
                continue

            item = items[0]
            b64_json = item.get("b64_json", "")
            img_url = item.get("url", "")

            if b64_json:
                output_path.write_bytes(base64.b64decode(b64_json))
            elif img_url:
                with httpx.Client(timeout=120) as client:
                    r = client.get(img_url, follow_redirects=True)
                    r.raise_for_status()
                    output_path.write_bytes(r.content)
            else:
                print(f"  ❌ 无图片数据: {data}")
                continue

            print(f"  ✅ {char['name']} 完成 → {output_path}")
            return str(output_path)

        except Exception as e:
            print(f"  ❌ {char['name']} 错误: {e}")
            if attempt < retries - 1:
                time.sleep(10)

    return None


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"🎮 三国志探险 - 武将立绘生成")
    print(f"📁 输出目录: {OUTPUT_DIR}")
    print(f"🤖 模型: {MODEL}")
    print(f"👥 武将数量: {len(CHARACTERS)}")
    print()

    success = 0
    failed = []

    for i, char in enumerate(CHARACTERS):
        print(f"[{i+1}/{len(CHARACTERS)}] {char['name']} ({char['id']})")
        result = generate_portrait(char)
        if result:
            success += 1
        else:
            failed.append(char["name"])

        # API 限速保护
        if i < len(CHARACTERS) - 1:
            time.sleep(5)

    print()
    print(f"✨ 完成! 成功: {success}/{len(CHARACTERS)}")
    if failed:
        print(f"❌ 失败: {', '.join(failed)}")


if __name__ == "__main__":
    main()
