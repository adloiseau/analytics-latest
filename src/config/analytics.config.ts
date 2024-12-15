interface GASite {
  url: string;
  propertyId: string;
}

const parseGAProperties = (): Record<string, string> => {
  try {
    const propertiesStr = import.meta.env.VITE_GA_PROPERTIES;
    if (!propertiesStr) {
      console.warn('VITE_GA_PROPERTIES environment variable is not defined');
      return {};
    }

    const properties: GASite[] = JSON.parse(propertiesStr);
    return properties.reduce((acc, site) => ({
      ...acc,
      [site.url]: site.propertyId
    }), {});
  } catch (error) {
    console.error('Error parsing GA properties configuration:', error);
    return {};
  }
};

export const GA_PROPERTY_IDS = parseGAProperties();