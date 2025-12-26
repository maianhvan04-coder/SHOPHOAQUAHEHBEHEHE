const BenefitCard = ({ img, badge, title, description }) => {
  return (
    <article className="w-full max-w-[220px] lg:max-w-[250px] rounded-xl p-1.5 bg-white shadow-lg overflow-hidden text-center transition-transform hover:-translate-y-2">
      <div className="relative aspect-[4/3]">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover rounded-t-lg"
        />
        {/* Badge nằm đè giữa ảnh và text */}
        <div className="bg-[#28a745] px-4 py-1 rounded-lg absolute -bottom-4 left-1/2 -translate-x-1/2 shadow-md">
          <img src={badge} alt="badge" className="h-6 md:h-8 object-contain" />
        </div>
      </div>

      <div className="pt-6 pb-4 px-2">
        <h3 className="font-bold uppercase text-sm md:text-base text-gray-800 leading-tight">
          {title}
        </h3>
        <p className="mt-2 text-xs md:text-sm text-gray-600 line-clamp-3">
          {description}
        </p>
      </div>
    </article>
  );
};

export default BenefitCard;
