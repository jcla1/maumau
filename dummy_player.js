var util = require('./util');

module.exports = {
  name: "dummy",
  respond: function(turn) {
    var return_obj = {
      wish_suit: "",
      card: null,
      take_cards: false,
      cant_go: false
    };

    var playables = util.playable_cards(turn);

    if (turn.draw_counter !== 0) {
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