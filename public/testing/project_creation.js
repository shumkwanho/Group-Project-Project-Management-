console.log("hello project creation");

let promptCount = 1;
let promptTaskCount = 0;
let totalTaskNumber = 0;

let newProjectData = {
    name : "",
    start_date : "2024-1-1",
    tasks : {},
}

const projectCreationForm = document.querySelector("#projectCreationForm");
const projectCreationPromptContent = document.querySelector("#projectCreationPromptContent");
const projectCreationModalLabel = document.querySelector("#projectCreationModalLabel");

projectCreationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    let inputTarget = e.currentTarget

    //save response
    saveResponseByPromptID(promptCount, inputTarget);

    //change inner html content to next prompt
    promptCount++;
    
    projectCreationModalLabel.innerHTML = `Creating Project: <span class="names">"${newProjectData.name}"</span>`;
    projectCreationPromptContent.innerHTML = printPromptContent(promptCount);
})

function saveResponseByPromptID(promptCount, inputTarget) {

    if (promptCount == 1) {
        newProjectData.name = inputTarget.response.value;

    } else if (promptCount == 2) {
        newProjectData.start_date = inputTarget.response.value;

    } else if (promptCount == 3) {
        totalTaskNumber = inputTarget.response.value;
        for (let i = 1; i <= totalTaskNumber; i++) {
            newProjectData.tasks[i] = {
                name: "",
                start_date: "2024-1-1",
                duration: 0,
                pre_req: [0],
            };
        }

    } else if (promptCount == 4) {
        for (let i = 1; i <= totalTaskNumber; i++) {
            let responsePropStr = "response_" + i;
            newProjectData.tasks[i].name = inputTarget[responsePropStr].value;
        }

    } else if (promptCount == 5) {
        if (!inputTarget.response) {
            newProjectData.tasks[promptTaskCount].start_date = newProjectData.start_date;
        } else {
            newProjectData.tasks[promptTaskCount].start_date = inputTarget.response.value;
        }
    } else if (promptCount == 6) {
        newProjectData.tasks[promptTaskCount].duration = inputTarget.response.value;
    }

    console.log(newProjectData);
}

function printPromptContent(promptCount) {
    if (promptCount == 1) {
        return `
        <label for="projectCreationResponse" class="form-label">Q1. What is the name of your
        Project</label>
    <input class="form-control" id="projectCreationResponse" type="text" name="response"
        value="New Project 1">`;
    } else if (promptCount == 2) {
        return `
        <label for="projectCreationResponse" class="form-label">
        Q2. When will your project start?
        </label>
        <input class="form-control" id="projectCreationResponse" type="date" value="2024-01-01" min="1997-07-01" max="2046-06-30" name="response">`;
    } else if (promptCount == 3) {
        return `
        <label for="projectCreationResponse" class="form-label">
        Q3. How many tasks do you plan to have for this project? (Please enter a number between 2 and 5. You may remove or add more tasks later)
        </label>
        <input class="form-control" id="projectCreationResponse" type="number" min="2" max="5" value="2" name="response">`;
    } else if (promptCount == 4) {
        return `
        <label for="projectCreationResponse" class="form-label">
        Q4. What are the title of the task(s)?
        </label>
        ${printTaskNameInput()}`;
    } else if (promptCount == 5) {
        //get the current task number for input
        promptTaskCount++
        //if current task prompt count > total task number
        if (promptTaskCount == 1) {
            return `
            <label for="projectCreationResponse" class="form-label">
            Q5a. Let's assume the start day of Task ${promptTaskCount}: <span class="names">"${newProjectData.tasks[promptTaskCount].name}"</span>  will be the same as the project start day, which will be <span class="names">${newProjectData.start_date}</span>;`;
        } else {
            return `
            <label for="projectCreationResponse" class="form-label">
            Q5b. When will Task ${promptTaskCount}: <span class="names">"${newProjectData.tasks[promptTaskCount].name}" start?
            </label>
            <input class="form-control" id="projectCreationResponse" type="date" value="2024-01-01" min="1997-07-01" max="2046-06-30" name="response">`;
        }
    } else if (promptCount == 6) {
        return `
        <label for="projectCreationResponse" class="form-label">
        Q6. How many working days will it take to complete Task ${promptTaskCount}: <span class="names">"${newProjectData.tasks[promptTaskCount].name}"</span>?
        </label>
        <input class="form-control" id="projectCreationResponse" type="number" min="1" max="10" value="1" name="response">`;
    } else if (promptCount == 7) {
        return `
        <label for="projectCreationResponse" class="form-label">
        Q7. Does Task ${promptTaskCount}: <span class="names">"${newProjectData.tasks[promptTaskCount].name}" need to be completed before any other tasks can start??
        </label>
        <div class="form-check">
        <input class="form-check-input" type="radio" name="response" id="projectCreationResponseYes">
        <label class="form-check-label" for="projectCreationResponseYes">
        Yes
        </label>
        </div>
        <div class="form-check">
        <input class="form-check-input" type="radio" name="response" id="projectCreationResponseNo" checked>
        <label class="form-check-label" for="projectCreationResponseNo">
        No
        </label>
        </div>`;
    }
}

function printTaskNameInput() {
    let printResult = "";
    for (let i = 1; i <= totalTaskNumber; i++) {
        printResult += `
        <input class="form-control" id="projectCreationResponse" type="text" name="response_${i}" value="New Task ${i}">`;
    };
    return printResult;
}