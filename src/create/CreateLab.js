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
import axios from 'axios';
// import ReactTable from 'react-table';
import 'react-table/react-table.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import { RegionDropdown } from 'react-country-region-selector';

import statesAndCounties from '../data/countiesByStates.json';

import {
    navigate
  } from "@reach/router"
import {Channels, VirusTypes} from "../util/constants";

class LabResults extends Component {

    constructor(props) {
        super(props);

        this.state = { 
            source: '',
            age: '', 
            dateTime: moment(), 
			gender: 'Male', 
            testType: 'RIDT', 
			result: '',
            status: '',
			city: '', 
            state: '',
            counties: [],
	        county: '',
            country: 'United States',
			formErrors: {dateTime: '', gender: ''},
			dateTimeValid: false,
			genderValid: false,
			formValid: false
		};
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleDateTimeChange = this.handleDateTimeChange.bind(this);
    }

    componentDidMount() {


    }

    handleSubmit(e) {

        var self = this;
        axios({// using axios directly to avoid redirect interceptor
            method: 'post',
            url: '/api/execute',
            headers: {
                'Content-Type': 'application/json'
            },
            data:{
                fnc: 'createLab',
                channelid: this.props.virusType === VirusTypes.Influenza ? Channels.Influenza : Channels.Covid19,
                chaincodeid: 'lab',
                args: [self.state.gender, self.state.age, self.state.city, self.state.county, self.state.state, self.state.testType, self.state.result, self.state.dateTime.toString(), self.state.source, self.state.status]
            }


        }).then(function (res) {

            navigate('/');


        }).catch(function (err) {
            self.setState({ error: 'Error Retrieving Results...' });
            console.log(err);
        });

        e.preventDefault();
    }

    handleInputChange(ev) {
        const target = ev.target;
        this.setState({ [target.name]: target.value });
        this.setState({ error: '' });
    }

    handleDateTimeChange(date) {
        this.setState({
            dateTime: date
        });
    }

    selectCountry(val) {
        this.setState({ country: val });
    }

    selectRegion(val) {
        var counties = [];
        if (statesAndCounties[val]) {
            statesAndCounties[val].forEach(county => {
                if (county.stateAbbreviation === val) {
                    counties.push(county);
                }
            });
        }

        this.setState({ state: val, counties: counties });
    }

    selectCounty(val) {
        this.setState({ county: val });
    }

    render() {
        const Covid19TestTypes = () => (
            <select name="testType" id="testType" className="form-control" value={this.state.testType} onChange={this.handleInputChange}>
                <option value="Nasopharyngeal Swab">Nasopharyngeal Swab</option>
                <option value="Sputum Sample">Sputum Sample</option>
                <option value="Antibody Test">Antibody Test</option>
            </select>
        );

        const InfluenzaTestTypes = () => (
            <select name="testType" id="testType" className="form-control" value={this.state.testType} onChange={this.handleInputChange}>
                <option value="RIDT">Rapid Influenza Diagnostic Tests</option>
                <option value="Rapid Molecular Assay">Rapid Molecular Assay</option>
                <option value="Immunofluorescence, Direct/Indirect Florescent Antibody Staining">Immunofluorescence, Direct/Indirect Florescent Antibody Staining</option>
                <option value="RT-PCR7 and other molecular assays">RT-PCR7 and Other Molecular Assays</option>
                <option value="Rapid cell culture">Rapid Cell Culture</option>
                <option value="Viral tissue cell culture">Viral Tissue Cell Culture</option>
            </select>
        );

        const InfluenzaResultTypes = () => (
            <select name="result" id="result" className="form-control" value={this.state.result} onChange={this.handleInputChange}>
                <option value>select</option>
                <option value="A">Influenza A</option>
                <option value="B">Influenza B</option>
                <option value="RSV">Respiratory Syncytial Virus</option>
                <option value="Strep A">Strep A</option>
                <option value="Negative">Negative</option>
            </select>
        );

        const Covid19ResultTypes = () => (
            <select name="result" id="result" className="form-control" value={this.state.result} onChange={this.handleInputChange}>
                <option value>select</option>
                <option value="Positive">Positive</option>
                <option value="Negative">Negative</option>
            </select>
        );



        const TestTypes = this.props.virusType === VirusTypes.Influenza ? InfluenzaTestTypes : Covid19TestTypes;
        const ResultTypes = this.props.virusType === VirusTypes.Influenza ? InfluenzaResultTypes : Covid19ResultTypes;

        const { country, state } = this.state;

        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12"><h1>Create Lab Result</h1></div>
                </div>

                <div className="row">
                    <div className="col-md-4 col-md-offset-4">

                        <form className="form" onSubmit={this.handleSubmit}>


                           <div className="form-group">
                                <label>Source:</label>
                                {/*<input name="age" id="age" className="form-control" type="text" value={this.state.age} onChange={this.handleInputChange} placeholder="age" />*/}
                                <input name="source" id="source" className="form-control" type="text" value={this.state.source} onChange={this.handleInputChange} placeholder="lab source" />
                            </div>


                            <div className="form-group">
                                <label>Date Time:  </label>
                                {/*<input name="dateTime" id="dateTime" className="form-control" type="text" value={this.state.dateTime} onChange={this.handleInputChange} placeholder="date time" />*/}
                                <DatePicker
                                    className="form-control"
                                    selected={this.state.dateTime}
                                    onChange={this.handleDateTimeChange}
                                    showTimeSelect
                                    timeFormat="hh:mm A"
                                    timeIntervals={15}
                                    dateFormat="MM/DD/YYYY hh:mm A"
                                    timeCaption="time"
                                />
                            </div>

                            <div className="form-group">
                                <label>Anotomical Gender: 	</label>
							  {/*<input name="gender" id="gender" className="form-control" type="text" value={this.state.gender} onChange={this.handleInputChange} placeholder="gender" /> */}
								  <select name="gender" id="gender" className="form-control" value={this.state.gender} onChange={this.handleInputChange}>
									<option value="Male">Male</option>
									<option value="Female">Female</option>
								  </select> 
                            </div>

                            <div className="form-group">
                                <label>Age:</label>
                                 <input name="age" id="age" className="form-control" type="text" value={this.state.age} onChange={this.handleInputChange} placeholder="age" />
                               {/* <input name="dob" id="dob" className="form-control" type="date"  value={this.state.age} onChange={this.handleInputChange} placeholder="mm/dd/yyyy" /> */}
                            </div>

                            <div className="form-group">
                                <label>Test Type:</label>
                                {/*<input name="testType" id="testType" className="form-control" type="text" value={this.state.testType} onChange={this.handleInputChange} placeholder="testType" />*/}
                                <TestTypes />
                            </div>

                            <div className="form-group">
                                <label>Result:</label>
                                {/*<input name="result" id="result" className="form-control" type="text" value={this.state.result} onChange={this.handleInputChange} placeholder="result" />*/}
                                <ResultTypes />
                           </div>

                            <div className="form-group">
                                <label>Status:</label>
                                <select name="status" id="status" className="form-control" value={this.state.status} onChange={this.handleInputChange}>
                                    <option value="none">None</option>
                                    <option value="active">Active</option>
                                    <option value="recovered">Recovered</option>
                                    <option value="deceased">Deceased</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>City :</label>
                                <input name="city" id="city" className="form-control" type="text" value={this.state.city} onChange={this.handleInputChange} placeholder="city" />
                            </div>

                            <div className="form-group">
                                <label>State:</label>
                                {/*<input name="state" id="state" className="form-control" type="text" value={this.state.state} onChange={this.handleInputChange} placeholder="state" />*/}
                                {/*<CountryDropdown
                                    value={country}
                                    onChange={(val) => this.selectCountry(val)} />*/}
                                <RegionDropdown
                                    className="form-control"
                                    defaultOptionLabel="Select State"
                                    country={country}
                                    value={state}
                                    valueType="short"
                                    onChange={(val) => this.selectRegion(val)} />
                            </div>

                            <div className="form-group">
                                <label>County :</label>
                                {/* <input name="county" id="county" className="form-control" type="text" value={this.state.county} onChange={this.handleInputChange} placeholder="county" /> */}
                                <select className="form-control"name="county" id="county" onChange={this.handleInputChange} disabled={(this.state.counties.length === 0)}>
                                    <option value>select</option>
                                    {/* Currently using state FIPS and county FIPS as value for ease of data matchups to map */}
                                    {this.state.counties.map((county) => <option key={county.stateCode + county.countyCode} value={county.stateCode + county.countyCode}>{county.countyName}</option>)}
                                </select>
                            </div>

                            <input className="btn btn-default" type="submit" value="Create" />
                        </form>

                        <div className="login-error">{this.state.error}</div>
                    </div>
                </div>
            </div>
        )
    }

}

export default LabResults
