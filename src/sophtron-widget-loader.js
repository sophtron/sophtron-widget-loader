var sophtron = (function(){
    var urls = {
        prod: 'https://widget.sophtron.com',
        preview: 'https://widget.sophtron-prod.com',
        legacy: 'https://sophtron.com/integration',
        mock: 'http://localhost:8081',
        local: 'http://localhost:8080'
    }

    var actions = [
        //'Mock',
        //'Demo',
        'Add',
        'Refresh',
        'BankAuth'
    ];

    var defaultConf = {
        env: 'prod',
        partner: 'default',
        integration_key: '',
        request_id: '',
        institution_id: null,
        rounting_number: null,
        userinstitution_id: null,
        provider: null,
        onInit: null,
        onShow: null,
        onClose: null,
        onSelectBank: null,
        onLogin: null,
        onMfa: null,
        onFinish: null, //widget closes if this handler returns true
        onError: null,
    }
    
    var oldOverflow;
    var state = {
        action: '',
        config: {},
        shown: false,
        widgetFrame: null
    }

    function hide(){
        state.shown = false;
        if(state.widgetFrame){
            state.widgetFrame.style.display = "none";
            document.body.style.overflow = oldOverflow,
            window.parent.focus()
        }
    };

    function reload(){
        state.widgetFrame.src = getWidgetUrl(state.action, state.config)
    }

    function onMessage(message){
        switch(message.data.type){
            case 'message':
                if(message.data.error){
                    if(state.config.onError){
                        state.config.onError({
                            _type: 'onError',
                            error: message.data.error
                        });
                    }
                    break;
                }
                switch(message.data.step){
                    case 'SecurityQuestion':
                    case 'TokenSent':
                    case 'TokenMethod':
                    case 'TokenRead':
                    case 'Captcha':
                        if(state.config.onMfa){
                            state.config.onMfa({
                                _type: 'onMfa',
                                ...message.data
                            });
                        }
                        break;
                    case 'Login':
                        if(state.config.onLogin){
                            state.config.onLogin({
                                _type: 'onLogin',
                                ...message.data
                            });
                        }
                        break;
                    case 'SelectBank':
                        if(state.config.onSelectBank){
                            state.config.onSelectBank({
                                _type: 'onSelectBank',
                                ...message.data
                            });
                        }
                        break;
                    case 'Success':
                    case 'Failure':
                        if(state.config.onFinish){
                            if(state.config.onFinish({
                                _type: 'onFinish',
                                ...message.data
                            })){
                                onMessage({data: { type: 'action', action: 'close'}});
                            }
                        }
                        break;
                    case 'Provider':
                    case 'Init':
                        break;
                }
                break;
            case 'action':
                switch(message.data.action){
                    case 'close':
                        hide();
                        reload();
                        if(state.config.onClose){
                            state.config.onClose({
                                _type: 'onClose',
                            });
                        }
                        break;
                    case 'show':
                        if(state.config.onShow){
                            state.config.onShow({
                                _type: 'onShow',
                            });
                        }
                        break; 
                    case 'init':
                        if(state.config.onInit){
                            state.config.onInit({
                                _type: 'onInit',
                                action: message.data.initAction
                            });
                        }
                        break; 
                }
                break;
        }
    }

    function getWidgetUrl(action, conf){
        if(!urls[conf.env]){
            console.log('Expected envs: ');
            console.log(Object.keys(urls));
            throw Error('Invalid env ' + conf.env);
        }
        let ret= `${urls[conf.env]}/${conf.partner}/${action}?integration_key=${conf.integration_key || '' }&request_id=${conf.request_id || ''}`;
        if(action == 'Refresh'){
            if(conf.userInstitution_id ){
                ret += `&userinstitution_id=${conf.userInstitution_id}`;
            }else{
                throw Error('Missing userinstitution_id param for refresh');
            }
        }else if(conf.institution_id ){
            ret += `&institution_id=${conf.institution_id}`;
        }else if(conf.routing_number ){
            ret += `&routing_number=${conf.rounting_number}`;
        }
        return ret;
    }

    function init(action, conf, reinit){
        if(state.widgetFrame){
            if(reinit){
                destroy();
            }else{
                return;
            }
        }
        if(actions.indexOf(action) === -1){
            console.log('Expected actions: ');
            console.log(actions);
            throw Error('Invalid action ' + action);
        }
        state.action = action;
        state.config = Object.assign(state.config, defaultConf, conf);
        state.widgetFrame = document.createElement('iframe');
        state.widgetFrame.id = 'sophtron-widget-iframe';
        state.widgetFrame.src = getWidgetUrl(action, conf);
        state.widgetFrame.title = 'Sophtron';
        state.widgetFrame.width = '100%';
        state.widgetFrame.height = '100%';
        state.widgetFrame.style.top = '0';
        state.widgetFrame.style.left = '0';
        state.widgetFrame.style.right = '0';
        state.widgetFrame.style.bottom = '0';
        state.widgetFrame.style.position = 'fixed';
        state.widgetFrame.style.zIndex = '9999999999';
        state.widgetFrame.style.borderWidth = '0';
        state.widgetFrame.style.overflowX = 'hidden';
        state.widgetFrame.style.overflowY = 'auto';
        state.widgetFrame.style.display = 'none';
        document.body.appendChild(state.widgetFrame);

        window.addEventListener('message', onMessage, false);
        onMessage({data: { type: 'action', action: 'init', initAction: action}});
    };

    function show(){
        if(state.shown){
            return;
        }
        state.shown = true;
        oldOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        if(state.widgetFrame){
            state.widgetFrame.style.display = "block"; 
            if(state.widgetFrame.contentWindow ){
                state.widgetFrame.contentWindow.focus()
            }
        }
        onMessage({data: { type: 'action', action: 'show'}});
    };

    function destroy(){
        hide(); 
        state.widgetFrame.parentElement.removeChild(state.widgetFrame);
        window.removeEventListener('message', onMessage, false);
        state.widgetFrame = null;
    };

    return {
        state,
        init,
        show,
        hide,
        reload,
        destroy,
        actions:  () => [... actions],
        envs: () => Object.keys(urls),
    }
})();