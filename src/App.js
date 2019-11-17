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

  populateXHisto() {

      if (this.state.xVal) {

        let data = this.state.data.map(datum => {
          return datum[this.state.xVal];
        });

        let formatCount = d3.format(",.0f");
        let margin = {
                top: 10,
                right: 30,
                bottom: 30,
                left: 30
              }

        let width = 600;
        let height = 120;
        
        let container = d3.select(".x-axis-histogram")
          .append("svg")
          .attr("width", width)
          .attr("height", 200)
        
        let g = container.append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        let x = d3.scaleLinear()
          .domain(d3.extent(data))
          .rangeRound([0, width])

        let histogram = d3.histogram()
          .domain(x.domain())
          .thresholds(x.ticks(5));

        let bins = histogram(data);

        let y = d3.scaleLinear()
          .domain([0, d3.max(bins, function(d) {
            return d.length;
          })])
          .range([height, 0]);

        let bar = g.selectAll(".bar")
          .data(bins)
          .enter().append("g")
          .attr("class", "bar")
          .attr("transform", function(d) {
            return "translate(" + x(d.x0) + "," + y(d.length) + ")";
          });

          bar.append("rect")
            .attr("x", 1)
            .attr("width", x(bins[0].x1) - x(bins[0].x0) - 2)
            .attr("height", function(d) {
              return height - y(d.length);
            });
      
        bar.append("text")
          .attr("dy", ".75em")
          .attr("y", 6)
          .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
          .attr("text-anchor", "middle")
          .text(function(d) {
            return formatCount(d.length);
          });

        g.append("g")
          .call(d3.axisLeft(y).tickFormat(d => {
            return d;
          }).ticks(5));

        let xAxis = d3.axisBottom(x)
                    .scale(x);

        container.append("g")

        let xAxisTranslate = height + 10;

        container.append("g")
          .attr("transform", "translate(" + margin.left + "," + xAxisTranslate + ")")
          .call(xAxis)
      }
  }

  populateYHisto() {

    if (this.state.yVal) {

      let data = this.state.data.map(datum => {
        return datum[this.state.yVal];
      });

      let formatCount = d3.format(",.0f");
      let margin = {
              top: 10,
              right: 30,
              bottom: 30,
              left: 30
            }
      let width = 600;
      let height = 120;
      
      let container = d3.select(".y-axis-histogram")
        .append("svg")
        .attr("width", width)
        .attr("height", 200)
      
      let g = container.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      let x = d3.scaleLinear()
        .domain(d3.extent(data))
        .rangeRound([0, width])

      let histogram = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(5));

      let bins = histogram(data);

      let y = d3.scaleLinear()
        .domain([0, d3.max(bins, function(d) {
          return d.length;
        })])
        .range([height, 0]);

      let bar = g.selectAll(".bar")
        .data(bins)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) {
          return "translate(" + x(d.x0) + "," + y(d.length) + ")";
        });

        bar.append("rect")
        .attr("x", 1)
        .attr("width", x(bins[0].x1) - x(bins[0].x0) - 2)
        .attr("height", function(d) {
          return height - y(d.length);
        });
    
      bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
        .attr("text-anchor", "middle")
        .text(function(d) {
          return formatCount(d.length);
        });
    
        g.append("g")
          .call(d3.axisLeft(y).tickFormat(d => {
            return d;
          }).ticks(5));

        let xAxis = d3.axisBottom(x)
                    .scale(x);

        container.append("g")

        let xAxisTranslate = height + 10;

        container.append("g")
          .attr("transform", "translate(" + margin.left + "," + xAxisTranslate + ")")
          .call(xAxis)
    }
}

  handleXChange(e) {
    this.setState({ xVal: e.currentTarget.value });
    this.populateXHisto();
  }

  handleYChange(e) {
    this.setState({ yVal: e.currentTarget.value });
    this.populateYHisto();
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
          <div className="selector-container">
            <label>X-Axis</label>
            <br />
            <select onChange={(e) => this.handleXChange(e)}>
              {renderedValues}
            </select>
            <p>You have selected {this.state.xVal || `nothing, yet!`}</p>
            <div className="x-axis-histogram"></div>
          </div>
          <div className="selector-container">
            <label>Y-Axis</label>
            <br />
            <select onChange={(e) => this.handleYChange(e)}>
              {renderedValues}
            </select>
            <p>You have selected {this.state.yVal || `nothing, yet!`}</p>
            <div className="y-axis-histogram"></div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
