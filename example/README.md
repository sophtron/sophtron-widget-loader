
## Example 

- `npm i` and `node server.js`
- Edit [server.js](server.js) to add your userId and accessKey so that it can generate an integration_key
- The code will find the mocked "sophtron bank" id for you to play with for the scenario of pre-selecting bank,
- The will try to find an userInstituion_id for you to try "Refresh", in order to refresh, an account needs to be added ( use Add action to try once first ), it will assume that an account of "Sophtron Bank" is added and try to find it.
- It generates a random string as the request_id, request_id is for caller to identify session when receiving call back
- The server will then listen on port 63880 for callbacks, it will simply log callbacks to console.
- *callback address is pre-configured in your account settings, it needs to be publickly accessible