"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";

import { cn } from "@/lib/utils";

export const AVATAR_PRESETS = [
  { id: "signal", classes: "from-signal to-emerald-600" },
  { id: "sky", classes: "from-sky-500 to-blue-600" },
  { id: "violet", classes: "from-violet-500 to-purple-600" },
  { id: "amber", classes: "from-amber-400 to-orange-600" },
  { id: "rose", classes: "from-pink-500 to-rose-600" },
  { id: "slate", classes: "from-slate-500 to-slate-700" },
] as const;

export type AvatarPresetId = (typeof AVATAR_PRESETS)[number]["id"];

export function initialsFromName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const MAX_AVATAR_BYTES = 1 * 1024 * 1024;

const SIZE_CLASSES = {
  md: "size-16",
  lg: "size-20",
} as const;

type TeamAvatarPickerProps = {
  /** Team name, used to derive the fallback initials + alt text. */
  name: string;
  imageUrl?: string | null;
  color: AvatarPresetId;
  onImageChange: (dataUrl: string | null) => void;
  onColorChange: (color: AvatarPresetId) => void;
  size?: "md" | "lg";
  error?: string | null;
  onError?: (message: string | null) => void;
};

export function TeamAvatarPicker({
  name,
  imageUrl,
  color,
  onImageChange,
  onColorChange,
  size = "md",
  error,
  onError,
}: TeamAvatarPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const preset =
    AVATAR_PRESETS.find((p) => p.id === color) ?? AVATAR_PRESETS[0];
  const initials = initialsFromName(name) || "T";

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_AVATAR_BYTES) {
      onError?.("Image is over 1MB. Please choose a smaller file.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      onError?.("Please select a valid image file.");
      return;
    }

    onError?.(null);
    const reader = new FileReader();
    reader.onload = () => onImageChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        aria-label="Upload team avatar"
        className={cn(
          "group relative shrink-0 overflow-hidden rounded-2xl outline-none ring-offset-background transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring active:scale-95",
          SIZE_CLASSES[size],
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name || "Team avatar"}
            className="size-full rounded-2xl border border-border/50 object-cover shadow-sm"
          />
        ) : (
          <div
            className={cn(
              "flex size-full items-center justify-center rounded-2xl border border-border/50 bg-linear-to-br font-heading text-xl font-semibold text-white shadow-sm",
              preset.classes,
            )}
          >
            {initials}
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <Camera className="size-5 text-foreground/80" />
        </div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-2">
        {AVATAR_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-label={`Use the ${p.id} color`}
            aria-pressed={!imageUrl && color === p.id}
            onClick={() => {
              onImageChange(null);
              onColorChange(p.id);
            }}
            className={cn(
              "size-5 shrink-0 rounded-full bg-linear-to-br transition-transform hover:scale-110",
              p.classes,
              !imageUrl && color === p.id
                ? "ring-2 ring-foreground/70 ring-offset-2 ring-offset-background"
                : "opacity-70 hover:opacity-100",
            )}
          />
        ))}
      </div>

      {error && (
        <p className="text-xs font-medium text-danger animate-fade-up">
          {error}
        </p>
      )}
    </div>
  );
}
