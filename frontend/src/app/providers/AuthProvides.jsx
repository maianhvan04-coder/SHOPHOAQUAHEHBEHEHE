// src/app/providers/AuthProvider.jsx
import PropTypes from "prop-types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "~/features/auth/authService";
import { authStorage } from "~/features/auth/authStorage";

const Ctx = createContext(null);

export default function AuthProvider({ children }) {
  const cached = useMemo(() => authStorage.getMe(), []);

  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState(cached?.permissions || []);
  const [roles, setRoles] = useState(cached?.roles || []);
  const [user, setUser] = useState(cached?.user || null);
  const [userType, setUserType] = useState(cached?.userType || "client");


  const isAuthed = !!user;

  const refreshMe = useCallback(async () => {
    setLoading(true);
    try {
      const me = await authService.me();
    
      const normalized = {
        user: me?.user || null,
        roles: me?.roles || [],
        userType: me?.user?.type || "client",
        
        permissions: me?.permissions || [],
      };
     
      setUser(normalized.user);
      setRoles(normalized.roles);
      setPermissions(normalized.permissions);
      setUserType(normalized.userType);
      authStorage.setMe(normalized);

      return normalized;
    } catch (e) {
      authStorage.clear();
      setUser(null);
      setRoles([]);
      setPermissions([]);
      setUserType("client");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    refreshMe();
  }, [refreshMe]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (e) {
      // ignore
    } finally {
      authStorage.clear();
      setUser(null);
      setRoles([]);
      setPermissions([]);
      setUserType("client");
    }
  }, []);

  const value = useMemo(
    () => ({ loading, isAuthed, user, roles,userType, permissions, logout, refreshMe }),
    [loading, isAuthed, user, roles,userType, permissions, logout, refreshMe]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within <AuthProvider />");
  return v;
}
