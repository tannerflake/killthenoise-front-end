import React from 'react';

interface TypeFilterProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedJiraStatus: string;
  onJiraStatusChange: (status: string) => void;
  selectedSeverity: string;
  onSeverityChange: (severity: string) => void;
}

const TypeFilter: React.FC<TypeFilterProps> = ({ 
  selectedType, 
  onTypeChange, 
  selectedJiraStatus, 
  onJiraStatusChange,
  selectedSeverity,
  onSeverityChange
}) => {
  return (
    <div className="flex flex-wrap items-start gap-4">
      {/* Type Filter */}
      <div className="flex flex-col">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Issue Type</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onTypeChange('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedType === 'all' 
                ? 'bg-blue-500 text-white shadow-md transform scale-105' 
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:shadow-sm'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onTypeChange('feature_request')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedType === 'feature_request' 
                ? 'bg-emerald-500 text-white shadow-md transform scale-105' 
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:shadow-sm'
            }`}
          >
            ✨ Feature Requests
          </button>
          <button
            onClick={() => onTypeChange('bug')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedType === 'bug' 
                ? 'bg-red-500 text-white shadow-md transform scale-105' 
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:shadow-sm'
            }`}
          >
            🐛 Bugs
          </button>
        </div>
      </div>

      {/* Pipe Separator */}
      <div className="text-gray-400 font-medium mt-6 text-lg">|</div>

      {/* Jira Ticket Status Filter */}
      <div className="flex flex-col">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Jira Ticket Status</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onJiraStatusChange('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedJiraStatus === 'all' 
                ? 'bg-blue-500 text-white shadow-md transform scale-105' 
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:shadow-sm'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onJiraStatusChange('no_ticket')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedJiraStatus === 'no_ticket' 
                ? 'bg-red-500 text-white shadow-md transform scale-105' 
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:shadow-sm'
            }`}
          >
            No Jira Ticket
          </button>
          <button
            onClick={() => onJiraStatusChange('has_ticket')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedJiraStatus === 'has_ticket' 
                ? 'bg-green-500 text-white shadow-md transform scale-105' 
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:shadow-sm'
            }`}
          >
            Has a Jira Ticket
          </button>
        </div>
      </div>

      {/* Pipe Separator */}
      <div className="text-gray-400 font-medium mt-6 text-lg">|</div>

      {/* Severity Filter */}
      <div className="flex flex-col">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Severity Level</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSeverityChange('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedSeverity === 'all' 
                ? 'bg-blue-500 text-white shadow-md transform scale-105' 
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:shadow-sm'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onSeverityChange('80+')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedSeverity === '80+' 
                ? 'bg-red-500 text-white shadow-md transform scale-105' 
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:shadow-sm'
            }`}
          >
            80+ Severity
          </button>
          <button
            onClick={() => onSeverityChange('<80')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedSeverity === '<80' 
                ? 'bg-orange-500 text-white shadow-md transform scale-105' 
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:shadow-sm'
            }`}
          >
            &lt;80 Severity
          </button>
        </div>
      </div>

    </div>
  );
};

export default TypeFilter;
