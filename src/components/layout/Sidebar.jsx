import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  // Navigation items
  const navItems = [
    {
      section: "Main",
      items: [
        {
          path: "/dashboard",
          label: "Dashboard",
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
          ),
        },
        {
          path: "/forms/new",
          label: "Create Form",
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          ),
        },
      ],
    },
    {
      section: "Forms",
      items: [
        {
          path: "/forms",
          label: "All Forms",
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          path: "/templates",
          label: "Templates",
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
        },
      ],
    },
    {
      section: "Analytics",
      items: [
        {
          path: "/analytics",
          label: "Analytics",
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
        },
        {
          path: "/responses",
          label: "Responses",
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          ),
        },
      ],
    },
  ];

  const bottomItems = [
    {
      path: "/settings",
      label: "Settings",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      path: "/help",
      label: "Help & Support",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-y-0 left-0 z-50 w-64 lg:static lg:inset-0"
        >
          <div className="flex h-full flex-col bg-surface-800/95 backdrop-blur-xl border-r border-white/10">
            {/* Sidebar header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-400 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="hidden lg:block">
                  <h2 className="font-azonix text-lg font-normal gradient-text">
                    AutoForm
                  </h2>
                </div>
              </Link>

              {/* Close button for mobile */}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                className="lg:hidden"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
              {navItems.map((section) => (
                <div key={section.section}>
                  <h3 className="text-xs font-medium text-muted-300 uppercase tracking-wider mb-3">
                    {section.section}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          onClick={() => onClose()}
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                            location.pathname === item.path
                              ? "bg-primary-500/10 text-primary-500 shadow-inner-glow"
                              : "text-muted-300 hover:text-foreground hover:bg-white/5"
                          )}
                        >
                          <span
                            className={cn(
                              "transition-colors duration-200",
                              location.pathname === item.path
                                ? "text-primary-500"
                                : "text-muted-300 group-hover:text-primary-500"
                            )}
                          >
                            {item.icon}
                          </span>
                          <span>{item.label}</span>

                          {/* Active indicator */}
                          {location.pathname === item.path && (
                            <motion.div
                              layoutId="activeTab"
                              className="ml-auto w-1 h-4 bg-primary-500 rounded-full"
                              initial={false}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="p-4 border-t border-white/10">
              <div className="space-y-2">
                <Link to="/forms/new">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onClose()}
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Form
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bottom section */}
            <div className="p-4 border-t border-white/10">
              <ul className="space-y-1">
                {bottomItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => onClose()}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                        location.pathname === item.path
                          ? "bg-primary-500/10 text-primary-500"
                          : "text-muted-300 hover:text-foreground hover:bg-white/5"
                      )}
                    >
                      <span className="text-muted-300 group-hover:text-primary-500 transition-colors duration-200">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* User profile */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-400 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    U
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      User Name
                    </p>
                    <p className="text-xs text-muted-300 truncate">
                      Free Plan
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-accent-400/5 pointer-events-none rounded-r-xl" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
