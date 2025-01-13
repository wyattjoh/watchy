import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export function WidgetButtonFallback() {
  return (
    <Button
      className="flex text-xs"
      size="sm"
      variant="secondary"
      type="button"
      disabled
    >
      <Loader2 className="h-4 w-4 animate-spin" />
    </Button>
  );
}

type Props = {
  children: React.ReactNode;
  className?: string;
};

export const WidgetButton = forwardRef<HTMLButtonElement, Props>(
  ({ children, className, ...props }, ref) => {
    return (
      <Button
        {...props}
        ref={ref}
        className={cn("flex justify-start text-xs", className)}
        size="sm"
        variant="secondary"
        type="button"
      >
        {children}
      </Button>
    );
  }
);
