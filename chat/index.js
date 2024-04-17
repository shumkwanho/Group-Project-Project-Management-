var searchParams = new URLSearchParams(window.location.search);
const projectId = searchParams.get("projectId");
console.log(projectId);


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
        // window.location.reload()
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
    console.log(response);
    let allMessages = response.allMessages


    if (res.ok) {

        let messagesBox = document.querySelector("#message_box")

        console.log(allMessages);

        for (let eachMessage of allMessages) {

            messagesBox.innerHTML += `
        <div class="message">
        <span class="username">${eachMessage.username}</span>
        <span class="content">${eachMessage.content}</span>
        <span class="content">${eachMessage.created_at}</span>
        </div>
        `
        }


        // window.location.href = `http://localhost:8080/chat/?pId=${pId}`;
    }

}





document.querySelector("#sendMessage").addEventListener("submit", async (event) => {
    event.preventDefault()
    sendMessage(projectId)
})

async function sendMessage(projectId) {
    const content = await document.querySelector("#text_content").value;
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
    console.log(res)
}



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