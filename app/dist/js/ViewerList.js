(function (window, document, $, tplUtils) {
    var _logger = {
        log: tplUtils.devLog,
        error: tplUtils.devError,
        warn: tplUtils.devWarn
    };

    var _pageCodes = {
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
        'lightReportViewer_brilliance': 'brilliance',
        'lightReportViewer_sparkle': 'sparkle',
        'lightReportViewer_symmetry': 'symmetry',
        'aboutUs': 'aboutUs'
    };

    function ViewerList(pages) {
        this.pages = pages;
    }

    ViewerList.prototype.getPageCode = _getPageCode;

    ViewerList.prototype.getPageList = function () {
        return this.pages;
    };

    ViewerList.prototype.getPageNames = function () {
        return this.pages.map(function (item) {
            return _getPageCode(item.atom);
        });
    };

    ViewerList.prototype.filter = function () {
        this.pages = this.pages.filter(_isShouldBeAdded);
    };

    ViewerList.prototype.enablePages = function () {
        var tmpContainer = $('<div/>'),
            pagesContainer = $('.slide-wrap');

        tmpContainer.append(pagesContainer.find('[data-anchor]'));

        _iteratePages(enablePage);

        tmpContainer.remove();

        function enablePage(page) {
            var pageCode = _getPageCode(page);
            var slide = tmpContainer.find('[data-anchor=' + pageCode + ']');

            slide.appendTo(pagesContainer);
        }
    };

    function _isShouldBeAdded(page) {
        var pageCode = _getPageCode(page);
        var templateVersion = page.templateVersion || '1';

        if (page.atom == 'youtube' || page.atom == 'aboutUs') {
            return true;
        }

        if (pageCode === 'light') {
            pageCode += templateVersion;
        }

        var currentSlide = $('[data-slidename=' + pageCode + ']'),
            currentViewer = currentSlide.find('.viewer');

        if (!currentSlide || !currentViewer.length) {
            _logger.error('Slide or viewer not found');
            return false;
        }

        var currentViewerName = currentSlide.attr('data-slidename'),
            currentCanvas = currentViewer.find('.no_stone');

        if (currentCanvas.length > 0) {
            _logger.warn('skip slide "%s". Viewer .no_stone class', currentViewerName);
            return false;
        } else if (!document.viewersList[page.atom]) {
            _logger.warn('skip slide "%s". No url in viewerList', currentViewerName);
            return false;
        } else {
            _logger.log("Valid viewer '%s'", currentViewerName);
            return true;
        }
    }

    function _iteratePages(iterator) {
        var i, cpl, pages;

        if (typeof iterator !== 'function') return;

        pages = this.pages;

        cpl = pages.length;

        for (i = 0; i < cpl; i++) {
            iterator(pages[i], i);
        }
    }

    function _getPageCode() {
        if (page.page) return _pageCodes[page.atom + '_' + page.page];

        return _pageCodes[page.atom];
    }

    window.ViewerList = ViewerList;
})(window, window.document, window.jQuery, window.tplUtils);
