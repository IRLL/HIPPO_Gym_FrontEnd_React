import React from "react";
import "./grid.css";
import { icons } from "../../utils/icons";

let clickedTiles = []
let updatedTiles = []
let currentTiles = []

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

    // calculate max dimensions for grid window
    let maxSize = {
      maxWidth: document.documentElement.clientWidth/2,
      maxHeight: document.documentElement.clientHeight/1.2,
    }

    // calculate size for each tile
    if ( columns * this.state.tile_size > maxSize.maxWidth) {
      this.setState({
        tile_size: maxSize.maxWidth/columns
      })
      if (rows * this.state.tile_size > maxSize.maxHeight) {
        this.setState({
          tile_size: maxSize.maxHeight/rows
        })
      }
    }
  }

  componentDidMount() {
    this.props.setResetGrid(this.handleReset);
    // this.props.setSubmitGrid(this.handleSubmit);
  }

  setSelecting = (selecting) => {
    this.setState({ selecting });
  };

  getSelecting = () => this.state.selecting;

  handleHighlight = (i) => {
    // highlight currently clicked tiles
    currentTiles[i] = { ...currentTiles[i], highlighted: true}

    this.setState({ tiles: currentTiles });
  }

  removeHighlight = (i) => {
    // remove highlight when selection is done
    updatedTiles[i] = { ...updatedTiles[i], highlighted: false}

    this.setState({ tiles: updatedTiles })
  }

  handleClick = (i) => {
    // send info about the curretnly selected tile
    this.props.sendMessage({
      "GridEvent": {
        "TILECLICKED":  [ this.state.tiles[i].col, this.state.tiles[i].row ]
      }
    })
  };

  handleReset = () => {
    this.componentWillMount();
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
        onMouseLeave={() => {
          this.setSelecting(false);
          clickedTiles.forEach(element => this.handleClick(element))
          clickedTiles.forEach(element => this.removeHighlight(element))
          clickedTiles.length=0
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
            highlighted={tile.highlighted}
            key={i}
            index={i}
            handleClick={this.handleClick}
            handleHighlight={this.handleHighlight}
            removeHighlight={this.removeHighlight}
            getSelecting={this.getSelecting}
            setSelecting={this.setSelecting}
            tiles={tiles}
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
      highlighted,
      index,
      handleClick,
      handleHighlight,
      removeHighlight,
      getSelecting,
      setSelecting,
      icon,
      image,
      tiles,
    } = this.props;
    return (
      <div
        className={`tile noselect ${highlighted ? "highlightedTile" : ""}`}
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
          currentTiles = [...tiles]
          clickedTiles.push(index)
          handleHighlight(index)
          setSelecting(true);
        }}
        onMouseUp={() => {
          setSelecting(false);
          clickedTiles.forEach(element => handleClick(element))
          updatedTiles = [...currentTiles]
          clickedTiles.forEach(element => removeHighlight(element))
          clickedTiles.length=0
        }}
        onMouseEnter={() => {
          if (getSelecting()) {
            clickedTiles.push(index)
            handleHighlight(index)
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
