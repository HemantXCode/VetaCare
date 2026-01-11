import React from 'react';

export default function Layout({ children, currentPageName }) {
  // Pages that have their own full layout (navbar, emergency bar, etc.)
  const fullLayoutPages = ['Dashboard', 'Emergency', 'PatientCorner', 'Hospitals', 'Specialists', 'Wellness'];
  
  // Onboarding page has its own design
  if (currentPageName === 'Onboarding') {
    return <>{children}</>;
  }

  // For pages with full layout, just render children
  if (fullLayoutPages.includes(currentPageName)) {
    return <>{children}</>;
  }

  // Default layout for other pages
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}