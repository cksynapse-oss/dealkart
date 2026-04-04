"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressValue } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type OnboardingContinueBannerProps = {
  progressPercent: number;
  layerCompleted: number;
};

export function OnboardingContinueBanner({
  progressPercent,
  layerCompleted,
}: OnboardingContinueBannerProps) {
  return (
    <Card className="border-amber-200 bg-amber-50/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-amber-950">
          Finish setting up your seller profile
        </CardTitle>
        <CardDescription className="text-amber-900/80">
          You&apos;re on step {Math.min(layerCompleted + 1, 4)} of 4. Complete
          onboarding to submit listings for review.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progressPercent} className="w-full flex-col gap-2">
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-sm font-medium text-amber-950">Progress</span>
            <ProgressValue className="text-amber-900" />
          </div>
        </Progress>
        <Link
          href="/seller/onboarding"
          className={cn(
            buttonVariants({ variant: "default", size: "default" }),
            "inline-flex h-11 bg-emerald-600 text-white hover:bg-emerald-700"
          )}
        >
          Continue Onboarding
        </Link>
      </CardContent>
    </Card>
  );
}
