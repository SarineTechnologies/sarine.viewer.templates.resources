(function (window, document, navigator, $, FastClick, classie, Hammer, WallopSlider, PopupService, BulletNavigation, videoPlay, tplUtils, connectSlick, gaUtils) {
    'use strict';
    var devWidgetName = '';

    var viewersFinishedCount = 0,
        devLog = tplUtils.devLog,
        capitalizeFirst = tplUtils.capitalizeFirst,
        isDevMode = window.location.origin.indexOf('localhost') !== -1;

    if(isDevMode){
        window.setTimeout(function () {
            $(document).trigger('all_first_init_ended');
        }, 5 * 1000);
    }

    $(function () {
        var slider,
            storylineNav,
            summaryNav,
            thumbnailNav,
            popupService,
            openPopupTriggers,
            closePopupTriggers,
            lightGrades,
            lightGradesValues,
            stone = window.stones && window.stones[0],
            lightGradesMap = {
                1: 'minimum',
                2: 'standard',
                3: 'high',
                4: 'very-high',
                5: 'exceptional'
            },
            totalViewers,
            playTriggers,
            canvases,
            swipeRecognizer,
            urls = {
                baseTexts: getResourceUrl({
                    dev: 'api_tmp/common/en-US/resource.json',
                    dist: window.template.replace(/(\/viewers\/templates)\/.+/, '$1/common/' + window.configuration.selectedLanguage + '/resource.json')
                }),
                overrideTexts: getResourceUrl({
                    dev: 'dist/configurations/' + devWidgetName + '/en-US/resource.json',
                    dist: window.configuration.configUrl + '/' + window.configuration.selectedLanguage + '/resource.json'
                }),
                overrideCss: getResourceUrl({
                    dev: 'dist/configurations/' + devWidgetName + '/template.css',
                    dist: window.configuration.configUrl + '/template.css'
                }),
                extensions: getResourceUrl({
                    dev: 'dist/configurations/' + devWidgetName + '/scripts/template.js',
                    dist: window.configuration.configUrl + '/scripts/template.js'
                })
            },
            isMobile = isMobileOrTablet(),
            isMobileOnly = isOnlyMobile(),
            iframe, // iframe wrapper for widget
            $thumbnailViewer = $('.thumbnail__img-wrap'),
            $sliderWrap = $('.slider-wrap'),
            $slider = $sliderWrap.children('.slider'),
            $thumbnailMenu = $('.thumbnail-menu'),
            $summaryStories = $('.summary__stories'),
            $fireScale,
            fireScaleAttr = 'data-fire-scale',
            isDiscreteFireGrade,
        // merged text from base resourse.json and widget resourse.json
            dynamicText = {},
        // atom: pageCode
            pageCodes = {
                'loupeRealView': 'summary',
                'lightReportViewer': 'light',
                'loupeTopInspection': 'loupe',
                'loupe3DFullInspection': 'loupe3d',
                'loupeInscription': 'loupeInscription',
                'cutHeartsAndArrows': 'hna',
                'cut2DView': 'cut',
                'cut3DView': 'cut3d',
                'externalPdf': 'report',
                'loupeRealViewImage': 'thumbnail',
                'youtube': 'youtube',
                'lightReportViewer_fire': 'fire',
                'aboutUs': 'aboutUs'
            },
            connectComponents = {
                runYoutube: function () {
                    var shouldAutoplayYoutube = configuration.experiences.filter(function (e) {
                            return e.atom === 'youtube' && e.hasOwnProperty('autoPlay') && e.autoPlay;
                        }).length > 0;

                    if (shouldAutoplayYoutube) {
                        window.runSarineYoutubePlayer('youtube-player');
                    }
                },
                runPrepStoneProps: function () {
                    if (wConfig.customComponents && wConfig.customComponents.prepareStoneProps === true && typeof window.prepareStoneProperties === 'function') {
                        window.prepareStoneProperties();
                    }
                },
                setHackCertNumber: function () {
                    if (wConfig.customComponents && wConfig.customComponents.hackCertNumber === true) {
                        $(document).on('loadTemplate', function () {
                            var cert = $('[data-sarine-info="labs.0.certificateSerialNumber"]');
                            if (typeof cert !== 'undefined' && cert !== null && cert.text() === '') {
                                var grade = stone && stone.labs && stone.labs[0] && stone.labs[0].gradeId;
                                if (typeof grade !== 'undefined' && grade !== null && grade !== '') {
                                    cert.text(grade);
                                    cert.parent().show();
                                }
                            }
                        });

                    }
                },
                lightSpecsHorizontal: function () {
                    if (typeof window.setLightValues === 'function') {
                        window.setLightValues(stone.lightGrades);
                    }
                }
            },
            wConfig = window.configuration,
            wData = window.wData = {},
            isWidgetLoaded = false,
            isStoneRound = stone && stone.stoneProperties && (stone.stoneProperties.shape === 'Round' || stone.stoneProperties.shape === 'ModifiedRound'),
            hasSummaryStoryline = false,
            summaryStorylineClass = 'summary-storyline',
            disableTabIndexTags = ['canvas', 'button', 'svg', 'a', 'img'],
            parentHostname = (window.location !== window.parent.location) ? tplUtils.getParameter('hostname') : 'direct';

        // load general texts
        var baseTextsPromise = $.getJSON(urls.baseTexts);

        // load overide texts for this template (need to run only if exist)
        var overrideTextsPromise = $.getJSON(urls.overrideTexts);

        if ($('.slider__header')[0]) {
            $('.slider__header')[0].setVisibility = function (setVisible) {
                if (setVisible) {
                    classie.remove(this, 'slider__header--hide');
                    classie.add(this, 'slider__header--show');
                } else {
                    classie.add(this, 'slider__header--hide');
                    classie.remove(this, 'slider__header--show');
                }
            };
        }

        var extensionEvents = {
            beforeDataLoaded:'extensions_beforeDataLoaded',
            beforeMainLoaded:'extensions_beforeMainLoaded',
            afterMainLoaded:'extensions_afterMainLoaded'
        };

        // load all files
        baseTextsPromise.success(function (baseText) {
            if(wConfig.hasExtension){
                loadExtensions().then(function(){
                    startWidget(baseText);
                }, function(){
                    //start widget even if extension loading have failed
                    startWidget(baseText);
                });
            }else{
                startWidget(baseText);
            }
        }).fail(function (e) {
            console.error('fail to load all files:', e.responseText);
        });

        function startWidget(baseText){
            $(document).trigger(extensionEvents.beforeDataLoaded);

            dynamicText = baseText;
            devLog('baseText', baseText);

            wData.experiencesPages = getExperiencesPages(wConfig);
            wData.hasStorylineSlider = wData.experiencesPages && wData.experiencesPages.length > 5;
            tplUtils.sortArrayByObjectKey(wData.experiencesPages, 'order');

            devLog('connecting components')
            for (var key in connectComponents) {
                if (typeof connectComponents [key] === 'function') {
                    connectComponents[key]();
                }
            }

            devLog('loading override css');
            tplUtils.loadCSS(urls.overrideCss);

            $(document).trigger(extensionEvents.beforeMainLoaded);

            // load override resource if any and start the main function
            devLog('loading override resource');

            if(wConfig.dynamicTemplate){
                $(document).on('all_first_init_ended', function (e) {
                    devLog('ALL FIRST INIT ENDED');
                    filterExperiencesPages();
                    main();
                });
            }

            var iframe = 'body';
            var oldWidth = 0;

            overrideTextsPromise.success(function (overText) {
                dynamicText = $.extend(dynamicText, overText);
                devLog('merged resourse.json:', dynamicText);
                //main();
                calcHeight();
            }).fail(function (e) {
                devLog('failed to get overideText resourse.json:', e.responseText);
                //main();
                calcHeight();
            });


            if(!wConfig.dynamicTemplate){
                main();
            }

            $(document).trigger(extensionEvents.afterMainLoaded);

            function filterExperiencesPages() {
                var current = wData.experiencesPages;
                var filtered = [];

                for(var i = 0; i < current.length; i++){
                    if(isShouldBeAdded(current[i])){
                        filtered.push(current[i]);
                        devLog('should be in filtered');
                    } else {
                        devLog('should not be in filtered');
                    }

                    devLog(current[i]);
                }

                wData.experiencesPages = filtered;
            }

            function isShouldBeAdded(page){
                var pageCode = getPageCode(page);
                var templateVersion = page.templateVersion || '';

                if (pageCode === 'light') {
                    if (!templateVersion) templateVersion = 1;
                    pageCode += templateVersion;
                }

                var currentSlide = $('div.slider-wrap').find('.slide--' + pageCode),
                    currentViewer = currentSlide.find('.viewer');

                if(page.atom == 'youtube' || page.atom == 'aboutUs'){
                    //page.skip = false;
                    return true;
                }

                if (!currentViewer.length) return false;


                var currentViewerName = currentViewer.attr('class').replace('viewer ', '');
                devLog("Current Viewer Name: ");
                devLog(currentViewerName);

                var currentCanvas = currentViewer.find('.no_stone');
                devLog('Current Canvas');

                if(currentViewerName == "externalPdf"){
                    devLog("EXTERNAL PDF");
                    var link = document.viewersList[currentViewerName];
                    if(link && link.split("?").length < 2){
                        devLog("LINK: " + link);
                        devLog("SPLIT LINK: ");
                        devLog(link.split("?"));

                        //page.skip = true;
                        return false;
                    }
                }


                if (currentCanvas.length > 0 || !document.viewersList[currentViewerName]) {
                    //page.skip = true;
                    return false;
                    devLog('skip slide "%s"', currentViewerName);
                } else {
                    devLog("Valid viewer '%s': %s (%s)", currentViewerName, document.viewersList[currentViewerName], typeof document.viewersList[currentViewerName]);
                    return true;
                }
            }

            function calcHeight(){
                if (isMobile) {
                    onMobile($sliderWrap);
                } else {
                    if (typeof iframe === 'undefined' || iframe === null) {
                        console.log('No iframe was found');
                    } else {
                        onDesktop($sliderWrap);
                    }
                }
            }

            function onMobile($element) {
                if (isMobileOnly) {
                    classie.add($element[0], 'mobile');
                    $thumbnailViewer.hide();
                } else {
                    classie.add($element[0], 'tablet');
                    onDesktop($element);
                }
            }

            function onDesktop($element) {
                onIframeWidth($element, iframe, function mainHeightReady() {
                    $(document).trigger('mainHeightReady');
                });

                $(window).on('resize', function () {
                    onIframeWidth($element, iframe)
                });
            }

            // fixme handle popups when changing states
            function onIframeWidth($element, iframe, callback) {
                // hardcoded classes are thumbnail, intermediate, small, mobile, normal
                var iwidth = $(iframe).width() || 0;

                // handle thumbnail state
                if (iwidth < 200 && (oldWidth === 0 || oldWidth >= 200)) {
                    // console.log('*thumbnail state');
                    $element.setResponsiveClasses('thumbnail');
                    closeCommonPopup();
                    if (isWidgetLoaded) {
                        if ($sliderWrap.parent('.w-modal-content').length) {
                            $sliderWrap.show();
                        } else {
                            $sliderWrap.hide();
                        }
                        $thumbnailViewer.css({'display': ''});
                    }
                    oldWidth = iwidth;

                    callCallback(callback);
                    return;
                }
                // handle .small state when changing from .thumbnail or initial
                if (oldWidth < 200 && iwidth >= 200 && iwidth < 225) {
                    // console.log('*small state form thumbnail or initial');
                    //
                    $element.setResponsiveClasses('small');

                    if ($('.w-modal').is(':visible')) {
                        $('.w-modal-close.close-button').trigger('click');
                        window.setTimeout(function () {
                            runCommonActions(iwidth, callback);
                        }, 500);
                    } else {
                        runCommonActions(iwidth, callback);
                    }
                    return;
                }
                // handle .small state when changing from .intermediate
                if (oldWidth >= 225 && iwidth >= 200 && iwidth < 225) {
                    // console.log('*small state form intermediate');
                    $element.setResponsiveClasses('small');
                    runCommonActions(iwidth, callback);
                    return;
                }

                // handle .intermediate state when changing from .small
                if (oldWidth < 225 && iwidth >= 225 && iwidth < 295) {
                    // console.log('*intermediate state form small or initial');
                    $element.setResponsiveClasses('intermediate');
                    runCommonActions(iwidth, callback);
                    return;
                }

                // handle .intermediate state when changing from .normal.thumbnail
                if (oldWidth >= 295 && iwidth >= 225 && iwidth < 295) {
                    // console.log('*intermediate state form normal.thumbnail');
                    $element.setResponsiveClasses('intermediate');
                    runCommonActions(iwidth, callback);
                    return;
                }

                // handle .normal.thumbnail state
                if (oldWidth < 295 && iwidth >= 295) {
                    // console.log('*normal.thumbnail state form intermediate or initial');
                    $element.setResponsiveClasses('normal', 'thumbnail');
                    runCommonActions(iwidth, callback);
                    return;
                }
            }

            function runCommonActions(iwidth, callback) {
                closeCommonPopup();
                prepareView();
                oldWidth = iwidth;
                if (hasSummaryStoryline) {
                    $sliderWrap.addClass(summaryStorylineClass);
                }
                callCallback(callback);
            }

            function callCallback(callback) {
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }

            function prepareView() {
                if (isWidgetLoaded) {
                    $thumbnailViewer.hide();
                    $thumbnailMenu.hide();
                    $sliderWrap.show();
                    $slider.show();
                }
            }

            function closeCommonPopup() {
                $('.popup-wrap--open').hide();
                $('.popup-wrap--open').find('.popup__close-btn').trigger('click');
            }
        }

        function loadExtensions(){
            return tplUtils.getScriptByPromise(urls.extensions);
        }

        function main() {
            var oldWidth = 0,
                isIntitialStoryline = true;

            readConfig();
            setUrls();
            setTexts();
            setSrcs();

            setFireGrade();

            openPopupTriggers = Array.prototype.slice.call(document.querySelectorAll('[data-popup-id]'), 0);
            closePopupTriggers = Array.prototype.slice.call(document.querySelectorAll('.popup__close-btn'), 0);
            lightGrades = Array.prototype.slice.call(document.querySelectorAll('[data-light-grade]'), 0);
            lightGradesValues = Array.prototype.slice.call(document.querySelectorAll('[data-light-grade-value]'), 0);
            totalViewers = $('.viewer').length;
            playTriggers = Array.prototype.slice.call(document.querySelectorAll('[data-video-id]'), 0);
            canvases = Array.prototype.slice.call(document.querySelectorAll('canvas'), 0);

            slider = new WallopSlider(document.querySelector('.slider'), {
                btnPreviousClass: 'slider__btn--previous',
                btnNextClass: 'slider__btn--next',
                itemClass: 'slide',
                currentItemClass: 'slide--current',
                showPreviousClass: 'slide--show-previous',
                showNextClass: 'slide--show-next',
                hidePreviousClass: 'slide--hide-previous',
                hideNextClass: 'slide--hide-next'
            });

            //for sync navigation with current view
            $('.slider__btn').click(function() {
                var index = $('.storyline__item--active:not(.slick-cloned)').attr('data-slick-index');
                index && tplUtils.fire(document, 'slickGoToInitial', index);
            });

            $(document).on('touchstart', '.slider__btn', function (e) {
                var index = parseInt($('.storyline__item--active:not(.slick-cloned)').attr('data-slick-index'));

                if($(this).hasClass('slider__btn--next')) {
                    index++;
                } else {
                    index--;
                }

                index && tplUtils.fire(document, 'slickGoToInitial', index);
            });

            devLog('parentHostname: ', parentHostname);

             //window.ga && window.ga('create', 'UA-74702616-1', 'auto', 'tracker1');
            /* must be commented*/

            gaUtils.gaRun('set', 'dimension1', stone.friendlyName);
            gaUtils.gaRun('set', 'dimension2', parentHostname);
            gaUtils.gaRun('set', 'dimension4', stone.stoneProperties.carat);
            gaUtils.gaRun('set', 'dimension5', stone.stoneProperties.clarity);
            gaUtils.gaRun('set', 'dimension6', stone.stoneProperties.color);
            gaUtils.gaRun('set', 'dimension8', stone.stoneProperties.cutGrade);

            gaUtils.sendPageView(getCurPageUrl());

            iframe = 'body';

            // init thumbnail nav in responsive thumbnail
            if ($('.popup__menu').length) {
                thumbnailNav = new BulletNavigation({
                    slider: slider,
                    bulletsContainer: document.querySelector('.popup__menu'),
                    bulletClassName: '.popup-menu__item',
                    isMobile: isMobile
                });
            }
            // if not enough slides to connect slick,
            if (wData && !wData.hasStorylineSlider) {
                // on mobile
                if (isMobileOnly) {
                    initSummaryStoriesNav();
                    devLog('initialized summaryStories, mobile no slick');

                    // in mobile storyline is always slick
                    $(document).on('storylineSlickReady', function () {
                        initStorylineNav();
                        devLog('initialized storyLine mobile, mobile slick');
                    });
                } else { // on desktop and tablet no slick
                    initSummaryStoriesNav();
                    devLog('initialized summaryStories, desktop no slick');

                    initStorylineNav();
                    isIntitialStoryline = false;
                    devLog('initialized storyLine, desktop no slick');
                }
                // if enough slides to connect slick
            } else if (wData && wData.hasStorylineSlider) {

                $(document).on('storylineSlickReady', function () {
                    initStorylineNav();
                    devLog('initialized storyLine, slick');
                });

                $(document).on('summaryStoriesSlickReady', function () {
                    initSummaryStoriesNav();
                    devLog('initialized summaryStories, slick');
                });
                // on small view - no slick on desktop and tablet
                if ($sliderWrap.hasClass('small') && isIntitialStoryline) {
                    initStorylineNav();
                    isIntitialStoryline = false;
                    devLog('initialized storyLine, small no slick');
                }
            }

            $(document).on('storylineNoSlick', function () {
                // init only 1 time
                if (isIntitialStoryline) {
                    initStorylineNav();
                    isIntitialStoryline = false;
                    devLog('initialized storylineNoSlick');
                }
            });


            connectSlick('summaryStories');
            connectSlick('storyline');

            FastClick.attach(document.body);

            slider.on('change', function (e) {
                var header = e.detail.parentSelector.querySelector('.slider__header'),
                    container = $(e.detail.parentSelector);

                wData.prevPage = wData.currentPage;
                wData.currentPage = container.find('ul.slider__list > .slide').eq(e.detail.currentItemIndex).attr('data-slidename');

                gaUtils.navigationToFrom(capitalizeFirst(wData.currentPage), capitalizeFirst(wData.prevPage));
                gaUtils.sendPageView(getCurPageUrl());

                container.attr('class', 'slider');

                if (wData.currentPage === 'summary') {
                    header.setVisibility(hasSummaryStoryline);
                } else {
                    header.setVisibility(true);
                }

                container.addClass('slider--' + wData.currentPage);

                if (wData.currentPage === 'youtube') {
                    tplUtils.fire(document, 'playSarineYoutube', wData.currentPage);
                } else {
                    tplUtils.fire(document, 'stopSarineYoutube');
                }

                if (wData.prevPage === 'fire') {
                    setSlideFireOnlyScale(100);
                }

                $('body').trigger('initSlick');
            });

            if (Hammer) {
                swipeRecognizer = isMobile ? new Hammer(document.querySelector('.slider__list')) : new Hammer(document.getElementById('slider'));
                // swipeRecognizer = new Hammer(document.getElementById('slider'));
                swipeRecognizer.on('swipeleft swiperight', function (e) {
                    gaUtils.slideFrom(capitalizeFirst(wData.currentPage));

                    if (e.type === 'swipeleft') {
                        slider.next();
                    } else {
                        slider.previous();
                    }
                });
            }

            if (isStoneRound) {
                setTotalGrade();
            }

            setLightGradesClasses();
            // currently the values are used in the small view
            setLightGradesValues();

            setTotalGrade();

            if (wData.currentPage === 'fire') {
                setSlideFireOnlyScale();
            }

            $('.slide--fire').on('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
                if (wData.currentPage === 'fire') {
                    setSlideFireOnlyScale();
                }
            });

            openPopupTriggers.forEach(function (element) {
                var popupWrap = document.getElementById(element.getAttribute('data-popup-id'));

                if (popupWrap && !(isMobileOnly && element.getAttribute("data-not-open-mobile") === 'true')) {
                    element.addEventListener('click', function () {
                        popupService.open(popupWrap);
                    });
                }
            });

            closePopupTriggers.forEach(function (element) {
                element.addEventListener('click', function () {
                    popupService.close(element.parentNode.parentNode);
                });
            });

            playTriggers.forEach(function (element) {
                videoPlay.initButton(element);
            });

            canvases.forEach(function (element) {
                if (classie.has(element, 'no_stone')) {
                    totalViewers--;
                    devLog('no_stone. Reduced totalViewers ->', totalViewers);
                }
            });

            if (wData && wData.hasStorylineSlider) {
                $summaryStories.on('mouseup mousemove touchend', function (event) {
                    event.stopPropagation();
                });

            }

            onViewersReady();


            function setSlideFireOnlyScale(percents) {

                if (!$fireScale.length) return;

                $fireScale.stop();

                var fire = stone && stone.lightGrades && stone.lightGrades.fire;

                if (isDiscreteFireGrade && fire.value) {
                    $fireScale.css({'height': 100 - fire.value * 20 + '%'});
                } else {

                    if (percents) {
                        return $fireScale.css({'height': percents + '%'});
                    }
                    var grade = stone && stone.lightGrades && stone.lightGrades.fire,
                        percentage = grade && grade.percentage;

                    if (!percentage) return;

                    var value = 100 - percentage * 100;

                    $fireScale.css({'height': value + '%'});
                }
            }

            function getCurPageUrl() {
                return "/" + wData.currentPage;
            }

            function setLightGradesClasses() {
                lightGrades.forEach(function (element) {
                    var grade = stone && stone.lightGrades && stone.lightGrades[element.getAttribute('data-light-grade')],
                        value = grade && grade.value;

                    if (value && lightGradesMap[value]) {
                        classie.add(element, 'specs__points--' + lightGradesMap[value]);
                    }
                });
            }

            function setLightGradesValues() {
                lightGradesValues.forEach(function (element) {
                    var grade = stone && stone.lightGrades && stone.lightGrades[element.getAttribute('data-light-grade-value')],
                        name = grade && grade.name;

                    if (name) {
                        $(element).html(name);
                    }
                });
            }

            function onMobile($element) {
                if (isMobileOnly) {
                    classie.add($element[0], 'mobile');
                    $thumbnailViewer.hide();
                } else {
                    classie.add($element[0], 'tablet');
                    onDesktop($element);
                }
            }

            function onDesktop($element) {
                onIframeWidth($element, iframe, function mainHeightReady() {
                    $(document).trigger('mainHeightReady');
                });

                $(window).on('resize', function () {
                    onIframeWidth($element, iframe)
                });
            }

            // fixme handle popups when changing states
            function onIframeWidth($element, iframe, callback) {
                // hardcoded classes are thumbnail, intermediate, small, mobile, normal
                var iwidth = $(iframe).width() || 0;

                // handle thumbnail state
                if (iwidth < 200 && (oldWidth === 0 || oldWidth >= 200)) {
                    // console.log('*thumbnail state');
                    $element.setResponsiveClasses('thumbnail');
                    closeCommonPopup();
                    if (isWidgetLoaded) {
                        if ($sliderWrap.parent('.w-modal-content').length) {
                            $sliderWrap.show();
                        } else {
                            $sliderWrap.hide();
                        }
                        $thumbnailViewer.css({'display': ''});
                    }
                    oldWidth = iwidth;

                    callCallback(callback);
                    return;
                }
                // handle .small state when changing from .thumbnail or initial
                if (oldWidth < 200 && iwidth >= 200 && iwidth < 225) {
                    // console.log('*small state form thumbnail or initial');
                    //
                    $element.setResponsiveClasses('small');

                    if ($('.w-modal').is(':visible')) {
                        $('.w-modal-close.close-button').trigger('click');
                        window.setTimeout(function () {
                            runCommonActions(iwidth, callback);
                        }, 500);
                    } else {
                        runCommonActions(iwidth, callback);
                    }
                    return;
                }
                // handle .small state when changing from .intermediate
                if (oldWidth >= 225 && iwidth >= 200 && iwidth < 225) {
                    // console.log('*small state form intermediate');
                    $element.setResponsiveClasses('small');
                    runCommonActions(iwidth, callback);
                    return;
                }

                // handle .intermediate state when changing from .small
                if (oldWidth < 225 && iwidth >= 225 && iwidth < 295) {
                    // console.log('*intermediate state form small or initial');
                    $element.setResponsiveClasses('intermediate');
                    runCommonActions(iwidth, callback);
                    return;
                }

                // handle .intermediate state when changing from .normal.thumbnail
                if (oldWidth >= 295 && iwidth >= 225 && iwidth < 295) {
                    // console.log('*intermediate state form normal.thumbnail');
                    $element.setResponsiveClasses('intermediate');
                    runCommonActions(iwidth, callback);
                    return;
                }

                // handle .normal.thumbnail state
                if (oldWidth < 295 && iwidth >= 295) {
                    // console.log('*normal.thumbnail state form intermediate or initial');
                    $element.setResponsiveClasses('normal', 'thumbnail');
                    runCommonActions(iwidth, callback);
                    return;
                }
            }

            function runCommonActions(iwidth, callback) {
                closeCommonPopup();
                prepareView();
                oldWidth = iwidth;
                if (hasSummaryStoryline) {
                    $sliderWrap.addClass(summaryStorylineClass);
                }
                callCallback(callback);
            }

            function callCallback(callback) {
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }

            function prepareView() {
                if (isWidgetLoaded) {
                    $thumbnailViewer.hide();
                    $thumbnailMenu.hide();
                    $sliderWrap.show();
                    $slider.show();
                }
            }

            function closeCommonPopup() {
                $('.popup-wrap--open').hide();
                $('.popup-wrap--open').find('.popup__close-btn').trigger('click');
            }

            function initStorylineNav() {
                storylineNav = new BulletNavigation({
                    slider: slider,
                    bulletsContainer: document.querySelector('.storyline'),
                    bulletClassName: '.storyline__item',
                    activeBulletClassName: 'storyline__item--active',
                    isStoryline: true,
                    isMobile: isMobile
                });
            }

            function initSummaryStoriesNav() {
                // init summary stories
                if ($('.summary__stories').length) {
                    summaryNav = new BulletNavigation({
                        slider: slider,
                        bulletsContainer: document.querySelector('.summary__stories'),
                        bulletClassName: '.summary__story',
                        isMobile: isMobile
                    });
                }
            }

            function setFireGrade() {
                var firePage = getFirePage();
                if (firePage && firePage.discrete) {
                    isDiscreteFireGrade = firePage.discrete;
                } else {
                    isDiscreteFireGrade = false;
                }
            }

            function getFirePage() {
                var arr = wData.experiencesPages;
                var result = arr.filter(function (item) {
                    if (item && item.page == 'fire') return true;
                });

                return result[0];
            }
            console.log("main end");
        }

        function setTotalGrade() {
            var name = stone && stone.lightGrades && stone.lightGrades.totalGrade && stone.lightGrades.totalGrade.name,
                gradeScales = window.gradeScales || {},
                totalGradeScales = gradeScales.totalGrade,
                totalGrade = document.querySelector('[data-total-grade]'),
                totalGradeStars = document.querySelector('[data-total-grade-stars]'),
                displayVal;

            if (name && totalGradeScales && totalGrade) {
                totalGradeScales.some(function (item) {
                    if (item.name === name) {
                        displayVal = item['default-display'];
                        totalGrade.innerHTML = displayVal.split(' ')[0];
                        totalGradeStars.innerHTML = new Array(parseInt(displayVal[displayVal.length - 1]) + 1).join('★');
                        return true;
                    }
                    return false;
                });
            }
        }

        function onViewersReady() {
            devLog('onViewersReady start: show widget');

            parseSarineInfos();
            setProvidedLab();

            disableTabIndex(disableTabIndexTags);

            if ($sliderWrap.hasClass('thumbnail') && !$sliderWrap.hasClass('normal')) {
                showWidget('thumbnail');
            } else {
                showWidget('all');
            }

            $('body').trigger('initSlick');

            isWidgetLoaded = true;

            gaUtils.gaOnViewersReady({'isMobile': isMobile});

            cut3dEvents();

            function showWidget(type) {
                if (type === 'thumbnail') {
                    if ($sliderWrap.parent('.w-modal-content').length) {
                        devLog('thumbnail in modal');
                        $sliderWrap.css({'display': 'block'});
                    } else {
                        $sliderWrap.css({'display': 'none'});
                        devLog('thumbnail not in modal');
                    }
                    $thumbnailViewer.css({'display': ''});
                    $('.preloader').hide();

                } else if (type === 'all') {
                    $sliderWrap.css({'display': 'block'});
                    $slider.show();
                    $('.preloader').hide();
                }
            }

            function disableTabIndex(arr) {
                arr.forEach(function (element, index) {
                    // focusable --- ie fix - not always work, since we don't know exectly the moment cut viewer is loaded
                    $(element).attr({
                        'tabindex': -1,
                        'focusable': false
                    });
                });
            }

            function cut3dEvents() {
                var $cut3dUnits = $(".cut3d-nav .unit"),
                    $cut3dViewer = $('.cut3DView'),
                    attrName = 'data-name';

                $('.cut3d-nav').on('click', '.unit', function (e) {
                    var $el = $(this),
                        attrVal = $el.attr(attrName);
                    e.stopPropagation();

                    if ($el.hasClass('active')) {
                        if (attrVal === 'transparent') {
                            $cut3dViewer.find('canvas').trigger(attrVal);
                        }

                        return;
                    }

                    $cut3dUnits.removeClass("active");
                    $el.addClass("active");
                    $cut3dViewer.find('canvas').trigger(attrVal);
                });

                $cut3dViewer.on('touchstart mousedown', 'canvas', function (e) {

                    $cut3dUnits.removeClass("active");
                });
            }
        }

        function parseSarineInfos() {
            var attrNames = {
                sarineInfo: 'data-sarine-info',
                defaultVal: 'data-default-value'
            };

            $('[' + attrNames.sarineInfo + ']').each(function () {
                var element = $(this),
                    field = element.attr(attrNames.sarineInfo),
                    value = tplUtils.recurse(stone, field.split('.')),
                    isReportLabName = element.attr('data-lab-name-report') || null;

                if (value === (void 0) || value === null) {
                    if (isReportLabName) { // if no value from API and is data-lab-name-report - show 'Report'
                        value = "Report";
                    } else if(element.attr(attrNames.defaultVal)) {
                        value = element.attr(attrNames.defaultVal);
                        devLog('Field "%s" not found. Using default value: "%s"', field, value);
                    } else {
                        element.parent().hide();
                    }
                } else if (field === 'stoneProperties.carat') {
                    if (parseFloat(value) > 0) {
                        value = parseFloat(value).toFixed(3);
                    } else {
                        element.parent().hide();
                    }
                } else if (isReportLabName && field === 'labs.0.name') { // if is value from API and is data-lab-name-report - show '<LabName> Report'
                    value += " " + "Report";
                }
                element.html(value);
            });
        }

        function setProvidedLab() {
            var stoneProperties = stone.stoneProperties;
            var labName = stones[0] && stones[0].labs && stones[0].labs[0].name;

            var infoStringContainer = $('[data-text="slide.summary.partyInformation"]');
            if(infoStringContainer.length == 0) return;

            var properties = ["carat","clarity","color","cutGrade","shape","polish","symmetry","fluorescence","fluorescenceColor","width","height","depth"];

            for(var i = 0; i < properties.length; i++){
                if(stoneProperties.hasOwnProperty(properties[i])){
                    if(labName && labName.length > 0){
                        infoStringContainer.text("Information provided by");
                    } else {
                        $(".lab-name").css("display","none");
                        infoStringContainer.html("Information provided by 3<sup>rd</sup> party");
                    }

                    infoStringContainer.parent().css("display","block");

                    break;
                }
            }
        }

        function iterateConfigPages(iterator) {
            var i, cpl, pagesForIterate;

            if (typeof iterator !== 'function') return;

            pagesForIterate = wData.experiencesPages;

            cpl = pagesForIterate.length;

            for (i = 0; i < cpl; i++) {
                iterator(pagesForIterate[i], i);
            }
        }

        function readConfig() {
            var elements = {
                    storylineContainer: $('.storyline'),
                    sliderPagesContainer: $('ul.slider__list'),
                    summaryLinksContainer: $('.summary__stories'),
                    tmpSlidesContainer: $('<div/>'),
                    aSlider: $('#slider'),
                    sliderHeader: $('.slider__header')
                },
                activeSlidesCount;

            elements.tmpSlidesContainer.append(elements.sliderPagesContainer.find('> .slide'));

            // Add storyline items
            iterateConfigPages(function (page, i) {
                var navTitle = getNavigationTitle(page);
                if (page.skip) return;

                $('<div />', {
                    class: 'storyline__item',
                    'data-target': i
                }).html(navTitle).appendTo(elements.storylineContainer);
            });

            activeSlidesCount = $('.storyline__item').length;

            // Enable slides
            iterateConfigPages(function (page) {
                var slide,
                    pageCode = getPageCode(page),
                    templateVersion = page.templateVersion || '';

                if (page.skip) return;

                if (pageCode === 'light') {
                    if (!templateVersion) templateVersion = 1;
                    pageCode += templateVersion;
                }

                slide = elements.tmpSlidesContainer.find('> .slide.slide--' + pageCode);

                if (!slide) return;

                if (templateVersion && ~pageCode.indexOf('light')) {
                    // remove class with 'slide--pageCode<tmplVersion>' name
                    classie.remove(slide[0], 'slide--' + pageCode);
                    // set page code without templateVersion
                    pageCode = getPageCode(page);

                    classie.add(slide[0], 'slide--' + pageCode);
                }

                if (pageCode === 'light' && !isStoneRound && templateVersion === 1) {
                    slide.addClass('non-round-stone');
                }

                if (pageCode === 'loupe3d' && templateVersion) {
                    slide.addClass(' ctrl-3d-' + templateVersion);
                }

                if (page.hasStoryline && pageCode === 'summary') {
                    hasSummaryStoryline = true;
                    $sliderWrap.addClass(summaryStorylineClass);
                }

                slide.attr('data-slidename', pageCode)
                    .appendTo(elements.sliderPagesContainer);
            });
            elements.tmpSlidesContainer.remove();
            elements.aSlider.addClass('slider--' + $('.slide:first').attr('data-slidename'));
            $('.slide:first').addClass('slide--current');

            addPopups();
            addThumbnailMenuItems();

            // Add slides links for summary page
            iterateConfigPages(function (page, i) {
                var pageCode = getPageCode(page);
                if (pageCode === 'summary' || pageCode === 'thumbnail' || page.skip) return;

                //var svg = '<svg><use xlink:href="#'+pageCode+'"></use></svg>';
                var svgDom = document.getElementById(pageCode).innerHTML;
                var svg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="50px" height="50px" viewBox="0 0 50 50">' + svgDom + '</svg>';

                $('<div/>', {
                    class: 'summary__story summary__story--' + pageCode,
                    'data-target': i
                }).html(getNavigationTitle(page)).prepend(svg).appendTo(elements.summaryLinksContainer);
            });

            initActiveItemStoryline();

            // summary links class added 
            if (activeSlidesCount - 1 > 0) {
                elements.summaryLinksContainer.addClass('items-count-' + (activeSlidesCount - 1));
            }

            if (elements.aSlider.find('ul.slider__list > .slide').eq(0).attr('data-slidename') !== 'summary') {
                elements.sliderHeader[0].setVisibility(true);
            } else {
                wData.isFirstPageSummary = true;
                elements.sliderHeader[0].setVisibility(hasSummaryStoryline);
            }

            wData.currentPage = getPageCode(wData.experiencesPages[0]);
            wData.prevPage = wData.currentPage;

            popupService = new PopupService({
                overlay: document.getElementById('popup_overlay')
            });

            $fireScale = $('[' + fireScaleAttr + ']');

            function initActiveItemStoryline() {
                if (activeSlidesCount > 1) {
                    elements.storylineContainer
                        .addClass('items-count-' + activeSlidesCount)
                        .find('> .storyline__item').eq(0).addClass('storyline__item--active');
                } else {
                    elements.storylineContainer.add('.slider__btn').hide();
                }
            }

            function addPopups() {
                var attrName = 'data-popup-id',
                    popupsContainer = $('.popups-container');

                $('[' + attrName + ']').each(function (index, element) {
                    var attrValue = $(element).attr(attrName),
                        popup = popupsContainer.find('#' + attrValue);

                    popup.appendTo($sliderWrap);
                });

                popupsContainer.remove();
            }

            function addThumbnailMenuItems() {
                var thumbnailPopupMenu = $('.popup__menu');

                iterateConfigPages(function (page, i) {
                    var navTitle = getNavigationTitle(page);

                    if (page.skip) return;

                    if (thumbnailPopupMenu.length) {
                        $('<li />', {
                            class: 'popup-menu__item',
                            'data-target': i
                        }).html(navTitle).appendTo(thumbnailPopupMenu);
                    }
                });
            }
        }

        function setTexts() {
            var attrName = 'data-text';

            $('[' + attrName + ']').each(function () {
                var $el = $(this),
                    valueFromConfig = '';
                try {
                    valueFromConfig = dynamicText[$el.attr(attrName)];
                } catch (e) {
                    console.log(e);
                }
                $el.html(valueFromConfig);

                if (valueFromConfig === '') {
                    $el.parent().hide();
                }
            });
        }

        function setUrls() {
            var attrName = 'data-url';
            $('[' + attrName + ']').each(function () {
                var $el = $(this),
                    valueFromConfig = '';
                try {
                    valueFromConfig = dynamicText[$el.attr(attrName)];
                } catch (e) {
                    console.log(e);
                }

                $el.attr('href', valueFromConfig);
            });
        }

        function setSrcs() {
            var attrName = 'data-src';
            $('[' + attrName + ']').each(function () {
                var $el = $(this),
                    valueFromConfig = '';
                try {
                    valueFromConfig = dynamicText[$el.attr(attrName)];
                } catch (e) {
                    console.log(e);
                }

                $el.attr('src', valueFromConfig);
            });
        }

        function isMobileOrTablet() {
            var res = false;
            (function (a) {
                if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))res = true
            })(navigator.userAgent || navigator.vendor || window.opera);
            return res;
        }

        function isOnlyMobile() {
            var res = false,
                width = window.Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight);

            (function (a) {
                if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))res = true
            })(navigator.userAgent || navigator.vendor || window.opera);

            return res && width < 480;
        }

        function getPageCode(page) {
            if (page.page) return pageCodes[page.atom + '_' + page.page];

            return pageCodes[page.atom];
        }

        function getNavigationTitle(page) {
            var key = "navigation." + getPageCode(page) + ".title";
            return dynamicText[key];
        }

        function getExperiencesPages(config) {
            var arr = [],
                res = [];

            arr = config && config.experiences;

            if (!arr) return;

            return arr.filter(function (experience) {
                return !(experience.type && experience.type === 'thumbnail');
            });
        }
    });

    function getResourceUrl(resourceObj) {
        var mapKey = window.location.origin.indexOf('localhost') === -1 ? 'dist' : 'dev';
        return resourceObj[mapKey] + window.cacheVersion;
    }

})(window, window.document, navigator, window.jQuery, window.FastClick, window.classie, window.Hammer, window.WallopSlider, window.PopupService, window.BulletNavigation, window.videoPlay, window.tplUtils, window.connectSlick, window.gaUtils);
