import favorite_icon from "../../../../assets/icons/favorite_icon.png";

const ProductComponent = ({ img, num, title, description, showDetails }) => {
  return (
    <div
      onClick={showDetails}
      className="bg-white w-full max-w-[280px] md:min-w-[240px] rounded-xl relative shadow-md overflow-hidden flex-shrink-1 transition-all hover:shadow-xl cursor-pointer"
    >
      {/* 1. PHẦN ẢNH - Cố định chiều cao */}
      <div className="h-[250px] md:h-[300px] overflow-hidden relative">
        <img
          src={img}
          alt={title}
          className="block w-full h-full object-cover"
        />
      </div>

      {/* 2. HỘP SỐ - Neo bằng TOP để luôn nằm đúng vị trí mép ảnh */}
      {/* - Mobile: Ảnh cao 250px -> top 220px (đè lên mép ảnh 30px)
          - Desktop (md): Ảnh cao 300px -> top 270px 
      */}
      <div className="bg-[#c4cd38] rounded-lg absolute top-[220px] md:top-[270px] right-5 text-white font-montserrat text-3xl font-extrabold size-15 flex items-center justify-center shadow-md z-10">
        {num+1<10?(`0${num+1}`):(num+1)}
      </div>

      {/* 3. PHẦN NỘI DUNG - Chiều cao co giãn tùy ý mà không ảnh hưởng hộp số */}
      <div className="p-4 md:p-5 space-y-4">
        <h3 className="font-bold uppercase text-base md:text-lg text-gray-800 line-clamp-1">
          {title}
        </h3>
        <p className="text-[#908e89] text-xs md:text-sm line-clamp-2">
          {description}
        </p>

        <div className="flex justify-between items-center gap-2">
          <button className="cursor-pointer uppercase font-bold text-[10px] md:text-xs border-2 rounded-3xl border-amber-600 w-full max-w-[180px] py-2 px-1 hover:bg-amber-600 hover:text-white transition-colors">
            Mua ngay
          </button>
          <div className="inline-flex cursor-pointer size-8 shrink-0 rounded-full border-2 border-[var(--color-green-button)] justify-center items-center hover:bg-green-50 transition-colors">
            <img src={favorite_icon} alt="icon" className="size-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComponent;
