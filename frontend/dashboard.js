document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("items-container");
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    // Initial load
    loadItems();

    // Filter by status
    const statusFilter = document.getElementById("statusFilter");
    statusFilter?.addEventListener("change", () => {
        const keyword = document.getElementById("searchBar")?.value || "";
        loadItems(statusFilter.value, keyword);
    });

    // Search with debounce
    const searchBar = document.getElementById("searchBar");
    searchBar?.addEventListener("input", debounce((e) => {
        const keyword = e.target.value;
        const status = statusFilter?.value || "";
        loadItems(status, keyword);
    }, 300));

    // Upload form submission
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

    // Load items
    async function loadItems(status = "", keyword = "") {
        container.innerHTML = "<p class='text-center'>Loading items...</p>";
        try {
            let url = "http://127.0.0.1:8000/items/items";
            const params = new URLSearchParams();
            if (status) params.append("status", status);
            if (keyword) params.append("keyword", keyword);
            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();
            container.innerHTML = "";

            if (!data.results || data.results.length === 0) {
                container.innerHTML = "<p class='text-center'>No items found.</p>";
                return;
            }

            data.results.forEach(item => {
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

                if (!item.is_claimed) {
                    const btn = document.createElement("button");
                    btn.textContent = "Claim";
                    btn.className = "btn btn-primary";
                    btn.onclick = () => claimItem(item.id, token);
                    body.appendChild(btn);
                }

                card.appendChild(body);
                container.appendChild(card);
            });
        } catch (err) {
            console.error("Failed to fetch items:", err);
            container.innerHTML = "<p class='text-danger'>Failed to load items.</p>";
        }
    }

    // Claim item
    async function claimItem(itemId, token) {
        try {
            const res = await fetch(`http://127.0.0.1:8000/items/claim/${itemId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const result = await res.json();
            if (res.ok) {
                alert("Item claimed successfully!");
                location.reload();
            } else {
                alert(result.detail || "Failed to claim item");
            }
        } catch (err) {
            console.error("Claim error:", err);
            alert("Error while claiming item.");
        }
    }

    // Debounce function
    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
});

// Open modal with prefilled status
function openUploadForm(type) {
    document.getElementById("status").value = type.toLowerCase();
    document.getElementById("uploadModalLabel").innerText = `Add ${type} Item`;
    const uploadModal = new bootstrap.Modal(document.getElementById("uploadModal"));
    uploadModal.show();
}
