# Game

## Concept
A multiplayer online game where two players compete in a 2D maze (top down view) to win. Players are young wizards navigating through an enchanted maze. The objective is to retrieve a key hidden in the maze and exit the maze. There are two doors, one for each player, to win the player has to exit through their door with the key.

## Core Features
- Players navigate the maze using arrow keys or swipe gestures.
- Collectible magic runes appear randomly in the maze, which players can use to cast spells.
- A spectator mode, where a user can connect to the session and see the players interact in the maze.

## Spells and Runes
- Speed Boost: Temporarily increases the player's movement speed.
- Teleport: Moves the player to a random location in the maze.
- Confuse: Temporarily reverses the opponent's controls.
- Throw spell: You can throw spells at players to stun and steal their keys.

## Frontend
Users connect to the server from the browser. 

## Backend
The server runs in the Node JS environment. It consist of a webserver that communicates with the players and updates their states. Express handles basic HTTP communication while Socket.io handles the real time communication between players and server. 

### Session
The session is the module that handles the game logic and players decisions.<br/>

**Session Variables**
- Spectators
- Game
    - Map Layout
      - Walls
      - Doors
      - Spawn Points
    - Time
    - Keys
      - Positions 
      - Which player the key belongs to 
    - Runes
      - Positions
      - Types 
    - State (Not started, Started, Completed)
    - Players
      - Position
      - Equiped Spells
      - What spells the players are affected by and for how long

<br/>

**Game logic**
<br/>
The game logic consists of multiple phases and handles decisions based on player interaction. 

- **Not Started**
During this phase users can join the game lobby as either spectators or players if there is room for players. Once two players have joined and pressed the ready button the game will commence into the **Started** phase. Players are also able to leave the lobby if they change their mind.

- **Started**
    - Player spawns
    - Key spawns
    - Player actions
    - Map selection
- **Completed**
Sends data to users on the result of the game. Players will have the opportunity to rematch.
        

