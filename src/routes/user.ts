import type { Hono } from "hono";
import { USER_BASE_URL } from "../constants/baseUrl.js";
import { loginUser } from "../controllers/userController.js";
import { validateRequest } from "../sbc/utils/request-validator/request-validator.js";
import { loginUserSchema } from "../schemas/loginUserSchema.js";

export function registerUserRoutes(app: Hono) {
    app.post(`${USER_BASE_URL}/login`, validateRequest({
        body: loginUserSchema,
    }), loginUser)
}
