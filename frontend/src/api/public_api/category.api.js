import { axiosUser } from "../../shared/utils/axios.custiomize";
 export const getAllCategoriesAPI = () => {
  const URL_API = "/api/v1/categories/me";
 return axiosUser.get(URL_API)
};
