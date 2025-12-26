import { Rate } from "antd";

const FeedbackCard = ({ avatar, name, role, rating, feedback }) => {
  return (

    <div className="bg-white rounded-2xl space-y-4 w-full max-w-[320px] p-6 shadow-sm transition-transform hover:-translate-y-1">
      <div className="flex gap-4 items-center">
        <img 
          className="rounded-full size-12 object-cover shrink-0" 
          src={avatar} 
          alt={name} 
        />
        <div className="min-w-0">
          <p className="font-bold text-gray-800 truncate text-base">{name}</p>
          <p className="text-sm text-[#908e89] truncate">{role}</p>
        </div>
      </div>
      
      <hr className="border-gray-100" />
      
      <div className="space-y-3">
        <Rate
          disabled
          defaultValue={rating}
          className="text-orange-400 [&_.ant-rate-star]:text-[14px]"
        />
        <p className="text-gray-700 text-sm leading-relaxed">
          "{feedback}"
        </p>
      </div>
    </div>
  );
};

export default FeedbackCard;
