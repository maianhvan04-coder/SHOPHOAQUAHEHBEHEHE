
import React from "react";

// Giữ nguyên phần import assets và data của bạn

import tuoi_ngon_chuan_vi from "../../../../assets/tuoi_ngon_chuan_vi.png";
import da_dang_trong_hop from "../../../../assets/da_dang_trong_hop.png";
import sach_tien_dep from "../../../../assets/sach_tien_dep.png";
import mang_di_moi_luc_moi_noi from "../../../../assets/mang_di_moi_luc_moi_noi.png";
import linh_hoat_cho_moi_nhu_cau from "../../../../assets/linh_hoat_cho_moi_nhu_cau.png";

import badgeImg from "../../../../assets/logo/joygreen_white.png";

const data = [
  {
    img: tuoi_ngon_chuan_vi,
    title: "Tươi ngon chuẩn vị",
    description:
      "Hoa quả được chọn lọc kỹ càng từ kho nhập khẩu và nguồn Việt Nam chính gốc.",
  },
  {
    img: da_dang_trong_hop,
    title: "Đa dạng trong một hộp",
    description:
      "Chỉ cần một hộp, bạn đã có thể thưởng thức nhiều loại trái cây theo mùa.",
  },
  {
    img: sach_tien_dep,
    title: "Sạch tiện đẹp",
    description:
      "Rửa sạch, gọt sẵn và đóng hộp xinh xắn. Bạn chỉ việc mở nắp và thưởng thức.",
  },
  {
    img: mang_di_moi_luc_moi_noi,
    title: "Mang đi mọi lúc",
    description:
      "Dù đi làm, đi học hay đi chơi, hộp trái cây nhỏ gọn sẽ luôn bên bạn.",
  },
  {
    img: linh_hoat_cho_moi_nhu_cau,
    title: "Linh hoạt nhu cầu",
    description:
      "Có sẵn nhiều size, nhận làm theo yêu cầu cho quà tặng, teabreak, sự kiện.",
  },
];

const BenefitCard = ({ img, badge, title, description }) => {
  return (
    <article
      className="
        flex-shrink-0 w-[170px] sm:w-[220px] md:w-full 
        rounded-xl p-1 md:p-1.5 bg-white 
        shadow-md hover:shadow-2xl 
        transform transition-all duration-300 ease-out 
        hover:-translate-y-3 cursor-pointer
        text-center overflow-visible
    "
    >
      <div className="relative aspect-[4/3]">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover rounded-t-lg"
        />
        <div className="bg-[#28a745] px-2 md:px-4 py-0.5 md:py-1 rounded-lg absolute -bottom-3 md:-bottom-4 left-1/2 -translate-x-1/2 shadow-md whitespace-nowrap z-20">
          <img src={badge} alt="badge" className="h-5 md:h-8 object-contain" />
        </div>
      </div>

      <div className="pt-5 md:pt-7 pb-3 md:pb-4 px-1.5 md:px-2">
        <h3 className="font-bold uppercase text-[11px] md:text-sm lg:text-base text-gray-800 leading-tight line-clamp-2">
          {title}
        </h3>
        <p className="mt-1.5 md:mt-2 text-[10px] md:text-sm text-gray-600 line-clamp-2 md:line-clamp-3">
          {description}
        </p>
      </div>
    </article>
  );
};

const BenefitsSection = () => {
  return (
    <section className="bg-[#e8e8e8] px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto ">
        <div
          className="flex overflow-x-auto gap-4  no-scrollbar -mt-10 md:-mt-12 md:grid md:grid-cols-5 md:gap-4 lg:gap-6 relative z-10 pt-5"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`
            .no-scrollbar::-webkit-scrollbar { display: none; }
          `}</style>

          {data.map((item, index) => (
            <BenefitCard
              key={index}
              img={item.img}
              badge={badgeImg}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};


export default BenefitsSection;
