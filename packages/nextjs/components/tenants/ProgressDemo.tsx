"use client";

import { Progress } from "../ui/progress";
import { clsx } from "clsx";
import * as React from "react";

interface ProgressProps {
  value?: number;

  className?: string;
}

export function ProgressDemo({
  value = 0,

  className = "",
}: ProgressProps) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(value), 500);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Progress value={progress} className={clsx("bg-gray-200", className)} />
  );
}
