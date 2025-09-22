import type { Context } from "hono";
import type { ActionRule } from "../../sbc/utils/rule-guard/types/rules.js";
import type { LoginConditions } from "../../types/bodyTypes.js";
import { verifyPassword } from "../../utils/hashing.js";

export const rules: ActionRule<LoginConditions, Context>[] = [
    {
        property: "email",
        condition: "exists",
        action: (obj, c) => c.json({ error: "Email not found" }, 404)
    },
    {
        property: "password",
        condition: "custom",
        customFn: async (val, obj) => {
            return obj.password ? await verifyPassword(val, obj.password) : false;
        },
        action: (obj, c) => c.json({ error: "Invalid password" }, 401)
    }
];