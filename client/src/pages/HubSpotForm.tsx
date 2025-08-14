import React, { useEffect } from 'react';

declare global {
  interface Window {
    hbspt: any;
  }
}

const HubSpotForm: React.FC = () => {
  useEffect(() => {
    const scriptSrc = 'https://js-na2.hsforms.net/forms/embed/v2.js';

    function initializeForm() {
      if (window.hbspt && window.hbspt.forms && typeof window.hbspt.forms.create === 'function') {
        window.hbspt.forms.create({
          portalId: '243404213',
          formId: 'b3eae9dc-7f3f-4751-a5e0-db248a876d39',
          region: 'na2',
          target: '#hubspotForm'
        });
      }
    }

    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`) as HTMLScriptElement | null;
    if (existingScript) {
      initializeForm();
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = scriptSrc;
    script.onload = initializeForm;
    document.body.appendChild(script);

    return () => {
      // No-op cleanup; keep the script cached across navigations
    };
  }, []);

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <h2 className="mb-4">HubSpot Form</h2>
      <div id="hubspotForm" />
    </div>
  );
};

export default HubSpotForm;


