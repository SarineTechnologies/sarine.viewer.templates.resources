(function (window, document, $) {
    'use strict';
    $(function () {

        var _friendlyName = window.stones && window.stones[0] && window.stones[0].friendlyName,
            _widgetName = _getLastPathSection(window.location.pathname),
            _id = _friendlyName + _widgetName;
        // Get height of document
        function _getDocHeight(doc) {
            doc = doc || document;
            // from http://stackoverflow.com/questions/1145850/get-height-of-entire-document-with-javascript
            var body = doc.body, html = doc.documentElement;
            // var height = Math.max( body.scrollHeight, body.offsetHeight, 
            // html.clientHeight, html.scrollHeight, html.offsetHeight );
            var height = Math.max(body.offsetHeight); // fixme 
            return height;
        };
        function _getLastPathSection (src) {
            var arr = src.split('/'); 
            return arr.pop();
        };

        // send docHeight onload
        // function sendDocHeightMsg(e) {
        //     var ht = getDocHeight();
        //     parent.postMessage( JSON.stringify( {'docHeight': ht} ), '*' );
        // }

        // global object for iframe messages functional
        window.iframeMessageSrv = {
            sendDocHeightMsg: function(e) {
                var sendObj = {};
                sendObj.id = _id;
                sendObj.ht = _getDocHeight();
                window.parent.postMessage(JSON.stringify({'docHeight': sendObj}), '*');
            },
            sendPopupMsg: function (elementHtml) {
                var sendObj = {};
                sendObj.id = _id;
                sendObj.elementHtml = elementHtml; 
                window.parent.postMessage(JSON.stringify({'openPopup': sendObj}), '*');
            }
        }

        $(document).on('mainHeightReady', function() {
            // console.log('mainHeightReady');
            // console.log(window.location);
            window.iframeMessageSrv.sendDocHeightMsg();
            $(document).off('mainHeightReady');
        });
        
        
        // assign on resize handler
        // console.log('iframe.js listener resize 1st');
        $(window).on('resize', window.iframeMessageSrv.sendDocHeightMsg);

    });
})(window, window.document, window.jQuery);
