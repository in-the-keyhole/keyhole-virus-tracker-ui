# Hyperledger Blockchain Virus Tracker UI 

This contains the ReactJS UI client for the Keyhole Virus Tracker, a Hyperledger Fabric blockchain implementation for tracking virus lab test results.

> The blockchain implementation this repository interacts with is described in detail in this recent free white paper: [Tracking Lab Results Better With Blockchain Technology](https://keyholesoftware.com/company/creations/white-papers/blockchain-virus-tracker/) (and why it's a better solution for this use case than a traditional data sharing model).

## Table of Contents

- [Byzantine Flu Full Stack Setup](#keyhole-virus-tracker-full-stack-setup)
- [Project Setup](#project-setup)
- [Available Scripts](#available-scripts)
  - [`npm start`](#npm-start)
  - [`npm test`](#npm-test)
  - [`npm run build`](#npm-run-build)
- [Notes](#notes)
- [Docker](docker)


----
## Keyhole Virus Tracker Full Stack Setup

#### Setup Steps
1. Set up and run Keyhole Virus Tracker Hyperledger Fabric:  https://github.com/in-the-keyhole/keyhole-virus-tracker

    
    - This project implements a HyperLedger blockchain network with chaincode that manages a ledger of Influenza tests. The chaincode implements functions to create and retrieve Influenza test results.

2. Set up and run the Gateway:  https://github.com/hyperledger-labs/keyhole-fabric-api-gateway
    - The communication gateway to the Byzantine Hyperledger Fabric runtime

3. **-> (You are here)** Set up and run the UI:  https://github.com/in-the-keyhole/byzantine-flu-ui


#### Optional Steps:
4. Hyperledger Brower:  https://github.com/in-the-keyhole/byzantine-browser

    - A website showing the actual blockchain and the associated metadata 
-----

## Project Setup

1. Run `npm install` in the project folder to install the dependencies.<br>
2. Execute `npm start` to launch the UI.<br>
3. The UI is proxying `/api` requests to http:localhost:4000 using webpack-dev-server. To change the proxy port, edit the proxy in the package.json.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](#running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Notes

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

For additional information on React, find the most recent version of Create React App guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

GeoJSON data leveraged from http://eric.clst.org/tech/usgeojson/

## Docker

### To run in Docker, edit the nginx.conf file and set the upstream host name to the host name of the byzantine-gateway:

`upstream api_gateway {
    server <host_name>:9090;
}`

#### Example - set the `<absolute path>` to the path you cloned into:
`docker run --rm -p 3000:3000 -v /<absolute path>/byzantine-flu-ui/nginx.conf:/etc/nginx/conf.d/nginx.conf:ro keyholesoftware/byzantine-flu-ui:stable`
