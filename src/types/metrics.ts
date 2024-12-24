import { SearchAnalyticsRow } from '../services/googleAuth/types';
import { AnalyticsMetrics } from './analytics';

export interface SiteMetrics {
  id: number;
  site_url: string;
  date: string;
  metric_type: 'TO' | 'AS' | 'BL' | 'RD' | 'KD' | 'VI' | 'TF_root' | 'CF_root' | 'TF_subdomain' | 'CF_subdomain';
  value: number;
}

export interface MetricDefinition {
  key: string;
  label: string;
  description: string;
  color: string;
  getHistoricalData?: (site: SearchAnalyticsRow, metrics: AnalyticsMetrics) => Promise<any[]>;
}

export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  TO: {
    key: 'TO',
    label: 'Trafic organique',
    description: 'Nombre de visiteurs provenant des moteurs de recherche',
    color: '#3b82f6'
  },
  clicks: {
    key: 'clicks',
    label: 'Nombre de clics',
    description: 'Nombre de clics depuis Google Search Console',
    color: '#10b981'
  },
  impressions: {
    key: 'impressions',
    label: 'Impressions',
    description: 'Nombre d\'impressions dans les résultats de recherche',
    color: '#8b5cf6'
  },
  pageViews: {
    key: 'pageViews',
    label: 'Pages vues',
    description: 'Nombre total de pages vues',
    color: '#f59e0b'
  },
  activeUsers: {
    key: 'activeUsers',
    label: 'Visiteurs 7j',
    description: 'Nombre de visiteurs actifs sur les 7 derniers jours',
    color: '#ec4899'
  },
  AS: {
    key: 'AS',
    label: 'Authority Score',
    description: 'Score d\'autorité du domaine',
    color: '#6366f1'
  },
  BL: {
    key: 'BL',
    label: 'Backlinks',
    description: 'Nombre total de backlinks',
    color: '#14b8a6'
  },
  RD: {
    key: 'RD',
    label: 'Domaines référents',
    description: 'Nombre de domaines uniques pointant vers le site',
    color: '#f43f5e'
  },
  KD: {
    key: 'KD',
    label: 'Keywords',
    description: 'Nombre de mots-clés en première page',
    color: '#8b5cf6'
  },
  VI: {
    key: 'VI',
    label: 'Indice de visibilité',
    description: 'Pourcentage de visibilité dans les résultats de recherche',
    color: '#f59e0b'
  },
  TF_root: {
    key: 'TF_root',
    label: 'Trust Flow (Root)',
    description: 'Indicateur de confiance du domaine racine',
    color: '#14b8a6'
  },
  CF_root: {
    key: 'CF_root',
    label: 'Citation Flow (Root)',
    description: 'Indicateur de popularité du domaine racine',
    color: '#f43f5e'
  },
  TF_subdomain: {
    key: 'TF_subdomain',
    label: 'Trust Flow (Sous-domaine)',
    description: 'Indicateur de confiance du sous-domaine',
    color: '#06b6d4'
  },
  CF_subdomain: {
    key: 'CF_subdomain',
    label: 'Citation Flow (Sous-domaine)',
    description: 'Indicateur de popularité du sous-domaine',
    color: '#8b5cf6'
  }
};