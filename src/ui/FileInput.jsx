import { useFormContext } from "react-hook-form";

export default function FileInput({ name, label, multiple, onChange, value = [] }) {
  const { setValue } = useFormContext();

  const handleChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setValue(name, multiple ? selected : selected[0]);
    if (onChange) onChange(e);
  };

  return (
    <div>
      {label && <label className="body-2 block mb-2 lg:text-center">{label}</label>}
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

      {value.length > 0 && (
        <div className="mt-1 text-sm text-gray-700">
          <p className="lg:text-center">
            {value.length} file
            {value.length > 1 ? "s" : ""} selected:
          </p>
          <ul className="list-disc ml-5 mt-1 space-y-0.5 list-none">
            {value.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}