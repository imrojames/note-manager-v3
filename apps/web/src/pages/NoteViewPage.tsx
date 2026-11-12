import { Link, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useNote } from '@/api/notes';
import { useNoteTypes } from '@/api/note-types';
import { Badge, Button, Card, Spinner } from '@/components/ui';
import { MarkdownPreview } from '@/components/MarkdownPreview';

export function NoteViewPage() {
  const { id } = useParams();
  const { data: note, isLoading, isError } = useNote(id);
  const typesQuery = useNoteTypes();

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  if (isError || !note) {
    return (
      <Card className="p-6 text-center text-sm text-slate-600">
        Note not found.{' '}
        <Link to="/" className="font-medium text-indigo-600 hover:underline">
          Back to notes
        </Link>
      </Card>
    );
  }

  const typeName = typesQuery.data?.find((t) => t.id === note.noteTypeId)?.name ?? '—';

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{note.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Badge>{typeName}</Badge>
            <span>{note.date}</span>
            {note.tags.length > 0 && <span>· {note.tags.join(', ')}</span>}
          </div>
        </div>
        <Link to={`/notes/${note.id}/edit`}>
          <Button variant="secondary">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <MarkdownPreview content={note.content} />
      </Card>

      <Link to="/" className="inline-block text-sm text-indigo-600 hover:underline">
        ← Back to notes
      </Link>
    </div>
  );
}
