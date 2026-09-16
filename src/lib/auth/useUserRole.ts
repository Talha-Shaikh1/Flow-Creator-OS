'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export interface UserRoleState {
  role: 'super_admin' | 'creator';
  isSuperAdmin: boolean;
  isLoading: boolean;
  email: string | null;
  name: string | null;
}

export function useUserRole(): UserRoleState {
  const { isSignedIn, user, isLoaded } = useUser();
  const [roleState, setRoleState] = useState<UserRoleState>({
    role: 'creator',
    isSuperAdmin: false,
    isLoading: true,
    email: null,
    name: null,
  });

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      setRoleState({
        role: 'creator',
        isSuperAdmin: false,
        isLoading: false,
        email: null,
        name: null,
      });
      return;
    }

    // Direct client-side check on Clerk publicMetadata
    const clerkMetadataRole = String(user.publicMetadata?.role || '').toLowerCase();
    const isClerkSuper =
      clerkMetadataRole === 'superadmin' ||
      clerkMetadataRole === 'super_admin' ||
      clerkMetadataRole === 'admin';

    if (isClerkSuper) {
      setRoleState((prev) => ({
        ...prev,
        role: 'super_admin',
        isSuperAdmin: true,
        isLoading: false,
        email: user.primaryEmailAddress?.emailAddress || null,
        name: user.fullName || user.username || null,
      }));
    }

    let isMounted = true;

    async function syncAndFetchRole() {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            email: user?.primaryEmailAddress?.emailAddress || null,
            name: user?.fullName || user?.username || null,
            imageUrl: user?.imageUrl || null,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.user) {
            setRoleState({
              role: data.user.role === 'super_admin' || isClerkSuper ? 'super_admin' : 'creator',
              isSuperAdmin: Boolean(data.user.isSuperAdmin) || isClerkSuper,
              isLoading: false,
              email: data.user.email,
              name: data.user.name,
            });
          }
        } else {
          if (isMounted) {
            setRoleState((prev) => ({
              ...prev,
              isLoading: false,
              isSuperAdmin: prev.isSuperAdmin || isClerkSuper,
            }));
          }
        }
      } catch (err) {
        console.warn('Could not sync user role:', err);
        if (isMounted) {
          setRoleState((prev) => ({
            ...prev,
            isLoading: false,
            isSuperAdmin: prev.isSuperAdmin || isClerkSuper,
          }));
        }
      }
    }

    syncAndFetchRole();

    return () => {
      isMounted = false;
    };
  }, [isSignedIn, user, isLoaded]);

  return roleState;
}
