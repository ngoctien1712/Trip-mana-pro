import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEARCH_API = 'https://sapnhap.bando.com.vn/ptracuu';
const OUTPUT_FILE = path.join(__dirname, '../database/migrations/20240309_update_geography_v3.sql');
const VIETNAM_ID_QUERY = "(SELECT id_country FROM countries WHERE name = 'Vietnam' OR name_vi = 'Việt Nam' LIMIT 1)";

// Danh sách 34 tỉnh thành mới
// Danh sách 34 tỉnh thành mới (Khớp chính xác với ID của API sapnhap.bando.com.vn)
const PROVINCE_NAMES: { [key: number]: string } = {
    1: "Thành phố Hà Nội",
    2: "Tỉnh Bắc Ninh",
    3: "Tỉnh Quảng Ninh",
    4: "Thành phố Hải Phòng",
    5: "Tỉnh Hưng Yên",
    6: "Tỉnh Ninh Bình",
    7: "Tỉnh Cao Bằng",
    8: "Tỉnh Tuyên Quang",
    9: "Tỉnh Lào Cai",
    10: "Tỉnh Thái Nguyên",
    11: "Tỉnh Lạng Sơn",
    12: "Tỉnh Phú Thọ",
    13: "Tỉnh Điện Biên",
    14: "Tỉnh Lai Châu",
    15: "Tỉnh Sơn La",
    16: "Tỉnh Thanh Hóa",
    17: "Tỉnh Nghệ An",
    18: "Tỉnh Hà Tĩnh",
    19: "Tỉnh Quảng Trị",
    20: "Thành phố Huế",
    21: "Thành phố Đà Nẵng",
    22: "Tỉnh Quảng Ngãi",
    23: "Tỉnh Khánh Hòa",
    24: "Tỉnh Gia Lai",
    25: "Tỉnh Đắk Lắk",
    26: "Tỉnh Lâm Đồng",
    27: "Tỉnh Tây Ninh",
    28: "Tỉnh Đồng Nai",
    29: "Thành phố Hồ Chí Minh",
    30: "Tỉnh Vĩnh Long",
    31: "Tỉnh Đồng Tháp",
    32: "Tỉnh An Giang",
    33: "Thành phố Cần Thơ",
    34: "Tỉnh Cà Mau"
};

const CLIMATE_TEMPLATES: { [key: string]: any } = {
    "northwest": { // Tây Tây Bắc (IDs: 9, 13, 14, 15)
        "climate_type": "subtropical_highland",
        "average_temperature": { "min": 12, "max": 28, "unit": "celsius" },
        "rainy_season": { "from_month": 5, "to_month": 9 },
        "best_travel_months": [9, 10, 3, 4],
        "weather_notes": ["Khí hậu phân hóa theo độ cao", "Mùa đông có thể có băng tuyết", "Mùa thu lúa chín rất đẹp"]
    },
    "northeast": { // Đông Bắc (IDs: 7, 8, 10, 11, 12, 3)
        "climate_type": "subtropical_humid",
        "average_temperature": { "min": 14, "max": 32, "unit": "celsius" },
        "rainy_season": { "from_month": 5, "to_month": 9 },
        "best_travel_months": [10, 11, 3, 4],
        "weather_notes": ["Chịu ảnh hưởng mạnh của gió mùa Đông Bắc", "Mùa đông lạnh và ẩm", "Mùa xuân có mưa phùn"]
    },
    "red_river_delta": { // Đồng bằng sông Hồng (IDs: 1, 2, 4, 5, 6)
        "climate_type": "tropical_monsoon_with_cold_winter",
        "average_temperature": { "min": 16, "max": 34, "unit": "celsius" },
        "rainy_season": { "from_month": 5, "to_month": 10 },
        "best_travel_months": [10, 11, 3, 4],
        "weather_notes": ["Bốn mùa rõ rệt", "Mùa hè nóng ẩm mưa nhiều", "Mùa thu là mùa đẹp nhất"]
    },
    "north_central": { // Bắc Trung Bộ (IDs: 16, 17, 18, 19, 20)
        "climate_type": "tropical_monsoon_transitional",
        "average_temperature": { "min": 18, "max": 35, "unit": "celsius" },
        "rainy_season": { "from_month": 9, "to_month": 12 },
        "best_travel_months": [1, 2, 3, 4, 5],
        "weather_notes": ["Mùa hè chịu ảnh hưởng gió Lào nóng khô", "Mùa mưa thường có bão đổ bộ", "Mùa đông lạnh trung bình"]
    },
    "south_central": { // Nam Trung Bộ (IDs: 21, 22, 23)
        "climate_type": "tropical_savanna_coastal",
        "average_temperature": { "min": 22, "max": 35, "unit": "celsius" },
        "rainy_season": { "from_month": 9, "to_month": 12 },
        "best_travel_months": [1, 2, 3, 4, 5, 6, 7, 8],
        "weather_notes": ["Nắng quanh năm, ít mưa", "Mùa mưa ngắn tập trung cuối năm", "Phù hợp du lịch biển hầu hết các tháng"]
    },
    "highlands": { // Tây Nguyên (IDs: 24, 25, 26)
        "climate_type": "tropical_savanna_highland",
        "average_temperature": { "min": 16, "max": 29, "unit": "celsius" },
        "rainy_season": { "from_month": 5, "to_month": 11 },
        "best_travel_months": [11, 12, 1, 2, 3],
        "weather_notes": ["Khí hậu mát mẻ, dễ chịu", "Có hai mùa mưa và khô rõ rệt", "Đêm và sáng sớm trời se lạnh"]
    },
    "south": { // Nam Bộ (IDs: 27, 28, 29, 30, 31, 32, 33, 34)
        "climate_type": "tropical",
        "average_temperature": { "min": 24, "max": 36, "unit": "celsius" },
        "rainy_season": { "from_month": 5, "to_month": 11 },
        "best_travel_months": [12, 1, 2, 3, 4],
        "weather_notes": ["Nóng ẩm quanh năm", "Cần lưu ý triều cường tại một số khu vực", "Mùa khô nắng gắt nhưng không oi bức"]
    }
};

function getClimateForProvince(id: number): any {
    // Tây Bắc: 9, 13, 14, 15
    if ([9, 13, 14, 15].includes(id)) return CLIMATE_TEMPLATES.northwest;
    // Đông Bắc: 7, 8, 10, 11, 12, 3
    if ([7, 8, 10, 11, 12, 3].includes(id)) return CLIMATE_TEMPLATES.northeast;
    // Đồng bằng sông Hồng: 1, 2, 4, 5, 6
    if ([1, 2, 4, 5, 6].includes(id)) return CLIMATE_TEMPLATES.red_river_delta;
    // Bắc Trung Bộ: 16, 17, 18, 19, 20
    if ([16, 17, 18, 19, 20].includes(id)) return CLIMATE_TEMPLATES.north_central;
    // Nam Trung Bộ: 21, 22, 23
    if ([21, 22, 23].includes(id)) return CLIMATE_TEMPLATES.south_central;
    // Tây Nguyên: 24, 25, 26
    if ([24, 25, 26].includes(id)) return CLIMATE_TEMPLATES.highlands;
    // Còn lại là Nam Bộ
    return CLIMATE_TEMPLATES.south;
}

async function generateGeographySQL() {
    console.log('>>> KHỞI CHẠY QUY TRÌNH CRAWL DỮ LIỆU ĐỊA LÝ 34 TỈNH (CHUẨN HÓA ATTRIBUTE)');

    let totalWards = 0;
    let sql = `-- Migration: Update Geography Data (Restructured to 34 Provinces & Direct Wards)
-- Formatted Area.attribute strictly for Weather data (as per exampleJSON.md)
-- Source: sapnhap.bando.com.vn (Nghị quyết sáp nhập 2025)
-- Generated on: ${new Date().toISOString()}

-- 1. Cập nhật cấu trúc bảng
ALTER TABLE cities ADD COLUMN IF NOT EXISTS gso_code VARCHAR(10);
ALTER TABLE cities ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE area ADD COLUMN IF NOT EXISTS gso_code VARCHAR(10);
ALTER TABLE area ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE area ADD COLUMN IF NOT EXISTS area_type VARCHAR(20) DEFAULT 'ward';
ALTER TABLE area ADD COLUMN IF NOT EXISTS origin TEXT;

-- 2. Đảm bảo có UNIQUE constraint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cities_gso_code_key') THEN
        ALTER TABLE cities ADD CONSTRAINT cities_gso_code_key UNIQUE (gso_code);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'area_gso_code_key') THEN
        ALTER TABLE area ADD CONSTRAINT area_gso_code_key UNIQUE (gso_code);
    END IF;
END $$;

-- 3. Tạo/Cập nhật 34 Tỉnh/Thành phố mới
`;

    const provinceCodes: string[] = [];
    const allWardCodes: string[] = [];

    for (let i = 1; i <= 34; i++) {
        const provinceName = PROVINCE_NAMES[i];
        console.log(`Đang xử lý: ${provinceName} (ID: ${i})...`);
        const climate = getClimateForProvince(i);

        try {
            const cityNameSQL = provinceName.replace(/'/g, "''");
            const provinceCode = i.toString().padStart(2, '0');
            provinceCodes.push(provinceCode);

            sql += `\n-- Dữ liệu cho ${provinceName}\n`;
            sql += `INSERT INTO cities (id_country, name, name_vi, gso_code, status) 
VALUES (${VIETNAM_ID_QUERY}, '${cityNameSQL}', '${cityNameSQL}', '${provinceCode}', 'active')
ON CONFLICT (gso_code) DO UPDATE SET name = EXCLUDED.name, name_vi = EXCLUDED.name_vi, status = 'active';\n`;

            const response = await fetch(SEARCH_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `id=${i}`
            });

            if (!response.ok) {
                console.error(`Lỗi tải dữ liệu ID ${i}`);
                continue;
            }

            const wards: any = await response.json();

            wards.forEach((w: any) => {
                const wardName = w.tenhc?.replace(/'/g, "''") || 'Chưa xác định';
                const wardCode = w.maxa ? w.maxa.toString() : `auto_${provinceCode}${totalWards.toString().padStart(4, '0')}`;
                allWardCodes.push(wardCode);

                const parentCityQuery = `(SELECT id_city FROM cities WHERE gso_code = '${provinceCode}' LIMIT 1)`;
                const wardType = (w.loai || 'ward').replace(/'/g, "''");
                const wardOrigin = (w.truocsapnhap || '').replace(/'/g, "''");

                // Attribute bây giờ CHỈ chứa thông tin thời tiết theo đúng mẫu
                const attributeStr = JSON.stringify(climate).replace(/'/g, "''");

                sql += `INSERT INTO area (id_city, name, gso_code, status, area_type, origin, attribute)
VALUES (${parentCityQuery}, '${wardName}', '${wardCode}', 'active', '${wardType}', '${wardOrigin}', '${attributeStr}'::jsonb)
ON CONFLICT (gso_code) DO UPDATE SET 
    name = EXCLUDED.name, 
    id_city = EXCLUDED.id_city, 
    status = 'active', 
    area_type = EXCLUDED.area_type,
    origin = EXCLUDED.origin,
    attribute = EXCLUDED.attribute;\n`;
                totalWards++;
            });

            console.log(`- Đã tải ${wards.length} đơn vị cấp xã.`);
        } catch (e: any) {
            console.error(`Lỗi xử lý ID ${i}:`, e.message);
        }
    }

    sql += `
-- 5. DI TRÚ VÀ LÀM SẠCH DỮ LIỆU (Đảm bảo bảng cities chỉ còn đúng 34 tỉnh/thành phố)
-- Bước 5.1: Chuyển hướng các Area cũ về City mới tương ứng
DO $$
DECLARE
    old_city_record RECORD;
    new_city_id UUID;
BEGIN
    FOR old_city_record IN 
        SELECT id_city, name_vi FROM cities 
        WHERE gso_code IS NULL OR gso_code NOT IN (${provinceCodes.map(c => `'${c}'`).join(',')})
    LOOP
        SELECT id_city INTO new_city_id FROM cities 
        WHERE (
            REPLACE(REPLACE(name_vi, 'Tỉnh ', ''), 'Thành phố ', '') = REPLACE(REPLACE(old_city_record.name_vi, 'Tỉnh ', ''), 'Thành phố ', '')
            OR (old_city_record.name_vi = 'Thừa Thiên Huế' AND name_vi = 'Thành phố Huế')
        )
        AND gso_code IN (${provinceCodes.map(c => `'${c}'`).join(',')})
        LIMIT 1;

        IF new_city_id IS NOT NULL THEN
            UPDATE area SET id_city = new_city_id WHERE id_city = old_city_record.id_city;
        END IF;
    END LOOP;
END $$;

-- Bước 5.2: DI TRÚ THÔNG MINH (Truy vết sáp nhập)
DO $$
DECLARE
    old_area_record RECORD;
    clean_old_name TEXT;
    new_area_id UUID;
    fallback_area_id UUID;
    global_fallback_area_id UUID;
BEGIN
    -- Lấy ID dự phòng toàn cục
    SELECT id_area INTO global_fallback_area_id FROM area 
    WHERE gso_code IN (${allWardCodes.slice(0, 100).map(c => `'${c}'`).join(',')}) 
    LIMIT 1;

    FOR old_area_record IN 
        SELECT id_area, id_city, name FROM area 
        WHERE gso_code IS NULL OR gso_code NOT IN (${allWardCodes.map(c => `'${c}'`).join(',')})
    LOOP
        clean_old_name := REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(old_area_record.name, 'Xã ', ''), 'Phường ', ''), 'Thị trấn ', ''), 'Thành phố ', ''), 'Thị xã ', '');

        -- 1. TRUY VẾT THEO TÊN
        SELECT id_area INTO new_area_id FROM area 
        WHERE id_city = old_area_record.id_city 
        AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(name, 'Xã ', ''), 'Phường ', ''), 'Thị trấn ', ''), 'Thành phố ', ''), 'Thị xã ', '') = clean_old_name
        AND gso_code IN (${allWardCodes.map(c => `'${c}'`).join(',')})
        LIMIT 1;

        -- 2. TRUY VẾT THEO NGUỒN GỐC SÁP NHẬP
        IF new_area_id IS NULL THEN
            SELECT id_area INTO new_area_id FROM area 
            WHERE id_city = old_area_record.id_city 
            AND origin ILIKE '%' || clean_old_name || '%'
            AND gso_code IN (${allWardCodes.map(c => `'${c}'`).join(',')})
            LIMIT 1;
        END IF;

        -- 3. FALLBACK THEO TỈNH
        IF new_area_id IS NULL THEN
            SELECT id_area INTO fallback_area_id FROM area 
            WHERE id_city = old_area_record.id_city 
            AND gso_code IN (${allWardCodes.map(c => `'${c}'`).join(',')})
            LIMIT 1;
            new_area_id := fallback_area_id;
        END IF;
        
        -- 4. GLOBAL FALLBACK
        IF new_area_id IS NULL THEN
            new_area_id := global_fallback_area_id;
        END IF;

        IF new_area_id IS NOT NULL THEN
            UPDATE provider SET id_area = new_area_id WHERE id_area = old_area_record.id_area;
            UPDATE bookable_items SET id_area = new_area_id WHERE id_area = old_area_record.id_area;
            UPDATE point_of_interest SET id_area = new_area_id WHERE id_area = old_area_record.id_area;
        END IF;
    END LOOP;
END $$;

-- Bước 6: XÓA DỮ LIỆU CŨ CÀN QUÉT TRIỆT ĐỂ
-- Xóa POI mồ côi
DELETE FROM point_of_interest WHERE id_area NOT IN (SELECT id_area FROM area WHERE gso_code IN (${allWardCodes.map(c => `'${c}'`).join(',')}));

-- Xóa Xã/Phường cũ
DELETE FROM area WHERE gso_code IS NULL OR gso_code NOT IN (${allWardCodes.map(c => `'${c}'`).join(',')});

-- Xóa Tỉnh/Thành phố cũ
DELETE FROM cities WHERE gso_code IS NULL OR gso_code NOT IN (${provinceCodes.map(c => `'${c}'`).join(',')});

-- Bước 7: Cập nhật trạng thái chuẩn
UPDATE cities SET status = 'active' WHERE gso_code IN (${provinceCodes.map(c => `'${c}'`).join(',')});
UPDATE area SET status = 'active' WHERE gso_code IN (${allWardCodes.map(c => `'${c}'`).join(',')});
`;

    fs.writeFileSync(OUTPUT_FILE, sql);
    console.log(`\n===== HOÀN TẤT QUY TRÌNH HÀNH CHÍNH MỚI =====`);
    console.log(`- Tổng số đơn vị cấp xã: ${totalWards}`);
    console.log(`- Tình trạng: Đã xử lý di trú an toàn (Safe Fallback enabled)`);
    console.log(`- File SQL: ${OUTPUT_FILE}`);
}

generateGeographySQL();

