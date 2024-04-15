import { Request, Response, Router } from "express";
import { hashPassword } from "../hash";
import { pgClient } from "../pgClient";

export const authRouter = Router();

authRouter.post("/registration", userRegistration);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/user", getUsername);

async function userRegistration(req: Request, res: Response) {
    try {
        //not allow profile image upload on initial registration
        //need to handle if username or email exist

        const { username, email, password } = req.body;
        let hashedPassword = await hashPassword(password);

        let userQueryResult = await pgClient.query(
            "INSERT INTO users (username, email, password, last_login, registration_date) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_DATE) RETURNING username, email, registration_date;",
            [username, email, hashedPassword]
        );

        console.log(userQueryResult.rows[0]);

        res.json({
            message: "user registration successful",
            data: { email: userQueryResult.rows[0].email,
                    username: userQueryResult.rows[0].username,
                    created_at: userQueryResult.rows[0].registration_date
            }
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal sever error" });
    }
};

async function login(req: Request, res: Response) {
    try {
        //
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal sever error" });
    }
};

async function logout(req: Request, res: Response) {
    try {
        //
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal sever error" });
    }
};

async function getUsername(req: Request, res: Response) {
    try {
       //
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal sever error" });
    }
};