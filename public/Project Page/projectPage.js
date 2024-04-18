
window.addEventListener("load", async (e) => {
    const res = await fetch("http://localhost:8080/project?id=1")
    const data = (await res.json()).data

	let projectData = [{ id: 1, text: data.name, start_date: data.start_date, duration: data.min_duration, parent: 0, open: true }]
for (let i = 1; i < data.tasks.length; i++) {
	let taskData = data.tasks
	let temp = {}
	temp.id = i + 2
	temp.text = taskData[i].name
	temp.start_date = taskData[i].start_date
	temp.duration = parseInt(taskData[i].duration)
	projectData.push(temp)
}

let taskRelation = []
let idCount = 1
for (let i = 1; i < data.tasks.length; i++) {
	let relation = data.tasks[i].relation.preTask
	console.log("task", data.tasks[i], "pretask",relation);
	if (relation.length > 0)
		for (let j = 0; j < relation.length; j++) {
			let temp = {}
			temp.id = idCount
			temp.source = parseInt(relation[j]) + 1
			temp.target = i + 2
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

console.log(taskRelation);
})


