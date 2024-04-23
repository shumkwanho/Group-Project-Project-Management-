console.log("hello project creation");

import { getFinishDate } from "../utils/getFinishDate.js";

let promptCount = 1; //tracking the current prompt 
let taskCount = []; //tracking how many task information to be filled
let taskCountCurrent = 0; //tracking which task information is currently being filled

//(if a task is depend on the completion of another task)
//tracking how many sub-task information to be filled
let taskDependanceCount = [];
let motherTaskCountCurrent = 0;

let newProjectData = {
    name: "",
    start_date: "2024-01-01",
    tasks: {},
}

const projectCreationForm = document.querySelector("#projectCreationForm");
const projectCreationPromptContent = document.querySelector("#projectCreationPromptContent");
const projectCreationModalLabel = document.querySelector("#projectCreationModalLabel");

projectCreationForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    let inputTarget = e.currentTarget

    //ready to init
    if (promptCount == 99) {

        let projId = await projectInit(newProjectData);
        console.log(projId);
        window.location.href = `../../ProjectPage/?id=${projId}`;

    } else {
        //save response and update prompt count
        promptCount = saveResponseByPromptCount(promptCount, inputTarget);
        console.log(newProjectData);

        try {
            console.log(`current Q: ${promptCount}`);
            console.log(`taskCount: ${taskCount}`)
            console.log(`taskDependanceCount: ${taskDependanceCount}`)
            console.log(`taskCountCurrent: ${taskCountCurrent}`)
            console.log(`motherTaskCountCurrent: ${motherTaskCountCurrent}`)
        } catch (error) {
            console.log(error);
        }

        //change inner html content to next prompt
        projectCreationModalLabel.innerHTML = `Creating Project: <span class="names">"${newProjectData.name}"</span>`;
        projectCreationPromptContent.innerHTML = printPromptContent(promptCount);
    }
})

function saveResponseByPromptCount(count, inputTarget) {

    if (count == 1) {
        newProjectData.name = inputTarget.response.value;
        return 2;

    } else if (count == 2) {
        newProjectData.start_date = inputTarget.response.value;
        return 3;

    } else if (count == 3) {

        for (let i = 1; i <= inputTarget.response.value; i++) {
            
            newProjectData.tasks[i] = {
                name: "",
                start_date: "2024-01-01",
                duration: 0,
                finish_date: "2024-12-31",
                pre_req_of: [],
            };

            taskCount.push(i);
        }
        return 4;

    } else if (count == 4) {
        for (let i = 1; i <= taskCount.length; i++) {
            newProjectData.tasks[i].name = inputTarget[("response_" + i)].value;
        }

        return 5;

    } else if (count == 5) {
        if (!inputTarget.response) {
            newProjectData.tasks[taskCountCurrent].start_date = newProjectData.start_date;
        } else {
            newProjectData.tasks[taskCountCurrent].start_date = inputTarget.response.value;
        }

        return 6;

    } else if (count == 6) {
        newProjectData.tasks[taskCountCurrent].duration = parseInt(inputTarget.response.value);

        let finishDate = getFinishDate(
            newProjectData.tasks[taskCountCurrent].start_date, 
            newProjectData.tasks[taskCountCurrent].duration
        );
        
        newProjectData.tasks[taskCountCurrent].finish_date = finishDate;

        if (taskCount.length == 0) {
            //if there is no more task to fill
            return 99;

        } else if (taskDependanceCount.length > 0) {
            //to finish all other sub-task
            taskCountCurrent = taskDependanceCount[0];
            return 5;

        } else if (motherTaskCountCurrent == 0 || newProjectData.tasks[motherTaskCountCurrent].pre_req_of.length === 0) {
            return 7;
        } else {
            taskDependanceCount = [...newProjectData.tasks[motherTaskCountCurrent].pre_req_of];
            taskCountCurrent = taskDependanceCount[0];
            motherTaskCountCurrent = 0;
            return 7;
        }

    } else if (count == 7) {
        
        taskDependanceCount.length = 0;

        if (inputTarget.response.value == 0) {
            //if user choose no, repeat Q5 to Q7
            return 5;
        } else {
            //if user choose yes
            motherTaskCountCurrent = taskCountCurrent
            return 8;
        };
    
    } else if (count == 8) {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');

        //to be handled: user must check as least one box

        for (let checkbox of checkboxes) {
            if (checkbox.checked){
                let taskNum = parseInt(checkbox.value);
                newProjectData.tasks[taskCountCurrent].pre_req_of.push(taskNum);
                taskDependanceCount.push(taskNum);
            }
        }

        taskCountCurrent = taskDependanceCount[0];

        //handling: no need to get info from same task if go to Q5 again
        for (let task of taskDependanceCount) {
            if (taskCount.includes(task)) {
                let indexToRemove = taskCount.indexOf(task);
                taskCount.splice(indexToRemove, 1);
            }
        }
        return 5;
        
    }
}

function printPromptContent(promptCount) {
    if (promptCount == 1) {
        return `
        <label for="projectCreationResponse" class="form-label">Q1. What is the name of your
        Project??</label>
        <input class="form-control" id="projectCreationResponse" type="text" name="response"
        value="New Project 1">`;

    } else if (promptCount == 2) {
        return `
        <label for="projectCreationResponse" class="form-label">
        Q2. When will your project start??
        </label>
        <input class="form-control" id="projectCreationResponse" type="date" value="2024-01-01" min="1997-07-01" max="2046-06-30" name="response">`;

    } else if (promptCount == 3) {
        return `
        <label for="projectCreationResponse" class="form-label">
        Q3. How many tasks do you plan to have for this project?? (Please enter a number between 2 and 5. You may remove or add more tasks later)
        </label>
        <input class="form-control" id="projectCreationResponse" type="number" min="2" max="5" value="5" name="response">`;

    } else if (promptCount == 4) {
        return `
        <label for="projectCreationResponse" class="form-label">
        Q4. What are the title of the task(s)??
        </label>
        ${printTaskNameInput()}`;

    } else if (promptCount == 5) {

        if (taskDependanceCount.length > 0) {
            //to check if currently working on sub-tasks
            taskDependanceCount.shift();

            let minStartDate = getFinishDate(newProjectData.tasks[motherTaskCountCurrent].finish_date, 1);

            return `
            <label for="projectCreationResponse" class="form-label">
            Q5. When will Task ${taskCountCurrent}: <span class="names">"${newProjectData.tasks[taskCountCurrent].name}"</span> start??
            (Must be one day after ${newProjectData.tasks[motherTaskCountCurrent].finish_date}, which is completion date of Task ${motherTaskCountCurrent}.)
            </label>
            <input class="form-control" id="projectCreationResponse" type="date" value="${minStartDate}" min="${minStartDate}" max="2046-06-30" name="response">`;
        }
        
        //check if all task information have been input
        if (taskCount.length == 0) {
            //never fire???
            return `
            <label for="projectCreationResponse" class="form-label">
            Done!!
            </label>
            `

        } else {
            //update the current task number for input
            taskCountCurrent = taskCount.shift();
            if (taskCountCurrent == 1) {
                //Q5a only for task 1 (first task)
                return `
                <label for="projectCreationResponse" class="form-label">
                Q5a. Let's assume the start day of Task ${taskCountCurrent}: <span class="names">"${newProjectData.tasks[taskCountCurrent].name}"</span> will be the same as the project start day, 
                which will be <span class="names">${newProjectData.start_date}</span>.
                </label>`;
            
            } else {
                //Q5b for tasks other than first task
                return `
                <label for="projectCreationResponse" class="form-label">
                Q5b. When will Task ${taskCountCurrent}: <span class="names">"${newProjectData.tasks[taskCountCurrent].name}"</span> start??
                </label>
                <input class="form-control" id="projectCreationResponse" type="date" value="2024-01-01" min="1997-07-01" max="2046-06-30" name="response">`;
            }
        }

    } else if (promptCount == 6) {
        return `
        <label for="projectCreationResponse" class="form-label">
        Q6. How many working days will it take to complete Task ${taskCountCurrent}: <span class="names">"${newProjectData.tasks[taskCountCurrent].name}"</span>??
        </label>
        <input class="form-control" id="projectCreationResponse" type="number" min="1" max="10" value="1" name="response">`;

    } else if (promptCount == 7) {

        return `
        <label for="projectCreationResponse" class="form-label">
        Q7. The estimated completion date of Task ${taskCountCurrent}: <span class="names">"${newProjectData.tasks[taskCountCurrent].name}"</span> is: <span class="names">${newProjectData.tasks[taskCountCurrent].finish_date}</span>;
        Does this task need to be completed before any other tasks can start??
        </label>
        <div class="form-check">
        <input class="form-check-input" type="radio" name="response" id="projectCreationResponseYes" value="1">
        <label class="form-check-label" for="projectCreationResponseYes">
        Yes
        </label>
        </div>
        <div class="form-check">
        <input class="form-check-input" type="radio" name="response" id="projectCreationResponseNo" value="0" checked>
        <label class="form-check-label" for="projectCreationResponseNo">
        No
        </label>
        </div>`;

    } else if (promptCount == 8) {
        return `
        <label for="projectCreationResponse" class="form-label">
        Q8. Which task(s) can only be started after the completion of Task ${taskCountCurrent}: <span class="names">"${newProjectData.tasks[taskCountCurrent].name}"</span>?? (Check the task number(s))
        </label>
        ${printTaskNameCheckboxes()}
        `
    } else if (promptCount == 99) {
        return `
        <label for="projectCreationResponse" class="form-label">
        Done!!
        Hit Next to finalize your Project!
        </label>
        `
    }
}

function printTaskNameInput() {
    let printResult = "";
    for (let i = 1; i <= taskCount.length; i++) {
        printResult += `
        <input class="form-control" id="projectCreationResponse" type="text" name="response_${i}" value="New Task ${i}">`;
    };
    return printResult;
}

function printTaskNameCheckboxes() {

    let printResult = "";
    for (let i = 0; i < (taskCount.length); i++) {
        let taskNum = taskCount[i];
        printResult += `
        <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${taskNum}" id="projectCreationResponseCheckboxTask_${taskNum}">
        <label class="form-check-label" for="projectCreationResponseCheckboxTask_${taskNum}">
        Task ${taskNum}: <span class="names">"${newProjectData.tasks[taskNum].name}"</span>
        </label>
        </div>`
    };
    return printResult;
}

async function projectInit(projJSON) {
    addPreReq(projJSON);

    const res = await fetch("/projectRou/init", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify(projJSON),
    });

    let result = await res.json()
    console.log(result.data);

    return result.data.id;
}

function addPreReq(projJSON) {

    //add pre_req key to tasks.task
    for (let taskId in projJSON.tasks) {
        projJSON.tasks[taskId]["pre_req"] = [];
    }

    for (let taskId in projJSON.tasks) {
        for (let subTaskId of projJSON.tasks[taskId].pre_req_of) {
            if (subTaskId) {
                projJSON.tasks[subTaskId].pre_req.push(parseInt(taskId));
            }
        }
    }
    console.log(projJSON);
};