/**
 * AcadMaid Auth Context
 * Provides user authentication state to the entire app.
 * Wrap your app in <AuthProvider> and use useAuth() anywhere.
 */

import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);         // logged-in user object
  const [loading, setLoading] = useState(true);   // checking session on load

  // On app start, restore user session from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("acadmaid_user");
    const token = localStorage.getItem("acadmaid_token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    const data = res.data;

    // Save token and user info to localStorage (persists across refreshes)
    localStorage.setItem("acadmaid_token", data.access_token);
    localStorage.setItem("acadmaid_user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const signup = async (email, password, full_name) => {
    const res = await API.post("/auth/signup", { email, password, full_name });
    const data = res.data;

    localStorage.setItem("acadmaid_token", data.access_token);
    localStorage.setItem("acadmaid_user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("acadmaid_token");
    localStorage.removeItem("acadmaid_user");
    setUser(null);
  };

  // Update user object (e.g., after completing onboarding)
  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem("acadmaid_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this in any component: const { user, login } = useAuth()
export function useAuth() {
  return useContext(AuthContext);
}