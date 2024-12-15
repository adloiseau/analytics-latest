export const searchConsoleApi = {
  async fetchSites(accessToken: string) {
    try {
      const response = await fetch(
        'https://www.googleapis.com/webmasters/v3/sites',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching Search Console data:', error);
      throw error;
    }
  }
};