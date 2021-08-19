import React from "react";
import "./grid.css";
import { icons } from "../../utils/icons";

class Grid extends React.Component {
  state = {
    tile_size: 50,
    background_color: "white",
    selecting: false,
  };

  componentWillMount() {
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

  componentDidMount() {
    this.props.setResetGrid(this.handleReset);
    this.props.setSubmitGrid(this.handleSubmit);
  }

  handleClick = (i, method) => {
    const tiles = [...this.state.tiles];

    const selected = tiles[i].selected;

    tiles[i] = { ...tiles[i], selected: !tiles[i].selected };

    this.setState({ tiles });

    // send info about tile that was selected currently
    // this.props.sendMessage({
    //   "GridEvent": {
    //     "TILECLICKED":  [ tiles[i].col, tiles[i].row ]
    //   }
    // })
  };

  handleReset = () => {
    this.componentWillMount();
  };

  handleSubmit = () => {
    // Get a list of all the selected tiles
    const { tiles } = this.state;
    const selected = tiles.filter((tile) => tile.selected);

    // Send that list was submitted and list of selected tiles
    this.props.sendMessage({
      info: "submitted",
      selectedTileList: selected,
    });
  };

  setSelecting = (selecting) => {
    this.setState({ selecting });
  };

  getSelecting = () => this.state.selecting;

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
            icon={tile.icon}
            image={tile.image ? "data:image/jpeg;base64, " + tile.image : null}
            selected={tile.selected}
            key={i}
            index={i}
            handleClick={this.handleClick}
            getSelecting={this.getSelecting}
            setSelecting={this.setSelecting}
          />
        ))}
      </div>
    );
  }
}

class Tile extends React.Component {
  render() {
    const {
      size,
      color,
      text,
      x,
      y,
      selected,
      index,
      handleClick,
      getSelecting,
      setSelecting,
      icon,
      image,
    } = this.props;
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
        onMouseDown={() => {
          handleClick(index);
          setSelecting(true);
        }}
        onMouseUp={() => {
          setSelecting(false);
        }}
        onMouseEnter={() => {
          if (getSelecting()) handleClick(index);
        }}
      >
        {text}
        {icon ? icons[icon] : null}
        {image ? (
          <img
            src={image}
            style={{ width: size - 1, height: size - 1 }}
            alt="grid"
          />
        ) : null}
      </div>
    );
  }
}

export default Grid;
