import React, { createContext, useContext } from 'react';
import { EmployeeRole } from '../types';

interface AdminRoleContextValue {
  role: EmployeeRole | null;
  employeeId: string | null;
  employeeName: string | null;
}

export const AdminRoleContext = createContext<AdminRoleContextValue>({
  role: null,
  employeeId: null,
  employeeName: null,
});

export const useAdminRole = () => useContext(AdminRoleContext);
