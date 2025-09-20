type HandlerFn = (payload: any, context?: any) => void | Promise<void>;
type HandlerMap = { [key: string]: HandlerFn };

interface EngineOptions {
    beforeEach?: (key: string, payload: any, context?: any) => void | Promise<void>;
    afterEach?: (key: string, payload: any, context?: any) => void | Promise<void>;
    onError?: (error: any, key: string, payload: any, context?: any) => void;
    async?: boolean;
    filter?: (key: string) => boolean;
    context?: any;
}

export async function engine(
    handlers: HandlerMap,
    scope: "all" | string | string[],
    payload?: any,
    options: EngineOptions = {}
) {
    let keys: string[];

    if (scope === "all") {
        keys = Object.keys(handlers);
        if (options.filter) keys = keys.filter(options.filter);
    } else if (Array.isArray(scope)) {
        keys = scope.filter(key => typeof handlers[key] === "function");
    } else {
        keys = typeof handlers[scope] === "function" ? [scope] : [];
    }

    const promises = keys.map(async key => {
        try {
            if (options.beforeEach) await options.beforeEach(key, payload, options.context);
            await handlers[key](payload, options.context);
            if (options.afterEach) await options.afterEach(key, payload, options.context);
        } catch (error) {
            if (options.onError) options.onError(error, key, payload, options.context);
            else throw error;
        }
    });

    if (options.async) {
        await Promise.all(promises);
    } else {
        for (let p of promises) {
            await p;
        }
    }
}
