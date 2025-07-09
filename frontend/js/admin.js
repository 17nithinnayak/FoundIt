const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "admin") {
  alert("Access denied. Admins only.");
  window.location.href = "login.html";
}

const headers = {
  "Authorization": `Bearer ${token}`,
  "Content-Type": "application/json",
};

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}


// Load items from /admin/items
async function loadItems() {
  const content = document.getElementById("content");
  content.innerHTML = `
    <h2 class="text-2xl font-bold text-purple-700 mb-6">All Items</h2>
    <p class="text-gray-500">Loading items...</p>
  `;

  try {
    const res = await fetch("http://127.0.0.1:8000/admin/items", { headers });
    const data = await res.json();

    if (!res.ok) throw new Error(data.detail || "Failed to load items");

    if (data.results.length === 0) {
      content.innerHTML = `<p class="text-center text-gray-500">No items found.</p>`;
      return;
    }

    content.innerHTML = `<h2 class="text-2xl font-bold text-purple-700 mb-6">All Items</h2>`;

    data.results.forEach(item => {
      const div = document.createElement("div");
      div.className = "bg-white p-6 rounded-xl shadow-md mb-4";

      div.innerHTML = `
        <h3 class="font-bold text-lg mb-1">${item.title}</h3>
        <p>${item.description || "No description"}</p>
        <p><strong>Status:</strong> ${item.status}</p>
        <p><strong>Location:</strong> ${item.location}</p>
        <p><strong>Claimed:</strong> ${item.is_claimed ? "Yes" : "No"}</p>
        <img src="http://127.0.0.1:8000/${item.image_path?.replace(/\\/g, "/")}" class="w-48 mt-3 rounded" onerror="this.style.display='none'" />
        <button onclick="deleteItem('${item.id}')" class="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded">Delete</button>
      `;

      content.appendChild(div);
    });
  } catch (err) {
    console.error("Item load error:", err);
    content.innerHTML = `<p class="text-red-500">Error loading items.</p>`;
  }
}

// Delete item
async function deleteItem(itemId) {
  if (!confirm("Are you sure you want to delete this item?")) return;

  try {
    const res = await fetch(`http://127.0.0.1:8000/items/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (res.ok) {
      alert("Item deleted.");
      loadItems();
    } else {
      alert("Delete failed: " + (data.detail || "Unknown error"));
    }
  } catch (err) {
    console.error("Delete error:", err);
    alert("Error deleting item.");
  }
}

// Load claims from /admin/claims
async function loadClaims() {
  const content = document.getElementById("content");
  content.innerHTML = `
    <h2 class="text-2xl font-bold text-purple-700 mb-6">Pending Claims</h2>
    <p class="text-gray-500">Loading claims...</p>
  `;

  try {
    const res = await fetch("http://127.0.0.1:8000/admin/claims", { headers });
    const data = await res.json();

    if (!res.ok) throw new Error(data.detail || "Failed to load claims");

    const claims = data.claims;

    if (claims.length === 0) {
      content.innerHTML += `<p class="text-center text-gray-500">No pending claims.</p>`;
      return;
    }

    content.innerHTML = `<h2 class="text-2xl font-bold text-purple-700 mb-6">Pending Claims</h2>`;

    claims.forEach(claim => {
      const div = document.createElement("div");
      div.className = "bg-white p-6 rounded-xl shadow-md mb-4";

      div.innerHTML = `
        <p><strong>User:</strong> ${claim.user.name} (${claim.user.email})</p>
        <p><strong>Item:</strong> ${claim.item.title}</p>
        <img src="http://127.0.0.1:8000/${claim.item.image_path?.replace(/\\/g, "/")}" class="w-40 mt-2 mb-2 rounded" onerror="this.style.display='none'" />

        <p><strong>Status:</strong> ${claim.status}</p>
        <div class="mt-3 space-x-3">
  ${
    claim.status === "pending"
      ? `
        <button onclick="approveClaim('${claim.claim_id}')" class="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded">Approve</button>
        <button onclick="rejectClaim('${claim.claim_id}')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded">Reject</button>
      `
      : `<span class="font-semibold ${claim.status === 'approved' ? 'text-green-600' : 'text-red-600'}">
          ${claim.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
        </span>`
  }
</div>

      `;

      content.appendChild(div);
    });
  } catch (err) {
    console.error("Claim load error:", err);
    content.innerHTML = `<p class="text-red-500">Error loading claims.</p>`;
  }
}

// Approve claim
async function approveClaim(claimId) {
  try {
    const res = await fetch(`http://127.0.0.1:8000/admin/claims/${claimId}?status=approved`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (res.ok) {
     
      loadClaims();
    } else {
      
    }
  } catch (err) {
    console.error("Approve error:", err);
    
  }
}

// Reject claim
async function rejectClaim(claimId) {
  try {
    const res = await fetch(`http://127.0.0.1:8000/admin/claims/${claimId}?status=rejected`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (res.ok) {
      
      loadClaims();
    } else {
      
    }
  } catch (err) {
    console.error("Reject error:", err);
    
  }
}
