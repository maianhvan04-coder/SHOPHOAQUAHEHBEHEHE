
const SocialHeader = ({ icon, alt = "social icon" }) => {
  return (
    <button
      className="
        bg-[#f8f6ef]
        size-8
        rounded-full
        inline-flex
        justify-center
        items-center
        hover:bg-[#eae7dd]
        transition
        cursor-pointer
      "
    >
      <img src={icon} alt={alt} className="w-4 h-4" />
    </button>

  );
};
export default SocialHeader;
