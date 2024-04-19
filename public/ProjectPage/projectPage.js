let taskCount = 1
var searchParams = new URLSearchParams(window.location.search);
const projectId = searchParams.get("id");

async function getProjectData(projectId) {
	const res = await fetch(`http://localhost:8080/project?id=${projectId}`)
	const data = (await res.json()).data
	return data
}

window.addEventListener("load", async (e) => {
	const data = await getProjectData(projectId)
	let projectData = [{ id: 1, text: data.name, start_date: data.start_date, duration: data.min_duration, parent: 0, open: true }]
	for (let i = taskCount; i < data.tasks.length; i++) {
		let taskData = data.tasks
		let temp = {}
		temp.id = i + 1
		temp.text = taskData[i].name
		temp.start_date = taskData[i].start_date
		temp.duration = parseInt(taskData[i].duration)
		projectData.push(temp)
		
	}

	console.log(projectData);

	let taskRelation = []
	let idCount = 1
	const rootTaskId = data.tasks[0].id

	for (let i = 2; i < data.tasks.length; i++) {
		let relation = data.tasks[i].relation.preTask
		if (relation.length > 0)
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

	gantt.config.date_format = "%Y-%m-%d";
	gantt.init("gantt_here");
	gantt.parse({
		data: projectData,
		links: taskRelation
	});
})


gantt.attachEvent("onAfterTaskDelete", async (id,item)=> {
	const data = await getProjectData()
	let taskid
	for (let task of data.tasks){
		if (task.name == item.text)[
			taskid = task.id
		]
	}
	let res = await fetch('/task', {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            taskId: taskid
        })
    })
	taskCount -= 1
	console.log(taskCount);
});

gantt.attachEvent("onTaskCreated", function(task){
    task.projectId = taskCount;

	taskCount += 1
    return true;
});



