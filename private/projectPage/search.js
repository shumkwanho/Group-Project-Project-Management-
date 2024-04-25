let searchInput = document.querySelector("#search");

searchInput.addEventListener("input", async (e) => {
    const value = e.target.value.toLowerCase();
    console.log(value);
    let res = await fetch(`/auth/search-user?value=${value}`);
    let response = await res.json();
    console.log(response);
})