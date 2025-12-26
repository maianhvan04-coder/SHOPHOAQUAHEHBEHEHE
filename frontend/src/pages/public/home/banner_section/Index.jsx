import { useOutletContext } from "react-router-dom";
import heroBanner from "../../../../assets/hero_banner.png";

const BannerSection = () => {
  const { handleScrollToSection } = useOutletContext();
  return (
    <section className="relative w-full h-[80vh] md:h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBanner})` }}
      />

      <div
        className="
          hidden md:block
          absolute
          left-10 xl:left-20
          top-24 xl:top-36
          max-w-[520px] xl:max-w-[700px]
          space-y-3 xl:space-y-4
        "
      >
        <h1
          className="
          text-[72px] lg:text-[90px] xl:text-[110px]
          font-extrabold uppercase leading-none
          text-(--color-green-text)
          [-webkit-text-stroke:4px_white]
          drop-shadow-[4px_6px_0_rgba(0,0,0,0.25)]
        "
        >
          Trái cây
        </h1>

        <h1
          className="
          text-[72px] lg:text-[90px] xl:text-[110px]
          font-extrabold uppercase leading-none
          text-(--color-green-text)
          [-webkit-text-stroke:4px_white]
          drop-shadow-[4px_6px_0_rgba(0,0,0,0.25)]
        "
        >
          tươi mát
        </h1>

        <p
          className="
          text-[36px] lg:text-[48px] xl:text-[63px]
          font-extrabold uppercase
          text-(--color-orange-text)
          [-webkit-text-stroke:2px_white]
          drop-shadow-[4px_6px_0_rgba(0,0,0,0.25)]
        "
        >
          Gọt sẵn tiện lợi
        </p>

        <button
        onClick={() => handleScrollToSection("menuFruit")}
          className="
          !mt-3 xl:mt-4
          !w-[360px] lg:w-[460px] xl:w-[575px]
          !h-12 lg:h-14 xl:h-16
          !rounded-xl
          !bg-(--color-green-button)
          !text-white
          !text-[22px] lg:text-[30px] xl:text-[40px]
          !font-extrabold uppercase
          !shadow-lg
          !hover:brightness-110 transition
        "
      
        >
          Thử ngay nha
        </button>
      </div>

      {/* MOBILE */}
      <div
        className="
          md:hidden
          absolute inset-0
          flex flex-col items-center justify-center
          text-center px-6 space-y-3
        "
      >
        <h1
          className="
          text-[34px]
          font-extrabold uppercase
          text-(--color-green-text)
          [-webkit-text-stroke:2px_white]
          drop-shadow
        "
        >
          Trái cây tươi mát
        </h1>

        <p
          className="
          text-[18px]
          font-bold uppercase
          text-(--color-orange-text)
          [-webkit-text-stroke:1.5px_white]
          drop-shadow
        "
        >
          Gọt sẵn tiện lợi
        </p>

        <button
          className="
          mt-2
          w-full max-w-[300px]
          h-11
          rounded-lg
          bg-(--color-green-button)
          text-white
          text-[16px]
          font-bold uppercase
          shadow
          active:scale-95 transition
        "
        >
          Thử ngay
        </button>

      </div>
    </section>
  );
};

export default BannerSection;
