console.log("hello index")

document.querySelector("#user-login").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;

    const res = await fetch("/auth/username-login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    let response = await res.json();
    if (res.ok) {
        console.log(response.data.username);
        window.location.href = "./mainPage/mainPage.html"
    } else {
        console.log(response.error);
        Swal.fire({
            title: 'Login Failed',
            text: 'Incorrect username and/or password',
        });
    }
})