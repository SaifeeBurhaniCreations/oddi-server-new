// Library imports
import type { Context } from "hono";

// Types and interfaces
import type { LoginBodyTypes } from "../schemas/loginUserSchema.js";
import type { LoginTypes } from "../types/condition-types.js";

// Internal modules (db, rule engine, config)
import { userDB } from "../db/aliases.js";
import { ruleActionEngine } from "../sbc/utils/rule-guard/core/validate.js";
import { rules } from "../config/body-config/loginRules.js";
import { issueToken } from "../utils/security.js";

export const loginUser = async (c: Context) => {
    const { body } = c.get("validated") as { body: LoginBodyTypes };

    const user = await userDB.findUnique({
        where: { email: body.email },
    });

    if (!user) return c.json({ error: "user not found" }, 404);

    const loginConditions: LoginTypes = {
        email: body.email,
        inputPassword: body.password,
        password: user.password
    };

    const ruleResult = await ruleActionEngine(loginConditions, rules, c);

    if (ruleResult) return ruleResult;

    const token = issueToken({ id: user.id, email: user.email, role: user.role }, c);

    return c.json({token: token}, 200);
};
