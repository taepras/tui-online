<script>
  export let pieceType = 0; // 1~14
  export let onToggleSelected = () => {};
  
  export let isSelected = false;

  $: isRedPiece = pieceType % 2 == 1;
</script>

<button
  class="game-piece"
  class:red-piece={isRedPiece}
  class:selected={isSelected}
  on:click={() => {
    // isSelected = !isSelected;
    onToggleSelected(pieceType);
  }}
>
  {pieceType}
</button>

<style>
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
  }

  .game-piece.red-piece {
    color: red;
    border-color: red;
  }

  .game-piece.selected {
    background-color: #ff4;
  }
</style>
