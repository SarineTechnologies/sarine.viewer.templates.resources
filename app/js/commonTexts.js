(function (window, document, $, tplUtils) {
    'use strict';

    var devLog = tplUtils.devLog,
        devWarn = tplUtils.devWarn,
        devError = tplUtils.devError,

        dynamicText = {},
        resourceUrls = {
            baseTexts: getResourceUrl({
                dev: 'tmp/content/viewers/templates/common/' + window.configuration.selectedLanguage +'/resource.json',
                dist: window.template.replace(/(\/viewers\/templates)\/.+/, '$1/common/' + window.configuration.selectedLanguage + '/resource.json')
            }),
            overrideTexts: getResourceUrl({
                dev: 'tmp/content/viewer-template-configuration/override/' + window.configuration.selectedLanguage +'/resource.json',
                dist: window.configuration.configUrl + '/' + window.configuration.selectedLanguage + '/resource.json'
            }),           
            config: getResourceUrl({
                dev: 'tmp/content/viewer-template-configuration/override/',
                dist: window.configuration.configUrl
            })
        },        
        textPromises = {
            baseText: $.getJSON(resourceUrls.baseTexts),
            overrideText: $.getJSON(resourceUrls.overrideTexts)
        };

    window.baseFeatures = window.baseFeatures || {};
    
    devLog('Resource urls: %O', resourceUrls);

    textPromises.baseText.done(function (baseText) {
        dynamicText = baseText;
        devLog('Base text : %O', baseText);

        loadOverrideTexts();
    }).fail(function (error) {
        devError('Failed to load base text: ' + error);
    });

    function loadOverrideTexts() {
        textPromises.overrideText.done(function (overText) {
            dynamicText = $.extend(dynamicText, overText);
            devLog('Merged text %O: ', dynamicText);
            
            $(document).trigger('commonTextsLoaded');

        }).fail(function () {
            devError('Failed to load override text: ' + error);
        });
    }

    function setTexts() {
        dataAttrHandler('data-text', dynamicText, function ($el, value) {
            if (value) {
                $el.html(value);
                devLog('set text : ' + value);
            } else {
                $el.parent().hide();
                devWarn('Text not found : ' + value);
            }
        });
    }

    function setSrcs() {
        dataAttrHandler('data-src', dynamicText, function ($el, value) {
            if (value) {
                $el.attr('src', value);
                devLog('set src : ' + value);
            } else {
                $el.parent().hide();
                devError('Src not found : ' + value);
            }
        });
    }

    function setUrls() {
        dataAttrHandler('data-url', dynamicText, function ($el, value) {
            if (value) {
                $el.attr('href', value);
                devLog('set href : ' + value);
            } else {
                $el.parent().hide();
                devError('href not found : ' + value);
            }
        });
    }

    function setSrcsFromConfig() {
        var configUrl = resourceUrls.config.replace(/\?[\w\s\.]+/,"/");

        dataAttrHandler('data-config-src', dynamicText, function ($el, value) {
            if (value) {
                $el.attr('src', configUrl + value);
                devLog('set href : ' + value);
            } else {
                $el.parent().hide();
                devError('href not found : ' + value);
            }
        });
    }

    function setAll()
    { 
        setTexts();
        setSrcs();       
        setUrls();
        setSrcsFromConfig();
    }

    function dataAttrHandler(attrName, resource, handler) {

        if (typeof attrName !== 'string' || typeof resource !== 'object' || typeof handler !== 'function') {
            devError('Incorrect arguments in dataAttrHandler()' + arguments);
            return;
        }

        $('[' + attrName + ']').each(function () {
            var $el = $(this),
                value = '';

            try {
                value = resource[$el.attr(attrName)];
            } catch (e) {
                devError(e);
            }

            handler($el, value);
        });        
    }

    function getResourceUrl(resourceObj) {
        var mapKey = window.location.origin.indexOf('localhost') === -1 ? 'dist' : 'dev';
        return resourceObj[mapKey] + window.cacheVersion;
    }

    function getTextByKey(key)
    {
        return dynamicText[key];
    }

    window.baseFeatures.commonTexts = {
        setCommonTexts: setAll,
        getTextByKey: getTextByKey
    };
       
})(window, window.document, window.jQuery, window.tplUtils);