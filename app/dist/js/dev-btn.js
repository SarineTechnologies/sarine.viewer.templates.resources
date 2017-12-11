 (function(window, document, $) {
    (window.onload = function() {
        var devBtn = $('.dev-btn button'),
            devBtnIdArray = getValuesByKey(devBtn, 'id'),
            widgetContainer = $('.slider-wrap'),
            arr = [],
            activeIndex = 0, // 0 =  T , 1 = I , 2 = S, 3 = M
            thumbnailWrap = $('.thumbnail__img-wrap'),
            slider = widgetContainer.children('.slider'),
            thumbnailMenu = $('.thumbnail-menu'),
            thumbnailWidgetOverlay = $('.thumbnail-widget-overlay'),
            popupWrap = $('.popup-wrap');
            

        devBtn.each(function(i,e){

            $(devBtn[activeIndex]).addClass('active');

            arr.push($(e).attr('id'));

            widgetContainer.addClass(arr[activeIndex]);

            $(e).on('click', function(){
              
                if (devBtnIdArray[activeIndex] !== 'thumbnail') {
                    popupWrap.removeClass('widget-sm-popup--right widget-sm-popup--left');
                    popupWrap.find('.popup__close-btn').trigger('click');
                } else {
                    thumbnailMenu.is(':visible') && thumbnailWidgetOverlay.trigger('click');
                } 
                
                devBtn.removeAttr('class');
                $(this).addClass('active');

                arr.forEach(function(item){
                    widgetContainer.removeClass(item);
                });
                widgetContainer.addClass($(this).attr('id'));

                if ($(this).attr('id') !== 'thumbnail') {
                    thumbnailMenu.hide();
                    widgetContainer.show();
                    thumbnailWrap.hide();
                    slider.show();
                } else {
                    widgetContainer.hide();
                    thumbnailWrap.show();
                }

                activeIndex = devBtnIdArray.indexOf($(this).attr('id'));

                $('body').trigger('clickDevBtn');
        
            });
        });

        function getValuesByKey (jElement, key) {
            var result = [];
            jElement.each(function(index, element) {          
                result[index] = element.getAttribute('id');
            })
            return result;
        }

    })();
})(window, window.document, window.jQuery);
