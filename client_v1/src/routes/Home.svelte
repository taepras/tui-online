<script>
  import { navigate } from 'svelte-routing';
  import { v4 as uuidv4 } from 'uuid'; // Install uuid to generate game IDs

  function createGameRoom() {
    const gameId = uuidv4();
    navigate(`/game/${gameId}`);
  }
</script>

<button on:click={createGameRoom}>Create Game Room</button>
