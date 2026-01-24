
/**
 * Admin – Template List
 * Dùng cho màn hình danh sách
 */
exports.adminTemplateListDTO = (doc) => ({
    id: doc._id,
    type: doc.type,
    activeVersion: doc.activeVersion,
    versionCounter: doc.versionCounter,
    isActive: doc.isActive,
    updatedAt: doc.updatedAt,
});

/**
 * Admin – Template Detail
 * Dùng khi admin click vào 1 template
 */
exports.adminTemplateDetailDTO = (doc) => ({
    id: doc._id,
    type: doc.type,
    activeVersion: doc.activeVersion,
    versionCounter: doc.versionCounter,
    isActive: doc.isActive,
    versions: doc.versions.map((v) => ({
        version: v.version,
        title: v.title,
        createdBy: v.createdBy,
        createdAt: v.createdAt,
    })),
});

/**
 * Admin – Version Detail
 * Dùng khi xem chi tiết 1 version
 */
exports.adminVersionDetailDTO = (version) => ({
    version: version.version,
    title: version.title,
    intro: version.intro,
    sections: version.sections,
    createdBy: version.createdBy,
    createdAt: version.createdAt,
});

/**
 * Admin – Create Template Response
 */
exports.adminCreateTemplateDTO = (doc) => ({
    id: doc._id,
    type: doc.type,
    activeVersion: doc.activeVersion,
    versionCounter: doc.versionCounter,
    isActive: doc.isActive,
});

/**
 * Admin – Create Version Response
 */
exports.adminCreateVersionDTO = (doc) => ({
    type: doc.type,
    newVersion: doc.versionCounter,
    activeVersion: doc.activeVersion,
    versionCounter: doc.versionCounter,
});

// backend/src/shared/mappers/product/product-edit.mapper.js

exports.toProductEditResponse = ({
    product,
    inventory,
    images,
    description,
}) => {

    return {
        _id: product._id,
        name: product.name,
        slug: product.slug,

        category: product.category
            ? {
                _id: product.category._id || product.category,
                name: product.category.name,
            }
            : null,

        price: product.price,
        unit: product.unit,

        isFeatured: product.isFeatured,
        featuredRank: product.featuredRank,

        inventory: {
            stock: inventory?.stock || 0,
            sold: inventory?.sold || 0,
        },

        images: (images || []).map((img) => ({
            _id: img._id,
            url: img.url,
            publicId: img.publicId,
            order: img.order,
        })),

        description: description
            ? {
                templateType: description.templateType,
                templateVersion: description.templateVersion,
                description: description.description || "",
                overrides: description.overrides || {},
            }
            : null,
    };
};


// backend/src/shared/mappers/product/product-admin-list.mapper.js

exports.toAdminProductListItem = ({
    product,
    inventory,
}) => {
    return {
        _id: product._id,

        name: product.name,
        slug: product.slug,

        image: product.image
            ? {
                url: product.image.url,
                publicId: product.image.publicId,
            }
            : null,

        category: product.category
            ? {
                _id: product.category._id,
                name: product.category.name,
            }
            : null,

        createdBy: product.createdBy
            ? {
                _id: product.createdBy._id,
                fullName: product.createdBy.fullName,
                email: product.createdBy.email,
                image: product.createdBy.image || null,
            }
            : null,

        price: product.price,
        unit: product.unit,

        stock: inventory?.stock ?? 0,
        sold: inventory?.sold ?? 0,

        isActive: product.isActive,
        isFeatured: product.isFeatured,
        featuredRank: product.featuredRank,

        createdAt: product.createdAt,
    };
};


// shared/dto/product/client-product-list.dto.js
exports.toClientProductListItem = ({ product }) => ({
    _id: product._id,

    name: product.name,
    slug: product.slug,

    price: product.price,

    image: product.image
        ? {
            url: product.image.url,
        }
        : null,

    category: {
        name: product.category.name,
        slug: product.category.slug,
    },

    inventory: {
        stock: product.inventory?.stock ?? 0,
        sold: product.inventory?.sold ?? 0,
    },
});


