package main

import (
	"encoding/json"
	"net/http"
)

type Turn struct {
	Stack       []string `json:"stack"`
	Hand        []string `json:"hand"`
	WishSuit    string   `json:"wish_suit"`
	DrawCounter uint     `json:"draw_counter"`
}

type Response struct {
	CantGo    bool    `json:"cant_go"`
	TakeCards bool    `json:"take_cards"`
	Card      *string `json:"card"` // This is a pointer so it can be json encoded as "null"
	WishSuit  string  `json:"wish_suit"`
}

func respond(turn Turn) Response {
	r := Response{}

	if turn.DrawCounter != 0 {
		r.TakeCards = true
		return r
	}

	top := turn.Stack[0]
	var playables []string

	for _, card := range turn.Hand {
		if (card[0] == top[0] || card[1] == top[1]) && !(top[0] == 74 && card[0] == 74) && (turn.WishSuit == "" || turn.WishSuit == card[1:]) {
			playables = append(playables, card)
		}
	}

	if len(playables) == 0 {
		r.CantGo = true
		return r
	}

	r.Card = &playables[0]
	if (*r.Card)[0] == 74 {
		//r.WishSuit = (*r.Card)[1:]
		r.WishSuit = "H"
	}

	return r
}

func main() {
	http.HandleFunc("/turn", func(w http.ResponseWriter, req *http.Request) {
		decoder := json.NewDecoder(req.Body)
		var turn Turn
		err := decoder.Decode(&turn)
		if err != nil {
			panic(err)
		}

		res := respond(turn)

    encoder := json.NewEncoder(w)
    err = encoder.Encode(res)
    if err != nil {
      panic(err)
    }

	})

	http.ListenAndServe(":8080", nil)
}
