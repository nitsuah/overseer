'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Overseer',
    description: 'A quick tour of your repository intelligence dashboard. We\'ll walk through the key features automatically. Click Skip Tour anytime to exit.',
    target: 'header',
    position: 'bottom',
  },
  {
    id: 'repo-name',
    title: 'Repository Name',
    description: 'Click any repository name to expand and view detailed health metrics, documentation status, and recommendations.',
    target: '[data-tour="repo-name"]',
    position: 'right',
  },
  {
    id: 'health-score',
    title: 'Health Score',
    description: 'Visual indicator of overall repository health. Hover to see the breakdown: Testing (25%), Best Practices (25%), Documentation (20%), Community (10%), and Activity (10%).',
    target: 'tbody tr:first-child td:nth-child(3)',
    position: 'left',
  },
  {
    id: 'docs-column',
    title: 'Documentation Status',
    description: 'Track core documentation files. Green = healthy, yellow = dormant, red = missing. Fix missing docs with AI assistance.',
    target: 'tbody tr:first-child td:nth-child(4)',
    position: 'left',
  },
  {
    id: 'actions',
    title: 'Quick Actions',
    description: 'Sync repository data, check build status, or hide repositories you don\'t need to track.',
    target: 'tbody tr:first-child td:nth-child(5)',
    position: 'left',
  },
  {
    id: 'features',
    title: 'Features Section',
    description: 'View parsed features from your FEATURES.md file. Track what your project offers.',
    target: '[data-tour="features-section"]',
    position: 'left',
  },
  {
    id: 'roadmap',
    title: 'Roadmap Section',
    description: 'Monitor project roadmap items parsed from ROADMAP.md. Track progress and upcoming work.',
    target: '[data-tour="roadmap-section"]',
    position: 'left',
  },
  {
    id: 'tasks',
    title: 'Tasks Section',
    description: 'View and manage tasks from TASKS.md. Track high-priority items and subsections.',
    target: '[data-tour="tasks-section"]',
    position: 'left',
  },
  {
    id: 'documentation',
    title: 'Documentation',
    description: 'Track core documentation files: README, ROADMAP, TASKS, METRICS, and FEATURES. Fix missing docs with AI.',
    target: '[data-tour="documentation"]',
    position: 'left',
  },
  {
    id: 'best-practices',
    title: 'Best Practices',
    description: 'Monitor development practices: CI/CD, testing, linting, Dependabot, Docker, and deployment badges.',
    target: '[data-tour="best-practices"]',
    position: 'left',
  },
  {
    id: 'testing',
    title: 'Testing',
    description: 'View test coverage, test counts, and testing infrastructure. Track your project\'s test quality.',
    target: '[data-tour="testing"]',
    position: 'left',
  },
  {
    id: 'community',
    title: 'Community Standards',
    description: 'Monitor community health files: CODE_OF_CONDUCT, CONTRIBUTING, SECURITY, LICENSE, and templates.',
    target: '[data-tour="community"]',
    position: 'left',
  },
  {
    id: 'metrics',
    title: 'Custom Metrics',
    description: 'Track custom repository metrics from METRICS.md. Self-reported data for project-specific measurements.',
    target: '[data-tour="metrics"]',
    position: 'left',
  },
  {
    id: 'issues',
    title: 'Security Issues',
    description: 'Monitor vulnerability alerts from Dependabot. Shows critical and high severity issues.',
    target: '[data-tour="issues"]',
    position: 'left',
  },
  {
    id: 'add-repo',
    title: 'Add Repository',
    description: 'Manually add repositories to track. Enter owner/repo format and select the repository type.',
    target: '[data-tour="add-repo"]',
    position: 'bottom',
  },
  {
    id: 'filters',
    title: 'Filter & Search',
    description: 'Filter repositories by type, language, or fork status. Use search to quickly find specific projects.',
    target: '[data-tour="filters"]',
    position: 'bottom',
  },
  {
    id: 'sync-all',
    title: 'Sync All Repositories',
    description: 'Refresh data for all repositories at once. Authentication required for this action.',
    target: '[data-tour="sync-all"]',
    position: 'bottom',
  },
  {
    id: 'auth-status',
    title: 'Authentication Status',
    description: 'Shows your GitHub authentication status. Green checkmark means you\'re authenticated and can access private repos.',
    target: '[data-tour="auth-status"]',
    position: 'bottom',
  },
  {
    id: 'gemini-status',
    title: 'AI Status',
    description: 'Indicates Gemini AI availability. Green means AI-powered features like summaries and auto-fixes are working.',
    target: '[data-tour="gemini-status"]',
    position: 'bottom',
  },
  {
    id: 'version-info',
    title: 'Version Info',
    description: 'Current Overseer version. Useful for debugging and checking for updates.',
    target: '[data-tour="version-info"]',
    position: 'bottom',
  },
  {
    id: 'profile-close',
    title: 'Tour Complete!',
    description: 'Click the profile picture to collapse the status pills and finish the tour. You can always click it again to view your authentication status, AI availability, and version info.',
    target: 'button[title="Toggle status indicators"]',
    position: 'bottom',
  },
];

interface GuidedTourProps {
  onClose: () => void;
}

export default function GuidedTour({ onClose }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const step = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;

  const startAutoAdvance = useCallback(() => {
    // Auto-advance after a 3-second countdown (displayed in 1-second intervals), except for first and last steps
    if (!isFirstStep && !isLastStep) {
      setIsAutoAdvancing(true);
      setCountdown(3);
      
      // Countdown timer
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Auto-advance timer
      autoAdvanceTimerRef.current = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAutoAdvancing(false);
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      }, 3000);
    }
  }, [isFirstStep, isLastStep]);

  const updateHighlight = useCallback(() => {
    const element = document.querySelector(step.target);
    if (!element) {
      // If element not found, position at center for welcome message
      if (step.id === 'welcome') {
        setTooltipPosition({
          top: Math.max(100, window.innerHeight / 3 - 100),
          left: window.innerWidth / 2 - 200,
        });
      }
      return;
    }

    const rect = element.getBoundingClientRect();
    setHighlightRect(rect);

    // Calculate tooltip position based on step position preference
    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'top':
        top = rect.top - 220;
        left = rect.left + rect.width / 2 - 200;
        break;
      case 'bottom':
        top = rect.bottom + 20;
        left = rect.left + rect.width / 2 - 200;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - 100;
        left = rect.left - 420;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - 100;
        left = rect.right + 20;
        break;
    }

    // Ensure tooltip stays within viewport
    const tooltipWidth = 400;
    const tooltipHeight = 220;
    top = Math.max(10, Math.min(top, window.innerHeight - tooltipHeight - 10));
    left = Math.max(10, Math.min(left, window.innerWidth - tooltipWidth - 10));

    setTooltipPosition({ top, left });
  }, [step.target, step.id, step.position]);

  useEffect(() => {
    // Clear any existing timers
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Handle row expansion/collapse and section navigation
    const firstRow = document.querySelector('tbody tr:first-child') as HTMLElement;
    const secondRow = document.querySelector('tbody tr:nth-child(2)') as HTMLElement;
    
    if (step.id === 'repo-name' || step.id === 'health-score' || step.id === 'docs-column' || step.id === 'actions') {
      // Ensure first row is expanded for initial steps
      if (firstRow && !document.querySelector('.grid')) {
        firstRow.click();
        setTimeout(() => {
          updateHighlight();
          startAutoAdvance();
        }, 400);
        return;
      }
    }
    
    if (step.id === 'features') {
      // First step in row 1 - ensure row is expanded
      const featuresSection = document.querySelector('[data-tour="features-section"]');
      if (featuresSection) {
        // Check if expanded by looking for the content div with isMainExpanded
        const isExpanded = featuresSection.querySelector('.grid.grid-cols-3');
        if (!isExpanded) {
          // Need to expand - click the section header
          const clickableHeader = featuresSection.querySelector('div[class*="cursor-pointer"]') as HTMLElement;
          if (clickableHeader) {
            clickableHeader.click();
            setTimeout(() => {
              updateHighlight();
              startAutoAdvance();
            }, 400);
            return;
          }
        }
      }
      // We intentionally call updateHighlight() here after checking for expansion,
      // because the highlight must occur only after the DOM has updated to show the expanded section.
      // Calling it outside this block would risk highlighting the wrong element.
      // The eslint-disable is necessary to avoid false positives from the linter.
      updateHighlight(); // eslint-disable-line react-hooks/set-state-in-effect
      startAutoAdvance();  
      return;
    }
    
    if (step.id === 'roadmap' || step.id === 'tasks') {
      // Stay on row 1, just highlight different sections
      updateHighlight();  
      startAutoAdvance();  
      return;
    }
    
    if (step.id === 'documentation') {
      // Transition from row 1 to row 2
      // Step 1: Collapse row 1 (Features/Roadmap/Tasks)
      const featuresSection = document.querySelector('[data-tour="features-section"]');
      const isFeaturesExpanded = featuresSection?.querySelector('.grid.grid-cols-3');
      
      if (isFeaturesExpanded && featuresSection) {
        const clickableHeader = featuresSection.querySelector('div[class*="cursor-pointer"]') as HTMLElement;
        if (clickableHeader) {
          clickableHeader.click();
          // Wait for collapse animation
          setTimeout(() => {
            // Step 2: Expand row 2 (Documentation/Best Practices/Testing)
            const documentationSection = document.querySelector('[data-tour="documentation"]');
            if (documentationSection) {
              // Check for the content area (p-4 div that appears when expanded)
              const isDocExpanded = documentationSection.querySelector('.space-y-3');
              if (!isDocExpanded) {
                const docClickableHeader = documentationSection.querySelector('div[class*="cursor-pointer"]') as HTMLElement | null;
                if (docClickableHeader) {
                  docClickableHeader.click();
                  setTimeout(() => {
                    // Give DOM time to update before highlighting
                    setTimeout(() => {
                      updateHighlight();
                      startAutoAdvance();
                    }, 100);
                  }, 400);
                  return;
                }
              }
            }
            setTimeout(() => {
              updateHighlight();
              startAutoAdvance();
            }, 100);
          }, 400);
          return;
        }
      }
      
      // If row 1 already collapsed, just expand row 2
      const documentationSection = document.querySelector('[data-tour="documentation"]');
      if (documentationSection) {
        const isDocExpanded = documentationSection.querySelector('.space-y-3');
        if (!isDocExpanded) {
          const clickableHeader = documentationSection.querySelector('div[class*="cursor-pointer"]') as HTMLElement | null;
          if (clickableHeader) {
            clickableHeader.click();
            setTimeout(() => {
              setTimeout(() => {
                updateHighlight();
                startAutoAdvance();
              }, 100);
            }, 400);
            return;
          }
        }
      }
      
      setTimeout(() => {
        updateHighlight();
        startAutoAdvance();
      }, 100);
      return;
    }
    
    if (step.id === 'best-practices' || step.id === 'testing') {
      // Stay on row 2, just highlight different sections
      // Add small delay to ensure DOM is ready
      setTimeout(() => {
        updateHighlight();  
        startAutoAdvance();
      }, 100);
      return;
    }
    
    if (step.id === 'community') {
      // Transition from row 2 to row 3
      // Step 1: Collapse row 2 (Documentation/Best Practices/Testing)
      const documentationSection = document.querySelector('[data-tour="documentation"]');
      const isDocExpanded = documentationSection?.querySelector('.space-y-3');
      
      if (isDocExpanded && documentationSection) {
        const clickableHeader = documentationSection.querySelector('div[class*="cursor-pointer"]') as HTMLElement | null;
        if (clickableHeader) {
          clickableHeader.click();
          // Wait for collapse animation
          setTimeout(() => {
            // Step 2: Expand row 3 (Community/Metrics/Issues)
            const communitySection = document.querySelector('[data-tour="community"]');
            if (communitySection) {
              // Check for the content area
              const isCommunityExpanded = communitySection.querySelector('.space-y-2');
              if (!isCommunityExpanded) {
                const communityClickableHeader = communitySection.querySelector('div[class*="cursor-pointer"]') as HTMLElement;
                if (communityClickableHeader) {
                  communityClickableHeader.click();
                  setTimeout(() => {
                    // Give DOM time to update before highlighting
                    setTimeout(() => {
                      updateHighlight();
                      startAutoAdvance();
                    }, 100);
                  }, 400);
                  return;
                }
              }
            }
            setTimeout(() => {
              updateHighlight();
              startAutoAdvance();
            }, 100);
          }, 400);
          return;
        }
      }
      
      // If row 2 already collapsed, just expand row 3
      const communitySection = document.querySelector('[data-tour="community"]');
      if (communitySection) {
        const isCommunityExpanded = communitySection.querySelector('.space-y-2');
        if (!isCommunityExpanded) {
          const clickableHeader = communitySection.querySelector('div[class*="cursor-pointer"]') as HTMLElement;
          if (clickableHeader) {
            clickableHeader.click();
            setTimeout(() => {
              setTimeout(() => {
                updateHighlight();
                startAutoAdvance();
              }, 100);
            }, 400);
            return;
          }
        }
      }
      
      setTimeout(() => {
        updateHighlight();
        startAutoAdvance();
      }, 100);
      return;
    }
    
    if (step.id === 'metrics') {
      // Check if metrics section exists (conditional rendering)
      const metricsSection = document.querySelector('[data-tour="metrics"]');
      if (!metricsSection) {
        // Skip to next step if metrics don't exist
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
        }, 100);
        return;
      }
      
      // Stay on row 3, just highlight metrics section
      setTimeout(() => {
        updateHighlight();  
        startAutoAdvance();
      }, 100);
      return;
    }
    
    if (step.id === 'issues') {
      // Check if issues section exists (conditional rendering)
      const issuesSection = document.querySelector('[data-tour="issues"]');
      if (!issuesSection) {
        // Skip to next step if issues don't exist
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
        }, 100);
        return;
      }
      
      // Stay on row 3, just highlight issues section
      setTimeout(() => {
        updateHighlight();  
        startAutoAdvance();
      }, 100);
      return;
    }
    
    if (step.id === 'add-repo' || step.id === 'filters' || step.id === 'sync-all') {
      // Collapse row 3 before moving to controls
      const communitySection = document.querySelector('[data-tour="community"]');
      const isCommunityExpanded = communitySection?.querySelector('.space-y-2');
      
      if (isCommunityExpanded && step.id === 'add-repo' && communitySection) {
        const clickableHeader = communitySection.querySelector('div[class*="cursor-pointer"]') as HTMLElement | null;
        if (clickableHeader) {
          clickableHeader.click();
          setTimeout(() => {
            updateHighlight();
            startAutoAdvance();
          }, 400);
          return;
        }
      }
      
      updateHighlight();  
      startAutoAdvance();
      return;
    }
    
    // Show profile pills when reaching status indicator steps
    if (step.id === 'auth-status' || step.id === 'gemini-status' || step.id === 'version-info') {
      const profilePicture = document.querySelector('button[title="Toggle status indicators"]');
      if (profilePicture && !document.querySelector('[data-tour="auth-status"]')?.getBoundingClientRect().width) {
        (profilePicture as HTMLElement).click();
        setTimeout(() => {
          updateHighlight();
          startAutoAdvance();
        }, 500);
        return;
      }
    }
    
    // Final step - highlight profile picture for collapse action
    if (step.id === 'profile-close') {
      updateHighlight();  
      // Don't auto-advance on final step
      return;
    }
    
    // Tour component intentionally updates highlight on step changes
    updateHighlight();  
    startAutoAdvance();  
    
    window.addEventListener('resize', updateHighlight);
    return () => {
      window.removeEventListener('resize', updateHighlight);
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [currentStep, step.id, updateHighlight, startAutoAdvance]);

  const handleNext = () => {
    // Clear timers when manually navigating
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setIsAutoAdvancing(false);
    
    if (isLastStep) {
      // Close profile pills on final step
      const profilePicture = document.querySelector('button[title="Toggle status indicators"]');
      const statusPillsVisible = document.querySelector('[data-tour="auth-status"]')?.getBoundingClientRect().width;
      if (profilePicture && statusPillsVisible) {
        (profilePicture as HTMLElement).click();
      }
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    // Clear timers when manually navigating
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setIsAutoAdvancing(false);
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay with spotlight effect */}
      <div className="absolute inset-0">
        {/* Semi-transparent dark overlay */}
        <div 
          className="absolute inset-0 bg-black/75" 
          onClick={handleSkip}
          style={{
            // Cut out a hole for the highlighted element
            ...(highlightRect && step.id !== 'welcome' ? {
              clipPath: `polygon(
                0% 0%, 
                0% 100%, 
                ${highlightRect.left - 8}px 100%, 
                ${highlightRect.left - 8}px ${highlightRect.top - 8}px, 
                ${highlightRect.right + 8}px ${highlightRect.top - 8}px, 
                ${highlightRect.right + 8}px ${highlightRect.bottom + 8}px, 
                ${highlightRect.left - 8}px ${highlightRect.bottom + 8}px, 
                ${highlightRect.left - 8}px 100%, 
                100% 100%, 
                100% 0%
              )`
            } : {})
          }}
        />
        
        {/* Highlighted element border and glow */}
        {highlightRect && step.id !== 'welcome' && (
          <div
            className="absolute border-4 border-blue-500 rounded-lg pointer-events-none shadow-[0_0_30px_rgba(59,130,246,1),0_0_60px_rgba(59,130,246,0.5)]"
            style={{
              top: highlightRect.top - 8,
              left: highlightRect.left - 8,
              width: highlightRect.width + 16,
              height: highlightRect.height + 16,
            }}
          />
        )}
      </div>

      {/* Tooltip with better visibility */}
      <div
        ref={tooltipRef}
        className="absolute bg-slate-900 border-2 border-blue-400 rounded-lg shadow-[0_0_40px_rgba(59,130,246,0.4)] p-6 w-[400px] z-[10000]"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Close tour"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span className="font-semibold">Step {currentStep + 1} of {tourSteps.length}</span>
            <button
              onClick={handleSkip}
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Skip tour
            </button>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>
          {isAutoAdvancing && (
            <p className="text-xs text-slate-400 mt-2 italic">Auto-advancing in {countdown} second{countdown !== 1 ? 's' : ''}...</p>
          )}
        </div>

        {/* Content */}
        <h3 className="text-xl font-semibold text-slate-100 mb-3">
          {step.title}
        </h3>
        <p className="text-slate-300 mb-6 leading-relaxed">
          {step.description}
        </p>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isFirstStep
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700'
            }`}
          >
            Previous
          </button>
          <div className="flex gap-2">
            {!isLastStep && isAutoAdvancing && (
              <button
                onClick={() => {
                  if (autoAdvanceTimerRef.current) {
                    clearTimeout(autoAdvanceTimerRef.current);
                    autoAdvanceTimerRef.current = null;
                  }
                  if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                    countdownIntervalRef.current = null;
                  }
                  setIsAutoAdvancing(false);
                }}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors text-sm"
              >
                Pause
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              {isLastStep ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
