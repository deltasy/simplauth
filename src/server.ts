import express from "express"
import { PORT } from "./config/env.js";
import { userRouter } from "./modules/users/user.routes.js";
import { errorHandler } from "./shared/middleware/error.middleware.js";
import { assertEnvironment } from "./shared/validate/environment.validate.js";

const app = express();

assertEnvironment();

app.use(express.json());
app.use('/user', userRouter);

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Iniciado na porta ${PORT}!`)
})