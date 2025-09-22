// Library imports
import type { Context } from "hono";

// Types and interfaces
import type { LoginUserBody } from "../schemas/loginUserSchema.js";
import type { LoginTypes } from "../types/bodyTypes.js";

// Internal modules (db, rule engine, config)
import { userDB } from "../db/aliases.js";
import { ruleActionEngine } from "../sbc/utils/rule-guard/core/validate.js";
import { rules } from "../config/body-config/loginRules.js";

export const loginUser = async (c: Context) => {
    const { body } = c.get("validated") as { body: LoginUserBody };

    const user = await userDB.findUnique({
        where: { email: body.email },
    });

    const loginConditions: LoginTypes = {
        email: user?.email,
        password: user?.password,
    };

    const ruleResult = await ruleActionEngine(loginConditions, rules, c);

    if (ruleResult) return ruleResult;
};
