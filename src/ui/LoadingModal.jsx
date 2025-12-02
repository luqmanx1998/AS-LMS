import Portal from "./Portal";

function LoadingModal({ message = "Processing..." }) {
  return (
    <Portal>
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[2000]">
        <div className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center shadow-lg space-y-4 w-[250px]">
          <div className="w-10 h-10 border-4 border-[#EDCEAF] border-t-transparent rounded-full animate-spin"></div>
          <p className="body-2 text-[#4A4A4A]">{message}</p>
        </div>
      </div>
    </Portal>
  );
}

export default LoadingModal;
