# Clue solver - solves a game of clue, but probably no better than you

## Execution

Execute `node index` to start the program. A command prompt prompts you to either

- start a new game, opening an interactive game mode that lets you enter turns as they happen (subsequently called "online solving")
- calculate the solution from a complete protocol of a past game (subsequently called "offline solving")

### Interactive online solving

A command prompt asks you to enter turns ("actions") as they happen during the game.

Inputs don't have to be entered completely, it is enough if the beginning of the player's name, the suspect, weapon or room is entered, such that only one one possibility remains. For example, if there are players Adam, Steve and Pete, it would be enough to enter "A" because the program understands that only Adam can be the one you mean. If there are Adam, Alex and Steve, an A would not be enough, because it leaves both Adam and Alex as a possible option. In that case the program tells you that your input is ambiguous and asks you to be more specific. If you were to mistype a name, it tells you that and asks you to retype it corretly, leaving very little room for error.

A typical round of clue might look something like the following:

```
New Action:
Actor: Tho
Suspicion
        Room: Muisk
Invalid value "Muisk". Try again: Musi
        Weapon: Pis
        Murderer: Herr
Type a name to add evidence or press enter to finish
Ju
Evidence presented by Julian: Pis
Evidence presented so far: Pistole by Julian.

Type a name to add evidence or press enter to finish

Actor: Thomas
Weapon: Pistole
Murderer: Herr Dir. Grün
Room: Musikzimmer
Evidence: Pistole by Julian, null by Patricia

Is this correct? [Y/n]
```

Type `n` to re-enter the action in case you made a mistake or enter (or `y`) to continue. The program will then begin calculating which implications can be drawn from the new action and if it finds part of the crime's solution, it will tell you like this:

```
1664 results
Pistole is part of the solution
```

## Input data

Important game data is loaded at the beginning from a txt file, by default `original.txt` (as specified in `index.js:7`).
It has to be structured as follows:

First line: `Subjects` \
Second line: The list of weapons separated by commas \
Third line: The list of suspects, separated by commas \
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

First line: Name of the current player, e.g. your name if it is you who raises the suspicion. \
Second line: The suspicion, so a room, weapon and suspect separated by commas. \
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
