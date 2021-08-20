import React from "react";
import "./grid.css";
import { icons } from "../../utils/icons";

let clickedTiles = []

class Grid extends React.Component {
  state = {
    tile_size: 50,
    background_color: "white",
    selecting: false,
  };

  componentWillMount() {
    const { grid } = this.props;
    const { rows, columns, tiles: specialTiles } = grid;
    const tiles = [];  // flat list of all the tiles

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

  setSelecting = (selecting) => {
    this.setState({ selecting });
  };

  getSelecting = () => this.state.selecting;


  handleClick = (i, method) => {
    const tiles = [...this.state.tiles];

    // tiles[i] = { ...tiles[i], selected: !tiles[i].selected };

    // this.setState({ tiles });

    // send info about tile that was selected currently
    this.props.sendMessage({
      "GridEvent": {
        "TILECLICKED":  [ tiles[i].col, tiles[i].row ]
      }
    })
  };

  handleReset = () => {
    this.componentWillMount();
  };

  handleSubmit = () => {
    // Get a list of all the selected tiles
    const { tiles } = this.state;
    const selected = tiles.filter((tile) => tile.selected);

    // Send that list was submitted and list of selected tiles
    // this.props.sendMessage({
    //   info: "submitted",
    //   selectedTileList: selected,
    // });
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
            text={tile.tile_type ? tile.tile_type.text : null}
            color={tile.tile_type ? tile.tile_type.color : null}
            bgcolor={tile.tile_type ? tile.tile_type.bgcolor : null}
            border={tile.tile_type ? tile.tile_type.border : null}
            icon={tile.tile_type ? tile.tile_type.icon : null}
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
      bgcolor,
      border,
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
          backgroundColor: bgcolor || "transparent",
          color,
          border: "solid "+ border,
          top: y,
          left: x,
          fontSize: size / 4,
        }}
        onMouseDown={() => {
          clickedTiles.push(index)
          setSelecting(true);
        }}
        onMouseUp={() => {
          setSelecting(false);
          clickedTiles.forEach(element => handleClick(element))
          clickedTiles.length=0
        }}
        onMouseEnter={() => {
          if (getSelecting()) {
            clickedTiles.push(index)
          }
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
