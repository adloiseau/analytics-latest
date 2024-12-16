// Simple mapping of country codes to names
const countryMap = new Map([
  ['fr', { code: 'FR', name: 'France' }],
  ['us', { code: 'US', name: 'United States' }],
  ['gb', { code: 'GB', name: 'United Kingdom' }],
  ['de', { code: 'DE', name: 'Germany' }],
  ['es', { code: 'ES', name: 'Spain' }],
  ['it', { code: 'IT', name: 'Italy' }],
  ['ca', { code: 'CA', name: 'Canada' }],
  ['au', { code: 'AU', name: 'Australia' }],
  ['br', { code: 'BR', name: 'Brazil' }],
  ['jp', { code: 'JP', name: 'Japan' }],
  // Add more countries as needed
]);

export const getCountryData = (countryCode: string) => {
  return countryMap.get(countryCode.toLowerCase());
};