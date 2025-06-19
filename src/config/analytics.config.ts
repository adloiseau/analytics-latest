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

    const result = properties.reduce((acc, site) => {
      // Extraire le hostname de l'URL
      try {
        // Ajouter https:// si ce n'est pas déjà présent
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
        console.warn(`Invalid URL in GA_PROPERTIES: ${site.url}`);
        return acc;
      }
    }, {});

    console.log('Parsed GA Properties:', result);
    console.log('Total sites loaded:', Object.keys(result).length);
    
    return result;
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

// Helper to get all authorized site URLs
export const getAllAuthorizedSites = (): string[] => {
  return Object.keys(GA_PROPERTY_IDS).map(hostname => `https://${hostname}`);
};