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
    let integration_key = (await apiClient.getIngrationKey()).IntegrationKey;
    let mockedInstitutions = await apiClient.getInstitutionByName(sophtronMockedBankNames[3]);
    //console.log(mockedInstitutions);
    let institution_id = (mockedInstitutions || []).length > 0 ? mockedInstitutions[0].InstitutionID : '';
    let userInstitutions = await apiClient.getUserInstitutionsByUser();
    let userInstitution = (userInstitutions || []).find( i => i.InstitutionID == institution_id);
    let userInstitution_id = (userInstitution || {}).UserInstitutionID;
    let request_id= crypto.randomBytes(16).toString("hex");
    console.log({
        integration_key,
        institution_id,
        userInstitution_id,
        request_id
    });
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use('/images', express.static('images'))
    app.use('/js', express.static('../src'))

    app.post('*', (req, res) => {
        console.log(req.path);
        console.log(req.body);
        res.status(200).send('ok')
    });
    app.get('/hang', () => {
        console.log('simulating a hanging')
    });
    app.get('*', (req, res) => {
        fs.readFile('example.html', 'utf-8', (err, data) => {
            res.send(data
                .replace('$request_id', request_id)
                .replace('$integration_key', integration_key)
                .replace('$institution_id', institution_id)
                .replace('$userInstitution_id', userInstitution_id)
                );
        });
    });
    const port= 63880;
    app.listen(port, () => {
        var message = `Stub server is running on port ${port}.`;
        console.log(message);
    });
})()
