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
  let isGameStarted = false;
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
  let playersInfo = [];

  let currentUrl = "";
  let isRoomFull = false;

  onMount(() => {
    currentUrl = window.location.href;

    // Connect to the Socket.io server
    socket = io("http://localhost:3000");

    if (roomId) {
      // Join the specified room
      socket.emit("joinRoom", roomId, (player, _playersInfo) => {
        if (player === false) {
          isRoomFull = true;
        }
        gameState = player;
        playersInfo = _playersInfo;
      });

      socket.on("playerJoined", (_playersInfo) => {
        playersInfo = _playersInfo;
      });

      // Error handling for socket connection
      socket.on("connect_error", (err) => {
        console.log(`Connection Error: ${err.message}`);
      });

      socket.on("startGame", (_gameState) => {
        console.log("startGame");
        gameState = _gameState;
        myPlayerState = _gameState;
        isGameStarted = true;
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
      validSet.every((validPiece) => piecesToPlay.includes(validPiece)),
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

<!-- <div class="hand">
  {#each myPlayerState.hand as piece, index}
    <GamePiece
      pieceType={piece}
      onToggleSelected={(_) => onPieceToggle(index)}
      isSelected={piecesToPlayIndexes.includes(index)}
    />
  {/each}
</div> -->
<pre>้
  playing: {JSON.stringify(piecesToPlay)}
  isvalid: {isValidPlay}
  turnType: {JSON.stringify(turnType)}
</pre>

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

<div class="hand me">
  {#if isValidPlay}
    <button on:click={playPieces}>submit piece</button>
  {:else if piecesToPlay.length > 0}
    <div>invalid move</div>
  {:else}
    <div>select pieces to play</div>
  {/if}
  <div class="pieces-in-hand">
    {#each myPlayerState.hand as piece, index}
      <GamePiece
        pieceType={piece}
        onToggleSelected={(_) => onPieceToggle(index)}
        isSelected={piecesToPlayIndexes.includes(index)}
      />
    {/each}
  </div>
</div>

<div class="hand left">
  <div class="pieces-in-hand">
    {#each myPlayerState.hand as piece, index}
      <GamePiece pieceType={0} />
    {/each}
  </div>
</div>
<div class="hand right">
  <div class="pieces-in-hand">
    {#each myPlayerState.hand as piece, index}
      <GamePiece pieceType={0} />
    {/each}
  </div>
</div>
<div class="hand top">
  <div class="pieces-in-hand">
    {#each myPlayerState.hand as piece, index}
      <GamePiece pieceType={0} />
    {/each}
  </div>
</div>

{#if !isGameStarted}
  <div class="waiting-room">
    {currentUrl}
    {#if !isRoomFull}
      <button on:click={start}>Start Game</button>
    {:else}
      <div>Room full</div>
    {/if}
    <hr />
    Players in this room:
    <div class="players-container">
      {#each playersInfo as playerInfo}
        <div class="player-display">{playerInfo}</div>
      {/each}
    </div>
  </div>
{/if}

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

  .hand {
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
  }
  .pieces-in-hand {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 4px;
  }

  .hand.me {
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
  }

  .hand.top {
    top: 0;
    left: 50%;
    transform-origin: 50% 33%;
    transform: rotate(180deg) translateX(50%) scale(0.5);
  }

  .hand.left {
    left: 0;
    top: 60px;
    transform-origin: 0 100%;
    transform: rotate(90deg) scale(0.5);
  }

  .hand.right {
    right: 0;
    top: 60px;
    transform-origin: 100% 100%;
    transform: rotate(-90deg) scale(0.5);
  }

  .waiting-room {
    position: fixed;
    z-index: 999;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #fff;
  }

  .players-container {
    display: flex;
    gap: 4px;
  }

  .player-display {
    width: 48px;
    height: 48px;
    background-color: #ddd;
    border-radius: 999px;
    overflow: hidden;
    font-size: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
