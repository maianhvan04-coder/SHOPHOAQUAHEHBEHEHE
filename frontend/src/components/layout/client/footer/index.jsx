import joygreen_white from "../../../../assets/logo/joygreen_white.png";
import twitter_white_icon from "../../../../assets/icons/twitter_white_icon.png";
import facebook_white_icon from "../../../../assets/icons/facebook_white_icon.png";
import printerest_white_icon from "../../../../assets/icons/printerest_white_icon.png";
import instargram_white_icon from "../../../../assets/icons/instargram_white_icon.png";

import SocialFooter from "./social_footer";
import ExploreItem from "./explore_items";
import NewsItem from "./news_items";
import ContactItem from "./contact_items";
import { Button, Input } from "antd";

import { SendOutlined } from "@ant-design/icons";


import { FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { IoIosSend, IoMdMail } from "react-icons/io";

const Footer = () => {
  return (

    <footer className="bg-[#101828] text-white overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          <div className="flex flex-col -mt-7 space-y-5">
            <img src={joygreen_white} className="w-40  md:w-48" alt="logo" />
            <p className="max-w-xs text-sm leading-relaxed text-[#828078]">
              There are many variations of passages of lorem ipsum available,
              but the majority suffered.
            </p>
            <ul className="flex gap-3">

              <SocialFooter link="#" icon={twitter_white_icon} />
              <SocialFooter link="#" icon={facebook_white_icon} />
              <SocialFooter link="#" icon={printerest_white_icon} />
              <SocialFooter link="#" icon={instargram_white_icon} />
            </ul>
          </div>

          {/* ===== EXPLORE ===== */}

          <div className="lg:ps-4">
            <FooterHeader title="Explore" />
            <ul className="space-y-3">
              {[
                "About",
                "Services",
                "Our Projects",
                "Meet the Farmers",
                "Latest News",
                "Contact",
              ].map((item) => (
                <ExploreItem key={item} text={item} />
              ))}

            </ul>
          </div>

          {/* ===== NEWS ===== */}
          <div>

            <FooterHeader title="News" />
            <ul className="space-y-5">

              <NewsItem
                title="Bringing Food Production Back To Cities"
                date="July 5, 2022"
              />
              <NewsItem
                title="The Future of Farming, Smart Irrigation Solutions"
                date="July 5, 2022"
              />
            </ul>
          </div>

          {/* ===== CONTACT ===== */}

          <div className="flex flex-col space-y-6">
            <FooterHeader title="Contact" />
            <ul className="space-y-4">
              <ContactItem
                link="tel:0988387811"
                icon={<FaPhoneAlt className="text-[#cea73d] shrink-0" />}
                text="+84 988.387.811"
              />
              <ContactItem
                link="mailto:Joygreenvn@gmail"
                icon={<IoMdMail className="text-[#cea73d] shrink-0 size-4" />}
                text="Joygreenvn@gmail.com"
              />
              <ContactItem
                link="#"
                icon={
                  <FaMapMarkerAlt className="text-[#cea73d] shrink-0 size-4" />
                }
                text={`226 Lê Trọng Tấn, P. Định Công, Hà Nội\n131 Chu Huy Mân, P. Phúc Đồng, Hà Nội`}
              />
            </ul>

            {/* Newsletter Input */}
            <div className="flex w-full max-w-sm mt-2">
              <Input
                placeholder="Email Address"
                size="large"
                className="!rounded-r-none !px-4 !h-11  !bg-white    
                  !border-white    
                    !text-gray-900 
                     placeholder:!text-gray-400 "
              />
              <Button
                size="large"
                icon={<IoIosSend size={24} color="#fff" />}
                className="!rounded-l-none !border-none !bg-[#4baf46] hover:!bg-[#43a13e] !px-6 !h-11"

              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Component con để tái sử dụng phần gạch chân tiêu đề
const FooterHeader = ({ title }) => (
  <p className="relative inline-block pb-3 mb-6 font-semibold text-lg">
    {title}
    <span className="absolute left-0 bottom-0 h-[2px] w-10 bg-[#4baf46]" />
    <span className="absolute left-11 -bottom-[1px] size-1 rounded-full bg-[#4baf46]" />
  </p>
);

export default Footer;
