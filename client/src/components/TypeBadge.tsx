import React from 'react';

interface TypeBadgeProps {
  type: 'feature_request' | 'feature' | 'bug';
  confidence?: number;
  reasoning?: string;
  showConfidence?: boolean;
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ 
  type, 
  confidence, 
  reasoning, 
  showConfidence = true 
}) => {
  const isFeatureRequest = type === 'feature_request' || type === 'feature';
  
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'bg-green-500';
    if (conf >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-2">
      <span 
        className={`
          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
          ${isFeatureRequest 
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
          }
        `}
        role="status"
        aria-label={`Issue type: ${isFeatureRequest ? 'Feature Request' : 'Bug'}`}
      >
        {isFeatureRequest ? '✨' : '🐛'}
        <span className="ml-1">{isFeatureRequest ? 'Feature Request' : 'Bug'}</span>
      </span>
      
      {showConfidence && confidence !== undefined && (
        <div className="flex items-center gap-1">
          <div className="w-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${getConfidenceColor(confidence)}`}
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
          {reasoning && (
            <div className="group relative">
              <span 
                className="text-gray-400 hover:text-gray-600 cursor-help text-xs"
                role="button"
                tabIndex={0}
                aria-label="Show AI reasoning"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                  }
                }}
              >
                ℹ️
              </span>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                AI reasoning: {reasoning}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TypeBadge;
