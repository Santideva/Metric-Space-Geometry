import * as THREE from 'three';

class Logger {
    constructor(config = {}) {
        // Explicitly log constructor details
        console.log('Logger Constructor Called', {
            providedConfig: config
        });

        // Configuration options
        this.logLevel = config.logLevel || 'info';
        this.outputMethod = config.outputMethod || 'console';
        
        // Log level hierarchy
        this.logLevels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
            trace: 4
        };

        // Validate initial log level
        if (!this.logLevels.hasOwnProperty(this.logLevel)) {
            console.warn(`Invalid log level: ${this.logLevel}. Defaulting to 'info'.`);
            this.logLevel = 'info';
        }

        // Explicitly log initialization details
        console.log('Logger initialized', {
            logLevel: this.logLevel,
            outputMethod: this.outputMethod
        });
    }

    // New method to set log level dynamically
    setLogLevel(level) {
        // Validate the provided log level
        if (this.logLevels.hasOwnProperty(level)) {
            const oldLevel = this.logLevel;
            this.logLevel = level;
            
            console.log('Log Level Updated', {
                oldLevel,
                newLevel: level,
                timestamp: new Date().toISOString()
            });
        } else {
            console.warn(`Invalid log level: ${level}. Log level remains ${this.logLevel}.`);
            console.log('Valid log levels are:', Object.keys(this.logLevels));
        }
    }

    // Comprehensive logging methods with extensive diagnostics
    _log(level, message, context = {}) {
        // Check if the current log level allows this message
        if (this.logLevels[level] <= this.logLevels[this.logLevel]) {
            // Prepare the full context
            const fullContext = this.createContext(context);

            switch(level) {
                case 'error':
                    console.error(`[ERROR] ${message}`, fullContext);
                    break;
                case 'warn':
                    console.warn(`[WARN] ${message}`, fullContext);
                    break;
                case 'info':
                    console.log(`[INFO] ${message}`, fullContext);
                    break;
                case 'debug':
                    console.debug(`[DEBUG] ${message}`, fullContext);
                    break;
                case 'trace':
                    console.trace(`[TRACE] ${message}`, fullContext);
                    break;
            }
        }
    }

    error(message, context = {}) {
        this._log('error', message, context);
    }

    warn(message, context = {}) {
        this._log('warn', message, context);
    }

    info(message, context = {}) {
        this._log('info', message, context);
    }

    debug(message, context = {}) {
        this._log('debug', message, context);
    }

    trace(message, context = {}) {
        this._log('trace', message, context);
    }

    // Simplified context creator with extensive logging
    createContext(data) {
        const context = {
            ...data,
            timestamp: new Date().toISOString(),
            threeJsVersion: THREE.REVISION
        };

        return context;
    }
}

// Singleton export with explicit logging
const loggerInstance = new Logger({
    logLevel: 'info'
});

console.log('Logger Singleton Created', loggerInstance);

export default loggerInstance;