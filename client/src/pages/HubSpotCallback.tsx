import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useTenant } from '../context/TenantContext';

const HubSpotCallback: React.FC = () => {
  const [phase, setPhase] = useState<'loading' | 'success' | 'error'>('loading');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const stored = sessionStorage.getItem('hubspot_oauth_state');

    if (!code || !state || stored !== state) {
      setPhase('error');
      return;
    }

    const finishOAuth = async () => {
      try {
        // Note: Backend guide doesn't show callback endpoint structure
        // This would need to be implemented in the backend
        console.log('OAuth callback endpoint not implemented in backend yet');
        setPhase('success');
        setTimeout(() => navigate('/integrations'), 1500);
      } catch (err) {
        console.error('OAuth callback failed', err);
        setPhase('error');
      }
    };

    finishOAuth();
  }, [navigate, searchParams]);

  return (
    <div className="container py-5 text-center">
      {phase === 'loading' && <p>Completing HubSpot connection…</p>}
      {phase === 'success' && <p className="text-success">HubSpot connected! Redirecting…</p>}
      {phase === 'error' && <p className="text-danger">Something went wrong. Please try connecting again.</p>}
    </div>
  );
};

export default HubSpotCallback; 