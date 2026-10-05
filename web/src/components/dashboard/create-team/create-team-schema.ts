import * as z from "zod";

export const formSchema = z.object({
  teamName: z
    .string()
    .trim()
    .min(1, "Team name is required.")
    .max(60, "Keep it under 60 characters."),
  marketCode: z.string().min(2, "Select a country."),
  phoneLocal: z
    .string()
    .trim()
    .min(6, "Enter a valid phone number.")
    .regex(/^[0-9\s-]+$/, "Digits only."),
  address: z.string().trim().min(1, "Address is required."),
  website: z
    .string()
    .trim()
    .url("Enter a valid full URL, e.g. https://example.com")
    .refine((val) => {
      try {
        const url = new URL(val);

        const isValidProtocol = url.protocol === "https:";

        return (
          isValidProtocol &&
          url.hostname !== "localhost" &&
          url.hostname !== "127.0.0.1" &&
          url.hostname.includes(".")
        );
      } catch {
        return false;
      }
    }, "Please enter a valid, public website URL (e.g., https://example.com)."),
});

export type FormValues = z.infer<typeof formSchema>;

export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "your-team"
  );
}
