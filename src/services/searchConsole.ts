import { google } from 'googleapis';
import { GoogleAuthService } from './googleAuth';

export class SearchConsoleService {
  private static searchConsole = google.searchconsole('v1');

  static async getSitesList(auth: any) {
    try {
      const response = await this.searchConsole.sites.list({
        auth,
      });
      return response.data.siteEntry || [];
    } catch (error) {
      console.error('Error fetching sites:', error);
      throw error;
    }
  }

  static async getSearchAnalytics(auth: any, siteUrl: string, params: any) {
    try {
      const response = await this.searchConsole.searchanalytics.query({
        auth,
        siteUrl,
        requestBody: params,
      });
      return response.data.rows || [];
    } catch (error) {
      console.error('Error fetching search analytics:', error);
      throw error;
    }
  }
}