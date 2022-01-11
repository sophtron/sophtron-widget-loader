
## Example 

- Find your userId and accessKey from [Sophtron.com](https://sophtron.com/manage) and put them to envrionment variable according to [server.js](server.js#L10) 
- In the current path (`example`), `npm i` and `node server.js`
- The code will get all essential paramters ready to get the example running.
- The server will then listen on port 63880 to serve a default html page, navigate to http://localhost:63880 to load the example page.
- It will also listen on port 63880 on any post requests for callbacks, it will simply log callbacks to console.
- *callback address is pre-configured in your account settings, it needs to be publickly accessible
- It generates a random string as the request_id, request_id is for caller to identify session when receiving call back
- The code will find the mocked "sophtron bank" id for you to play with for the scenario of pre-selecting bank,
- It will try to find an userInstituion_id for you to try "Refresh", in order to refresh, an account needs to be added ( use Add action to try once first ), it will assume that an account of "Sophtron Bank" is added and try to find it.
