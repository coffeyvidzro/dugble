export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="min-h-svh bg-background text-foreground">
            {children}
        </main>
    );
}
