console.log("hello index")

import { identifyInput, isEmptyOrSpace, isPasswordValid } from "../utils/checkInput.js";

let isNewUsernameEmailOkay = false;

const userLogin = document.querySelector("#user-login");
const userRegistration = document.querySelector("#user-registration");

const newEmail = document.querySelector("#new-email");
const newUsername = document.querySelector("#new-username");

//user login
userLogin.addEventListener("submit", async (e) => {

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
            showConfirmButton: false,
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
            text: `Welcome Back ${response.data.username}!! Redirecting you to main page.`,
            showConfirmButton: false,
            timer: 1800,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
            }
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                window.location.href = "./mainPage"
            };
        })

    } else {

        console.log(response.error);
        Swal.fire({
            title: 'Login Failed',
            text: 'Incorrect username, email and/or password',
            showConfirmButton: false,
        });
    }
})

//user registration
userRegistration.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = newEmail.value;
    const username = newUsername.value;

    console.log(email, username);

    if (isNewUsernameEmailOkay) {
        runUserRegistration(email, username);

    } else {
        //double check if email is an valid input
        //html already handled
        if (isEmptyOrSpace(email) || isEmptyOrSpace(username)) {
            Swal.fire({
                title: 'Invalid Input',
                text: 'Enter email and username',
                showConfirmButton: false,
            });
        } else if (identifyInput(username) != "username") {
            Swal.fire({
                title: 'Username Input Not Accepted',
                text: 'Enter another username',
                showConfirmButton: false,
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
                        showConfirmButton: false,
                    });
                } else {
                    displayPasswordInput(email, username);
                    isNewUsernameEmailOkay = true;

                }
            } else {
                console.log("unknown error to be handled...")
            }
        }
    }
})

function displayPasswordInput(email, username) {

    newEmail.setAttribute("disabled", true);
    newUsername.setAttribute("disabled", true);

    newEmail.setAttribute("value", email);
    newUsername.setAttribute("value", username);

    document.getElementById("create-new-account-button").remove();

    let passwordInput = `
    <div class="form-floating mb-3">
    <input type="password" class="form-control rounded-3" id="password1" placeholder="Password">
    <label for="password1">Password</label>
    </div>

    <div class="form-floating mb-3">
    <input type="password" class="form-control rounded-3" id="password2" placeholder="Re-enter Password">
    <label for="password2">Re-enter Password</label>
    </div>

    <button class="w-100 mb-2 btn btn-lg rounded-3 btn-primary" type="submit">Create New Account</button>`;

    userRegistration.insertAdjacentHTML("beforeend", passwordInput);
}

async function runUserRegistration(email, username) {

    //check if both passwords are the same
    const password = document.querySelector("#password1").value;
    const passwordConfirm = document.querySelector("#password2").value;

    if (passwordConfirm != password) {

        console.log(password);
        console.log(passwordConfirm)

        Swal.fire({
            title: 'Invalid password input',
            text: 'Please re-enter the same password you entered',
            showConfirmButton: false,
        });

    } else {

        if (!isPasswordValid(password)) {

            Swal.fire({
                title: 'Invalid password input',
                text: 'Password must be as least 10 characters long, and a combination of uppercase letters, lowercase letters, numbers and symbol',
                showConfirmButton: false,
            });

        } else {

            let res = await fetch("/auth/registration", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, email, password })
            });

            let response = await res.json();

            if (res.ok) {

                //login with new user-info
                await fetch("/auth/username-login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username, password })
                });

                //direct to main page
                Swal.fire({
                    title: 'User Registration Successful',
                    text: `Welcome ${response.data.username}!! Redirecting to main page`,
                    showConfirmButton: false,
                    timer: 1800,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.timer) {
                        window.location.href = "./mainPage"
                    };
                })
            }
        }
    }
}