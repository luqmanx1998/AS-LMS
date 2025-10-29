function DeactivateUserModal({ setOpenDeactivateModal, employee}) {

async function handleConfirmDeactivate() {
  try {
    const response = await fetch('https://as-lms.vercel.app/api/delete-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: employee.id }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to delete user')

    alert(`User ${employee.full_name} deleted successfully!`)
    setOpenDeactivateModal(false)

    // Optional: refresh employee list
    window.location.reload()
  } catch (error) {
    console.error('Delete error:', error)
    alert('Error deleting user')
  }
}


  return (
    <div className="top-0 left-0 fixed bg-[rgba(0,0,0,0.2)] z-[100] w-full h-full flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl w-[95%] max-w-md space-y-5 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="subheading-custom-2">Confirm Deactivation</h2>
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
            onClick={() => setOpenDeactivateModal(false)}
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </div>

        <p className="body-2 text-[#4A4A4A]">
          Are you sure you want to deactivate{" "}
          <span className="font-semibold">{employee.full_name}</span>?
        </p>

        <div className="flex gap-3 items-center justify-center mt-6">
          <button
            className="bg-[#03BC66] text-white rounded-md px-4 py-2 cursor-pointer"
            onClick={handleConfirmDeactivate}
          >
            Yes, Deactivate
          </button>
          <button
            className="bg-[#FF4120] text-white rounded-md px-4 py-2 cursor-pointer"
            onClick={() => setOpenDeactivateModal(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeactivateUserModal;
