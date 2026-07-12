import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { FlowProvider, useFlow } from './context/FlowContext';
import {
  Frame1,
  Frame11,
  Frame12,
  Frame2,
  Frame3,
  Frame4,
  Frame5,
  Frame6,
  Frame7,
  Frame8,
  Frame9,
  Frame10,
} from './components/Frames';
import { Shield, HardDrive } from 'lucide-react';
import { LanguageToggle } from './components/LanguageToggle'; // <--- Added

const STEP_TO_PATH: Record<number, string> = {
  1: '/',
  11: '/demo-create',
  12: '/demo-confirm',
  2: '/emergency-login',
  3: '/security-questions',
  4: '/mobile-status',
  5: '/action-panel',
  6: '/immediate-lock',
  7: '/admin-wait',
  8: '/admin-responded',
  9: '/auto-action-switch',
  10: '/auto-action-complete',
};

// Route Guard component that enforces strict step-by-step sequential flow
const FlowRouteGuard: React.FC<{ step: number; children: React.ReactElement }> = ({
  step,
  children,
}) => {
  const { currentStep } = useFlow();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentStep !== step) {
      const targetPath = STEP_TO_PATH[currentStep] || '/';
      navigate(targetPath, { replace: true });
    }
  }, [currentStep, step, navigate]);

  return currentStep === step ? children : (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-rose-500"></div>
    </div>
  );
};

// Layout with header, navigation highlights and theme controls
// const AppLayout: React.FC = () => {
//   const { currentStep, resetFlow } = useFlow();

//   return (
//     <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 selection:bg-rose-500/20 selection:text-rose-300">
const AppLayout: React.FC = () => {
  const { currentStep, resetFlow } = useFlow();

  return (
    // CHANGE THIS WRAPPER LINE TO MATCH THIS:
    // <div className="min-h-[100dvh] w-full bg-slate-950 flex flex-col justify-between relative overflow-x-hidden text-slate-100 selection:bg-rose-500/20 selection:text-rose-300">
    <div className="min-h-[100dvh] w-full bg-slate-900 flex flex-col justify-between relative overflow-x-hidden text-slate-100 selection:bg-rose-500/20 selection:text-rose-300">
      {/* Decorative background grid and ambient lighting */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      {/* Glowing accent ball */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none"></div>


      {/*Modifications here*/}
      {/* Header */}
      {/* <header className="relative z-10 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4"> */}
      <header className="relative z-10 border-b border-slate-900 bg-slate-900/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 text-rose-500">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-200 tracking-tight block">DemoApp Remote Lock</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Security Portal</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            
            {/* INJECTED GLOBALLY HERE */}
            <LanguageToggle />
            
            <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-3.5 py-1.5 text-xs text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Demo Mode Active
            </div>
            {currentStep > 1 && (
              <button
                onClick={resetFlow}
                className="text-xs px-3.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/40 hover:border-rose-800 text-rose-300 font-semibold rounded-lg transition-all"
              >
                Reset Flow
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Flow Container */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<FlowRouteGuard step={1}><Frame1 /></FlowRouteGuard>} />
          <Route path="/demo-create" element={<FlowRouteGuard step={11}><Frame11 /></FlowRouteGuard>} />
          <Route path="/demo-confirm" element={<FlowRouteGuard step={12}><Frame12 /></FlowRouteGuard>} />
          <Route path="/emergency-login" element={<FlowRouteGuard step={2}><Frame2 /></FlowRouteGuard>} />
          <Route path="/security-questions" element={<FlowRouteGuard step={3}><Frame3 /></FlowRouteGuard>} />
          <Route path="/mobile-status" element={<FlowRouteGuard step={4}><Frame4 /></FlowRouteGuard>} />
          <Route path="/action-panel" element={<FlowRouteGuard step={5}><Frame5 /></FlowRouteGuard>} />
          <Route path="/immediate-lock" element={<FlowRouteGuard step={6}><Frame6 /></FlowRouteGuard>} />
          <Route path="/admin-wait" element={<FlowRouteGuard step={7}><Frame7 /></FlowRouteGuard>} />
          <Route path="/admin-responded" element={<FlowRouteGuard step={8}><Frame8 /></FlowRouteGuard>} />
          <Route path="/auto-action-switch" element={<FlowRouteGuard step={9}><Frame9 /></FlowRouteGuard>} />
          <Route path="/auto-action-complete" element={<FlowRouteGuard step={10}><Frame10 /></FlowRouteGuard>} />
          <Route path="*" element={<FlowRouteGuard step={1}><Frame1 /></FlowRouteGuard>} />
        </Routes>
      </main>

      {/* Footer */}
      {/* <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-5 text-center text-xs text-slate-500"> */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-900/80 backdrop-blur-md px-6 py-5 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-slate-400">
            <HardDrive className="w-4 h-4 text-rose-500" />
            <span>Interactive Database Simulator (Supabase Client Direct)</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Sentinel Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <FlowProvider>
        <AppLayout />
      </FlowProvider>
    </BrowserRouter>
  );
}

export default App;
