var util = require('./util')

module.exports = {
  name: "seven",
  respond: function(turn) {
    var return_obj = {
      wish_suit: "",
      card: null,
      take_cards: false,
      cant_go: false
    };

    var playables = util.playable_cards(turn)

    for (var i = 0; i < playables.length; i++) {
      if (playables[i][0] === "7") {
        return_obj.card = playables[i];
        break;
      }
    }


    if (turn.draw_counter !== 0 && return_obj.card === null) {
      return_obj.take_cards = true;
      return return_obj;
    }

    if (playables.length === 0) {
      return_obj.cant_go = true;
      return return_obj;
    }

    if (return_obj.card === null) var c = playables[0];
    if (return_obj.card === null && c[0] === "J") return_obj.wish_suit = c[1];
    if (return_obj.card === null) return_obj.card = c;

    return return_obj;
  }
};