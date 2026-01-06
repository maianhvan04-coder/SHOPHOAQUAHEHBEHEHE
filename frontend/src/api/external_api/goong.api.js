import axios from "axios";

const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY;

export const getAddressSuggestions = async (value, ward = "", province = "") => {
  try {
    const searchContext = `${value}${ward ? `, ${ward}` : ""}${province ? `, ${province}` : ""}`;

    const response = await axios.get("https://rsapi.goong.io/Place/AutoComplete", {
      params: {
        api_key: GOONG_API_KEY,
        input: searchContext,
        limit: 5,
      },
    });

    return response.data.predictions || [];
  } catch (error) {
    console.error("Lỗi gọi Goong API:", error);
    return [];
  }
};