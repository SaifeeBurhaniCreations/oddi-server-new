import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}
export class ConfigManager {
    schema;
    config = {
        DB_HOST: '',
        DB_PORT: 5432,
        NODE_ENV: ''
    };
    features = {};
    constructor(schema) {
        this.schema = schema;
        this.load();
    }
    load() {
        for (const [key, spec] of Object.entries(this.schema)) {
            const envKey = key.toUpperCase().replace(/[.-]/g, '_');
            let value = process.env[envKey] ?? spec.default;
            if (spec.required && value === undefined) {
                throw new Error(`Required config missing: ${key}`);
            }
            if (value !== undefined) {
                switch (spec.type) {
                    case 'number':
                        value = Number(value);
                        if (isNaN(value))
                            throw new Error(`Invalid number for ${key}: ${value}`);
                        break;
                    case 'boolean':
                        value = ['true', '1', 'yes'].includes(String(value).toLowerCase());
                        break;
                }
                if (spec.validator && !spec.validator(value)) {
                    throw new Error(`Invalid value for ${key}: ${value}`);
                }
            }
            this.config[key] = value;
        }
    }
    get(key) {
        return this.config[key];
    }
    isFeatureEnabled(feature) {
        const envKey = `FEATURE_${feature.toUpperCase()}`;
        return process.env[envKey] === 'true' || this.features[feature] === true;
    }
    setFeature(feature, enabled) {
        this.features[feature] = enabled;
    }
    auditConfig(docSensitive = false) {
        return Object.fromEntries(Object.entries(this.config).map(([k, v]) => {
            const spec = this.schema[k];
            const isSensitive = spec?.sensitive || false;
            return [k, isSensitive && !docSensitive ? '***' : v];
        }));
    }
    middleware() {
        return async (c, next) => {
            c.set('config', this);
            await next();
        };
    }
}
