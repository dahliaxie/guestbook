# Guestbook Frontend

## Overview

This project is the frontend for a real-time guestbook application. Users can submit messages that are displayed to all visitors in real-time. The frontend is built using HTML, CSS, and JavaScript, with real-time updates facilitated by WebSockets through Socket.io.

## Technologies Used

- **HTML**: Structure of the guestbook page.
- **CSS**: Styling of the page.
- **JavaScript**: Handles user interactions and real-time updates.
- **Socket.io**: Provides real-time communication between the client and server.
- **Nginx**: Serves the static files.

## File Structure

- `Dockerfile`: Docker configuration file for building the frontend image.
- `index.html`: The main HTML file for the guestbook page.
- `script.js`: JavaScript file handling real-time updates and user interactions.
- `styles.css`: CSS file for styling the guestbook page.

## Setting Up

### Docker Setup

1. **Build the Docker Image**

   Run the following command to build the Docker image:
   ```sh
   docker build -t guestbook-frontend .
   ```

2. **Run the Docker Container**

   Start a container from the built image:
   ```sh
   docker run -p 80:80 guestbook-frontend
   ```

   The application will be accessible at `http://localhost` on your web browser.

### Local Development

1. **Clone the Repository**

   ```sh
   git clone <repository-url>
   cd <repository-folder>/frontend
   ```

2. **Serve Locally**

   Use a static file server like `http-server` or any other tool to serve `index.html`:
   ```sh
   npx http-server
   ```

   The application will be accessible at `http://localhost:8080` by default.

## Usage

1. **Open the Guestbook**

   Visit `http://localhost` in your web browser.

2. **Submit a Message**

   Click the "Write a Message" button to open the popup form. Enter your name and message, then click "Submit" to post it.

3. **View Messages**

   Messages will be displayed in real-time on the guestbook page.

## Real-Time Features

- **Message Display**: Messages are randomly positioned and animated on the page. They appear with a fade-in and slide-in effect.
- **Popup Form**: Users can write and submit messages via a popup form.

## Deployment

The frontend is deployed using Nginx. The Dockerfile provided is used to create a Docker image that serves the static files.

## Troubleshooting

- **Messages Not Displaying**: Ensure that the backend WebSocket server is running and properly configured to emit messages.
- **Popup Issues**: Check the JavaScript console for errors related to DOM manipulation or event handling.

## Contributing

Feel free to contribute by submitting issues or pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Socket.io**: For providing real-time communication capabilities.
- **Nginx**: For serving static files efficiently.

---

For any further questions or issues, please contact [your-email@example.com].
