import { GA_PROPERTY_IDS } from '../types/analytics';

export const parseGAProperties = (): GA_PROPERTY_IDS => {
  try {
    const propertiesStr = import.meta.env.VITE_GA_PROPERTIES;
    if (!propertiesStr) {
      console.warn('VITE_GA_PROPERTIES environment variable is not defined');
      return {};
    }

    const properties = JSON.parse(propertiesStr);
    if (!Array.isArray(properties)) {
      throw new Error('VITE_GA_PROPERTIES must be an array');
    }

    return properties.reduce((acc, site) => ({
      ...acc,
      [site.url]: site.propertyId
    }), {});
  } catch (error) {
    console.error('Error parsing GA properties:', error);
    return {};
  }
};

export const GA_PROPERTY_IDS = parseGAProperties();

// Helper to check if a site is authorized
export const isAuthorizedSite = (url: string): boolean => {
  try {
    const hostname = new URL(url).hostname;
    return !!GA_PROPERTY_IDS[hostname];
  } catch {
    return false;
  }
};