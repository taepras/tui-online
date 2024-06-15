<script>
  import io from "socket.io-client";

  let socket;
  let message = "";
  let messages = [];

  socket = io("http://localhost:3000"); // Adjust if your server is on a different address

  socket.on("message", function (msg) {
    messages = [...messages, msg];
  });

  function sendMessage() {
    if (message.trim()) {
      socket.emit("message", message);
      message = ""; // clear input after sending
    }
  }
</script>

<div>
  <ul>
    {#each messages as msg}
      <li>{msg}</li>
    {/each}
  </ul>
  <input
    type="text"
    bind:value={message}
    on:keyup={(event) => event.key === "Enter" && sendMessage()}
  />
  <button on:click={sendMessage}>Send</button>
</div>

<style>
  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    margin-bottom: 10px;
    background-color: #f3f4f6;
    padding: 10px;
    border-radius: 8px;
  }

  input,
  button {
    margin-top: 20px;
    padding: 10px;
    width: 200px;
  }

  button {
    cursor: pointer;
  }
</style>
