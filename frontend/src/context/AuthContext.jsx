import React, { createContext, useEffect, useMemo, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("auth_user");
    return saved ? JSON.parse(saved) : null; // { _id, username, ... }
  });

  useEffect(() => {
    if (user) localStorage.setItem("auth_user", JSON.stringify(user));
    else localStorage.removeItem("auth_user");
  }, [user]);

  // Merge helper (e.g. update username, bio, avatar, etc.)
  const updateUser = (patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, ...patch };
    });
  };

  const value = useMemo(
    () => ({
      user,

      // keep existing API
      login: (userData) => setUser(userData),
      logout: () => setUser(null),

      // NEW: allow direct set
      setUser,

      // NEW: allow partial updates
      updateUser,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
