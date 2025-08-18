import { cn } from "../../lib/utils";

export function Button({
  className,
  variant = "default",
  size = "md",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium " +
    "transition-colors focus:outline-none focus:ring-2 " +
    "focus:ring-ring disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default:
      "bg-primary text-primary-foreground hover:opacity-90",
    outline:
      "border border-input bg-transparent hover:bg-secondary",
    ghost: "hover:bg-secondary",
    destructive:
      "bg-destructive text-white hover:opacity-90"
  };
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-11 px-6 text-base"
  };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}