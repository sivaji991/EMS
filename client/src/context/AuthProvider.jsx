import { useState, useEffect } from "react";
import api from "../api/axios";
import { AuthContext } from "./auth-context.js";

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {

    const storedToken =
      localStorage.getItem("token");

    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {

      api.defaults.headers.common["Authorization"] =
        `Bearer ${storedToken}`;

      const { data } =
        await api.get("/auth/session");

      setUser(data.user);
      setToken(storedToken);

    } catch (error) {

      localStorage.removeItem("token");

      setUser(null);
      setToken(null);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (
    email,
    password,
    role_type
  ) => {

    const { data } = await api.post(
      "/auth/login",
      {
        email,
        password,
        role_type
      }
    );

    localStorage.setItem(
      "token",
      data.token
    );

    api.defaults.headers.common["Authorization"] =
      `Bearer ${data.token}`;

    setToken(data.token);
    setUser(data.user);

    return data.user;
  };

  const logout = () => {

    localStorage.removeItem("token");

    delete api.defaults.headers.common[
      "Authorization"
    ];

    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}