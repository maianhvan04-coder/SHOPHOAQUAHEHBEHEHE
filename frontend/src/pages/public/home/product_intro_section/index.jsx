
import product_intro_background from "../../../../assets/background2.png";
import mot_hop_trai_cay from "../../../../assets/mot_hop_trai_cay.png";
import blueberry_icon from "../../../../assets/icons/blueberry_icon.png";
import strawberry_icon from "../../../../assets/icons/strawberry_icon.png";
import maize_icon from "../../../../assets/icons/maize_icon.png";
import apples_icon from "../../../../assets/icons/apples_icon.png";
import LiIntro from "./li_intro";
import LiIcon from "./li_icon";

const ProductIntroSection = () => {
  const fruitIcons = [
    { icon: blueberry_icon, alt: "blueberry icon", text: "Blueberry" },
    { icon: strawberry_icon, alt: "strawberry icon", text: "Strawberry" },
    { icon: maize_icon, alt: "maize icon", text: "Maize" },
    { icon: apples_icon, alt: "apples icon", text: "Apples" },
  ];

  return (
    <section
      className="min-h-[80vh] py-10 lg:p-5 flex items-center bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${product_intro_background})` }}
    >
      <div className="flex flex-col lg:flex-row max-w-[90vw] lg:max-w-[80vw] mx-auto px-2 lg:px-5 justify-center items-center lg:items-start gap-10 lg:gap-15">
        <div className="w-2/3 lg:w-1/4 max-w-[250px] lg:max-w-none">
          <img
            src={mot_hop_trai_cay}
            alt="Mot hop trai cay"
            className="w-full h-auto drop-shadow-xl"
          />
        </div>

        <div className="w-full lg:w-2/4 space-y-4 md:space-y-2 text-center lg:text-left">
          <h3 className="font-bold text-xl md:text-2xl uppercase leading-tight text-gray-800">
            Một hộp trái cây mỗi ngày – bí quyết nhỏ cho niềm vui và sức khỏe
            lớn
          </h3>
          <p className="text-[#6c6c6c] text-base md:text-xl leading-relaxed">
            Cơ thể chúng ta cần ít nhất 25–30g chất xơ mỗi ngày để hệ tiêu hóa
            hoạt động trơn tru. Chỉ một hộp trái cây đầy đủ của Nhà Joy đã giúp
            bạn nạp tới 20–30% lượng chất xơ khuyến nghị.
          </p>

          <ul className="space-y-2 py-2 inline-block lg:block text-left">
            <LiIntro text="Mỗi ngày một hộp, đẩy đủ sắc màu vitamin." />
            <LiIntro text="Không còn lo ngại rửa, gọt, bày biện" />
            <LiIntro text="Ăn trái cây trở thành niềm vui, chứ không phải việc nhà." />
          </ul>

          <div className="pt-2">
            <button className="w-full md:w-auto border-none uppercase font-bold text-white bg-[var(--color-orange-text)] hover:brightness-110 transition-all rounded-lg py-3 px-10 shadow-md">
              Mua ngay
            </button>
          </div>
        </div>

        <div className="w-full lg:w-1/4 rounded-xl shadow-2xl bg-white/80 backdrop-blur-sm lg:bg-transparent h-auto p-6 border border-white/50">
          <ul className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:space-y-3">
            {fruitIcons.map((item, index) => (
              <LiIcon
                key={index}
                icon={item.icon}
                alt={item.alt}
                text={item.text}
              />
            ))}

          </ul>
        </div>
      </div>
    </section>
  );
};
export default ProductIntroSection;
