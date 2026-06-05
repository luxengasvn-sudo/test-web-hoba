-- ============================================================================
-- SQL Setup Schema for HOBA LPG Website Database (Supabase / PostgreSQL)
-- Paste and run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CLEANUP: Drop existing tables/types if starting fresh
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS chapter_leadership CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS website_config CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

DROP TYPE IF EXISTS business_category CASCADE;
DROP TYPE IF EXISTS member_status CASCADE;
DROP TYPE IF EXISTS doc_category CASCADE;
DROP TYPE IF EXISTS publish_status CASCADE;

-- ----------------------------------------------------------------------------
-- 2. CUSTOM TYPES
-- ----------------------------------------------------------------------------
CREATE TYPE business_category AS ENUM ('Sản xuất & Chiết nạp', 'Vận chuyển LPG', 'Phân phối & Bán lẻ', 'Dịch vụ kỹ thuật');
CREATE TYPE member_status AS ENUM ('Pending', 'Active', 'Suspended');
CREATE TYPE doc_category AS ENUM ('Quyết định', 'Thông tư', 'Quy chuẩn', 'Hướng dẫn');
CREATE TYPE publish_status AS ENUM ('Published', 'Draft');

-- ----------------------------------------------------------------------------
-- 3. TABLES CREATION
-- ----------------------------------------------------------------------------

-- A. Chapters Table
CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    region VARCHAR(50) NOT NULL, -- 'Miền Bắc', 'Miền Trung', 'Miền Nam', 'Chuyên môn'
    locations TEXT, -- e.g. 'Hà Nội, Vĩnh Phúc, Bắc Ninh'
    slogan VARCHAR(255),
    description TEXT,
    mission_text TEXT,
    mission_icon VARCHAR(50) DEFAULT 'rocket_launch',
    vision_text TEXT,
    vision_icon VARCHAR(50) DEFAULT 'visibility',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- B. Chapter Leadership Table
CREATE TABLE IF NOT EXISTS chapter_leadership (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- C. Members Table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    tax_code VARCHAR(20) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    business_type business_category NOT NULL DEFAULT 'Phân phối & Bán lẻ',
    representative_name VARCHAR(100) NOT NULL,
    representative_role VARCHAR(100) NOT NULL,
    representative_email VARCHAR(100),
    representative_phone VARCHAR(20),
    status member_status NOT NULL DEFAULT 'Pending',
    license_file_url TEXT,
    safety_file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
    association_role VARCHAR(100) DEFAULT 'Hội viên chính thức',
    chapter_role VARCHAR(100) DEFAULT NULL,
    join_date DATE DEFAULT CURRENT_DATE,
    logo_url TEXT,
    representative_avatar_url TEXT
);

-- D. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category doc_category NOT NULL DEFAULT 'Quy chuẩn',
    issuer VARCHAR(255) NOT NULL,
    file_url TEXT,
    file_size VARCHAR(50),
    publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    description TEXT
);

-- E. News Table
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'Hoạt động hiệp hội',
    status publish_status NOT NULL DEFAULT 'Draft',
    thumbnail_url TEXT,
    publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- F. Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- G. Website Config Table
CREATE TABLE IF NOT EXISTS website_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- H. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL, -- SHA-256 hash of password
    display_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'editor', -- 'super_admin' or 'editor'
    status VARCHAR(20) NOT NULL DEFAULT 'Active', -- 'Active' or 'Inactive'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 4. SEED DATA: Essential Configs & Default Accounts
-- ----------------------------------------------------------------------------

-- A. Seed Super Admin Account
-- Username: admin
-- Password: adminhoba123
-- SHA-256 of 'adminhoba123' is 'b78284b74e17b7641aced38d8a66e2533df180cb0cbcbdf3b7a9c357c0aca594'
INSERT INTO admin_users (username, password_hash, display_name, role, status)
VALUES (
    'admin', 
    'b78284b74e17b7641aced38d8a66e2533df180cb0cbcbdf3b7a9c357c0aca594', 
    'Quản trị tối cao', 
    'super_admin', 
    'Active'
) ON CONFLICT (username) DO UPDATE 
SET password_hash = EXCLUDED.password_hash, status = 'Active';

-- B. Seed Website Configs
INSERT INTO website_config (key, value) VALUES
('general', '{
  "siteName": "HOBA LPG - Hiệp hội Kinh doanh Khí hóa lỏng TP.HCM",
  "contactEmail": "info@hoba.vn",
  "contactPhone": "028 3831 6671",
  "address": "18A Cộng Hòa, P.12, Q. Tân Bình, TP.HCM",
  "maintenanceMode": false,
  "registrationOpen": true
}'),
('aboutpage', '{
  "overview": "Hiệp hội Gas đô thị và Công nghiệp TP.HCM (HOBA) là tổ chức xã hội – nghề nghiệp tự nguyện của các doanh nghiệp hoạt động trong lĩnh vực sản xuất, kinh doanh, kinh doanh LPG và các sản phẩm, dịch vụ liên quan trên địa bàn Thành phố Hồ Chí Minh.",
  "milestones": [
    {"id": "m1", "date": "12/4/2025", "title": "Hiệp hội Kinh doanh khí hóa lỏng (gas) tỉnh Bình Dương", "desc": "Mốc thời gian thành lập đầu tiên.", "icon": "flag"},
    {"id": "m2", "date": "Tháng 11", "title": "HIỆP HỘI KHÍ HÓA LỎNG THÀNH PHỐ HỒ CHÍ MINH", "desc": "Mốc thời gian đổi tên chính thức và chuyển đổi mô hình hoạt động.", "icon": "groups"}
  ]
}'),
('homepage', '{
  "headline": "KẾT NỐI VỮNG CHẮC \n PHÁT TRIỂN VƯƠN TẦM",
  "subtext": "HOBA - Ngôi nhà chung của cộng đồng doanh nghiệp LPG, cam kết đồng hành cùng sự an toàn, chuyên nghiệp và thịnh vượng của ngành năng lượng phía Nam.",
  "features": [
    {"id": "f1", "title": "Kết nối toàn diện", "desc": "Mạng lưới 150+ đơn vị cung ứng và các doanh nghiệp trong ngành gas.", "icon": "handshake"},
    {"id": "f2", "title": "Đào tạo nghiệp vụ", "desc": "Huấn luyện kỹ thuật, an toàn phòng cháy chữa cháy và quy chuẩn.", "icon": "school"}
  ],
  "sections": [
    {"id": "hero", "name": "1. Hero Banner", "visible": true},
    {"id": "news", "name": "2. News & Events", "visible": true},
    {"id": "services", "name": "3. Lĩnh vực hoạt động", "visible": true},
    {"id": "stats", "name": "4. Statistics Counter", "visible": true},
    {"id": "members", "name": "5. Hội viên tiêu biểu", "visible": true}
  ]
}'),
('memberspage', '{
  "headline": "Danh sách Hội viên Hiệp hội",
  "subtext": "Nơi quy tụ các doanh nghiệp hàng đầu trong lĩnh vực Khí dầu mỏ hóa lỏng (LPG) tại Việt Nam, cam kết vì sự phát triển bền vững và an toàn năng lượng.",
  "heroImage": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200",
  "sections": [
    {"id": "hero", "name": "1. Banner chính", "visible": true},
    {"id": "tabs", "name": "2. Danh sách Hội viên", "visible": true},
    {"id": "stats", "name": "3. Thống kê tổng hợp", "visible": true},
    {"id": "benefits", "name": "4. Quyền lợi hội viên", "visible": true},
    {"id": "steps", "name": "5. Quy trình gia nhập", "visible": true}
  ],
  "stats": [
    {"value": "64", "label": "Doanh nghiệp Hội viên", "icon": "groups"},
    {"value": "63", "label": "Tỉnh thành phủ sóng", "icon": "location_on"},
    {"value": "100%", "label": "Cam kết an toàn", "icon": "verified"},
    {"value": "2025", "label": "Năm thành lập", "icon": "calendar_today"}
  ],
  "benefits": [
    {"title": "Kết nối doanh nghiệp", "desc": "Kết nối với cộng đồng hội viên và đối tác chiến lược trong ngành LPG toàn quốc.", "icon": "hub"},
    {"title": "Cập nhật chính sách", "desc": "Cập nhật nhanh chóng chính sách, quy định pháp luật mới nhất liên quan đến khí hóa lỏng.", "icon": "update"},
    {"title": "Đào tạo chuyên môn", "desc": "Tham gia các khóa đào tạo, hội thảo chuyên đề kỹ thuật và quản lý chất lượng cao.", "icon": "school"},
    {"title": "Xúc tiến hợp tác", "desc": "Cơ hội hợp tác, mở rộng thị trường và phát triển các liên kết kinh doanh bền vững.", "icon": "rocket_launch"},
    {"title": "Hỗ trợ pháp lý", "desc": "Tư vấn, hỗ trợ pháp lý và bảo vệ quyền lợi hợp pháp của hội viên trong kinh doanh.", "icon": "gavel"},
    {"title": "Nâng cao uy tín", "desc": "Tăng uy tín và hình ảnh thương hiệu thông qua các hoạt động cộng đồng của Hiệp hội.", "icon": "verified"}
  ],
  "steps": [
    {"title": "Đăng ký hồ sơ", "desc": "Doanh nghiệp điền thông tin và nộp hồ sơ đăng ký online.", "icon": "description", "step": "01"},
    {"title": "Xét duyệt", "desc": "Ban chấp hành xem xét, thẩm định và phê duyệt hồ sơ.", "icon": "fact_check", "step": "02"},
    {"title": "Kết nối - Kích hoạt", "desc": "Kích hoạt quyền hội viên và bắt đầu các hoạt động kết nối.", "icon": "handshake", "step": "03"},
    {"title": "Tham gia cộng đồng", "desc": "Hưởng đầy đủ quyền lợi và tham gia các sự kiện của Hiệp hội.", "icon": "celebration", "step": "04"}
  ],
  "associationRoles": ["Chủ tịch", "Phó Chủ tịch", "Ban kiểm tra", "Ủy viên Ban Thường vụ", "Ủy viên Ban Chấp hành", "Hội viên chính thức", "Hội viên liên kết"]
}'),
('registerpage', '{
  "title": "Đăng Ký Hội Viên Doanh Nghiệp",
  "subtitle": "Gia nhập cộng đồng LPG Việt Nam để nâng cao tiêu chuẩn an toàn và kết nối cơ hội kinh doanh bền vững.",
  "hotline": "09090909",
  "step1Label": "Doanh nghiệp",
  "step2Label": "Người đại diện",
  "step3Label": "Hồ sơ pháp lý",
  "step4Label": "Xác nhận",
  "agreementText": "Tôi cam kết các thông tin cung cấp là chính xác và hoàn toàn chịu trách nhiệm trước pháp luật cũng như các quy định của Hội."
}'),
('hoba_website_committee_ban-chap-hanh', '{"term":"NHIỆM KỲ VII (2022 - 2027)","title":"Ban Chấp hành Hiệp hội Gas Việt Nam","subtitle":"Lãnh đạo và định hướng phát triển công nghiệp khí hóa lỏng Việt Nam hướng tới tiêu chuẩn an toàn và bền vững toàn cầu.","chairman":{"name":"Ông Nguyễn Ngọc Hòa","role":"Chủ tịch Hiệp hội","company":"Chủ tịch Hội đồng Thành viên - Công ty Đầu tư Tài chính Nhà nước TP.HCM","avatarUrl":"https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256","isVerified":true},"viceChairmen":[{"name":"Nguyễn Phước Hưng","role":"Phó Chủ tịch Thường trực","company":"Hiệp hội Doanh nghiệp TP.HCM","avatarUrl":"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256"},{"name":"Vũ Anh Khoa","role":"Phó Chủ tịch","company":"Chủ tịch HĐQT - Saigon Co.op","avatarUrl":"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256"},{"name":"Trần Phi Long","role":"Phó Chủ tịch","company":"CT.HĐTV - Tổng Công ty Công nghiệp Sài Gòn","avatarUrl":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256"},{"name":"Nguyễn Hữu Nghĩa","role":"Phó Chủ tịch","company":"CT.HĐTV - Tổng Công ty Thương mại Sài Gòn","avatarUrl":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256"}],"members":[{"name":"Nguyễn Văn Bính","role":"Ủy viên","company":"Giám đốc - Petrolimex Gas"},{"name":"Lê Thị Mai","role":"Ủy viên","company":"Tổng Giám đốc - PV GAS LPG"},{"name":"Trần Quang Tuấn","role":"Ủy viên","company":"Chủ tịch - An Bình Gas"},{"name":"Phạm Minh Đức","role":"Ủy viên","company":"GĐ Kỹ thuật - TotalEnergies Vietnam"},{"name":"Hoàng Ngọc Lan","role":"Ủy viên","company":"Trưởng ban Pháp chế - Siam Gas"}]}'),
('hoba_website_committee_ban-kiem-tra', '{"term":"NHIỆM KỲ VII (2022 - 2027)","title":"Ban Kiểm tra Hiệp hội Gas Việt Nam","subtitle":"Giám sát hoạt động, đảm bảo tính minh bạch, tuân thủ pháp luật và điều lệ hiệp hội.","chairman":{"name":"Ông Trần Văn Hùng","role":"Trưởng Ban Kiểm tra","company":"Phó Tổng Giám đốc - Công ty Gas miền Nam","avatarUrl":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256","isVerified":true},"viceChairmen":[{"name":"Lê Văn Nam","role":"Phó Trưởng Ban","company":"Trưởng phòng Pháp chế - PV GAS","avatarUrl":"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256"},{"name":"Phạm Thị Hồng","role":"Ủy viên Thường trực","company":"Giám đốc Tài chính - Petrolimex","avatarUrl":"https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256"}],"members":[{"name":"Đỗ Văn Bằng","role":"Ủy viên","company":"Kế toán trưởng - Siam Gas"},{"name":"Trần Thị Lan","role":"Ủy viên","company":"Chuyên viên Kiểm toán - Saigon Gas"},{"name":"Nguyễn Minh Hải","role":"Ủy viên","company":"GĐ Pháp chế - Total Gas"}]}'),
('hoba_website_committee_ban-thuong-vu', '{"term":"NHIỆM KỲ VII (2022 - 2027)","title":"Ban Thường vụ Hiệp hội Gas Việt Nam","subtitle":"Cơ quan thường trực chỉ đạo mọi hoạt động của Hiệp hội giữa hai kỳ họp Ban Chấp hành.","chairman":{"name":"Ông Nguyễn Ngọc Hòa","role":"Chủ tịch Hiệp hội","company":"Chủ tịch Hội đồng Thành viên - Công ty Đầu tư Tài chính Nhà nước TP.HCM","avatarUrl":"https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256","isVerified":true},"viceChairmen":[{"name":"Nguyễn Phước Hưng","role":"Ủy viên Thường vụ","company":"Hiệp hội Doanh nghiệp TP.HCM","avatarUrl":"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256"},{"name":"Vũ Anh Khoa","role":"Ủy viên Thường vụ","company":"Chủ tịch HĐQT - Saigon Co.op","avatarUrl":"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256"},{"name":"Trần Phi Long","role":"Ủy viên Thường vụ","company":"CT.HĐTV - Tổng Công ty Công nghiệp Sài Gòn","avatarUrl":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256"}],"members":[{"name":"Nguyễn Văn Bính","role":"Ủy viên Thường vụ","company":"Giám đốc - Petrolimex Gas"},{"name":"Lê Thị Mai","role":"Ủy viên Thường vụ","company":"Tổng Giám đốc - PV GAS LPG"},{"name":"Trần Quang Tuấn","role":"Ủy viên Thường vụ","company":"Chủ tịch - An Bình Gas"}]}'),
('custom_pages', '{"pages": [
  {
    "id": "intro",
    "slug": "gioi-thieu",
    "title": "Giới thiệu điều lệ Hiệp hội",
    "content": "<h2>ĐIỀU LỆ HOẠT ĐỘNG</h2><p>Điều lệ Hiệp hội quy định rõ vai trò kết nối giữa các doanh nghiệp...</p>",
    "updatedAt": "2026-06-02T10:00:00.000Z"
  }
]}'),
('featured_members', '[]'),
('events', '[]'),
('library', '[]')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ----------------------------------------------------------------------------
-- 5. SEED DATA: Mock Chapters & Members
-- ----------------------------------------------------------------------------

-- A. Mock Chapters
INSERT INTO chapters (id, name, region, locations, slogan, description, mission_text, vision_text)
VALUES
('b19d5c41-bc75-47e1-8848-038cbe22cf90', 'Chi hội Hồ Chí Minh', 'Miền Nam', 'TP. Hồ Chí Minh', 'Đoàn kết - Tiên phong', 'Chi hội đại diện khu vực TP.HCM tập hợp hơn 40 doanh nghiệp đầu mối.', 'Hỗ trợ các doanh nghiệp nâng cao năng lực cạnh tranh lành mạnh.', 'Trở thành chi hội kiểu mẫu dẫn dắt tiêu chuẩn an toàn LPG.'),
('e7db56fa-c9be-41bf-bb44-884869c9b101', 'Chi hội Bình Dương', 'Miền Nam', 'Bình Dương', 'Hợp tác phát triển', 'Tập hợp các doanh nghiệp chiết nạp, phân phối và trạm cấp tại KCN Bình Dương.', 'Đảm bảo tuân thủ an toàn phòng cháy chữa cháy trong sản xuất.', 'Phát triển bền vững gắn với an sinh xã hội khu vực Đông Nam Bộ.')
ON CONFLICT (id) DO NOTHING;

-- B. Mock Chapter Leadership
INSERT INTO chapter_leadership (chapter_id, name, position, avatar_url, order_index)
VALUES
('b19d5c41-bc75-47e1-8848-038cbe22cf90', 'Nguyễn Văn A', 'Chi hội trưởng', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256', 1),
('b19d5c41-bc75-47e1-8848-038cbe22cf90', 'Trần Văn B', 'Chi hội phó', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256', 2),
('e7db56fa-c9be-41bf-bb44-884869c9b101', 'Lê Văn C', 'Chi hội trưởng', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256', 1)
ON CONFLICT (id) DO NOTHING;

-- C. Mock Members
INSERT INTO members (company_name, tax_code, address, phone, email, business_type, representative_name, representative_role, representative_email, representative_phone, status, association_role, chapter_id, join_date)
VALUES 
('Saigon Petro', '0300621215', '444-446 Cách Mạng Tháng Tám, P.11, Q.3, TP.HCM', '028 3831 6671', 'info@saigonpetro.vn', 'Phân phối & Bán lẻ', 'Nguyễn Văn A', 'Giám đốc', 'ceo@saigonpetro.vn', '0901234567', 'Active', 'Ủy viên Ban Chấp hành', 'b19d5c41-bc75-47e1-8848-038cbe22cf90', '2025-01-15'),
('VT-Gas', '3700412356', 'KCN Đồng An, Thuận An, Bình Dương', '0274 374 3111', 'contact@vtgas.com.vn', 'Sản xuất & Chiết nạp', 'Trần Văn B', 'Trưởng phòng KD', 'sales@vtgas.com.vn', '0902345678', 'Active', 'Hội viên chính thức', 'e7db56fa-c9be-41bf-bb44-884869c9b101', '2025-02-10'),
('Alpha Gas Solutions', '0314569871', '120 Nguyễn Thị Minh Khai, Q.3, TP.HCM', '028 7300 1234', 'info@alphagas.vn', 'Dịch vụ kỹ thuật', 'Lê Văn C', 'Đại diện pháp luật', 'ccontact@alphagas.vn', '0903456789', 'Pending', 'Hội viên chính thức', NULL, '2026-06-04')
ON CONFLICT (tax_code) DO NOTHING;

-- D. Mock Documents
INSERT INTO documents (code, title, category, issuer, file_size, publish_date, description)
VALUES
('QCVN 08:2026/BCT', 'Quy chuẩn kỹ thuật quốc gia về an toàn trạm nạp khí hóa lỏng (LPG)', 'Quy chuẩn', 'Bộ Công Thương', '2.4 MB', '2026-04-20', 'Áp dụng cho tất cả các trạm nạp LPG trực thuộc hiệp hội.'),
('Thông tư 12/2026/BXD', 'Quy định về an toàn phòng cháy chữa cháy đối với hệ thống gas đô thị', 'Thông tư', 'Bộ Xây dựng', '1.8 MB', '2026-03-15', 'Hướng dẫn kiểm tra an toàn hệ thống gas đô thị.'),
('Nghị định 87/2026/NĐ-CP', 'Quy định về điều kiện kinh doanh khí gas và các biện pháp bảo đảm an toàn', 'Quyết định', 'Chính phủ', '3.1 MB', '2026-02-01', 'Cơ sở pháp lý hoạt động kinh doanh gas.')
ON CONFLICT (code) DO NOTHING;

-- E. Mock News Articles
INSERT INTO news (title, description, content, category, status, thumbnail_url, publish_date, is_featured)
VALUES
('Cập nhật xu hướng thị trường LPG khu vực phía Nam 2026', 'Phân tích chuyên sâu về biến động cung cầu, giá gas thế giới và tác động đến các trạm chiết nạp.', '<p>Chi tiết nội dung phân tích thị trường...</p>', 'Bản tin chuyên ngành', 'Published', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400', '2026-05-10', true),
('Tăng cường tiêu chuẩn an toàn trong hệ thống chiết nạp', 'Hướng dẫn kiểm tra định kỳ hệ thống van an toàn bồn chứa LPG.', '<p>Chi tiết bài hướng dẫn kỹ thuật an toàn...</p>', 'Kỹ thuật - An toàn', 'Published', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400', '2026-05-06', false)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. SECURITY CONFIGURATION: Row-Level Security (RLS)
-- ----------------------------------------------------------------------------
-- Note: Since the Next.js static site operates fully client-side and queries
-- Supabase using the public anon client, RLS is disabled on these tables
-- to allow the admin panel to perform inserts/updates without needing Supabase Auth.
ALTER TABLE website_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE news DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE chapters DISABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_leadership DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;


