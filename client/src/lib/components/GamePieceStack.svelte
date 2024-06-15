<script>
  export let pieces = [0, 0, 0, 0]; // 1~14
</script>

<div class="game-piece-stack">
  {#each pieces as piece, index}
    <div
      class="game-piece"
      class:red-piece={piece % 2 == 1}
      style:z-index={100 - index}
    >
      {piece}
    </div>
  {/each}
</div>

<style>
  .game-piece-stack {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    /* gap: -24px; */
  }

  .game-piece {
    width: 32px;
    height: 32px;
    border-radius: 999px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    line-height: 1;
    font-family: sans-serif;
    background-color: #fed;
    border: 2px solid black;
    color: black;
    /* box-sizing: border-box; */

    margin-bottom: -30px;
  }

  .game-piece.red-piece {
    color: red;
    border-color: red;
  }

  .game-piece.selected {
    background-color: #ff4;
  }
</style>
