// 压缩新生成的大图片，目标<150KB，与原有武将一致
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '../images/cardart');

// 需要压缩的新武将（>200KB的）
const targets = [
  'jiaxu','zhanghe','jiangwei','fazheng','sunce','zhoutai',
  'lvbu','diaochan','yuanshao','dongzhuo','zhangxiu','huatuo'
];

async function compress(id) {
  const filePath = path.join(DIR, `${id}.webp`);
  const stat = fs.statSync(filePath);
  const sizeBefore = Math.round(stat.size / 1024);

  const img = sharp(filePath);
  const meta = await img.metadata();

  // 降分辨率到 512x683（保持3:4比例），质量60
  const buf = await sharp(filePath)
    .resize(512, 683, { fit: 'cover' })
    .webp({ quality: 60, effort: 6 })
    .toBuffer();

  fs.writeFileSync(filePath, buf);
  const sizeAfter = Math.round(buf.length / 1024);
  console.log(`✓ ${id}: ${sizeBefore}KB → ${sizeAfter}KB`);
}

async function main() {
  console.log('压缩卡牌图片...\n');
  for (const id of targets) {
    await compress(id);
  }
  console.log('\n完成！');
}

main().catch(console.error);
