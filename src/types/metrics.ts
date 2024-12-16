export interface SiteMetrics {
  id: number;
  site_url: string;
  date: string;
  metric_type: 'TO' | 'AS' | 'BL' | 'RD' | 'KD' | 'VI' | 'TF' | 'CF';
  value: number;
}

export interface MetricDefinition {
  key: string;
  label: string;
  description: string;
  color: string;
}

export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  TO: {
    key: 'TO',
    label: 'Trafic organique',
    description: 'Nombre de visiteurs provenant des moteurs de recherche',
    color: '#3b82f6'
  },
  AS: {
    key: 'AS',
    label: 'Authority Score',
    description: 'Score d\'autorité du domaine',
    color: '#10b981'
  },
  BL: {
    key: 'BL',
    label: 'Backlinks',
    description: 'Nombre total de backlinks',
    color: '#8b5cf6'
  },
  RD: {
    key: 'RD',
    label: 'Domaines référents',
    description: 'Nombre de domaines uniques pointant vers le site',
    color: '#f59e0b'
  },
  KD: {
    key: 'KD',
    label: 'Keywords',
    description: 'Nombre de mots-clés en première page',
    color: '#ec4899'
  },
  VI: {
    key: 'VI',
    label: 'Indice de visibilité',
    description: 'Pourcentage de visibilité dans les résultats de recherche',
    color: '#6366f1'
  },
  TF: {
    key: 'TF',
    label: 'Trust Flow',
    description: 'Indicateur de confiance',
    color: '#14b8a6'
  },
  CF: {
    key: 'CF',
    label: 'Citation Flow',
    description: 'Indicateur de popularité',
    color: '#f43f5e'
  }
};