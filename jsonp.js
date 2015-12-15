/**
 * @typedef {Object} JSONPEngine
 * @property {Function} getID - Return ID for JSONEngine
 * @property {Function} start - Starts engine. Adding script node in DOM
 * @property {Function} clear - Removing script node from DOM.
 * @property {Function} submit - Firing callback with actual response from request as parameter
 */

/**
 * @typedef {Object} JSONPEngineConfig
 * @property {String} url - URL for request, but i'm not sure.
 * @property {String} padding - P to the m**f** JSON.
 * @property {Function} callback - Ehm... callback... yeah?.
 * @property {Object} parameters - Additional parameters for request.
 */

(function(window){
    var enterPoint = "jsonpProcessor.callbacks",
        urlMap = Object.create(null),
        callbacks = Object.create(null);

    /**
     * Factory for JSONPEngine
     * @param {JSONPEngineConfig} config
     * @returns {JSONPEngine} JSONPEngine that you can use
     */
    function JSONPEngineFactory (config) {
        var id = "jsonpEngine" + Math.round(Date.now() + Math.random() * 1000001),
            scriptNode = document.createElement("script");

        scriptNode.async = true;
        scriptNode.src = processURL(config.url, config.padding, config.parameters);

        function processURL(url, padding, parameters) {
            var _url = url,
                _parameters = JSON.parse(JSON.stringify(parameters));

            if( _url.indexOf("?") == -1 ) {
                _url += "?";
            }

            _parameters[padding] = enterPoint + "." + id;

            for (var i in _parameters) {
                (_parameters.hasOwnProperty(i)) && (_url += "&" + encodeURIComponent(i) + "=" + encodeURIComponent(_parameters[i]));
            }

            return _url;
        }

        function start() {
            document.body.appendChild(scriptNode);
        }
        function clear() {
            var parentNode = scriptNode.parentNode;

            parentNode && parentNode.removeChild(scriptNode);
        }
        function submit(response) {
            config.callback(response);
            clear();
        }

        return {
            getID : function getID() {
                return id;
            },
            start : start,
            clear : clear,
            submit : submit
        };
    }

    /**
     * Create, start and returns JSONPEngine
     * @param {JSONPEngineConfig} config
     * @returns {JSONPEngine}
     */
    function get(config) {
        if (!config) {
            throw new Error('You must provide config')
        }
        if (!config.url) {
            throw new Error('You must provide url');
        }
        if (!config.padding) {
            throw new Error('You must provide callback parameter');
        }
        if (config.callback && (typeof config.callback != "function")) {
            throw new Error('Callback parameter should be a function, not a ' + typeof config.callback);
        }

        var activeEngine = urlMap[config.url];

        if (activeEngine) {
            activeEngine.clear();
            delete urlMap[config.url];
            delete callbacks[activeEngine.getID()];
        }

        var engine = JSONPEngineFactory(config);

        callbacks[engine.getID()] = function(response) {
            delete urlMap[config.url];
            delete callbacks[engine.getID()];
            engine.submit(response);
            engine = null;
        };

        urlMap[config.url] = engine;
        engine.start();

        return engine;
    }

    (window.jsonpProcessor) || (window.jsonpProcessor = {
        get: get,
        /** Entry point for jsonp callbacks **/
        callbacks: callbacks
    });

})(window);