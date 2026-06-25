import api from '../config/api';

export interface SecurityStats {
    totalUsers: number;
    totalAdmins: number;
    totalAuthors: number;
    activeSessions: number;
    successfulLoginsToday: number;
    failedLoginsToday: number;
    latestLogin: LoginLog | null;
}

export interface LoginLog {
    _id: string;
    userId: string;
    name: string;
    email: string;
    role: string;
    loginTime: string;
    logoutTime?: string;
    sessionDuration?: number;
    ipAddress: string;
    browser: string;
    operatingSystem: string;
    deviceType: string;
    status: 'success' | 'failed';
}

export interface LoginResponse {
    logs: LoginLog[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export const securityService = {
    getStats: async (): Promise<SecurityStats> => {
        const res = await api.get('/api/security/stats');
        return res.data;
    },
    
    getLogins: async (filter: string = 'all', page: number = 1): Promise<LoginResponse> => {
        const res = await api.get(`/api/security/logins?filter=${filter}&page=${page}`);
        return res.data;
    }
};
