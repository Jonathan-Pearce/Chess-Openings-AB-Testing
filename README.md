# Chess-Openings-AB-Testing

Create an application that allows user to evaluate a chess opening and compare two next moves in that opening like an A/B test. Application should provide some basic metrics for the current board state (e.g. stockfish evaluation, lichess opening summary statistics, etc.). User should then have a section to select two next moves and analyze how those moves impact these metrics. Application should apply appropriate statistical tests comparing each metric and provide a recommendation for which move is recommended.

Application should have stockfish evaluation and LiChess.com API (https://lichess.org/api#tag/opening-explorer) functionality

Application will be hosted on github pages website connected to this repo.

UI should be user friendly and modern.

Tech stack:
- Front end: React with TypeScript
- UI board(s): react-chessboard
- Chess Enginer: stockfish.js
