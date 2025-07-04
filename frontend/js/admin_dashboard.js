const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
const headers = {
  "Authorization": `Bearer ${token}`,
  "Content-Type": "application/json",
};

document.addEventListener("DOMContentLoaded", () => {
  if (!token || role !== "admin") {
    alert("Unauthorized access");
    window.location.href = "login.html";
    return;
  }

  document.getElementById("loadItemsBtn")?.addEventListener("click", loadItems);
  document.getElementById("loadClaimsBtn")?.addEventListener("click", loadClaims);
  document.getElementById("logoutBtn")?.addEventListener("click", logout);
});

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}

async function loadItems() {
  const contentDiv = document.getElementById("content");
  contentDiv.innerHTML = `<h2 class="text-xl font-bold mb-4 text-purple-700">All Items</h2>`;

  try {
    const res = await fetch("http://127.0.0.1:8000/admin/admin/items", { headers });
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      contentDiv.innerHTML += `<p class="text-gray-600">No items found.</p>`;
      return;
    }

    const itemsHtml = data.results.map(item => `
      <div class="bg-white p-4 mb-4 rounded-xl shadow-md border">
        <h3 class="text-lg font-semibold text-purple-800">${item.title}</h3>
        <p class="text-sm text-gray-700">${item.description || "No description"}</p>
        <img src="http://127.0.0.1:8000/${item.image_path.replace(/\\/g, "/")}" alt="${item.title}" class="mt-2 rounded w-full max-w-sm">
        <p class="mt-2"><b>Status:</b> ${item.status}</p>
        <p><b>Claimed:</b> ${item.is_claimed ? "Yes" : "No"}</p>
      </div>
    `).join("");

    contentDiv.innerHTML += itemsHtml;
  } catch (err) {
    console.error(err);
    contentDiv.innerHTML += `<p class="text-red-500">Failed to load items.</p>`;
  }
}

async function loadClaims() {
  const contentDiv = document.getElementById("content");
  contentDiv.innerHTML = `<h2 class="text-xl font-bold mb-4 text-purple-700">All Claims</h2>`;

  try {
    const res = await fetch("http://127.0.0.1:8000/admin/claims", { headers });
    const claims = await res.json();

    if (!claims || claims.length === 0) {
      contentDiv.innerHTML += `<p class="text-gray-600">No claims found.</p>`;
      return;
    }

    const claimsHtml = claims.map(claim => `
      <div class="bg-white p-4 mb-4 rounded-xl shadow-md border">
        <p><strong>Item ID:</strong> ${claim.item_id}</p>
        <p><strong>Claimed By:</strong> ${claim.claimed_by}</p>
        <p><strong>Status:</strong> ${claim.status}</p>
        <div class="mt-2 flex gap-2">
          <button onclick="updateClaimStatus('${claim._id}', 'approved')" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded">Approve</button>
          <button onclick="updateClaimStatus('${claim._id}', 'rejected')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">Reject</button>
        </div>
      </div>
    `).join("");

    contentDiv.innerHTML += claimsHtml;
  } catch (err) {
    console.error(err);
    contentDiv.innerHTML += `<p class="text-red-500">Failed to load claims.</p>`;
  }
}

async function updateClaimStatus(claimId, status) {
  try {
    const res = await fetch(`http://127.0.0.1:8000/admin/claims/${claimId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ status })
    });

    const result = await res.json();
    if (res.ok) {
      alert(`Claim ${status} successfully!`);
      loadClaims();
    } else {
      alert(result.detail || `Failed to ${status} claim`);
    }
  } catch (err) {
    console.error(err);
    alert(`Error updating claim status to "${status}"`);
  }
}

