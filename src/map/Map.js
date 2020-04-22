import React, { Component } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import { GeoJSON, Map, LayersControl, TileLayer } from 'react-leaflet';
import stateData from '../data/states_geo.json';
import countyData from '../data/counties_geo.json';
import oceanData from '../data/oceans_geo';
import {StateDictionary} from "../util/constants";
import { subscribeToBlocks } from '../util/SocketUtils';
import {
  navigate
} from "@reach/router";
import {VirusTypes, Channels} from "../util/constants";
import * as Chart from 'chart.js';
import {groupBy} from 'lodash';
import * as moment from 'moment';

const { BaseLayer } = LayersControl;

const viewport = {
  center: [37.8, -96],
  zoom: 5
};

const DataType = {
  total: 0,
  negative: 1,
  positive: 2,
  recovered: 3,
  deceased: 4
};


function DataContainer(props) {
  function test() {
    props.changeDataType();
  }

  const dataContainerStyles = {
    width: '100%',
    height: '100px',
    marginBottom: '10px',
    paddingTop: '7px',
    backgroundColor: 'black',
    borderRadius: '5px',
    textAlign: 'center',
    cursor: 'pointer'
  };

  return (
      <div
          style={{
            ...dataContainerStyles,
            ...props.containerSpecificStyles,
          }}
          onClick={test}
      >
        <span style={{fontWeight: '100', fontSize: 'small'}}>{props.title}</span>
        <br/>
        <span style={{fontWeight: '600', fontSize: '50px'}}>{props.count}</span>
      </div>
  );
}

function StatesBreakdown(props) {
  const stateData = Object.keys(props.stateCounts).sort().map((stateAbbrv, index) => {
    return (
        <div key={index} style={{margin: '10px', borderBottom: '1px white solid'}}>
          <span
              style={{
                fontWeight: 'bold',
                fontSize: 'smaller',
                marginRight: '5px',

              }}
          >
            {props.stateCounts[stateAbbrv]}
          </span>
          <span
              style={{
                color: 'white',
                fontSize: 'smaller'
              }}
          >
            {StateDictionary[stateAbbrv]}
          </span>
        </div>
    )
  });

  return (
    <div
        style={{
          backgroundColor: 'black',
          borderRadius: '5px',
          paddingTop: '7px',
          borderBottom: '10px',
          height: '50%',
          ...props.containerSpecificStyles
        }}
    >
      <div
          style={{
            textAlign: 'center',
            color: 'white',
            fontSize: 'smaller',
            marginBottom: '10px'
          }}
      >
        Confirmed Cases by State
      </div>
      <div style={{overflowY: 'auto', maxHeight: '90%'}}>
        {stateData}
      </div>
    </div>
  );
}

class ResultsMap extends Component {
  constructor(props) {
    super(props);
    let self = this;
    this.stateData = stateData;
    this.countyData = countyData;
    this.stateList = {};
    this.countyList = {};

    subscribeToBlocks(function (err, blocks) {

    });

    // set the size of increments to use before changing to the next color level
    this.colorRangeSize = 10;

    this.yellowLegend = [
      "rgb(250,246,212)",
      "rgb(250,246,180)",
      "rgb(250,246,140)",
      "rgb(250,200,100)",
      "rgb(200,150,60)",
      "rgb(160,100,20)",
      "rgb(140,80,2)"
    ];

    this.blueLegend = [
      "rgb(202,227,255)",
      "rgb(126,186,255)",
      "rgb(49,146,255)",
      "rgb(39,117,204)",
      "rgb(29,86,150)",
      "rgb(1,61,127)",
      "rgb(1,34,71)"
    ];

    this.redLegend = [
        "rgb(255,230,230)",
        "rgb(255,150,150)",
        "rgb(255,100,100)",
        "rgb(255,70,70)",
        "rgb(163,45,45)",
        "rgb(100,30,30)",
        "rgb(80,10,10)"
    ];

    this.greenLegend = [
      "rgb(225,255,222)",
      "rgb(145,250,150)",
      "rgb(5,200,5)",
      "rgb(5,150,5)",
      "rgb(5,100,5)",
      "rgb(5,75,30)",
      "rgb(5,50,5)"
    ];

    this.blackLegend = [
      "rgb(175,175,175)",
      "rgb(150,150,150)",
      "rgb(125,125,125)",
      "rgb(100,100,100)",
      "rgb(50,50,50)",
      "rgb(25,25,25)",
      "rgb(0,0,0)"
    ];

    // store all color values
    this.colorLegend = this.yellowLegend;

    this.stateData.features.forEach(value => {
      self.stateList[value.properties.STATE] = {
        name: value.properties.NAME,
        abbreviation: value.properties.ABBREVIATION
      }
    });

    this.state = {
      data: [],
      viewport: viewport,
      stateCounts: {},
      countyCounts: {},
      totalCount:0,
      positiveCount: 0,
      negativeCount: 0,
      recoveredCount: 0,
      deathCount: 0,
      currentDataType: DataType.total
    };



    this.handleStateFeature = function (feature, layer) {
      layer.bindPopup(self.getStatePopupContent);
      layer.on({
        click: function () {
          let stateAbbreviation = feature.properties.ABBREVIATION;
          let stateCount = self.state.stateCounts[stateAbbreviation];
          if (stateCount > 0) {
            navigate('state/' + stateAbbreviation);
          }
        },
        mouseover: function () {
          if (self.getStateCount(feature) > 0 && !layer.isPopupOpen()) {
            console.log("Moused over: " + feature.properties.ABBREVIATION);
            this.openPopup();
          }
        },
        mouseout: function () {
          if (self.getStateCount(feature) > 0 && layer.isPopupOpen()) {
            console.log("Moused out: " + feature.properties.ABBREVIATION);
            this.closePopup();
          }
        }
      });
    }

    this.getCountyCount = function (feature) {
      let countyIdentifier = self.findStateAbbreviation(feature.properties.STATE) + "_" + feature.properties.NAME;
      return self.state.countyCounts[countyIdentifier];
    }

    this.getStateCount = function (feature) {
      return self.state.stateCounts[feature.properties.ABBREVIATION];
    }

    this.getStatePopupContent = function (layer) {
      return "State of " + self.findStateAbbreviation(layer.feature.properties.STATE) + " has " + self.getStateCount(layer.feature) + " incidents.";
    }
    this.getCountyPopupContent = function (layer) {
      return "County of " + layer.feature.properties.NAME + "/" + self.findStateAbbreviation(layer.feature.properties.STATE) + " has " + self.getCountyCount(layer.feature) + " incidents.";
    }

    this.handleCountyFeature = function (feature, layer) {
      layer.bindPopup(self.getCountyPopupContent);
      layer.on({
        click: function () {
          // click on county does what?
        },
        mouseover: function () {
          if (self.getCountyCount(feature) > 0 && !layer.isPopupOpen()) {
            let countyIdentifier = self.findStateAbbreviation(feature.properties.STATE) + "_" + feature.properties.NAME;
            console.log("Moused over: " + countyIdentifier);
            this.openPopup();
          }
        },
        mouseout: function () {
          if (self.getCountyCount(feature) > 0 && !layer.isPopupOpen()) {
            let countyIdentifier = self.findStateAbbreviation(feature.properties.STATE) + "_" + feature.properties.NAME;
            console.log("Moused out: " + countyIdentifier);
            this.closePopup();
          }
        }
      });
    };

    this.getColor = function(numberOfCases) {
      if (numberOfCases && numberOfCases > 0) {
        let range = Math.floor(numberOfCases / self.colorRangeSize)
        range = Math.min(range, self.colorLegend.length);

        return self.colorLegend[range];
      }

      return null;
    };

    this.styleByCount = function (feature, count) {
      let fillColor = self.getColor(count);
      let style = {
        fillColor: fillColor,
        weight: 1,
        opacity: 1,
        color: 'black',
        fillOpacity: 1
      };
      
      if (fillColor != null) {
        style.fillOpacity = 1;
      } else {
        // make the color almost transparent
        style.fillOpacity = 0.10;
      }

      return style;
    }

    this.findStateAbbreviation = function (stateId) {
      return this.stateList[stateId] !== undefined ? this.stateList[stateId].abbreviation : null;
    }
    this.styleState = function (feature) {
      return self.styleByCount(feature, self.getStateCount(feature));
    }

    this.styleCounty = function (feature) {
      return self.styleByCount(feature, self.getCountyCount(feature));
    }

    this.changeDataType = this.changeDataType.bind(this);
    this.setSvgLegend = this.setSvgLegend.bind(this);
    this.updateChart = this.updateChart.bind(this);
  }

  changeDataType(dataType) {
    let svgLegend = d3.select('#legend');

    let stateCounts = {};
    let countyCounts = {};
    let filteredData = [];
    let currentDataType;
    switch(dataType){
      case DataType.negative:
        this.colorLegend = this.blueLegend;
        filteredData = this.state.data.filter(element => element.Record.Result.toLowerCase() === 'negative');
        currentDataType = DataType.negative;
        break;
      case DataType.positive:
        this.colorLegend = this.redLegend;
        filteredData = this.state.data.filter(element => element.Record.Result.toLowerCase() === 'positive');
        currentDataType = DataType.positive;
        break;
      case DataType.recovered:
        this.colorLegend = this.greenLegend;
        filteredData = this.state.data.filter(element => element.Record.Status.toLowerCase() === 'recovered');
        currentDataType = DataType.recovered;
        break;
      case DataType.deceased:
        this.colorLegend = this.blackLegend;
        filteredData = this.state.data.filter(element => element.Record.Status.toLowerCase() === 'deceased');
        currentDataType = DataType.deceased;
        break;
      default:
        this.colorLegend = this.yellowLegend;
        filteredData = this.state.data;
        currentDataType = DataType.total;
        break;
    }

    this.setSvgLegend();

    filteredData.forEach(element => {

      stateCounts[element.Record.state] = stateCounts[element.Record.state] === undefined ? 1 : ++stateCounts[element.Record.state];

      let countyIdentifier = element.Record.state + "_" + element.Record.county;
      countyCounts[countyIdentifier] = countyCounts[countyIdentifier] === undefined ? 1 : ++countyCounts[countyIdentifier];
      // Assuming county is full FIPS identifier of state and county. Otherwise need to concat state + county
      // countyCounts[element.Record.county] = countyCounts[element.Record.county] === undefined ? 1 : ++countyCounts[element.Record.county];
    });

    this.setState({
      stateCounts: stateCounts,
      countyCounts: countyCounts,
      currentDataType: currentDataType
    });
  }

  setSvgLegend() {
    console.log(this.colorLegend);
    let svgLegend = d3.select('#legend');
    // inject standard D3 code
    svgLegend.append("g")
        .selectAll("rect")
        .data(this.colorLegend)
        .enter()
        .append("rect")
        .attr("fill", (function (d, i) { return this.colorLegend[i]; }).bind(this))
        .attr("x", (function (d, i) { return (i * 30); }).bind(this))
        .attr("y", 0)
        .attr("width", 30)
        .attr("height", 20);

    // add numbers as labels
    let labelsLegend = [];
    let range = 0;
    do {
      if (range === 0) {
        labelsLegend.push("1");
      } else {
        labelsLegend.push(range + (labelsLegend.length === this.colorLegend.length - 1 ? "+" : ""));
      }
      range += this.colorRangeSize;
    } while (labelsLegend.length < this.colorLegend.length);

    svgLegend.append("g")
        .selectAll("text")
        .data(labelsLegend)
        .enter()
        .append("text")
        .attr("class", "legend-text")
        .attr("x", function (d, i) { return (i * 30) + 8; })
        .attr("y", 35)
        .text(function (d) { return d; });
  }

  chart;

  updateChart() {
    if(this.chart) this.chart.clear();
    var ctx = document.getElementById('myChart').getContext('2d');

    let labels = [];
    let data = [];
    let color;
    let sortedData;
    let values;

    function convertDate(element) {
      element.Record.DateTime = moment(element.Record.DateTime).format('MM/DD/YYYY');
      return element;
    }

    function sortByDate(a, b) {
      return b.Record.DateTime - a.Record.DateTime;
    }

    function parseChartData(input) {
      let count = 0;
      const dateGroups = groupBy(input, function(o) { return o.Record.DateTime });
      labels = Object.keys(dateGroups).map(key => new Date(key));
      data = [];
      Object.keys(dateGroups)
          .map(key => dateGroups[key].length)
          .forEach(cases => {
            count += cases;
            data.push(count);
          });

      return {labels, data};
    }

    switch(this.state.currentDataType) {
      case DataType.total:
        sortedData = this.state.data.map(convertDate).sort(sortByDate);
        values = parseChartData(sortedData);
        labels = values.labels;
        data = values.data;
        color = 'yellow';
        break;
      case DataType.positive:
        sortedData = this.state.data
            .map(convertDate)
            .filter(element => element.Record.Result.toLowerCase() !== 'negative')
            .sort(sortByDate);
        values = parseChartData(sortedData);
        labels = values.labels;
        data = values.data;
        color = 'red';
        break;
      case DataType.negative:
        sortedData = this.state.data
            .map(convertDate)
            .filter(element => element.Record.Result.toLowerCase() === 'negative')
            .sort(sortByDate);
        values = parseChartData(sortedData);
        labels = values.labels;
        data = values.data;
        color = 'aqua';
        break;
      case DataType.recovered:
        sortedData = this.state.data
            .map(convertDate)
            .filter(element => element.Record.Status.toLowerCase() === 'recovered')
            .sort(sortByDate);
        values = parseChartData(sortedData);
        labels = values.labels;
        data = values.data;
        color = 'green';
        break;
      case DataType.deceased:
        sortedData = this.state.data
            .map(convertDate)
            .filter(element => element.Record.Status.toLowerCase() === 'deceased')
            .sort(sortByDate);
        values = parseChartData(sortedData);
        labels = values.labels;
        data = values.data;
        color = 'rgb(166,166,166)';
        break;
    }

    this.chart = new Chart(ctx,{
      type:"line",
      data:{
        labels: labels,
        "datasets":[{
          label:"Case Count",
          data: data,
          fill:false,
          borderColor: color,
          lineTension:0.1
        }]
      },
      options: {
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              unit: 'day'
            }
          }]
        }
      }
    });
  }

  componentDidMount() {
    // get the svg that just mounted - this is componentDidMount()
    // so this function gets fired just after render()
    this.setSvgLegend();

    // using axios directly to avoid redirect interceptor
    axios({
      method: 'post',
      url: '/api/query',
      headers: {
        'Authorization': 'Bearer ' + window.sessionStorage.getItem('token'),
        'Content-Type': 'application/json'
      },
      data:{
        fnc: 'queryAllLabs',
        channelid: this.props.virusType === VirusTypes.Influenza ? Channels.Influenza : Channels.Covid19,
        chaincodeid: 'lab',
        args: []  
      } 
    }).then((function (res) {
      var stateCounts = {};
      var countyCounts = {};

      res.data.forEach(element => {
          stateCounts[element.Record.state] = stateCounts[element.Record.state] === undefined ? 1 : ++stateCounts[element.Record.state];
          
          let countyIdentifier = element.Record.state + "_" + element.Record.county;
          countyCounts[countyIdentifier] = countyCounts[countyIdentifier] === undefined ? 1 : ++countyCounts[countyIdentifier];
          // Assuming county is full FIPS identifier of state and county. Otherwise need to concat state + county
          // countyCounts[element.Record.county] = countyCounts[element.Record.county] === undefined ? 1 : ++countyCounts[element.Record.county];
      });

      this.setState({
        data: res.data,
        stateCounts: stateCounts,
        countyCounts: countyCounts,
        totalCount: res.data.length,
        positiveCount: res.data.filter(element => element.Record.Result.toLowerCase() !== 'negative').length,
        negativeCount: res.data.filter(element => element.Record.Result.toLowerCase() === 'negative').length,
        recoveredCount: res.data.filter(element => element.Record.Status.toLowerCase() === 'recovered').length,
        deathCount: res.data.filter(element => element.Record.Status.toLowerCase() === 'deceased').length,
      });

    }).bind(this)).catch(function (err) {
      console.log(err);
    });
  }


  render() {
    let color = 'yellow';

    switch(this.state.currentDataType) {
      case DataType.positive:
        color = 'red';
        break;
      case DataType.deceased:
        color = 'white';
        break;
      case DataType.negative:
        color = 'aqua';
          break;
      case DataType.recovered:
        color = 'green';
    }

    setTimeout(() => this.updateChart());

    // const position = [this.state.lat, this.state.lng];
    return (
        <div className="container" style={{width: '95%', marginLeft: '2%', marginRight: '2%'}}>
          <div className="row">
            <div className="App">
              <div style={{display: 'flex', justifyContent: 'flex-start'}}>
                <div style={{width: '15%', marginRight: '15px'}}>
                  <DataContainer
                      containerSpecificStyles={{color:'yellow'}}
                      title={'Total Tested'}
                      count={this.state.totalCount}
                      changeDataType={() => this.changeDataType(DataType.total)}
                  />
                  <DataContainer
                      containerSpecificStyles={{color:'aqua'}}
                      title={'Total Negative'}
                      count={this.state.negativeCount}
                      changeDataType={() => this.changeDataType(DataType.negative)}
                  />
                  <DataContainer
                      containerSpecificStyles={{color:'red'}}
                      title={'Total Confirmed'}
                      count={this.state.positiveCount}
                      changeDataType={() => this.changeDataType(DataType.positive)}
                  />
                  <DataContainer
                      containerSpecificStyles={{color:'green'}}
                      title={'Total Recovered}'}
                      count ={this.state.recoveredCount}
                      changeDataType={() => this.changeDataType(DataType.recovered)}
                  />
                  <DataContainer
                      containerSpecificStyles={{color:'white'}}
                      title={'Total Deaths'}
                      count={this.state.deathCount}
                      changeDataType={() => this.changeDataType(DataType.deceased)}
                  />
                </div>
                <div style={{width: '70%'}}>
                  <div>
                    {this.props.virusType} Counts (by State/County):
                  </div>

                  <svg id='legend'></svg>

                  <Map viewport={viewport} zoom={5}>
                    <TileLayer
                        attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                    />
                    <LayersControl position="topright">
                      <BaseLayer checked name="States">
                        <GeoJSON data={stateData} style={this.styleState} onEachFeature={this.handleStateFeature} />
                      </BaseLayer>
                      <BaseLayer name="Counties">
                        <GeoJSON data={countyData} style={this.styleCounty} onEachFeature={this.handleCountyFeature} />
                      </BaseLayer>
                    </LayersControl>
                  </Map>
                </div>
                <div style={{width: '15%', marginLeft: '15px'}}>
                  <StatesBreakdown containerSpecificStyles={{color: color}} stateCounts={this.state.stateCounts}/>
                  <canvas
                      style={{
                        height: '40%',
                        width: '100%',
                        marginTop: '15px',
                        backgroundColor: 'black',
                        borderRadius: '5px'
                      }}
                      id={"myChart"}
                  >

                  </canvas>
                </div>
              </div>
            </div>
        </div>
      </div>
    );
  }
}


export default ResultsMap;