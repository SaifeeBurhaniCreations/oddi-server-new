import { requestLogger } from '../sbc/utils/request-logger/request-logger.js';
import { Sentry, toSentryLevel } from '../config/sentry.js';

export const appRequestLogger = requestLogger({
    logLevel: 'info',
    sampleRate: 0.05,
    includeQuery: true,
    includeBody: false,
    maxBodyLength: 8192,
    sensitiveFields: ['password', 'token', 'code', 'secret'],
    excludePaths: ['/health', '/metrics'],
    includeHeaders: ['user-agent', 'authorization'],
    headerMasks: ['authorization'],
    slowThresholdMs: 1000,
    onLog: (logData) => {
        if (logData.level === 'error' || logData.slow) {
            Sentry.captureMessage(
                `[${logData.level}] ${logData.method} ${logData.path} ${logData.statusCode} - ${logData.duration}ms`
            );
        }
        Sentry.addBreadcrumb({
            category: 'http',
            message: `${logData.method} ${logData.path} - ${logData.statusCode}`,
            level: toSentryLevel(logData.level),
            data: {
                requestId: logData.requestId,
                userAgent: logData.userAgent,
                ip: logData.ip,
                slow: logData.slow,
                duration: logData.duration,
            }
        });
    }
});
