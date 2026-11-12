import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Note, CreateNoteInput, UpdateNoteInput, ListNotesQuery } from '@note-manager/shared';
import { api } from '@/lib/api';

export const noteKeys = {
  all: ['notes'] as const,
  list: (filters: ListNotesQuery) => ['notes', 'list', filters] as const,
  detail: (id: string) => ['notes', 'detail', id] as const,
};

export function useNotes(filters: ListNotesQuery = {}) {
  return useQuery({
    queryKey: noteKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get<{ notes: Note[] }>('/api/notes', { params: filters });
      return data.notes;
    },
  });
}

export function useNote(id: string | undefined) {
  return useQuery({
    queryKey: noteKeys.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await api.get<{ note: Note }>(`/api/notes/${id}`);
      return data.note;
    },
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateNoteInput) => {
      const { data } = await api.post<{ note: Note }>('/api/notes', input);
      return data.note;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: noteKeys.all }),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateNoteInput }) => {
      const { data } = await api.patch<{ note: Note }>(`/api/notes/${id}`, input);
      return data.note;
    },
    onSuccess: (note) => {
      qc.invalidateQueries({ queryKey: noteKeys.all });
      qc.setQueryData(noteKeys.detail(note.id), note);
    },
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/notes/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: noteKeys.all }),
  });
}
