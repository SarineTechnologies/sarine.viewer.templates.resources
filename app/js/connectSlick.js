(function (window, document, classie, $, tplUtils) {
    'use strict';

    function connectSlick(name) {
        var $widgetContainer = $('.slider-wrap'),
            wData = window.wData,
            isInitial = true, 
            debounce = tplUtils.debounce,
            containers = {
                'storyline': '.storyline',
                'summaryStories': '.summary__stories' 
            },
            items = {
                'storyline': '.storyline__item',
                'summaryStories': '.summary__story'
            },
            containerName = containers[name];

        if (!containerName) return;

        var $container = $(containerName);

        $('body').on('initSlick', function() { showSlick(); });

        $(window).on('resize', debounce(showSlick, 100));

        function showSlick() {
            if (containerName === '.storyline') {   
                if (classie.has($widgetContainer[0], 'mobile') || (wData  && wData.hasStorylineSlider)) {
                    var menuValues = getMenuValues(),
                        menuWidth = menuValues && menuValues.widthMenu - 4, // hack
                        menuItemsNum = menuValues && menuValues.elementsNum,
                        widgetWidth = $widgetContainer.outerWidth(),
                        slickGoToInitial = function(e) {
                            var index = e.detail - 1;
                            $container.slick('slickGoTo', index, false);
                        },
                        slickObj;
                        
                    // init storyline slick, 
                    // no slick for small desktop,
                    // no slick on mobile if it is enough width on the screen for navigation 
                    if (isInitial && menuWidth > widgetWidth) {
                        slickObj = {
                            draggable: true,
                            infinite: true,
                            variableWidth: true,
                            arrows: false,
                            speed: 300, 
                            slidesToScroll: 2,
                            slidesToShow: 3, 
                            accessibility: false,
                        };

                        if (menuItemsNum < 4) {
                            slickObj.slidesToScroll = 1;
                            slickObj.slidesToShow = 2;
                        }

                        $container.slick(slickObj);

                        isInitial = false;

                        $(document).trigger('storylineSlickReady');
                        //storyline slick event listener
                        document.addEventListener('slickGoToInitial', slickGoToInitial, false);
                    } else if (isInitial && menuWidth !== 0 && menuWidth < widgetWidth) {
                        $(document).trigger('storylineNoSlick');
                    } else if (!isInitial && menuWidth < widgetWidth) {
                        unSlick();
                    }

                    if (classie.has($widgetContainer[0], 'small')) {
                        !isInitial && unSlick();
                    }

                } else if (!isInitial){
                    unSlick();   
                }
            } 
            // init summaryStories slick, only 1 time
            if (containerName === '.summary__stories' && isInitial && $container.is(':visible')) {
                if (wData && wData.hasStorylineSlider) {                
                    $container.slick({
                        draggable: true,
                        // swipeToSlide: true,
                        infinite: true,
                        variableWidth: false,
                        arrows: false,
                        speed: 300, 
                        slidesToScroll: 4,
                        slidesToShow: 4, 
                        // touchThreshold: 10
                    });

                    isInitial = false;

                    $(document).trigger('summaryStoriesSlickReady');
                }
            }

            function unSlick() {
                $container.slick('unslick');
                isInitial = true; 
                if (containerName === '.storyline') {
                    document.removeEventListener('slickGoToInitial', slickGoToInitial, false);
                }
            }
        }

        function getMenuValues() {
            var menuItems = $container.find(items[name]),
                elements = getNotClonedElements(menuItems),
                totalWidth = 0;

            elements.forEach(function (element, index) {
                totalWidth += $(element).outerWidth();
            });

            return { widthMenu: totalWidth, elementsNum: elements.length };
        }

        function getNotClonedElements($arr) {
            var ret = [];
                $arr.each(function(index, el) {
                    if (!el.classList.contains('slick-cloned')) {
                        ret.push(el);
                    }
                });
            return ret;
        }
    }

    window.connectSlick = connectSlick;

})(window, window.document, window.classie, window.jQuery, window.tplUtils);
