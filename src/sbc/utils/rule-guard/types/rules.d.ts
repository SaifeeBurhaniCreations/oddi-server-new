export type ConditionType = "equals" | "notEquals" | "exists" | "custom";
export type ActionRule<T, C = unknown> = {
    property: keyof T;
    condition: ConditionType;
    value?: any;
    customFn?: (val: any, obj: T, ctx?: C) => boolean | Promise<boolean>;
    action: (obj: T, ctx: C) => any;
};
//# sourceMappingURL=rules.d.ts.map