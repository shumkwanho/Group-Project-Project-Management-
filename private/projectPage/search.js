let searchInput = document.querySelector("#search");

searchInput.addEventListener("input", async (e) => {
    const value = e.target.value.toLowerCase();
    let res = await fetch(`/auth/search-user?value=${value}`);
    let response = await res.json();

})