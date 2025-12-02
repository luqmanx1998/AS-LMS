import { BrowserRouter, Route, Routes, Navigate } from 'react-router';
import AdminDashboard from './pages/AdminDashboard';
import LeaveApplications from './pages/LeaveApplications';
import AdminLayout from './ui/AdminLayout';
import UserList from './pages/UserList';
import AdminLeave from './pages/AdminLeave';
import EmpDashboard from './pages/EmpDashboard';
import EmpLeaves from './pages/EmpLeaves';
import EmpLeaveHistory from './ui/EmpLeaveHistory';
import EmployeeLayout from './ui/EmployeeLayout';
import { useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/LoginPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './ui/ProtectedRoute';
import { NotificationProvider } from './context/NotificationContext';

const queryClient = new QueryClient();

function App() {
  const [empSidebarOpen, setEmpSidebarOpen] = useState(false);
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(false);
  
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider> {/* Wrap entire app with NotificationProvider */}
        <ReactQueryDevtools initialIsOpen={false} />
        <div className='px-4 py-4 lg:px-0 lg:py-0'>
          <Routes>
            <Route index element={<LoginPage />} />
            
            <Route element={<ProtectedRoute allowedRole="admin" />}>
              <Route path="admin" element={<AdminLayout adminSidebarOpen={adminSidebarOpen} setAdminSidebarOpen={setAdminSidebarOpen}/>}>
                <Route index element={<AdminDashboard />} />
                <Route path="leaveapps" element={<LeaveApplications />}/>
                <Route path="userlist" element={<UserList />}/>
                <Route path="adminleave" element={<AdminLeave />}/>
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRole="employee" />}>
              <Route path="employee" element={<EmployeeLayout empSidebarOpen={empSidebarOpen} setEmpSidebarOpen={setEmpSidebarOpen}/>}>
                <Route index element={<EmpDashboard />} />
                <Route path="empleaves" element={<EmpLeaves />}/>
                <Route path="empleavehist" element={<EmpLeaveHistory />}/>
              </Route>
            </Route>
          </Routes>
        </div>
      </NotificationProvider>
    </QueryClientProvider>
  )
}

export default App