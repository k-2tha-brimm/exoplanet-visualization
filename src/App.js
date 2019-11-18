import React from 'react';
import './App.css';
import * as d3 from 'd3';
import data from './exoplanets.csv';

// List of columns with non-numeric values. We will use this
// to filter out columns that should not be included in our dropdown.
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
  // Set two default values for x and y axes
  // Data and columns will be populated from the csv when the component mounts
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
    let cols;
    // Load the data from the CSV and save it in an array
    d3.csv(data, function(data) {
      arr.push(data);
    }).then(datum => {
      cols = datum.columns;
    }).then(() => {
      // Then set our state so that we can access the columns that we need
      this.setState({
        data: arr,
        columns: cols
      })
      // Populate the two histograms and the scatterplot
      this.populateHisto("x");
      this.populateHisto("y");
      this.populateScatter();
    })
  }

  componentDidUpdate(prevState) {
    if (this.state.xVal !== prevState.xVal) {
      // If X changes update the x histo and the scatter plot
      this.populateHisto("x");
      this.populateScatter();
    }
    // If Y changes update the y histo and the scatter plot
    if (this.state.yVal !== prevState.yVal) {
      this.populateHisto("y");
      this.populateScatter();
    }
  }

  populateHisto(val) {
    let flag = false;
    let value;
    // I wanted to perform a check here so that we can use this
    // method to populate both histograms depending on which value is updated
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
      // I only want the data that is relevant. Data is an object, so I can key in at the value
      // that is passed to this function on change. I want to save this in a variable called data.
      let data = this.state.data.map(datum => {
        return datum[value];
      });

      let margin = {
              top: 10,
              right: 30,
              bottom: 30,
              left: 30
            }
      let width = 600;
      let height = 120;
      
      // Remove the previous SVG from the appropriate histogram
      d3.select(`.${val}-axis-histogram`).select("svg").remove();

      // Now create a new SVG to populate with our newly selected value
      let container = d3.select(`.${val}-axis-histogram`)
        .append("svg")
        .attr("width", width)
        .attr("height", 200)
      
      let g = container.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
      // Setting up my x scale using the [min, max] values that
      // are the result of d3.extent(data)
      let x = d3.scaleLinear()
        .domain(d3.extent(data))
        .rangeRound([0, width])

      // Setting up our histogram, and telling it how many bins we would like
      let histogram = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(40));

      let bins = histogram(data);

      // Setting up our y scale using the bins that we have established earlier
      // in the domain.
      let y = d3.scaleLinear()
        .domain([0, d3.max(bins, function(d) {
          return d.length;
        })])
        .range([height, 0]);

      // Add the bars to our histogram
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
    
        // From here through the end of the function we are setting up our axes
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
  // Similar to populating the histograms, we want to grab the data that we care about from
  // state and save it in two variables this time, x and y.
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
  
  // As before, we want to remove the old scatter to make way for the new one
  d3.select(`.scatter`).select("svg").remove();

  // Initialize a new scatter
  let container = d3.select(".scatter")
                    .append("svg")
                      .attr("width", 1200)
                      .attr("height", 450)
                    .append("g")
                      .attr("transform", "translate(" + 20 + "," + 30 + ")");

  // Set up our x scale and then add the x axis using axisBottom
  let x = d3.scaleLinear()
    .domain(d3.extent(xData))
    .rangeRound([0, 1200])

  container.append("g")
    .attr("transform", "translate(30," + 340 + ")")
    .call(d3.axisBottom(x));

  // Set up our y scale and then add the y axis using axisLeft
  let y = d3.scaleLinear()
    .domain(d3.extent(yData))
    .range([350, 0])     
    
  container.append("g")
    .attr("transform", "translate(30" + -10 + ")")
    .call(d3.axisLeft(y));

  // With bar charts we use rect, but for a scatter we need to use circles
  // We define the x value and the y values on lines 230 and 231 and then
  // provide styling and transform coordinates below
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
    // Here we just want one function that can handle a new value
    // being selected from one of the dropdowns.
    if (val === "x") {
      this.setState({ xVal: e.currentTarget.value });
      this.populateHisto("x");
    } else if (val === "y") {
      this.setState({ yVal: e.currentTarget.value });
      this.populateHisto("y");
    }
  }

  render() {
    // Filtering out any columns that have non-numeric values
    let values = this.state.columns.filter(column => {
      return !STRINGS.includes(column);
    });

    // Map those values to options in our select element
    let renderedValues = values.map((column, idx) => {
      return (
        <option key={idx} value={column} disabled="">{column}</option>
      )
    });

    return (
      <div className="App">
        <header className="top-bar">
          Exoplanet Data Explorer
        </header>

        <div className="histogram-container">
          <div className="selector-container">
            <label>X-Axis</label>
            <br />
            <select onChange={(e) => this.handleChange(e, "x")} className="select-css">
              {renderedValues}
            </select>
            <p>You have selected {this.state.xVal || `nothing, yet!`}</p>
            <div className="x-axis-histogram"></div>
          </div>
          <div className="selector-container">
            <label>Y-Axis</label>
            <br />
            <select onChange={(e) => this.handleChange(e, "y")} className="select-css">
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