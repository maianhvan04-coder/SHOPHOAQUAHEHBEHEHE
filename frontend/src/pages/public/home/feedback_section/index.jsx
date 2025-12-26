import SectionHeader from "../header_section";
import FeedbackCard from "./feedback_card";
import listFeedbacks from "./customer_data";
import { forwardRef } from "react";


const FeedbackSection = forwardRef((_, ref) => {
  return (
    <section ref={ref} className="mt-10 lg:mt-20 px-4">
      <div className="flex flex-col items-center mx-auto">
        <SectionHeader
          mainTitle={"Recently Added"}
          subTitle={"Feedback từ Khách iu của Joy"}
        />

        {/* - Nền xám tập trung: max-w-[1200px] và mx-auto.
          - Padding: Sử dụng đúng các thông số bạn đã chỉ định cho desktop.
        */}
        <div className="mt-10 lg:mt-16 bg-[#f9f9f9] w-full max-w-[1200px] mx-auto p-6 md:p-10 lg:px-12 lg:pt-30 lg:pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-y-7 lg:gap-x-4 justify-items-center">

            {listFeedbacks.map((feed) => (
              <FeedbackCard
                key={feed.id}
                avatar={feed.avatar}
                name={feed.name}
                role={feed.role}
                rating={feed.rating}
                feedback={feed.comment}

              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});


FeedbackSection.displayName = "FeedbackSection";
export default FeedbackSection;
