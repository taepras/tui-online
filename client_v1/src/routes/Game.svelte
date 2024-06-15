<script>
  import { onMount } from 'svelte';
  import { params } from 'svelte-routing';
  import io from 'socket.io-client';

  let gameId = $params.gameId;
  let socket, playerCount = 0;

  onMount(() => {
    socket = io('http://localhost:3000');
    socket.emit('joinGame', gameId);

    socket.on('updatePlayerCount', (count) => {
      playerCount = count;
    });
  });

  $: if (playerCount === 4) {
    // Game logic or navigation when room is full
  }
</script>

<h1>Game Room {gameId}</h1>
<p>Players connected: {playerCount}</p>
