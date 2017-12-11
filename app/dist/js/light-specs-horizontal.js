(function (window, document, $) {
    'use strict';

    $(function () {
        var lightGrades =  window.stones && window.stones[0].lightGrades,
            classes = {
                graphBody: 'graph-body',
                gradeNames: 'specs-grade-names',
                mark: 'graph-mark',
                graphLine: 'graph-line',
                specsItem: 'specs-item'
            },
            $graphBody = getEl('graphBody'),
            $gradeNames = getEl('gradeNames');

        if (!lightGrades) return;

        // setValues(lightGrades);
        
        window.setLightValues = setValues;

        function getEl(key, $parent) {
            var selector = '.' + classes[key].replace(' ', '.');
            if ($parent && $parent.length) {
                return $parent.find(selector);
            } else {
                return $(selector);
            }
        }

        function setValues(data) {
            // set text values for each grade-name
            if (!data) return;
            
            getEl('specsItem', $gradeNames).each(function () {
                var $gradeName = $(this),
                    gradeNameText = data[$gradeName.attr('data-key')].name || '';
                $gradeName.text(gradeNameText);
            });
            // set position for each graph-mark 
            getEl('mark', $graphBody).each(function() {
                var $mark = $(this),
                    markLeft = data[$mark.attr('data-key')].percentage  * 100;
                    // console.log(markLeft)
                if (markLeft) {
                    $mark.css({left: markLeft + '%', display: ''});  
                } else {
                    $mark.css({display: 'none'}); 
                    console.log('mark position was not set')
                }
                
            });

        }

    });
})(window, window.document, window.jQuery);
