import EmpSidebar from "../ui/EmpSidebar"
import { getCurrentEmployee } from "../functions/getCurrentEmployee";
import { useQuery } from "@tanstack/react-query";

function EmpDashboard() {

 const { data: employee, isLoading } = useQuery({
    queryKey: ["currentEmployee"],
    queryFn: getCurrentEmployee,
    staleTime: 10 * 60 * 1000, // ✅ cache for 10 mins
    retry: false, // don’t retry if user is logged out
  });

  return (
    <>
    {/* <EmpSidebar /> */}
    <div className="space-y-4">
      {/* <nav className="flex items-center justify-between">
        <h1 className="heading-custom-2">Dashboard</h1> 
        <div className="p-3 bg-[#F6F6F6] rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu-icon lucide-menu"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>
        </div>
      </nav> */}
      <h2 className="subheading-custom-1">Good morning, {employee ? employee.full_name : "Employee"}
      </h2>
      <div className="rounded-2xl border-[#DFE4EA] border-[1px] p-4">
        <h3 className="body-1 mb-4">Annual Leave</h3>
        <div className="grid grid-cols-2 gap-2">
         <div className="bg-[#D4FDE5] rounded-lg p-3 space-y-2">
            <p className="body-2">Remaining</p>
            <span className="body-1 font-semibold">15</span>
          </div>
          <div className="bg-[#FFEFD9] rounded-lg p-3 space-y-2">
            <p className="body-2">Accrued</p>
            <span className="body-1 font-semibold">10</span>
          </div>
          <div className="bg-[#EAF1FF] rounded-lg p-3 space-y-2">
            <p className="body-2">Used</p>
            <span className="body-1 font-semibold">10</span>
          </div>
          </div>
          <button className="pink-button mt-2 body-2 w-[104px]">
            Apply
          </button>
      </div>
      <div className="rounded-2xl border-[#DFE4EA] border-[1px] p-4 space-y-4">
        <h3 className="subheading-custom-2">Latest Application</h3>
        <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-2 space-y-2 flex flex-col items-start">
          <h3 className="body-1">Annual Leave</h3>
          <span className="body-1 text-[#4A4A4A]">15 - 18 Sept 2025</span>
          <button className="w-full bg-[#E7AE40] text-white rounded-lg py-2 body-2 cursor-pointer">Pending Review</button>
          <span className="text-xs text-[#4A4A4A]">Submitted on 13 Sept 2025</span>
        </div>
      </div>
    </div>
    </>
  )
}

export default EmpDashboard
