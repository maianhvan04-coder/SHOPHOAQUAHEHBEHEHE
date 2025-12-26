import { axiosUser } from "../../shared/utils/axios.custiomize";
export const getAllProductsAPI = (filters) => {
  const URL_API = "/api/v1/products/me";
  console.log(filters);
  return axiosUser.get(URL_API, {
    params: {
      search: filters.search,
      sort: filters.sort,
      page: filters.page,
      limit: filters.limit,
      category:filters.category
    },
  });
};
export const getProductBySlugAPI = (slug) => {
  const URL_API = `/api/v1/products/me/${slug}`;
  return axiosUser.get(URL_API);
};
export const getTopNewProductsAPI = ()=>{
  const URL_API = "/api/v1/products/me/top-new"
  return axiosUser.get(URL_API)
}