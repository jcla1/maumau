exports.playable_cards = function(turn) {
  var top = turn.stack[0];

  return turn.hand.filter(function(card) {
    if (
      (((card[0] === top[0] || card[1] === top[1]) && turn.wish_suit === "")
      || (turn.wish_suit === card[1]))
      && !(top[0] === "J" && card[0] === "J")
      ) return true
  });
}