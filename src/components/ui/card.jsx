import * as React from "react";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const cardVariants = cva(
  "rounded-xl transition-all duration-300 ease-out relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "glass-card text-foreground",
        solid: "bg-surface-800 border border-surface-700 text-foreground shadow-3d",
        outline: "border-2 border-primary-500/30 bg-transparent text-foreground hover:border-primary-500/50",
        ghost: "bg-transparent text-foreground hover:bg-surface-800/30",
        gradient: "bg-gradient-to-br from-surface-800 to-surface-700 text-foreground shadow-3d-lg",
        neon: "glass-card border border-primary-500/30 shadow-neon text-foreground",
        floating: "glass-card shadow-3d-lg hover:shadow-[0_20px_40px_rgba(124,92,255,0.15)] transform hover:-translate-y-1",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      interactive: {
        true: "cursor-pointer hover-tilt hover:shadow-3d-lg",
        false: "",
      },
      glow: {
        true: "hover:shadow-neon",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false,
      glow: false,
    },
  },
);

const Card = React.forwardRef(
  ({ className, variant, size, interactive, glow, children, onClick, ...props }, ref) => {
    const MotionCard = motion.div;

    const motionProps = interactive
      ? {
          whileHover: {
            scale: 1.02,
            transition: { duration: 0.2, ease: "easeOut" }
          },
          whileTap: {
            scale: 0.98,
            transition: { duration: 0.1 }
          },
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, ease: "easeOut" },
        }
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, ease: "easeOut" },
        };

    return (
      <MotionCard
        ref={ref}
        className={cn(cardVariants({ variant, size, interactive, glow }), className)}
        onClick={onClick}
        {...motionProps}
        {...props}
      >
        {/* Shimmer effect overlay */}
        <div className="absolute inset-0 overflow-hidden rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Glow effect for neon variant */}
        {variant === "neon" && (
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 rounded-xl shadow-neon" />
          </div>
        )}
      </MotionCard>
    );
  },
);

Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, children, gradient = false, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      gradient ? "gradient-text" : "text-foreground",
      className,
    )}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-300 leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-6", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Specialized card components
const StatsCard = React.forwardRef(
  ({ className, title, value, change, changeType = "neutral", icon, ...props }, ref) => (
    <Card
      ref={ref}
      variant="default"
      className={cn("hover:shadow-neon transition-all duration-300", className)}
      {...props}
    >
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-300">{title}</p>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {change && (
                <p
                  className={cn(
                    "text-xs font-medium flex items-center gap-1",
                    changeType === "positive" && "text-success-400",
                    changeType === "negative" && "text-danger-400",
                    changeType === "neutral" && "text-muted-300",
                  )}
                >
                  {changeType === "positive" && (
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3.13 6.44l6.88 6.88 6.88-6.88a.75.75 0 111.06 1.06L10.56 14.38a.75.75 0 01-1.06 0L2.07 7.5a.75.75 0 111.06-1.06z" />
                    </svg>
                  )}
                  {changeType === "negative" && (
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.87 13.56l-6.88-6.88-6.88 6.88a.75.75 0 11-1.06-1.06L9.44 5.62a.75.75 0 011.06 0l7.49 7.88a.75.75 0 11-1.06 1.06z" />
                    </svg>
                  )}
                  {change}
                </p>
              )}
            </div>
          </div>
          {icon && (
            <div className="h-12 w-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  ),
);
StatsCard.displayName = "StatsCard";

const FeatureCard = React.forwardRef(
  ({ className, title, description, icon, onClick, ...props }, ref) => (
    <Card
      ref={ref}
      variant="floating"
      interactive={!!onClick}
      glow
      onClick={onClick}
      className={cn("text-center", className)}
      {...props}
    >
      <CardContent className="space-y-4">
        {icon && (
          <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-400/20 flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        )}
        <div className="space-y-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardContent>
    </Card>
  ),
);
FeatureCard.displayName = "FeatureCard";

const GlowCard = React.forwardRef(({ className, children, glowColor = "primary", ...props }, ref) => (
  <div className="relative">
    {/* Glow background */}
    <div
      className={cn(
        "absolute -inset-1 rounded-2xl opacity-75 blur-lg transition-all duration-300 group-hover:opacity-100",
        glowColor === "primary" && "bg-gradient-to-r from-primary-500 via-accent-400 to-primary-500",
        glowColor === "accent" && "bg-gradient-to-r from-accent-400 via-primary-500 to-accent-400",
        glowColor === "success" && "bg-gradient-to-r from-success-400 to-success-500",
        glowColor === "danger" && "bg-gradient-to-r from-danger-400 to-danger-500",
      )}
    />
    <Card
      ref={ref}
      variant="solid"
      className={cn("relative", className)}
      {...props}
    >
      {children}
    </Card>
  </div>
));
GlowCard.displayName = "GlowCard";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  StatsCard,
  FeatureCard,
  GlowCard,
  cardVariants,
};
