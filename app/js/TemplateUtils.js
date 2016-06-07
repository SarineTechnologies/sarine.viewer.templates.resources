(function (window, document, $) {
	'use strict';
	
	// devLog(): console.log enabled on dev environment or by adding 'dev_log' to the URL hash
	var isDev = window.location.origin.indexOf('localhost') !== -1 || window.location.hash.indexOf('dev_log') !== -1;

	var _now = Date.now || function() {
    	return new Date().getTime();
  	};

	function devLog() {
		if (isDev) {
			console.log.apply(window.console, arguments);
		}
	}

	function devError() {
		if (isDev) {
			console.error.apply(window.console, arguments);
		}
	}

	function devWarn() {
		if (isDev) {
			console.warn.apply(window.console, arguments);
		}
	}
	

	function loadComponents() {
		var prevPromise = Promise.resolve();
		
		$.getJSON(processUrl('./components.json'))
				.done(function (componentsList) {
					componentsList.forEach(function (aResourceUrl) {
						if (aResourceUrl.indexOf('--') !== -1) return;
						prevPromise = prevPromise.then(function () {
							return getScriptByPromise(processUrl(aResourceUrl));
						});
					});
				})
				.fail(function (e) {
					console.error('Unable to load components list');
					console.log(e);
				});
	}


	function getScriptByPromise(url1) {
		return new Promise(function (resolve, reject) {
			loadScript(url1, resolve, function (e) {
				reject(Error('Error loading script ' + url1));
			});
		});
	}


	// From http://www.nczonline.net/blog/2009/06/23/loading-javascript-without-blocking/
	function loadScript(url, successCallback, errorCallback) {
		var script = document.createElement('script');
		script.type = 'text/javascript';

		if (script.readyState) {  // IE
			script.onreadystatechange = function() {
				if (script.readyState === 'loaded' || script.readyState === 'complete') {
					script.onreadystatechange = null;
					successCallback();
				}
			};
		} else {  // Others
			script.onload = successCallback;
		}

		script.src = url;
		document.body.appendChild(script);
		script.onerror = errorCallback;
	}
	
	
	function getPath(src) {
		var arr = src.split('/');
		arr.pop();
		return arr.join('/');
	}
	
	
	function processUrl(url) {
		if (url.indexOf('./') === 0) {
			url = getPath(window.template) + url.substring(1);
		}
		return url;
	}
	
	
	function recurse(o, props) {
		if (props.length === 0) {
			return o;
		}

		if (!o) {
			return void 0;
		}

		return recurse(o[props.shift()], props);
	}


	function fire(elem, evntName, data) {
		
		var event = new CustomEvent(evntName, {'detail': data});

		elem.dispatchEvent(event);
	};

	// Taken from underscore.js
	// Returns a function, that, as long as it continues to be invoked, will not
	// be triggered. The function will be called after it stops being called for
	// N milliseconds. If `immediate` is passed, trigger the function on the
	// leading edge, instead of the trailing.
	function debounce(func, wait, immediate) {
		var timeout, args, context, timestamp, result;

		var later = function() {
		  	var last = _now() - timestamp;

		  	if (last < wait && last >= 0) {
				timeout = setTimeout(later, wait - last);
		  	} else {
				timeout = null;
				if (!immediate) {
			  	result = func.apply(context, args);
			  	if (!timeout) context = args = null;
				}
		  	}
		};

		return function() {
		  	context = this;
		  	args = arguments;
		  	timestamp = _now();
		  	var callNow = immediate && !timeout;
		  	if (!timeout) timeout = setTimeout(later, wait);
		  	if (callNow) {
				result = func.apply(context, args);
				context = args = null;
		  	}

		  	return result;
		};
	};


	// loadCSS: load a CSS file asynchronously.
	// [c]2015 @scottjehl, Filament Group, Inc.
	// Licensed MIT

	function loadCSS(href, before, media) {
        // Arguments explained:
        // `href` [REQUIRED] is the URL for your CSS file.
        // `before` [OPTIONAL] is the element the script should use as a reference for injecting our stylesheet <link> before
        // By default, loadCSS attempts to inject the link after the last stylesheet or script in the DOM. However, you might desire a more specific location in your document.
        // `media` [OPTIONAL] is the media type or query of the stylesheet. By default it will be 'all'
        var ss = document.createElement("link");
        var ref;
        if (before) {
            ref = before;
        } else {
            var refs = (document.body || document.getElementsByTagName("head")[0]).childNodes;
            ref = refs[refs.length - 1];
        }
        var sheets = document.styleSheets;
        ss.rel = "stylesheet";
        ss.href = href;
        // temporarily set media to something inapplicable to ensure it'll fetch without blocking render
        ss.media = "only x";
        // Inject link
        // Note: the ternary preserves the existing behavior of "before" argument, but we could choose to change the argument to "after" in a later release and standardize on ref.nextSibling for all refs
        // Note: `insertBefore` is used instead of `appendChild`, for safety re: http://www.paulirish.com/2011/surefire-dom-element-insertion/
        ref.parentNode.insertBefore(ss, (before ? ref : ref.nextSibling));
        // A method (exposed on return object for external use) that mimics onload by polling until document.styleSheets until it includes the new sheet.
        var onloadcssdefined = function(cb) {
            var resolvedHref = ss.href;
            var i = sheets.length;
            while (i--) {
                if (sheets[i].href === resolvedHref) {
                    return cb();
                }
            }
            setTimeout(function() {
                onloadcssdefined(cb);
            });
        };
        // once loaded, set link's media back to `all` so that the stylesheet applies once it loads
        ss.onloadcssdefined = onloadcssdefined;
        onloadcssdefined(function() {
            ss.media = media || "all";
            $(document).trigger('readyCss');
        });
        return ss;
    };


	// sort by object's key value 
	function sortArrayByObjectKey(arr, key) {

		arr.sort(function (a, b) {
		    if(a[key] < b[key]){
		        return -1;
		    } else if(a[key] > b[key]) {
		        return 1;
		    }

		    return 0;
		});
	};

	// extend jQuery
	$.fn.extend({
		setResponsiveClasses : function () {
			var args = new Array(arguments.length),
			allClasses = ['thumbnail', 'intermediate', 'small', 'mobile', 'normal'],
			remove; 

			// put arguments to array without leaks
			for(var i = 0; i < args.length; i += 1) {
				 args[i] = arguments[i];
			}

			remove = allClasses.filter(filterToRemove); 

			// remove classes from the $element:
			for (var i = 0; i < remove.length; i += 1) {
				this.removeClass(remove[i]);
			}

			// add clases for the $element
			for (var i = 0; i < args.length; i += 1) {
				this.addClass(args[i]);
			}
						
			// filter function to get classes for removal
			function filterToRemove (value) {
				for (var i = 0; i < args.length; i += 1) {
					if (value === args[i]) {
						return false;
					}
				}
				return true;
			}; 

			return this;
		}
	});

	function capitalizeFirst (str) {
        return str.replace(/\w\S*/g, function(txt){
            return txt.charAt(0).toUpperCase() + txt.substr(1);
        });
    }


    function getParameter(paramName) {
        var searchString = window.location.search.substring(1),
            i, pair, params = searchString.split("&");

        for (i=0; i < params.length; i++) {
            pair = params[i].split("=");
            if (window.decodeURIComponent(pair[0]) == paramName) {
                return window.decodeURIComponent(pair[1]);
            }
        }

        return  paramName + ' not found in query';
    } 

	window.tplUtils = {
		loadComponents: loadComponents,
		getPath: getPath,
		getScriptByPromise: getScriptByPromise,
		recurse: recurse,
		isDev: isDev,
		devLog: devLog,
		devError: devError,
		devWarn: devWarn,
		fire: fire,
		debounce: debounce,
		processUrl: processUrl,
		loadCSS: loadCSS,
		sortArrayByObjectKey: sortArrayByObjectKey,
		capitalizeFirst: capitalizeFirst,
		getParameter: getParameter
	};
})(window, window.document, window.jQuery);

/**
 * Profiler.
 * Add 'profiler' to to url hash to enable this feature.
 */
(function (window, document, $) {
	var $resultContainer,
		loaded = false;
	
	if (window.location.hash.indexOf('profiler') === -1) return;
	console.log('Remove sarine-viewers and load empty pages...');
	
	$resultContainer = $('<div/>').css({
		minHeight: '50px',
		textAlign: 'center',
		paddingTop: '15px',
		fontWeight: 'bold',
		fontSize: '150%',
		color: 'red'
	});
	$('sarine-viewer').eq(0).replaceWith($resultContainer);
	$('sarine-viewer').remove();
	
	$(window).load(function () {
		console.log('Finished loading');
		loaded = true;
		onLoad();
	});
	window.setTimeout(function () {
		if (loaded) return;
		loaded = true;
		console.log('Force finished loading');
		onLoad();
	}, 1000);
	
	function onLoad() {
		document.querySelector('.slider').style.display = '';
		document.querySelector('.preloader').style.display = 'none';
		$resultContainer.html('Loaded');
	}
})(window, window.document, window.jQuery);
