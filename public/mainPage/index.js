var searchParams = new URLSearchParams(window.location.search);
const userId = searchParams.get("id");
console.log("current main page user id: ", userId);

// const project = document.querySelector(".project")

// project.addEventListener("click",(e)=>{
//     window.location.href = "../Project Page/proJectPage.html"
// })

// document.querySelector("#new-project").addEventListener("click", (e) =>{
//     window.location.href = "../../project_init.html"
// });

async function getAllUserInfo(userId) {
    let res = await fetch('/mainpage')
    let response = await res.json();
    let userInfo = response.userInfo;
    let projectInfo = response.projectInfo;
    let overrunTaskInfo = response.overrunTaskInfo;
    let meetDeadlineTaskInfo = response.meetDeadlineTaskInfo;
    let currentTaskInfo = response.currentTaskInfo;
    let finishedProjects = response.finishedProjects;

    let notification = querySelector("#notification")
    let personalArea = querySelector(".personal-area")
    let projectArea = querySelector(".project-area")

    if (res.ok) {

        notification.innerHTML = `
        ${userInfo.last_login ? `
        Hello ${userInfo.username} , welcome back ! ;] Wish you a nice day
        `
                :
                `
        Hello ${userInfo.username} , welcome to join us ! ;]
        `
            }`



        personalArea.innerHTML = `
        <div class="user-content">
            <div class="image-cropper">
                <img src="/profile-image/${userInfo.profile_image}" alt="" id="user-profile">
            </div>
            <div class="username">${userInfo.username}</div>
            <div class="project-count">Current projects : </div>
            <div class="completed-project-count">Completed projects : </div>
        </div>

        <div class="user-edit-btn">
            <button class="edit-profile">Edit profile</button>
        </div>
        `
        projectArea.innerHTML = `
        <div class="create-project">
            <div class="project-name">Create new project</div>
            <img src="/profile-image/mydog.jpg" alt="" class="create-project-image">
        </div>
        `

        if (overrunTaskInfo.length > 0) {
            for (let eachProject of currentTaskInfo) {
                projectArea.innerHTML += `

        <div class="project">
            <img src="/profile-image/mydog.jpg" alt="" class="project-image">
            <button class="edit-project-image">btn</button>
            <div class="project-name">Project 1</div>
            <div class="current-task">Task 1</div>
            <div class="current-task">Task 2</div>
            <div class="current-task">Task 3</div>
            <div class="current-task">Task 4</div>
        </div>
        `

            }
        }



    }

}
