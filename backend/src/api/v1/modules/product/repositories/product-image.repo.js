const ProductImage = require("../models/product.image.model");
const { generateProductImageAlt } = require("../../../../../utils/seo/imageAlt.helper");
exports.insertMany = async (productId, images, product, session) => {
    if (!Array.isArray(images) || images.length === 0) {
        return;
    }
    const validImages = images.filter(
        (img) => img?.url && img?.publicId
    );

    if (!validImages.length) return;
    // 3Build documents
    const docs = images.map((img, index) => ({
        product: productId,
        url: img.url,
        publicId: img.publicId,
        width: img.width,
        height: img.height,
        order: index,
        isPrimary: index === 0,
        alt: generateProductImageAlt({
            productName: product?.name,
            categoryName: product?.category?.name,
            attributes: ["tươi", "nhập khẩu"],
        }),
    }));

    await ProductImage.insertMany(docs, { session });
};

exports.replaceAll = async (productId, images, product, session) => {
    // 1Xoá toàn bộ ảnh cũ
    console.log(images)
    await ProductImage.deleteMany(
        { product: productId },
        { session }
    );

    // 2hông có ảnh mới → kết thúc
    if (!Array.isArray(images) || images.length === 0) {
        return;
    }
    const validImages = images.filter(
        (img) => img?.url && img?.publicId
    );

    if (!validImages.length) return;

    // 3Build documents
    const docs = images.map((img, index) => ({
        product: productId,
        url: img.url,
        publicId: img.publicId,
        width: img.width,
        height: img.height,
        order: index,
        isPrimary: index === 0,
        alt: generateProductImageAlt({
            productName: product?.name,
            categoryName: product?.category?.name,
            attributes: ["tươi", "nhập khẩu"],
        }),
    }));

    // 4️⃣ Insert mới (WITH SESSION)
    await ProductImage.insertMany(docs, { session });
};

exports.findByProductId = (productId) => ProductImage.find({
    product: productId
}).sort({ order: 1 }).lean()


exports.findPrimaryByProductId = (productId) =>
    ProductImage.findOne({ product: productId })
        .sort({ isPrimary: -1, order: 1, createdAt: 1 })
        .select("url publicId")
        .lean();

exports.findAllByProductId = (productId) =>
    ProductImage.find({ product: productId })
        .sort({ isPrimary: -1, order: 1, createdAt: 1 })
        .select("url publicId alt title order isPrimary")
        .lean();
