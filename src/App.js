/*
Copyright 2017 Keyhole Software LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { Component } from 'react';
//import './App.css';

import { Link, Router } from "@reach/router"

import ResultsMap from './map/Map.js';
import Results from './results/LabResults.js';
import Create from './create/CreateLab.js';
import State from './results/StateResults.js';


import {
  Navbar,
  Nav,
  NavItem
  // ,
  // NavDropdown,
  // MenuItem,
  // Button
} from 'react-bootstrap';
import {VirusTypes} from "./util/constants";

class App extends Component {
  constructor() {
      super();
      this.state = {
        virusType: VirusTypes.Covid19,
        isVirusSelectionVisible: false
      };

      this.handleSetVirusType = this.handleSetVirusType.bind(this);
      this.handleDisplayVirusSelectionModal = this.handleDisplayVirusSelectionModal.bind(this);
  }

  handleDisplayVirusSelectionModal() {
      console.log(this.state.isVirusSelectionVisible);
      this.setState({isVirusSelectionVisible: !this.state.isVirusSelectionVisible});
  }

  handleSetVirusType(virusType) {
      this.setState({
          virusType: virusType === VirusTypes.Influenza ? VirusTypes.Influenza : VirusTypes.Covid19,
          isVirusSelectionVisible: false
      });
  }

  render() {

    const Main = () => (
      <main>
        <Router primary={false}>
          <ResultsMap exact path='/' virusType={this.state.virusType} />
          <ResultsMap path='map' virusType={this.state.virusType} />
          <Results path='results' virusType={this.state.virusType} />
          <Create path='create' virusType={this.state.virusType} />
          <State path='state/:state' />
        </Router>
      </main>
    );

    const AppNav = () => (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">Byzantine-Flu &#123;{this.state.virusType} Control&#125;</Link>
          </Navbar.Brand>
        </Navbar.Header>

        <Navbar.Text><Link to="results">Results</Link></Navbar.Text>
        <Navbar.Text><Link to="create">Add</Link></Navbar.Text>
        <Navbar.Text><span style={{color: '#337ab7', cursor: 'pointer'}} onClick={() => this.handleDisplayVirusSelectionModal()}>Select Virus</span></Navbar.Text>
      </Navbar>
    );

    const VirusSelectionButton = (props) => {
        const virusSelectionButtonStyle = {
            margin: '50px',
            padding: '25px',
            backgroundColor: 'black',
            color: 'white',
            borderRadius: '20px',
            border: '4px white solid',
            textAlign: 'center',
            fontSize: 'large',
            cursor: 'pointer'
        };

        return (
            <div
                style={virusSelectionButtonStyle}
                onClick={() => this.handleSetVirusType(props.virusType)}
            >
                {props.text.toUpperCase()}
            </div>
        );
    };

      const display = this.state.isVirusSelectionVisible ? 'block' : 'none';

      const overlaySharedStyle = {
        position: 'absolute',
        height: '400px',
        width: '800px',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 'auto',
        marginBottom: 'auto',
        right: '0',
        left: '0',
        top: '0',
        bottom: '0',
        zIndex: '10000000',
        display: display
    };


      return (
      <div style={{position: 'relative'}}>
        <div
            style={
                {
                ...overlaySharedStyle,
                ...{
                    backgroundColor: 'black',
                    opacity: 0.5
                }
            }}
        >
        </div>
        <div style={{...overlaySharedStyle}}>
            <VirusSelectionButton text={'influenza'} virusType={VirusTypes.Influenza}/>
            <VirusSelectionButton text={'covid-19'} virusType={VirusTypes.Covid19}/>
        </div>
          <div className="row">
          <AppNav />
          <Main />
        </div>
      </div>
    );
  }
}

export default App;
