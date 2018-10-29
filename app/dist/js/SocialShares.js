(function (window, document, $) {


    var socialShares = {
        overrideAddThisShareProperties: overrideAddThisShareProperties
    };
    function overrideAddThisShareProperties(){

        if(window.addthis_share!=undefined && window.addthis_share != null) {


            var socialMediaTitleOverride = window.socialMediaTitleOverride;
            var socialMediaImageOverRide = window.socialMediaImageOverRide;

            if (socialMediaImageOverRide != undefined && socialMediaImageOverRide != null && socialMediaImageOverRide !== '') {

                window.addthis_share.media = socialMediaImageOverRide;
            }
            if (socialMediaTitleOverride != undefined && socialMediaTitleOverride != null && socialMediaTitleOverride !== '') {

                window.addthis_share.title = socialMediaTitleOverride;
            }
        }
    }

    window.socialShares = socialShares;
    $(function () {
        'use strict';
        
        var buttons = $('.share-container > span'),
            stone = window.stones && window.stones[0],
            config = {
                sarineId: report ? report.friendlyName : stone.friendlyName,
                slogan: 'Check out this beautiful Diamond',
                shareTitle: null,
                shareBody: null,
                shareUrl: null,
                shareImg: 'http://d3n02ovm6tlpii.cloudfront.net/content/viewers/shell/v1/images/Diamond-Imaging.jpg',
                customData: null
            };
        
        if (!buttons.length) return;
        
        setDefaultFields();

        // Add og:... meta tags to head
        [
            {propName: 'image', value: config.shareImg},
            {propName: 'type',  value: 'website'},
            {propName: 'title', value: 'Sarine ID ' + config.sarineId},
            {propName: 'url',   value: ''}
        ].forEach(function (anItem) {
            $('head').append($('<meta/>', {
                property: 'og:' + anItem.propName,
                content: anItem.value
            }));
        });

        $('#idValue').text(config.sarineId);
        
        setButtonsAttrs();
        startShareThisApp();

        function setDefaultFields() {
            config.shareTitle = config.slogan;
            config.shareBody = config.shareTitle + ' - Sarine ID ' + config.sarineId;
            config.shareUrl = 'http://srn.co/v?' + config.sarineId,
            config.customData = {
                twitter: {
                    title: config.shareBody
                },
                facebook: {
                    title: 'Sarine ID ' + config.sarineId,
                    body: config.slogan + ' <br />\n' + config.shareUrl
                },
                pinterest: {
                    // defaults
                },
                email: {
                    body: config.shareBody + ' <br />\n' + config.shareUrl
                }
            };
        }

        function iterateButtons(iterator) {
            if (typeof iterator !== 'function') return;

            buttons.each(function(i, aButtonWrap) {
                var configData;

                try {
                    configData = config.customData[$(aButtonWrap).attr('data-service')];
                } catch(e) {
                    configData = {};
                }

                iterator(aButtonWrap, configData);
            });
        }

        function setButtonsAttrs() {
            iterateButtons(function(aButtonWrap, localConfig) {
                $(aButtonWrap).attr('st_url', localConfig.url || config.shareUrl);
                $(aButtonWrap).attr('st_title', localConfig.title || config.shareTitle);
                $(aButtonWrap).attr('st_image', localConfig.img || config.shareImg);
                $(aButtonWrap).attr('st_summary', localConfig.body || config.shareBody);
            });
        }

        function getQueryVariable(varName) {
            var vars = window.location.search.substring(1).split('&');
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=');
                if (decodeURIComponent(pair[0]) === varName) {
                    return decodeURIComponent(pair[1]);
                }
            }
            console.log('Query variable %s not found', varName);
        }

        function startShareThisApp() {
            window.switchTo5x = true;
            $.getScript('https://ws.sharethis.com/button/buttons.js')
                    .done(function() {
                        try {
                            window.stLight.options({
                                publisher: "0a5ca2be-5980-4cf7-9df9-49074a984130",
                                doNotHash: true,
                                doNotCopy: false,
                                hashAddressBar: false,
                                shorten: false,
                                onhover: false
                            });
                        } catch (e) {
                            console.log(e);
                        }
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                    });
        }


        // show/hide social block for mobile devices
        try {
            document.querySelector('.share-btn').onclick = function() {
                $('.menu-btn').removeClass('active');
                $('.menu-container').removeClass('active');
                $(this).toggleClass('active');
                $('.share-container').toggleClass('active');
            };
        } catch (e) {}
    });
})(window, window.document, window.jQuery);
