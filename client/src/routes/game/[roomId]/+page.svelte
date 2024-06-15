<script>
  import { onMount, onDestroy, tick } from "svelte";
  import io from "socket.io-client";
  import { page } from "$app/stores";
  import GamePiece from "../../../lib/components/GamePiece.svelte";
  import GamePieceStack from "../../../lib/components/GamePieceStack.svelte";

  let roomId;
  $: roomId = $page.params.roomId; // Reactive assignment

  let socket;
  let gameState;
  let turnType = null;
  let turnResult = null;

  let eventLog = [];

  let myPlayerState = {
    playerId: null,
    socketId: null,
    goal: 3,
    hand: [],
    wins: [],
  };

  let piecesToPlayIndexes = [];
  $: piecesToPlay = (() => {
    let pieces = piecesToPlayIndexes.map((idx) => myPlayerState.hand[idx]);
    pieces.sort((a, b) => a - b);
    return pieces;
  })();

  let isSubmitted = false;

  onMount(() => {
    // Connect to the Socket.io server
    socket = io("http://localhost:3000");

    if (roomId) {
      // Join the specified room
      socket.emit("joinRoom", roomId, (player) => {
        gameState = player;
      });

      // Error handling for socket connection
      socket.on("connect_error", (err) => {
        console.log(`Connection Error: ${err.message}`);
      });

      socket.on("startGame", (_gameState) => {
        console.log("startGame");
        gameState = _gameState;
        myPlayerState = _gameState;
      });

      socket.on("play", (playInfo) => {
        turnResult = null;
        console.log("player played", playInfo);
        turnType = playInfo.turnType;
        eventLog = [...eventLog, `player ${playInfo.playerId} played.`];
      });

      socket.on("turnComplete", (result) => {
        console.log("turnComplete", result);
        turnResult = result;
      });

      socket.on("turnAftermath", (result) => {
        console.log("turnAftermath", result);
        myPlayerState = result;
        piecesToPlayIndexes = [];
        isSubmitted = false;
        // turnResult = result;
      });
    }

    window.addEventListener("beforeunload", leaveRoom);

    return () => {
      window.removeEventListener("beforeunload", leaveRoom);
      leaveRoom();
    };
  });

  function leaveRoom() {
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

  async function onPieceToggle(pieceIndex) {
    console.log("[onPieceToggle]", pieceIndex);
    console.log(piecesToPlay);
    var index = piecesToPlayIndexes.indexOf(pieceIndex);
    if (index > -1) {
      piecesToPlayIndexes.splice(index, 1);
    } else {
      piecesToPlayIndexes.push(pieceIndex);
    }
    await tick();
    console.log(piecesToPlayIndexes, piecesToPlay);
    piecesToPlayIndexes = [...piecesToPlayIndexes];
    // piecesToPlay.sort((a, b) => a - b);
    // piecesToPlay = [...piecesToPlay]; // trigger update
  }

  function checkValidPlay(piecesToPlay) {
    if (piecesToPlay.length == 0) return false;
    else if (piecesToPlay.length == 1) return true;
    else if (piecesToPlay.length == 2)
      return piecesToPlay[0] == piecesToPlay[1];

    let isValid = false;
    isValid = isValid || piecesToPlay.every((p) => p == 13); // red sa juk
    isValid = isValid || piecesToPlay.every((p) => p == 14); // black sa juk
    isValid = isValid || checkValidHuPlay(piecesToPlay);
    return isValid;
  }

  function checkValidHuPlay(piecesToPlay) {
    if (piecesToPlay.length < 3) return false;

    const validSets = [
      [1, 3, 5],
      [2, 4, 6],
      [7, 9, 11],
      [8, 10, 12],
    ];
    return validSets.some((validSet) =>
      validSet.every((validPiece) => piecesToPlay.includes(validPiece))
    );
  }

  $: isValidPlay = checkValidPlay(piecesToPlay);

  function playPieces() {
    // if (!isValidPlay) {
    // alert("invalid play!");
    // return;
    // }
    socket.emit("play", { roomId, piecesToPlay }, (isOk) => {
      if (isOk) isSubmitted = true;
      console.log("response", isOk);
    });
  }
</script>

<button on:click={start}>Start Game</button>

<div class="hand">
  {#each myPlayerState.hand as piece, index}
    <GamePiece
      pieceType={piece}
      onToggleSelected={(_) => onPieceToggle(index)}
      isSelected={piecesToPlayIndexes.includes(index)}
    />
  {/each}
</div>
<pre>้
  playing: {JSON.stringify(piecesToPlay)}
  isvalid: {isValidPlay}
  turnType: {JSON.stringify(turnType)}
</pre>
<button on:click={playPieces}>submit piece</button>
{#if isSubmitted}
<h2>submitted</h2>
{/if}

<div class="winning-pile">
  wins: {#each myPlayerState.wins as winStack}
    <GamePieceStack pieces={winStack} />
  {/each}
</div>

{#if turnResult !== null}
  {#if turnResult.winnerId == myPlayerState.playerId + ""}
    <h1 style="color: darkgreen;">Won turn!</h1>
  {:else}
    <h1 style="color: red;">Lose turn!</h1>
  {/if}
{/if}
<h3>Game Log</h3>
{#each eventLog as log}
  <div style="margin-bottom: 0;">{log}</div>
{/each}

<h3>Player State</h3>
<pre>{JSON.stringify(gameState, null, 2)}</pre>

<style>
  :root {
    font-family: sans-serif;
  }
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
