import React, { useEffect } from 'react';
import './App.css';
import { tileCount } from './tileInfo'
import { configureTiles } from './generateTiles';

function App() {
  useEffect(() => {
    configureTiles();
  }, [])

  const cellContents = [
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

  return (
    <div className="App">
      {/* <div className="rack">
        
        <div className="tile" data-letter="1"/>
        <div className="tile" data-letter="1"/>
        <div className="tile" data-letter="1"/>
        <div className="tile" data-letter="1"/>
        <div className="tile" data-letter="1"/>
        <div className="tile" data-letter="1"/>
        <div className="tile" data-letter="1"/>
        <div className="tile" data-letter="1"/>
        <div className="tile" data-letter="1"/>
      </div> */}
      <div className="grid">
        {cellContents.map((row, rowIndex) =>{
          return row.map((cellContent, colIndex) => {

            let cellColor = "rgb(108, 108, 213)"; // default color

            if (cellContent === "3E") { // if cell content is "3E", color it red
              cellColor = "red";
            } else if (cellContent === "3S") { // if cell content is "3S", color it green
              cellColor = "green";
            } else if (cellContent === "2E") { // if cell content is "3S", color it green
              cellColor = "purple";
            } else if (cellContent === "2S") { // if cell content is "3S", color it green
              cellColor = "blue";
            }

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="grid-cell"
                style={{ backgroundColor: cellColor }}
              >
                {cellContent}
              </div>
            );
          })
})}
      </div>
      <div className="all">
      { Object.entries(tileCount).map(keyValArray => {
        const key = keyValArray[0];
        const val = keyValArray[1];
        return Array(val).fill(<div className={`tile ${key.length > 1 ? 'small-font' : ''}`} data-letter={key}/>).map((ele, index) => React.cloneElement(
          ele, { key: `${key}${index}` }
        ))
      })}

      </div>

    </div>
  );
}

export default App;
