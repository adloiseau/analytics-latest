export interface LinkSelling {
  id: string;
  date: string;
  montant: number;
  site: string;
  plateforme: string;
  created_at?: string;
}

export interface LinkSellingStats {
  totalAmount: number;
  directSalesPercentage: number;
  platformSalesPercentage: number;
  topPlatforms: Array<{
    plateforme: string;
    montant: number;
    count: number;
    percentage: number;
    averagePrice: number;
  }>;
  monthlyData: Array<{
    month: string;
    directSales: number;
    platformSales: number;
    total: number;
    count: number;
    average: number;
  }>;
  totalSales: number;
  averagePricePerSite: number;
  uniqueSites: number;
  averagePricePerSale: number;
}

export interface Database {
  public: {
    Tables: {
      link_selling: {
        Row: LinkSelling;
        Insert: Omit<LinkSelling, 'id' | 'created_at'>;
        Update: Partial<Omit<LinkSelling, 'id' | 'created_at'>>;
      };
    };
  };
}