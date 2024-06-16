<script>
  import GamePiece from "./GamePiece.svelte";

  export let pieces = [0, 0, 0, 0]; // 1~14
</script>

<div class="game-piece-stack">
  {#each pieces as piece, index}
    <div class="game-piece-container" style:z-index={100 - index}>
      <GamePiece pieceType={piece} />
    </div>
  {/each}
</div>

<style>
  .game-piece-stack {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    /* width: 50%; */
    /* gap: -24px; */
  }

  .game-piece-container {
    transform: scale(0.5);
    margin-bottom: -60px;
  }

</style>
