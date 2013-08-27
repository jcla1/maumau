module.exports = {
  name: "dummy",
  respond: function(turn_obj) {
    function playable_cards(cards, top) {
      playable = [];

      for (var i = 0; i < cards.length; i++) {
        if (
          (cards[i][0] === top[0] || cards[i][1] === top[1])
          && !(top[0][0] === "J" && cards[i][0] === "J")
          && (turn_obj.wish_suit === "" || turn_obj.wish_suit === cards[i][1])
          ) {
          playable.push(cards[i]);
        }
      }

      return playable;
    }

    /*
    {
      stack: this.stack.toA(),
      hand: p.hand.toA(),
      draw_counter: this.state.draw_counter
    }
    */

    var return_obj = {
      wish_suit: "",
      card: null,
      take_cards: false,
      cant_go: false
    };

    //return_obj.take_cards = true;
    //return return_obj;

    var playables = playable_cards(turn_obj.hand, turn_obj.stack[0]);

    if (turn_obj.draw_counter !== 0) {
      return_obj.take_cards = true;
      return return_obj;
    }

    if (playables.length === 0) {
      return_obj.cant_go = true;
      return return_obj;
    }

    var c = playables[0];
    if (c[0] === "J") return_obj.wish_suit = c[1];
    return_obj.card = c;

    return return_obj;
  }
};