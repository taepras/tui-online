<script>
  import { goto } from '$app/navigation';
  import { generateRoomId } from '$lib/utils';
  import socket, { joinRoom } from '$lib/socketStore';

  function createRoom() {
    const roomId = generateRoomId();
    goto(`/game/${roomId}`);
  }
</script>

<button on:click={createRoom}>Create Room</button>
