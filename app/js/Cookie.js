(function (window, document) {
    'use strict';

    /**
     * Set cookie
     * cname (string) - name of the cookie
     * cvalue (string) - the value of the cookie
     * exdays (int) - the number of days until the cookie should expire
     */
    window.setCookie = function (cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }


    window.getCookie = function (cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    window.deleteCookie = function (name) {
        setCookie(name, "" , -1);
    }

})(window, window.document);