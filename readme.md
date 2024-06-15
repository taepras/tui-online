# TUI Online

Tui Online is a web-based Tui game developed with Svelte and Node.js, utilizing Socket.IO for real-time communication.

## Prerequisites

To run this project, you need to have the following installed on your machine:
- Node.js
- npm

## Getting Started

Follow these steps to get a local copy up and running for development and testing purposes.

### Installation

1. **Clone the Repository**

   Clone the repository to your local machine:

   ```bash
   git clone https://github.com/taepras/tui-online.git
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

   (or use `nodemon` for hot-reloading; install via `npm install nodemon -g`)

   This command starts the backend server on `http://localhost:3000`.

2. **Start the Svelte Development Server**

   Inside the `client` directory:

   ```bash
   npm run dev -- --open
   ```

   This will launch the frontend development server, typically accessible at `http://localhost:5173`. The server automatically proxies API requests to the backend on `http://localhost:3000`.

### Usage

Open a browser and visit `http://localhost:8080` to start using TUI Online. Enter text commands or messages into the interface, and observe real-time interactions and updates across all active sessions.

## Technologies Used

- [Svelte](https://svelte.dev/) - Frontend framework.
- [Node.js](https://nodejs.org/) - Backend runtime environment.
- [Express](https://expressjs.com/) - Backend web application framework.
- [Socket.IO](https://socket.io/) - Facilitates real-time, bidirectional, and event-based communication.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
