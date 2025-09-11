import { MiddlewareHandler } from 'hono';
export type ConfigType = {
    DB_HOST: string;
    DB_PORT: number;
    NODE_ENV: string;
};
export interface ConfigSchema {
    [key: string]: {
        type: 'string' | 'number' | 'boolean';
        default?: any;
        required?: boolean;
        validator?: (value: any) => boolean;
        description?: string;
        subsystem?: string;
        sensitive?: boolean;
    };
}
export declare class ConfigManager {
    private schema;
    private config;
    private features;
    constructor(schema: ConfigSchema);
    private load;
    get<K extends keyof ConfigType>(key: K): ConfigType[K];
    isFeatureEnabled(feature: string): boolean;
    setFeature(feature: string, enabled: boolean): void;
    auditConfig(docSensitive?: boolean): {
        [k: string]: any;
    };
    middleware(): MiddlewareHandler;
}
//# sourceMappingURL=config-manager.d.ts.map