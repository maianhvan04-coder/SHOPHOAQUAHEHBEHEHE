# Images Folder

## 📁 Cấu trúc thư mục

Đặt tất cả hình ảnh của website vào thư mục này.

### Cấu trúc đề xuất:

```
images/
├── products/           # Hình ảnh sản phẩm
│   ├── buoi-hong.webp
│   ├── nhan.webp
│   ├── roi-do.webp
│   ├── cam.webp
│   ├── dua-luoi.webp
│   ├── xoai.webp
│   └── ...
├── hero/               # Hình ảnh hero section
│   └── hero-banner.webp
├── mix-boxes/          # Hình ảnh hộp mix
│   ├── mix-3.webp
│   ├── mix-4.webp
│   └── mix-5.webp
├── icons/              # Icons và logos
│   ├── logo.svg
│   └── favicon.ico
└── testimonials/       # Hình ảnh khách hàng (optional)
    └── avatars/
```

## 🎨 Hướng dẫn tối ưu hóa hình ảnh

### 1. Định dạng
- **WebP**: Ưu tiên sử dụng cho photos (kích thước nhỏ, chất lượng cao)
- **SVG**: Sử dụng cho icons và logos
- **PNG**: Chỉ dùng khi cần background trong suốt
- **JPG**: Fallback cho trình duyệt cũ

### 2. Kích thước đề xuất
- **Product images**: 400x400px (square)
- **Hero banner**: 1920x1080px
- **Mix boxes**: 600x450px
- **Thumbnails**: 200x200px

### 3. Tối ưu hóa
- Nén hình ảnh trước khi upload
- Sử dụng tools: TinyPNG, Squoosh, ImageOptim
- Target file size: < 100KB cho product images

### 4. Naming convention
- Sử dụng lowercase
- Phân cách bằng dấu gạch ngang (-)
- Tên mô tả rõ ràng
- Ví dụ: `buoi-hong-organic.webp`

## 🔄 Thay thế Placeholder Images

Hiện tại website đang sử dụng images từ Unsplash. Để thay thế:

1. Tải hình ảnh sản phẩm thực tế
2. Tối ưu hóa theo hướng dẫn trên
3. Đổi tên file theo convention
4. Upload vào folder tương ứng
5. Cập nhật `src` trong file `index.html`

### Ví dụ:

```html
<!-- Trước (Unsplash placeholder) -->
<img src="https://images.unsplash.com/photo-1570913149827..." alt="Bưởi Hồng">

<!-- Sau (local image) -->
<img src="./assets/images/products/buoi-hong.webp" alt="Bưởi Hồng">
```

## 📝 Checklist

- [ ] Logo JoyGreen (SVG hoặc PNG)
- [ ] Favicon (16x16, 32x32, 64x64)
- [ ] Hero banner image
- [ ] 15 product images (Latest Products section)
- [ ] 4 best seller images
- [ ] 3 mix box images
- [ ] Icons cho benefits section (optional)
- [ ] Background images (optional)

## 🚀 Tips

- Sử dụng CDN cho performance tốt hơn
- Enable lazy loading (đã có sẵn trong code)
- Tạo responsive images với `srcset`
- Thêm alt text mô tả cho SEO

---

**Note**: Hiện tại folder này trống. Hãy thêm hình ảnh theo hướng dẫn trên.

