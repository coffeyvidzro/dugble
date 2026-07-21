export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center px-6 py-12">
      <p className="font-medium text-primary text-sm uppercase tracking-[0.2em]">
        404
      </p>
      <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="mt-4 text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <a href="/" className="mt-8 text-primary text-sm hover:underline">
        Return home
      </a>
    </main>
  );
}
