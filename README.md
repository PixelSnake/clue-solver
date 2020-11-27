# Clue solver - solves a game of clue, but probably no better than you

## Game files

Important game data is loaded at the beginning from a txt file, by default `original.txt` (as specified in `index.js:7`).
It has to be structured as follows:

First line: `Subjects`
Second line: The list of weapons separated by commas
Third line: The list of suspects, separated by commas
Fourth line: The list of rooms, separated by commas

Empty line

The word `Actors` followed by a space and the names of the players, the name of the player (so your name) comes first, seperated by, you guessed it, commas.

Then the word `Init` followed by a space and the weapons, suspects and rooms that you have on your hand, separated by... well, make a guess.

### Example

```
Subjects
Heizungsrohr, Leuchter, Pistole, Seil, Dolch, Rohrzange
Prof. Bloom, Baronin von Porz, Frl. Ming, Frau Weiß, Oberst von Gatow, Herr Dir. Grün
Küche, Bibliothek, Salon, Speisezimmer, Billardzimmer, Eingangshalle, Veranda, Arbeitszimmer, Musikzimmer

Actors Thomas, Julian, Patricia
Init Frau Weiß, Oberst von Gatow, Eingangshalle, Salon, Leuchter, Musikzimmer
```

This is enough for an interactive game (online calculation). If you want to calculate the results based on an already completed game, just give a list of actions formated as follows:

## Offline calculation

First line: Name of the current player, e.g. your name if it is you who raises the suspicion.
Second line: The suspicion, so a room, weapon and suspect separated by commas.
Then for all players who showed you one of their cards, their name and the card they showed you. If it's another player's turn and you only see **that** they showed a card, but not **which one**, enter their name followed by a question mark.

After the list of evidence, an empty line follows to finish the round.

### Example

```
Patricia
Pistole, Frl. Ming, Arbeitszimmer
Julian ?

Thomas
Pistole, Frl. Ming, Musikzimmer
Julian Frl. Ming
```
