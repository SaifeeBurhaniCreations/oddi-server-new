import { app } from "../app.js";
import { USER_BASE_URL } from "../constants/baseUrl.js";
import { loginUser } from "../controllers/userController.js";
import { validateRequest } from "../sbc/utils/request-validator/request-validator.js";
import { loginUserSchema } from "../schemas/loginUserSchema.js";

app.post(`${USER_BASE_URL}/login`, validateRequest({
    body: loginUserSchema,
}), loginUser)