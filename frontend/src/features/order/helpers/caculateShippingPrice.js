const SHIPPING_CONFIG = [
  { limit: 2, price: 15000, isFlat: true }, // 2km đầu luôn là 15k
  { limit: 10, perKm: 5000 }, // Từ 2-10km tính 5k/km
  { limit: Infinity, perKm: 3000 }, // Trên 10km tính 3k/km
];

const calculateShippingPrice = (km) => {
  if (km <= SHIPPING_CONFIG[0].limit) return SHIPPING_CONFIG[0].price;

  let total = SHIPPING_CONFIG[0].price;
  let remainingKm = km - SHIPPING_CONFIG[0].limit;

  // Tính cho mốc từ 2km đến 10km
  let secondTierKm = Math.min(
    remainingKm,
    SHIPPING_CONFIG[1].limit - SHIPPING_CONFIG[0].limit
  );
  total += Math.ceil(secondTierKm) * SHIPPING_CONFIG[1].perKm;

  // Tính cho mốc trên 10km
  remainingKm -= secondTierKm;
  if (remainingKm > 0) {
    total += Math.ceil(remainingKm) * SHIPPING_CONFIG[2].perKm;
  }

  return total;
};
export default calculateShippingPrice