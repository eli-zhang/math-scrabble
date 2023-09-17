import React, { useEffect } from 'react';
import './App.css';
import { tileCount } from './tileInfo'
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
  
  const allTiles = Object.entries(tileCount).flatMap(([key, val]) => {
    return Array(val).fill(key);
  });

  const [currentHand, setCurrentHand] = React.useState<string[]>(["="].concat(allTiles.sort(() => Math.random() - 0.5).slice(0, 9)));

  const specialTiles = new Set(["3E", "3S", "2S", "2E"]);
  const initialPlacedTiles: string[][] = Array.from({length: 19}, () => Array(19).fill(""));

  const [selectedTile, setSelectedTile] = React.useState<string | null>(null);
  const [placedTiles, setPlacedTiles] = React.useState<string[][]>(initialPlacedTiles);
  const [boardToRender, setBoardToRender] = React.useState<string[][]>(boardLayout);

  const handleTileClick = (letter: string) => {
    setSelectedTile(letter);
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (selectedTile) {
      const newPlacedTiles = [...placedTiles];
      newPlacedTiles[rowIndex][colIndex] = selectedTile;
      setPlacedTiles(newPlacedTiles);
      setSelectedTile(null);
    }
  };
  
  React.useEffect(() => {
    const newBoardToRender = [...boardToRender];
    placedTiles.forEach((row, rowIndex) => {
      row.forEach((cellContent, colIndex) => {
        if (cellContent !== "") {
          newBoardToRender[rowIndex][colIndex] = cellContent;
        }
      });
    });
    setBoardToRender(newBoardToRender);
  }, [placedTiles])

  return (
    <div className="App">
      <div className="board-container">
        <div className="grid">
          {boardToRender.map((row, rowIndex) =>{
            return row.map((cellContent, colIndex) => {

              let cellColor = "rgb(108, 108, 213)"; // default color

              if (cellContent === "3E") { // if cell content is "3E", color it red
                cellColor = "rgb(173, 44, 158)";
              } else if (cellContent === "3S") { // if cell content is "3S", color it green
                cellColor = "rgb(7, 104, 86)";
              } else if (cellContent === "2E") { // if cell content is "3S", color it green
                cellColor = "rgb(80, 22, 121)";
              } else if (cellContent === "2S") { // if cell content is "3S", color it green
                cellColor = "rgb(44, 60, 178)";
              } else if (!specialTiles.has(cellContent) && cellContent != "") { // if cell content is not a special tile
                return (
                  <div 
                    key={`${rowIndex}-${colIndex}`}
                    // onClick={() => handleTileClick(cellContent)}
                    className={`grid-tile ${cellContent.length > 1 ? 'small-font' : ''}`}
                    data-letter={cellContent}
                  />
                );
              }

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="grid-cell"
                  style={{ backgroundColor: cellColor }}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cellContent}
                </div>
              );
            })
        })}
        </div>
      </div>

      <div className="all">
        {currentHand.map((tile, index) => {
          return (

            <div
              key={index}
              className={`tile ${tile.length > 1 ? 'small-font' : ''}${tile === "=" ? 'equals' : ''}`}
              data-letter={tile}
              onClick={() => handleTileClick(tile)}
            />
          )})}
      </div>

      {/* <div className="all">
      { Object.entries(tileCount).map(keyValArray => {
        const key = keyValArray[0];
        const val = keyValArray[1];
        return Array(val).fill(<div onClick={() => { handleTileClick(key) }} className={`tile ${key.length > 1 ? 'small-font' : ''}`} data-letter={key}/>).map((ele, index) => React.cloneElement(
          ele, { key: `${key}${index}` }
        ))
      })}
      </div> */}

    </div>
  );
}

export default App;
