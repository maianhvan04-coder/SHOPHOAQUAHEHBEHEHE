const SocialFooter = ({ icon, link }) => {
  return (

    <li className="size-9 rounded-full bg-white/5 flex items-center justify-center transition hover:bg-[#4baf46] cursor-pointer">
      <a href={link} className="flex items-center justify-center">
        <img src={icon} alt="social" className="size-4" />

      </a>
    </li>
  );
};

export default SocialFooter;
