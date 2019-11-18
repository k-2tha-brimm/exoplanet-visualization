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
      xVal: 'S. Radius (SU)',
      yVal: 'S. Distance (pc)'
    }
    
    this.handleChange = this.handleChange.bind(this);
  }


  componentDidMount() {
    let arr = [];
    let cols, x, y;

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
      this.populateHisto("x");
      this.populateHisto("y");
      this.populateScatter();
    })
  }

  componentDidUpdate(prevState) {
    if (this.state.xVal !== prevState.xVal) {
      this.populateHisto("x");
      this.populateScatter();
    }
    
    if (this.state.yVal !== prevState.yVal) {
      this.populateHisto("y");
      this.populateScatter();
    }
  }

  populateHisto(val) {
    let flag = false;
    let value;

    if (val === "y") {
      if (this.state.yVal) {
        flag = true;
        value = this.state.yVal;
      }
    } else {
      if (this.state.xVal) {
        flag = true;
        value = this.state.xVal;
      }
    }

    if (flag) {

      let data = this.state.data.map(datum => {
        return datum[value];
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
      
      d3.select(`.${val}-axis-histogram`).select("svg").remove();
      let container = d3.select(`.${val}-axis-histogram`)
        .append("svg")
        .attr("width", width)
        .attr("height", 200)
      
      let g = container.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      let x = d3.scaleLinear()
        .domain(d3.extent(data))
        .rangeRound([0, width])

      let histogram = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(10));

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

populateScatter() {

  let xData = this.state.data.map(datum => {
    if (!isNaN(parseInt(datum[this.state.xVal]))) {
      return parseInt(datum[this.state.xVal]);
    } else {
      return;
    }
  });

  
  let yData = this.state.data.map(datum => {
    if (!isNaN(parseInt(datum[this.state.yVal]))) {
      return parseInt(datum[this.state.yVal]);
    } else {
      return;
    }
  });
  
  console.log(d3.extent(yData));
  d3.select(`.scatter`).select("svg").remove();
  let container = d3.select(".scatter")
                    .append("svg")
                      .attr("width", 1200)
                      .attr("height", 650)
                    .append("g")
                      .attr("transform", "translate(" + 20 + "," + 30 + ")");

  let x = d3.scaleLinear()
    .domain(d3.extent(xData))
    .rangeRound([0, 1200])

  container.append("g")
    .attr("transform", "translate(30," + 340 + ")")
    .call(d3.axisBottom(x));

  let y = d3.scaleLinear()
    .domain(d3.extent(yData))
    .range([350, 0])     
    
  container.append("g")
    .attr("transform", "translate(30" + -10 + ")")
    .call(d3.axisLeft(y));

  container.append("g")
    .selectAll("dot")
    .data(this.state.data)
    .enter()
    .append("circle")
      .attr("cx", d => { return x(d[this.state.xVal]) })
      .attr("cy", d => { return y(d[this.state.yVal]) })
      .attr("r", 1.5)
      .style("fill", "black")
      .attr("transform", "translate(30" + -10 + ")");
}

  handleChange(e, val) {
    if (val === "x") {
      this.setState({ xVal: e.currentTarget.value });
      this.populateHisto("x");
    } else if (val === "y") {
      this.setState({ yVal: e.currentTarget.value });
      this.populateHisto("y");
    }
  }

  render() {

    let values = this.state.columns.filter(column => {
      return !STRINGS.includes(column);
    });

    let renderedValues = values.map((column, idx) => {
      return (
        <option key={idx} value={column} disabled="">{column}</option>
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
            <select onChange={(e) => this.handleChange(e, "x")}>
              {renderedValues}
            </select>
            <p>You have selected {this.state.xVal || `nothing, yet!`}</p>
            <div className="x-axis-histogram"></div>
          </div>
          <div className="selector-container">
            <label>Y-Axis</label>
            <br />
            <select onChange={(e) => this.handleChange(e, "y")}>
              {renderedValues}
            </select>
            <p>You have selected {this.state.yVal || `nothing, yet!`}</p>
            <div className="y-axis-histogram"></div>
          </div>
        </div>

        <h1 className="scatter-title">{this.state.xVal} vs. {this.state.yVal}</h1>
        <div className="scatterplot-container">
          <div className="scatter"></div>
        </div>

      </div>
    );
  }
}

export default App;
