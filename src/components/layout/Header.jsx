import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const Header = ({ onMenuClick, showMenuButton = true }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  // Navigation items
  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
        </svg>
      ),
    },
    {
      path: "/forms/new",
      label: "Create Form",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
    },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur-xl",
        isLandingPage
          ? "bg-bg-900/80 border-white/5"
          : "bg-surface-800/80 border-white/10",
      )}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and menu */}
          <div className="flex items-center space-x-6">
            {/* Mobile menu button */}
            {showMenuButton && !isLandingPage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="lg:hidden p-2 h-10 w-10"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Custom AutoForm Logo */}
                <div className="relative">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    className="group-hover:drop-shadow-lg transition-all duration-300"
                  >
                    {/* Background circle with gradient */}
                    <defs>
                      <linearGradient
                        id="logoGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#7C5CFF" />
                        <stop offset="100%" stopColor="#9C7AFF" />
                      </linearGradient>
                      <linearGradient
                        id="iconGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#E2E8F0" />
                      </linearGradient>
                    </defs>

                    {/* Main circle */}
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      fill="url(#logoGradient)"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />

                    {/* Form icon - stylized document with lines */}
                    <g fill="url(#iconGradient)">
                      {/* Document outline */}
                      <path
                        d="M12 10 L28 10 Q29 10 29 11 L29 29 Q29 30 28 30 L12 30 Q11 30 11 29 L11 11 Q11 10 12 10 Z"
                        fill="url(#iconGradient)"
                        opacity="0.9"
                      />

                      {/* Form lines */}
                      <rect
                        x="14"
                        y="14"
                        width="8"
                        height="1.5"
                        rx="0.75"
                        fill="rgba(124, 92, 255, 0.6)"
                      />
                      <rect
                        x="14"
                        y="17"
                        width="12"
                        height="1.5"
                        rx="0.75"
                        fill="rgba(124, 92, 255, 0.4)"
                      />
                      <rect
                        x="14"
                        y="20"
                        width="6"
                        height="1.5"
                        rx="0.75"
                        fill="rgba(124, 92, 255, 0.4)"
                      />
                      <rect
                        x="14"
                        y="23"
                        width="10"
                        height="1.5"
                        rx="0.75"
                        fill="rgba(124, 92, 255, 0.4)"
                      />

                      {/* AI spark */}
                      <circle
                        cx="24"
                        cy="12"
                        r="1.5"
                        fill="#FFD700"
                        opacity="0.8"
                      />
                      <path
                        d="M24 9 L24.5 10.5 L26 11 L24.5 11.5 L24 13 L23.5 11.5 L22 11 L23.5 10.5 Z"
                        fill="#FFD700"
                        opacity="0.6"
                      />
                    </g>
                  </svg>
                </div>
              </motion.div>

              {/* Logo text */}
              <div className="hidden sm:block">
                <h1 className="font-bold text-xl text-foreground group-hover:text-primary-400 transition-colors duration-300">
                  AutoForm
                </h1>
                <p className="text-xs text-muted-400 -mt-1 font-medium tracking-wide">
                  Generator
                </p>
              </div>
            </Link>
          </div>

          {/* Center - Navigation (desktop only) */}
          {!isLandingPage && (
            <nav className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={
                      location.pathname === item.path ? "default" : "ghost"
                    }
                    size="sm"
                    className="text-sm font-medium px-4 py-2 h-10 space-x-2"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}
            </nav>
          )}

          {/* Right side - Actions */}
          <div className="flex items-center space-x-4">
            {isLandingPage ? (
              /* Landing page actions */
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-5 py-2 h-10"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="default"
                  size="sm"
                  className="px-6 py-2 h-10"
                  onClick={() => {
                    document
                      .getElementById("prompt-input")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Get Started
                </Button>
              </div>
            ) : (
              /* App actions */
              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative p-2 h-10 w-10"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {/* Notification badge */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-danger-400 rounded-full animate-pulse" />
                </Button>

                {/* User menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-3 px-3 py-2 h-10"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-accent-400 rounded-full flex items-center justify-center text-sm font-semibold text-white">
                      U
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">
                      User
                    </span>
                    <svg
                      className="h-4 w-4 text-muted-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            )}

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex p-2 h-10 w-10"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Progress bar for form creation flow */}
      {(location.pathname === "/preview" || location.pathname === "/flow") && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-400 origin-left"
          style={{
            width: location.pathname === "/preview" ? "33%" : "66%",
          }}
        />
      )}

      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-accent-400/5 pointer-events-none" />
    </motion.header>
  );
};

export default Header;
