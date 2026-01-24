import ResponsiveImage from "~/components/common/ResponsiveImage";

export default function ProductCardImage({ product }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
      <ResponsiveImage
        src={product.image?.url}
        alt={product.name}
        thumbSize={240}
        fullSize={600}
        sizes="(max-width: 768px) 50vw, 240px"
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      />

      {product.sold > 10 && (
        <span className="absolute top-3 left-3 bg-[#c4cd38] text-white text-xs font-bold px-3 py-1 rounded-lg">
          BÁN CHẠY
        </span>
      )}
    </div>
  );
}
