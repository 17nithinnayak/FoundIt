const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://127.0.0.1:8000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                username,
                password,
            }),
        });

        if (!response.ok) {
            throw new Error("Login failed");
        }

        const data = await response.json();
        const token = data.access_token;
        localStorage.setItem("token", token);

        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log(payload);
        localStorage.setItem("role", payload.role);


        if (payload.role === "admin") {
            window.location.href = "admin_dashboard.html";
        } else {
            window.location.href = "dashboard.html";
        }
    } catch (err) {
        alert("Invalid credentials");
        console.error(err);
    }
});
