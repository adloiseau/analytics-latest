import { format, parseISO, isAfter, subDays, addHours, isBefore } from 'date-fns';

// Délai de collecte des données (3 jours)
export const SEARCH_CONSOLE_DATA_DELAY = 3;

// Vérifie si une date donnée correspond à des données en attente
export const isPendingData = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const thresholdDate = subDays(now, SEARCH_CONSOLE_DATA_DELAY);
  
  // Pour les dernières 24h, on considère les données comme en attente
  // après l'heure actuelle
  if (isBefore(dateObj, addHours(now, 24))) {
    return isAfter(dateObj, now);
  }
  
  // Pour les autres périodes, on utilise le délai standard
  return isAfter(dateObj, thresholdDate);
};

// Obtient la date de fin pour la requête Search Console
export const getSearchConsoleEndDate = (currentEndDate: Date): string => {
  return format(subDays(currentEndDate, SEARCH_CONSOLE_DATA_DELAY), 'yyyy-MM-dd');
};