import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AIChatbot from '@/components/chat/AIChatbot';
import { base44 } from '@/api/base44Client';

export default function Layout({ children, currentPageName }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await base44.auth.isAuthenticated();
      setIsAuthenticated(auth);
    };
    checkAuth();
  }, []);

  const noLayoutPages = ['Onboarding'];
  const showLayout = !noLayoutPages.includes(currentPageName);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <style>{`
        :root {
          --color-primary: #0d9488;
          --color-primary-light: #14b8a6;
          --color-primary-dark: #0f766e;
          --color-secondary: #0ea5e9;
          --color-accent: #f59e0b;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {showLayout && <Header />}
      
      <main className={`flex-1 ${showLayout ? 'pt-24 md:pt-28' : ''}`}>
        {children}
      </main>
      
      {showLayout && <Footer />}
      {showLayout && <AIChatbot />}
    </div>
  );
}