import { useOutletContext } from "react-router-dom";
import BannerSection from "./home/banner_section/Index";
import BenefitsSection from "./home/benefit_section";
import BestSellerSection from "./home/best_seller_section";
import FeedbackSection from "./home/feedback_section";
import FruitHeroSection from "./home/fruit_hero_section";

// import LastedProductSection from "./home/lasted_product_section";
import LastedProductSection from "../../features/product/components/user/LastedProductSection";

import MixMenuSection from "./home/mixmenu_section";
import ProductIntroSection from "./home/product_intro_section";

const HomePage = () => {
  const { sectionRefs } = useOutletContext();
  return (
    <>
      <BannerSection />
      <BenefitsSection />
      <BestSellerSection ref={sectionRefs.bestSeller} />
      <ProductIntroSection />
      <LastedProductSection ref={sectionRefs.menuFruit} />
      <FruitHeroSection></FruitHeroSection>
      <MixMenuSection></MixMenuSection>
      <FeedbackSection ref={sectionRefs.feedback}></FeedbackSection>
    </>
  );
};
export default HomePage;
