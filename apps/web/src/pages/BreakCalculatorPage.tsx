import { useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import { computeReturnTime, nowAsTime, DEFAULT_BREAK_MINUTES } from '@note-manager/shared';
import { Button, Card, Input, Label } from '@/components/ui';

export function BreakCalculatorPage() {
  const [startTime, setStartTime] = useState(() => nowAsTime());
  const [duration, setDuration] = useState(DEFAULT_BREAK_MINUTES);

  const result = useMemo(() => {
    try {
      return { value: computeReturnTime(startTime, duration), error: null as string | null };
    } catch (err) {
      return { value: null, error: err instanceof Error ? err.message : 'Invalid input' };
    }
  }, [startTime, duration]);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Break Calculator</h1>
      <p className="text-sm text-slate-500">
        Work out when you&apos;re due back from a break. Defaults to {DEFAULT_BREAK_MINUTES} minutes
        (1h30m).
      </p>

      <Card className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="start">Break start time</Label>
            <div className="flex gap-2">
              <Input
                id="start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <Button variant="secondary" size="sm" onClick={() => setStartTime(nowAsTime())}>
                Now
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min={0}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="rounded-lg bg-indigo-50 p-5 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">Back at</p>
          {result.error ? (
            <p className="mt-1 text-sm text-red-600">{result.error}</p>
          ) : (
            <p className="mt-1 flex items-center justify-center gap-2 text-4xl font-bold text-indigo-700">
              <Clock className="h-7 w-7" />
              {result.value}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
