var jsonpProcessor = (function() {
	var enterPoint = "jsonpProcessor.engines",
		urlMap = Object.create(null),
		engines = Object.create(null),
		count = 0;
	
	function JSONPEngine (config) {
		var id = "jsonpEngine" + Math.round(Date.now() + Math.random() * 1000001),
			url = config.url,
			parameters = JSON.parse(JSON.stringify(config.parameters)),
			scriptNode = document.createElement("script");
		
		scriptNode.async = true;
		scriptNode.src = processURL(url, parameters);

		function processURL(url, parameters) {
			var _url = url,
				_parameters = JSON.parse(JSON.stringify(parameters));
				
			if( _url.indexOf("?") == -1 ) {
				_url += "?";
			}
			if (!_parameters.callbackParameter) {
				throw new Error('You must provide callback parameter');
			}
			_parameters[_parameters.callbackParameter] = enterPoint + "." + id;
			delete _parameters.callbackParameter;
			
			for (var i in _parameters) {
				(_parameters.hasOwnProperty(i)) && (_url += "&" + encodeURIComponent(i) + "=" + encodeURIComponent(_parameters[i]));
			}

			return _url;
		};
		
		function start() {
			document.body.appendChild(scriptNode);
		};
		function clear() {
			var parentNode = scriptNode.parentNode;
			
			parentNode && parentNode.removeChild(scriptNode);
		};
		function submit(response) {
			config.callback(response);
			clear();
		};
		
		return {
			getID : function getID() {
				return id;
			},
			start : start,
			clear : clear,
			submit : submit
		}
	}
	
	return {
		get : function(config) {
			if (!config || !config.url) return;

			var activeEngine = urlMap[config.url];
			
			if (activeEngine) {
				activeEngine.clear();
				delete urlMap[config.url];
				delete engines[activeEngine.getID()];
			}
			
			var engine = JSONPEngine(config);
			
			engines[engine.getID()] = function(response) {
				delete urlMap[config.url];
				delete engines[engine.getID()];
				engine.submit(response);
				engine = null;
			}
			urlMap[config.url] = engine;
			engine.start();
		},
		engines: engines
	}
})();