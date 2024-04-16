Create New Project prompt

Q1
What is the name of your Project?

Q2
What is the start date of your ${Project}?

Q3
What is the final deadline of your ${Project}?

Q4
Your project duration will be ${ final deadline - start day }. Correct?
We would like to break down your project into smaller and more manageable tasks.
How many tasks can you think of?

(get total number of tasks from user, must more than 2 task)

Q5
What is the name / title of task 1 (first task)?
What is the name / title of task 2?
What is the name / title of task 3?
...
What is the name / title of task_n? (final task)

----------

Q5.1
Let's assume the start day of task 1 (your first task) is the start date of your Project.

(confirm and set task_1 start day)

Q5.2
How many working days do you need to complete ${task_1}?
(get task_1 duration: day)

Q5.3
The desirable completion date of ${task 1} will be ${task 1_start date + duration: day}.
Do you need to complete ${task 1} before starting other tasks?

Y / N?

----------

if (N)
Change Q5.1: What is the start day of ${task_n} (cannot assume)
Repeat Q5.2 to Q5.3 (for task_2, task_3, task_4...)

----------

if (Y)
Q6.1
Which task(s) can be started only after ${task_n-1} is completed?

(get at least one task name)
(set task_n-1 to be prerequisite of task_n)

Q6.2
Let us assume the start day of ${task_n} is one day after the completion of ${task n-1}.

(confirm and set task_n start day)
(Y / N)

if (N)
Q6.2.1
What will be the start date of ${task_n}?
(must be one day after ${task_n-1})

Repeat Q5.2 to 5.3
If Q6.1 response has more than one task, repeat Q5.2 to Q5.3 for each tasks

----------

Q final
Your Project is now broken down into tasks.
Take a look at your schedule and start assign members to start working!

****
situations to handle:
current total task duration > total project duration: 
    i) go back to prev. prompts and change response??
    ii) remind users remaining duration on each prompt??
