<script>
  export let pieceType = 0; // 1~14, 0 means hidden
  export let onToggleSelected = () => {};
  
  export let isSelected = false;

  export const PIECE_CHARACTER_MAPPING = {
    0: '',
    1: '帥',
    2: '將',
    3: '仕',
    4: '士',
    5: '相',
    6: '象',
    7: '車',
    8: '車',
    9: '馬',
    10: '馬',
    11: '炮',
    12: '砲',
    13: '兵',
    14: '卒',
  }

  $: isRedPiece = pieceType % 2 == 1;
  $: isHidden = pieceType == 0;
</script>

<button
  class="game-piece"
  class:red-piece={isRedPiece}
  class:selected={isSelected}
  class:hidden={isHidden}
  on:click={() => {
    // isSelected = !isSelected;
    onToggleSelected(pieceType);
  }}
>
  {PIECE_CHARACTER_MAPPING[pieceType]}
</button>

<style>
  .game-piece {
    width: 64px;
    height: 64px;
    border-radius: 999px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-size: 32px;
    line-height: 1;
    font-family: sans-serif;
    background-color: #fed;
    border: 4px solid black;
    color: black;
    font-weight: bold;
    box-sizing: border-box;
    transition: all 0.1s;
  }

  .game-piece.red-piece {
    color: red;
    border-color: red;
  }

  .game-piece.selected {
    background-color: #ff4;
    transform: translateY(-16px);
    box-shadow: 0px 16px 16px #0003;
  }

  .game-piece.hidden {
    /* border: none; */
    border-color: #00000008;
  }
</style>
