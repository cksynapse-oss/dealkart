"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  loginAuthFormSchema,
  type LoginAuthFormValues,
} from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/database";
import { Mail } from "lucide-react";

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

const RESEND_SECONDS = 30;

function LoginEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [authChecking, setAuthChecking] = useState(true);
  const [sent, setSent] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [passwordSigningIn, setPasswordSigningIn] = useState(false);
  const [magicSending, setMagicSending] = useState(false);

  const form = useForm<LoginAuthFormValues>({
    resolver: zodResolver(loginAuthFormSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    let cancelled = false;
    const client = createClient();
    (async () => {
      const {
        data: { user },
      } = await client.auth.getUser();
      if (cancelled) return;
      if (user) {
        const { data: profile } = await client
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        const metaRole = user.user_metadata?.role as UserRole | undefined;
        const role = profile?.role ?? metaRole;
        router.replace(redirectPathForRole(role));
        router.refresh();
        return;
      }
      setAuthChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      toast.error(decodeURIComponent(err.replace(/\+/g, " ")));
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = window.setInterval(() => {
      setResendSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [resendSeconds]);

  const redirectUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/auth/callback`;
  }, []);

  const sendLink = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectUrl() },
      });
      if (error) {
        toast.error(error.message);
        return false;
      }
      return true;
    },
    [supabase, redirectUrl]
  );

  const handleMagicLink = async () => {
    const emailOk = await form.trigger("email");
    if (!emailOk) return;
    const email = form.getValues("email").trim();
    setMagicSending(true);
    const ok = await sendLink(email);
    setMagicSending(false);
    if (!ok) return;
    setSubmittedEmail(email);
    setSent(true);
    setResendSeconds(RESEND_SECONDS);
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || !submittedEmail) return;
    const ok = await sendLink(submittedEmail);
    if (!ok) return;
    setResendSeconds(RESEND_SECONDS);
    toast.success("Link sent again.");
  };

  const handlePasswordSignIn = form.handleSubmit(async (values) => {
    setPasswordSigningIn(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email.trim(),
      password: values.password,
    });
    if (error) {
      toast.error(error.message);
      setPasswordSigningIn(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Could not load session");
      setPasswordSigningIn(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const metaRole = user.user_metadata?.role as UserRole | undefined;
    const role = profile?.role ?? metaRole;

    router.push(redirectPathForRole(role));
    router.refresh();
  });

  const formCard = (
    <Card className="w-full max-w-md border-0 bg-transparent shadow-none ring-0">
      <CardHeader className="space-y-2 px-0 pt-0 text-center md:text-left">
        <CardTitle className="text-2xl font-bold text-slate-900 md:hidden">
          TheBuzSale
        </CardTitle>
        <CardDescription className="space-y-2 text-base text-muted-foreground md:hidden">
          <span className="block">
            India&apos;s most trusted MSME M&amp;A marketplace
          </span>
          <span className="block text-sm">
            Sign in with your email and password.
          </span>
        </CardDescription>
        <CardDescription className="hidden text-base text-muted-foreground md:block">
          Sign in with your email and password.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {sent ? (
          <div className="flex flex-col items-center gap-6 py-4 text-center md:items-stretch">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Mail className="size-7" aria-hidden />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-900">Check your email!</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We sent a login link to{" "}
                <span className="font-medium text-foreground">{submittedEmail}</span>.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full"
              disabled={resendSeconds > 0}
              onClick={() => void handleResend()}
            >
              {resendSeconds > 0
                ? `Resend in ${resendSeconds}s`
                : "Resend login link"}
            </Button>
          </div>
        ) : (
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handlePasswordSignIn();
                  }
                }}
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
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-12 text-base"
                disabled={passwordSigningIn || magicSending}
                aria-invalid={!!form.formState.errors.password}
                {...form.register("password")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handlePasswordSignIn();
                  }
                }}
              />
              {form.formState.errors.password?.message ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              className="h-12 w-full bg-emerald-600 text-base text-white hover:bg-emerald-700"
              disabled={
                passwordSigningIn || magicSending || form.formState.isSubmitting
              }
              onClick={() => void handlePasswordSignIn()}
            >
              {passwordSigningIn ? "Signing in…" : "Sign in"}
            </Button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <span className="bg-white px-3">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full text-sm text-muted-foreground hover:text-foreground"
              disabled={
                magicSending || passwordSigningIn || form.formState.isSubmitting
              }
              onClick={() => void handleMagicLink()}
            >
              {magicSending ? "Sending…" : "Send magic link"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-0 px-0 pt-8">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className={cn(
              buttonVariants({ variant: "link", size: "sm" }),
              "h-auto px-0 text-base text-emerald-600"
            )}
          >
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );

  if (authChecking) {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-1 flex-col bg-white md:flex-row">
        <AuthBrandPanel />
        <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 md:w-1/2">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-1 flex-col bg-white md:flex-row">
      <AuthBrandPanel />
      <div className="flex flex-1 flex-col justify-center bg-white px-6 py-12 md:w-1/2 md:px-10 md:py-16 lg:px-16">
        <div className="mx-auto w-full max-w-md">{formCard}</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100dvh-3.5rem)] flex-1 items-center justify-center bg-white text-muted-foreground">
          Loading…
        </div>
      }
    >
      <LoginEmailForm />
    </Suspense>
  );
}
