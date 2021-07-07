import React from "react";
import "./grid.css";

class Grid extends React.Component {
  state = {
    tiles: [],
    tile_size: 50,
    background_color: "white",
    rows: 0,
    columns: 0,
  };

  componentDidMount() {
    const { grid } = this.props;
    const { rows, columns, tiles: specialTiles } = grid;
    const tiles = [];

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        tiles.push({ row: i, col: j });
      }
    }

    for (let tile of specialTiles) {
      const index = tile.row * columns + tile.col;

      tiles[index] = tile;
    }

    this.setState({ tiles, rows, columns });
  }

  handleClick = (i) => {
    const tiles = [...this.state.tiles];

    tiles[i] = { ...tiles[i], selected: !tiles[i].selected };

    this.setState({ tiles });
  };

  render() {
    const { tiles, rows, columns, tile_size, background_color } = this.state;

    return (
      <div
        className="grid"
        style={{
          width: columns * tile_size,
          height: rows * tile_size,
          backgroundColor: background_color,
        }}
      >
        {tiles.map((tile, i) => (
          <Tile
            size={tile_size}
            x={tile.col * tile_size}
            y={tile.row * tile_size}
            text={tile.text}
            color={tile.color}
            selected={tile.selected}
            key={i}
            index={i}
            handleClick={this.handleClick}
          />
        ))}
      </div>
    );
  }
}

class Tile extends React.Component {
  render() {
    const { size, color, text, x, y, selected, index, handleClick } =
      this.props;

    return (
      <div
        className={`tile noselect ${selected ? "selectedTile" : ""}`}
        style={{
          width: size,
          height: size,
          backgroundColor: color || "transparent",
          top: y,
          left: x,
        }}
        onClick={() => handleClick(index)}
      >
        {text}
      </div>
    );
  }
}

export default Grid;
