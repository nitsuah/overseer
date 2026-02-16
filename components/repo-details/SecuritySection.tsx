"use client";

import { Shield, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export interface SecurityConfig {
  hasSecurityPolicy: boolean;
  hasSecurityAdvisories: boolean;
  privateVulnerabilityReportingEnabled: boolean;
  dependabotAlertsEnabled: boolean;
  dependabotAlertCount?: number;
  codeScanningEnabled: boolean;
  codeScanningAlertCount?: number;
  secretScanningEnabled: boolean;
  secretScanningAlertCount?: number;
}

interface SecuritySectionProps {
  securityConfig?: SecurityConfig;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

export function SecuritySection({ 
  securityConfig, 
  isExpanded: isExpandedProp, 
  onToggleExpanded 
}: SecuritySectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = isExpandedProp !== undefined ? isExpandedProp : internalExpanded;
  const setIsExpanded = onToggleExpanded || (() => setInternalExpanded(!internalExpanded));
  
  if (!securityConfig) return null;

  const getStatusIcon = (enabled: boolean) => {
    return enabled
      ? <CheckCircle2 className="h-3 w-3 text-green-400" />
      : <XCircle className="h-3 w-3 text-slate-500" />;
  };

  const getAlertIcon = (count?: number) => {
    if (count === undefined || count === 0) {
      return <CheckCircle2 className="h-3 w-3 text-green-400" />;
    }
    if (count > 0 && count <= 5) {
      return <AlertTriangle className="h-3 w-3 text-yellow-400" />;
    }
    return <AlertTriangle className="h-3 w-3 text-red-400" />;
  };

  const hasAnyAlerts = 
    (securityConfig.dependabotAlertCount && securityConfig.dependabotAlertCount > 0) ||
    (securityConfig.codeScanningAlertCount && securityConfig.codeScanningAlertCount > 0) ||
    (securityConfig.secretScanningAlertCount && securityConfig.secretScanningAlertCount > 0);

  const allFeaturesEnabled = 
    securityConfig.hasSecurityPolicy &&
    securityConfig.privateVulnerabilityReportingEnabled &&
    securityConfig.dependabotAlertsEnabled &&
    securityConfig.codeScanningEnabled &&
    securityConfig.secretScanningEnabled;

  const borderColor = hasAnyAlerts 
    ? (allFeaturesEnabled ? 'border-yellow-500/40' : 'border-purple-500/40')
    : (allFeaturesEnabled ? 'border-green-500/40' : 'border-purple-500/40');
    
  const bgGradient = hasAnyAlerts
    ? 'from-yellow-900/30 via-slate-800/50 to-yellow-800/20'
    : (allFeaturesEnabled 
      ? 'from-green-900/30 via-slate-800/50 to-green-800/20'
      : 'from-purple-900/30 via-slate-800/50 to-purple-800/20');

  return (
    <div 
      className={`bg-gradient-to-br ${bgGradient} rounded-lg overflow-hidden border ${borderColor} shadow-lg shadow-purple-500/10 hover:border-purple-400/50 transition-colors`}
      data-tour="security"
    >
      <div
        onClick={setIsExpanded}
        className="w-full px-4 py-3 hover:bg-purple-900/20 transition-colors border-b border-purple-500/20 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Shield className="h-4 w-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-slate-200">Security</h4>
            <span className="text-slate-500 text-xs ml-2">{isExpanded ? '▼' : '▶'}</span>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 py-3">
          <div className="space-y-2">
            {/* Security Policy */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                {getStatusIcon(securityConfig.hasSecurityPolicy)}
                <span>Security Policy</span>
              </span>
              <span className={securityConfig.hasSecurityPolicy ? "text-green-400" : "text-slate-500"}>
                {securityConfig.hasSecurityPolicy ? 'Present' : 'Missing'}
              </span>
            </div>

            {/* Security Advisories */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                {getStatusIcon(securityConfig.hasSecurityAdvisories)}
                <span>Security Advisories</span>
              </span>
              <span className={securityConfig.hasSecurityAdvisories ? "text-green-400" : "text-slate-500"}>
                {securityConfig.hasSecurityAdvisories ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {/* Private Vulnerability Reporting */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                {getStatusIcon(securityConfig.privateVulnerabilityReportingEnabled)}
                <span>Private Reporting</span>
              </span>
              <span className={securityConfig.privateVulnerabilityReportingEnabled ? "text-green-400" : "text-slate-500"}>
                {securityConfig.privateVulnerabilityReportingEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {/* Dependabot Alerts */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                {securityConfig.dependabotAlertsEnabled 
                  ? getAlertIcon(securityConfig.dependabotAlertCount)
                  : getStatusIcon(false)
                }
                <span>Dependabot Alerts</span>
              </span>
              <span className={
                securityConfig.dependabotAlertsEnabled 
                  ? (securityConfig.dependabotAlertCount && securityConfig.dependabotAlertCount > 0 ? "text-yellow-400" : "text-green-400")
                  : "text-slate-500"
              }>
                {securityConfig.dependabotAlertsEnabled 
                  ? `${securityConfig.dependabotAlertCount || 0} alerts`
                  : 'Disabled'
                }
              </span>
            </div>

            {/* Code Scanning */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                {securityConfig.codeScanningEnabled 
                  ? getAlertIcon(securityConfig.codeScanningAlertCount)
                  : getStatusIcon(false)
                }
                <span>Code Scanning</span>
              </span>
              <span className={
                securityConfig.codeScanningEnabled 
                  ? (securityConfig.codeScanningAlertCount && securityConfig.codeScanningAlertCount > 0 ? "text-yellow-400" : "text-green-400")
                  : "text-slate-500"
              }>
                {securityConfig.codeScanningEnabled 
                  ? `${securityConfig.codeScanningAlertCount || 0} alerts`
                  : 'Disabled'
                }
              </span>
            </div>

            {/* Secret Scanning */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                {securityConfig.secretScanningEnabled 
                  ? getAlertIcon(securityConfig.secretScanningAlertCount)
                  : getStatusIcon(false)
                }
                <span>Secret Scanning</span>
              </span>
              <span className={
                securityConfig.secretScanningEnabled 
                  ? (securityConfig.secretScanningAlertCount && securityConfig.secretScanningAlertCount > 0 ? "text-yellow-400" : "text-green-400")
                  : "text-slate-500"
              }>
                {securityConfig.secretScanningEnabled 
                  ? `${securityConfig.secretScanningAlertCount || 0} alerts`
                  : 'Disabled'
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
