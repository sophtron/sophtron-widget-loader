# sophtron-widget-loader

This repo provides a js loader for [Sophtron](https://sophtron.com/) Widget


## How to: 
- Include a distribution of this loader in your web page 
    ```html
    <script type="text/javascript" src="sophtron-widget-loader.js" ></script>
    ```
    or our hosted version 
    ```html
    <script type="text/javascript" src="https://cdn.sophtron.com/sophtron-widget-loader-0.0.0.6.min.js" ></script>
    ```
- Init sophtron with the `sophtron.init` then call `sophtron.show()`
```js
    sophtron.init('Add' // Actions are 'Add', 'Refresh', 'Demo', 'Mock', 'BankAuth'
        , { 
            env: 'preview', //choose an envrionment to connect to, valid options are 'prod', 'preview' 
            partner: 'default', //you can choose to provide your "Partner Name" or "default" so that we'll load your preference or default settings
            integration_key: '', // retrieve your integration_key for this session and place here
            request_id: '5f379011-ec03-4eba-b9f0-10f30c656354', // a unique string for you to identify your user session.
            inistitution_id: '', //optional, pre select a bank to skip the bank search step
            routing_number: '', //optional, pre select a bank to skip the bank search step
            userInistitution_id: '' //if action is Refresh, it's required as the id of the account being refreshed
        },
        true //optional paramter to force re-init if it's already initialized 
    );

    sophtron.show();
```
- Please refer to our API example code for [Getting a integration_key with your user id and secret](https://github.com/sophtron/Sophtron-Integration/blob/78d6eb20b4f492b7a2a108c20af26414b215fbb4/SophtronClientSample/MainIntegrationDemo/Controllers/HomeController.cs#L50)

## Example 
Please refer to [The example nodejs server code](example/) to start a local stub server to have a try

## Avaliable api 
- `sophtron.init()` initialize the widget and put it to ready and hidden state
- `sophtron.show()` show the widget
- `sophtron.hide()` hide the widget, it hides as is, use `show()` to show it at the original state, this can be used to put the widget to background
- `sophtron.reload()` reload the widget to its initial state, if a `hide()` is called for stopping a process, or simply a restart of the process is needed, call `reload()`
- `sophtron.destroy()` remove the widget setup entirely and clean up, `init()` can be called again to start over afterwards
- `sophtron.state` an object that stores the state information of the widget 
