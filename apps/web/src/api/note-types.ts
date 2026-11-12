import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NoteType, CreateNoteTypeInput, UpdateNoteTypeInput } from '@note-manager/shared';
import { api } from '@/lib/api';

export const noteTypeKeys = {
  all: ['note-types'] as const,
};

export function useNoteTypes() {
  return useQuery({
    queryKey: noteTypeKeys.all,
    queryFn: async () => {
      const { data } = await api.get<{ noteTypes: NoteType[] }>('/api/note-types');
      return data.noteTypes;
    },
  });
}

export function useCreateNoteType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateNoteTypeInput) => {
      const { data } = await api.post<{ noteType: NoteType }>('/api/note-types', input);
      return data.noteType;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: noteTypeKeys.all }),
  });
}

export function useUpdateNoteType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateNoteTypeInput }) => {
      const { data } = await api.patch<{ noteType: NoteType }>(`/api/note-types/${id}`, input);
      return data.noteType;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: noteTypeKeys.all }),
  });
}

export function useDeleteNoteType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/note-types/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: noteTypeKeys.all }),
  });
}
