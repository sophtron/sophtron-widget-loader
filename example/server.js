const crypto = require('crypto');
const axios = require('axios');
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require('fs');

const apiClient = (function(){
    
    const userId = process.env.SophtronApiUserId;
    const accessKey = process.env.SophtronApiUserSecret;
    const apiBaseUrl = 'https://api.sophtron-prod.com/api/';
    const apiEndpoints = {
        GetInstitutionByName: 'Institution/GetInstitutionByName',
        GetUserInstitutionsByUser: 'UserInstitution/GetUserInstitutionsByUser',
        GetUserIntegrationKey: 'User/GetUserIntegrationKey',
        GetJobInformationByID: 'Job/GetJobInformationByID'
    }
    // console.log(userId);
    // console.log(accessKey);
    function buildAuthCode(httpMethod, url) {
        var authPath = url.substring(url.lastIndexOf('/')).toLowerCase();
        var integrationKey = Buffer.from(accessKey, 'base64');
        var plainKey = httpMethod.toUpperCase() + '\n' + authPath;
        var b64Sig = crypto.createHmac('sha256', integrationKey).update(plainKey).digest("base64");
        var authString = 'FIApiAUTH:' + userId + ':' + b64Sig + ':' + authPath;
        return authString;
    }
    
    function post(url, data){
        let conf = {headers: {Authorization: buildAuthCode('post', url)}};
        return axios.post(apiBaseUrl + url, data, conf)
            .then(res => {
                //console.log('response from ' + url)
                //console.log(res.data);
                return res.data
            })
            .catch(error => {
                //console.log('error from ' + url);
                //console.log(error.message);
            });
    }

    function getIngrationKey(){
        return post(apiEndpoints.GetUserIntegrationKey, {Id: userId})
    }

    function getInstitutionByName(name){
        return post(apiEndpoints.GetInstitutionByName, {InstitutionName: name})
    }

    function getUserInstitutionsByUser(){
        return post(apiEndpoints.GetUserInstitutionsByUser, {UserID: userId});
    }

    function getJobInformationByID(){
        return post(apiEndpoints.GetJobInformationByID, {JobID: jobId});
    }
    
    return {
        getIngrationKey,
        getInstitutionByName,
        getUserInstitutionsByUser,
        getJobInformationByID
    }
})();

const sophtronMockedBankNames = [
    'Sophtron Bank', // 0
    'Sophtron Bank Business', // 1
    'Sophtron Bank Captcha', // 2
    'Sophtron Bank NoMFA', // 3
    'Sophtron Bank SecurityQuestion', // 4
    'Sophtron Bank SecurityQuestion Multiple', // 5
    'Sophtron Bank Token', // 6
    'Sophtron Bank TokenRead', // 7
];

(async function(){
    const widgetbaseUrl = 'https://widget.sophtron-prod.com';
    let mockedInstitutions = await apiClient.getInstitutionByName(sophtronMockedBankNames[3]);
    //console.log(mockedInstitutions);
    let institution_id = (mockedInstitutions || []).length > 0 ? mockedInstitutions[0].InstitutionID : '';
    let userInstitutions = await apiClient.getUserInstitutionsByUser();
    let userInstitution = (userInstitutions || []).find( i => i.InstitutionID == institution_id);
    let userInstitution_id = (userInstitution || {}).UserInstitutionID;
    // var options = {
    //     inflate: true,
    //     limit: '100kb',
    //     type: '*/*'
    //   };
    // app.use(bodyParser.raw(options));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use('/images', express.static('images'))
    app.use('/js', express.static('../src'))

    app.post('/integrationInfo', async (req, res) => {
        let integration_key = (await apiClient.getIngrationKey()).IntegrationKey;
        let request_id= crypto.randomBytes(16).toString("hex");
        //this will get integration_key ready, for this example server, request the key when loading the server for simpler logic, 
        // the key may expire during testing, simply close the server and restart to get a new one.
        // in production code, you would want to explore the 'getIngrationKey' result and check its expiration time
        let ret ={
            integration_key,
            institution_id,
            userInstitution_id,
            request_id
        };
        console.log(ret);
        res.send(ret);
    }),
    // Listen to an endpoint to receive serverside call back. call back url can be configured at https://sophtron.com/Manage/Developer
    app.post('*', (req, res) => {
        console.log(req.path);
        console.log(req.headers);
        //console.log(req.body.toString('utf8')); 
        console.log(req.body); // print the json call back
        // The callback retrieved will be in the following schema
        // {
        //     "Status" : "integration_success", // or "integration_failed"
        //     "UserInstitutionID": "<guid>", //when job succeeded, the UserInstitutionID is returned in the callback
        //     "RequestId" : "the enduser session identifier passed in when initializing the widget",
        //     "JobID" : "<guid>", //if the job is entirely finished, JobId is not available anymore,
        //     "Error" : "(optional) the error code when job failed"
        // }
        res.status(200).send('ok')
    });
    app.get('/hang', () => {
        console.log('simulating a hanging')
    });
    app.get('*', (req, res) => {
        res.sendFile(__dirname + '/example.html')
    });
    const port= 63880;
    app.listen(port, () => {
        var message = `Stub server is running on port ${port}.`;
        console.log(message);
    });
})()
