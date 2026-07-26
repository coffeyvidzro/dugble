"use client";

import { Layers, type LucideIcon, Mail, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Channel = "sms" | "email";

const CYCLE_MS = 2800;
const PATH_SMS = "M0 20 C 35 20, 35 8, 100 8";
const PATH_EMAIL = "M0 20 C 35 20, 35 32, 100 32";

export function RouteDiagram() {
  const [active, setActive] = useState<Channel>("sms");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = setInterval(() => {
      setActive((c) => (c === "sms" ? "email" : "sms"));
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-between gap-2 pt-6">
      <style>{`
                @keyframes a2p-travel {
                    0% { offset-distance: 0%; opacity: 0; }
                    5% { opacity: 1; }
                    95% { opacity: 1; }
                    100% { offset-distance: 100%; opacity: 0; }
                }
            `}</style>
      <RouteNode label="Your backend" icon={Layers} />

      <div className="relative h-10 flex-1">
        <svg
          className="h-10 w-full text-border overflow-visible"
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d={PATH_SMS}
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            vectorEffect="non-scaling-stroke"
            className={cn(
              "transition-[stroke] duration-500",
              active === "sms" && "text-signal/60",
            )}
          />
          <path
            d={PATH_EMAIL}
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            vectorEffect="non-scaling-stroke"
            className={cn(
              "transition-[stroke] duration-500",
              active === "email" && "text-signal/60",
            )}
          />

          {!reduceMotion && (
            <>
              <Packet
                key={`sms-${active}`}
                run={active === "sms"}
                pathD={PATH_SMS}
              />
              <Packet
                key={`email-${active}`}
                run={active === "email"}
                pathD={PATH_EMAIL}
              />
            </>
          )}
        </svg>
      </div>

      <div className="flex flex-col gap-4">
        <RouteNode label="SMS" icon={Smartphone} active={active === "sms"} />
        <RouteNode label="Email" icon={Mail} active={active === "email"} />
      </div>
    </div>
  );
}

function Packet({ run, pathD }: { run: boolean; pathD: string }) {
  if (!run) return null;
  return (
    <g
      style={{
        offsetPath: `path("${pathD}")`,
        animation: `a2p-travel ${CYCLE_MS - 300}ms linear forwards`,
      }}
    >
      {/* Inner signal dot */}
      <circle r="1.5" className="fill-signal" />
      {/* Soft outer glow */}
      <circle r="4" fill="rgba(62,217,142,0.4)" />
    </g>
  );
}

function RouteNode({
  label,
  icon: Icon,
  active,
}: {
  label: string;
  icon: LucideIcon;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border bg-background px-3 py-2 transition-colors duration-500",
        active && "border-signal/50",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full bg-muted-foreground/40 transition-colors duration-500",
          active && "animate-pulse bg-signal",
        )}
      />
      <Icon
        className={cn(
          "size-3.5 text-muted-foreground transition-colors duration-500",
          active && "text-foreground",
        )}
      />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
