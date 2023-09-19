import axios from 'axios';
const uuidv4 = require('uuid').v4;

const BASE_URL = 'https://z281inf0ak.execute-api.us-east-1.amazonaws.com'; // replace with your API URL

export class GameState {
    permaPlacedTiles: string[][];
    currentHand: string[];
    roundScores: number[];

    constructor(permaPlacedTiles: string[][], currentHand: string[], roundScores: number[]) {
        this.permaPlacedTiles = permaPlacedTiles;
        this.currentHand = currentHand;
        this.roundScores = roundScores;
    }
}

export const loadGame = async (gameId: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/mathScrabble?gameId=${gameId}`, {
        headers: {
            'Access-Control-Allow-Origin': 'www.eli-zhang.github.io/*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
    return JSON.parse(response.data.game_state);
  } catch (error) {
    console.error('Error loading game lobby:', error);
    throw error;
  }
};

export const createLobby = async (gameState: GameState) => {
    try {
      const response = await axios.post(`${BASE_URL}/mathScrabble`, {
        gameId: uuidv4(),
        startingState: JSON.stringify(gameState)
      }, {
        headers: {
          'Access-Control-Allow-Origin': 'www.eli-zhang.github.io/*',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating lobby:', error);
      throw error;
    }
  };

export const submitMove = async (gameId: string, gameState: GameState) => {
  try {
    const response = await axios.put(`${BASE_URL}/mathScrabble`, {
        gameId: gameId,
        gameState: JSON.stringify(gameState)
    }, {
        headers: {
            'Access-Control-Allow-Origin': 'www.eli-zhang.github.io/*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting move:', error);
    throw error;
  }
};