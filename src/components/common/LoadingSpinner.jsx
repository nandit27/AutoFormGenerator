import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const LoadingSpinner = ({
  size = "default",
  className = "",
  text = null,
  variant = "primary"
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  const variants = {
    primary: "text-primary-500",
    accent: "text-accent-400",
    white: "text-white",
    muted: "text-muted-300"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center space-y-2">
        {/* Spinner */}
        <motion.div
          className={cn(
            "relative",
            sizeClasses[size]
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {/* Outer ring */}
          <div className={cn(
            "absolute inset-0 rounded-full border-2 border-transparent",
            variants[variant]
          )}>
            <div className="absolute inset-0 rounded-full border-t-2 border-current opacity-75" />
          </div>

          {/* Inner ring */}
          <div className={cn(
            "absolute inset-1 rounded-full border-2 border-transparent",
            variants[variant]
          )}>
            <div
              className="absolute inset-0 rounded-full border-t-2 border-current opacity-50"
              style={{ animationDelay: "0.5s" }}
            />
          </div>

          {/* Center dot */}
          <div className={cn(
            "absolute top-1/2 left-1/2 w-1 h-1 rounded-full -translate-x-1/2 -translate-y-1/2",
            variants[variant],
            "opacity-60"
          )} />
        </motion.div>

        {/* Loading text */}
        {text && (
          <motion.p
            className="text-sm text-muted-300"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  );
};

// Specialized loading spinners
const FormLoadingSpinner = ({ className = "" }) => (
  <div className={cn("min-h-[400px] flex items-center justify-center", className)}>
    <div className="text-center space-y-4">
      <LoadingSpinner size="xl" variant="primary" />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Generating your form...
        </h3>
        <p className="text-sm text-muted-300 max-w-sm">
          Our AI is analyzing your prompt and creating the perfect form schema
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

const GoogleFormsLoadingSpinner = ({ className = "" }) => (
  <div className={cn("min-h-[400px] flex items-center justify-center", className)}>
    <div className="text-center space-y-4">
      <LoadingSpinner size="xl" variant="accent" />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Creating Google Form...
        </h3>
        <p className="text-sm text-muted-300 max-w-sm">
          Connecting to Google Forms API and setting up your form
        </p>
      </div>

      {/* Google-style progress bar */}
      <div className="w-64 h-1 bg-surface-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-accent-400 to-primary-500"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  </div>
);

const SkeletonLoader = ({ className = "" }) => (
  <div className={cn("animate-pulse", className)}>
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-6 bg-surface-700/50 rounded-lg w-3/4" />
        <div className="h-4 bg-surface-700/30 rounded-lg w-1/2" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-surface-700/50 rounded w-1/4" />
            <div className="h-10 bg-surface-700/30 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Button skeleton */}
      <div className="h-10 bg-surface-700/50 rounded-lg w-32" />
    </div>
  </div>
);

// Pulse animation for loading states
const PulseLoader = ({
  count = 3,
  size = "default",
  className = ""
}) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    default: "w-3 h-3",
    lg: "w-4 h-4"
  };

  return (
    <div className={cn("flex space-x-1", className)}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            "bg-primary-500 rounded-full",
            sizeClasses[size]
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;
export {
  FormLoadingSpinner,
  GoogleFormsLoadingSpinner,
  SkeletonLoader,
  PulseLoader
};
