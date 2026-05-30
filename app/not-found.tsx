import Link from 'next/link';
import './globals.css';

/**
 * Root-level 404 for paths that fall outside the `[locale]` segment. It renders
 * its own <html>/<body> because there is no parent layout at this level.
 */
export default function RootNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center text-foreground">
          <p className="text-7xl font-extrabold tracking-tight text-primary">
            404
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
          <p className="max-w-md text-muted-foreground">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
          <Link
            href="/en"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to home
          </Link>
        </main>
      </body>
    </html>
  );
}
