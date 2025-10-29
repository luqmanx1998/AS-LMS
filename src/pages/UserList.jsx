import { useState } from "react";
import CreateAccModal from "../ui/CreateAccModal";
import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "../functions/getEmployees";
import DeactivateUserModal from "../ui/DeactivateUserModal";

function UserList() {
 const [createAccModalIsOpen, setCreateAccModalIsOpen] = useState(false);
 const [selectedEmployee, setSelectedEmployee] = useState(null);
 const [openDeactivateModal, setOpenDeactivateModal] = useState(false);

 const { data: employees = [], isLoading } = useQuery({
   queryKey: ["employees"],
   queryFn: getEmployees,
   staleTime: 5 * 60 * 1000,
   });

 return (
    <>
    {createAccModalIsOpen && <CreateAccModal setCreateAccModalIsOpen={setCreateAccModalIsOpen}/>}
    
    <div>
      {/* <nav className="flex items-center justify-between mb-4">
        <h1 className="heading-custom-2">User List</h1>
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
      <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4">
        <div className="flex justify-between items-center mb-2">
        <h3 className="subheading-custom-2 mb-4">User List</h3>
        <button className="pink-button body-2 w-[186px]"
        onClick={() => setCreateAccModalIsOpen(true)}>Create Account</button>
        </div>
        <div className="flex items-center justify-between mb-4">
            <span className="body-2 text-[#4A4A4A]">Department:</span>
            <select name="ul-department" id="ul-department"
            className="rounded-lg border-[#DFE4EA] border-[1px] p-4 body-2 text-[#4A4A4A]">
                <option value="1-10 Sept, 2025"
                className="text-[#4A4A4A]">Drivers</option>
            </select>
        </div>
        <div className="border-[#DFE4EA] border-[1px] rounded-lg">
            <div className="bg-[#EBF1FF] px-4 py-2 overflow-scroll">
                <div className="grid grid-cols-4 w-[552px] justify-items-center">
                <span className="body-2">Employee</span>
                <span className="body-2">Email</span>
                <span className="body-2">Department
                </span>
                <span className="body-2">Actions</span>
                </div>
            </div>
             <div className="px-4 py-2 overflow-scroll">
              {employees?.map(employee => (
                <div className="grid grid-cols-4 w-[552px] justify-items-center items-center not-last:mb-4 relative"
                key={employee.email}>
                <span className="body-2">{employee.full_name}</span>
                <span className="body-2">{employee.email}</span>
                <span className="body-2">{employee.department}
                </span>
                <span className="cursor-pointer"
                 onClick={() =>
                    setSelectedEmployee((prev) =>
                      prev?.id === employee.id ? null : employee
                    )
                  }>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-vertical-icon lucide-ellipsis-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </span>
                {selectedEmployee?.id === employee.id && <div className="rounded-2xl shadow-2xl px-2 py-4 w-[182px] flex flex-col items-center justify-center absolute top-5 right-0 z-105 bg-white">
                  <ul className="list-none space-y-4">
                    <li className="flex body-2 items-center gap-1.5 text-[#7F8184] cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list-icon lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
                      <span>View History</span>
                    </li>
                    <li className="flex body-2 items-center gap-1.5 text-[#7F8184] cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                       <span>Edit Balance</span>
                    </li>
                    <li className="flex body-2 items-center gap-1.5 text-[#7F8184] cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw-key-icon lucide-rotate-ccw-key"><path d="m14.5 9.5 1 1"/><path d="m15.5 8.5-4 4"/><path d="M3 12a9 9 0 1 0 9-9 9.74 9.74 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><circle cx="10" cy="14" r="2"/></svg>
                      <span>Reset Password</span>
                    </li>
                    <li className="flex body-2 items-center gap-1.5 text-[#7F8184] cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-octagon-x-icon lucide-octagon-x"><path d="m15 9-6 6"/><path d="M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z"/><path d="m9 9 6 6"/></svg>
                      <span onClick={() => setOpenDeactivateModal(true)}>Deactivate</span>
                    </li>
                  </ul>
                </div>}
                {openDeactivateModal && selectedEmployee && <DeactivateUserModal setOpenDeactivateModal={setOpenDeactivateModal} employee={selectedEmployee}/>}
                </div>
              ))}
                {/* <div className="grid grid-cols-4 w-[402px] justify-items-center items-center">
                <span className="body-2">Employee</span>
                <span className="body-2">Email</span>
                <span className="body-2">Department
                </span>
                <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-vertical-icon lucide-ellipsis-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </span>
                </div> */}
            </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default UserList
