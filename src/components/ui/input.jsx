import * as React from "react";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const inputVariants = cva(
  "flex w-full transition-all duration-300 ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "glass border border-white/10 bg-surface-800/50 text-foreground focus:bg-surface-700/50 focus:border-primary-500/50 focus:shadow-neon",
        pill: "input-pill bg-surface-800/50 border-transparent text-foreground focus:bg-surface-700/50 focus:border-primary-500/50 focus:shadow-neon",
        outline:
          "border-2 border-primary-500/30 bg-transparent text-foreground focus:border-primary-500 focus:shadow-neon",
        ghost:
          "border-transparent bg-transparent text-foreground hover:bg-surface-800/30 focus:bg-surface-800/50",
        solid: "bg-surface-700 border border-surface-600 text-foreground focus:border-primary-500",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm rounded-lg",
        sm: "h-8 px-3 py-1 text-xs rounded-md",
        lg: "h-12 px-6 py-3 text-base rounded-xl",
        xl: "h-14 px-8 py-4 text-lg rounded-xl",
      },
      state: {
        default: "",
        error: "border-danger-400/50 focus:border-danger-400 focus:shadow-[0_0_20px_rgba(255,107,107,0.3)]",
        success: "border-success-400/50 focus:border-success-400 focus:shadow-[0_0_20px_rgba(34,197,94,0.3)]",
        warning: "border-yellow-400/50 focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(251,191,36,0.3)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  },
);

const Input = React.forwardRef(
  ({ className, type, variant, size, state, error, success, icon, rightIcon, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const handleFocus = (e) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Determine state based on props
    const currentState = error ? "error" : success ? "success" : state;

    const InputComponent = (
      <div className="relative group">
        {/* Left icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-300 transition-colors duration-300 group-hover:text-primary-500 pointer-events-none z-10">
            {icon}
          </div>
        )}

        <motion.input
          type={type}
          className={cn(
            inputVariants({ variant, size, state: currentState }),
            icon && "pl-10",
            rightIcon && "pr-10",
            className,
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          {...props}
        />

        {/* Right icon */}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-300 transition-colors duration-300 group-hover:text-primary-500 pointer-events-none z-10">
            {rightIcon}
          </div>
        )}

        {/* Focus ring effect */}
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: isFocused ? 1 : 0,
            scale: isFocused ? 1 : 0.95,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="absolute inset-0 rounded-lg ring-2 ring-primary-500 ring-opacity-30 shadow-neon" />
        </motion.div>

        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 overflow-hidden rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
        </div>
      </div>
    );

    return InputComponent;
  },
);

Input.displayName = "Input";

// Specialized input components
const SearchInput = React.forwardRef(({ className, ...props }, ref) => (
  <Input
    ref={ref}
    type="search"
    variant="pill"
    icon={
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    }
    className={cn("pr-4", className)}
    {...props}
  />
));
SearchInput.displayName = "SearchInput";

const PasswordInput = React.forwardRef(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <Input
      ref={ref}
      type={showPassword ? "text" : "password"}
      rightIcon={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-muted-300 hover:text-primary-500 transition-colors duration-200"
          tabIndex={-1}
        >
          {showPassword ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      }
      className={className}
      {...props}
    />
  );
});
PasswordInput.displayName = "PasswordInput";

const PillInput = React.forwardRef(({ className, button, buttonText = "Submit", onButtonClick, ...props }, ref) => {
  return (
    <div className="relative">
      <Input
        ref={ref}
        variant="pill"
        className={cn("pr-24", className)}
        {...props}
      />
      {button && (
        <motion.button
          type="button"
          onClick={onButtonClick}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-medium rounded-full hover:from-primary-400 hover:to-primary-500 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-bg-900"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {buttonText}
        </motion.button>
      )}
    </div>
  );
});
PillInput.displayName = "PillInput";

export { Input, SearchInput, PasswordInput, PillInput, inputVariants };
