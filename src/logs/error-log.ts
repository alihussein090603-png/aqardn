/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SystemErrorLog {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  type: 'firebase_connection' | 'unhandled_crash' | 'application_error';
}

const STORAGE_KEY = 'aqarat_developer_error_logs';
const MAX_LOGS = 100; // Limit logs size to prevent quota exhaustion

/**
 * Save an error log entry to localStorage and double-output to developer console for inspection.
 */
export const logSystemError = (
  error: Error,
  componentStack?: string,
  customType?: SystemErrorLog['type']
): SystemErrorLog => {
  const errorMessage = error?.message || String(error);
  
  let type: SystemErrorLog['type'] = customType || 'application_error';
  if (
    errorMessage.includes('WebChannelConnection') || 
    errorMessage.includes('stream') || 
    errorMessage.toLowerCase().includes('webchannel') ||
    errorMessage.toLowerCase().includes('offline') ||
    errorMessage.toLowerCase().includes('network')
  ) {
    type = 'firebase_connection';
  } else if (componentStack) {
    type = 'unhandled_crash';
  }

  const logEntry: SystemErrorLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    message: errorMessage,
    stack: error?.stack,
    componentStack,
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    type,
  };

  try {
    const existingLogs = getDeveloperErrorLogs();
    const updatedLogs = [logEntry, ...existingLogs].slice(0, MAX_LOGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
  } catch (e) {
    console.warn('Failed to save developer error to localStorage:', e);
  }

  // Developer logging directly to console with customized styles
  console.group('%c[سجل الأخطاء الفني - Aqarat Error Logger]', 'color: #ef4444; font-weight: bold; font-size: 13px;');
  console.log('نوع الخطأ:', type);
  console.log('الرسالة:', errorMessage);
  console.log('الوقت:', logEntry.timestamp);
  if (error?.stack) console.log('تعقب المطور (Stack):', error.stack);
  if (componentStack) console.log('تعقب المكونات (Component Stack):', componentStack);
  console.groupEnd();

  return logEntry;
};

/**
 * Retrieves all stored error logs.
 */
export const getDeveloperErrorLogs = (): SystemErrorLog[] => {
  try {
    const logsStr = localStorage.getItem(STORAGE_KEY);
    return logsStr ? JSON.parse(logsStr) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Clear the error logs.
 */
export const clearDeveloperErrorLogs = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // Ignore
  }
};

// Bind to window object for convenient access from browser devTools console
if (typeof window !== 'undefined') {
  (window as any).__getDeveloperErrorLogs = getDeveloperErrorLogs;
  (window as any).__clearDeveloperErrorLogs = clearDeveloperErrorLogs;
}
