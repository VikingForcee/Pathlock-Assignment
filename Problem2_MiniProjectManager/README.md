# Mini Project Manager  
_A Full-Stack Web Application for Managing Projects and Tasks_

## Run instructions

### 1. Backend Configuration

#### Navigate to Backend Directory (MiniPm.Api)
```bash
cd MiniPm.Api
```

#### Restore Dependencies & Run
```bash
dotnet restore
dotnet run
```
The API server will start.

### 2. Frontend Configuration 

#### Open New Terminal Window

#### Navigate to Frontend Directory (frontend)
```bash
cd frontend
```

#### Install Dependencies
```bash
npm install
```

#### Start Development Server
```bash
npm run dev
```

The frontend application will start at:
```
http://localhost:5173
```

## Images 

![Main Page](../Images/p2Image1.png)
![Tasks Added](../Images/p2Image2.png)
![Active Tasks](../Images/p2Image3.png)
![Completed Tasks](../Images/p2Image4.png)
![Completed Tasks](../Images/p2Image5.png)


## Overview

The **Mini Project Manager** is a full-stack web application built using **.NET 8 (C#)** for the backend and **React + TypeScript (Vite)** for the frontend.  
It allows users to register, log in securely using JWT authentication, and manage multiple projects — each containing multiple tasks.

This project fulfills the requirements of **Home Assignment 2 (20 Credits)** by implementing authentication, relational entities, routing, and complete CRUD functionality.

---

## 🚀 Features

### 🔐 Authentication
- User registration & login via JWT tokens  
- Only logged-in users can access their data (projects/tasks)  
- Secure password hashing  

### 📁 Projects
- Create, view, and delete projects  
- Each project includes:
  - Title (3–100 chars, required)
  - Description (optional, ≤ 500 chars)
  - Creation date (auto-generated)

### ✅ Tasks
- Each project can have multiple tasks  
- Task includes:
  - Title (required)
  - Due date (optional)
  - Completion status
  - Reference to its parent project  
- Add, update, delete, and toggle completion  

### 💻 Frontend (React + TypeScript)
- Login/Register forms  
- Dashboard with list of user projects  
- Project details page with all tasks  
- JWT stored in browser and reused for authenticated API calls  
- React Router for page navigation  

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React, TypeScript, Vite |
| **Styling** | CSS / Tailwind CSS |
| **Backend** | .NET 8, ASP.NET Core Web API |
| **Database** | SQLite (Entity Framework Core) |
| **Auth** | JSON Web Tokens (JWT) |
| **Storage** | Local SQLite file |

---

## 📂 Folder Structure

