import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PublicUser, LoginInput, RegisterInput } from '@note-manager/shared';
import { api } from '@/lib/api';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

/** Current signed-in user, or null when not authenticated. */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async (): Promise<PublicUser | null> => {
      try {
        const { data } = await api.get<{ user: PublicUser }>('/api/auth/me');
        return data.user;
      } catch {
        return null;
      }
    },
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await api.post<{ user: PublicUser }>('/api/auth/login', input);
      return data.user;
    },
    onSuccess: (user) => qc.setQueryData(authKeys.me, user),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const { data } = await api.post<{ user: PublicUser }>('/api/auth/register', input);
      return data.user;
    },
    onSuccess: (user) => qc.setQueryData(authKeys.me, user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post('/api/auth/logout');
    },
    onSuccess: () => {
      qc.setQueryData(authKeys.me, null);
      qc.clear();
    },
  });
}
