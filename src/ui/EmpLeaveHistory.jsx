function EmpLeaveHistory() {
  return (
    <div>
      {/* <nav className="flex items-center justify-between mb-4">
        <h1 className="heading-custom-2">Leave History</h1> 
        <div className="p-3 bg-[#F6F6F6] rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu-icon lucide-menu"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>
        </div>
      </nav> */}
      <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4">
        <h3 className="subheading-custom-2 mb-4">Leave History</h3>
        <div className="items-center justify-between mb-4 grid grid-cols-2">
            <span className="body-2 text-[#4A4A4A]">Date Range:</span>
            <select name="lg-date-range" id="lh-date-range"
            className="rounded-lg border-[#DFE4EA] border-[1px] p-4 body-2 text-[#4A4A4A]">
                <option value="1-10 Sept, 2025"
                className="text-[#4A4A4A]">1-10 Sept, 2025</option>
            </select>
        </div>
        <div className="items-center justify-between mb-4 grid grid-cols-2">
            <span className="body-2 text-[#4A4A4A]">Leave Type:</span>
            <select name="lh-leave-type" id="lh-leave-type"
            className="rounded-lg border-[#DFE4EA] border-[1px] p-4 body-2 text-[#4A4A4A]">
                <option value="1-10 Sept, 2025"
                className="text-[#4A4A4A]">Annual</option>
            </select>
        </div>
        <div className="border-[#DFE4EA] border-[1px] rounded-lg">
            <div className="bg-[#EBF1FF] px-4 py-2 overflow-scroll">
                <div className="grid grid-cols-4 w-[470px] justify-items-center items-center">
                <span className="body-2">Leave Type</span>
                <span className="body-2">Dates</span>
                <span className="body-2">Status
                </span>
                <span className="body-2">Remarks</span>
                </div>
            </div>
             <div className="px-4 py-2 overflow-scroll">
                <div className="grid grid-cols-4 w-[470px] justify-items-center items-center">
                <span className="body-2">Annual</span>
                <span className="body-2">Apr 1 - Apr 19 2025</span>
                <span className="body-2 bg-[#03BC66] rounded-2xl text-white py-1 px-2">Approved
                </span>
                <span className="body-2">No taking leave on this week</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default EmpLeaveHistory
