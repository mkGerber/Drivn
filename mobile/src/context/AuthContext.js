import React, { createContext, useEffect, useState, useContext } from 'react';
import supabase from '../supabaseClient';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);

  const signUpNewUser = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('There was a problem signing up:', error);
      return { success: false, error };
    }

    return { success: true, data };
  };

  const signInUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error('There was an error signing in:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (error) {
      console.error('An error occurred:', error);
      return { success: false, error: error?.message || 'Sign-in failed' };
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('There was an error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, signInUser, signUpNewUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => useContext(AuthContext);
