import logo from "../../../../assets/logo/logo.png";
import hotline_icon from "../../../../assets/icons/hotline_icon.png";
import send_mail_icon from "../../../../assets/icons/send_mail_icon.png";
import location_icon from "../../../../assets/icons/location_icon.png";
import facebook_icon from "../../../../assets/icons/facebook_icon.png";
import instagram_icon from "../../../../assets/icons/instagram_icon.png";
import SocialHeader from "./social_header";
import HeaderContactItem from "./header_contact";
const Header = () => {
  return (
    <>
      <header>

        <div className="container mx-auto pb-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-x-6 gap-y-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img src={logo} alt="logo" className="h-28" />
            </div>

            {/* Social + Contact */}
           <div className="hidden md:flex flex-col md:flex-row items-center gap-5 max-w-[1100px]">
              {/* Social */}
              <div className="flex gap-3">
                <SocialHeader icon={facebook_icon} />
                <SocialHeader icon={instagram_icon} />
              </div>

              {/* Contact */}
              <div className="flex flex-col md:flex-row md:items-center">
                <HeaderContactItem
                  icon={hotline_icon}
                  label="Hotline"
                  value="+84.988.387.811"
                />

                {/* Divider */}
                <span className="hidden md:block mx-6 h-16 w-[1.5px] bg-gray-300" />

                <HeaderContactItem
                  icon={send_mail_icon}
                  label="Send email"
                  value="Joygreenvn@gmail.com"
                />

                {/* Divider */}
                <span className="hidden md:block mx-6 h-16 w-[1.5px] bg-gray-300" />

                <HeaderContactItem
                  icon={location_icon}
                  value="226 Lê Trọng Tấn, P.Định Công, Hà Nội"
                  value2="131 Chu Huy Mân, P.Phúc Đổng, Hà Nội"
                />
              </div>
            </div>

          </div>
        </div>
      </header>
    </>
  );
};
export default Header;
