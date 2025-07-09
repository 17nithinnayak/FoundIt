# 🧭 FoundIt – Campus Lost & Found Portal

**FoundIt** is a full-stack Lost & Found platform built for college campuses to help students and administrators easily manage lost and found items. It provides a seamless workflow to upload, search, and claim items with admin verification and status tracking.

> 💡 A Software Engineering project developed using **FastAPI**, **MongoDB**, and **Vanilla JS**.

---

## 🎯 Purpose

Every campus faces a daily problem: students misplacing their belongings and others finding them. This platform:

- Helps students upload **found** items with photos and locations
- Enables users to search for and **claim** lost items
- Allows admins to verify and **approve/reject** claims
- Creates a centralized, transparent system for item tracking

---

## 🔧 Features

### 👥 Users
- 🔐 Register & Login
- 📥 Upload found items
- 🔍 Search & filter items by keyword or status
- ✅ Claim lost items with one click
- ⏳ Track claim status: `Pending`, `Approved`, or `Rejected`

### 🛡️ Admins
- 🧾 View all reported items
- 🗂 View all claims with user & item details
- ✅ Accept or ❌ reject claims
- 🧹 Delete items if needed

---

## 🚀 Tech Stack

| Layer      | Technology          |
|------------|---------------------|
| Backend    | FastAPI (Python)    |
| Database   | MongoDB Atlas       |
| Frontend   | HTML, CSS, JS       |
| Styling    | Tailwind CSS        |
| Auth       | JWT (Bearer tokens) |

---

---

## 🖥️ Local Installation Guide (for Windows)

> These steps also work on another laptop for deployment.

### 1. ✅ Clone the repository

```bash
git clone https://github.com/17nithinnayak/foundit.git
cd foundit

pip install -r requirements.txt
#replace this
client = AsyncIOMotorClient("YOUR_MONGODB_URI")
db = client["foundit"]

#set up venv
python -m venv venv
venv\Scripts\activate

#start server
uvicorn backend.main:app --reload




