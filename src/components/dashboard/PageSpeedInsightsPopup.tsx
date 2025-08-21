import React from 'react';
import { X, Zap } from 'lucide-react';
import { useSmartPopupPosition } from '../../hooks/useSmartPopupPosition';
import { LighthouseScoreCircle } from './LighthouseScoreCircle';

interface PageSpeedInsightsPopupProps {
  siteUrl: string;
  onClose: () => void;
}

export const PageSpeedInsightsPopup: React.FC<PageSpeedInsightsPopupProps> = ({
  siteUrl,
  onClose
}) => {
  const { popupStyle } = useSmartPopupPosition();

  // Mock data for demonstration - replace with actual PageSpeed Insights API data
  const mockData = {
    mobile: {
      performance: 48,
      accessibility: 96,
      bestPractices: 100,
      seo: 100,
      coreWebVitals: {
        lcp: { value: 2.1, status: 'good' },
        fcp: { value: 1.8, status: 'good' },
        inp: { value: 150, status: 'needs-improvement' },
        cls: { value: 0.05, status: 'good' },
        ttfb: { value: 800, status: 'needs-improvement' }
      }
    },
    desktop: {
      performance: 85,
      accessibility: 98,
      bestPractices: 100,
      seo: 100,
      coreWebVitals: {
        lcp: { value: 1.2, status: 'good' },
        fcp: { value: 0.9, status: 'good' },
        inp: { value: 80, status: 'good' },
        cls: { value: 0.02, status: 'good' },
        ttfb: { value: 400, status: 'good' }
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-orange-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatValue = (metric: string, value: number) => {
    switch (metric) {
      case 'lcp':
      case 'fcp':
        return `${value}s`;
      case 'inp':
        return `${value}ms`;
      case 'cls':
        return value.toFixed(3);
      case 'ttfb':
        return `${value}ms`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={popupStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">PageSpeed Insights</h2>
              <p className="text-sm text-gray-600">{siteUrl}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Mobile Results */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              📱 Mobile
            </h3>
            
            {/* Lighthouse Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <LighthouseScoreCircle score={mockData.mobile.performance} size={70} />
                <p className="text-sm font-medium text-gray-700 mt-2">Performance</p>
              </div>
              <div className="text-center">
                <LighthouseScoreCircle score={mockData.mobile.accessibility} size={70} />
                <p className="text-sm font-medium text-gray-700 mt-2">Accessibility</p>
              </div>
              <div className="text-center">
                <LighthouseScoreCircle score={mockData.mobile.bestPractices} size={70} />
                <p className="text-sm font-medium text-gray-700 mt-2">Best Practices</p>
              </div>
              <div className="text-center">
                <LighthouseScoreCircle score={mockData.mobile.seo} size={70} />
                <p className="text-sm font-medium text-gray-700 mt-2">SEO</p>
              </div>
            </div>

            {/* Core Web Vitals */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Core Web Vitals</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(mockData.mobile.coreWebVitals).map(([metric, data]) => (
                  <div key={metric} className="text-center">
                    <div className={`text-lg font-semibold ${getStatusColor(data.status)}`}>
                      {formatValue(metric, data.value)}
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">
                      {metric}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Results */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              💻 Desktop
            </h3>
            
            {/* Lighthouse Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <LighthouseScoreCircle score={mockData.desktop.performance} size={70} />
                <p className="text-sm font-medium text-gray-700 mt-2">Performance</p>
              </div>
              <div className="text-center">
                <LighthouseScoreCircle score={mockData.desktop.accessibility} size={70} />
                <p className="text-sm font-medium text-gray-700 mt-2">Accessibility</p>
              </div>
              <div className="text-center">
                <LighthouseScoreCircle score={mockData.desktop.bestPractices} size={70} />
                <p className="text-sm font-medium text-gray-700 mt-2">Best Practices</p>
              </div>
              <div className="text-center">
                <LighthouseScoreCircle score={mockData.desktop.seo} size={70} />
                <p className="text-sm font-medium text-gray-700 mt-2">SEO</p>
              </div>
            </div>

            {/* Core Web Vitals */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Core Web Vitals</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(mockData.desktop.coreWebVitals).map(([metric, data]) => (
                  <div key={metric} className="text-center">
                    <div className={`text-lg font-semibold ${getStatusColor(data.status)}`}>
                      {formatValue(metric, data.value)}
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">
                      {metric}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};