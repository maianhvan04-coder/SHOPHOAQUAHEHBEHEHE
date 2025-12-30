import explore_icon from "../../../../assets/icons/explore_icon.png";

const ExploreItem = ({ text }) => {
  return (
    <li>
      <a
        href="#"
        className="flex items-center gap-2 text-sm text-[#828078] transition hover:text-[#4baf46] hover:translate-x-1 duration-300"
      >
        <img src={explore_icon} alt="" className="size-3" />
        {text}
      </a>
    </li>
  );
};

export default ExploreItem;