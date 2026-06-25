import api from '../config/api';

export interface AnalyticsEvent {
    visitorId: string;
    type: 'PAGE_VIEW' | 'SEARCH' | 'INTERACTION';
    articleId?: string;
    category?: string;
    searchQuery?: string;
    readingTime?: number;
    scrollDepth?: number;
    path: string;
    referrer?: string;
}

const getVisitorId = () => {
    let id = localStorage.getItem('np_visitor_id');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('np_visitor_id', id);
    }
    return id;
};

export const analyticsService = {
    track: async (event: Omit<AnalyticsEvent, 'visitorId' | 'path' | 'referrer'>) => {
        try {
            const data: AnalyticsEvent = {
                ...event,
                visitorId: getVisitorId(),
                path: window.location.pathname,
                referrer: document.referrer
            };
            await api.post('/api/analytics/track', data);
        } catch (err) {
            console.error('[Analytics] Failed to track event:', err);
        }
    },

    getDashboardData: async (period: string = '7d') => {
        const response = await api.get(`/api/analytics/dashboard?period=${period}`);
        return response.data;
    },

    archiveData: async () => {
        const response = await api.post('/api/analytics/archive');
        return response.data;
    }
};
