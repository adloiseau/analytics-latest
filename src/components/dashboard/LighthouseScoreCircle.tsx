import React from 'react';

interface LighthouseScoreCircleProps {
  score: number;
  size?: number;
  compact?: boolean;
  showLabel?: boolean;
  label?: string;
}

export const LighthouseScoreCircle: React.FC<LighthouseScoreCircleProps> = ({ 
  score, 
  size = 80,
  compact = false,
  showLabel = false,
  label = ''
}) => {
  // Déterminer la couleur selon le score Lighthouse (comme PageSpeed Insights)
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#0cce6b'; // Vert PageSpeed
    if (score >= 50) return '#ffa400'; // Orange PageSpeed
    return '#ff5722'; // Rouge PageSpeed
  };

  const color = getScoreColor(score);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Cercle de fond gris */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="6"
            fill="none"
            opacity="0.2"
          />
          
          {/* Cercle de progression coloré */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${color}40)`
            }}
          />
        </svg>
        
        {/* Score au centre */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            fontSize: compact ? '12px' : size > 60 ? '18px' : '14px',
            fontWeight: 'bold',
            color: color
          }}
        >
          {score}
        </div>
      </div>
      
      {/* Label en dessous si demandé */}
      {showLabel && label && (
        <div className="mt-2 text-xs text-gray-400 text-center font-medium">
          {label}
        </div>
      )}
    </div>
  );
};