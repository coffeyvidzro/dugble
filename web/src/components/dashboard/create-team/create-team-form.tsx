"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateTeam } from "@/hooks/queries/use-teams";
import { findCountry } from "@/lib/countries";
import { CountrySelect } from "./country-select";
import { type FormValues, formSchema, slugify } from "./create-team-schema";

export function CreateTeamForm() {
  const router = useRouter();
  const createTeam = useCreateTeam();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      teamName: "",
      marketCode: "",
      phoneLocal: "",
      address: "",
      website: "",
    },
  });

  const teamName = watch("teamName");
  const marketCode = watch("marketCode");
  const slug = slugify(teamName || "");
  const selectedCountry = findCountry(marketCode);
  const loading = createTeam.isPending;

  function onSubmit(data: FormValues) {
    const country = findCountry(data.marketCode);
    if (!country) {
      toast.error("Select a valid country.");
      return;
    }

    createTeam.mutate(
      {
        name: data.teamName,
        market_code: data.marketCode,
        phone: `${country.dialCode}${data.phoneLocal.replace(/\D/g, "")}`,
        address: data.address.trim(),
        website: data.website.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Team created.");
          router.push("/dashboard");
          router.refresh();
        },
        onError: (err) => {
          toast.error(err.message);
        },
      },
    );
  }

  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        void handleSubmit(onSubmitRef.current)();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit]);

  return (
    <form
      id="create-team-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
        <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
          <Field data-invalid={!!errors.teamName}>
            <FieldLabel htmlFor="team-name">Team name</FieldLabel>
            <Input
              id="team-name"
              placeholder="Your Team Name"
              disabled={loading}
              aria-invalid={!!errors.teamName}
              className="max-w-sm rounded-lg border border-border/60 bg-muted/20 py-2 pl-4 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              {...register("teamName")}
            />
            {errors.teamName ? (
              <FieldError errors={[errors.teamName]} />
            ) : (
              <FieldDescription className="font-mono text-xs">
                dugble.com/{slug}
              </FieldDescription>
            )}
          </Field>
        </div>

        <div className="grid gap-6 border-t border-border/60 px-5 py-6 sm:grid-cols-2 sm:px-8 sm:py-8">
          <Field data-invalid={!!errors.marketCode}>
            <FieldLabel htmlFor="market-code">Country</FieldLabel>
            <Controller
              control={control}
              name="marketCode"
              render={({ field }) => (
                <CountrySelect
                  id="market-code"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={loading}
                  invalid={!!errors.marketCode}
                />
              )}
            />
            {errors.marketCode && <FieldError errors={[errors.marketCode]} />}
          </Field>

          <Field data-invalid={!!errors.phoneLocal}>
            <FieldLabel htmlFor="phone-local">Phone number</FieldLabel>
            <div className="flex max-w-sm gap-2">
              <div className="flex w-20 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 font-mono text-sm text-muted-foreground">
                {selectedCountry?.dialCode ?? "+..."}
              </div>
              <Input
                id="phone-local"
                type="tel"
                inputMode="numeric"
                placeholder={
                  selectedCountry ? "241234567" : "Select a country first"
                }
                disabled={loading || !selectedCountry}
                aria-invalid={!!errors.phoneLocal}
                className="flex-1 rounded-lg border border-border/60 bg-muted/20 py-2 pl-4 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                {...register("phoneLocal")}
              />
            </div>
            {errors.phoneLocal && <FieldError errors={[errors.phoneLocal]} />}
          </Field>
        </div>

        <div className="space-y-6 border-t border-border/60 px-5 py-6 sm:px-8 sm:py-8">
          <Field data-invalid={!!errors.address}>
            <FieldLabel htmlFor="address">Business address</FieldLabel>
            <Input
              id="address"
              placeholder="123 Ring Road, Accra"
              disabled={loading}
              aria-invalid={!!errors.address}
              className="max-w-sm rounded-lg border border-border/60 bg-muted/20 py-2 pl-4 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              {...register("address")}
            />
            {errors.address && <FieldError errors={[errors.address]} />}
          </Field>

          <Field data-invalid={!!errors.website}>
            <FieldLabel htmlFor="website">Website</FieldLabel>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              disabled={loading}
              aria-invalid={!!errors.website}
              className="max-w-sm rounded-lg border border-border/60 bg-muted/20 py-2 pl-4 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              {...register("website")}
            />
            {errors.website && <FieldError errors={[errors.website]} />}
          </Field>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="group/button relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border bg-background px-4 py-1.5 font-mono text-sm text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground"
        >
          Cancel
        </Link>

        <Button
          type="submit"
          disabled={loading}
          className="group relative overflow-hidden hover:cursor-pointer"
        >
          <span
            className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full motion-reduce:hidden"
            aria-hidden
          />
          {loading && <Loader2 className="size-4 animate-spin" />}
          <span className="relative">Create team</span>
          <kbd className="relative ml-1 hidden rounded border border-white/20 bg-black/10 px-1.5 py-0.5 font-mono text-[10px] font-normal opacity-70 sm:inline-block">
            ⌘⏎
          </kbd>
        </Button>
      </div>
    </form>
  );
}
