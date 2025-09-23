import type { Context } from "hono";
import type { ActionRule } from "../../sbc/utils/rule-guard/types/rules.js";
import { verifyPassword } from "../../utils/hashing.js";
import type { LoginTypes } from "../../schemas/loginUserSchema.js";

export const rules: ActionRule<LoginTypes, Context>[] = [
    {
        property: "email",
        condition: "exists",
        action: (obj, c) => c.json({ error: "Email not found" }, 404)
    },
    {
        property: "inputPassword",
        condition: "custom",
        customFn: async (val, obj) => {
            return await verifyPassword(val, obj.password);
        },
        action: (obj, c) => c.json({ error: "Invalid password" }, 401)
    }

];