/**
 * Script tải dữ liệu hành chính Việt Nam từ provinces.open-api.vn
 * và lưu thành file JSON tĩnh trong public/data/
 *
 * Chạy: node scripts/download-provinces.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, '..', 'CMS.Frontend', 'public', 'data');

const API_BASE = 'https://provinces.open-api.vn/api';

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Đang tải danh sách tỉnh/thành...');
  const provinces = await fetchJSON(`${API_BASE}/p/`);

  // Lưu danh sách tỉnh (nhẹ)
  const provincesSlim = provinces.map(p => ({
    code: p.code,
    name: p.name,
  }));
  writeFileSync(
    resolve(OUTPUT_DIR, 'provinces.json'),
    JSON.stringify(provincesSlim, null, 2),
    'utf-8'
  );
  console.log(`  ✓ ${provincesSlim.length} tỉnh/thành`);

  // Tải chi tiết từng tỉnh (bao gồm quận + phường)
  console.log('Đang tải chi tiết quận/huyện + phường/xã cho từng tỉnh...');
  const allDistricts = {};
  const allWards = {};

  for (let i = 0; i < provinces.length; i++) {
    const p = provinces[i];
    process.stdout.write(`  [${i + 1}/${provinces.length}] ${p.name}...`);

    const detail = await fetchJSON(`${API_BASE}/p/${p.code}?depth=3`);

    const districts = (detail.districts || []).map(d => ({
      code: d.code,
      name: d.name,
      province_code: p.code,
    }));
    allDistricts[p.code] = districts;

    for (const d of detail.districts || []) {
      const wards = (d.wards || []).map(w => ({
        code: w.code,
        name: w.name,
        district_code: d.code,
      }));
      allWards[d.code] = wards;
    }

    console.log(` ${districts.length} quận`);

    // Rate limiting nhẹ
    await new Promise(r => setTimeout(r, 100));
  }

  writeFileSync(
    resolve(OUTPUT_DIR, 'districts.json'),
    JSON.stringify(allDistricts, null, 2),
    'utf-8'
  );
  console.log(`  ✓ Đã lưu districts.json`);

  writeFileSync(
    resolve(OUTPUT_DIR, 'wards.json'),
    JSON.stringify(allWards, null, 2),
    'utf-8'
  );
  console.log(`  ✓ Đã lưu wards.json`);

  console.log('\nHoàn tất! Dữ liệu đã được lưu vào:', OUTPUT_DIR);
}

main().catch(err => {
  console.error('Lỗi:', err.message);
  process.exit(1);
});
