export function SmsPreviewBubble({
    senderLabel,
    message,
}: {
    senderLabel: string;
    message: string;
}) {
    return (
        <div className="bg-zinc-950 p-6">
            <div className="mx-auto max-w-60 rounded-[28px] border border-white/10 bg-zinc-900 p-3 shadow-2xl">
                <div className="mb-3 flex justify-center" aria-hidden="true">
                    <div className="h-1 w-10 rounded-full bg-white/20" />
                </div>
                <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-wide text-zinc-500">
                    {senderLabel || "Sender"}
                </p>
                <div className="rounded-2xl rounded-tl-sm bg-zinc-800 px-3 py-2 text-sm text-zinc-100">
                    {message ? (
                        <span className="whitespace-pre-wrap wrap-break-word">
                            {message}
                        </span>
                    ) : (
                        <span className="text-zinc-500">
                            Your message will appear here…
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
