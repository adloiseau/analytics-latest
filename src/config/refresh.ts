// Configuration for data refresh intervals
export const REFRESH_CONFIG = {
  // Google Search Console refresh interval (default: 5 minutes)
  GSC_REFRESH_INTERVAL: parseInt(import.meta.env.VITE_GSC_REFRESH_INTERVAL || '300000'),
  
  // Google Analytics refresh interval (default: 1 minute)
  GA_REFRESH_INTERVAL: parseInt(import.meta.env.VITE_GA_REFRESH_INTERVAL || '60000'),
  
  // Google Analytics real-time data refresh interval (default: 30 seconds)
  GA_REALTIME_REFRESH_INTERVAL: parseInt(import.meta.env.VITE_GA_REALTIME_REFRESH_INTERVAL || '30000')
};