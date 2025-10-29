import { useFormContext } from "react-hook-form";
import { useState } from "react";

export default function FileInput({ name, label, multiple }) {
  const { setValue } = useFormContext();
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleChange = (e) => {
    const selected = Array.from(e.target.files);
    setSelectedFiles(selected);
    setValue(name, multiple ? selected : selected[0]); // register once on change
  };

  return (
    <div>
      {label && <label className="body-2 block mb-2">{label}</label>}
      <label
        htmlFor={name}
        className="bg-[#EDCEAF] text-black px-4 py-2 rounded-lg cursor-pointer hover:bg-[#e0b98d] transition-all w-full flex justify-center"
      >
        Choose Files
      </label>
      <input
        id={name}
        type="file"
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      {selectedFiles.length > 0 && (
      <div className="mt-1 text-sm text-gray-700">
          <p>
            {selectedFiles.length} file
            {selectedFiles.length > 1 ? "s" : ""} selected:
          </p>
          <ul className="list-disc ml-5 mt-1 space-y-0.5 list-none">
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
    )}

    </div>
  );
}
