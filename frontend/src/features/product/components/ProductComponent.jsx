import favorite_icon from "../../../assets/icons/favorite_icon.png";

const ProductComponent = ({ img, num, title, description }) => {
  return (
    <>
      <div className="bg-white w-3xs rounded-xl relative shadow-md  overflow-hidden">
        <div className="h-[300px] overflow-hidden">
          <img src={img} alt="product image" className="block w-full h-full " />
        </div>
        <div className="bg-[#c4cd38] rounded-lg absolute bottom-38 right-5 text-white font-montserrat text-3xl font-extrabold size-15 flex items-center justify-center">
          {num}
        </div>
        <div className="p-5 space-y-5">
          <h3 className="font-bold uppercase text-lg">{title}</h3>
          <p className="text-[#908e89] text-sm ">{description}</p>
          <div className=" flex justify-around items-center ">
            <button className="cursor-pointer uppercase font-bold text-xs border-2 rounded-3xl border-amber-600 w-40 py-2 px-4">
              Mua ngay
            </button>
            <div className="inline-flex  cursor-pointer size-8 rounded-full border-2 border-(--color-green-button) justify-center items-center ">
              <img src={favorite_icon} alt="icon"></img>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ProductComponent;
