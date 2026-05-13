import React, { createContext, useContext } from 'react';
import useAlerts from '../hooks/useAlerts';

const AlertsContext = createContext(null);

export const AlertsProvider = ({ children }) => {
    const alertsState = useAlerts();
    return (
        <AlertsContext.Provider value={alertsState}>
            {children}
        </AlertsContext.Provider>
    );
};

export const useAlertsContext = () => useContext(AlertsContext);
