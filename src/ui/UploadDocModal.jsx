import { useForm, FormProvider } from "react-hook-form";
import FileInput from "./FileInput";

function UploadDocModal({ onClose, onSubmit }) {
  const methods = useForm({
    defaultValues: {
      documents: [],
    },
  });

  const handleSubmit = methods.handleSubmit((data) => {
    onSubmit(data.documents || []);
  });

  return (
    <FormProvider {...methods}>
      <div className="fixed top-0 left-0 bg-[rgba(0,0,0,0.2)] z-[100] w-full h-full flex justify-center items-center">
        <div className="bg-white p-6 rounded-2xl shadow-2xl w-[95%] max-w-md space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="subheading-custom-2">Upload Document</h2>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="cursor-pointer"
              onClick={onClose}
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </div>

          {/* File Upload */}
          <div>
            <p className="body-2 text-[#4A4A4A] mb-2">Documents (optional)</p>
            <div className="w-full border-dashed border-blue-300 border-[2px] rounded-lg py-6 flex flex-col items-center space-y-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-cloud-upload-icon"
              >
                <path d="M12 13v8" />
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                <path d="m8 17 4-4 4 4" />
              </svg>
              <h2 className="body-1">Select File(s)</h2>
              <div className="w-[90%]">
                <FileInput name="documents" label="Uploaded files" multiple />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-3 mt-2">
            <button
              className="pink-button body-2 w-[114px]"
              onClick={handleSubmit}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}

export default UploadDocModal;
