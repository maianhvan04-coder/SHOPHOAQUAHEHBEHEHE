const ContactItem = ({ link, icon, text }) => {
  return (
    <li>
      <a
        href={link}
        className="flex items-start gap-3 text-sm text-[#828078] transition hover:text-white"
      >
        <span className="mt-1">{icon}</span>
        <span className="whitespace-pre-line leading-snug">{text}</span>
      </a>
    </li>
  );
};

export default ContactItem;