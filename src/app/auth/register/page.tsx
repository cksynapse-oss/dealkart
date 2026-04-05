"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/database";
import { ArrowRight, Mail, Search, Store } from "lucide-react";

function redirectPathForRole(role: UserRole | undefined | null): string {
  switch (role) {
    case "SELLER":
      return "/seller/dashboard";
    case "BUYER":
      return "/buyer/marketplace";
    case "ADMIN":
      return "/admin/dashboard";
    default:
      return "/";
  }
}

export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<"SELLER" | "BUYER" | null>(null);
  const [awaitingEmail, setAwaitingEmail] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "SELLER",
    },
  });

  const goStep2 = (selected: "SELLER" | "BUYER") => {
    setRole(selected);
    form.setValue("role", selected);
    setStep(2);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!role) {
      toast.error("Choose how you want to use TheBuzSale.");
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: values.fullName.trim(),
          role: values.role,
        },
      },
    });
    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.session && data.user) {
      const selectedRole = values.role;
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: data.user!.id,
            role: selectedRole,
            full_name: values.fullName,
            email: values.email,
          },
          { onConflict: "id" }
        );

      if (profileError) {
        console.error("Profile creation failed:", profileError);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
      const metaRole = data.user.user_metadata?.role as UserRole | undefined;
      const resolvedRole = profile?.role ?? metaRole;
      router.push(redirectPathForRole(resolvedRole));
      router.refresh();
      return;
    }

    setAwaitingEmail(true);
    toast.success("Check your email to finish signing up.");
  });

  const roleCardShell =
    "group w-full rounded-2xl p-[2px] transition-all duration-200 " +
    "bg-slate-200 shadow-sm hover:bg-gradient-to-br hover:from-emerald-400 hover:via-emerald-600 hover:to-emerald-800 " +
    "hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2";

  const roleCardInner =
    "flex min-h-[220px] w-full flex-col items-center justify-center gap-4 rounded-[14px] bg-gradient-to-br from-white to-slate-50/90 px-10 py-12 text-center " +
    "transition-colors duration-200 group-hover:from-emerald-50/40 group-hover:to-white";

  const formCard = (
    <Card className="w-full max-w-lg border-0 bg-transparent shadow-none ring-0">
      <CardHeader className="space-y-2 px-0 pt-0 text-center md:text-left">
        <CardTitle className="text-2xl font-bold text-slate-900 md:hidden">
          TheBuzSale
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground md:hidden">
          India&apos;s most trusted MSME M&amp;A marketplace
        </CardDescription>
        {!awaitingEmail ? (
          <CardDescription className="mt-1 text-sm text-muted-foreground md:hidden">
            {step === 1
              ? "How would you like to use TheBuzSale?"
              : "Create your account."}
          </CardDescription>
        ) : null}
        <CardDescription className="hidden text-base text-muted-foreground md:block">
          {awaitingEmail
            ? "Confirm your email to continue."
            : step === 1
              ? "How would you like to use TheBuzSale?"
              : "Create your account."}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {awaitingEmail ? (
          <div className="flex flex-col items-center gap-6 py-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Mail className="size-7" aria-hidden />
            </div>
            <p className="text-lg font-medium text-slate-900">
              Check your email to verify
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We sent a confirmation link to{" "}
              <span className="font-medium text-foreground">
                {form.getValues("email")}
              </span>
              . Open it to activate your account, or disable email confirmation
              in Supabase for instant access.
            </p>
          </div>
        ) : step === 1 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => goStep2("SELLER")}
              className={roleCardShell}
            >
              <span className={roleCardInner}>
                <span className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/60 transition-transform duration-200 group-hover:scale-105">
                  <Store className="size-8" aria-hidden />
                </span>
                <span className="text-base font-semibold text-slate-900">
                  I want to sell my business
                </span>
                <span className="text-xs text-muted-foreground">
                  List with CA-verified financials
                </span>
                <ArrowRight
                  className="size-5 text-emerald-600 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
                  aria-hidden
                />
              </span>
            </button>
            <button
              type="button"
              onClick={() => goStep2("BUYER")}
              className={roleCardShell}
            >
              <span className={roleCardInner}>
                <span className="flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-800 ring-1 ring-slate-200/80 transition-transform duration-200 group-hover:scale-105">
                  <Search className="size-8" aria-hidden />
                </span>
                <span className="text-base font-semibold text-slate-900">
                  I want to acquire a business
                </span>
                <span className="text-xs text-muted-foreground">
                  Browse verified MSME listings
                </span>
                <ArrowRight
                  className="size-5 text-emerald-600 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
                  aria-hidden
                />
              </span>
            </button>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={onSubmit}>
            <input type="hidden" {...form.register("role")} />
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Full name
              </Label>
              <Input
                id="fullName"
                autoComplete="name"
                placeholder="Your full name"
                className="h-12 text-base"
                aria-invalid={!!form.formState.errors.fullName}
                {...form.register("fullName")}
              />
              {form.formState.errors.fullName?.message ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.fullName.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className="h-12 text-base"
                aria-invalid={!!form.formState.errors.email}
                {...form.register("email")}
              />
              {form.formState.errors.email?.message ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="h-12 text-base"
                aria-invalid={!!form.formState.errors.password}
                {...form.register("password")}
              />
              {form.formState.errors.password?.message ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter password"
                className="h-12 text-base"
                aria-invalid={!!form.formState.errors.confirmPassword}
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword?.message ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.confirmPassword.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:gap-4">
              <Button
                type="button"
                variant="outline"
                className="h-12 sm:min-w-[7rem]"
                onClick={() => {
                  setStep(1);
                  setRole(null);
                }}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="h-12 flex-1 bg-emerald-600 text-base text-white hover:bg-emerald-700 sm:max-w-xs sm:flex-none sm:min-w-48"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Creating…" : "Create account"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-0 px-0 pt-8">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className={cn(
              buttonVariants({ variant: "link", size: "sm" }),
              "h-auto px-0 text-base text-emerald-600"
            )}
          >
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-1 flex-col bg-white md:flex-row">
      <AuthBrandPanel />
      <div className="flex flex-1 flex-col justify-center bg-white px-6 py-12 md:w-1/2 md:px-10 md:py-16 lg:px-16">
        <div className="mx-auto w-full max-w-lg">{formCard}</div>
      </div>
    </div>
  );
}
