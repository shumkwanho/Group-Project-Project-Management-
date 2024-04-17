import { Request, Response, Router } from "express";
import { pgClient } from '../utils/pgClient';

export const testLoginRouter = Router();

testLoginRouter.post('/', usernameLogin);
testLoginRouter.get('/', loginOk);

async function usernameLogin(req: Request, res: Response) {

    const { username, password } = req.body;
    console.log(req.body);

    try {
        let userQuery = (
            await pgClient.query(
                "SELECT id, username, email, password FROM users WHERE username = $1 AND password = $2",
                [username, password]
            )).rows[0];

        console.log(userQuery);


        if (userQuery) {

            req.session.userId = userQuery.id;
            req.session.username = userQuery.username;
            req.session.save();

            res.json({
                message: "login successful",
                username: userQuery.username
            });
        } else {
            res.status(500).json({ message: "login fail" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal sever error" });
    }
};

function loginOk(req: Request, res: Response) {
    try {
        if (req.session.username) {
            res.json({
                username: req.session.username
            });
        } else {
            res.status(500).json({ message: "login fail" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal sever error" });

    }
}