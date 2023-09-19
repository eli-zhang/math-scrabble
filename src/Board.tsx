import React, { useEffect } from 'react';
import './App.css';
import { tileCounts, tileScores } from './tileInfo'
import { configureTiles } from './generateTiles';
import { createLobby, loadGame, submitMove, GameState } from './networking'
import { useParams, useNavigate } from 'react-router-dom';

function Board() {
  useEffect(() => {
    configureTiles();
  }, [])

  const boardLayout = [
    ["", "3E", "", "", "", "3S", "", "", "", "2S", "", "", "", "3S", "", "", "", "3E", ""],
    ["3E", "", "", "", "3S", "", "", "", "2S", "", "2S", "", "", "", "3S", "", "", "", "3E"],
    ["", "", "", "2E", "", "", "", "2S", "", "", "", "2S", "", "", "", "2E", "", "", ""],
    ["", "", "2E", "", "", "", "3S", "", "", "", "", "", "3S", "", "", "", "2E", "", ""],
    ["", "3S", "", "", "", "2S", "", "", "", "3S", "", "", "", "2S", "", "", "", "3S", ""],
    ["3S", "", "", "", "2S", "", "", "", "3S", "", "3S", "", "", "", "2S", "", "", "", "3S"],
    ["", "", "", "3S", "", "", "", "2S", "", "", "", "2S", "", "", "", "3S", "", "", ""],
    ["", "", "2S", "", "", "", "2S", "", "", "", "", "", "2S", "", "", "", "2S", "", ""],
    ["", "2S", "", "", "", "3S", "", "", "2S", "", "2S", "", "", "3S", "", "", "", "2S", ""],
    ["2S", "", "", "", "3S", "", "", "", "", "2E", "", "", "", "", "3S", "", "", "", "2S"],
    ["", "2S", "", "", "", "3S", "", "", "2S", "", "2S", "", "", "3S", "", "", "", "2S", ""],
    ["", "", "2S", "", "", "", "2S", "", "", "", "", "", "2S", "", "", "", "2S", "", ""],
    ["", "", "", "3S", "", "", "", "2S", "", "", "", "2S", "", "", "", "3S", "", "", ""],
    ["3S", "", "", "", "2S", "", "", "", "3S", "", "3S", "", "", "", "2S", "", "", "", "3S"],
    ["", "3S", "", "", "", "2S", "", "", "", "3S", "", "", "", "2S", "", "", "", "3S", ""],
    ["", "", "2E", "", "", "", "3S", "", "", "", "", "", "3S", "", "", "", "2E", "", ""],
    ["", "", "", "2E", "", "", "", "2S", "", "", "", "2S", "", "", "", "2E", "", "", ""],
    ["3E", "", "", "", "3S", "", "", "", "2S", "", "2S", "", "", "", "3S", "", "", "", "3E"],
    ["", "3E", "", "", "", "3S", "", "", "", "2S", "", "", "", "3S", "", "", "", "3E", ""],
  ];
  
  const { gameId, playerId } = useParams<{ gameId: string, playerId: string }>();
  const navigate = useNavigate();

  const isMounted = React.useRef(false);

  const allTiles = Object.entries(tileCounts).flatMap(([key, val]) => {
    return Array(val).fill(key);
  });
  
  const [currentHand, setCurrentHand] = React.useState<string[]>("LOADING...".split(""));

  const [usedTilesInHandIdx, setUsedTilesInHandIdx] = React.useState<number[]>([]);

  const specialTiles = new Set(["3E", "3S", "2S", "2E"]);
  const initialPlacedTiles: string[][] = Array.from({length: 19}, () => Array(19).fill(""));
  const initialTilePositions: boolean[][] = Array.from({length: 19}, () => Array(19).fill(false));

  const [selectedTile, setSelectedTile] = React.useState<string | null>(null);
  const [placedTiles, setPlacedTiles] = React.useState<string[][]>(deepCopy(initialPlacedTiles));
  const [permaPlacedTiles, setPermaPlacedTiles] = React.useState<string[][]>(deepCopy(initialPlacedTiles));
  const [boardToRender, setBoardToRender] = React.useState<string[][]>(boardLayout);
  const [pendingTilePositions, setPendingTilePositions] = React.useState<boolean[][]>(initialTilePositions);
  const [currSelectedIdx, setCurrSelectedIdx] = React.useState<number>(-1);
  const [roundScore, setRoundScore] = React.useState<number>(0);
  const [roundScores, setRoundScores] = React.useState<number[]>([]);

  const [tileIdxsToReroll, setTileIdxsToReroll] = React.useState<number[]>([]);
  const [rerolling, setRerolling] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);

  function deepCopy(arr: any[]) {
    let copy: any[] = [];
    arr.forEach(elem => {
      if (Array.isArray(elem)) {
        copy.push(deepCopy(elem));
      } else {
        copy.push(elem);
      }
    });
    return copy;
  }

  const handleTileInHandClick = (letter: string, index: number) => {
    if (rerolling) {
      if (tileIdxsToReroll.includes(index)) {
        setTileIdxsToReroll(tileIdxsToReroll.filter(i => i !== index));
      } else {
        setTileIdxsToReroll([...tileIdxsToReroll, index]);
      }
      return;
    }
    if (!usedTilesInHandIdx.includes(index)) {
      setSelectedTile(letter);
      setCurrSelectedIdx(index);
    }
    setSelectedTile(letter);
  };

  const handleTileOnBoardClick = (rowIndex: number, colIndex: number) => {
    if (tilePendingOnBoard(rowIndex, colIndex)) {
      const tileValue = placedTiles[rowIndex][colIndex]
      const newPlacedTiles = [...placedTiles];
      newPlacedTiles[rowIndex][colIndex] = "";
      setPlacedTiles(newPlacedTiles);
      
      const newPendingTilePositions = [...pendingTilePositions];
      newPendingTilePositions[rowIndex][colIndex] = false;
      setPendingTilePositions(newPendingTilePositions);

      usedTilesInHandIdx.forEach((idx) => {
        if (currentHand[idx] === tileValue) {
          setUsedTilesInHandIdx(usedTilesInHandIdx.filter((index) => index !== idx));
        }
      });
    }
  }

  const handleReset = () => {
    const newPlacedTiles = deepCopy(placedTiles);
    const newPendingTilePositions = deepCopy(initialTilePositions);
  
    pendingTilePositions.forEach((row, rowIndex) => {
      row.forEach((pendingTile, colIndex) => {
        if (pendingTile) {
          newPlacedTiles[rowIndex][colIndex] = "";
        }
      });
    });
  
    setPlacedTiles(newPlacedTiles);
    setPendingTilePositions(newPendingTilePositions);
    setUsedTilesInHandIdx([]);
  }

  const tilePendingOnBoard = (rowIndex: number, colIndex: number) => {
    return pendingTilePositions[rowIndex][colIndex];
  }

  const validatePendingTilePositions = (newPendingTilePositions: boolean[][]) => {
    let foundRow = -1;
    let foundCol = -1;
    for (let row = 0; row < newPendingTilePositions.length; row++) {
      for (let col = 0; col < newPendingTilePositions[0].length; col++) {
        if (newPendingTilePositions[row][col]) {
          if (foundRow === -1 && foundCol === -1) { // Haven't located the first tile
            foundRow = row;
            foundCol = col;
          } else if (foundRow === row) {  // Keep going, but only check the row
            foundCol = -1;
          } else if (foundCol === col) {  // Keep going, but only check the column
            foundRow = -1;
          } else {
            return {
                success: false
            };
          }
        }
      }
    }
    return {
        success: true,
        rowToCheck: foundRow,
        colToCheck: foundCol
    };
  }

  const evaluateGroup = (group: string[]) => {
    if (group.length > 1)  {
        if (!group.includes("=")) {
            return { 
                success: false,
                reason: "you are missing an ="
            }
        } else {
            try {
                let correct = eval(group.join("").replace(/=/g, '===').replace(/÷/g, '/').replace(/×/g, '*')); 
                if (!correct) {
                    return {
                        success: false,
                        reason: "equation is not true"
                    }
                }
            } catch {
                console.log("failure")
                return {
                    success: false,
                    reason: "equation is malformed"
                }
            }
        }
    }
    return {
        success: true
    }
  }

  const validateRowColumn = () => {
    const allPlacedTiles = deepCopy(permaPlacedTiles);
    placedTiles.forEach((row, rowIndex) => {
      row.forEach((cellContent, colIndex) => {
        if (cellContent !== "") {
          allPlacedTiles[rowIndex][colIndex] = cellContent;
        }
      });
    });

    let linesToCheckInfo = validatePendingTilePositions(pendingTilePositions)
    let { rowToCheck, colToCheck } = linesToCheckInfo
    if (rowToCheck && rowToCheck !== -1) {
        let group = [];
        for (let col = 0; col < allPlacedTiles[0].length; col++) {
            if (allPlacedTiles[rowToCheck][col] !== "") {
                group.push(allPlacedTiles[rowToCheck][col]);
            } else {
                let evaluation = evaluateGroup(group);
                if (!evaluation.success) {
                    return evaluation
                }
                group = [];
            }
        }
        let evaluation = evaluateGroup(group);
        if (!evaluation.success) {
            return evaluation
        }
    }
  
    if (colToCheck && colToCheck !== -1) {
        let group = [];
        for (let row = 0; row < allPlacedTiles.length; row++) {
          if (allPlacedTiles[row][colToCheck] !== "") {
            group.push(allPlacedTiles[row][colToCheck]);
          } else {
            let evaluation = evaluateGroup(group);
            if (!evaluation.success) {
                return evaluation
            }
            group = [];
          }
        }
        let evaluation = evaluateGroup(group);
        if (!evaluation.success) {
            return evaluation
        }
    }
  
    return {
        success: true,
        reason: "yes"
    }
  }

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (selectedTile) {
      const newPendingTilePositions = deepCopy(pendingTilePositions);
      newPendingTilePositions[rowIndex][colIndex] = true;

      if (!validatePendingTilePositions(newPendingTilePositions).success) {
        return;
      }
      setPendingTilePositions(newPendingTilePositions);

      const newPlacedTiles = [...placedTiles];
      newPlacedTiles[rowIndex][colIndex] = selectedTile;

      setPlacedTiles(newPlacedTiles);
      setSelectedTile(null);
      setUsedTilesInHandIdx([...usedTilesInHandIdx, currSelectedIdx]);
      setCurrSelectedIdx(-1);
    }
  };

  const handleReroll = () => {
    const newHand = [...currentHand];
    tileIdxsToReroll.forEach(index => {
      if (index < 1) { // Skip first tile.
        return;
      }
      const newTile = allTiles[Math.floor(Math.random() * allTiles.length)];
      newHand[index] = newTile;
    });
    setCurrentHand(newHand);
    setTileIdxsToReroll([]);
  };

  const lockInPlacedTiles = () => {
    const newPermaPlacedTiles = deepCopy(permaPlacedTiles);
    placedTiles.forEach((row, rowIndex) => {
      row.forEach((cellContent, colIndex) => {
        if (cellContent !== "") {
          newPermaPlacedTiles[rowIndex][colIndex] = cellContent;
        }
      });
    });
    setPermaPlacedTiles(newPermaPlacedTiles);
  }

  const handleSubmit = () => {
    if (rerolling) {
      handleReroll();
      setRerolling(false);
      handleReset();
      setRoundScores([...roundScores, 0]);
      return;
    }

    const result = validateRowColumn();

    if (!result.success) {
      alert(`Illegal move: ${result.reason}`);
      return;
    }

    const newHand = [...currentHand];
    usedTilesInHandIdx.forEach(index => {
      if (index === 0) { // The first tile is always an equals.
        newHand[index] = "=";
        return;
      }
      const newTile = allTiles[Math.floor(Math.random() * allTiles.length)];
      newHand[index] = newTile;
    });
    setCurrentHand(newHand);
    setRoundScores([...roundScores, roundScore]);
    lockInPlacedTiles();
    setUsedTilesInHandIdx([]);
    setPlacedTiles(initialPlacedTiles);
    setPendingTilePositions(initialTilePositions);
  }

  const getCurrentPlayScore = () => {
    let sum = 0;
    let multiplier = 1; // initialize multiplier to 1
    let bonus = 0;
    pendingTilePositions.forEach((row, rowIndex) => {
      row.forEach((isPending, colIndex) => {
        if (isPending) {
          const placedTile = placedTiles[rowIndex][colIndex];
          const tileScore = tileScores[placedTile];
          const boardSpace = boardLayout[rowIndex][colIndex];
          if (boardSpace === "3S") {
            sum += tileScore * 3; // multiply tile score by 3 if "3S" is present
          } else if (boardSpace === "2S") {
            sum += tileScore * 2; // multiply tile score by 2 if "2S" is present
          } else {
            sum += tileScore; // add tile score if no multiplier is present
          }
          if (boardSpace === "3E") {
            multiplier *= 3; // set multiplier to 3 if "3E" is present
          } else if (boardSpace === "2E") {
            multiplier *= 2; // set multiplier to 2 if "2E" is present
          }
        }
      });
    });
    
    let foundAll = true;
    for (let i = 1; i <= 9; i++) {
        if (!usedTilesInHandIdx.includes(i)) {
            foundAll = false;
            break;
        }
    }
    if (foundAll) {
        bonus = 40;
    }
    return sum * multiplier + bonus;
  }

  const handleNewGame = async () => {
    console.log("initial tiles", initialPlacedTiles)
    let startingHand = ["="].concat(allTiles.sort(() => Math.random() - 0.5).slice(0, 9));
    setLoading(true);
    let { gameId } = await createLobby(
      new GameState(deepCopy(initialPlacedTiles), startingHand, [])
    );
    navigate(`/${gameId}/1`)
    setLoading(false);

  }

  const handleLoadGame = async () => {
    const gameCode = prompt("Enter game code:");
    setLoading(true);
    if (gameCode) {
        navigate(`/${gameCode}/1`)
    }
    setLoading(false);
  }
  
  React.useEffect(() => {
    const newBoardToRender = deepCopy(boardLayout);
    placedTiles.forEach((row, rowIndex) => {
      row.forEach((cellContent, colIndex) => {
        if (cellContent !== "") {
          newBoardToRender[rowIndex][colIndex] = cellContent;
        }
      });
    });

    permaPlacedTiles.forEach((row, rowIndex) => {
      row.forEach((cellContent, colIndex) => {
        if (cellContent !== "") {
          newBoardToRender[rowIndex][colIndex] = cellContent;
        }
      });
    });

    setBoardToRender(newBoardToRender);
    setRoundScore(getCurrentPlayScore());
  }, [placedTiles, permaPlacedTiles])

    React.useEffect(() => {
        if (isMounted.current && !loading && gameId) {
            submitMove(gameId, new GameState(permaPlacedTiles, currentHand, roundScores));
        } else {
            isMounted.current = true;
        }
    }, [permaPlacedTiles])
    

    React.useEffect(() => {
        const fetchData = async () => {
            if (gameId) {
                isMounted.current = false;
                setLoading(true);
                let lobbyData = await loadGame(gameId);
                setLoading(false);
                setPermaPlacedTiles(lobbyData.permaPlacedTiles);
                setCurrentHand(lobbyData.currentHand);
                setRoundScores(lobbyData.roundScores)
            }
        };
        fetchData();

        // Uncomment when enabling two player mode
        // const pollingInterval = setInterval(async () => {
        //     if (gameId) {
        //         let lobbyData = await loadGame(gameId);
        //         setPermaPlacedTiles(lobbyData.permaPlacedTiles);
        //         setCurrentHand(lobbyData.currentHand);
        //         setRoundScores(lobbyData.roundScores);
        //     }
        // }, 5000);
    
        // return () => {
        //     clearInterval(pollingInterval);
        // };
    }, []);

  return (
    <div className="App">
      <div className="board-container">
        <div className="grid">
          {boardToRender.map((row, rowIndex) =>{
            return row.map((cellContent, colIndex) => {

              if (!specialTiles.has(cellContent) && cellContent !== "") {
                // Render a tile on the board instead.
                return (
                  <div 
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleTileOnBoardClick(rowIndex, colIndex)}
                    className={`grid-tile ${cellContent.length > 1 ? 'small-font' : ''}`}
                    data-letter={cellContent}
                  />
                );
              }

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`grid-cell space-${cellContent}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cellContent}
                </div>
              );
            })
        })}
        </div>
      </div>

      <div className="hand">
        {currentHand.map((tile, index) => {
          return (

            <div
              key={index}
              className={`tile ${tile.length > 1 ? 'small-font' : ''} ${tile === "=" ? 'equals' : ''} ${usedTilesInHandIdx.includes(index) ? 'used' : ''} ${tileIdxsToReroll.includes(index) ? 'rerolling' : ''}`}
              data-letter={tile}
              onClick={() => handleTileInHandClick(tile, index)}
            />
          )})}

        <div className="hand-buttons">
          <button className="hand-button" onClick={() => {handleReset()}}>Reset</button>
          <button className="hand-button" onClick={() => {handleSubmit()}}>Submit</button>
          <button className={`hand-button ${rerolling ? 'active' : ''}`} onClick={() => {setRerolling(!rerolling)}}>Reroll</button>
        </div>

        <table className="score-table">
          <thead>
            <tr>
              <th>Round</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {roundScores.map((score, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{score}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="hand-buttons">
          <button className={`hand-button ${!(gameId && playerId) ? 'active' : ''}`} onClick={() => {handleNewGame()}}>New Game</button>
          <button className="hand-button" onClick={() => {handleLoadGame()}}>Load Game</button>
        </div>
      </div>
    </div>
  );
}

export default Board;
