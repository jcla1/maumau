var http = require('http');

function respond(turn_obj) {
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

    for (var i = 0; i < playables.length; i++) {
      if (playables[i][0] === "7") {
        return_obj.card = playables[i];
        break;
      }
    }


    if (turn_obj.draw_counter !== 0 && return_obj.card === null) {
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

http.createServer(function (req, res) {
  var body = "";
  req.on('data', function (chunk) {
    body += chunk;
  });

  req.on('end', function () {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(respond(JSON.parse(body))));
  });

}).listen(8080, '0.0.0.0');

console.log('running...');