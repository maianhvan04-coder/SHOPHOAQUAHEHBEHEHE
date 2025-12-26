import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import routes from "~/app/routes";

import {
  ChakraProvider,
  ColorModeScript,
  extendTheme,
  Center,
  Spinner,
} from "@chakra-ui/react";

/* ================= THEME ================= */
const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
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
});

/* ================= LOADING ================= */
const LoadingFallback = () => (
  <Center h="100vh">
    <Spinner size="xl" color="vrv.500" thickness="4px" />
  </Center>
);

export default function App() {
  const element = useRoutes(routes);

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Suspense fallback={<LoadingFallback />}>{element}</Suspense>
    </ChakraProvider>
  );
}
