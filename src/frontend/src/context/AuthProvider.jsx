import { useMemo, useState } from "react";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const loginUser = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, loginUser, logoutUser }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
