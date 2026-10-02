import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-900 text-zinc-50 shadow-xs hover:bg-zinc-800 active:scale-[0.99]",
        destructive:
          "bg-rose-600 text-white shadow-xs hover:bg-rose-700 active:scale-[0.99]",
        outline:
          "border border-zinc-200 bg-white shadow-2xs hover:bg-zinc-50 hover:text-zinc-900 text-zinc-700 active:scale-[0.99]",
        secondary:
          "bg-zinc-100 text-zinc-900 shadow-2xs hover:bg-zinc-200/80 active:scale-[0.99]",
        ghost: "hover:bg-zinc-100 hover:text-zinc-900 active:scale-[0.99]",
        link: "text-zinc-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8.5 px-3 py-1.5",
        md: "h-8.5 px-3 py-1.5",
        sm: "h-7 rounded-md px-2.5 text-xs",
        lg: "h-10 rounded-md px-4 text-sm",
        icon: "size-8 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="size-3.5 animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
