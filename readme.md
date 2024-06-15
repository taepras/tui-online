# TUI Online

TUI Online is a real-time text-based user interface (TUI) application developed with Svelte and Node.js, utilizing Socket.IO for real-time communication. This application allows users to interact in a text-based environment seamlessly and instantly, reflecting updates across clients without needing to refresh the browser.

## Features

- Real-time text communication.
- Lightweight TUI design for low-bandwidth environments.
- Easy to use with a simple and intuitive interface.

## Prerequisites

To run this project, you need to have the following installed on your machine:
- Node.js (v12.x or higher)
- npm (v6.x or higher)

## Getting Started

Follow these steps to get a local copy up and running for development and testing purposes.

### Installation

1. **Clone the Repository**

   Clone the repository to your local machine:

   ```bash
   git clone https://github.com/your-username/tui-online.git
   cd tui-online
   ```

2. **Install Backend Dependencies**

   Install Node.js dependencies required for the backend:

   ```bash
   npm install
   ```

3. **Install Frontend Dependencies**

   Move to the client directory and install the dependencies:

   ```bash
   cd client
   npm install
   ```

### Running the Application

1. **Start the Backend Server**

   From the project root directory:

   ```bash
   node server.js
   ```

   This command starts the backend server on `http://localhost:3000`.

2. **Start the Svelte Development Server**

   Inside the `client` directory:

   ```bash
   npm run dev
   ```

   This will launch the frontend development server, typically accessible at `http://localhost:8080`. The server automatically proxies API requests to the backend on `http://localhost:3000`.

### Usage

Open a browser and visit `http://localhost:8080` to start using TUI Online. Enter text commands or messages into the interface, and observe real-time interactions and updates across all active sessions.

## Technologies Used

- [Svelte](https://svelte.dev/) - Frontend framework.
- [Node.js](https://nodejs.org/) - Backend runtime environment.
- [Express](https://expressjs.com/) - Backend web application framework.
- [Socket.IO](https://socket.io/) - Facilitates real-time, bidirectional, and event-based communication.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
