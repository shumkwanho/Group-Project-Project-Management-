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
    let personalArea = document.querySelector(".personal-area")
    let projectArea = document.querySelector(".project-area")
    let completedProjectArea = document.querySelector(".completed-project-area")

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
        <div class="create-project" onclick="location='http://localhost:8080/projectPage/'">
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
            onclick="location='http://localhost:8080/projectPage/?id=${eachProject.project_id}'">
                ${eachProject.image ? `
                <img src="/profile-image/${eachProject.image}" alt="" class="project-image">
                `
                        :
                        ""
                    }
                <button class="edit-project-image">btn</button>
                <div class="project-name">${eachProject.name}</div>
            </section>
        `
                projectCount++
            }
        }



        if (overrunTaskInfo) {
            for await (let eachOverrunTask of overrunTaskInfo) {
                document.querySelector(`#projectId-${eachOverrunTask.project_id}`).innerHTML += `
                <div class="current-task overrun-task">Current task: ${eachOverrunTask.name}</div>
                `
            }
        }

        if (meetDeadlineTaskInfo) {
            for await (let eachDeadlineTask of meetDeadlineTaskInfo) {
                document.querySelector(`#projectId-${eachDeadlineTask.project_id}`).innerHTML += `
                <div class="current-task overrun-task">Current task: ${eachDeadlineTask.name}</div>
                `
            }
        }

        if (currentTaskInfo) {
            for await (let eachCurrentTask of currentTaskInfo) {
                document.querySelector(`#projectId-${eachCurrentTask.project_id}`).innerHTML += `
                <div class="current-task overrun-task">Current task: ${eachCurrentTask.name}</div>
                `
            }
        }


        if (finishedProjects) {
            for await (let eachfinishedProject of finishedProjects) {
                completedProjectArea.innerHTML += `
                <div class="completed-project">
                    <div class="completed-project-name">${eachfinishedProject.name}</div>
                    <div class="completed-project-date">${eachfinishedProject.actual_finish_date}</div>
                </div>
                `

                finishProjectCount++
            }
        }


        personalArea.innerHTML = `
        <div class="user-content">
            <div class="image-cropper">
                <img src="/profile-image/${userInfo.profile_image}" alt="" id="user-profile">
            </div>
            <div class="username">${userInfo.username}</div>
            <div class="project-count">Current projects : ${projectCount}</div>
            <div class="completed-project-count">Completed projects : ${finishProjectCount}</div>
        </div>

        <div class="user-edit-btn">
            <button class="edit-profile">Edit profile</button>
        </div>
        `


    }

}
