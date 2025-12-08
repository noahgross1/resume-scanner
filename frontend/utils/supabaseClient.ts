import { createClient, type User, AuthError } from "@supabase/supabase-js";
import Constants from "expo-constants";

// Environment variables for Supabase connection
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseKey;

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth related functions
export type AuthResponse = {
  user: User | null;
  error: AuthError | null;
};

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: data?.user || null,
      error,
    };
  } catch (error) {
    console.error("Error signing in with email:", error);
    return {
      user: null,
      error: error as AuthError,
    };
  }
}

export async function signUp(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return {
      user: data?.user || null,
      error,
    };
  } catch (error) {
    console.error("Error signing up:", error);
    return {
      user: null,
      error: error as AuthError,
    };
  }
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error("Error signing out:", error);
    return {
      error: error as AuthError,
    };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function getSession() {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}
