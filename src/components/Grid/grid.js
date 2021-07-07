import React from "react";
import "./grid.css";

class Grid extends React.Component {
  render() {
    const { grid } = this.props;
    const { rows, columns, tiles } = grid;
    const tile_size = 50;

    return (
      <div
        className="grid"
        style={{
          position: "relative",
          width: columns * tile_size,
          height: rows * tile_size,
        }}
      >
        {tiles.map((tile, i) => {
          if (tile.type === "text")
            return (
              <TextTile
                size={tile_size}
                text={tile.value}
                x={tile.col * tile_size}
                y={tile.row * tile_size}
                key={i}
              />
            );
          if (tile.type === "color")
            return (
              <ColorTile
                size={tile_size}
                color={tile.value}
                x={tile.col * tile_size}
                y={tile.row * tile_size}
                key={i}
              />
            );
        })}
      </div>
    );
  }
}

class TextTile extends React.Component {
  render() {
    const { size, text, x, y } = this.props;
    return (
      <div
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          position: "absolute",
          top: y,
          left: x,
          outline: "solid 1px black",
          display: "grid",
          placeItems: "center",
        }}
      >
        {text}
      </div>
    );
  }
}

class ColorTile extends React.Component {
  render() {
    const { size, color, x, y } = this.props;

    return (
      <div
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          position: "absolute",
          top: y,
          left: x,
          outline: "solid 1px black",
        }}
      />
    );
  }
}

export default Grid;
