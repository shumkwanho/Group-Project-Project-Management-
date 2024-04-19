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

document.querySelector("#login1").addEventListener("submit", async (event) => {
    event.preventDefault()

    const username = await document.querySelector("#username1").value;
    const password = await document.querySelector("#password1").value;
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


//===================== Useful Below ====================





//===================== Get All Members And Messages Below ====================

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
    let allMembers = response.groupMembers;
    let edited
    console.log("edited? : ", edited);

    // console.log(allMessagesDate);

    if (res.ok) {

        let memberBox = document.querySelector("#member-list")
        

        for (let eachMember of allMembers) {
            memberBox.innerHTML +=
                `
            <div class="member">
            <div class="username">${eachMember.username}</div>
            <div class="image-cropper">
            ${eachMember.profile_image ? `<img src="${eachMember.profile_image}" class="profilePic" />` : ""}
            </div>
            </div>
            `
        }

        



        let messagesBox = document.querySelector("#message-box")

        // console.log(allMessages);

        for (let eachMessageDate of allMessagesDate) {

            messagesBox.innerHTML +=
                `<div class="displayCreatedDate"><div>${eachMessageDate.created_date}</div></div>`

            for (let eachMessage of allMessages) {
                edited = eachMessage.edited_at;
                if (eachMessage.created_date == eachMessageDate.created_date) {

                    messagesBox.innerHTML +=
                        `
                ${response.userId == eachMessage.users_id ?
                            `
                <div class="myMessage" id="msgId-${eachMessage.messages_id}">
                <span class="content">${eachMessage.content}</span>
                <span class="create-time">${eachMessage.created_time}</span>
                ${edited ?
                                `
                <span class="edited">edited</span>
                ` : ""}
                <button class="edit-content" onclick="editMessage(${eachMessage.messages_id},'${eachMessage.content}')">Edit</button>
                </div>
                `
                            :
                            `
                <div class="message" id="msgId-${eachMessage.messages_id}">
                <span class="username">${eachMessage.username}</span>
                <span class="content">${eachMessage.content}</span>
                <span class="create-time">${eachMessage.created_time}</span>
                ${edited ?
                                `
                    <span class="edited">edited</span>
                    ` : ""}
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





//===================== Send Message and Pick Last Message Below ====================

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

    let res = await fetch('/auth/user')
    let response = await res.json();
    let myUserId = await response.data.id;
    console.log("my user id: ", myUserId);

    let msg = await lastMessageInfo.justSentMessage;
    let messagesBox = document.querySelector("#message-box")
    console.log("message user id: ", msg.users_id);

    messagesBox.innerHTML +=
        `
        ${myUserId == msg.users_id ?
            `
            <div class="myMessage" id="msgId-${msg.messages_id}">
            <span class="content">${msg.content}</span>
            <span class="create-time">${msg.created_time}</span>
            <button class="edit-content" onclick="editMessage(${msg.messages_id},'${msg.content}')">Edit</button>
            </div>
            `
            :
            `
            <div class="message" id="msgId-${msg.messages_id}">
            <span class="username">${msg.username}</span>
            <span class="content">${msg.content}</span>
            <span class="create-time">${msg.created_time}</span>
            </div>
            `
        }
        `
})





//===================== Edit My Message ====================
async function editMessage(messageId, content) {

    document.querySelector("#texting-box").innerHTML =
        `
        <form id="sendMessage" onsubmit="confirmEdit(event,${messageId})">
            <input type="text" name="text_content" id="edit-content" class="text-content" value="${content}">
            <button id="text-send" type="submit">Edit</button>
        </form>
    `

}

async function confirmEdit(event, messageId) {
    event.preventDefault()

    let content = document.querySelector("#edit-content").value;

    const res = await fetch('/chatroom', {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messageId: messageId,
            content: content
        })
    })

    if (res.ok) {
        let response = await res.json();
        let userId = response.userId;
        let content = response.date.content;

        socket.emit('editMessage', { messageId: messageId, userId: userId, content: content });
        console.log("Edit message success");
    }
}

socket.on('receive-editMessage', async info => {
    console.log(info);

    let res = await fetch('/auth/user')
    let response = await res.json();
    let myUserId = await response.data.id;
    console.log("my user id: ", myUserId);

    let msg = await info.lastEditMessageInfo;
    let justEditMessage = document.querySelector(`#msgId-${msg.messages_id}`)
    console.log("message user id: ", msg.users_id);

    justEditMessage.innerHTML =
        `
        ${myUserId == msg.users_id ?
            `
            <span class="content">${msg.content}</span>
            <span class="create-time">${msg.created_time}</span>
            <span class="edited">edited</span>
            <button class="edit-content" onclick="editMessage(${msg.messages_id},'${msg.content}')">Edit</button>
            `
            :
            `
            <span class="username">${msg.username}</span>
            <span class="content">${msg.content}</span>
            <span class="create-time">${msg.created_time}</span>
            <span class="edited">edited</span>
            `
        }
        `

})


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