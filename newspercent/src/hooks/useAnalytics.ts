import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '../services/analyticsService';

export const useAnalytics = (articleId?: string, category?: string) => {
    const location = useLocation();
    const startTime = useRef<number>(Date.now());
    const maxScroll = useRef<number>(0);
    const hasTrackedView = useRef<string | null>(null);

    useEffect(() => {
        // Track Page View
        const currentPath = location.pathname + location.search;
        if (hasTrackedView.current !== currentPath) {
            analyticsService.track({
                type: 'PAGE_VIEW',
                articleId,
                category
            });
            hasTrackedView.current = currentPath;
        }

        // Reset tracking for new page
        startTime.current = Date.now();
        maxScroll.current = 0;

        const handleScroll = () => {
            const winHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;
            const scrollPercent = Math.round((scrollTop / (docHeight - winHeight)) * 100);
            
            if (scrollPercent > maxScroll.current) {
                maxScroll.current = scrollPercent;
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            // On unmount (or page change), track the engagement metrics
            const readingTime = Math.round((Date.now() - startTime.current) / 1000);
            if (readingTime > 2) { // Only track if spent more than 2 seconds
                analyticsService.track({
                    type: 'INTERACTION',
                    articleId,
                    category,
                    readingTime,
                    scrollDepth: maxScroll.current
                });
            }
            window.removeEventListener('scroll', handleScroll);
        };
    }, [location.pathname, location.search, articleId, category]);
};
