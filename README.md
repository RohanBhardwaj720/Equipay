# Equipay 💰🧳

## Introduction 🌟

Equipay is a financial management web application designed to simplify the process of managing and splitting expenses among trip participants. It serves as a personal travel log, enabling users to track past and upcoming trips while efficiently handling shared expenses.

## Key Features 🔑

- 🗺️ **Trip Creation**: Organize travel plans and associated members
- 💸 **Transaction Tracking**: Log expenses incurred by trip participants
- 🤝 **Smart Cost Splitting**: Automatically calculate owed amounts
- 🔄 **Easy Settlements**: Facilitate direct payments between members
- 🖥️ **User-Friendly Interface**: Intuitive design for seamless usage
- 📱 **UPI Payments**: (Upcoming) Direct UPI transaction integration
- 📊 **Budget Management**: Set and monitor trip budgets
- 📅 **Travel History**: Maintain a log of past and future trips

## Tech Stack 🛠️

- 🐘 **PostgreSQL**: Database for data storage
- 🚂 **Express.js**: Web application framework
- ⚛️ **React**: Frontend library
- 🟢 **Node.js**: Backend runtime

## Deployment 🚀

Visit Equipay at: [https://equipay-eight.vercel.app/](https://equipay-eight.vercel.app/)

## Getting Started 🏁

### Prerequisites

- Node.js
- npm
- PostgreSQL database

### Installation

1. Clone the repository
2. Navigate to the project root directory
3. Install dependencies:

```
npm install
```

4. Set up environment variables:
   - Copy the `.env.template` file in the `backend` directory and rename it to `.env`
   - Fill in the following variables in the `.env` file:
     ```
     POSTGRES_URL=""
     PORT=
     HOST=
     ```
   Replace the empty values with your specific configuration details.
5. Run database migrations (script in `database.mjs`)
6. Start the application:

```
npm start
```
## Project Structure 📁

- `backend/`: Express.js server and API routes
- `frontend/`: React application
- `database.mjs`: Database connections and migrations

## Scripts 📜

- `npm run install`: Install dependencies for both backend and frontend
- `npm run start`:backend: Start the backend server
- `npm run start`:frontend: Start the frontend development server
- `npm start`: Run both backend and frontend concurrently

## Contributing 🤝

Contributions are welcome! Feel free to submit a Pull Request.

## Contact 📧

For queries or suggestions, please reach out to me:

Email: rohanbhardwaj720@gmail.com

---

Happy traveling and easy expense splitting with Equipay! 🌍✈️