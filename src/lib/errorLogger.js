import { base44 } from '@/api/base44Client';

/**
 * Log an error to the error log database
 * @param {Object} params - Error details
 * @param {string} params.type - 'error', 'payment_issue', 'security', 'bug'
 * @param {string} params.severity - 'low', 'medium', 'high', 'critical'
 * @param {string} params.title - Error title
 * @param {string} params.message - Error message
 * @param {string} [params.stackTrace] - Stack trace
 * @param {string} [params.orderId] - Related order ID
 * @param {string} [params.userEmail] - Affected user email
 * @param {Object} [params.context] - Additional context
 */
export async function logError({
  type = 'error',
  severity = 'medium',
  title,
  message,
  stackTrace = '',
  orderId = null,
  userEmail = null,
  context = {},
}) {
  try {
    await base44.entities.ErrorLog.create({
      type,
      severity,
      title,
      message,
      stack_trace: stackTrace,
      order_id: orderId,
      user_email: userEmail,
      context,
      status: 'new',
    });
  } catch (err) {
    // Fallback: log to console if error logging fails
    console.error('Failed to log error:', err);
    console.error('Original error:', { type, severity, title, message });
  }
}

/**
 * Log a payment error
 */
export async function logPaymentError(message, orderId, details = {}) {
  return logError({
    type: 'payment_issue',
    severity: 'high',
    title: 'Payment Processing Error',
    message,
    orderId,
    context: details,
  });
}

/**
 * Log a security issue
 */
export async function logSecurityIssue(title, message, details = {}) {
  return logError({
    type: 'security',
    severity: 'critical',
    title,
    message,
    context: details,
  });
}

/**
 * Log a bug report
 */
export async function logBug(title, message, stackTrace = '') {
  return logError({
    type: 'bug',
    severity: 'medium',
    title,
    message,
    stackTrace,
  });
}