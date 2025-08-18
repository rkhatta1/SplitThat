<div align="center">
<h1 align="center">SplitThat</h1>
<p align="center">
<strong>An intelligent bill-splitting application that uses multimodal AI to digitize, itemize, and share expenses directly to Splitwise.</strong>
<br />
<br />
</p>
<span style="margin-top: 10px; width: 4rem; margin-right: 0.5rem;"><img alt="Static Badge" src="https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=%23ffffff&logoSize=auto"></span>
<span style="margin-top: 10px; width: 4rem; margin-right: 0.5rem;"><img alt="Static Badge" src="https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=%23fff&logoSize=auto"></span>
<span style="margin-top: 10px; width: 4rem; margin-right: 0.5rem;"><img alt="Static Badge" src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=%23000000&logoSize=auto"></span>
<span style="margin-top: 10px; width: 4rem; margin-right: 0.5rem;"><img alt="Static Badge" src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=%23fff&logoSize=auto"></span>
<span style="margin-top: 10px; width: 4rem; margin-right: 0.5rem;"><img alt="Static Badge" src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=%23ffffff&logoSize=auto"></span>
<span style="margin-top: 10px; width: 4rem; margin-right: 0.5rem;"><img alt="Static Badge" src="https://img.shields.io/badge/Gemini-8E75B2?style=flat&logo=googlegemini&logoColor=%23ffffff&logoSize=auto"></span>
<span style="margin-top: 10px; width: 4rem; margin-right: 0.5rem;"><img alt="Static Badge" src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=%23fff&logoSize=auto"></span>
<span style="margin-top: 10px; width: 4rem; margin-right: 0.5rem;"><img alt="Static Badge" src="https://img.shields.io/badge/GitHub Actions-2088FF?style=flat&logo=githubactions&logoColor=%23ffffff&logoSize=auto"></span>
<!-- <span style="margin-top: 10px; width: 4rem; margin-right: 0.5rem;"><img alt="Static Badge" src="https://img.shields.io/badge/Nginx-009639?style=flat&logo=nginx&logoColor=%23ffffff&logoSize=auto"></span> -->
<!-- <span style="margin-top: 10px; width: 4rem; margin-right: 0.5rem;"><img alt="Static Badge" src="https://img.shields.io/badge/Google Cloud-4285F4?style=flat&logo=googlecloud&logoColor=%23ffffff&logoSize=auto"></span> -->
</div>

-----

## The Problem

Manually entering a long, itemized receipt into a bill-splitting app like Splitwise is tedious and error-prone. It's a common friction point that discourages accurate expense tracking, especially for large groups.

**SplitThat** solves this problem by providing a seamless, AI-powered workflow to automate the entire process. Users can simply upload a photo of a receipt, provide optional instructions, and the application will handle the rest—from parsing the items to publishing the finalized split on Splitwise.

-----

## Core Features

  * **AI-Powered Receipt Parsing**: Utilizes **Google's Gemini Pro Vision** model to accurately extract line items, taxes, and tips from receipt images or PDFs.
  * **Intelligent Item Assignment**: Leverages natural language instructions (e.g., *"Alice gets the Diet Coke; Bob gets the avocados."*) to automatically assign items to the correct participants during the initial AI processing step.
  * **Full Splitwise Integration**: Authenticates users via OAuth2 and leverages the Splitwise API to fetch friends/groups and to create or **update** expenses directly.
  * **Interactive Itemization Editor**: A user-friendly interface for assigning items to participants, adjusting prices, and calculating totals in real-time.
  * **Expense Archiving & Editing**: Users can view, edit, and re-publish past expenses, with the system intelligently updating the existing entry on Splitwise instead of creating duplicates.
  * **Secure Authentication**: Implements a secure, token-based authentication system with JWT access and refresh tokens for persistent sessions.

-----

## System Architecture & Data Flow

SplitThat is built on a modern, decoupled architecture with a React frontend and a FastAPI backend. This design ensures a clean separation of concerns and a scalable, maintainable codebase.

#### The Workflow:

1.  **Authentication**: The user logs in via a secure OAuth2 flow that connects their Splitwise account. The backend securely stores API tokens and user data (friends, groups) in a **PostgreSQL** database.
2.  **Receipt Upload & Instructions**: The user uploads a receipt image or PDF, selects participants, and provides optional natural language instructions for the split.
3.  **AI Processing**: The frontend sends the receipt and instructions to the backend. The backend's **MultimodalBillParser** service sends this data to the **Google Gemini API**, which returns a structured JSON object with all line items extracted and pre-assigned based on the user's prompt.
4.  **Editing & Splitting**: The frontend populates an interactive editor with the AI-generated data. The user can make adjustments and re-assign items. The UI dynamically recalculates each person's share as changes are made.
5.  **Publishing to Splitwise**: Once finalized, the frontend sends the complete split data to the backend. The backend communicates with the **Splitwise API** to create a new expense or update an existing one.
6.  **Archiving**: The finalized split, along with the corresponding Splitwise expense ID, is saved to the **PostgreSQL** database for future access and editing.

-----

## Tech Stack Deep Dive

| Component                 | Technology                                                                                                  | Why It Was Chosen                                                                                                                              |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend** | **Python**, **FastAPI**, **SQLAlchemy** | FastAPI provides a high-performance, modern framework for building APIs. SQLAlchemy offers a powerful ORM for robust database interactions.      |
| **Frontend** | **React**, **Vite**, **Tailwind CSS** | React's component-based architecture is ideal for building a dynamic, interactive UI. Vite provides a lightning-fast development experience. |
| **Database** | **PostgreSQL** | A reliable, open-source relational database perfect for storing structured user and expense data.                                            |
| **AI & Machine Learning** | **Google Gemini Pro Vision** | A state-of-the-art multimodal model that can understand both text and images, making it perfect for extracting structured data from receipts. |
| **Containerization** | **Docker**, **Docker Compose** | Simplifies local development and ensures a consistent, reproducible environment for both the backend and database services.                    |
| **External APIs** | **Splitwise API** | The core of the application's value proposition, enabling seamless integration with a user's existing expense-tracking ecosystem.             |

-----

## Future Enhancements

While the core functionality is robust, there are several exciting features planned for the future:

  * **Real-Time Collaboration**: Allow multiple users to join a session and edit an itemized bill together in real-time using WebSockets.
  * **CI/CD Pipeline**: Implement a full CI/CD pipeline with GitHub Actions to automate testing and deployment.
  * **Enhanced UI/UX**: Further refine the user interface and improve the overall user experience with more intuitive controls and visual feedback.
  * **Cloud Deployment**: Deploy the application to a cloud provider like GCP or AWS for public access.