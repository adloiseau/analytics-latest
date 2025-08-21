import React, { useState } from 'react';

interface CoreWebVitalsTooltipProps {
  metricType: string;
  value: number;
  unit: string;
  children: React.ReactNode;
}

const CORE_WEB_VITALS_THRESHOLDS = {
  LCP: {
    name: 'Largest Contentful Paint (LCP)',
    good: { max: 2.5, emoji: '🟢', label: 'Good' },
    needsImprovement: { min: 2.5, max: 4, emoji: '🟡', label: 'Needs improvement' },
    poor: { min: 4, emoji: '🔴', label: 'Poor' },
    unit: 's',
    description: 'Page loads'
  },
  INP: {
    name: 'Interaction to Next Paint (INP)',
    good: { max: 200, emoji: '🟢', label: 'Good' },
    needsImprovement: { min: 200, max: 500, emoji: '🟡', label: 'Needs improvement' },
    poor: { min: 500, emoji: '🔴', label: 'Poor' },
    unit: 'ms',
    description: 'Page loads'
  },
  CLS: {
    name: 'Cumulative Layout Shift (CLS)',
    good: { max: 0.1, emoji: '🟢', label: 'Good' },
    needsImprovement: { min: 0.1, max: 0.25, emoji: '🟡', label: 'Needs improvement' },
    poor: { min: 0.25, emoji: '🔴', label: 'Poor' },
    unit: '',
    description: 'Page loads'
  },
  FCP: {
    name: 'First Contentful Paint (FCP)',
    good: { max: 1.8, emoji: '🟢', label: 'Good' },
    needsImprovement: { min: 1.8, max: 3, emoji: '🟡', label: 'Needs improvement' },
    poor: { min: 3, emoji: '🔴', label: 'Poor' },
    unit: 's',
    description: 'Page loads'
  },
  TTFB: {
    name: 'Time to First Byte (TTFB)',
    good: { max: 0.8, emoji: '🟢', label: 'Good' },
    needsImprovement: { min: 0.8, max: 1.8, emoji: '🟡', label: 'Needs improvement' },
    poor: { min: 1.8, emoji: '🔴', label: 'Poor' },
    unit: 's',
    description: 'Page loads'
  }
};

export const CoreWebVitalsTooltip: React.FC<CoreWebVitalsTooltipProps> = ({
  metricType,
  value,
  unit,
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Extraire le type de métrique (LCP, INP, etc.) du metricType
  const baseMetricType = metricType.replace(/_HOME|_ARTICLE/g, '');
  const thresholds = CORE_WEB_VITALS_THRESHOLDS[baseMetricType];

  if (!thresholds) {
    return <>{children}</>;
  }

  // Convertir la valeur selon l'unité attendue
  let normalizedValue = value;
  if (thresholds.unit === 's' && unit === 'ms') {
    normalizedValue = value / 1000;
  } else if (thresholds.unit === 'ms' && unit === 's') {
    normalizedValue = value * 1000;
  }

  // Déterminer le statut actuel
  const getCurrentStatus = () => {
    if (normalizedValue <= thresholds.good.max) {
      return thresholds.good;
    } else if (normalizedValue <= thresholds.needsImprovement.max) {
      return thresholds.needsImprovement;
    } else {
      return thresholds.poor;
    }
  };

  const currentStatus = getCurrentStatus();

  const formatThreshold = (threshold: number) => {
    if (thresholds.unit === 's') {
      return `${threshold} s`;
    } else if (thresholds.unit === 'ms') {
      return `${threshold} ms`;
    } else {
      return threshold.toString();
    }
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      
      {isVisible && (
        <div className="fixed z-[100] bg-[#1a1b1e] border border-gray-700/50 rounded-lg shadow-xl p-3 
                      backdrop-blur-sm max-w-[250px] pointer-events-none"
             style={{
               left: '50%',
               top: '50%',
               transform: 'translate(-50%, -50%)'
             }}>
          
          {/* Header avec nom de la métrique et statut actuel */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{currentStatus.emoji}</span>
              <h4 className="text-white font-semibold text-xs">{thresholds.name}</h4>
            </div>
            <div className="text-sm font-bold text-white">
              {thresholds.unit === 's' ? `${(normalizedValue).toFixed(2)} s` : 
               thresholds.unit === 'ms' ? `${Math.round(normalizedValue)} ms` : 
               normalizedValue.toFixed(3)}
            </div>
          </div>

          {/* Seuils compacts */}
          <div className="space-y-1">
            <div className="text-xs text-gray-400 mb-1">{thresholds.description}</div>
            
            <div className="flex items-center gap-1 text-xs">
              <span className="text-xs">{thresholds.good.emoji}</span>
              <span className="text-green-400 font-medium">{thresholds.good.label}</span>
              <span className="text-gray-400">
                (≤ {formatThreshold(thresholds.good.max)})
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-xs">
              <span className="text-xs">{thresholds.needsImprovement.emoji}</span>
              <span className="text-yellow-400 font-medium">{thresholds.needsImprovement.label}</span>
              <span className="text-gray-400">
                ({formatThreshold(thresholds.needsImprovement.min)} - {formatThreshold(thresholds.needsImprovement.max)})
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-xs">
              <span className="text-xs">{thresholds.poor.emoji}</span>
              <span className="text-red-400 font-medium">{thresholds.poor.label}</span>
              <span className="text-gray-400">
                (&gt; {formatThreshold(thresholds.poor.min)})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};