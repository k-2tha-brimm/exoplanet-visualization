import React from 'react';
import './App.css';
import * as d3 from 'd3';
import data from './exoplanets.csv';

let STRINGS = [
  "P. Name",
  "P. Name Kepler",
  "P. Name KOI",
  "P. Zone Class",
  "P. Mass Class",
  "P. Composition Class",
  "P. Atmosphere Class",
  "P. Habitable Class",
  "S. Name",
  "S. Name HD",
  "S. Name HIP",
  "S. Constellation",
  "S. Type",
  "P. Disc. Method"
]

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      columns: [],
      xVal: '',
      yVal: ''
    }

    this.handleXChange = this.handleXChange.bind(this);
    this.handleYChange = this.handleYChange.bind(this);
  }


  componentDidMount() {
    let arr = [];
    let cols;

    // Load the data from the CSV and save it in an array
    d3.csv(data, function(data) {
      arr.push(data);
    }).then(datum => {
      cols = datum.columns;
    }).then(() => {
      this.setState({
        data: arr,
        columns: cols
      })
    })
  }

  handleXChange(e) {
    this.setState({ xVal: e.currentTarget.value });
  }

  handleYChange(e) {
    this.setState({ yVal: e.currentTarget.value });
  }

  render() {

    let values = this.state.columns.filter(column => {
      return !STRINGS.includes(column);
    });

    let renderedValues = values.map((column, idx) => {
      return (
        <option key={idx} value={column}>{column}</option>
      )
    });

    return (
      <div className="App">
        <header className="top-bar">
          Exoplanet Project
        </header>

        <div className="histogram-container">
          <div className="x-axis-selector-container">
            <select onChange={(e) => this.handleXChange(e)}>
              {renderedValues}
            </select>
            <p>You have selected {this.state.xVal || `nothing, yet!`}</p>
          </div>
          <div className="y-axis-selector-container">
            <select onChange={(e) => this.handleYChange(e)}>
              {renderedValues}
            </select>
            <p>You have selected {this.state.yVal || `nothing, yet!`}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
