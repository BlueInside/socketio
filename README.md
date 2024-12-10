# Realtime Chat Application with Socket.IO

A simple real-time chat application that leverages **WebSockets** and **Socket.IO** to provide features like global chat, private messaging, and typing indicators. This project serves as an educational example to understand the fundamentals of WebSockets, the Socket.IO library, and how to implement common real-time communication patterns.

## Features

- **Global Chat**: Users can send messages to everyone connected.
- **Private Messaging (PM)**: Users can select another user and open a dedicated PM window to exchange messages privately.
- **Typing Indicators**: Real-time "user is typing..." notifications let others know when someone is currently composing a message.
- **User Presence**: An online users list displays who is connected, enabling quick selection for private chats.
- **Simple UI/UX**: A clean interface built with HTML, CSS, and client-side JavaScript. No frameworks required.

## Getting Started

### Prerequisites

- **Node.js** and **npm** (or **yarn**)
- Basic knowledge of JavaScript and Node.js
- Understanding of WebSockets and how Socket.IO works (helpful but not required)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/realtime-chat-socketio.git
   cd realtime-chat-socketio
   ```
2. **Install dependecies**:
    ```bash
    npm install
    ```
3. ***Start the server***
    ```bash
      node index.js
    ```
4. ***Open the client***
   ```bash
    http://localhost:3000. You should see the chat interface load.
    ```

## How It Works

### Architecture

- **Server**: A Node.js + Express server with Socket.IO attached.  
  - Handles user connections and disconnections.
  - Maintains a map of online users (socket IDs to usernames).
  - Broadcasts updated user lists on changes.
  - Manages events like:
    - `userConnected` & `disconnect` for updating the user list.
    - `chat message` for global messages.
    - `privateMessage` for sending direct messages.
    - `typing` & `stop typing` for typing indicators.

- **Client**: Plain HTML, CSS, and JavaScript.  
  - Connects to the server via the Socket.IO client.
  - Emits events on user actions (e.g., sending messages, selecting a user for PM).
  - Updates the DOM in real-time based on received events (new messages, typing indicators, updated user list).

### Main Concepts

1. **Global Chat**:  
   - Users can send messages to everyone connected.
   - The client emits `chat message` events.
   - The server broadcasts these messages to all connected clients.
   - The client appends incoming messages to the global message list in real-time.

2. **Private Messaging**:  
   - Clicking a username from the online users list opens a dedicated PM window.
   - The client emits a `privateMessage` event with `recipientId` and `message`.
   - The server forwards this event to the specified recipient only.
   - Recipients receive a `privateMessage` event and can append it to their PM window.
   - Unread message counts can be tracked on the client side by incrementing counts when PM windows aren’t visible, and resetting them when the window is opened.

3. **Typing Indicators**:  
   - As a user types, the client emits `typing` events after a short debounce to prevent spam.
   - If the user stops typing, a `stop typing` event is emitted.
   - The server broadcasts these indicators to all other clients so they can display "User is typing..." messages.
   - Indicators vanish after a short timeout or when a message is sent.

4. **Online User List**:  
   - When a user connects (or changes their username), the client emits `userConnected` or `username change`.
   - The server updates its user map and broadcasts `updateUsers` events with the full user list.
   - The client updates the displayed list of online users.
   - Selecting a user from this list opens a private chat window with them.

### File Structure

- **`server.js`**: Main server file.  
  - Sets up Express and Socket.IO.
  - Handles socket events.
- **`public/`**: Static frontend assets.
  - **`index.html`**: Main HTML document.
  - **`styles.css`**: CSS for styling the chat UI and PM windows.
  - **`client.js`**: Client-side JavaScript for handling socket events, UI updates, and user interactions.

### Customization

- **Styling**:  
  Modify `styles.css` to change colors, layout, and overall look.  
- **Persistence**:  
  Currently, messages and online states are ephemeral. Consider adding a database to store message history or user sessions.
- **Authentication**:  
  Add user login logic to maintain persistent usernames and support authenticated sessions.
- **Scalability**:  
  For larger user bases or high traffic, use Socket.IO’s clustering or a load balancer, and consider adding Redis for message brokering.

### Learning Goals

- **WebSockets**:  
  Understand how WebSockets provide continuous two-way communication between client and server.
- **Socket.IO**:  
  Learn how Socket.IO simplifies event handling, provides automatic reconnections, and offers rooms/channels.
- **Real-Time UI Updates**:  
  Experience building a UI that updates instantly as events occur without page reloads.
- **Pattern Implementation**:  
  Implement common real-time chat features like global messages, private chats, typing indicators, and online user tracking.

### Contributing

Contributions, suggestions, and improvements are welcome. Please open issues or submit pull requests to help enhance the project's code quality, features, or documentation.

### License

This project is licensed under the MIT License—see the [LICENSE](https://opensource.org/license/mit) file for details.
