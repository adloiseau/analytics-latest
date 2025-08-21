import { gaPropertiesService } from '../services/supabase/gaProperties';

export interface GA_PROPERTY_IDS {
  [hostname: string]: string;
}

// Cache for GA properties to avoid repeated database calls
let cachedProperties: GA_PROPERTY_IDS | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const loadGAProperties = async (): Promise<GA_PROPERTY_IDS> => {
  try {
    // Check if cache is still valid
    const now = Date.now();
    if (cachedProperties && (now - cacheTimestamp) < CACHE_DURATION) {
      return cachedProperties;
    }

    const propertiesMap = await gaPropertiesService.getPropertiesAsMap();
    
    // Update cache
    cachedProperties = propertiesMap;
    cacheTimestamp = now;
    
    return propertiesMap;
  } catch (error) {
    // Fallback to environment variable if database fails
    return parseGAPropertiesFromEnv();
  }
};

// Fallback function to parse from environment variable
const parseGAPropertiesFromEnv = (): GA_PROPERTY_IDS => {
  try {
    const propertiesStr = import.meta.env.VITE_GA_PROPERTIES;
    if (!propertiesStr) {
      return {};
    }

    const properties = JSON.parse(propertiesStr);
    if (!Array.isArray(properties)) {
      throw new Error('VITE_GA_PROPERTIES must be an array');
    }

    const result = properties.reduce((acc, site) => {
      try {
        let url = site.url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = `https://${url}`;
        }
        
        const hostname = new URL(url).hostname;
        return {
          ...acc,
          [hostname]: site.propertyId
        };
      } catch (error) {
        return acc;
      }
    }, {});

    return result;
  } catch (error) {
    return {};
  }
};

// Initialize GA_PROPERTY_IDS as a promise that resolves to the loaded properties
export const GA_PROPERTY_IDS_PROMISE = loadGAProperties();

// For backward compatibility, export a synchronous version that uses cache
export let GA_PROPERTY_IDS: GA_PROPERTY_IDS = {};

// Initialize the synchronous version
GA_PROPERTY_IDS_PROMISE.then(properties => {
  GA_PROPERTY_IDS = properties;
});

// Helper to check if a site is authorized
export const isAuthorizedSite = async (url: string): Promise<boolean> => {
  try {
    const properties = await loadGAProperties();
    const hostname = new URL(url).hostname;
    return !!properties[hostname];
  } catch {
    return false;
  }
};

// Synchronous version for immediate checks (uses cache)
export const isAuthorizedSiteSync = (url: string): boolean => {
  try {
    const hostname = new URL(url).hostname;
    return !!GA_PROPERTY_IDS[hostname];
  } catch {
    return false;
  }
};

// Helper to get all authorized site URLs
export const getAllAuthorizedSites = async (): Promise<string[]> => {
  const properties = await loadGAProperties();
  return Object.keys(properties).map(hostname => `https://${hostname}`);
};

// Force refresh of GA properties cache
export const refreshGAProperties = async (): Promise<GA_PROPERTY_IDS> => {
  cachedProperties = null;
  cacheTimestamp = 0;
  const properties = await loadGAProperties();
  GA_PROPERTY_IDS = properties;
  return properties;
};