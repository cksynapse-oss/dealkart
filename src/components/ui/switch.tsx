"use client";

import * as React from "react";
import { Switch as SwitchParts } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchParts.Root>) {
  return (
    <SwitchParts.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[1.375rem] w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-emerald-600 dark:bg-input/80 dark:data-checked:bg-emerald-600",
        className
      )}
      {...props}
    >
      <SwitchParts.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-5 translate-x-0.5 rounded-full bg-background shadow-sm ring-0 transition-transform duration-200 data-checked:translate-x-[calc(100%-2px)] data-checked:bg-white"
        )}
      />
    </SwitchParts.Root>
  );
}

export { Switch };
