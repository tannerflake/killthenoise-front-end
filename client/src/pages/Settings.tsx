import React, { useState } from 'react';
import GeneralSettings from '../components/GeneralSettings';
import IntegrationSettings from '../components/IntegrationSettings';
import TeamsSettings from '../components/TeamsSettings';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'teams'>('general');

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

                        {/* Tab Navigation */}
                  <div className="mb-6">
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-12">
                        <button
                          className={`py-4 px-3 border-b-2 font-semibold text-base ${
                            activeTab === 'general'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => setActiveTab('general')}
                        >
                          General Settings
                        </button>
                        <button
                          className={`py-4 px-3 border-b-2 font-semibold text-base ${
                            activeTab === 'integrations'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => setActiveTab('integrations')}
                        >
                          Integration Settings
                        </button>
                        <button
                          className={`py-4 px-3 border-b-2 font-semibold text-base ${
                            activeTab === 'teams'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => setActiveTab('teams')}
                        >
                          Teams
                        </button>
                      </nav>
                    </div>
                  </div>

                        {/* Tab Content */}
                  <div>
                    {activeTab === 'general' && (
                      <div>
                        <GeneralSettings />
                      </div>
                    )}
                    {activeTab === 'integrations' && (
                      <div>
                        <IntegrationSettings />
                      </div>
                    )}
                    {activeTab === 'teams' && (
                      <div>
                        <TeamsSettings />
                      </div>
                    )}
                  </div>
    </div>
  );
};

export default Settings;
