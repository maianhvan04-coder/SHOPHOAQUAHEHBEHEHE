import hoa_qua_mix from "../../../../assets/hoa_qua_mix.png";
const MixMenuSection = () => {
  return (
    <section className="mt-10 lg:mt-20 bg-[#fafafa] overflow-hidden">
      {/* HEADER: Chỉnh text nhỏ lại trên mobile để không vỡ dòng */}
      <div className="text-center space-y-2 px-4">
        <p className="text-[#49a760] text-xl lg:text-2xl font-comming-soon">
          Trái Cây Mix
        </p>
        <h3 className="font-bold text-3xl md:text-5xl lg:text-6xl uppercase leading-tight">
          hoa quả mix
        </h3>
      </div>

      {/* ẢNH MIX: Giữ mt-25 trên desktop, giảm mt trên mobile */}
      <div className="mt-10 lg:mt-25 bg-transparent">
        <img 
          className="w-full h-auto object-contain" 
          src={hoa_qua_mix} 
          alt="mix menu" 
        />
      </div>

      {/* FOOTER & BUTTON */}
      <div className="flex justify-center px-4 pt-8 pb-15 lg:pb-25 bg-[#f0f0f0]">
        <button className="
          bg-[var(--color-green-text)] 
          text-lg md:text-2xl lg:text-4xl 
          px-6 md:px-10 lg:px-15 
          py-4 lg:py-8 
          rounded-xl lg:rounded-2xl 
          uppercase font-bold text-white 
          shadow-xl hover:brightness-110 transition-all 
          w-full md:w-auto
          max-w-[1200px]
        ">
          chọn hoa quả mà bạn yêu thích nhé
        </button>
      </div>
    </section>
  );
};

export default MixMenuSection;

