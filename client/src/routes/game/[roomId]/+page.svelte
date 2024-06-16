<script>
  import { onMount, onDestroy, tick } from "svelte";
  import io from "socket.io-client";
  import { page } from "$app/stores";
  import GamePiece from "../../../lib/components/GamePiece.svelte";
  import GamePieceStack from "../../../lib/components/GamePieceStack.svelte";

  let roomId;
  $: roomId = $page.params.roomId; // Reactive assignment

  let socket;
  let gameState = null;
  let isGameStarted = false;
  let turnResult = null;

  let eventLog = [];

  let myPlayerId = null;
  // let myPlayerState = {
  //   playerId: null,
  //   socketId: null,
  //   goal: 3,
  //   hand: [],
  //   wins: [],
  // };

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

  let isReadyToRevealRound = false;

  $: isRoundLeader = myPlayerState?.playerId == gameState?.roundLeader;

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
        myPlayerId = player.playerId;
        // gameState = player;
        playersInfo = _playersInfo;
      });

      socket.on("playerJoined", (_playersInfo) => {
        playersInfo = _playersInfo;
      });

      // Error handling for socket connection
      socket.on("connect_error", (err) => {
        console.log(`Connection Error: ${err.message}`);
      });

      socket.on("startGame", (_gameState, _playerState) => {
        console.log("startGame");
        gameState = _gameState;
        // myPlayerState = _playerState;
        isGameStarted = true;
      });

      socket.on("roundReset", () => {
        isReadyToRevealRound = false;
      });

      socket.on("roundUpdate", (_gameState) => {
        gameState = _gameState;
        turnResult = null;
        // console.log("player played", playInfo);
        // eventLog = [...eventLog, `player ${playInfo.playerId} played.`];
      });

      socket.on("roundReadyToReveal", () => {
        console.log("ready to reveal");
        isReadyToRevealRound = true;
      });

      socket.on("roundReveal", (result) => {
        console.log("roundReveal", result);
        turnResult = result;
      });

      socket.on("roundComplete", (result) => {
        console.log("roundComplete", result);
        // myPlayerState = result;
        piecesToPlayIndexes = [];
        isSubmitted = false;
        isReadyToRevealRound = false;
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
    if (gameState === null) return false;

    if (gameState.roundState == "open_play")
      return gameState.turnType.count == piecesToPlay.length;

    if (gameState.roundState == "reveal") return false;

    if (gameState.roundState == "wait_for_leader" && !isRoundLeader)
      return false;

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
    socket.emit("roundPlay", { roomId, piecesToPlay }, (isOk) => {
      if (isOk) isSubmitted = true;
      console.log("response", isOk);
    });
  }

  function revealRound() {
    socket.emit("roundReveal", { roomId });
  }

  function completeRound() {
    socket.emit("roundComplete", { roomId });
  }

  $: myPlayerState =
    gameState !== null && gameState.players && Array.isArray(gameState.players)
      ? gameState.players[myPlayerId] ?? {}
      : {};
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
<pre>
  playerId: {myPlayerId} {myPlayerState.playerId}
  playing: {JSON.stringify(piecesToPlay)}
  isvalid: {isValidPlay}
  turnType: {JSON.stringify(gameState?.turnType)}
</pre>

{#if isSubmitted}
  <h2>submitted</h2>
{/if}

{#if gameState?.roundState === "reveal"}
  {#if gameState.roundWinner == myPlayerState.playerId + ""}
    <h1 style="color: darkgreen;">Won turn!</h1>
  {:else}
    <h1 style="color: red;">Lose turn!</h1>
  {/if}
{/if}

<!-- <h3>Game Log</h3>
{#each eventLog as log}
  <div style="margin-bottom: 0;">{log}</div>
{/each} -->

<h3>Game State</h3>
<pre>{JSON.stringify(gameState, null, 2)}</pre>

<div class="hand me">
  <div class="winning-pile">
    {#each myPlayerState?.wins ?? [] as winStack}
      <GamePieceStack pieces={winStack} />
    {/each}
  </div>
  {isRoundLeader ? "👑" : ""}
  {#if gameState?.roundState == "wait_for_leader"}
    {#if myPlayerState?.playerId == gameState?.roundLeader}
      {#if isSubmitted}
        <div>submitted</div>
      {:else if isValidPlay}
        <button on:click={playPieces}>submit piece</button>
      {:else if piecesToPlay.length > 0}
        <div>invalid move</div>
      {:else}
        <div>select pieces to play</div>
      {/if}
    {:else}
      <div>waiting for round leader...</div>
    {/if}
  {:else if gameState?.roundState == "open_play"}
    {#if isSubmitted}
      <div>submitted</div>
    {:else if isValidPlay}
      <button on:click={playPieces}>submit piece</button>
    {:else if piecesToPlay.length > 0}
      <div>invalid move</div>
    {:else}
      <div>select pieces to play</div>
    {/if}
  {/if}

  <div class="pieces-in-hand" class:submitted={isSubmitted}>
    {#each myPlayerState?.hand ?? [] as piece, index}
      <GamePiece
        pieceType={piece}
        onToggleSelected={(_) => onPieceToggle(index)}
        isSelected={piecesToPlayIndexes.includes(index)}
      />
    {/each}
  </div>
</div>

{#each Array.from({ length: gameState?.players?.length - 1 }, (_, i) => i) as i}
  <div class="hand {['left', 'top', 'right'][i]}">
    <div class="player-status">
      {gameState.roundLeader ==
      (myPlayerId + 1 + i) % (gameState?.players?.length || 1)
        ? "👑"
        : ""}
      <div class="winning-pile">
        {#each gameState?.players[(myPlayerId + 1 + i) % (gameState?.players?.length || 1)]?.wins ?? [] as winStack}
          <GamePieceStack pieces={winStack} />
        {/each}
      </div>
    </div>
    <div class="pieces-in-hand">
      {#each gameState?.players[(myPlayerId + 1 + i) % (gameState?.players?.length || 1)]?.hand ?? [] as piece, index}
        <GamePiece pieceType={piece} />
      {/each}
    </div>
  </div>
{/each}

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

{#if gameState?.roundState == "open_play" && isReadyToRevealRound}
  <div class="screen-center">
    <button on:click={revealRound}>REVEAL!</button>
  </div>
{/if}

{#if gameState?.roundState == "reveal"}
  <div class="screen-center">
    <button on:click={completeRound}>NEXT ROUND</button>
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

  .pieces-in-hand.submitted {
    pointer-events: none;
    /* filter: grayscale(60%) brightness(80%); */
  }

  .hand.me {
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 90;
  }

  .hand .player-status {
    position: absolute;
    top: 0;
    left: 25%;
    right: 25%;
    text-align: center;
    transform-origin: 50% 100%;
    transform: translate(0, -100%) scale(2);
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

  .screen-center {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 99;
  }

  .winning-pile {
    position: absolute;
    right: 0;
    
    transform: translateX(100%);
  }

  .me .winning-pile {
    bottom: 0;
  }
</style>
