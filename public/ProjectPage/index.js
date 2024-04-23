import { getFinishDate } from "../../utils/getFinishDate.js";

var searchParams = new URLSearchParams(window.location.search);
const projectId = searchParams.get("id");

async function getProjectData(id) {
	const res = await fetch(`/projectRou/?id=${id}`)
	const data = (await res.json()).data

	return data
}


window.addEventListener("load", async (e) => {
	try {
		const data = await getProjectData(projectId)
		console.log(data);
		await drawPage(projectId)
		const finishbtns = document.querySelectorAll(".finish-btn")
		finishbtns.forEach((btn)=>{
			btn.addEventListener("click",async (e)=>{
				let taskId = (e.currentTarget.parentElement.id).slice(5)
				await fetch('/task/finish', {
					method: "PUT",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({id:taskId})
				})
			})
		})



		
		
		const assignBtns = document.querySelectorAll(".assign-btn")
		assignBtns.forEach((btn)=>{
			btn.addEventListener("click",async (e)=>{
				let taskId = (e.currentTarget.parentElement.id).slice(5)
				await assignTask(taskId)
			})
		})
	} catch (error) {
		console.log(error);
	}


})


gantt.attachEvent("onAfterTaskDelete", async (id, item) => {
	try {
		const taskdata = (await getProjectData(projectId)).tasks
		const taskid = taskdata[id - 1].id
		if (taskid) {
			let res = await fetch('/task', {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					taskId: taskid
				})
			})
			let message = (await res.json()).message
			console.log(message);
		}
	} catch (error) {
		console.log(error)
	}

});

gantt.attachEvent("onAfterTaskAdd", async function (id, item) {
	const req = {
		projectId: parseInt(projectId),
		taskName: item.text,
		startDate: getFinishDate(item.start_date, 1),
		duration: item.duration
	}
	console.log(req);
	const res = await fetch("/task", {
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(req),
	});
});

gantt.attachEvent("onAfterTaskUpdate", async function (id, item) {
	const taskdata = (await getProjectData(projectId)).tasks
	const taskid = taskdata[id - 1].id

	console.log(taskid);
	const req = {
		taskId: taskid,
		taskName: item.text,
		duration: item.duration,
		startDate: getFinishDate(item.start_date, 1),
		finishDate: item.progress == 1 ? "finished" : null
	}
	let res = await fetch('/task', {
		method: "PUT",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(req)
	})
});

gantt.attachEvent("onAfterLinkDelete", async function (id, item) {
	const tasksData = (await getProjectData(projectId)).tasks
	const preTask = tasksData[item.source - 1];
	const task = tasksData[item.target - 1];
	const req = {
		preTask: preTask.id,
		taskId: task.id
	}
	let res = await fetch('/task/relation', {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(req)
	})
});

gantt.attachEvent("onAfterLinkAdd", async function (id, item) {
	const tasksData = (await getProjectData(projectId)).tasks
	const preTask = parseInt(item.source)
	const task = tasksData[item.target - 1];
	const req = {
		preTask: preTask,
		taskId: task.id
	}

	let res = await fetch('/task/relation', {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(req)
	})
});


function chartData(data) {
	let projectData = [{ id: 1, text: data.name, start_date: data.start_date, duration: data.min_duration, parent: 0, open: true }]

	for (let i = 1; i < data.tasks.length; i++) {
		let taskData = data.tasks
		let temp = {}
		temp.id = i + 1
		temp.text = taskData[i].name
		temp.start_date = taskData[i].start_date
		temp.duration = parseInt(taskData[i].duration)
		if (taskData[i].actual_finish_date) {
			temp.progress = 1
		}
		projectData.push(temp)
	}
	return projectData
}

function chartRelation(data) {
	let taskRelation = []
	let idCount = 1
	const rootTaskId = data.tasks[0].id
	for (let i = 2; i < data.tasks.length; i++) {
		let relation = data.tasks[i].relation.preTask
		if (relation.length > 0) {
			for (let j = 0; j < relation.length; j++) {
				let temp = {}
				temp.id = idCount
				temp.source = relation[j] - rootTaskId + 1
				temp.target = i + 1
				temp.type = "0"
				taskRelation.push(temp)
				idCount += 1
			}
		}
	} return taskRelation
}

function createGanttChart(data) {
	const projectData = chartData(data)
	const taskRelation = chartRelation(data)
	gantt.config.date_format = "%Y-%m-%d";
	gantt.init("gantt_here");
	gantt.parse({
		data: projectData,
		links: taskRelation
	});
}

async function displayTaskList(data) {
	const tasks = data.tasks


	for (let task of tasks) {
		if ((task.name).includes("root")) {
			continue
		}
		if (task.actual_finish_date) {
			document.querySelector(".finished").innerHTML += `
			<div class="task-container" id="task_${task.id}">
                <div class="task border">
                    <div class="task-name" id="${task.id}">${task.name}</div>
                    <div>${task.userRelation[0]? task.userRelation[0].username:""}</div>
				</div>
			</div>`
				
		} else if (task.pre_req_fulfilled) {
			document.querySelector(".ongoing").innerHTML += `
			<div class="task-container" id="task_${task.id}">
                <div class="task border">
                    <div class="task-name">${task.name}</div>
                    <div>${task.userRelation[0]? task.userRelation[0].username:""}</div>
                </div>
                <button class="finish-btn">+</button>
			</div>`
		} else {
			document.querySelector(".to-do-list").innerHTML += `
			<div class="task-container" id="task_${task.id}">
			<div class="task border">
				<div class="task-name">${task.name}</div>
				<div>${task.userRelation[0]? task.userRelation[0].username:""}</div>
				</div>
			<button class="assign-btn">+</button>
		</div>`
		}
	}
}

async function drawPage(projectId){
	const data = await getProjectData(projectId)
	createGanttChart(data)
	await displayTaskList(data)
}

async function assignTask (taskId){

	const data = await getProjectData(projectId)
	const userList = data.users
	const inputOption = {}
	for (let user of userList){
		inputOption[user.id] = user.username
	}
	const { value: person } = await Swal.fire({
		title: "Select Person",
		input: "select",
		inputOptions: inputOption,
		inputPlaceholder: "Select person",
		showCancelButton: true,
		inputValidator: (value) => {
			return new Promise((resolve) => {
			  if (value) {
				resolve();
			  } else {
				resolve("You need to choose a person");
			  }
			});
		  }
	  }).then(async (result)=>{

		try {
				const userId = result.value
		const res = await fetch("/task/userTaskRelation", {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({taskId:taskId,userId:userId,projectId:projectId}),
		});
		if (res.ok) {
			console.log("HAHA");
		}
		} catch (error) {
			console.log(error);
		}
	
	  });
}