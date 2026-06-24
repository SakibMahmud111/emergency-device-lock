import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id?: string;
  username: string;
  password?: string;
  role: 'Salesman' | 'Manager';
  birth_city: string;
  childhood_friend: string;
  mobile_logged_in: boolean;
  account_locked: boolean;
  failed_attempts: number;
}

interface FlowContextType {
  currentStep: number;
  userProfile: UserProfile | null;
  errorMsg: string | null;
  navigateToStep: (step: number) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setErrorMsg: (msg: string | null) => void;
  resetFlow: () => void;
  refreshUserProfile: () => Promise<UserProfile | null>;
  updateMobileStatus: (loggedIn: boolean) => Promise<boolean>;
  lockUserAccount: () => Promise<boolean>;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

// Valid transitions dictionary to prevent illegal navigation hacks
const VALID_NEXT_STEPS: Record<number, number[]> = {
  1: [11, 2],
  11: [12, 1], // Allowed to go back to 1 or forward to 12
  12: [2, 1],
  2: [3, 1],
  3: [4, 1],
  4: [5, 1],
  5: [6, 7, 1],
  6: [1],
  7: [8, 9, 1],
  8: [1],
  9: [10, 1],
  10: [1],
};

export const FlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // FIXED: Defaulting step directly to 1 instead of pulling from localStorage
  const [currentStep, setCurrentStepState] = useState<number>(1);

  // FIXED: Defaulting user profile directly to null on state initialization
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // FIXED: Removed the useEffect hooks that were syncing step and userProfile to localStorage

  const setUserProfile = (profile: UserProfile | null) => {
    setUserProfileState(profile);
  };

  const navigateToStep = (step: number) => {
    // Validate transition
    const allowed = VALID_NEXT_STEPS[currentStep] || [];
    if (allowed.includes(step) || step === 1) {
      setCurrentStepState(step);
    } else {
      console.warn(`Illegal navigation attempt: ${currentStep} -> ${step}`);
    }
  };

  const resetFlow = () => {
    setCurrentStepState(1);
    setUserProfileState(null);
    setErrorMsg(null);
    // Safe cleanup in case there are lingering legacy keys in older browser instances
    localStorage.removeItem('remote_security_step');
    localStorage.removeItem('remote_security_user');
  };

  const refreshUserProfile = async (): Promise<UserProfile | null> => {
    if (!userProfile?.username) return null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', userProfile.username)
        .single();

      if (error) throw error;
      if (data) {
        const profile = data as UserProfile;
        setUserProfile(profile);
        return profile;
      }
    } catch (e) {
      console.error('Error refreshing user profile:', e);
    }
    return null;
  };

  const updateMobileStatus = async (loggedIn: boolean): Promise<boolean> => {
    if (!userProfile?.username) return false;
    try {
      const { error } = await supabase
        .from('users')
        .update({ mobile_logged_in: loggedIn })
        .eq('username', userProfile.username);

      if (error) throw error;

      setUserProfileState((prev) =>
        prev ? { ...prev, mobile_logged_in: loggedIn } : null
      );
      return true;
    } catch (e) {
      console.error('Error updating mobile status:', e);
      return false;
    }
  };

  const lockUserAccount = async (): Promise<boolean> => {
    if (!userProfile?.username) return false;
    try {
      const { error } = await supabase
        .from('users')
        .update({ account_locked: true })
        .eq('username', userProfile.username);

      if (error) throw error;

      setUserProfileState((prev) =>
        prev ? { ...prev, account_locked: true } : null
      );
      return true;
    } catch (e) {
      console.error('Error locking account:', e);
      return false;
    }
  };

  return (
    <FlowContext.Provider
      value={{
        currentStep,
        userProfile,
        errorMsg,
        navigateToStep,
        setUserProfile,
        setErrorMsg,
        resetFlow,
        refreshUserProfile,
        updateMobileStatus,
        lockUserAccount,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
};

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (context === undefined) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
};