// src/app/providers/AuthProvider.jsx
import PropTypes from "prop-types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "~/features/auth/authService";
import { authStorage } from "~/features/auth/authStorage";

const Ctx = createContext(null);

export default function AuthProvider({ children }) {
  const cached = authStorage.getMe();

  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState(cached?.permissions || []);
  const [roles, setRoles] = useState(cached?.roles || []);
  const [user, setUser] = useState(cached?.user || null);

  const isAuthed = !!user;

  const refreshMe = useCallback(async () => {
    setLoading(true);
    try {
      const me = await authService.me(); // { user, roles, permissions }
      setUser(me?.user || null);
      setRoles(me?.roles || []);
      setPermissions(me?.permissions || []);

      console.log("Day login")
      authStorage.setMe({
        user: me?.user || null,
        roles: me?.roles || [],
        permissions: me?.permissions || [],
      });

      return me;
    } catch (e) {
      authStorage.clear();
      setUser(null);
      setRoles([]);
      setPermissions([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const value = useMemo(
    () => ({ loading, isAuthed, user, roles, permissions, refreshMe }),
    [loading, isAuthed, user, roles, permissions, refreshMe]
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
