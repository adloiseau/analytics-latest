import React from 'react';

interface LighthouseScoreCircleProps {
  score: number;
  size?: number;
  compact?: boolean;
}

export const LighthouseScoreCircle: React.FC<LighthouseScoreCircleProps> = ({ 
  score, 
  size = 60,
  compact = false 
}) => {
  // Déterminer la couleur selon le score Lighthouse
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981'; // Vert (Good)
    if (score >= 50) return '#f59e0b'; // Orange (Needs improvement)
    return '#ef4444'; // Rouge (Poor)
  };

  // Déterminer la couleur de fond selon le score
  const getBackgroundColor = (score: number) => {
    if (score >= 90) return '#10b981'; // Vert
    if (score >= 50) return '#f59e0b'; // Orange
    return '#ef4444'; // Rouge
  };

  const color = getScoreColor(score);
  const backgroundColor = getBackgroundColor(score);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Cercle de fond */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#374151"
          strokeWidth="4"
          fill="none"
          opacity="0.3"
        />
        
        {/* Cercle de progression */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 4px ${backgroundColor}40)`
          }}
        />
      </svg>
      
      {/* Score au centre */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ 
          fontSize: compact ? '10px' : size > 50 ? '14px' : '12px',
          fontWeight: 'bold',
          color: color
        }}
      >
        {score}
      </div>
    </div>
  );
};