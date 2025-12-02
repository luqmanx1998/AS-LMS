import React, { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import CreateAccModal from "../ui/CreateAccModal";
import DeactivateUserModal from "../ui/DeactivateUserModal";
import { getEmployees } from "../functions/getEmployees";
import ResetPasswordModal from "../ui/ResetPasswordModal";
import ViewHistoryModal from "../ui/ViewHistoryModal";
import EditBalanceModal from "../ui/EditBalanceModal";
import Pagination from "../ui/Pagination";
import { useNotification } from "../context/NotificationContext";
import LoadingSpinner from "../ui/LoadingSpinner";

function UserList() {
  const [createAccModalIsOpen, setCreateAccModalIsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const { setPopup } = useNotification();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const handleReopenEditBalanceModal = (event) => {
      const { employee } = event.detail;
      setActiveModal({ type: "editBalance", employee });
    };

    window.addEventListener('reopenEditBalanceModal', handleReopenEditBalanceModal);
    
    return () => {
      window.removeEventListener('reopenEditBalanceModal', handleReopenEditBalanceModal);
    };
  }, []);

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
    staleTime: 5 * 60 * 1000,
  });

  function capitalizeWords(str) {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const term = searchTerm.toLowerCase();
      return (
        emp.full_name?.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term)
      );
    });
  }, [employees, searchTerm]);

  const totalPages = Math.ceil(filteredEmployees.length / limit);
  const paginatedEmployees = filteredEmployees.slice(
    (page - 1) * limit,
    page * limit
  );

  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSelectedEmployee(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      {/* Global Loading Spinner */}
      {isLoading && <LoadingSpinner message="Loading..." />}
      {showSpinner && <LoadingSpinner message="Loading..." />}
      
      {/* Modals */}
      {createAccModalIsOpen && (
        <CreateAccModal 
          setCreateAccModalIsOpen={setCreateAccModalIsOpen} 
          setShowSpinner={setShowSpinner}
        />
      )}
      {activeModal?.type === "deactivate" && (
        <DeactivateUserModal
          employee={activeModal.employee}
          onClose={() => setActiveModal(null)}
          setShowSpinner={setShowSpinner}
        />
      )}
      {activeModal?.type === "resetModal" && (
        <ResetPasswordModal
          employee={activeModal.employee}
          onClose={() => setActiveModal(null)}
          setShowSpinner={setShowSpinner}
        />
      )}
      {activeModal?.type === "viewHistory" && (
        <ViewHistoryModal
          employee={activeModal.employee}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal?.type === "editBalance" && (
        <EditBalanceModal
          employee={activeModal.employee}
          onClose={() => setActiveModal(null)}
          setShowSpinner={setShowSpinner}
        />
      )}

      <div className="lg:w-[calc(100%-280px)] lg:translate-x-70 lg:space-y-6 lg:px-4 lg:flex lg:flex-col lg:items-center">
        <h1 className="hidden lg:block heading-custom-1 lg:py-4">User List</h1>
        <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <h3 className="subheading-custom-2">User List</h3>
            <button
              className="pink-button body-2 w-[186px]"
              onClick={() => setCreateAccModalIsOpen(true)}
            >
              Create Account
            </button>
          </div>

          {/* Search */}
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 w-[220px] focus:ring-2 focus:ring-[#E7AE40] outline-none placeholder-shown:text-sm"
            />
          </div>

          {/* Table */}
          <div className="border-[#DFE4EA] border-[1px] rounded-lg">
            <div className="bg-[#EBF1FF] px-4 py-2 overflow-scroll">
              <div className="grid grid-cols-4 w-[552px] lg:w-200 justify-items-center">
                <span className="body-2">Employee</span>
                <span className="body-2">Email</span>
                <span className="body-2">Department</span>
                <span className="body-2">Actions</span>
              </div>
            </div>

            <div className="px-4 py-2 overflow-scroll">
              {isLoading ? (
                  <LoadingSpinner message="Loading users..." />
              ) : paginatedEmployees.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No matching users found.
                </p>
              ) : (
                paginatedEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="grid grid-cols-4 w-[552px] lg:w-200 justify-items-center items-center not-last:mb-4 relative"
                  >
                    <span className="body-2">{employee.full_name}</span>
                    <span className="body-2">{employee.email}</span>
                    <span className="body-2">
                      {capitalizeWords(employee.department)}
                    </span>

                    {/* ⋮ Menu Trigger */}
                    <span
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmployee((prev) =>
                          prev?.id === employee.id ? null : employee
                        );
                      }}
                    >
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
                      >
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </span>

                    {/* Dropdown menu */}
                    {selectedEmployee?.id === employee.id && (
                      <div
                        ref={dropdownRef}
                        className="rounded-2xl shadow-2xl px-2 py-4 w-[182px] flex flex-col items-center justify-center absolute top-5 right-0 z-1000 bg-white"
                      >
                        <ul className="list-none space-y-4">
                          <li
                            className="flex body-2 items-center gap-1.5 text-[#7F8184] cursor-pointer"
                            onClick={() => {
                              setSelectedEmployee(null);
                              setActiveModal({ type: "viewHistory", employee });
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                              <path d="M12 11h4" />
                              <path d="M12 16h4" />
                              <path d="M8 11h.01" />
                              <path d="M8 16h.01" />
                            </svg>
                            <span>View History</span>
                          </li>

                          <li
                            className="flex body-2 items-center gap-1.5 text-[#7F8184] cursor-pointer"
                            onClick={() => {
                              setSelectedEmployee(null);
                              setActiveModal({ type: "editBalance", employee });
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                              <path d="m15 5 4 4" />
                            </svg>
                            <span>Edit Balance</span>
                          </li>

                          <li
                            className="flex body-2 items-center gap-1.5 text-[#7F8184] cursor-pointer"
                            onClick={() => {
                              setSelectedEmployee(null);
                              setActiveModal({ type: "resetModal", employee });
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m14.5 9.5 1 1" />
                              <path d="m15.5 8.5-4 4" />
                              <path d="M3 12a9 9 0 1 0 9-9 9.74 9.74 0 0 0-6.74 2.74L3 8" />
                              <path d="M3 3v5h5" />
                              <circle cx="10" cy="14" r="2" />
                            </svg>
                            <span>Reset Password</span>
                          </li>

                          <li
                            className="flex body-2 items-center gap-1.5 text-[#7F8184] cursor-pointer"
                            onClick={() => {
                              setSelectedEmployee(null);
                              setActiveModal({ type: "deactivate", employee });
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m15 9-6 6" />
                              <path d="M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z" />
                              <path d="m9 9 6 6" />
                            </svg>
                            <span>Deactivate</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </>
  );
}

export default UserList;