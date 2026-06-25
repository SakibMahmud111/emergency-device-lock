import { Zap, ShieldAlert } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useFlow } from '../context/FlowContext';
import type { UserProfile } from '../context/FlowContext';
import { supabase } from '../lib/supabase';
import { 
  Shield, 
  Smartphone, 
  UserCheck, 
  Lock, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Clock, 
  Settings, 
  RefreshCw, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// import { LanguageToggle } from './LanguageToggle';
import { translations } from '../constants/translations';

//modifications
// Wrapper component to give all frames a consistent premium glass layout
const FrameCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ 
  title, 
  subtitle, 
  children 
}) => {
  return (
    <div className="relative w-full max-w-md p-8 glass-panel rounded-2xl glow-rose animate-slide-up border-rose-500/20">
      <div className="flex justify-center mb-6">
        <div className="p-3 bg-rose-500/10 rounded-full border border-rose-500/20 text-rose-500">
          <Shield className="w-8 h-8 animate-pulse-slow" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center text-slate-100 tracking-tight mb-1">{title}</h2>
      {subtitle && <p className="text-slate-400 text-sm text-center mb-6">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
};

// ==========================================
// FRAME 1: HOME
// ==========================================
export const Frame1: React.FC = () => {
  const { navigateToStep, errorMsg, setErrorMsg, language } = useFlow();
  const t = translations[language];

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, setErrorMsg]);

  return (
    <FrameCard title={t.f1_title} subtitle={t.f1_subtitle}>
      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-950/60 border border-rose-800/80 text-rose-200 rounded-xl flex items-start gap-3 text-sm text-left animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">{t.f1_alert}</span>
            {errorMsg}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={() => navigateToStep(2)}
          className="w-full py-4 px-6 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 active:scale-[0.98] transition-all text-white font-semibold rounded-xl shadow-lg shadow-rose-950/30 flex items-center justify-center gap-2 group"
        >
          <Smartphone className="w-5 h-5 group-hover:animate-bounce" />
          {t.f1_reportBtn}
        </button>

        <button
          onClick={() => navigateToStep(11)}
          className="w-full py-4 px-6 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 active:scale-[0.98] transition-all text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-2"
        >
          <Settings className="w-5 h-5 text-slate-400" />
          {t.f1_demoBtn}
        </button>
      </div>

      <div className="mt-8 text-center text-xs text-slate-500">
        {t.f1_footer}
      </div>
    </FrameCard>
  );
};

// ==========================================
// FRAME 11: DEMO CREATE ACCOUNT
// ==========================================
export const Frame11: React.FC = () => {
  const { navigateToStep, setUserProfile, language } = useFlow();
  const t = translations[language];
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [birthCity, setBirthCity] = useState('');
  const [childhoodFriend, setChildhoodFriend] = useState('');
  const [role, setRole] = useState<'Salesman' | 'Manager'>('Salesman');
  
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showMemTip, setShowMemTip] = useState(false);

  const handleQuickFill = () => {
    setUsername('test');
    setPassword('test');
    setBirthCity('Boston');
    setChildhoodFriend('Alex');
    setRole('Salesman');
    setShowMemTip(true);
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !birthCity || !childhoodFriend) {
      setValidationError('Please fill in all fields or use Quick Fill.');
      return;
    }

    setLoading(true);
    setValidationError('');

    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{ username, password, role, birth_city: birthCity, childhood_friend: childhoodFriend, mobile_logged_in: true, account_locked: false, failed_attempts: 0 }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({ password, role, birth_city: birthCity, childhood_friend: childhoodFriend, mobile_logged_in: true, account_locked: false, failed_attempts: 0 })
            .eq('username', username)
            .select()
            .single();

          if (!updateError && updatedUser) {
            setUserProfile(updatedUser as UserProfile);
            navigateToStep(12);
            return;
          }
        }
        throw error;
      }

      if (data) {
        setUserProfile(data as UserProfile);
        navigateToStep(12);
      }
    } catch (err: any) {
      setValidationError(err.message || 'Failed to sync user data in Supabase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FrameCard title={t.f11_title} subtitle={t.f11_subtitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && (
          <div className="p-3 bg-red-950/40 border border-red-900/60 text-red-200 rounded-lg text-xs">
            {validationError}
          </div>
        )}

        <div className="flex justify-end">
          <button type="button" onClick={handleQuickFill} className="text-xs px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-md hover:bg-rose-500/20 transition-all font-medium flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            {t.f11_quickFill}
          </button>
        </div>

        {showMemTip && (
          <div className="p-3 bg-slate-900 border border-amber-500/20 text-amber-400 rounded-lg text-xs leading-relaxed">
            <span className="font-semibold text-slate-200 block mb-1">{t.f11_memTip}</span>
            {t.f11_memDesc}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t.f11_username}</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors text-sm" placeholder={t.f11_usernamePlaceholder} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t.f11_password}</label>
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors text-sm" placeholder={t.f11_passwordPlaceholder} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t.f11_birthCity}</label>
            <input type="text" value={birthCity} onChange={(e) => setBirthCity(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors text-sm" placeholder={t.f11_cityPlaceholder} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t.f11_childhoodFriend}</label>
            <input type="text" value={childhoodFriend} onChange={(e) => setChildhoodFriend(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors text-sm" placeholder={t.f11_friendPlaceholder} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t.f11_roleProfile}</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setRole('Salesman')} className={`py-3 px-4 border rounded-xl text-sm font-semibold transition-all ${role === 'Salesman' ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'}`}>{t.salesman}</button>
            <button type="button" onClick={() => setRole('Manager')} className={`py-3 px-4 border rounded-xl text-sm font-semibold transition-all ${role === 'Manager' ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'}`}>{t.manager}</button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full mt-4 py-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
          {loading ? t.f11_loadingBtn : t.f11_loginBtn}
        </button>

        <button type="button" onClick={() => navigateToStep(1)} className="w-full py-2.5 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors">
          {t.cancelExit}
        </button>
      </form>
    </FrameCard>
  );
};

// ==========================================
// FRAME 12: DEMO CONFIRMATION
// ==========================================
export const Frame12: React.FC = () => {
  const { navigateToStep, userProfile, language } = useFlow();
  const t = translations[language];

  return (
    <FrameCard title={t.f12_title} subtitle={t.f12_subtitle}>
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-500">
            <CheckCircle className="w-12 h-12" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left space-y-2">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t.f12_sessionHeader}</div>
          <div className="text-slate-200 text-sm"><span className="font-semibold text-slate-400">{t.f12_userLabel}</span> {userProfile?.username}</div>
          <div className="text-slate-200 text-sm"><span className="font-semibold text-slate-400">{t.f12_roleLabel}</span> {userProfile?.role === 'Manager' ? t.manager : t.salesman}</div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed">{t.f12_desc}</p>

        <button onClick={() => navigateToStep(2)} className="w-full py-4 px-6 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all">
          {t.f12_reportBtn}
        </button>
      </div>
    </FrameCard>
  );
};

// ==========================================
// FRAME 2: EMERGENCY LOGIN PORTAL
// ==========================================
export const Frame2: React.FC = () => {
  const { navigateToStep, setUserProfile, language } = useFlow();
  const t = translations[language];

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (attemptedRole: 'Salesman' | 'Manager') => {
    if (!username || !password) { setError('Please provide username and password.'); return; }
    setLoading(true); setError('');

    try {
      const { data, error: dbError } = await supabase.from('users').select('*').eq('username', username).single();
      if (dbError || !data) throw new Error('Invalid credentials or user does not exist.');
      const user = data as UserProfile;
      if (user.account_locked) throw new Error('This account has been locked for security reasons.');
      if (user.password !== password) throw new Error('Invalid password. Check credentials.');
      if (user.role !== attemptedRole) throw new Error(`Role mismatch. You selected Log in as ${attemptedRole}, but the account has role: ${user.role}.`);

      setUserProfile(user);
      navigateToStep(3);
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FrameCard title={t.f2_title} subtitle={t.f2_subtitle}>
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-900/60 text-red-200 rounded-lg text-xs leading-relaxed text-left flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /><span>{error}</span>
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t.f11_username}</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors text-sm" placeholder={t.f11_username} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t.f11_password}</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-xl pl-4 pr-12 py-3 text-slate-200 focus:outline-none transition-colors text-sm" placeholder={t.f11_password} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={() => handleLogin('Salesman')} disabled={loading} className="py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-all">{t.f2_loginSalesman}</button>
          <button onClick={() => handleLogin('Manager')} disabled={loading} className="py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-all">{t.f2_loginManager}</button>
        </div>
        <button onClick={() => navigateToStep(1)} className="w-full py-2.5 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors">{t.cancelHome}</button>
      </div>
    </FrameCard>
  );
};

// ==========================================
// FRAME 3: SECURITY QUESTIONS
// ==========================================
export const Frame3: React.FC = () => {
  const { navigateToStep, userProfile, setUserProfile, setErrorMsg, language } = useFlow();
  const t = translations[language];

  const [cityInput, setCityInput] = useState('');
  const [friendInput, setFriendInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setLoading(true); setErrorMessage('');

    const normalizedCityInput = cityInput.trim().toLowerCase();
    const normalizedFriendInput = friendInput.trim().toLowerCase();
    const actualCity = userProfile.birth_city.trim().toLowerCase();
    const actualFriend = userProfile.childhood_friend.trim().toLowerCase();

    if (normalizedCityInput === actualCity && normalizedFriendInput === actualFriend) {
      setLoading(false); navigateToStep(4);
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      try {
        await supabase.from('users').update({ failed_attempts: nextAttempts }).eq('username', userProfile.username);
        if (nextAttempts >= 3) {
          await supabase.from('users').update({ account_locked: true }).eq('username', userProfile.username);
          setUserProfile(null);
          setErrorMsg('Your account is locked for security reasons due to too many failed security attempts.');
          navigateToStep(1);
        } else {
          setErrorMessage(`Incorrect answers. Attempt ${nextAttempts}/3. Please try again.`);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Database update error.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <FrameCard title={t.f3_title} subtitle={t.f3_subtitle}>
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">{t.f3_attempts}</span>
          <span className={`text-sm font-bold ${attempts >= 2 ? 'text-red-500' : 'text-rose-400'}`}>{attempts}/3</span>
        </div>
        {errorMessage && (
          <div className="p-3 bg-red-950/40 border border-red-900/60 text-red-200 rounded-lg text-xs leading-relaxed text-left flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /><span>{errorMessage}</span>
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t.f3_q1}</label>
          <input type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)} disabled={loading} className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors text-sm" placeholder={t.f3_q1Placeholder} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t.f3_q2}</label>
          <input type="text" value={friendInput} onChange={(e) => setFriendInput(e.target.value)} disabled={loading} className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors text-sm" placeholder={t.f3_q2Placeholder} />
        </div>
        <button type="submit" disabled={loading} className="w-full mt-4 py-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
          {t.f3_verifyBtn}
        </button>
        <button type="button" onClick={() => { setUserProfile(null); navigateToStep(1); }} className="w-full py-2.5 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors">
          {t.cancelDisconnect}
        </button>
      </form>
    </FrameCard>
  );
};

// ==========================================
// FRAME 4: MOBILE STATUS IN
// ==========================================
export const Frame4: React.FC = () => {
  const { navigateToStep, updateMobileStatus, language } = useFlow();
  const t = translations[language];
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const success = await updateMobileStatus(false);
    setLoading(false);
    if (success) navigateToStep(5);
  };

  return (
    <FrameCard title={t.f4_title} subtitle={t.f4_subtitle}>
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500 animate-pulse"><Smartphone className="w-12 h-12" /></div>
        </div>
        <div className="py-2.5 px-4 bg-amber-950/20 border border-amber-500/20 rounded-xl inline-flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
          <span className="text-amber-400 font-semibold text-sm">{t.f4_status}</span>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">{t.f4_desc}</p>
        <button onClick={handleLogout} disabled={loading} className="w-full py-4 px-6 bg-gradient-to-r from-amber-600 to-rose-700 hover:from-amber-500 hover:to-rose-600 text-white font-semibold rounded-xl shadow-lg transition-all">
          {loading ? t.f4_loadingBtn : t.f4_logoutBtn}
        </button>
      </div>
    </FrameCard>
  );
};

// ==========================================
// FRAME 5: SECURITY LOCKDOWN PANEL
// ==========================================
export const Frame5: React.FC = () => {
  const { navigateToStep, lockUserAccount, language } = useFlow();
  const t = translations[language];
  const [loading, setLoading] = useState(false);

  const handleImmediateLock = async () => {
    setLoading(true);
    const success = await lockUserAccount();
    setLoading(false);
    if (success) navigateToStep(6);
  };

  return (
    <FrameCard title={t.f5_title} subtitle={t.f5_subtitle}>
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-500"><CheckCircle className="w-12 h-12" /></div>
        </div>
        <div className="text-center">
          <div className="py-2 px-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-emerald-400 font-semibold text-sm">{t.f5_statusBadge}</span>
          </div>
        </div>
        <div className="space-y-1 pt-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{t.f5_protocolLabel}</label>
          <p className="text-xs text-slate-500">{t.f5_protocolDesc}</p>
        </div>
        <div className="space-y-3">
          <button type="button" onClick={handleImmediateLock} disabled={loading} className="w-full text-left p-4 bg-slate-950 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-900/40 rounded-xl transition-all group flex gap-4 items-start disabled:opacity-60">
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 group-hover:bg-rose-500/20 transition-colors mt-0.5"><Zap className="w-5 h-5" /></div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-200 group-hover:text-rose-400 transition-colors">{loading ? t.f5_opt1Loading : t.f5_opt1Title}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.f5_opt1Desc}</p>
            </div>
          </button>
          <button type="button" onClick={() => navigateToStep(7)} disabled={loading} className="w-full text-left p-4 bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/40 rounded-xl transition-all group flex gap-4 items-start disabled:opacity-60">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 group-hover:bg-amber-500/20 transition-colors mt-0.5"><ShieldAlert className="w-5 h-5" /></div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">{t.f5_opt2Title}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.f5_opt2Desc}</p>
            </div>
          </button>
        </div>
      </div>
    </FrameCard>
  );
};

// ==========================================
// FRAME 6: IMMEDIATE LOCK
// ==========================================
export const Frame6: React.FC = () => {
  const { resetFlow, language } = useFlow();
  const t = translations[language];

  return (
    <FrameCard title={t.f6_title} subtitle={t.f6_subtitle}>
      <div className="space-y-6 text-center">
        <div className="flex justify-center animate-bounce">
          <div className="p-4 bg-rose-500/20 rounded-full border-2 border-rose-500 text-rose-500"><Lock className="w-16 h-16" /></div>
        </div>
        <div className="space-y-2">
          <p className="text-xl font-bold text-slate-200">{t.f6_locked}</p>
          <p className="text-slate-400 text-sm leading-relaxed">{t.f6_desc}</p>
        </div>
        <button onClick={resetFlow} className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold rounded-xl shadow-lg transition-all">
          {t.logout}
        </button>
      </div>
    </FrameCard>
  );
};

// ==========================================
// FRAME 7: ADMIN WAIT
// ==========================================
export const Frame7: React.FC = () => {
  const { navigateToStep, lockUserAccount, language } = useFlow();
  const t = translations[language];
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (timeLeft === 0) { lockUserAccount().then(() => { navigateToStep(9); }); }
  }, [timeLeft, navigateToStep, lockUserAccount]);

  const handleAdminAction = async (adminResponded: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    await lockUserAccount();
    if (adminResponded) { navigateToStep(8); } else { navigateToStep(9); }
  };

  return (
    <FrameCard title={t.f7_title} subtitle={t.f7_subtitle}>
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="relative flex items-center justify-center">
            <Clock className="w-16 h-16 text-rose-500/30 animate-pulse-slow" />
            <div className="absolute text-xl font-bold text-rose-400 font-mono">{timeLeft}s</div>
          </div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          {t.f7_wait1} <span className="font-semibold text-rose-400 font-mono">{timeLeft} {t.f7_wait2}</span>.
        </p>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-amber-500 font-semibold flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /><span>{t.f7_alert}</span>
        </div>
        <div className="mt-8 pt-4 border-t border-slate-900 space-y-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{t.f7_sandbox}</div>
          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={() => handleAdminAction(true)} className="py-2.5 px-3 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold transition-all">{t.f7_adminResponds}</button>
            <button onClick={() => handleAdminAction(false)} className="py-2.5 px-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-semibold transition-all">{t.f7_adminIgnores}</button>
          </div>
        </div>
      </div>
    </FrameCard>
  );
};

// ==========================================
// FRAME 8: ADMIN RESPONDED
// ==========================================
export const Frame8: React.FC = () => {
  const { resetFlow, language } = useFlow();
  const t = translations[language];

  return (
    <FrameCard title={t.f8_title} subtitle={t.f8_subtitle}>
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="p-4 bg-emerald-500/20 rounded-full border-2 border-emerald-500 text-emerald-500 animate-pulse"><UserCheck className="w-16 h-16" /></div>
        </div>
        <div className="space-y-2">
          <p className="text-xl font-bold text-slate-200">{t.f8_locked}</p>
          <p className="text-slate-400 text-sm leading-relaxed">{t.f8_desc}</p>
        </div>
        <button onClick={resetFlow} className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold rounded-xl shadow-lg transition-all">{t.logout}</button>
      </div>
    </FrameCard>
  );
};

// ==========================================
// FRAME 9: AUTO ACTION SWITCH
// ==========================================
export const Frame9: React.FC = () => {
  const { navigateToStep, language } = useFlow();
  const t = translations[language];

  useEffect(() => {
    const timer = setTimeout(() => { navigateToStep(10); }, 3000);
    return () => clearTimeout(timer);
  }, [navigateToStep]);

  return (
    <FrameCard title={t.f9_title} subtitle={t.f9_subtitle}>
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="p-4 bg-rose-500/10 rounded-full border border-rose-500/30 text-rose-500 animate-spin"><RefreshCw className="w-12 h-12" /></div>
        </div>
        <div className="space-y-3">
          <p className="text-lg font-bold text-slate-200">{t.f9_noRespond}</p>
          <p className="text-slate-400 text-sm leading-relaxed">{t.f9_switching}</p>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
          <div className="bg-rose-500 h-1.5 rounded-full animate-shimmer shimmer-btn relative w-full"></div>
        </div>
      </div>
    </FrameCard>
  );
};

// ==========================================
// FRAME 10: AUTO ACTION COMPLETE
// ==========================================
export const Frame10: React.FC = () => {
  const { resetFlow, language } = useFlow();
  const t = translations[language];

  return (
    <FrameCard title={t.f10_title} subtitle={t.f10_subtitle}>
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="p-4 bg-amber-500/20 rounded-full border-2 border-amber-500 text-amber-500"><Lock className="w-16 h-16 animate-bounce" /></div>
        </div>
        <div className="space-y-2">
          <p className="text-xl font-bold text-slate-200">{t.f10_locked}</p>
          <p className="text-slate-400 text-sm leading-relaxed">{t.f10_desc}</p>
        </div>
        <button onClick={resetFlow} className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold rounded-xl shadow-lg transition-all">{t.logout}</button>
      </div>
    </FrameCard>
  );
};