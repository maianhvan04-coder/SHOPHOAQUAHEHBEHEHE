
import { forwardRef } from "react";
import backgroundBestSeller from "../../../../assets/BACKGROUND.png";
import bestSellerImg from "../../../../assets/best_seller.png";
import ProductComponent from "../../../../features/product/components/user/ProductComponent";

import SectionHeader from "../header_section";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchTopNewProducts } from "../../../../features/product/product_slice";
import { useNavigate } from "react-router-dom";

const BestSellerSection = forwardRef((_, ref) => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const { listTopNew } = useSelector((state) => state.product);
  useEffect(() => {
    dispatch(fetchTopNewProducts());
  }, [dispatch]);
  return (
    <section
      ref={ref}
      className="py-10 px-4 xl:px-6 shadow-[inset_0_40px_40px_-20px_rgba(0,0,0,0.1)] bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${backgroundBestSeller})` }}
    >
      <div className="max-w-[1700px] mx-auto">
        <SectionHeader
          mainTitle="Our Service"
          subTitle="Bán chạy nhất tại Joy"
        />

        {/* - Mobile: flex-col (dọc)
           - Desktop (xl): flex-row, justify-between để dàn 5 khối trên 1 hàng 
        */}
        <div className="mt-12 flex flex-col xl:flex-row items-center xl:items-stretch justify-center gap-4">
          {/* Khối Best Seller Img */}
          <div className="w-[340px] shrink-0">
            <img
              src={bestSellerImg}
              alt="best seller"
              className="w-full h-full object-cover rounded-2xl shadow-lg"
            />
          </div>

          {/* - Mobile: flex-wrap (xuống hàng)
             - Desktop: flex-nowrap để ép 4 sản phẩm đứng cạnh ảnh bestseller 
          */}
          <div className="flex flex-wrap md:flex-nowrap justify-center gap-3 w-full">
            {listTopNew.map((fruit, index) => (
              <ProductComponent
                key={fruit._id}
                img={fruit.image.url}
                num={index}
                title={fruit.name}
                showDetails={()=>navigate(`/details/${fruit.slug}`)}
                description="Trái Cây Tươi Ngon – Gọt Sẵn, Tiện Lợi Mỗi Ngày!"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});


BestSellerSection.displayName = "BestSellerSection";
export default BestSellerSection;
