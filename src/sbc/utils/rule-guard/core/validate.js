export async function ruleActionEngine(obj, rules, ctx) {
    for (const rule of rules) {
        const val = obj[rule.property];
        let match = false;
        if (rule.condition === "equals")
            match = val === rule.value;
        else if (rule.condition === "notEquals")
            match = val !== rule.value;
        else if (rule.condition === "exists")
            match = val === undefined || val === null;
        else if (rule.condition === "custom" && rule.customFn)
            match = !(await rule.customFn(val, obj, ctx));
        if (match)
            return rule.action(obj, ctx);
    }
    return null;
}
