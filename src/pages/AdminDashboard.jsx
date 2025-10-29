import { useEffect } from "react";
import { getLeaveData } from "../functions/getLeaveData"
import AdminSidebar from "../ui/AdminSidebar"
import Calendar from "../ui/Calendar"
import ReviewLeavesModal from "../ui/ReviewLeavesModal"

function AdminDashboard() {

  useEffect(() => {
    async function fetchLeaves() {
      try {
        const data = await getLeaveData();
        console.log("Leaves data:", data); // This will show [] if empty
        // setLeaves(data);
      } catch (error) {
        console.error("Error fetching leaves:", error);
      }
    }

    fetchLeaves();
  }, []);

  return (
    <>
    {/* <AdminSidebar /> */}
    <div>
      {/* <ReviewLeavesModal /> */}
      {/* <nav className="flex items-center justify-between mb-4">
        <h1 className="heading-custom-2">Dashboard</h1> 
        <div className="p-3 bg-[#F6F6F6] rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu-icon lucide-menu"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>
        </div>
      </nav> */}
      <Calendar />
      <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4 mb-4 max-h-[434px] overflow-y-scroll">
        <h1 className="subheading-custom-1 pb-4">Leave Overviews</h1>
        <div className="border-[#DFE4EA] border-[1px] px-2.5 flex justify-between rounded-lg p-1.5 items-center">
          <div>
            <h4 className="body-1 font-normal">Jofra</h4>
            <span className="body-2 text-[#4A4A4A]">Annual</span>
          </div>
          <span className="body-2 text-[#4A4A4A]">Department</span>
          <span className="body-2">Pending</span>
        </div>
      </div>
      <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4 mb-4">
        <h1 className="subheading-custom-1 pb-4">Latest Leave Application</h1>
        <div className="rounded-lg border-[#DFE4EA] border-[1px] px-4 py-4">
          <h1 className="subheading-custom-1 mb-4">Annual Leave</h1>
          <span className="subheading-custom-2 font-normal pb-4">
            15 - 18 Sept 2025
          </span>
          <button className="flex w-full bg-[#EDCEAF] justify-center p-3 rounded-lg body-2 mt-4 mb-1">
            Accept Review
          </button>
          <span className="body-2 text-[#4A4A4A]">
            Submitted on 13 Sept
          </span>
        </div>
      </div>

    </div>
    </>
  )
}

export default AdminDashboard
