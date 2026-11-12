import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { CreateNoteInput } from '@note-manager/shared';
import { useCreateNote, useNote, useUpdateNote } from '@/api/notes';
import { useNoteTypes } from '@/api/note-types';
import { apiErrorMessage } from '@/lib/api';
import { Button, Card, FieldError, Input, Label, Select, Spinner, Textarea } from '@/components/ui';
import { MarkdownPreview } from '@/components/MarkdownPreview';

const formSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  noteTypeId: z.string().min(1, 'Select a note type'),
  date: z.string().optional(),
  tagsText: z.string().optional(),
  content: z.string().trim().min(1, 'Content is required'),
});
type FormValues = z.infer<typeof formSchema>;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function NoteEditorPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const typesQuery = useNoteTypes();
  const noteQuery = useNote(id);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', noteTypeId: '', date: today(), tagsText: '', content: '' },
  });

  // Populate the form when editing an existing note.
  useEffect(() => {
    if (isEdit && noteQuery.data) {
      const n = noteQuery.data;
      reset({
        title: n.title,
        noteTypeId: n.noteTypeId,
        date: n.date,
        tagsText: n.tags.join(', '),
        content: n.content,
      });
    }
  }, [isEdit, noteQuery.data, reset]);

  const contentValue = watch('content');

  const onSubmit = (values: FormValues) => {
    const payload: CreateNoteInput = {
      title: values.title,
      content: values.content,
      noteTypeId: values.noteTypeId,
      date: values.date || undefined,
      tags: (values.tagsText ?? '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    if (isEdit && id) {
      updateNote.mutate(
        { id, input: payload },
        {
          onSuccess: () => {
            toast.success('Note updated');
            navigate(`/notes/${id}`);
          },
          onError: (err) => toast.error(apiErrorMessage(err)),
        },
      );
    } else {
      createNote.mutate(payload, {
        onSuccess: () => {
          toast.success('Note created');
          navigate('/');
        },
        onError: (err) => toast.error(apiErrorMessage(err)),
      });
    }
  };

  if (isEdit && noteQuery.isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  const noteTypes = typesQuery.data ?? [];
  const pending = createNote.isPending || updateNote.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit note' : 'New note'}</h1>
        <Link to="/">
          <Button variant="secondary">Cancel</Button>
        </Link>
      </div>

      {noteTypes.length === 0 ? (
        <Card className="p-6 text-sm text-slate-600">
          You need at least one note type first.{' '}
          <Link to="/note-types" className="font-medium text-indigo-600 hover:underline">
            Create a note type
          </Link>
          .
        </Card>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Card className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register('title')} />
                <FieldError message={errors.title?.message} />
              </div>
              <div>
                <Label htmlFor="noteTypeId">Note type</Label>
                <Select id="noteTypeId" {...register('noteTypeId')}>
                  <option value="">Select a note type…</option>
                  {noteTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
                <FieldError message={errors.noteTypeId?.message} />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...register('date')} />
              </div>
              <div>
                <Label htmlFor="tagsText">Tags (comma-separated)</Label>
                <Input id="tagsText" placeholder="daily, backend" {...register('tagsText')} />
              </div>
            </div>

            <div>
              <Label htmlFor="content">Content (Markdown)</Label>
              <div className="grid gap-3 lg:grid-cols-2">
                <Textarea id="content" rows={14} className="font-mono" {...register('content')} />
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Preview
                  </p>
                  <MarkdownPreview content={contentValue} />
                </div>
              </div>
              <FieldError message={errors.content?.message} />
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create note'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
