// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.access_token);
        alert("Login successful!");
        window.location.href = "dashboard.html";
      } else {
        alert("Login failed: " + (data.detail || "Unknown error"));
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("An error occurred during login.");
    }
  });
}

// REGISTER
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("regEmail").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("regPassword").value;

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, phone, password })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful! Please login.");
        window.location.href = "login.html";
      } else {
        alert("Registration failed: " + (data.detail || "Unknown error"));
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("An error occurred during registration.");
    }
  });
}
