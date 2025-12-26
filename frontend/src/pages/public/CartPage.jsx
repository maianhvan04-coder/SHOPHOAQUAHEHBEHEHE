import { useState } from "react";
import { Input, Button, Divider } from "antd";
import {
  FaTrashAlt,
  FaShieldAlt,
  FaMinus,
  FaPlus,
  FaArrowLeft,
  FaTicketAlt,
} from "react-icons/fa";
import product_dua_luoi from "../../assets/product_dua_luoi.png";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
    const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Dưa Lưới Fuji Nhật Bản",
      category: "Trái cây cắt sẵn",
      price: 150000,
      quantity: 1,
      image: product_dua_luoi,
    },
    {
      id: 2,
      name: "Bưởi Hồng Da Xanh",
      category: "Trái cây tươi",
      price: 85000,
      quantity: 2,
      image: product_dua_luoi,
    },
  ]);

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 30000;
  const total = subtotal + shipping;

  return (
    
    <section className="bg-[#f9f9f9] min-h-[calc(100vh-200px)] pt-15 pb-4 px-4 md:px-6 lg:px-10">
      {/* Giới hạn max-width nhỏ hơn (6xl thay vì 7xl) để nội dung tập trung */}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-extrabold uppercase mb-6 flex items-center gap-2">
          Giỏ hàng 
          <span className="text-xs font-normal text-gray-400 lowercase">
            ({cartItems.length} sản phẩm)
          </span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* --- CỘT TRÁI: DANH SÁCH --- */}
          <div className="w-full lg:w-[65%] space-y-3">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-3 md:p-4 rounded-xl shadow-sm flex items-center gap-4 border border-gray-50 transition-all hover:shadow-md"
                >
                  {/* Ảnh thu nhỏ lại (size-20 thay vì 28) */}
                  <div className="size-16 md:size-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Thông tin gọn hơn */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] uppercase font-bold text-[#49a760] mb-0.5">{item.category}</p>
                    <h3 className="font-bold text-gray-800 text-sm md:text-base truncate">{item.name}</h3>
                    <p className="font-bold text-[#cea73d] text-xs md:hidden">{item.price.toLocaleString()}đ</p>
                  </div>

                  {/* Giá Desktop thu gọn */}
                  <div className="hidden md:block text-right min-w-[100px]">
                    <p className="font-bold text-base text-gray-800">{(item.price * item.quantity).toLocaleString()}đ</p>
                    <p className="text-[10px] text-gray-400">{item.price.toLocaleString()}đ/hộp</p>
                  </div>

                  {/* Bộ điều khiển gọn hơn */}
                  <div className="flex items-center border border-gray-200 rounded-lg h-8">
                    <button onClick={() => updateQuantity(item.id, -1)} className="px-2 hover:bg-gray-100"><FaMinus size={8} /></button>
                    <span className="px-3 font-bold text-xs">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="px-2 hover:bg-gray-100"><FaPlus size={8} /></button>
                  </div>

                  <button onClick={() => removeItem(item.id)} className="size-8 flex items-center justify-center rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all">
                    <FaTrashAlt size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-white p-12 rounded-2xl text-center">
                <p className="text-gray-400 mb-4 text-sm">Giỏ hàng đang trống</p>
                <Button type="primary" className="bg-[#49a760] border-none rounded-lg" onClick={()=>navigate("/")}>Tiếp tục mua sắm</Button>
              </div>
            )}

            <button className="flex items-center gap-2 text-gray-400 hover:text-[#49a760] font-bold text-[11px] transition-colors mt-2" onClick={()=>navigate("/")}>
              <FaArrowLeft   /> QUAY LẠI MUA SẮM
            </button>
          </div>

          {/* --- CỘT PHẢI: SUMMARY --- */}
          <div className="w-full lg:w-[35%]">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 space-y-4">
              <h2 className="text-lg font-bold border-b pb-3 uppercase text-gray-700">Thanh toán</h2>

              <div className="space-y-2">
                <p className="text-[11px] font-bold flex items-center gap-2 text-gray-500">
                  <FaTicketAlt className="text-[#cea73d]" /> MÃ GIẢM GIÁ
                </p>
                <div className="flex gap-2">
                  <Input placeholder="Mã ưu đãi..." className="rounded-lg h-9 text-xs" />
                  <Button className="h-9 rounded-lg font-bold text-[11px] border-[#49a760] text-[#49a760] hover:!bg-[#49a760] hover:!text-white">ÁP DỤNG</Button>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-gray-800">{subtotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Phí ship</span>
                  <span className="font-semibold text-gray-800">{shipping.toLocaleString()}đ</span>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-800">TỔNG CỘNG</span>
                  <span className="font-black text-xl text-[#49a760]">{total.toLocaleString()}đ</span>
                </div>
              </div>

              <button className="w-full bg-[#1f4d3d] text-white font-bold py-3 rounded-lg shadow-md hover:bg-[#153a2e] transition-all text-xs uppercase tracking-widest">
                Đặt hàng ngay
              </button>

              <div className="bg-[#f0f7f4] p-3 rounded-xl flex items-center gap-3 text-[#1f4d3d]">
                <FaShieldAlt size={18} className="shrink-0" />
                <p className="text-[10px] leading-tight">
                  Cam kết trái cây tươi ngon 100%, bảo mật thanh toán.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;