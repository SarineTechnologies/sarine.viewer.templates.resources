(function (window, document, classie, $, tplUtils, gaUtils) {
    'use strict';

    function PopupService(args) {
        args = args || {};

        this._overlay = args.overlay;
        this._openClassName = args.openClassName || 'popup-wrap--open';
        this._closeClassName = args.closeClassName || 'popup-wrap--close';
        this._openOverlayClassName = args.openOverlayClassName || 'popup-overlay--open';
        this._isDashboard = args.isDashboard || false;

        // responsive
        this._body = $('body');
        this._sliderWrap = document.querySelector('.slider-wrap');
        this._leftPopupClass = args.leftPopupClass || 'widget-sm-popup--left';
        this._rightPopupClass = args.rightPopupClass || 'widget-sm-popup--right';
        this._popupPosition = 'right'; // right position is default
        this._thumbnailMenu = 'thumbnail-menu';
    }

    PopupService.prototype.open = function (element) {
        var currentElement,
            popupPosition,
            self = this,
            widgetBox,
            isSmall,
            isThumbnail,
            hasThumbnailMenu = classie.has(element, this._thumbnailMenu),
            markLabel = getMarkLabel(element, wData.currentPage);

        if (!this._isDashboard) {
            currentElement = this.currentElement;
            if (currentElement === element) {
                // thumbnail repsonsive
                if (hasThumbnailMenu) {
                    this.close(currentElement);
                }
                return;
            }
            if (currentElement) {
                this.close(currentElement);
            }
            this.currentElement = element;
        }

        if (!this._isDashboard) {
            // add overlay if not thumbnail-menu
            !hasThumbnailMenu && classie.add(this._overlay, this._openOverlayClassName);

            // small responsive
            // add a correct class to widget slider-wrap when responsive widget is small or thumbnail - (temporary)
            isSmall = classie.has(this._sliderWrap, 'small');
            isThumbnail = classie.has(this._sliderWrap, 'thumbnail') && !classie.has(this._sliderWrap, 'normal');

            if (isSmall) {
                window.iframeMessageSrv && window.iframeMessageSrv.sendPopupMsg($(element).html()); // fixme

                widgetBox = this._sliderWrap;
                // console.log($(window).width(), widgetBox.getBoundingClientRect().right);
                if ($(window).width() - widgetBox.getBoundingClientRect().right >= 296) { // 296 is a value of popup width with margin
                    this._body.append(element);
                    classie.add(element, this._rightPopupClass);
                    this._setPopupPosition(element, 'right', widgetBox);
                    this._popupPosition = 'right';
                } else {
                    this._body.append(element);
                    classie.add(element, this._leftPopupClass);
                    this._setPopupPosition(element, 'left', widgetBox);
                    this._popupPosition = 'left';
                }
                $(window).on('resize.smallpopup', function () {
                    if ($(element).is(':visible')) {
                        this._setPopupPosition(element, self._popupPosition, widgetBox);
                    }
                });
            } else if (isThumbnail && hasThumbnailMenu) {
                widgetBox = document.getElementById('thumbnail-image');
                this._body.append(element);
                this._setPopupPosition(element, 'right', widgetBox);
                $(window).on('resize', function () {
                    this._setPopupPosition(element, 'right', widgetBox);
                });
            }
        }

        classie.remove(element, this._closeClassName);
        classie.add(element, this._openClassName);

        $(element).show();

        if (!(isThumbnail && hasThumbnailMenu)) {
            if(this._isDashboard){
                //gaUtils && gaUtils.openSeekInfoVirtualPage(markLabel);
                gaUtils && gaUtils.openSeekInfo(markLabel, true);
            } else {
                gaUtils && gaUtils.openSeekInfo(markLabel);
            }
        }
    };

    PopupService.prototype.close = function (element) {
        var videoElement,
            hasThumbnailMenu = classie.has(element, this._thumbnailMenu);

        var markLabel = getMarkLabel(element);

        this.currentElement = null;

        if (!this._isDashboard) {
            classie.remove(this._overlay, this._openOverlayClassName);

            // small responsive 
            if ((classie.has(element, this._rightPopupClass) || classie.has(element, this._leftPopupClass))) {
                $(window).off('resize.smallpopup');
                classie.remove(element, this._rightPopupClass);
                classie.remove(element, this._leftPopupClass);
                element.removeAttribute("style"); // clean styles
                $(this._sliderWrap).append(element); //return popup back inside sliderWrap
                this._popupPosition = 'right';
            }
        }

        classie.remove(element, this._openClassName);
        classie.add(element, this._closeClassName);

        if(this._isDashboard){
            gaUtils.closeSeekInfo(markLabel, true);
        }

        videoElement = element.querySelector('video');
        if (videoElement && videoElement.currentTime > 0) {
            videoElement.pause();
            videoElement.currentTime = 0;
        }

        if (hasThumbnailMenu) {
            $(element).hide();
        }

        // the code creates a bug 181 after fast clicking on open/close popup 
        // window.setTimeout(function () {
        //     // Hide popup after 0.5 s closing animation to free some memory on mobile browsers.
        //     $(element).hide();
        // }, 500);
    };

    // set left or right popup position on small responsive widget
    PopupService.prototype._setPopupPosition = function (element, pos, widgetBox) {
        var widgetRect = widgetBox.getBoundingClientRect();

        $(element).css('top', widgetRect.top);
        if (pos === 'right') {
            $(element).css('left', widgetRect.right + 20); // 20 is a value of popup margin  
        } else if (pos === 'left') {
            $(element).css('left', function () {
                var result = widgetRect.left - 296; // 296 is a value of popup width with margin
                if (result < 0) {
                    result = 0;
                }
                return result;
            });
        }
    };

    function getMarkLabel(element, currentPageName) {
        if (!currentPageName) return tplUtils.capitalizeFirst($(element).attr('id').split('_')[1]);

        var mName = tplUtils.capitalizeFirst($(element).attr('id').split('_')[1]),
            cpName = tplUtils.capitalizeFirst(currentPageName);

        if (mName === cpName) {
            return mName;
        }

        return cpName + '.' + mName;
    }

    window.PopupService = PopupService;
})(window, window.document, window.classie, window.jQuery, window.tplUtils, window.gaUtils);
