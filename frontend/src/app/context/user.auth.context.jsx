import { createContext, useEffect, useState } from "react";

export const UserAuthContext = createContext(null);

export const UserAuthWrapper = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: { email: "", name: "", role: "user" },
  });

  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      const user = JSON.parse(userStr);
      setAuth({ isAuthenticated: true, user });
    } else {
      setAuth({ isAuthenticated: false, user: { email: "", name: "", role: "user" } });
    }

    setAppLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setAuth({ isAuthenticated: false, user: { email: "", name: "", role: "user" } });
  };

  return (
    <UserAuthContext.Provider value={{ auth, setAuth, logout, appLoading, setAppLoading }}>
      {children}
    </UserAuthContext.Provider>
  );
};
