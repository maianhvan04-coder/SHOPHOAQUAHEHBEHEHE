const mongoose = require("mongoose");
const { makeSlug } = require("../../../../../helpers/makeSlug.js");
const {
  parsePagination,
  parseBoolean,
} = require("../../../../../helpers/query.util.js.js");
const { buildProductSort } = require("../helper/product.sort.js");
const ApiError = require("../../../../../core/ApiError.js");
const httpStatus = require("../../../../../core/httpStatus.js");


const productRepo = require("../repositories/product.repo.js");
const categoryRepo = require("../../category/category.repo.js");
const InventoryRepo = require("../repositories/product-inventory.repo.js")
const DescriptionRepo = require("../repositories/product-description.repo.js")
const ImageRepo = require("../repositories/product-image.repo.js")

const Category = require("../../category/category.model.js");
const Product = require("../models/product.model.js");
const assertOwnership = require("../helper/assertOwnership.helper.js");
const checkId = require("../../../../../utils/checkId");
const TemplateRepo = require("../repositories/template.repository.js")
const { toProductEditResponse, toAdminProductListItem, toClientProductListItem } = require("../dtos/template.admin.dto.js")

const { mergeTemplateWithOverrides } = require(
  "../../../../../shared/description/mergeTemplateWithOverrides"
);
exports.createProduct = async (payload, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, description, images, inventory } = payload;
    const categoryId = payload.categoryId || payload.category;

    checkId(categoryId, "Danh mục");
    checkId(userId, "Người dùng");

    /* ===== VALIDATE CATEGORY ===== */
    const cat = await categoryRepo.findByIdAdmin(categoryId);
    if (!cat) {
      throw new ApiError(httpStatus.NOT_FOUND, "Danh mục không tồn tại");
    }

    /* ===== CHECK SLUG ===== */
    const slug = makeSlug(name);
    const existed = await productRepo.findAnyByIdSlug(slug);
    if (existed && !existed.isDeleted) {
      throw new ApiError(httpStatus.CONFLICT, "Sản phẩm đã tồn tại");
    }

    /* ===== FALLBACK IMAGE ===== */
    let coverImage = payload.image;
    if (!coverImage && Array.isArray(images) && images.length) {
      coverImage = images[0];
    }

    /* ===== CREATE PRODUCT ===== */
    const product = await productRepo.create(
      {
        name,
        slug,
        category: categoryId,
        price: payload.price,
        unit: payload.unit,
        isFeatured: payload.isFeatured,
        featuredRank: payload.featuredRank,
        image: coverImage,
        createdBy: userId,
      },
      session
    );

    /* ===== SUB DOMAINS ===== */

    if (inventory) {
      await InventoryRepo.create(product._id, inventory, session);
    }



    if (description) {

      await DescriptionRepo.upsert(
        product._id,
        description,
        session
      );
    }

    if (Array.isArray(images) && images.length) {
      await ImageRepo.insertMany(product._id, images, product, session);
    }

    await session.commitTransaction();
    return product;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};


exports.productAdminUpdate = async (
  authz,
  userId,
  productId,
  payload
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    checkId(userId, "Người dùng");
    checkId(productId, "Sản phẩm");

    const { scope, field = "createdBy" } = authz;

    /* ===== LOAD PRODUCT ===== */
    const current =
      await productRepo.findByIdAdmin(productId);

    if (!current || current.isDeleted) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Không tìm thấy sản phẩm"
      );
    }

    /* ===== OWNERSHIP CHECK ===== */

    if (scope !== "all") {
      assertOwnership({
        scope,
        entity: current,
        userId,
        field,
      });
    }

    /* ===== CATEGORY ===== */
    if (payload.category || payload.categoryId) {
      const categoryId =
        payload.categoryId || payload.category;

      checkId(categoryId, "Danh mục");

      const cat =
        await categoryRepo.findByIdAdmin(categoryId);

      if (!cat) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "Danh mục không tồn tại"
        );
      }

      payload.category = categoryId;
    }

    /* ===== SLUG (OPTIONAL) ===== */
    if (
      payload.name &&
      payload.name !== current.name
    ) {
      const slug = makeSlug(payload.name);

      const existed =
        await productRepo.findAnyByIdSlug(slug);

      if (
        existed &&
        existed._id.toString() !== productId &&
        !existed.isDeleted
      ) {
        throw new ApiError(
          httpStatus.CONFLICT,
          "Tên sản phẩm đã tồn tại"
        );
      }

      payload.slug = slug;
    }

    /* ===== FALLBACK IMAGE ===== */
    if (
      !payload.image &&
      Array.isArray(payload.images) &&
      payload.images.length
    ) {
      payload.image = payload.images[0];
    }

    /* ===== UPDATE PRODUCT ===== */
    const updatedProduct =
      await productRepo.updateById(
        productId,
        {
          name: payload.name,
          slug: payload.slug,
          category: payload.category,
          unit: payload.unit,
          price: payload.price,
          isFeatured: payload.isFeatured,
          featuredRank: payload.featuredRank,

          updatedBy: userId,
        },
        session
      );

    /* ===== SUB DOMAINS ===== */

    if (payload.inventory) {
      await InventoryRepo.upsert(
        productId,
        payload.inventory,
        session
      );
    }

    if (payload.description) {
      await DescriptionRepo.upsert(
        productId,
        payload.description,
        session
      );
    }

    if (Array.isArray(payload.images)) {
      await ImageRepo.replaceAll(
        productId,
        payload.images,
        updatedProduct,
        session
      );
    }

    await session.commitTransaction();
    return updatedProduct;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};


exports.productAdminList = async (query, user) => {
  const { permissions } = user;
  const authz = permissions["product:read"];

  if (!authz) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Không có quyền xem sản phẩm"
    );
  }

  const { limit, page } = parsePagination(query);
  // const { isDeleted } = query;
  const search = query.search?.trim();
  const category = query.category;
  let isActive = parseBoolean(query.isActive);

  const filter = { isDeleted: false };

  if (authz.scope === "own") {
    filter.createdBy = user.sub;
  }

  if (typeof isActive === "boolean") filter.isActive = isActive;
  if (category && mongoose.Types.ObjectId.isValid(category))
    filter.category = category;

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  const sort = buildProductSort(query.sort);

  const { items, total } =
    await productRepo.listAdminProduct({
      page,
      limit,
      filter,
      sort,
    });

  return {
    items: items.map((row) =>
      toAdminProductListItem({
        product: row,
        inventory: row.inventory,
      })
    ),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


exports.softDelete = async (id) => {
  const deleted = await productRepo.softDeleteById(id);
};

exports.adminGetByIdForEdit = async (productId) => {
  checkId(productId, "Sản Phẩm")

  const product =
    await productRepo.findByIdAdmin(productId);
  if (!product || product.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy sản phẩm");
  }
  /* ===== SUB DOMAINS ===== */

  const [
    inventory,
    images,
    description,
  ] = await Promise.all([
    InventoryRepo.findByProductId(productId),
    ImageRepo.findByProductId(productId),
    DescriptionRepo.findByProductId(productId),
  ]);
  console.log(inventory)
  // console.log(product)
  return toProductEditResponse({ product, inventory, images, description });
};

exports.getAllProductsForClient = async ({
  search,
  sort,
  page = 1,
  limit = 15,
  category,
}) => {
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  /* ================= FILTER ================= */
  const filter = {
    isDeleted: false,
    isActive: true,
  };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  /* ================= CATEGORY ================= */
  if (category && category !== "all") {
    const cat = await Category.findOne({
      slug: category,
      isActive: true,
      isDeleted: false,
    }).select("_id");

    if (!cat) {
      return {
        products: [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: 0,
          totalPages: 0,
        },
      };
    }

    filter.category = cat._id;
  }

  /* ================= SORT ================= */
  const sortMap = {
    name_asc: { name: 1 },
    name_desc: { name: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
  };

  const finalSort = sortMap[sort] || { createdAt: -1 };

  /* ================= QUERY ================= */
  const { items, total } =
    await productRepo.listClientProducts({
      filter,
      sort: finalSort,
      skip,
      limit: limitNum,
    });

  return {
    products: items.map((row) =>
      toClientProductListItem({
        product: row,
      })
    ),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

exports.adminChangeStatus = async (id, isActive) => {
  console.log("isActive", isActive);
  const updated = await productRepo.updateById(id, { isActive });
  if (!updated)
    throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy sản phẩm");
  return updated;
};

exports.setFeatured = async (id, { isFeatured, featuredRank }) => {
  const payload = { isFeatured };

  if (typeof featuredRank === "number") payload.featuredRank = featuredRank;
  else payload.featuredRank = isFeatured ? 1 : 0;

  const updated = await productRepo.updateById(id, payload);
  if (!updated)
    throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy sản phẩm");
  return updated;
};

module.exports.getProductByIdService = async (_id) => {
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return {
      EC: 1,
      EM: "ID sản phẩm không hợp lệ",
      DT: null,
    };
  }

  try {
    const product = await Product.findById(_id)
      .populate("category", "name")
      .select("-__v");

    if (!product) {
      return {
        EC: 2,
        EM: "Không tìm thấy sản phẩm",
        DT: null,
      };
    }

    return {
      EC: 0,
      EM: "Lấy chi tiết sản phẩm thành công",
      DT: product,
    };
  } catch (error) {
    console.log("getProductByIdService error:", error);
    return {
      EC: -1,
      EM: "Lỗi server khi lấy chi tiết sản phẩm",
      DT: null,
    };
  }
};

exports.getProductBySlugService = async (slug) => {
  try {
    const product = await Product.findOne({
      slug,
      isDeleted: false,
      isActive: true,
    })
      .populate("category", "name slug isActive isDeleted")
      .lean();

    if (
      !product ||
      product.category?.isDeleted ||
      !product.category?.isActive
    ) {
      return {
        EC: 2,
        EM: "Sản phẩm không tồn tại",
        DT: null,
      };
    }

    const [
      inventory,
      images,
      description,
    ] = await Promise.all([
      InventoryRepo.findByProductId(product._id),
      ImageRepo.findAllByProductId(product._id), // ✅ ARRAY
      DescriptionRepo.findByProductId(product._id),
    ]);

    /* ================= MERGE DESCRIPTION ================= */
    let mergedDescription = null;

    if (description) {
      const template = await TemplateRepo.getByType(
        description.templateType
      );

      mergedDescription = mergeTemplateWithOverrides(
        template,
        description
      );
    }

    /* ================= IMAGE ================= */
    const primaryImage = images?.[0] || null;

    /* ================= SEO ================= */
    const seoDescription =
      mergedDescription?.intro
        ?.replace(/<[^>]*>/g, "")
        ?.slice(0, 160) ||
      product.name;

    return {
      EC: 0,
      EM: "Lấy chi tiết sản phẩm thành công",
      DT: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        unit: product.unit,

        /* ===== IMAGE ===== */
        image: primaryImage
          ? {
            url: primaryImage.url,
            publicId: primaryImage.publicId,
          }
          : null,

        images: images.map((img) => ({
          _id: img._id,
          url: img.url,
          publicId: img.publicId,
          isPrimary: img.isPrimary,
        })),

        /* ===== CATEGORY ===== */
        category: {
          name: product.category.name,
          slug: product.category.slug,
        },

        /* ===== INVENTORY ===== */
        inventory: {
          stock: inventory?.stock ?? 0,
          sold: inventory?.sold ?? 0,
        },

        /* ===== SEO ===== */
        seo: {
          title: `${product.name} – ${product.category.name}`,
          description: seoDescription,
          image: primaryImage?.url || null,
        },

        /* ===== DESCRIPTION (MERGED) ===== */
        description: mergedDescription,
      },
    };
  } catch (error) {
    console.error("getProductBySlugService", error);
    return {
      EC: -1,
      EM: "Lỗi server khi lấy chi tiết sản phẩm",
      DT: null,
    };
  }
};

module.exports.getTopBestSellerProductsService = async (limit = 4) => {
  try {
    const products = await Product.aggregate([
      { $match: { isDeleted: false, isActive: true } },

      /* INVENTORY */
      {
        $lookup: {
          from: "productinventories",
          localField: "_id",
          foreignField: "product",
          as: "inventory",
        },
      },
      { $unwind: { path: "$inventory", preserveNullAndEmptyArrays: true } },

      /* CATEGORY */
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $match: {
          "category.isActive": true,
          "category.isDeleted": false,
        },
      },

      /* IMAGE */
      {
        $lookup: {
          from: "productimages",
          let: { productId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$product", "$$productId"] } } },
            { $sort: { isPrimary: -1, order: 1 } },
            { $limit: 1 },
            { $project: { url: 1 } },
          ],
          as: "image",
        },
      },
      { $unwind: { path: "$image", preserveNullAndEmptyArrays: true } },

      /* SORT */
      { $sort: { "inventory.sold": -1 } },
      { $limit: limit },

      /* DTO */
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          price: 1,
          sold: "$inventory.sold",
          image: "$image",
          category: {
            _id: "$category._id",
            name: "$category.name",
          },
        },
      },
    ]);

    return {
      EC: 0,
      EM: "Lấy sản phẩm bán chạy thành công",
      DT: products,
    };
  } catch (error) {
    console.error("getTopBestSellerProductsService", error);
    return { EC: -1, EM: "Lỗi server", DT: [] };
  }
};

