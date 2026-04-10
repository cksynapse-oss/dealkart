"use client";

import { Check } from "lucide-react";

const STEP_LABELS = [
  "Business Identity",
  "Financials",
  "Documents",
  "Preferences",
] as const;

type OnboardingStepperProps = {
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
};

function StepCircle({
  stepNum,
  currentStep,
  completed,
}: {
  stepNum: number;
  currentStep: number;
  completed: boolean;
}) {
  if (completed) {
    return (
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm"
        aria-hidden
      >
        <Check className="size-4 stroke-[2.5]" />
      </span>
    );
  }
  if (stepNum === currentStep) {
    return (
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-emerald-600 bg-white shadow-sm ring-2 ring-emerald-600/25"
        aria-hidden
      >
        <span className="size-2.5 rounded-full bg-emerald-600" />
      </span>
    );
  }
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-400"
      aria-hidden
    />
  );
}

export function OnboardingStepper({
  currentStep,
  completedSteps,
  onStepClick,
}: OnboardingStepperProps) {
  const completedSet = new Set(completedSteps);

  const canClick = (stepNum: number) =>
    onStepClick && (completedSet.has(stepNum) || stepNum === currentStep);

  const handleClick = (stepNum: number) => {
    if (canClick(stepNum)) onStepClick!(stepNum);
  };

  return (
    <div className="w-full">
      {/* Mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        <p className="text-center text-sm font-medium text-slate-700">
          Step {currentStep} of 4 - {STEP_LABELS[currentStep - 1]}
        </p>
        <div className="flex justify-center gap-2" role="list">
          {[1, 2, 3, 4].map((n) => {
            const done = completedSet.has(n);
            const active = n === currentStep;
            const clickable = done || active;
            return (
              <button
                key={n}
                type="button"
                role="listitem"
                disabled={!clickable}
                onClick={() => handleClick(n)}
                className={
                  done
                    ? "size-2.5 rounded-full bg-emerald-600 cursor-pointer"
                    : active
                      ? "size-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-200 ring-offset-2"
                      : "size-2.5 rounded-full bg-slate-200 cursor-default"
                }
                aria-label={
                  done
                    ? `Step ${n} completed - click to edit`
                    : active
                      ? `Step ${n} current`
                      : `Step ${n} not started`
                }
              />
            );
          })}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <div className="flex w-full items-start">
          {STEP_LABELS.map((label, index) => {
            const stepNum = index + 1;
            const completed = completedSet.has(stepNum);
            const isLast = index === STEP_LABELS.length - 1;
            const lineDone = completedSet.has(stepNum);
            const clickable = canClick(stepNum);

            return (
              <div key={label} className="flex min-w-0 flex-1 items-center">
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => handleClick(stepNum)}
                  className={`flex w-full min-w-0 flex-col items-center gap-2 ${
                    clickable ? "cursor-pointer group" : "cursor-default"
                  }`}
                >
                  <div className={clickable ? "group-hover:scale-110 transition-transform" : ""}>
                    <StepCircle
                      stepNum={stepNum}
                      currentStep={currentStep}
                      completed={completed}
                    />
                  </div>
                  <span
                    className={
                      stepNum === currentStep
                        ? "px-1 text-center text-[11px] font-semibold leading-tight text-emerald-800 sm:text-xs"
                        : completed
                          ? "px-1 text-center text-[11px] font-medium leading-tight text-emerald-700 sm:text-xs group-hover:text-emerald-900 group-hover:underline"
                          : "px-1 text-center text-[11px] font-medium leading-tight text-slate-500 sm:text-xs"
                    }
                  >
                    {label}
                  </span>
                </button>
                {!isLast ? (
                  <div
                    className="mb-7 h-0.5 w-full min-w-[0.5rem] max-w-full flex-1 shrink"
                    aria-hidden
                  >
                    <div
                      className={
                        lineDone
                          ? "h-full rounded-full bg-emerald-500"
                          : "h-full rounded-full bg-slate-200"
                      }
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
