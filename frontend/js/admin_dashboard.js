const token = localStorage.getItem("token");
const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
};

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "login.html";
}

async function loadItems() {
    const res = await fetch("http://127.0.0.1:8000/items", { headers });
    const data = await res.json();
    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = "<h2>All Items</h2>";

    data.results.forEach(item => {
        const div = document.createElement("div");
        div.innerHTML = `
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <img src="http://127.0.0.1:8000/${item.image_path}" width="150"/>
            <p>Status: ${item.status}</p>
            <hr/>
        `;
        contentDiv.appendChild(div);
    });
}

async function loadClaims() {
    const res = await fetch("http://127.0.0.1:8000/claims/pending", { headers });
    const claims = await res.json();
    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = "<h2>Pending Claims</h2>";

    claims.forEach(claim => {
        const div = document.createElement("div");
        div.innerHTML = `
            <p><strong>Item:</strong> ${claim.item_id}</p>
            <p><strong>Claimed By:</strong> ${claim.claimed_by}</p>
            <button onclick="approveClaim('${claim._id}')">Approve</button>
            <button onclick="rejectClaim('${claim._id}')">Reject</button>
            <hr/>
        `;
        contentDiv.appendChild(div);
    });
}

async function approveClaim(claimId) {
    await fetch(`http://127.0.0.1:8000/claims/${claimId}/approve`, {
        method: "POST",
        headers,
    });
    alert("Claim approved");
    loadClaims();
}

async function rejectClaim(claimId) {
    await fetch(`http://127.0.0.1:8000/claims/${claimId}/reject`, {
        method: "POST",
        headers,
    });
    alert("Claim rejected");
    loadClaims();
}
