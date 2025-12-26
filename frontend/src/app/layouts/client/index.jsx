import { Outlet } from "react-router-dom";

import Header from "./header";
import Navbar from "./navbar";
import Footer from "./footer";
import { useRef } from "react";

const DefaultLayout = () => {
  const sectionRefs = {
    bestSeller: useRef(null),

    menuFruit: useRef(null),

    feedback: useRef(null),
    contact: useRef(null),
  };

  const handleScrollToSection = (key) => {
    sectionRefs[key]?.current?.scrollIntoView({
      behavior: "smooth",
    });
  };
  return (
    <>

      
        <Header />
        <Navbar onScrollToSection={handleScrollToSection} />
  

      <main>
        <Outlet context={{ sectionRefs,handleScrollToSection }} />

      </main>

      <Footer />
    </>
  );
};

export default DefaultLayout;
