# Guestbook Backend

This is the backend service for the Guestbook application. It is built using Node.js with Express and Socket.io for real-time communication, and MongoDB for storing messages.

## Features

- **Real-Time Messaging**: Users can post messages, which are instantly broadcast to all connected clients.
- **Persistent Storage**: Messages are stored in a MongoDB database.
- **Initial Messages**: On connection, clients receive the latest messages from the database.

## Technologies

- **Node.js**: JavaScript runtime for server-side logic.
- **Express**: Web framework for Node.js to handle API requests.
- **Socket.io**: Library for real-time communication between clients and server.
- **MongoDB**: NoSQL database for storing guestbook messages.

## Setup

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop)
- [Node.js](https://nodejs.org/) (if not using Docker)

### Installation

1. **Clone the Repository**

   ```sh
   git clone <your-repo-url>
   cd backend
   ```

2. **Using Docker**

   Build and run the Docker container:

   ```sh
   docker build -t guestbook-backend .
   docker run -p 3000:3000 guestbook-backend
   ```

3. **Without Docker**

   Install Dependencies:

   ```sh
   npm install
   ```

   Start the server:

   ```sh
   npm start
   ```

### Configuration

- **MongoDB Connection**: The application connects to a MongoDB instance running locally on port 27017. Modify the `mongoose.connect` URL in `server.js` if using a different database or connection method.

### API Endpoints

- **POST /api/messages**
  - **Description**: Submits a new message to the guestbook.
  - **Request Body:**
    ```json
    {
      "name": "User Name",
      "message": "Message content"
    }
    ```
  - **Response**
    - **`200 OK`** on success
    - **`500 Internal Server Error`** on failure

### Real-Time Communication

- **Socket.io Events**:
  - `message`: Emits when a new message is posted.
  - `initialMessages`: Sent to new clients upon connection with the most recent messages.

### Deployment

- **Dockerfile**: Used to build the Docker image for the backend service.
- **Ports**: Exposes port 3000, which should be mapped to a host port for external access.

### Security

- **Helmet.js**: Ensure to add `helmet` middleware for additional security (optional but recommended).
- **Input Validation**: Use `express-validator` to sanitize and validate incoming data (optional but recommended).

### Testing

- **Unit and Integration Tests**: Tests should be written to cover the API and real-time features. Consider using tools like Jest and Cypress.

## Contributing

Feel free to open issues or submit pull requests to improve the backend service.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Express](https://expressjs.com/)
- [Socket.io](https://socket.io/)
- [Mongoose](https://mongoosejs.com/)
- [MongoDB](https://www.mongodb.com/)
