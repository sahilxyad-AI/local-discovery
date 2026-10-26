import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import ChatView from './components/Chat/ChatView';
import ExploreView from './components/Explore/ExploreView';
import OwnerPortal from './components/Owner/OwnerPortal';
import AdminPortal from './components/Admin/AdminPortal';
import BusinessDetailsModal from './components/Business/BusinessDetailsModal';
import CompareModal from './components/Business/CompareModal';
import AuthModal from './components/Modals/AuthModal';
import InquiryModal from './components/Modals/InquiryModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

function ToastContainer() {
  const { toasts } = useApp();
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl shadow-xl border text-xs font-medium animate-in slide-in-from-bottom-2 ${
            t.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/90 dark:text-emerald-100 dark:border-emerald-800'
              : t.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/90 dark:text-rose-100 dark:border-rose-800'
              : t.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/90 dark:text-amber-100 dark:border-amber-800'
              : 'bg-slate-900 text-white border-slate-700 dark:bg-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
            {t.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-brand-400 shrink-0" />}
            <span>{t.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MainContent() {
  const { activeTab } = useApp();

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {activeTab === 'chat' && <ChatView />}
      {activeTab === 'explore' && <ExploreView />}
      {activeTab === 'owner' && <OwnerPortal />}
      {activeTab === 'admin' && <AdminPortal />}

      {/* Global Modals */}
      <BusinessDetailsModal />
      <CompareModal />
      <AuthModal />
      <InquiryModal />
      <ToastContainer />
    </main>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
        <Navbar />
        <MainContent />
      </div>
    </AppProvider>
  );
}
