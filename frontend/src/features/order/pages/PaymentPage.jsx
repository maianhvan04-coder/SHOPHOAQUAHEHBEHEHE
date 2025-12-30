

const PaymentPage = () => {

  return (
    <div className="max-w-md mx-auto my-10 p-8 bg-white shadow-xl rounded-2xl border border-gray-100 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fa-brands fa-paypal text-3xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          Thanh toán đơn hàng
        </h2>
        <p className="text-gray-500 text-sm">
          Vui lòng quét mã QR bên dưới để hoàn tất
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200">
        <img
          src="path_to_error_qr.jpg"
          alt="PayPal QR"
          className="mx-auto w-64 h-64 object-contain grayscale opacity-50"
        />
        <div className="mt-4 text-left border-t pt-4">
          <p className="text-sm text-gray-600">
            Số tiền: <span className="font-bold text-red-600">245.000đ</span>
          </p>
          <p className="text-sm text-gray-600">
            Nội dung: <span className="font-bold">DH12345</span>
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          Tôi đã thanh toán thành công
        </button>
        <button className="w-full text-gray-500 text-sm hover:underline">
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
};
export default PaymentPage;
