// components/LoadingSpinner.jsx
import Portal from "./Portal";

function LoadingSpinner({ message = "Processing..." }) {
  return (
    <Portal>
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] z-1000 w-full h-full flex justify-center items-center">
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E7AE40]"></div>
          <p className="body-2 text-[#4A4A4A]">{message}</p>
        </div>
      </div>
    </Portal>
  );
}

export default LoadingSpinner;