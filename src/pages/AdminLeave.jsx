import { useState } from "react";
import UploadDocModal from "../ui/UploadDocModal";

function AdminLeave() {
  const [openUploadDocModal, setOpenUploadDocModal] = useState(false);

  return (
    <div>
      {openUploadDocModal && <UploadDocModal setOpenUploadDocModal={setOpenUploadDocModal}/>}
      {/* <nav className="flex items-center justify-between mb-4">
        <h1 className="heading-custom-2">My Leave</h1>
        <div className="p-3 bg-[#F6F6F6] rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-menu-icon lucide-menu"
          >
            <path d="M4 5h16" />
            <path d="M4 12h16" />
            <path d="M4 19h16" />
          </svg>
        </div>
      </nav> */}
      <div className="rounded-2xl border-[#DFE4EA] border-[1px] p-4 mb-4">
        <h2 className="subheading-custom-2 mb-4">Adam Smith</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#D4FDE5] rounded-lg p-3 space-y-2">
            <p className="body-2">Annual Leave</p>
            <span className="body-1 font-semibold">15 Left, 0 Taken</span>
          </div>
          <button className="pink-button self-center body-2">
            Apply for Leave
          </button>
        </div>
      </div>
      <div className="rounded-2xl border-[#DFE4EA] border-[1px] p-4">
        <h3 className="body-1 font-semibold mb-2">Leave Applications</h3>
        <div className="mb-4">
          <p className="body-2 text-[#4A4A4A] mb-2">Leave Type *</p>
          <select
            name="al-leavetype"
            id="al-leavetype"
            className="border-[#DFE4EA] border-[1px] p-2 w-full rounded-lg"
          >
            <option value="Annual Leave" className="text-xs">
              Annual Leave
            </option>
          </select>
        </div>
        <div className="mb-4">
          <p className="body-2 text-[#4A4A4A] mb-2">Date Range</p>
          <div className="flex gap-1 items-center justify-between">
            <select
              name="al-daterange"
              id="al-daterange"
              className="border-[#DFE4EA] border-[1px] p-2 rounded-lg"
            >
              <option value="Annual Leave" className="text-xs">
                Annual Leave
              </option>
            </select>
            <span className="body-2 text-[#4A4A4A]">To</span>
            <select
              name="al-daterange"
              id="al-daterange"
              className="border-[#DFE4EA] border-[1px] p-2 rounded-lg"
            >
              <option value="Annual Leave" className="text-xs">
                Annual Leave
              </option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <p className="body-2 text-[#4A4A4A] mb-2">Document (optional)</p>
          <button className="w-full bg-[#F2F4F5] body-2 font-medium p-2 rounded-lg cursor-pointer"
          onClick={() => setOpenUploadDocModal(true)}>
            Upload Document
          </button>
        </div>
        <button className="pink-button body-2 w-[114px]">
          Submit
        </button>
      </div>
    </div>
  );
}

export default AdminLeave;
