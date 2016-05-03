(function (window, document, $, tplUtils) {
    'use strict';

    var capitalizeFirst = tplUtils.capitalizeFirst,
        devLog = tplUtils.devLog,
        onViewersreadyExecuted = false;

    function gaRun() {
        window.ga && window.ga.apply(this, arguments);
    }

    function navigationToFrom(to, from) {
        devLog('Navigation, to: %s from: %s ', to, from);
        gaRun('send', 'event', 'Navigation', to, from);
    }

    function sendPageView(pageUrl, trackerName) {
        devLog('set an send page url: ', pageUrl);

        if(trackerName) {
            gaRun(trackerName + "." + 'set', 'page', pageUrl);
            gaRun(trackerName + "." + 'send', 'pageview');
        } else {
            gaRun('set', 'page', pageUrl);
            gaRun('send', 'pageview');
        }
    }

    function slideFrom(pageName) {
        devLog('Slide from: ', pageName);
        gaRun('send', 'event', 'Navigation', 'Slide', pageName);
    }

    function openSeekInfo(markLabel, pageview) {
        if(pageview) {
            devLog('openSeekInfo: ' + "vp/" + markLabel + "/Seek_info");
            sendPageView("vp/" + markLabel + "/Seek_info");
        } else {
            tplUtils.devLog('mark clicked %s', markLabel);
            gaRun('send', 'event', 'Education', 'Seek_info', markLabel);
        }
    }

    function closeSeekInfo(markLabel, pageview) {
        if(pageview){
            devLog('closeSeekInfo: ' + "vp/" + markLabel + "/Close_info");
            sendPageView("vp/" + markLabel + "/Close_info");
        } else {
            tplUtils.devLog('close mark %s', markLabel);
            gaRun('send', 'event', 'Education', 'Close_info', markLabel);
        }
    }

    function videoFn(fnName) {
        devLog('Video_click', fnName);
        gaRun('send', 'event', 'Education', 'Video_click', fnName);
    }

    /* For dashboard */

    // NAVIGATION

    function navigationMenuAction(action) {
        devLog(action + " navigation menu");
        gaRun('send', 'event', 'Navigation', action);
    }

    function goToPageNavigationMenu(page) {
        page = page.replace(/\s/g, '');

        devLog("Go to " + page + " navigation menu");
        gaRun('send', 'event', 'Navigation', 'GoToPage', page);
    }

    // SHARE

    function _share(networkName) {
        devLog("Share " + networkName);
        gaRun('send', 'event', 'Share', networkName);
    }

    function shareContainerAction(status) {
        devLog(status + " share container");
        gaRun('send', 'event', 'Share', status);
    }

    /*End for dashboard*/

    function _conditionsFrom(pageName) {
        if (arguments.length == 0) {
            devLog('conditions click');
            gaRun('send', 'event', 'Misc', 'Condition_click');
        } else {
            devLog('conditions click on: ', pageName);
            gaRun('send', 'event', 'Misc', 'Condition_click', pageName);
        }
    }

    function _poweredFrom(pageName) {
        if (arguments.length == 0) {
            devLog('powered click');
            gaRun('send', 'event', 'Misc', 'Powered_click');
        } else {
            devLog('powered click on: ', pageName);
            gaRun('send', 'event', 'Misc', 'Powered_click', pageName);
        }
    }

    function _arrowFrom(direction, pageName) {
        devLog('Arrow_%s, click on: %s', direction, pageName);
        gaRun('send', 'event', 'Navigation', 'Arrow_' + direction, pageName);
    }

    function _3dExplore(pageview) {
        if(pageview){
            devLog("3D_explore VirtualPage");
            sendPageView("vp/" + "Loupe3D" + "/3D_explore");
        } else {
            devLog('3D_explore');
            gaRun('send', 'event', 'Navigation', '3D_explore');
        }
    }

    function _3dView(btnName, pageview) {
        if(pageview){
            devLog('3D_view.' + btnName + " Virtual page");
            sendPageView("vp/" + "Loupe3D" + "/3D_view." + btnName);
        } else {
            devLog('3D_view.' + btnName);
            gaRun('send', 'event', 'Navigation', '3D_view', btnName);
        }
    }

    function _reportClick(pageName, pageview) {
        if(!pageName) pageName = "Report";

        if(pageview){
            devLog('report click virtual page');
            sendPageView("vp/" + pageName + "/Report_click");
        } else {
            devLog('pdf report click on: ', pageName);
            gaRun('send', 'event', 'Education', 'Report_click', pageName);
        }
    }

    function _set_3d_explore(dataObj) {
        if (dataObj.isMobile) {
            $('.inspect-stone > .viewport').on('touchstart', function (e) {
                _3dExplore();
            });
        } else {
            $('.inspect-stone > .viewport').on('mousedown', function (e) {
                _3dExplore();
            });
        }
    }

    function _set_3d_view() {
        $('.icon.top').on('click', function (e) {
            _3dView('Top');
        });

        $('.icon.bottom').on('click', function (e) {
            _3dView('Bottom');
        });

        $('.icon.side').on('click', function (e) {
            _3dView('Side');
        });

        $('.icon.magnify').on('click', function (e) {
            _3dView('Magnify');
        });
    }

    function gaOnViewersReady(dataObj) {
        if (!onViewersreadyExecuted) {
            onViewersreadyExecuted = true;

            $('.slider__btn--previous').on('click', function (e) {
                e.stopPropagation();
                _arrowFrom('left', capitalizeFirst(window.wData.prevPage));
            });

            $('.slider__btn--next').on('click', function (e) {
                e.stopPropagation();
                _arrowFrom('right', capitalizeFirst(window.wData.prevPage));
            });

            $('.footer__disclaimer').on('click', function (e) {
                e.stopPropagation();
                _conditionsFrom(capitalizeFirst(window.wData.currentPage));
            });

            $('.footer__powered').on('click', function (e) {
                e.stopPropagation();
                _poweredFrom(capitalizeFirst(window.wData.currentPage));
            });

            $('.externalPdf').on('click', function (e) {
                e.stopPropagation();
                _reportClick(capitalizeFirst(window.wData.currentPage));
            });

            $('.inspect-stone').on('click', function (e) {
                e.stopPropagation();
            });

            _set_3d_explore(dataObj);

            _set_3d_view();
        }
    }

    function gaDashboardViewersReady(dataObj) {

        //_set_3d_view();

        $('.icon.top').on('click', function (e) {
            _3dView('Top', true);
        });

        $('.icon.bottom').on('click', function (e) {
            _3dView('Bottom', true);
        });

        $('.icon.side').on('click', function (e) {
            _3dView('Side', true);
        });

        $('.icon.magnify').on('click', function (e) {
            _3dView('Magnifying', true);
        });

        //_set_3d_explore(dataObj);
        if (dataObj.isMobile) {
            $('.inspect-stone > .viewport').on('touchstart', function (e) {
                _3dExplore(true);
            });
        } else {
            $('.inspect-stone > .viewport').on('mousedown', function (e) {
                _3dExplore(true);
            });
        }


        $('.share-container > span').each(function (index, button) {
            $(button).on('click', function (e) {
                _share($(button).attr('data-service'));
            });
        });

        $(".disclaimer").on('click', function (e) {
            e.stopPropagation();
            _conditionsFrom();
        });

        $(".powered").on('click', function (e) {
            e.stopPropagation();
            _poweredFrom();
        });

        $('.externalPdf').on('click', function (e) {
            e.stopPropagation();
            _reportClick("Report", true);
        });

        $('address').on('click', function (e) {
            gaRun('send', 'event', 'Misc', 'Contact_us');
        });
    }

    window.gaUtils = {
        gaRun: gaRun,
        navigationToFrom: navigationToFrom,
        sendPageView: sendPageView,
        slideFrom: slideFrom,
        openSeekInfo: openSeekInfo,
        closeSeekInfo: closeSeekInfo,
        videoFn: videoFn,
        gaOnViewersReady: gaOnViewersReady,
        navigationMenuAction: navigationMenuAction,
        shareContainerAction: shareContainerAction,
        gaDashboardViewersReady: gaDashboardViewersReady,
        goToPageNavigationMenu: goToPageNavigationMenu
    };
})(window, window.document, window.jQuery, window.tplUtils);
