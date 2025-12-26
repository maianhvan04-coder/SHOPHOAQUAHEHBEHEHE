import { FaHandPointRight } from "react-icons/fa";
import trai_cay_cat_san from "../../../../assets/trai_cay_cat_san.png";


const FruitHeroSection = () => {
  return (
    <section className="mt-15 bg-[#e8f0ed] py-15 lg:py-20">
    
      <div className="flex flex-col-reverse lg:flex-row gap-10 w-[90vw] lg:w-[85vw] mx-auto relative">
       
        <div className="hidden lg:block bg-[#f9db9e] absolute w-40 h-10 -top-[25%] left-10 z-0"></div>

       
        <div
          className="
          relative lg:absolute 
          mx-auto lg:mx-0
          -mt-6 lg:mt-0 
          top-0
          lg:-top-[25%] 
          size-32 lg:size-40 p-5 
          bg-[#f6c35e] 
          flex flex-col justify-center items-center 
          z-10 shadow-sm
        "
        >
          <p className="font-bold text-3xl lg:text-4xl text-gray-900 leading-none">
            100
          </p>
          <span className="font-comming-soon text-2xl lg:text-3xl text-gray-800">
            Organic
          </span>
        </div>

        {/* --- NỘI DUNG CHỮ (Giữ nguyên w-2/5) --- */}
        <div className="w-full lg:w-2/5 mt-8 lg:mt-18 space-y-3 text-center lg:text-left">
          <h3 className="text-3xl lg:text-5xl lg:space-y-3 leading-tight">
            <p className="font-bold text-[#49a760]">Trái Cây Cắt Sẵn</p>
            <p className="text-gray-800">Tươi Sạch, Giao Nhanh</p>
          </h3>

          <div className="text-[#908e89] space-y-4 text-sm lg:text-md leading-relaxed">
            <p>

              Với Nhà Joy, bạn không chỉ ăn một loại trái cây đơn điệu, mà được
              thưởng thức cả “bữa tiệc sắc màu”: dưa hấu ngọt mát, xoài thơm
              lừng, kiwi chua nhẹ, nho giòn căng mọng… thậm chí có cả những loại
              trái cây nhập khẩu xịn sò, thường ngày mua lẻ thì khá “xót ví”.
            </p>


            <p>
              Nhờ combo mix thông minh, bạn vừa được trải nghiệm nhiều hương vị
              khác nhau trong cùng một hộp, vừa tiết kiệm hơn rất nhiều so với
              mua từng loại riêng lẻ.
              <br className="hidden lg:block" />
              <span className="inline-block mt-2">
                <FaHandPointRight className="inline text-yellow-500 mr-2" />
                Một hộp trái cây = nhiều lựa chọn + nhiều vitamin + nhiều niềm
                vui.
              </span>
            </p>
          </div>

         <button className="!w-full !md:w-auto !border-0 !uppercase !font-bold !text-white !bg-[#ff9100] !hover:brightness-110 !transition-all !rounded-lg !py-3 !px-10 !shadow-md">
  Mua ngay
</button>

        </div>

        {/* --- HÌNH ẢNH (Giữ nguyên w-3/5) --- */}
        <div className="w-full lg:w-3/5">
          <img
            src={trai_cay_cat_san}
            alt="hero banner"
            className="w-full h-auto object-contain"
          />

        </div>
      </div>
    </section>
  );
};

export default FruitHeroSection;
