(function (window, classie, tplUtils, document, $, ModalPlugin) {
    'use strict';

    var storylineGoToDeff = $.Deferred();

    function BulletNavigation(args) {
        var bullets = Array.prototype.slice.call(args.bulletsContainer.querySelectorAll(args.bulletClassName), 0),
            slider = args.slider,
            activeBulletIndex = 0,
            activeClassName = args.activeBulletClassName || '',
            isStoryline = args.isStoryline || false,
            isMobile = args.isMobile || false,
            modal,
            flag = 0, 
            isInitial = true,
            wData = window.wData,
            sliderWrap = document.body.getElementsByClassName('slider-wrap')[0],
            isSmall = classie.has(sliderWrap, 'small'),
            $bulletsContainer = $(args.bulletsContainer);


 
        if (isMobile) {
            bullets.forEach(function (element) {
                element.addEventListener('click', onClickBullet);
            });
        } else {
            bullets.forEach(function (element) {
                element.addEventListener('click', onClickBullet);
            });
            // click is off if swipe or drag
            $bulletsContainer.on('beforeChange', function (event) {
                flag = 1;
            });             
            $bulletsContainer.on('afterChange', function (event) {
                flag = 0;
            });
        }

        if (activeClassName) {  
            // when first time we open page with storyline and slick from summary page 
            // set active class for the correct menu element
            if (isInitial && wData && wData.hasStorylineSlider && wData.isFirstPageSummary && !isSmall) {
                isInitial = false;
                storylineGoToDeff.done(function (dataTarget) {
                    setActiveClass({
                        allActiveElements: Array.prototype.slice.call(args.bulletsContainer.getElementsByClassName(activeClassName), 0),
                        nextActiveElementTarget: "" + dataTarget
                    });
                });
            }

            slider.on('change', function sliderOnChange(e) {
                setActiveClass({
                    allActiveElements: Array.prototype.slice.call(args.bulletsContainer.getElementsByClassName(activeClassName), 0),
                    nextActiveElementTarget: "" + e.detail.currentItemIndex
                });              
            });
        }

        function setActiveClass(obj) {
            var allNextActiveElements = getAllElementsWithAttrVal('data-target',  obj.nextActiveElementTarget),
                    allActiveElements = obj.allActiveElements;

            for (var i = 0, len = allActiveElements.length; i < len; i += 1) {
                classie.remove(allActiveElements[i], activeClassName);  
            }

            for (var i = 0, len = allNextActiveElements.length; i < len; i += 1) {
                classie.add(allNextActiveElements[i], activeClassName);
            }
        }

        // fixme put in tplUtils
        function getAllElementsWithAttrVal(attribute, value) {
            var ret = [];
            for (var i = 0, len = bullets.length; i < len; i += 1) {
                if (bullets[i].getAttribute(attribute) === value) {
                    ret.push(bullets[i]);
                }
            }
            return ret;
        }

        function onClickBullet(e) {
            var self = this,
                dataTarget = parseInt(self.getAttribute('data-target')),
                slickTarget = parseInt(self.getAttribute('data-slick-index')) || '';
            // if thumbnail, open modal
            // console.log('click', flag)
            if (flag === 0) {
                if (args.bulletClassName === '.popup-menu__item') {
                    $('.thumbnail-widget-overlay').trigger('click');
                    modal = new ModalPlugin({
                        autoOpen: true,
                        content: 'thumbnail_widget',
                        dataTarget: dataTarget,
                        slider: slider
                    });
                } else {
                    slider.goTo(dataTarget);

                    // handle slick movements here
                    if (!isStoryline) {
                        tplUtils.fire(document, 'slickGoToInitial',  dataTarget);
                        storylineGoToDeff.resolve(dataTarget);
                    } else {
                        slickTarget && tplUtils.fire(document, 'slickGoToInitial',  slickTarget); 
                    }
                    
                }
            }
        }
    }

    window.BulletNavigation = BulletNavigation;
})(window, window.classie, window.tplUtils, window.document, window.jQuery, window.ModalPlugin);