"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Layer1BusinessIdentity } from "@/components/seller/Layer1BusinessIdentity";
import { Layer2Financials } from "@/components/seller/Layer2Financials";
import { Layer3Documents, type Layer3DocumentsHandle } from "@/components/seller/Layer3Documents";
import { Layer4Preferences } from "@/components/seller/Layer4Preferences";
import { OnboardingStepper } from "@/components/seller/OnboardingStepper";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { SellerFinancials, SellerProfile } from "@/types/database";

export default function SellerOnboardingPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [financials, setFinancials] = useState<SellerFinancials | null>(null);
  const [step, setStep] = useState(1);
  const hydratedStep = useRef(false);
  const layer3Ref = useRef<Layer3DocumentsHandle | null>(null);

  const loadData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    let { data: sp, error: spError } = await supabase
      .from("seller_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (spError) {
      toast.error(spError.message);
      setLoading(false);
      return;
    }

    if (!sp) {
      const { data: inserted, error: insErr } = await supabase
        .from("seller_profiles")
        .insert({
          user_id: user.id,
          onboarding_status: "IN_PROGRESS",
          onboarding_layer_completed: 0,
          gstin_verified: false,
          registered_address: {},
          operating_locations: [],
        })
        .select("*")
        .single();

      if (insErr) {
        toast.error(insErr.message);
        setLoading(false);
        return;
      }
      sp = inserted;
    }

    setProfile(sp);

    const { data: fin } = await supabase
      .from("seller_financials")
      .select("*")
      .eq("seller_profile_id", sp.id)
      .maybeSingle();

    setFinancials(fin ?? null);

    if (!hydratedStep.current && sp) {
      hydratedStep.current = true;
      setStep(Math.min(4, Math.max(1, sp.onboarding_layer_completed + 1)));
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    document.title = "Complete Your Profile — TheBuzSale";
  }, []);

  const completedSteps =
    profile && profile.onboarding_layer_completed > 0
      ? Array.from(
          { length: profile.onboarding_layer_completed },
          (_, i) => i + 1
        )
      : [];

  const handleLayer3Continue = () => {
    void layer3Ref.current?.saveAndContinue();
  };

  if (loading || !profile) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-24 text-muted-foreground">
        Loading your profile…
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Complete Your Profile — TheBuzSale
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          A verified profile unlocks listing review and buyer introductions.
          You can revisit any step before publishing.
        </p>

        <div className="mt-10 rounded-xl border border-slate-200 bg-white px-4 py-6 sm:px-8">
          <OnboardingStepper
            currentStep={step}
            completedSteps={completedSteps}
            onStepClick={(s) => setStep(s)}
          />
        </div>

        <div className="mt-8 space-y-8">
          {step === 1 ? (
            <Layer1BusinessIdentity
              key={`l1-${profile.updated_at}`}
              sellerProfileId={profile.id}
              profile={profile}
              onSaved={() => {
                void loadData();
                setStep(2);
              }}
            />
          ) : null}
          {step === 2 ? (
            <Layer2Financials
              key={`l2-${financials?.id ?? "new"}-${profile.updated_at}`}
              sellerProfileId={profile.id}
              profile={profile}
              financials={financials}
              onSaved={() => {
                void loadData();
                setStep(3);
              }}
            />
          ) : null}
          {step === 3 ? (
            <Layer3Documents
              ref={layer3Ref}
              sellerProfileId={profile.id}
              profile={profile}
              onSaved={() => {
                void loadData();
                setStep(4);
              }}
            />
          ) : null}
          {step === 4 ? (
            <Layer4Preferences
              key={`l4-${profile.updated_at}`}
              sellerProfileId={profile.id}
              profile={profile}
              financials={financials}
              onComplete={() => {
                void loadData();
              }}
            />
          ) : null}
        </div>

        {step < 4 ? (
          <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="h-11 sm:min-w-32"
              disabled={step <= 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              Back
            </Button>
            {step === 1 || step === 2 ? (
              <Button
                type="submit"
                form="onboarding-layer-form"
                className="h-11 bg-emerald-600 px-8 text-white hover:bg-emerald-700 sm:min-w-48"
              >
                Save &amp; Continue
              </Button>
            ) : step === 3 ? (
              <Button
                type="button"
                className="h-11 bg-emerald-600 px-8 text-white hover:bg-emerald-700 sm:min-w-48"
                onClick={handleLayer3Continue}
              >
                Save &amp; Continue
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
