'use client';
import { Button } from '@games/ui';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="page-width empty-page">
      <h1 className="heading-md">Let’s get you back to the table.</h1>
      <p className="muted">Something interrupted this page. Please try again.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
