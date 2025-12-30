const NewsItem = ({ title, date }) => {
  return (
    <li>
      <a href="#" className="block transition hover:opacity-75">
        <p className="text-sm font-medium leading-snug">{title}</p>
        <p className="mt-1 text-xs text-[#cea73d]">{date}</p>
      </a>
    </li>
  );
};

export default NewsItem;
