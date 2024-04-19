console.log("hello index")

import { identifyInput, isEmptyOrSpace } from "../utils/checkInput.js";

//user login
document.querySelector("#user-login")
    .addEventListener("submit", async (e) => {

        e.preventDefault();

        const userInput = document.querySelector("#username_email").value;
        const password = document.querySelector("#password").value;

        let email;
        let username;
        let res;

        //identify if user input is username or email
        let inputType = identifyInput(userInput)

        if (inputType === 'unknown') {
            //for cases like text with @ but not an email
            Swal.fire({
                title: 'Login Failed',
                text: 'Please enter a valid username or email',
            });

        } else if (inputType === 'email') {

            email = userInput;
            res = await fetch("/auth/email-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

        } else if (inputType === 'username') {

            username = userInput;
            res = await fetch("/auth/username-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });
        }

        let response = await res.json();

        if (res.ok) {

            Swal.fire({
                title: 'Login Successful',
                text: `Welcome Back! ${response.data.username}`,
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = "./mainPage/mainPage.html"
                };
            })
        } else {

            console.log(response.error);
            Swal.fire({
                title: 'Login Failed',
                text: 'Incorrect username, email and/or password',
            });
        }
    })

//user registration
document.querySelector("#user-registration")
    .addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.querySelector("#email").value;
        const username = document.querySelector("#username").value;

        //double check if email is an valid input
        //html already handled
        if (isEmptyOrSpace(email) || isEmptyOrSpace(username)) {
            Swal.fire({
                title: 'Invalid Input',
                text: 'Enter email and username',
            });
        } else if (identifyInput(username) != "username") {
            Swal.fire({
                title: 'Username Input Not Accepted',
                text: 'Enter another username',
            });
        } else {

            let res = await fetch("/auth/check-user-exist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, email })
            });

            let response = await res.json();

            //check if username / email already exist in database
            if (res.ok) {
                if (response.isExist) {
                    Swal.fire({
                        title: 'Email / Username already exists',
                        text: 'Enter another email / username',
                    });
                } else {
                    window.location.href = "./user-registration/new.html"
                }
            } else {
                console.log("error to be handled...")
            }
        }
    })