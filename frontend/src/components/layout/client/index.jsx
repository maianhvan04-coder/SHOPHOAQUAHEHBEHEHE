import { Outlet } from "react-router-dom";
import { useRef } from "react";

import Header from "./header";
import Navbar from "./navbar";
import Footer from "./footer";

import ChatWidget from "~/features/chat/page/ChatWidget"; // ✅ thêm dòng này

const DefaultLayout = () => {
  const sectionRefs = {
    bestSeller: useRef(null),
    menuFruit: useRef(null),
    feedback: useRef(null),
    contact: useRef(null),
  };

  const handleScrollToSection = (key) => {
    sectionRefs[key]?.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Header />
      <Navbar onScrollToSection={handleScrollToSection} />

      <main>
        <Outlet context={{ sectionRefs, handleScrollToSection }} />
      </main>

      <Footer ref={sectionRefs.contact} />

      {/* ✅ Chatbot chỉ client */}
      <ChatWidget />
    </>
  );
};

export default DefaultLayout;
