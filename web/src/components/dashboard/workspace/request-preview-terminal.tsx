import { memo } from "react";

type RequestPreviewTerminalProps = {
    workspaceName: string;
    businessPhone: string;
};

export const RequestPreviewTerminal = memo(function RequestPreviewTerminal({
    workspaceName,
    businessPhone,
}: RequestPreviewTerminalProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-[#0b0d12]">
            <div className="flex items-center gap-1.5 border-b border-white/6 px-4 py-3">
                <span className="size-2.5 rounded-full bg-danger/70" />
                <span className="size-2.5 rounded-full bg-pending/70" />
                <span className="size-2.5 rounded-full bg-signal/70" />
                <span className="ml-2 truncate font-mono text-[11px] text-white/40">
                    send-message.sh
                </span>
            </div>
            <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-6 text-white/80">
                <code>
                    <span className="text-white/30">$ </span>
                    curl https://api.dugble.com/v1/messages \{"\n"}
                    <span className="pl-4 text-white/50">-H</span>{" "}
                    <span className="text-emerald-400">
                        &quot;Authorization: Bearer sk_live_···&quot;
                    </span>{" "}
                    <span className="text-white/30">\</span>
                    {"\n"}
                    <span className="pl-4 text-white/50">-d</span>{" "}
                    <span className="text-sky-400">business</span>=
                    <span className="text-amber-300">
                        &quot;{workspaceName || "Vidzro Logistics"}&quot;
                    </span>{" "}
                    <span className="text-white/30">\</span>
                    {"\n"}
                    <span className="pl-4 text-white/50">-d</span>{" "}
                    <span className="text-sky-400">to</span>=
                    <span className="text-amber-300">
                        &quot;{businessPhone || "+233531184325"}&quot;
                    </span>{" "}
                    <span className="text-white/30">\</span>
                    {"\n"}
                    <span className="pl-4 text-white/50">-d</span>{" "}
                    <span className="text-sky-400">body</span>=
                    <span className="text-amber-300">
                        &quot;Your OTP is 482913&quot;
                    </span>
                    <span className="animate-caret ml-1 inline-block h-3.5 w-1.5 translate-y-0.5 bg-white/30 align-baseline" />
                </code>
            </pre>
        </div>
    );
});
