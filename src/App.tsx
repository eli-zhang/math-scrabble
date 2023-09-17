import React, { useEffect } from 'react';
import './App.css';
import { tileCounts, tileScores } from './tileInfo'
import { configureTiles } from './generateTiles';

function App() {
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
  
  const allTiles = Object.entries(tileCounts).flatMap(([key, val]) => {
    return Array(val).fill(key);
  });

  const [currentHand, setCurrentHand] = React.useState<string[]>(["="].concat(allTiles.sort(() => Math.random() - 0.5).slice(0, 9)));
  const [usedTilesInHandIdx, setUsedTilesInHandIdx] = React.useState<number[]>([]);

  const specialTiles = new Set(["3E", "3S", "2S", "2E"]);
  const initialPlacedTiles: string[][] = Array.from({length: 19}, () => Array(19).fill(""));
  const initialTilePositions: boolean[][] = Array.from({length: 19}, () => Array(19).fill(false));

  const [selectedTile, setSelectedTile] = React.useState<string | null>(null);
  const [placedTiles, setPlacedTiles] = React.useState<string[][]>(initialPlacedTiles);
  const [boardToRender, setBoardToRender] = React.useState<string[][]>(boardLayout);
  const [pendingTilePositions, setPendingTilePositions] = React.useState<boolean[][]>(initialTilePositions);
  const [totalScore, setTotalScore] = React.useState<number>(0);

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
    if (!usedTilesInHandIdx.includes(index)) {
      setSelectedTile(letter);
      setUsedTilesInHandIdx([...usedTilesInHandIdx, index]);
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

  const tilePendingOnBoard = (rowIndex: number, colIndex: number) => {
    return pendingTilePositions[rowIndex][colIndex];
  }

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (selectedTile) {
      const newPlacedTiles = [...placedTiles];
      newPlacedTiles[rowIndex][colIndex] = selectedTile;
      setPlacedTiles(newPlacedTiles);
      setSelectedTile(null);

      const newPendingTilePositions = [...pendingTilePositions];
      newPendingTilePositions[rowIndex][colIndex] = true;
      setPendingTilePositions(newPendingTilePositions);
    }
  };

  const getCurrentPlayScore = () => {
    let sum = 0;
    let multiplier = 1; // initialize multiplier to 1
    pendingTilePositions.forEach((row, rowIndex) => {
      row.forEach((isPending, colIndex) => {
        if (isPending) {
          const placedTile = placedTiles[rowIndex][colIndex];
          const tileScore = tileScores[placedTile];
          const boardSpace = boardLayout[rowIndex][colIndex];
          console.log(boardLayout)
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
    return sum * multiplier;
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

    setBoardToRender(newBoardToRender);
    setTotalScore(getCurrentPlayScore());
  }, [placedTiles])

  return (
    <div className="App">
      <div className="board-container">
        <div className="grid">
          {boardToRender.map((row, rowIndex) =>{
            return row.map((cellContent, colIndex) => {

              if (!specialTiles.has(cellContent) && cellContent != "") {
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

      <div>
        Total score: {totalScore}
      </div>

      <div className="hand">
        {currentHand.map((tile, index) => {
          return (

            <div
              key={index}
              className={`tile ${tile.length > 1 ? 'small-font' : ''}${tile === "=" ? 'equals' : ''} ${usedTilesInHandIdx.includes(index) ? 'used' : ''}`}
              data-letter={tile}
              onClick={() => handleTileInHandClick(tile, index)}
            />
          )})}
      </div>
    </div>
  );
}

export default App;
