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
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import statesAndCounties from '../data/usStatesAndCounties.json';
import {Channels, VirusTypes} from "../util/constants";

class LabResults extends Component {

    constructor(props) {
        super(props);

        this.state ={ labs:[], error: '' };
    }

    componentDidMount() {

        var self = this;
        axios({// using axios directly to avoid redirect interceptor
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
        }).then(function (res) {

            var data = [];    
            res.data.forEach(element => {
                // Temp lookup to account if string county name instead of county code
                if (!isNaN(element.Record.county)) {
                    var county = statesAndCounties[element.Record.county];
                    element.Record.county = county ? county.countyName : '';
                }
                data.push( element.Record );
            });

           // alert(JSON.stringify(data));
            self.setState({ labs : data});
            
           

        }).catch(function (err) {
            //self.setState({ error: 'Error Retrieving Results...' });
            console.log(err);
        });


    }



    render() {





        const data = this.state.labs;

        const columns = [{
            Header: 'Date/Time',
            accessor: 'DateTime' // String-based value accessors!
        }, {
            Header: 'Gender',
            accessor: 'gender',
            //Cell: props => <span className='number'>{props.value}</span> // Custom cell components!
        }, 
        {    
            Header: 'DOB',
            accessor: 'dob'
        
        },
           
        {
    
            Header: 'Test Type',
            accessor: 'testtype' // Custom value accessors!
        }, {
            Header: 'Result',
            accessor: 'Result'
        },{    
            Header: 'City',
            accessor: 'city'
        
        }, {
	    Header: 'County',
	    accessor: 'county'
	},
        {    
            Header: 'State',
            accessor: 'state'
        }
    
    
    ];


        return (

    
        <div className="container">
             
        <div className="row">     
        
          <div className="col-md-12">
           <ReactTable
               data={data}
                columns={columns}
              />
          </div>    

          </div>     
       </div>    

        )
    }

}

export default LabResults
