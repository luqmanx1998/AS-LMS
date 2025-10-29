import { useForm, FormProvider } from "react-hook-form";
import FileInput from "./FileInput";

function UploadDocModal({ setOpenUploadDocModal }) {
  const methods = useForm({
    defaultValues: {
      documents: [], // field name
    },
  });

  const onSubmit = (data) => {
    console.log("Files to upload:", data.documents);
    // Here you can handle Supabase storage upload
  };

  return (
    <FormProvider {...methods}>
      <div className="top-0 left-0 fixed bg-[rgba(0,0,0,0.2)] z-100 w-full h-full flex justify-center items-center">
        <div className="bg-white p-4 rounded-xl w-[95%] max-w-md space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="subheading-custom-2">Upload Document</h2>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="cursor-pointer"
              onClick={() => setOpenUploadDocModal(false)}
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </div>

          {/* FileInput goes here */}
          <FileInput
            name="documents"
            label="Select documents"
            multiple={true}
          />

          <button
            onClick={methods.handleSubmit(onSubmit)}
            className="pink-button self-center body-2 w-[150px]"
          >
            Upload
          </button>
        </div>
      </div>
    </FormProvider>
  );
}

export default UploadDocModal;
