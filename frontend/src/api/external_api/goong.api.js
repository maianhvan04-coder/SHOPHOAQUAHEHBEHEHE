import axios from "axios";

const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY;

export const getAddressSuggestions = async (
  value,
  ward = "",
  province = ""
) => {
  try {
    const searchContext = `${value}${ward ? `, ${ward}` : ""}${
      province ? `, ${province}` : ""
    }`;

    const response = await axios.get(
      "https://rsapi.goong.io/Place/AutoComplete",
      {
        params: {
          api_key: GOONG_API_KEY,
          input: searchContext,
          limit: 5,
        },
      }
    );

    return response.data.predictions || [];
  } catch (error) {
    console.error("Lỗi gọi Goong API:", error);
    return [];
  }
};
export const getPlaceDetail = async (placeId) => {
  try {
    const response = await axios.get("https://rsapi.goong.io/Place/Detail", {
      params: {
        api_key: GOONG_API_KEY,
        place_id: placeId,
      },
    });
    return response.data.result?.geometry?.location || null;
  } catch (error) {
    console.error("Lỗi Place Detail:", error);
    return null;
  }
};

export const getDistanceMatrix = async (origin, destination) => {
  try {
    const response = await axios.get("https://rsapi.goong.io/DistanceMatrix", {
      params: {
        api_key: GOONG_API_KEY,
        origins: origin,
        destinations: destination,
        vehicle: "car",
      },
    });

    return response.data.rows[0].elements[0];
  } catch (error) {
    console.error("Lỗi Distance Matrix:", error);
    return null;
  }
};
