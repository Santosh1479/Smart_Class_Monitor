import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");
    const id = localStorage.getItem("userId") || localStorage.getItem("id");

    if (storedToken && role && name && id) {
      setUser({ _id: id, name, role });
      setToken(storedToken);
    }
  }, []);

  const login = (userData) => {
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");
    const id = localStorage.getItem("userId") || localStorage.getItem("id");
    setUser({ _id: id, name, role });
    setToken(localStorage.getItem("token"));
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);