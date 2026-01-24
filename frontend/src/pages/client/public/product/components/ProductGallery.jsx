import { useMemo, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import {
  getThumb,
  getImage,
  getImageLarge,
} from "~/shared/utils/image.helpers";

export default function ProductGallery({ product }) {
  const [activeImage, setActiveImage] = useState(null);
  const [imageTransition, setImageTransition] = useState(false);

  // Gộp images (support cả image + images[])
  const images = useMemo(() => {
    if (!product) return [];
    if (product.images?.length) return product.images;
    if (product.image) return [product.image];
    return [];
  }, [product]);

  // Set ảnh đầu tiên khi product load
  useEffect(() => {
    if (images.length && !activeImage) {
      setActiveImage(images[0].url);
    }
  }, [images, activeImage]);

  if (!product || !images.length) return null;

  const currentIndex = images.findIndex(
    (img) => img.url === activeImage
  );

  const handlePrevImage = () => {
    setImageTransition(true);
    const newIndex =
      currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    setActiveImage(images[newIndex].url);
    setTimeout(() => setImageTransition(false), 300);
  };

  const handleNextImage = () => {
    setImageTransition(true);
    const newIndex =
      currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    setActiveImage(images[newIndex].url);
    setTimeout(() => setImageTransition(false), 300);
  };

  const handleThumbnailClick = (url) => {
    if (url !== activeImage) {
      setImageTransition(true);
      setActiveImage(url);
      setTimeout(() => setImageTransition(false), 300);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* MAIN IMAGE */}
      <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden group">
        <img
          src={getImage(activeImage, 1200)}
          alt={`Mua ${product.name} chính hãng`}
          loading="eager"
          className={`w-full h-full object-cover cursor-zoom-in transition-all duration-300 ${
            imageTransition
              ? "opacity-0 scale-95"
              : "opacity-100 scale-100"
          }`}
          onClick={() =>
            window.open(getImageLarge(activeImage), "_blank")
          }
        />

        {/* Badge */}
        <div className="absolute top-4 left-4 bg-[#153a2e] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
          {product.sold > 10 ? "BÁN CHẠY" : "NEW"}
        </div>

        {/* Expand Icon */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-white">
          <Expand className="w-5 h-5 text-gray-700" />
        </div>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>

            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 active:scale-95"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </>
        )}

        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* THUMBNAILS */}
      {images.length > 1 && (
        <div className="flex justify-center gap-3 px-4">
          {images.map((img, index) => {
            const isActive = img.url === activeImage;

            return (
              <button
                key={img._id || img.url}
                onClick={() => handleThumbnailClick(img.url)}
                className={`w-[78px] h-[78px] rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                  isActive
                    ? "border-[#153a2e] ring-2 ring-[#153a2e] ring-offset-2 scale-105"
                    : "border-gray-200 hover:border-[#153a2e] hover:scale-105 active:scale-95"
                }`}
              >
                <img
                  src={getThumb(img.url, 160)} // UI 78px → load 160px
                  alt={`${product.name} ${index + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
