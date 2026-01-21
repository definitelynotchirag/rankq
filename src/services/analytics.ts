/**
 * Vercel Web Analytics Service
 * Provides a wrapper around @vercel/analytics for React Native
 */

import { inject } from '@vercel/analytics';

/**
 * Initialize Vercel Web Analytics
 * This will track page views and custom events
 */
export const initializeAnalytics = (): void => {
  try {
    // Inject the analytics script with development/production mode detection
    inject({
      mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    });
  } catch (error) {
    console.warn('Failed to initialize Vercel Analytics:', error);
  }
};

/**
 * Track a custom event in Vercel Analytics
 * @param name - The name of the event
 * @param data - Optional event data
 */
export const trackEvent = (name: string, data?: Record<string, any>): void => {
  try {
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('event', {
        name,
        ...data,
      });
    }
  } catch (error) {
    console.warn('Failed to track event:', error);
  }
};

/**
 * Track page view
 * @param path - The page path
 * @param title - Optional page title
 */
export const trackPageView = (path: string, title?: string): void => {
  try {
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('pageView', {
        path,
        title,
      });
    }
  } catch (error) {
    console.warn('Failed to track page view:', error);
  }
};

export default {
  initializeAnalytics,
  trackEvent,
  trackPageView,
};
