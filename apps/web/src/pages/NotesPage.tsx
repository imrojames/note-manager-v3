import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import type { Note } from '@note-manager/shared';
import { useDeleteNote, useNotes } from '@/api/notes';
import { useNoteTypes } from '@/api/note-types';
import { apiErrorMessage } from '@/lib/api';
import { Badge, Button, Card, Input, Select, Spinner } from '@/components/ui';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function NotesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [noteTypeId, setNoteTypeId] = useState('');
  const [toDelete, setToDelete] = useState<Note | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filters = useMemo(
    () => ({
      ...(noteTypeId ? { noteTypeId } : {}),
      ...(debounced ? { q: debounced } : {}),
    }),
    [noteTypeId, debounced],
  );

  const notesQuery = useNotes(filters);
  const typesQuery = useNoteTypes();
  const deleteNote = useDeleteNote();

  const typeName = (id: string) => typesQuery.data?.find((t) => t.id === id)?.name ?? '—';

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteNote.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success('Note deleted');
        setToDelete(null);
      },
      onError: (err) => toast.error(apiErrorMessage(err)),
    });
  };

  const notes = notesQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Notes</h1>
        <Button onClick={() => navigate('/notes/new')}>
          <Plus className="h-4 w-4" />
          New note
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Search title and content…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select
            value={noteTypeId}
            onChange={(e) => setNoteTypeId(e.target.value)}
            className="sm:max-w-xs"
          >
            <option value="">All note types</option>
            {typesQuery.data?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        {notesQuery.isLoading ? (
          <div className="flex justify-center p-10">
            <Spinner className="h-7 w-7" />
          </div>
        ) : notes.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No notes found. Create your first one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notes.map((note) => (
                  <tr key={note.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{note.date}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge>{typeName(note.noteTypeId)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/notes/${note.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {note.title}
                      </Link>
                      <p className="line-clamp-1 text-xs text-slate-400">{note.content}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{note.tags.join(', ')}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/notes/${note.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/notes/${note.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setToDelete(note)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete note"
        message={`Delete "${toDelete?.title}"? This cannot be undone.`}
        loading={deleteNote.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
