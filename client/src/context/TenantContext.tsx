import React, { createContext, useContext, useEffect, useState } from 'react';

interface TenantContextValue {
  tenantId: string;
  setTenantId: (id: string) => void;
}

const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000'; // UUID format

export const TenantContext = createContext<TenantContextValue>({
  tenantId: DEFAULT_TENANT_ID,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setTenantId: () => {},
});

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantId, setTenantId] = useState<string>(() => localStorage.getItem('tenantId') || DEFAULT_TENANT_ID);

  useEffect(() => {
    localStorage.setItem('tenantId', tenantId);
  }, [tenantId]);

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext); 