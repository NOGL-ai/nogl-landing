'use client';

import { useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Textarea } from '@/components/ui/textarea';

interface DocsFeedbackProps {
  docPath: string;
  locale: 'en' | 'de';
}

type Rating = 'UP' | 'DOWN' | null;

export function DocsFeedback({ docPath, locale }: DocsFeedbackProps) {
  const [rating, setRating] = useState<Rating>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (selectedRating: Rating) => {
    if (!selectedRating || loading) return;
    setRating(selectedRating);
    setLoading(true);

    try {
      await fetch('/api/docs/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docPath,
          locale,
          rating: selectedRating,
          comment: comment.trim() || undefined,
        }),
      });
      setSubmitted(true);
    } catch {
      // silently ignore feedback errors
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <p className="text-sm text-muted-foreground">
        Thanks for your feedback!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-foreground">Was this helpful?</p>
      {rating === null ? (
        <div className="flex gap-2">
          <Button
            color="secondary"
            size="sm"
            onClick={() => setRating('UP')}
            aria-label="Yes, this was helpful"
          >
            👍 Yes
          </Button>
          <Button
            color="secondary"
            size="sm"
            onClick={() => setRating('DOWN')}
            aria-label="No, this was not helpful"
          >
            👎 No
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-w-sm">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              rating === 'DOWN'
                ? 'What could be improved?'
                : 'Any additional comments?'
            }
            className="text-sm resize-none"
            rows={3}
            maxLength={1000}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => submit(rating)} disabled={loading}>
              {loading ? 'Sending…' : 'Submit'}
            </Button>
            <Button
              size="sm"
              color="tertiary"
              onClick={() => setRating(null)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
