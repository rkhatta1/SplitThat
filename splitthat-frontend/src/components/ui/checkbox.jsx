import { cn } from "../../lib/utils";

export function Checkbox({ className, ...props }) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border border-input " +
          "text-primary focus:ring-2 focus:ring-ring",
        className
      )}
      {...props}
    />
  );
}