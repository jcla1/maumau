var net_player = require('./net_player.js');

var dummy_player = require('./dummy_player.js')

var seven_player = require('./seven_player.js')

function Card(val, suit) {
  this.val = "" + val;
  this.suit = "" + suit
}

Card.prototype.is_suit = function(card) {
  return this.suit === card.suit;
}

Card.prototype.is_value = function(card) {
  return this.val === card.val;
}

Card.prototype.familiar = function(card) {
  return this.is_suit(card) || this.is_value(card);
}

Card.prototype.toString = function() {
  return this.val + this.suit;
}

Card.prototype.is_special = function() {
  if (this.val === "7" || this.val === "8" || this.val === "J") return true
  return false
}

function CardStore() {
  this.cards = [];
}

CardStore.prototype.num_cards = function() {
  return this.cards.length;
}

CardStore.prototype.shuffle = function() {
  //for(var j, x, i = this.cards.length; i; j = parseInt(Math.random() * i), x = this.cards[--i], this.cards[i] = this.cards[j], this.cards[j] = x);
  this.cards.sort(function() { return 0.5 - Math.random(); });
}

CardStore.prototype.add_cards = function(cards) {
  this.cards = this.cards.concat(cards);
}

CardStore.prototype.has_card = function(card_str) {
  for (var i = 0; i < this.cards.length; i++) {
    if (this.cards[i].toString() === card_str) return true;
  }
  return false;
}

CardStore.prototype.find_card = function(card_str) {
  for (var i = 0; i < this.cards.length; i++) {
    if (this.cards[i].toString() === card_str) return this.cards[i];
  }
}

CardStore.prototype.remove_card = function(card) {
  return this.cards.splice(this.cards.indexOf(card), 1)[0]
}

CardStore.prototype.toString = function() {
  return this.cards.toString();
}

CardStore.prototype.toA = function() {
  return this.toString().split(',')
}

CardStore.prototype.draw_cards = function(n) {
  return this.cards.splice(-n)
}

function Stack() {}
Stack.prototype = new CardStore();

Stack.prototype.can_put_down = function(card) {
  this.cards[0].familiar(card)
}

Stack.prototype.lay = function(card) {
  this.cards.unshift(card);
}

function Deck() {}
Deck.prototype = new CardStore();

Deck.prototype.init_deck = function() {
  HEARTS  = "H";
  SPADES  = "S";
  CLUBS   = "C";
  DIMONDS = "D";

  SUITS = [HEARTS, SPADES, CLUBS, DIMONDS];

  CARD_VALUES = [7, 8, 9, "T", "J", "Q", "K", "A"];

  for (var i = 0; i < CARD_VALUES.length; i++) {
    for (var j = 0; j < SUITS.length; j++) {
      this.cards.push(new Card(CARD_VALUES[i], SUITS[j]));
    }
  }
}

function Hand() {}
Hand.prototype = new CardStore();

function Player(player_obj) {
  this.obj = player_obj;
  this.hand = new Hand();
}

Player.prototype.deal_cards = function(cards) {
  this.hand.add_cards(cards);
}

Player.prototype.play = function(turn_obj) {
  return this.obj.respond(turn_obj)
}

function GameMaster() {
  this.players = [];
  this.player_index = 0;

  this.deck = new Deck();
  this.deck.init_deck();
  this.deck.shuffle();

  this.stack = new Stack();
  var top_card = this.deck.draw_cards(1)[0]

  for (;top_card.is_special();) {
    this.deck.cards.unshift(top_card)
    top_card = this.deck.draw_cards(1)[0];
  }

  this.stack.add_cards([top_card]);

  // This object is for holding state info across turns of players
  // Like how many cards the next player would have to take
  this.state = {
    // number of cards the next player has to draw
    draw_counter: 0,
    wish_suit: ""
  };
}

GameMaster.prototype.add_player = function(player_obj) {
  if (this.players.length >= 4) throw "Too many players!";
  this.players.push(new Player(player_obj));
}

GameMaster.prototype.deal_cards = function() {
  if (this.players.length <= 1) throw "Too few players!";

  for (var i = 0; i < this.players.length; i++) {
    p = this.players[i];
    p.deal_cards(this.deck.draw_cards(5));
  }
}

GameMaster.prototype.advance_player_index = function() {
  this.player_index += 1;
  if (this.player_index === this.players.length) this.player_index = 0;
}

GameMaster.prototype.refill_deck = function() {
  this.deck.add_cards(this.stack.draw_cards(this.stack.num_cards()-1));
  //this.deck.shuffle();
}

GameMaster.prototype.game_step_final = function() {
  var cards_left = this.deck.num_cards();
  if (cards_left < this.state.draw_counter+1) this.refill_deck();

  this.advance_player_index();
}

GameMaster.prototype.reset_wish_suit = function() {
  this.state.wish_suit = "";
}

GameMaster.prototype.can_player_go = function() {
  var cards = this.players[this.player_index].hand.cards;

  for (var i = 0; i < cards.length; i++) {
    if (
    (cards[i].val === this.stack.cards[0].val || cards[i].suit === this.stack.cards[0].suit)
    && !(this.stack.cards[0].val === "J" && cards[i].val === "J")
    && (this.state.wish_suit === "" || this.state.wish_suit === cards[i].suit)
    ) {
      return true;
    }
  }

  return false;
}

GameMaster.prototype.is_valid_move = function(response) {
  // You can only choose one of them
  if (response.cant_go && response.take_cards) return false;

  // Can only take cards if there are any to take
  if (this.state.draw_counter < 1 && response.take_cards) return false;

  // You can't say you can't go if you have to take some cards
  if (this.state.draw_counter > 0 && response.cant_go) return false;

  // You can't say you can't go, if you can
  if (response.cant_go && this.can_player_go()) return false;

  if (!(response.cant_go || response.take_cards)) {
    // You need to have the card or can't go, etc
    if (!(this.players[this.player_index].hand.has_card(response.card))) return false;

    // Need to match the wish of a jack
    if (!(this.state.wish_suit === "" || this.state.wish_suit === response.card[1])) return false;

    // Can't put a jack on a jack!
    if (this.stack.cards[0][0] === "J" && response.card[0] === "J") return false;

    // Suit or value have to match
    if (response.card[0] === this.stack.cards[0][0] || response.card[1] === this.stack.cards[0][1]) return false;
  }

  return true;
}

GameMaster.prototype.game_step = function() {
  p = this.players[this.player_index]

  var response = p.play({
    stack: this.stack.toA(),
    hand: p.hand.toA(),
    draw_counter: this.state.draw_counter,
    wish_suit: this.state.wish_suit
  });

  if (!this.is_valid_move(response)) throw "Invalid move by player!";

  if (response.take_cards) {
    p.hand.add_cards(this.deck.draw_cards(this.state.draw_counter));
    this.state.draw_counter = 0;

    response = p.play({
      stack: this.stack.toA(),
      hand: p.hand.toA(),
      draw_counter: this.state.draw_counter,
      wish_suit: this.state.wish_suit
    });

    if (!this.is_valid_move(response)) throw "Invalid move by player!";

  }

  if (response.cant_go) {
    p.hand.add_cards(this.deck.draw_cards(1))

    response = p.play({
      stack: this.stack.toA(),
      hand: p.hand.toA(),
      draw_counter: this.state.draw_counter,
      wish_suit: this.state.wish_suit
    });

    if (!this.is_valid_move(response)) throw "Invalid move by player!";

    // If the player still can't go
    // move onto the next player.
    if (response.cant_go) {
      this.game_step_final();
      return;
    }
  }

  this.reset_wish_suit();

  switch (response.card[0]) {
    case "7":
      this.state.draw_counter += 2;
      break;
    case "8":
      this.advance_player_index();
      break;
    case "J":
      this.state.wish_suit = response.wish_suit;
      break;
  }

  var c = p.hand.find_card(response.card);
  p.hand.remove_card(c);
  this.stack.lay(c);

  this.game_step_final();
}

GameMaster.prototype.player_has_no_cards = function() {
  for (var i = 0; i < this.players.length; i++) {
    if (this.players[i].hand.num_cards() === 0) return true;
  }

  return false;
}

GameMaster.prototype.game_loop = function() {
  var i = 0;

  while (!this.player_has_no_cards()) {
    this.game_step();
   i++;
  }

  for (var j = 0; j < this.players.length; j++) {
    if (this.players[j].hand.num_cards() === 0) {
      winner = this.players[j].obj.name;
      break;
    }
  }

  return [i, winner];
}


/*var a = new GameMaster();
a.add_player(net_player);
a.add_player(dummy_player);
a.players.sort(function() { return 0.5 - Math.random(); });
a.deal_cards();

var result = a.game_loop();
console.log(result);*/



var winners = [];
var num_turns = [];

for (var i = 0; i < 50; i++) {
  var a = new GameMaster();
  //a.add_player(dummy_player);
  a.add_player(net_player);
  a.add_player(dummy_player);
  a.players.sort(function() { return 0.5 - Math.random(); });
  a.deal_cards();

  var result = a.game_loop();

  num_turns.push(result[0]);
  winners.push(result[1]);
}

var num_turns_avg = num_turns.reduce(function(a, b) { return a + b; }) / num_turns.length;
var winner_counts = winners.reduce(function(a, b) { b in a ? a[b]++ : a[b] = 1; return a; }, {});

console.log("On average it took", num_turns_avg, "turns to end a game.");
console.log("Here are the winner counts:", winner_counts);

//console.log("It took", result[0], "moves til player", result[1], "had won.");