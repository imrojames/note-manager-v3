import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';
import type { NoteType } from '@note-manager/shared';
import { useCreateNoteType, useDeleteNoteType, useNoteTypes } from '@/api/note-types';
import { apiErrorMessage } from '@/lib/api';
import { Button, Card, Input, Spinner } from '@/components/ui';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function NoteTypesPage() {
  const typesQuery = useNoteTypes();
  const createType = useCreateNoteType();
  const deleteType = useDeleteNoteType();
  const [name, setName] = useState('');
  const [toDelete, setToDelete] = useState<NoteType | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createType.mutate(
      { name: trimmed },
      {
        onSuccess: () => {
          toast.success('Note type created');
          setName('');
        },
        onError: (err) => toast.error(apiErrorMessage(err)),
      },
    );
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteType.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success('Note type deleted');
        setToDelete(null);
      },
      onError: (err) => {
        toast.error(apiErrorMessage(err));
        setToDelete(null);
      },
    });
  };

  const types = typesQuery.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Note types</h1>

      <Card className="p-4">
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            placeholder="New note type name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit" disabled={createType.isPending}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </form>
      </Card>

      <Card>
        {typesQuery.isLoading ? (
          <div className="flex justify-center p-10">
            <Spinner className="h-7 w-7" />
          </div>
        ) : types.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">No note types yet.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {types.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-4 py-3">
                <span className="font-medium text-slate-800">{t.name}</span>
                <Button variant="ghost" size="sm" onClick={() => setToDelete(t)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete note type"
        message={`Delete "${toDelete?.name}"? Note types in use cannot be deleted.`}
        loading={deleteType.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
