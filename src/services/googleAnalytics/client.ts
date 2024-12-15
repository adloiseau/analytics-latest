import { GoogleAnalyticsConfig } from './types';

class GoogleAnalyticsClient {
  private static instance: GoogleAnalyticsClient;
  private measurementId: string;

  private constructor() {
    this.measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
  }

  public static getInstance(): GoogleAnalyticsClient {
    if (!GoogleAnalyticsClient.instance) {
      GoogleAnalyticsClient.instance = new GoogleAnalyticsClient();
    }
    return GoogleAnalyticsClient.instance;
  }

  public async getRealTimeData(websiteUrl: string): Promise<any> {
    try {
      // Simulation des données en temps réel pour le moment
      // À remplacer par l'appel réel à l'API Google Analytics
      return {
        activeUsers: Math.floor(Math.random() * 100),
        pageViews: Math.floor(Math.random() * 1000),
        avgSessionDuration: Math.floor(Math.random() * 300),
        bounceRate: (Math.random() * 100).toFixed(2)
      };
    } catch (error) {
      console.error('Error fetching Google Analytics data:', error);
      throw error;
    }
  }
}

export const gaClient = GoogleAnalyticsClient.getInstance();