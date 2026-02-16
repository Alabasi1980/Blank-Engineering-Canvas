
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { SystemUser, UserGroup } from '../types';
import { useMasterDataStore } from './MasterDataStoreContext';

interface AuthContextType {
    currentUser: SystemUser | null;
    activeGroup: UserGroup | null;
    loginAs: (userId: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { getEntityData, isLoading: isDataLoading, dataVersion } = useMasterDataStore();
    const [currentUserId, setCurrentUserId] = useState<string | null>(() => localStorage.getItem('active_session_user'));

    const session = useMemo(() => {
        if (isDataLoading) return { user: null, group: null };

        const users = getEntityData('users') as SystemUser[];
        const groups = getEntityData('user_groups') as UserGroup[];
        
        const user = users.find(u => u.id === currentUserId) || null;
        const group = user ? groups.find(g => g.id === user.groupId) : null;

        return { user, group };
    }, [currentUserId, isDataLoading, dataVersion, getEntityData]);

    const loginAs = (id: string) => {
        setCurrentUserId(id);
        localStorage.setItem('active_session_user', id);
    };

    const logout = () => {
        setCurrentUserId(null);
        localStorage.removeItem('active_session_user');
    };

    return (
        <AuthContext.Provider value={{ 
            currentUser: session.user, 
            activeGroup: session.group, 
            loginAs, 
            logout,
            isAuthenticated: !!session.user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
