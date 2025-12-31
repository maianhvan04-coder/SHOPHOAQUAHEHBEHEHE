import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const adminTheme = extendTheme({
  config,
  colors: {
    vrv: {
      50: "#e9efee",
      100: "#c8d5d3",
      200: "#a4bab7",
      300: "#809e9a",
      400: "#5c837e",
      500: "#304945",
      600: "#243634",
      700: "#182423",
      800: "#0c1211",
      900: "#000000",
    },
  },

  // (optional nhưng nên có) global style để tránh “cắt / scroll weird”
  styles: {
    global: {
      "html, body, #root": {
        height: "100%",
      },
      body: {
        margin: 0,
      },
    },
  },
});

export default adminTheme;
