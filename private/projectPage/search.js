import { generateImageElement } from "../../utils/generateImageElement.js";

const socket = io.connect();

var searchParams = new URLSearchParams(window.location.search);
const projectId = searchParams.get("id");

let searchInput = document.querySelector("#search");

window["addUserToProject"] = addUserToProject;

searchInput.addEventListener("input", async (e) => {
    const value = e.target.value.toLowerCase();
    let res = await fetch(`/auth/search-user?value=${value}`);
    let response = await res.json();

    let userInfoList = document.querySelector(".user-info-list");

    let userList = response.userList;

    if (userList != undefined) {
        if (res.ok) {
            userInfoList.innerHTML = "";

            for await (let user of userList) {

                let imageElm = generateImageElement(user.profile_image, user.username);

                userInfoList.innerHTML += `
                    <div class="user-info-card" id="user-info-card-${user.id}" onclick="addUserToProject(${projectId}, ${user.id})">
                        <div class="user-info-card-word")>
                            <div class="header">${user.username}</div>
                            <div class="body">${user.email}</div>
                        </div>
                        <div class="image-cropper">${imageElm}</div>
                    </div>`;
            }

        } else {
            console.log("error to be handled")
        };

    } else {
        console.log("User not found.");
    }
})

async function addUserToProject(projectId, userId) {

    let res = await fetch(`/projectRou/add-user`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            projectId: projectId,
            userId: userId
        })
    })

    let response = await res.json();
    console.log(response);
    if (res.ok) {
        socket.emit('addMember', { projectId: projectId, userId: userId });
        // location.reload();
    }
}