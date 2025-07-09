document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("items-container");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("user_id");

    if (!token) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    loadItems();

    const statusFilter = document.getElementById("statusFilter");
    statusFilter?.addEventListener("change", () => {
        const keyword = document.getElementById("searchBar")?.value || "";
        loadItems(statusFilter.value, keyword);
    });

    const searchBar = document.getElementById("searchBar");
    searchBar?.addEventListener("input", debounce((e) => {
        const keyword = e.target.value;
        const status = statusFilter?.value || "";
        loadItems(status, keyword);
    }, 300));

    document.getElementById("uploadForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        try {
            const res = await fetch("http://127.0.0.1:8000/items/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                alert("Item uploaded successfully!");
                location.reload();
            } else {
                alert(data.detail || "Upload failed.");
            }
        } catch (err) {
            console.error("Error uploading:", err);
            alert("Something went wrong during upload.");
        }
    });

async function loadItems(status = "", keyword = "") {
        container.innerHTML = "<p class='text-center'>Loading items...</p>";

        try {
            let itemsUrl = "http://127.0.0.1:8000/items/items";
            const params = new URLSearchParams();
            if (status) params.append("status", status);
            if (keyword) params.append("keyword", keyword);
            if (params.toString()) itemsUrl += `?${params.toString()}`;

            const [itemsRes, claimsRes] = await Promise.all([
                fetch(itemsUrl, { headers: { Authorization: `Bearer ${token}` } }),
                fetch("http://127.0.0.1:8000/items/user/claims", {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const itemsData = await itemsRes.json();
            const claimsData = await claimsRes.json();

            const claims = claimsData.claims;

            container.innerHTML = "";

            if (!itemsData.results || itemsData.results.length === 0) {
                container.innerHTML = "<p class='text-center'>No items found.</p>";
                return;
            }

            itemsData.results.forEach(item => {
                const card = document.createElement("div");
                card.className = "card m-2";
                card.style.width = "18rem";

                const img = document.createElement("img");
                img.src = `http://127.0.0.1:8000/${item.image_path.replace(/\\/g, "/")}`;
                img.alt = item.title;
                img.className = "card-img-top";
                card.appendChild(img);

                const body = document.createElement("div");
                body.className = "card-body";
                body.innerHTML = `
                    <h5 class="card-title">${item.title}</h5>
                    <p class="card-text">${item.description || ""}</p>
                    <p><strong>Location:</strong> ${item.location}</p>
                    <p><strong>Status:</strong> ${item.status}</p>
                    <p><strong>Claimed:</strong> ${item.is_claimed ? "Yes" : "No"}</p>
                `;

                const claim = claims.find(c => c.item_id === item.id);
                if (!item.is_claimed && role !== "admin") {
                    let claimStatusButton = "";

                    if (claim) {
                        if (claim.status === "pending") {
                            claimStatusButton = `<button disabled class="mt-2 bg-yellow-400 text-white font-semibold py-1.5 px-4 rounded shadow">Requested</button>`;
                        } else if (claim.status === "approved") {
                            claimStatusButton = `<span class="mt-2 inline-block text-green-600 font-semibold">✅ Approved</span>`;
                        } else if (claim.status === "rejected") {
                            claimStatusButton = `<span class="mt-2 inline-block text-red-500 font-semibold">❌ Rejected</span>`;
                        }
                    } else {
                        claimStatusButton = `<button onclick="claimItem('${item.id}')" class="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-4 rounded shadow">Claim</button>`;
                    }

                    const claimWrap = document.createElement("div");
                    claimWrap.innerHTML = claimStatusButton;
                    body.appendChild(claimWrap);
                }

                if (role === "admin") {
                    const deleteBtn = document.createElement("button");
                    deleteBtn.textContent = "Delete";
                    deleteBtn.className = "btn btn-danger ms-2";
                    deleteBtn.onclick = () => deleteItem(item.id);
                    body.appendChild(deleteBtn);
                }

                card.appendChild(body);
                container.appendChild(card);
            });
        } catch (err) {
            console.error("Failed to fetch items:", err);
            container.innerHTML = "<p class='text-danger'>Failed to load items.</p>";
        }
    }

    async function claimItem(itemId) {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://127.0.0.1:8000/items/claim/${itemId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            const result = await res.json();
            if (res.ok) {
                alert("Item claimed successfully!");
                loadItems();
            } else {
                alert(result.detail || "Failed to claim item");
            }
        } catch (err) {
            console.error("Claim error:", err);
            alert("Error while claiming item.");
        }
    }

    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
});

window.claimItem = async function (itemId) {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`http://127.0.0.1:8000/items/claim/${itemId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await res.json();

    if (res.ok) {
      alert("✅ Claim request submitted.");
      location.reload();  // Or re-run loadItems()
    } else {
      alert(result.detail || "❌ Failed to claim item.");
    }
  } catch (err) {
    console.error("Claim error:", err);
    alert("Error while claiming item.");
  }
};

function openUploadForm(type) {
    document.getElementById("status").value = type.toLowerCase();
    document.getElementById("uploadModalLabel").innerText = `📤 Add ${type} Item`;
    document.getElementById("uploadModalOverlay").classList.remove("hidden");
}
