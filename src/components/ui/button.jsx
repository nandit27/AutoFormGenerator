import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-900 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group btn-3d",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-3d hover:from-primary-400 hover:to-primary-500 hover:shadow-neon",
        destructive:
          "bg-gradient-to-br from-danger-400 to-danger-500 text-white shadow-3d hover:from-danger-300 hover:to-danger-400",
        outline:
          "border-2 border-primary-500/50 bg-transparent text-primary-500 shadow-inner-glow hover:bg-primary-500/10 hover:border-primary-500 hover:shadow-neon",
        secondary:
          "bg-gradient-to-br from-surface-800 to-surface-700 text-foreground border border-white/10 shadow-3d hover:from-surface-700 hover:to-surface-600",
        ghost:
          "bg-transparent text-foreground hover:bg-primary-500/10 hover:text-primary-500 rounded-xl",
        accent:
          "bg-gradient-to-br from-accent-400 to-accent-500 text-bg-900 shadow-3d hover:from-accent-300 hover:to-accent-400 hover:shadow-neon-accent",
        success:
          "bg-gradient-to-br from-success-400 to-success-500 text-white shadow-3d hover:from-success-300 hover:to-success-400",
        link: "text-primary-500 underline-offset-4 hover:underline bg-transparent shadow-none hover:text-primary-400",
        pill: "bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full shadow-3d hover:from-primary-400 hover:to-primary-500 hover:shadow-neon",
        glass:
          "glass text-foreground backdrop-blur-xl border border-white/10 hover:bg-white/20 hover:border-white/20",
      },
      size: {
        default: "h-10 px-6 py-2 text-sm",
        sm: "h-8 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base font-semibold",
        xl: "h-14 rounded-xl px-10 text-lg font-semibold",
        icon: "h-10 w-10 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
      glow: {
        true: "hover:shadow-neon",
        false: "",
      },
      tilt: {
        true: "hover-tilt",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: true,
      tilt: true,
    },
  },
);

const Button = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      glow,
      tilt,
      asChild = false,
      children,
      disabled,
      loading = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : motion.button;

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    );

    const motionProps = !asChild
      ? {
          whileHover: { scale: disabled ? 1 : 1.02 },
          whileTap: { scale: disabled ? 1 : 0.98 },
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.2,
            ease: "easeOut",
            type: "spring",
            stiffness: 300,
            damping: 30,
          },
        }
      : {};

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, glow, tilt }), className)}
        ref={ref}
        disabled={disabled || loading}
        {...motionProps}
        {...props}
      >
        {/* Shimmer effect overlay */}
        <div className="absolute inset-0 -top-px overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-out shimmer" />
        </div>

        {/* Button content */}
        <span className="relative flex items-center justify-center">
          {loading && <LoadingSpinner />}
          {children}
        </span>

        {/* Neon glow effect */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded-lg shadow-neon" />
        </div>
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
