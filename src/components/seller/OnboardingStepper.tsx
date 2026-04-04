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
}: OnboardingStepperProps) {
  const completedSet = new Set(completedSteps);

  return (
    <div className="w-full">
      {/* Mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        <p className="text-center text-sm font-medium text-slate-700">
          Step {currentStep} of 4 — {STEP_LABELS[currentStep - 1]}
        </p>
        <div className="flex justify-center gap-2" role="list">
          {[1, 2, 3, 4].map((n) => {
            const done = completedSet.has(n);
            const active = n === currentStep;
            return (
              <span
                key={n}
                role="listitem"
                className={
                  done
                    ? "size-2.5 rounded-full bg-emerald-600"
                    : active
                      ? "size-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-200 ring-offset-2"
                      : "size-2.5 rounded-full bg-slate-200"
                }
                aria-label={
                  done
                    ? `Step ${n} completed`
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

            return (
              <div key={label} className="flex min-w-0 flex-1 items-center">
                <div className="flex w-full min-w-0 flex-col items-center gap-2">
                  <StepCircle
                    stepNum={stepNum}
                    currentStep={currentStep}
                    completed={completed}
                  />
                  <span
                    className={
                      stepNum === currentStep
                        ? "px-1 text-center text-[11px] font-semibold leading-tight text-emerald-800 sm:text-xs"
                        : completed
                          ? "px-1 text-center text-[11px] font-medium leading-tight text-emerald-700 sm:text-xs"
                          : "px-1 text-center text-[11px] font-medium leading-tight text-slate-500 sm:text-xs"
                    }
                  >
                    {label}
                  </span>
                </div>
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
