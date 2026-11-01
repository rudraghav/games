import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="page-width empty-page">
      <h1 className="heading-md">This table isn’t here.</h1>
      <p className="muted">The link may be incomplete. Ask your host for a fresh invite.</p>
      <Link href="/" className="button button--primary button--md">
        Back to the lounge
      </Link>
    </main>
  );
}
