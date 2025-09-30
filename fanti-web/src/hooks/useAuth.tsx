'use client';


import React, { useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  status: string;
  login: (provider?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export function useAuth(): AuthContextType {

  const { data: session, status, update } = useSession();
  const [manualUser, setManualUser] = React.useState<User | null>(null);
  const [userSaved, setUserSaved] = React.useState(false);

  // Decodifica id_token manualmente se presente na URL e salva todo o payload
  useEffect(() => {
    login();
  }, []);

  // Adapta o mapeamento do usuário para claims customizadas e múltiplos formatos
  function mapUser(raw: any): User {
    if (!raw) return {
      id: null,
      sub: undefined,
      email: null,
      name: null,
      role: undefined,
      avatar: undefined,
      InternalCategory: undefined,
      JobTitle: undefined,
      Manager: undefined,
      amr: undefined,
      area: undefined,
      at_hash: undefined,
      aud: undefined,
      auth_time: undefined,
      exp: undefined,
      given_name: undefined,
      group: undefined,
      groupsAreas: undefined,
      iat: undefined,
      idp: undefined,
      iss: undefined,
      last_name: undefined,
      nbf: undefined,
      nonce: undefined,
      preferred_language: undefined,
      preferred_username: undefined,
      s_hash: undefined,
      sid: undefined,
      ["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]: undefined,
      ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]: undefined,
      ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"]: undefined,
      ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]: undefined,
      ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"]: undefined,
      ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn"]: undefined,
      claims: {},
    };
    // Role pode vir como string, array, ou em claims customizadas
    let role = raw.role;
    if (!role) {
      role = raw["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    }
    if (Array.isArray(role)) {
      role = role[0]; // pega o primeiro por padrão
    }
    // Nome pode vir em vários campos
    const name = raw.name || raw["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || raw.given_name || raw["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"];
    // Email pode vir em vários campos
    const email = raw.email || raw["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || raw.preferred_username;
    // Captura todos os campos extras
    const {
      id, sub, email: _email, name: _name, role: _role, avatar,
      InternalCategory, JobTitle, Manager, amr, area, at_hash, aud, auth_time, exp, given_name, group, groupsAreas, iat, idp, iss, last_name, nbf, nonce, preferred_language, preferred_username, s_hash, sid,
      ["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]: roleClaim,
      ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]: emailClaim,
      ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"]: givenNameClaim,
      ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]: nameClaim,
      ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"]: surnameClaim,
      ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn"]: upnClaim,
      ...claims
    } = raw;
    return {
      id: raw.id || raw.sub || null,
      sub: raw.sub,
      email: email ?? null,
      name: name ?? null,
      role: role ?? null,
      avatar: raw.avatar ?? null,
      InternalCategory: raw.InternalCategory ?? null,
      JobTitle: raw.JobTitle ?? null,
      Manager: raw.Manager ?? null,
      amr: raw.amr,
      area: raw.area,
      at_hash: raw.at_hash,
      aud: raw.aud,
      auth_time: raw.auth_time,
      exp: raw.exp,
      given_name: raw.given_name,
      group: raw.group,
      groupsAreas: raw.groupsAreas,
      iat: raw.iat,
      idp: raw.idp,
      iss: raw.iss,
      last_name: raw.last_name,
      nbf: raw.nbf,
      nonce: raw.nonce,
      preferred_language: raw.preferred_language,
      preferred_username: raw.preferred_username,
      s_hash: raw.s_hash,
      sid: raw.sid,
      ["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]: raw["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
      ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]: raw["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
      ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"]: raw["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"],
      ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]: raw["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"]: raw["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"],
      ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn"]: raw["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn"],
      claims,
    };
  }

  // Função para mapear User para o formato do backend (CreateUsersCommand)
  function mapUserToCommand(user: User) {
    // Helper para garantir GUID válido ou undefined
    function parseGuid(val: any): string | undefined {
      if (!val) return undefined;
      if (typeof val === 'string' && /^[0-9a-fA-F-]{36}$/.test(val)) return val;
      return undefined;
    }
    return {
      email: user.email ?? '',
      name: user.name ?? '',
      avatar: user.avatar ?? null,
      role: user.role ?? '',
      isActive: true,
      info: {
        id: parseGuid(user.id) ?? undefined,
        sub: parseGuid(user.sub) ?? undefined,
        email: user.email ?? undefined,
        name: user.name ?? undefined,
        role: user.role ?? undefined,
        avatar: user.avatar ?? undefined,
        internalCategory: user.InternalCategory ?? undefined,
        jobTitle: user.JobTitle ?? undefined,
        manager: user.Manager ?? undefined,
        amr: Array.isArray(user.amr) ? user.amr : user.amr ? [user.amr] : undefined,
        area: user.area ?? undefined,
        atHash: user.at_hash ?? undefined,
        audience: user.aud ?? undefined,
        authTime: user.auth_time ?? undefined,
        expiration: user.exp ?? undefined,
        givenName: user.given_name ?? undefined,
        group: Array.isArray(user.group) ? user.group : user.group ? [user.group] : undefined,
        groupsAreas: Array.isArray(user.groupsAreas) ? user.groupsAreas : user.groupsAreas ? [user.groupsAreas] : undefined,
        issuedAt: user.iat ?? undefined,
        identityProvider: user.idp ?? undefined,
        issuer: user.iss ?? undefined,
        lastName: user.last_name ?? undefined,
        notBefore: user.nbf ?? undefined,
        nonce: user.nonce ?? undefined,
        preferredLanguage: user.preferred_language ?? undefined,
        preferredUsername: user.preferred_username ?? undefined,
        sHash: user.s_hash ?? undefined,
        sessionId: user.sid ?? undefined,
        roles: Array.isArray(user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]) ? user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] : user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ? [user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]] : undefined,
        emailAddress: user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ?? undefined,
        claimGivenName: user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"] ?? undefined,
        claimName: user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ?? undefined,
        claimSurname: user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"] ?? undefined,
        upn: user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn"] ?? undefined,
      }
    };
  }

  // Função para salvar/atualizar usuário no backend
  async function saveUserToBackend(user: User) {
    if (!user || !user.email || !user.id) return;
    const stored = localStorage.getItem('manual_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id === user.id) {
          setUserSaved(true);
          return;
        }
      } catch { }
    }
    try {
      const payload = mapUserToCommand(user);
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setUserSaved(true);
    } catch (e) {
      console.error("Erro ao salvar usuário no backend:", e);
    }
  }

  const user: User | null = session?.user
    ? mapUser(session.user)
    : mapUser(manualUser);

  // Considera autenticado se houver dados válidos de usuário
  const isAuthenticated = !!(user && (user.id || user.email || user.name));
  const isLoading = status === "loading" && !manualUser;

  // Salva usuário no backend na primeira vez e a cada novo login
  useEffect(() => {
    if (isAuthenticated && user && !userSaved) {
      saveUserToBackend(user);
    }
    // Sempre que mudar o id/email, tenta salvar de novo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id, user?.email]);

  const login = useCallback(async (provider?: string) => {
    const stored = localStorage.getItem('manual_user');
    if (window.location.hash.includes('id_token')) {
      // Decodifica e seta manualUser a partir do id_token
      const hash = window.location.hash;
      const match = hash.match(/id_token=([^&]+)/);
      if (match) {
        try {
          const idToken = match[1];
          const base64Url = idToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join('')
          );
          const jwtPayload = JSON.parse(jsonPayload);
          const mapped = mapUser(jwtPayload);
          setManualUser(mapped);
          // Salva usuário manual no backend
          saveUserToBackend(mapped);
          localStorage.setItem('manual_user', JSON.stringify(mapped));
          // Limpa o hash da URL para evitar loops, removendo tudo após id_token
          if (window.location.hash) {
            const url = window.location.href.replace(/(#id_token=[^&]*).*$/, '');
            history.replaceState(null, '', url);
          }
        } catch (e) {
          console.error('Erro ao decodificar id_token:', e);
        }
      }
    } else if (!stored && manualUser == null) {
      console.log('[useAuth] Iniciando login com provider:', provider);
      // Se não há usuário manual e nada no localStorage, inicia login
      await signIn(provider || "is4", { redirect: false });
    } else if (stored && !manualUser) {
      // Se há no localStorage mas não no estado, carrega
      try {
        console.log('[useAuth] Carregando manual_user do localStorage:', stored);
        setManualUser(JSON.parse(stored));
        // Salva usuário do localStorage no backend
        saveUserToBackend(JSON.parse(stored));
      } catch { }
    }

  }, []);

  const logout = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem('manual_user');
      // Limpa manual_user ao fazer logout
      localStorage.removeItem('manual_user');
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      // Busca o endpoint de logout do well-known
      try {
        const issuer = process.env.OAUTH2_ISSUER;
        if (issuer) {
          const res = await fetch(`${issuer}/.well-known/openid-configuration`);
          const config = await res.json();
          const endSessionUrl = config.end_session_endpoint;
          if (endSessionUrl) {
            window.location.href = `${endSessionUrl}?post_logout_redirect_uri=${encodeURIComponent(window.location.origin)}`;
            return;
          }
        }
      } catch (e) {
        // fallback: recarrega a página
        window.location.reload();
        return;
      }
      // fallback: recarrega a página
      window.location.reload();
    }
    await signOut({ callbackUrl: "/login" });
  }, []);

  const refreshUser = useCallback(() => {
    update && update();
  }, [update]);

  return {
    user,
    isAuthenticated,
    isLoading,
    status,
    login,
    logout,
    refreshUser,
  };
}

// Hook para verificar se o usuário tem uma role específica
export function useHasRole(requiredRole: string | string[]) {
  const { user } = useAuth();
  if (!user || !user.role) return false;
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  return user.role === requiredRole;
}

// Hook para verificar se o usuário é admin
export function useIsAdmin() {
  return useHasRole('Administrador');
}
