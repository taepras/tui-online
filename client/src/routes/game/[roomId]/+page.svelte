<script>
  import { onMount, onDestroy } from "svelte";
  import io from "socket.io-client";
  import { page } from "$app/stores";

  let roomId;
  $: roomId = $page.params.roomId; // Reactive assignment

  let socket;
  let gameState;
  let message = "";
  let messages = [];

  onMount(() => {
    // Connect to the Socket.io server
    socket = io("http://localhost:3000");

    if (roomId) {
      // Join the specified room
      socket.emit("joinRoom", roomId, (player) => {
        gameState = player;
      });

      // Listening for messages from the server
      socket.on("message", (msg) => {
        messages = [...messages, msg]; // Ensuring reactivity
      });

      // Error handling for socket connection
      socket.on("connect_error", (err) => {
        console.log(`Connection Error: ${err.message}`);
      });

      socket.on("startGame", (_gameState) => {
        console.log("startGame");
        gameState = _gameState;
      });
    }

    window.addEventListener('beforeunload', leaveRoom);

    return () => {
      window.removeEventListener('beforeunload', leaveRoom);
      leaveRoom();
    };
  });

  function leaveRoom () {
    if (socket) {
      socket.emit("leaveRoom", roomId); // Notify the server the user is leaving
      socket.disconnect();
    }
  }

  onDestroy(() => {
    leaveRoom();
  });

  function start() {
    socket.emit("startGame", { roomId });
  }
</script>

<!-- <div class="chat">
  <div class="messages">
    {#each messages as msg}
      <p>{msg}</p>
    {/each}
  </div>
  <input
    type="text"
    bind:value={message}
    on:keydown={(e) => e.key === "Enter" && sendMessage()}
  />
  <button on:click={sendMessage}>Send</button>
</div> -->

<button on:click={start}>Start Game</button>
<pre>{JSON.stringify(gameState, null, 2)}</pre>

<style>
  .chat {
    display: flex;
    flex-direction: column;
  }
  .messages {
    flex-grow: 1;
    overflow-y: auto;
  }
  input,
  button {
    margin-top: 10px;
  }
</style>
