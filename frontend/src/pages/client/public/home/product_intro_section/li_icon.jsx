const LiIcon = ({ icon, alt, text }) => {
  return (

    <li className="flex items-center gap-3 lg:gap-5 font-medium text-gray-700">
      <img src={icon} alt={alt} className="size-8 lg:size-auto object-contain" />
      <span className="text-sm lg:text-base">{text}</span>
    </li>
  );
};
export default LiIcon;

