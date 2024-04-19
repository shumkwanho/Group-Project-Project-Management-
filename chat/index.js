const socket = io.connect();

// socket.on('newConnection', function(data){
//     console.log(data);
// })

var searchParams = new URLSearchParams(window.location.search);
const projectId = searchParams.get("project");
console.log("current project id: ", projectId);



// Socket.on('newMessage', function (data) {
//     console.log(data)
// })


document.querySelector("#login").addEventListener("submit", async (event) => {
    event.preventDefault()

    const username = await document.querySelector("#username").value;
    const password = await document.querySelector("#password").value;
    console.log(username);
    console.log(password);

    let res = await fetch(`/testLogin`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })

    let response = await res.json();
    console.log(response);

    if (res.ok) {
        console.log("login success");
        let target = document.querySelector(".login-area");
        target.innerHTML = `
        <div>
        ${response.username}
        </div>`
        window.location.reload()
    }
})

async function testLoginOk() {
    let res = await fetch(`/testLogin`)
    let response = await res.json();
    let target = document.querySelector(".login-area");

    if (res.ok) {
        target.innerHTML = `
    <div>
    ${response.username}
    </div>`
    }
}





getAllMessages(projectId);

async function getAllMessages(projectId) {

    // const res = await fetch(
    //     `https://jsonplaceholder.typicode.com/posts/${postId}`
    //   );

    let res = await fetch(`/chatroom?projectId=${projectId}`)


    let response = await res.json();

    // console.log("userId: ", response.userId);
    // console.log("allResponse: ", response);


    let allMessagesDate = response.allMessagesDate;
    let allMessages = response.allMessages;

    // console.log(allMessagesDate);


    if (res.ok) {




        let messagesBox = document.querySelector("#message-box")

        // console.log(allMessages);


        for (let eachMessageDate of allMessagesDate) {
            console.log("hi", eachMessageDate)

            messagesBox.innerHTML +=
                `<div class="displayCreatedDate"><div>${eachMessageDate.created_date}</div></div>`

            for (let eachMessage of allMessages) {
                console.log("check bye", eachMessage.created_date)
                if (eachMessage.created_date == eachMessageDate.created_date) {

                    messagesBox.innerHTML +=
                        `
                ${response.userId == eachMessage.users_id ?
                            `
                <div class="myMessage">
                <span class="content">${eachMessage.content}</span>
                <span class="create-time">${eachMessage.created_time}</span>
                </div>
                `
                            :
                            `
                <div class="message">
                <span class="username">${eachMessage.username}</span>
                <span class="content">${eachMessage.content}</span>
                <span class="create-time">${eachMessage.created_time}</span>
                </div>
                `
                        }`
                }
            }
        }
        socket.emit('join', projectId);
    }
}

// window.location.href = `http://localhost:8080/chat/?pId=${pId}`;









document.querySelector("#sendMessage").addEventListener("submit", async (event) => {
    event.preventDefault()
    sendMessage(projectId)
})

async function sendMessage(projectId) {
    const content = await document.querySelector("#text-content").value;

    let res = await fetch('/chatroom', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            projectId: projectId,
            content: content
        })
    })
    if (res.ok) {
        let response = await res.json();
        let userId = response.userId;
        socket.emit('newMessage', { userId: userId, projectId: projectId, content: content });
        console.log("send message success");
        document.querySelector("#text-content").value = "";
        // window.location.reload();
    }

}


socket.on('receive-newMessage', async lastMessageInfo => {
    console.log(lastMessageInfo);
    let msg = await lastMessageInfo.justSentMessage;
    let userId = await lastMessageInfo.userId;
    let messagesBox = document.querySelector("#message-box")

    messagesBox.innerHTML +=
        `
        ${userId == msg.users_id ?
            `
            <div class="myMessage">
            <span class="content">${msg.content}</span>
            <span class="create-time">${msg.created_time}</span>
            </div>
            `
            :
            `
            <div class="message">
            <span class="username">${msg.username}</span>
            <span class="content">${msg.content}</span>
            <span class="create-time">${msg.created_time}</span>
            </div>
            `
        }
        `
})

async function editMessage(userId, projectId) { }


testLoginOk()



// <script>
// function getParams() {
//   // const urlParams = new URLSearchParams(window.location.search);
//   const urlParams = new URLSearchParams('id=4&comment=25');
//   const id = urlParams.get('id');
//   const comment = urlParams.get('comment');

//   return { id: id, comment: comment };
// }

// const { id, comment } = getParams();
// </script>