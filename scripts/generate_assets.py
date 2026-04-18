#!/usr/bin/env python3
"""三国志探险 - 生成游戏美术资源（地图背景、UI素材）"""

import httpx
import base64
import time
from pathlib import Path

N1N_API_KEY = "sk-tVMpRqq7wr1PhCNSkPky2nypUyTr23f0UCsmyO0f8Ug6zNpO"
N1N_BASE_URL = "https://api.n1n.ai"
MODEL = "flux.1-kontext-pro"
OUTPUT_DIR = Path(__file__).parent.parent / "images"

ASSETS = [
    {
        "id": "map_bg",
        "path": "map_bg.png",
        "size": "1920x1080",
        "prompt": """Top-down ancient Chinese map illustration in watercolor ink-wash (水墨画) style,
showing the Three Kingdoms territories of ancient China,
mountains, rivers (Yellow River and Yangtze River), rolling hills, scattered clouds,
warm parchment paper texture background, antique map style with soft pastel colors,
subtle territory divisions in blue (north/Wei), green (west/Shu), red (east/Wu),
elegant calligraphy decorative borders, professional game background art,
soft dreamy atmosphere, no text or labels, clean artistic illustration."""
    },
    {
        "id": "gacha_bg",
        "path": "gacha_bg.png",
        "size": "1080x1920",
        "prompt": """Mystical ancient Chinese summoning portal, vertical composition,
swirling golden energy vortex in the center, ancient Chinese temple pillars on sides,
floating Chinese calligraphy talismans and magical symbols,
dark purple-blue night sky with stars and constellation patterns,
golden light rays emanating from center, cherry blossom petals floating,
Three Kingdoms era mystical atmosphere, professional mobile game gacha screen art,
dramatic lighting, no characters, no text."""
    },
    {
        "id": "battle_bg",
        "path": "battle_bg.png",
        "size": "1920x1080",
        "prompt": """Ancient Chinese battlefield scene, wide panoramic view,
dramatic sunset sky with orange and red clouds,
open grassland field with distant mountains and fortress walls,
war banners fluttering in the wind, scattered war drums and weapons on ground,
Three Kingdoms era military camp atmosphere,
cinematic epic battle preparation scene, professional game battle background,
warm dramatic lighting, no characters, no text, painterly illustration style."""
    },
    {
        "id": "home_banner",
        "path": "home_banner.png",
        "size": "1920x720",
        "prompt": """Elegant ancient Chinese scroll banner header illustration,
Three Kingdoms theme with three symbolic elements: blue dragon (Wei), green bamboo (Shu), red phoenix (Wu),
arranged horizontally across a golden silk scroll background,
traditional Chinese cloud patterns and decorative borders,
warm golden hour lighting, ink-wash watercolor style,
professional mobile game banner art, centered composition, no text."""
    },
]


def generate_asset(asset: dict, retries: int = 3) -> str | None:
    output_path = OUTPUT_DIR / asset["path"]
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if output_path.exists():
        print(f"  ⏭️  {asset['id']} 已存在，跳过")
        return str(output_path)

    headers = {
        "Authorization": f"Bearer {N1N_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "prompt": asset["prompt"],
        "n": 1,
        "size": asset["size"],
    }

    for attempt in range(retries):
        try:
            print(f"  🎨 正在生成 {asset['id']}... (尝试 {attempt + 1}/{retries})")
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
                continue

            print(f"  ✅ {asset['id']} 完成 → {output_path}")
            return str(output_path)

        except Exception as e:
            print(f"  ❌ {asset['id']} 错误: {e}")
            if attempt < retries - 1:
                time.sleep(10)

    return None


def main():
    print(f"🎮 三国志探险 - 美术资源生成")
    print(f"📁 输出目录: {OUTPUT_DIR}")
    print()

    for i, asset in enumerate(ASSETS):
        print(f"[{i+1}/{len(ASSETS)}] {asset['id']}")
        generate_asset(asset)
        if i < len(ASSETS) - 1:
            time.sleep(5)

    print("\n✨ 完成!")


if __name__ == "__main__":
    main()
