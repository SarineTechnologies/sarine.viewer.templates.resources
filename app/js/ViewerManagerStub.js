/**
 * ViewerManger stub class. Created for compatability with current ViewerService
 * Use it in bases like R2P, that work without ViewerManager, but current ViewerService returns "new ViewerManager()" code 
 */
(function(window) {
    window.ViewerManger = (function() {

        ViewerManger.prototype.bind = Error;

        function ViewerManger(option) {
            this.bind = bindElementToSelector;
        }

        bindElementToSelector = function(selector) {
            var defer, _t;
            defer = $.Deferred();
            _t = this;
            return defer.resolve();
        };

        ViewerManger.prototype.first_init = function() {
            var defer;
            defer = $.Deferred();
            defer.resolve;
            return defer;
        };

        ViewerManger.prototype.full_init = function() {
            var defer;
            defer = $.Deferred();
            defer.resolve;
            return defer;
        };

        return ViewerManger;

    })();

})(window);