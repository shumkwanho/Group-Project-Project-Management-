import { isEmptyOrSpace } from "../../utils/checkInput.js";

var searchParams = new URLSearchParams(window.location.search);
const userId = searchParams.get("id");
console.log("current main page user id: ", userId);

const logoutButton = document.querySelector("#logout-button");
const editProfile = document.querySelector("#edit-profile");
const updatePassword = document.querySelector("#update-password");

// const project = document.querySelector(".project")

// project.addEventListener("click",(e)=>{
//     window.location.href = "../Project Page/proJectPage.html"
// })

// document.querySelector("#new-project").addEventListener("click", (e) =>{
//     window.location.href = "../../project_init.html"
// });
getAllUserInfo(userId)
async function getAllUserInfo(userId) {
    let res = await fetch(`/mainpage/?userId=${userId}`)
    let response = await res.json();

    let userInfo = response.userInfo;
    let projectInfo = response.projectInfo;
    let overrunTaskInfo = response.overrunTaskInfo;
    let meetDeadlineTaskInfo = response.meetDeadlineTaskInfo;
    let currentTaskInfo = response.currentTaskInfo;
    let finishedProjects = response.finishedProjects;

    let notification = document.querySelector("#notification")
    let userContent = document.querySelector(".user-content")
    let projectArea = document.querySelector(".project-area")
    let completedProjectArea = document.querySelector(".completed-project-area")

    let newUsernameInput = document.querySelector("#new-username")

    let projectCount = 0
    let finishProjectCount = 0

    if (res.ok) {

        notification.innerHTML = `
        ${userInfo.last_login ? `
        Hello ${userInfo.username} , welcome back ! ;] &nbsp;&nbsp;&nbsp; Wish you a nice day
        `
                :
                `
        Hello ${userInfo.username} , welcome to join us ! ;]
        `
            }`

        projectArea.innerHTML = `
        <div class="create-project" onclick="location='http://localhost:8080/init-project'">
            <div class="project-name white-word">Create project</div>
            <br>
            <div class="center-image">
                <img src="./create_project.png" alt="" class="create-project-image">
            </div>
        </div>
        `

        if (projectInfo) {
            for await (let eachProject of projectInfo) {
                projectArea.innerHTML += `
            <section class="project" id="projectId-${eachProject.project_id}" 
            onclick="location='http://localhost:8080/project/?id=${eachProject.project_id}'">
                ${eachProject.image ? `
                <img src="/profile-image/${eachProject.image}" alt="" class="project-image">
                `
                        :
                        ""
                    }
                <button class="edit-project-image">btn</button>
                <div class="project-name white-word">${eachProject.name}</div>
            </section>
        `

                if (Number(eachProject.min_duration) <= 10) {
                    document.querySelector(`#projectId-${eachProject.project_id}`).style.minHeight = "200px" ; 
                } else if (Number(eachProject.min_duration) > 10 && Number(eachProject.min_duration) <= 30) {
                    document.querySelector(`#projectId-${eachProject.project_id}`).style.minHeight = "300px" ; 
                } else if (Number(eachProject.min_duration) > 30 && Number(eachProject.min_duration) <= 60) {
                    document.querySelector(`#projectId-${eachProject.project_id}`).style.minHeight = "400px" ; 
                } else {
                    document.querySelector(`#projectId-${eachProject.project_id}`).style.minHeight = "500px" ;
                }
                projectCount++
            }
        }

        if (currentTaskInfo) {
            for await (let eachCurrentTask of currentTaskInfo) {
                document.querySelector(`#projectId-${eachCurrentTask.project_id}`).innerHTML += `
                <div class="current-task white-word">Current task: ${eachCurrentTask.name}</div>
                `

                document.querySelector(`#projectId-${eachCurrentTask.project_id}`).style.background = "#b8d3d2"
            }
        }

        if (meetDeadlineTaskInfo) {
            for await (let eachDeadlineTask of meetDeadlineTaskInfo) {
                document.querySelector(`#projectId-${eachDeadlineTask.project_id}`).innerHTML += `
                <div class="current-task deadline-task white-word">Current task: ${eachDeadlineTask.name}</div>
                `

                document.querySelector(`#projectId-${eachDeadlineTask.project_id}`).style.background = "#e7cd77";
            }
        }

        if (overrunTaskInfo) {
            for await (let eachOverrunTask of overrunTaskInfo) {
                document.querySelector(`#projectId-${eachOverrunTask.project_id}`).innerHTML += `
                <div class="current-task overrun-task white-word">Current task: ${eachOverrunTask.name}</div>
                `

                document.querySelector(`#projectId-${eachOverrunTask.project_id}`).style.background = "#b4454c";
            }
        }

        if (finishedProjects) {
            for await (let eachfinishedProject of finishedProjects) {
                completedProjectArea.innerHTML += `
                <div class="completed-project" onclick="location='http://localhost:8080/project/?id=${eachfinishedProject.project_id}'">
                    <div class="completed-project-name white-word">${eachfinishedProject.name}</div>
                    <div class="completed-project-date white-word">${eachfinishedProject.actual_finish_date}</div>
                </div>
                `

                finishProjectCount++
            }
        }

        //if no profile image was uploaded, use default
        let imageElm = "";
        if (userInfo.profile_image == null) {
            let defaultProfileImage = new ProfileImage(
                userInfo.username, {
                    backgroundColor: "black",
                })
            imageElm = defaultProfileImage.svg();
        } else {
            imageElm = `<img src="/profile-image/${userInfo.profile_image}" alt="" id="user-profile">`
        }

        userContent.innerHTML = `
        <div class="user-content">
            <div class="image-cropper">
            ${imageElm}
            </div>
            <div class="username">${userInfo.username}</div>
            <div class="project-count">Current projects : ${projectCount}</div>
            <div class="completed-project-count">Completed projects : ${finishProjectCount}</div>
        </div>
        `
        newUsernameInput.setAttribute("value", userInfo.username);
    }

}

//logout button
logoutButton.addEventListener("click", (e) => {
    e.preventDefault();

    Swal.fire({
        title: "Do you want to logout",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        allowOutsideClick: false
    }).then((result) => {
        if (result.isConfirmed) {
            runLogout();
        }
    });

})

async function runLogout() {
    let res = await fetch ("/auth/logout", {
        method: "POST"
    })

    if (res.ok) {
        window.location.href = '/';
    }
}

//editProfile button
//currently only able to edit username
editProfile.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.querySelector("#new-username").value;

    let userInfoRes = await fetch('/auth/user')
    let currentUserInfo = await userInfoRes.json();

    if (isEmptyOrSpace(username)){
        Swal.fire({
            title: 'Username cannot be blank or only space',
            showConfirmButton: false
        });

    } else if (username === currentUserInfo.data.username) {
        Swal.fire({
            title: 'Username unchanged!',
            confirmButtonText: "Pick another name"
        });

    } else {
        let res = await fetch("/auth/username-update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username })
        });

        let result = await res.json();

        if (res.ok) {

            Swal.fire({
                title: 'Username update successful!',
                confirmButtonText: "Continue"
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.reload();
                    getAllUserInfo(userId)
                }
            });

        } else {
            if (result.error == "newUsernameExist") {
                Swal.fire({
                    title: 'Username already taken!',
                    confirmButtonText: "Pick another name"
                });
            }
        }
    }
})

updatePassword.addEventListener("submit", async (e) => {
    e.preventDefault();

    //
})