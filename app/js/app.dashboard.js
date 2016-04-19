(function (window, document, $, FastClick, classie, PopupService, videoPlay, jss, tplUtils, gaUtils) {
    'use strict';
    var devWidgetName = '';

    var templatesLoaded = false,
        isDevMode = window.location.origin.indexOf('localhost') !== -1,
        viewersFinishedCount = 0,
        allFirstInitEnded = $.Deferred(),
        dashboard = document.querySelector('.dashboard'),
        devLog = tplUtils.devLog;

    // hide dashboard
    dashboard.style.opacity = 0;

    $(document).on('loadTemplate customLoad', function () {
        devLog('loadTemplate');
        if (!templatesLoaded) {
            templatesLoaded = true;
            startWidget();
        }
    });

    ////simulate in dev mode loadTemlate event
    if (isDevMode) {
        window.setTimeout(function(){
            $(document).trigger('customLoad');   
        }, 2 * 1000);

        window.setTimeout(function(){
            $(document).trigger('all_first_init_ended');  
        }, 5 * 1000);                 
    }

    $(document).on('all_first_init_ended', function (){
        allFirstInitEnded.resolve();
    });

    function startWidget() {
        var popupService = new PopupService({
                overlay: null,
                isDashboard: true
            }),
            openPopupTriggers,
            sarineInfos,
            lightGrades,
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
            dText,
            wConfig = window.configuration,
            wData = window.wData = {},
            // merged text from base resourse.json and widget resourse.json
            dynamicText = {},
            // atom: pageCode 
            pageCodes = {
                'loupeRealView': 'real',
                'lightReportViewer': 'light',
                'loupeTopInspection': 'loupe',
                'loupe3DFullInspection': 'loupe3d',
                'loupeInscription': 'loupeInscription',
                'cutHeartsAndArrows': 'hna',
                'cut2DView': 'cut',
                'cut3DView': 'cut3d',
                'externalPdf': 'report',
                'youtube': 'youtube',
                'lightReportViewer_fire': 'fire',
                'aboutUs': 'aboutUs'
            },
            urls = {
                baseTexts: getResourceUrl({
                    dev: 'api_tmp/common/en-US/resource.json',
                    dist: window.template.replace(/(\/viewers\/templates)\/.+/, '$1/common/'+ window.configuration.selectedLanguage + '/resource.json')
                }),
                overrideTexts: getResourceUrl({
                    dev: 'dist/configurations/' + devWidgetName + '/en-US/resource.json',
                    dist: window.configuration.configUrl + '/' + window.configuration.selectedLanguage + '/resource.json'
                }),
                overrideCss: getResourceUrl({
                    dev: 'dist/configurations/'+ devWidgetName +'/template.css',
                    dist: window.configuration.configUrl + '/template.css'
                }),
                extensions: getResourceUrl({
                    dev: 'dist/configurations/' + devWidgetName + '/scripts/template.js',
                    dist: window.configuration.configUrl + '/scripts/template.js'
                })
            },
            slidesContainerSelector = 'section.slide-wrap',
            onViewersReadyExecuted = false,
            isStoneRound = stone && stone.stoneProperties && (stone.stoneProperties.shape === 'Round' || stone.stoneProperties.shape === 'ModifiedRound'),
            parentHostname = (window.location !== window.parent.location) ? tplUtils.getParameter('hostname') : 'direct',
            connectComponents = {
                setHackCertNumber: function () {
                    if (wConfig.customComponents && wConfig.customComponents.hackCertNumber === true) {
                        $(document).on('loadTemplate', function() {
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
                lightSpecsHorizontal: function() {
                    if (typeof window.setLightValues === 'function') {
                        window.setLightValues(stone.lightGrades);
                    }
                },
                youtube: function() {
                    if (hasExperiencesPage('youtube') && typeof window.runSarineYoutubePlayer === 'function') {
                        window.runSarineYoutubePlayer('youtube-player');
                    }
                } 
            };

        // load general texts
        var baseTextsPromise = $.getJSON(urls.baseTexts);
    
        // load overide texts for this template (need to run only if exist)
        var overrideTextsPromise = $.getJSON(urls.overrideTexts);

        var extensionEvents = {
            beforeDataLoaded: 'extensions_beforeDataLoaded',
            beforeMainLoaded: 'extensions_beforeMainLoaded',
            afterMainLoaded: 'extensions_afterMainLoaded'
        };

        // load all files
        baseTextsPromise.success(function (baseText) {
            if(wConfig.hasExtension){
                loadExtensions().then(function(){
                    startDashboard(baseText);
                }, function(){
                    //start dashboard even if extension loading have failed
                    startDashboard(baseText);
                });
            }else{
                startDashboard(baseText);
            }

        }).fail(function (e) {
            console.error('fail to load all files:', e.responseText);
        });

        function startDashboard(baseText){
            $(document).trigger(extensionEvents.beforeDataLoaded);

            dynamicText = baseText;
            devLog('baseText', baseText);

            wData.experiencesPages = getExperiencesPages(wConfig);

            devLog('connecting components');
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
            overrideTextsPromise.success(function (overText) {
                dynamicText = $.extend(dynamicText, overText);
                devLog('merged resourse.json:', dynamicText);
                start();
            }).fail(function (e) {
                devLog('failed to get overideText resourse.json:', e.responseText);
                start();
            });

            $(document).trigger(extensionEvents.afterMainLoaded);
        }


        function isShouldBeAdded(page) {
            var pageCode = getPageCode(page);
            var templateVersion = page.templateVersion || '';

            if (pageCode === 'light') {
                if (!templateVersion) templateVersion = 1;
                pageCode += templateVersion;
            }


            var currentSlide = $(slidesContainerSelector).find('.slide--' + pageCode),
                currentViewer = currentSlide.find('.viewer'),
                noStoneCanvas = currentViewer.find('.no_stone');

            if(page.atom == 'youtube' || page.atom == 'aboutUs') {
              devLog("Valid viewer '%s'", page.atom);
               return true; 
            }

            if (!currentViewer.length) return false;

            if (page.atom === 'externalPdf') {
                var link = document.viewersList[page.atom];
                if (link && link.split("?").length < 2) {
                    devLog("LINK: " + link);
                    devLog('skip slide "%s"', page.atom);
                    return false;
                }
            }

            if (noStoneCanvas.length > 0 || !document.viewersList[page.atom]) {
                devLog('skip slide "%s"', page.atom);
                return false;
             } else {
                devLog("Valid viewer '%s': %s (%s)", page.atom, document.viewersList[page.atom], typeof document.viewersList[page.atom]);
                return true;
            }
        }

        function loadExtensions(){
            return tplUtils.getScriptByPromise(urls.extensions);
        }
       
        function set_ga_stone_dimension() {
            gaUtils.gaRun('set', 'dimension1', stone.friendlyName);
            gaUtils.gaRun('set', 'dimension2', parentHostname);
            gaUtils.gaRun('set', 'dimension4', stone.stoneProperties.carat);
            gaUtils.gaRun('set', 'dimension5', stone.stoneProperties.clarity);
            gaUtils.gaRun('set', 'dimension6', stone.stoneProperties.color);
            gaUtils.gaRun('set', 'dimension8', stone.stoneProperties.cutGrade);

            gaUtils.sendPageView(window.location.pathname);
        }
        function start() {
            allFirstInitEnded.done(function() {
                console.log('BEFORE', wData.experiencesPages);
                if (wConfig.dynamicTemplate) {
                    wData.experiencesPages = wData.experiencesPages.filter(isShouldBeAdded);
                }
                tplUtils.sortArrayByObjectKey(wData.experiencesPages, 'order');
                console.log('AFTER', wData.experiencesPages);
                main();
            });
        }
        
        function main() {
            readConfig();
            setUrls();
            setTexts();
            setSrcs();
            
            openPopupTriggers = Array.prototype.slice.call(document.querySelectorAll('[data-popup-id]'), 0);
            sarineInfos = Array.prototype.slice.call(document.querySelectorAll('[pages]'), 0);
            lightGrades = Array.prototype.slice.call(document.querySelectorAll('[data-light-grade]'), 0);
            totalViewers = $('.viewer').length;
            playTriggers = Array.prototype.slice.call(document.querySelectorAll('[data-video-id]'), 0);
            canvases = Array.prototype.slice.call(document.querySelectorAll('canvas'), 0);

            //window.ga && window.ga('create', 'UA-74702616-1', 'auto', {'name': 'dashboardTracker'});
            set_ga_stone_dimension();

            FastClick.attach(document.body);

            canvases.forEach(function (element) {
                if (classie.has(element, 'no_stone')) {
                    totalViewers--;
                    devLog('no_stone. Reduced totalViewers ->', totalViewers);
                }
            });
            
            if (isStoneRound) {
                setTotalGrade();
            }
            setLightGradesClasses();
                     
            playTriggers.forEach(function (element) {
                videoPlay.initButton(element);
            });

            openPopupTriggers.forEach(function (element) {
                var popupWrap = document.getElementById(element.getAttribute('data-popup-id'));

                if (!popupWrap) return;
                
                element.addEventListener('click', function () {
                    var popupContainer = $(this).closest('.slide').find('.popup-container'),
                        currentPopup;

                    if (popupContainer[0].isActive) {
                        return;
                    } else {
                        popupContainer[0].isActive = true;
                        popupContainer.show();
                    }

                    $('<div class="popup-overlay popup-overlay--open"/>').appendTo(popupContainer);
                    currentPopup = $(popupWrap)
                            .clone()
                            .appendTo(popupContainer)
                            .attr('id', $(popupWrap).attr('id') + '_copy');
                    popupService.open(currentPopup[0]);
                    
                    // Add event listener for Close button
                    currentPopup.find('.popup__close-btn').on('click', function () {
                        popupService.close(currentPopup[0]);
                        popupContainer[0].isActive = false;
                        window.setTimeout(function () {
                            popupContainer.hide().empty();
                        }, 500);
                    });
                    
                    currentPopup.find('[data-video-id]').each(function (i, aBtn) {
                        videoPlay.initButton(aBtn);
                    });
                });
            });

            onViewersReady();
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
            if (onViewersReadyExecuted) return;
            onViewersReadyExecuted = true;
            parseSarineInfos();
            generateMobileMenu();
            prepareHeader();
            gaUtils.gaDashboardViewersReady({isMobile: isMobileOrTablet()});
            showDashboard();
        }   

        function showDashboard() {
            dashboard.style.opacity = 1;
        }

        function prepareHeader() {
            var $elements = $('.unit');
            $elements.each(function(index, element) {
                var $el = $(element);
                if (!$el.is(':visible')) {
                    $el.remove();
                }
            });
        };
        
        function parseSarineInfos() {
            var attrNames = {
                    sarineInfo: 'data-sarine-info',
                    defaultVal: 'data-default-value'
                };
            
            $('[' + attrNames.sarineInfo + ']').each(function () {
                var $el = $(this),
                    field = $el.attr(attrNames.sarineInfo),
                    value = tplUtils.recurse(stone, field.split('.'));

                if (value === (void 0) || value === null || value === "") {
                    if ($el.attr(attrNames.defaultVal)) {
                        value = $el.attr(attrNames.defaultVal);
                        devLog('Field "%s" not found. Using default value: "%s"', field, value);
                    } else {
                        $el.parent().hide();
                        devLog('Field "%s" not found. Hiding element.', field);
                    }
                } else if (field === 'stoneProperties.carat') {
                    if (parseFloat(value) > 0) {
                        value = parseFloat(value).toFixed(3);
                    } else {
                        $el.parent().hide();
                    }  
                } 

                devLog('parseSarineInfos - field: %s, value: %s', field, value);
                
                if (value) {
                    $el.html(value);
                }
            });
        }
        
        function generateMobileMenu() {
            var dynamicMobileMenu = [],
                menuUrlBase = '',
                mobileMenu = $('.menu-container'),
                mobileMenuBtn = $('.menu-btn');
            
            // generate Mobile Menu
            iterateConfigPages(function (page) {
                var pageCode = getPageCode(page),
                    $slide;
                if (page.skip) return;
                
                $slide = $('.slide--' + pageCode).attr('name', pageCode);

                dynamicMobileMenu.push({title: $slide.find('.title').text(), target: pageCode});
            });

            dynamicMobileMenu.push({title: 'Contact Us', target: 'contactus'});

            menuUrlBase = window.location.origin + window.location.pathname + window.location.search;

            dynamicMobileMenu.forEach(function (anItem) {
                $('<a href="' + menuUrlBase + '#' + anItem.target + '">' + anItem.title + '</a>')
                        .appendTo(mobileMenu)
                        .on('click', function () {
                            mobileMenu.add(mobileMenuBtn).removeClass('active');

                            gaUtils.goToPageNavigationMenu(anItem.title);
                        });
            });
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
                    sliderPagesContainer: $(slidesContainerSelector),
                    tmpSlidesContainer: $('<div/>'),
                    mobileMenu: $('.menu-container'),
                    mobileMenuBtn: $('.menu-btn'),
                    shareBtn: $('.share-btn'),
                    shareMenuContainer: $('.share-container'),
                    dashboard: $('.dashboard')
                };

            elements.tmpSlidesContainer.append(elements.sliderPagesContainer.find('> .slide'));

            // Enable slides
            iterateConfigPages(function (page) {
                var slide,
                    pageCode = getPageCode(page),
                    templateVersion = page.templateVersion || '',
                    viewerDiv;

                if (page.skip) return;

                if (pageCode === 'light') {
                    if (!templateVersion) templateVersion = 1;
                    pageCode += templateVersion;
                }

                slide = elements.tmpSlidesContainer.find('> .slide.slide--' + pageCode);

                if (!slide) return;

                viewerDiv = slide.find('.' + page.atom);  
                if (page.order) {
                    viewerDiv.attr('order', page.order);
                }
                if (page.version) {
                    viewerDiv.attr('version', page.version);
                }

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

                slide.attr('data-slidename', pageCode)
                    .appendTo(elements.sliderPagesContainer);
            });

            elements.tmpSlidesContainer.remove();

            addPopups();

            elements.sliderPagesContainer.addClass('show');

            elements.shareBtn.on('click', function () {
                if(elements.shareMenuContainer.is(":visible")) {
                    gaUtils.shareContainerAction('open');
                } else {
                    gaUtils.shareContainerAction('close');
                }
            });

            // usability Mobile Menu
            elements.mobileMenuBtn.on('click', function () {
                elements.shareBtn.removeClass('active');
                elements.shareMenuContainer.removeClass('active');

                if(elements.mobileMenu.is(":visible")) {
                    gaUtils.navigationMenuAction('close');
                } else {
                    gaUtils.navigationMenuAction('open');
                }

                $(this).toggleClass('active');
                elements.mobileMenu.toggleClass('active');
            });
           
            $('.popup-wrap button').attr('tabindex', '-1');

            function addPopups() {
                var attrName = 'data-popup-id',
                    popupsContainer = $('.popups-container');

                $('[' + attrName + ']').each(function (index, element) {
                    var attrValue = $(element).attr(attrName),
                        popup = popupsContainer.find('#' + attrValue);

                    popup.appendTo(elements.dashboard);
                });

                popupsContainer.remove();
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

        function getPageCode(page){
            if (page.page) return pageCodes[page.atom + '_' + page.page]; 
          
            return pageCodes[page.atom];
        }

        function getNavigationTitle(page) {
            var key = "navigation."+ getPageCode(page) + ".title";
            return dynamicText[key];
        }
        
        function getResourceUrl(resourceObj) {
            var mapKey = window.location.origin.indexOf('localhost') === -1 ? 'dist' : 'dev';
            return resourceObj[mapKey] + window.cacheVersion;;
        }

        function getExperiencesPages(config) {
            var arr = [],
                res = [];

            arr = config && config.experiences;

            if (!arr) return;

            return arr.filter(function(element){
                return !(element.type && element.type === 'thumbnail');
            });
        }

        function hasExperiencesPage(pageAtomName) {
            var arr = wData && wData.experiencesPages;
            
            if (!arr || !arr.length) return false;

            return arr.some(function(experience){
                return experience.atom === pageAtomName;
            });
        }

        function isMobileOrTablet() {
            var res = false;
            (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))res = true})(navigator.userAgent||navigator.vendor||window.opera);
            return res;
        }
    } 
    
})(window, window.document, window.jQuery, window.FastClick, window.classie, window.PopupService, window.videoPlay, window.jss, window.tplUtils, window.gaUtils);
