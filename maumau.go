package main

const (
	SEVEN valueType = iota
	EIGHT
	NINE
	TEN
	JACK
	QUEEN
	KING
)

const (
	HEARTS suitType = iota
	SPADES
	CLUBS
	DIAMONDS
)

type suitType uint8
type valueType uint8

type Card struct {
	Suit  suitType
	Value valueType
}

func NewCard(suit suitType, value valueType) *Card {
	return &Card{
		Suit:  suit,
		Value: value,
	}
}

func (c *Card) isSuit(otherCard *Card) bool {
	return c.Suit == otherCard.Suit
}

func (c *Card) isValue(otherCard *Card) bool {
	return c.Value == otherCard.Value
}

func (c *Card) isSpecial() bool {
	if c.Value == SEVEN || c.Value == EIGHT || c.Value == JACK {
		return true
	}
	return false
}

func (c *Card) familiar(otherCard *Card) bool {
	return c.isSuit(otherCard) || c.isValue(otherCard)
}
