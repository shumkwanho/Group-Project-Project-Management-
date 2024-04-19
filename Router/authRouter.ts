import { Request, Response, Router } from "express";
import { checkPassword, hashPassword } from "../utils/hash";
import { pgClient } from "../utils/pgClient";
import formidable from "formidable";
import { isLoggedIn } from "../utils/guard";

export const authRouter = Router();

authRouter.post("/registration", userRegistration);
authRouter.post("/check-user-exist", checkUserExist);
authRouter.post("/username-login", usernameLogin);
authRouter.post("/email-login", emailLogin);
authRouter.post("/logout", isLoggedIn, logout);
authRouter.get("/user", isLoggedIn, getUserInfo);
authRouter.put("/password-update", isLoggedIn, updatePassword);
authRouter.post("/profile-image-update", isLoggedIn, updateProfileImage);

async function userRegistration(req: Request, res: Response) {
    try {
        //not allow profile image upload on initial registration

        const { username, email, password } = req.body;

        //handle if username or email already exist in DB
        let checkUniqueQuery = (await pgClient.query(
            "SELECT id FROM users WHERE username = $1 OR email = $2",
            [username, email]
        )).rows[0];

        if (checkUniqueQuery) {
            res.status(400).json({
                message: "user registration failed",
                error: "username and/or email already exist(s) in database"
            });
        } else {

            let hashedPassword = await hashPassword(password);

            let userQueryResult = await pgClient.query(
                "INSERT INTO users (username, email, password, last_login, registration_date) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_DATE) RETURNING username, email, registration_date;",
                [username, email, hashedPassword]
            );

            res.json({
                message: "user registration successful",
                data: {
                    email: userQueryResult.rows[0].email,
                    username: userQueryResult.rows[0].username,
                    created_at: userQueryResult.rows[0].registration_date
                }
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal sever error" });
    }
};

async function checkUserExist(req: Request, res: Response) {
    try {
        const { username, email } = req.body;

        let checkUniqueQuery = (await pgClient.query(
            "SELECT id FROM users WHERE username = $1 OR email = $2",
            [username, email]
        )).rows[0];

        let message = checkUniqueQuery ?
            "username and/or email already exist(s)" :
            "username and email does not exist";

        let isExist = checkUniqueQuery ? true : false

        res.json({
            message: message,
            isExist: isExist
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal sever error" });
    }
}

async function usernameLogin(req: Request, res: Response) {
    try {
        const { username, password } = req.body;

        const userQuery = (
            await pgClient.query(
                "SELECT id, username, email, password FROM users WHERE username = $1",
                [username]
            )).rows[0];

        //check if username exist in DB
        if (!userQuery) {

            console.log(`username: ${username} does not exist in users db`);
            res.status(400).json({
                message: "login failed",
                error: "invalid credentials"
            });

        } else {

            let isPasswordMatched = await checkPassword({
                plainPassword: password,
                hashedPassword: userQuery.password
            });

            //check if password matches
            if (!isPasswordMatched) {

                console.log(`password incorrect`);
                res.status(400).json({
                    message: "login failed",
                    error: "invalid credentials"
                });

            } else {

                req.session.userId = userQuery.id;
                req.session.username = userQuery.username;

                req.session.save();

                res.json({
                    message: "login successful",
                    data: { username: userQuery.username }
                });
            };
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal sever error" });
    }
};

async function emailLogin(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        const userQuery = (
            await pgClient.query(
                "SELECT id, username, email, password FROM users WHERE email = $1",
                [email]
            )).rows[0];

        //check if email exist in DB
        if (!userQuery) {

            console.log(`email: ${email} does not exist in users db`);

            res.status(400).json({
                message: "login failed",
                error: "invalid credentials"
            });

        } else {

            let isPasswordMatched = await checkPassword({
                plainPassword: password,
                hashedPassword: userQuery.password
            });

            //check if password matches
            if (!isPasswordMatched) {

                console.log(`password incorrect`);

                res.status(400).json({
                    message: "login failed",
                    error: "invalid credentials"
                });

            } else {

                req.session.userId = userQuery.id;
                req.session.username = userQuery.username;

                req.session.save();

                res.json({
                    message: "login successful",
                    data: { username: userQuery.username }
                });
            };
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal sever error" });
    }
};

async function logout(req: Request, res: Response) {
    try {
        //check if user is logged in
        if (!req.session.username) {

            res.status(400).json({
                message: "logout failed",
                error: "no active login session"
            });

        } else {

            req.session.destroy((err) => {

                if (err) {
                    res.status(500).json({
                        message: "internal sever error",
                    });
                }

                res.json({ message: "logout successful" });
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal sever error" });
    }
};

async function getUserInfo(req: Request, res: Response) {
    try {
        //check if user is logged in
        if (req.session.username) {

            let userId = req.session.userId
            let username = req.session.username

            const userQueryResult = (
                await pgClient.query(
                    "SELECT id, username, email, profile_image, last_login, registration_date FROM users WHERE id = $1;",
                    [userId]
                )).rows[0];

            res.json({
                message: "check user info successful",
                data: {
                    id: userId,
                    username: username,
                    email: userQueryResult.email,
                    profile_image: userQueryResult.profile_image,
                    last_login: userQueryResult.last_login,
                    registration_date: userQueryResult.registration_date
                }
            });

        } else {
            res.status(400).json({
                message: "check username failed",
                error: "no active login session"
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal sever error" });
    }
};

async function updatePassword(req: Request, res: Response) {
    try {
        //can only update password if an user has logged in
        if (!req.session.username) {

            res.status(400).json({
                message: "update password failed",
                error: "no active login session"
            });

        } else {

            const { password } = req.body;
            let userId = req.session.userId;

            const userQuery = (
                await pgClient.query(
                    "SELECT password FROM users WHERE id = $1;",
                    [userId]
                )).rows[0];

            //check if input password is same as current password
            let isPasswordMatched = await checkPassword({
                plainPassword: password,
                hashedPassword: userQuery.password
            });

            if (isPasswordMatched) {
                res.status(400).json({
                    message: "password update failed",
                    error: "new password same as current password"
                })
            } else {

                let hashedPassword = await hashPassword(password);

                const userQueryResult = (
                    await pgClient.query(
                        "UPDATE users SET password = $1 WHERE id = $2 RETURNING username, password;",
                        [hashedPassword, userId]
                    )).rows[0];

                res.json({
                    message: `${userQueryResult.username} password update successful`,
                    data: { username: userQueryResult.username }
                })
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal sever error" });
    }
};

async function updateProfileImage(req: Request, res: Response) {

    try {
        //upload profile picture can only be performed if an user has logged in
        //check if user is logged in
        if (!req.session.username) {

            res.status(400).json({
                message: "check username failed",
                error: "no active login session"
            });

        } else {

            let userId = req.session.userId;
            let username = req.session.username;

            //max file size = 2mb, need to remind users in front end
            const MAX_FILE_SIZE = 2 * 1024 ** 2;

            const imageForm = formidable({
                uploadDir: __dirname + "/../uploads/profile-image",
                keepExtensions: true,
                minFileSize: 0,
                maxFiles: 1,
                allowEmptyFiles: true,
                filter: part => part.mimetype?.startsWith('image/') || false,
                filename: (originalName, originalExt, part, form) => {
                    let fieldName = part.name
                    let timestamp = Date.now()
                    let ext = part.mimetype?.split('/').pop()
                    return `${username}-${fieldName}-${timestamp}.${ext}`;
                },
            });

            imageForm.parse(req, async (err, fields, files) => {

                if (err) {
                    console.log(err);
                    res.status(500).json({ message: "internal server error" });
                };

                let fileSize = (files['profile-image']![0] as formidable.File).size;
                let filename = (files['profile-image']![0] as formidable.File).newFilename;

                if (isEmpty(files)) {
                    //check if an image is uploaded
                    console.log("no image has been uploaded");
                    res.status(400).json({
                        message: "profile picture update failed",
                        error: "no image"
                    })
                } else if (fileSize > MAX_FILE_SIZE) {
                    //check if image uploaded exceed max file size
                    res.status(400).json({
                        message: "profile image update failed",
                        error: "file size exceed maximum"
                    })
                } else {

                    const userQueryResult = (
                        await pgClient.query(
                            "UPDATE users SET profile_image = $1 WHERE id = $2 RETURNING id, profile_image;",
                            [filename, userId]
                        )).rows[0];

                    res.json({
                        message: "profile image update successful",
                        data: {
                            id: userId,
                            username: username,
                            profile_image: userQueryResult.profile_image
                        }
                    })
                }
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal sever error" });
    }
};

function isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
};