/**
 * Created by Eran.niv on 23/11/2017.
 */
(function (window, document, $) {

    var colorExperienceHelper = {

        initColorView : initColorView,
        colorArrowsEvent : colorArrowsEvent
    }
    function resetColorByIndex(index){

        if(index ==0  || index == 16 )
            return ;
        $('.owl-carousel').trigger('to.owl.carousel',index-1)
    }
    function resetColorSlider($element){

        var index =  $element.attr('index');

        resetColorByIndex(index);

    }
    function initColorView(){

        var color =  stone.stoneProperties.color;
        var selector = $('.color-container img');//.children('img');
        if(selector.length> 0 ){
            var experience =  configuration.experiences.filter(function (e) {
                return (e.atom === pageCodes.colorExperience);
            });
            if(experience.length>0)
                experience = experience[0];
            var imageWithLetter = experience.ImagePatternLetter || "sprite-with-letters_*.png";
            var filePrefix = imageWithLetter.replace(/\*.[^/.]+$/,'');
            var fileExt    = "."+imageWithLetter.split('.').pop();
            var imageIndex = colorGradeMaps[color];
            var filePath = document.viewersList[pageCodes.colorExperience];
            var imagePath = filePath + filePrefix +imageIndex  + fileExt ;
            selector.attr('src', imagePath);
            selector.attr('index',imageIndex);

            selector.on('click', function(e){ // ' .color-image'

                var $el = $(this);
                resetColorSlider($el);
                e.stopPropagation();

            });
            selector.trigger('click');
        }
    }
    function getCurrentColorIndex(){

        var color = $('.owl-item.active.center').children().children().first()[0].innerText;
        var index = colorGradeMaps[color];
        return index;
    }
    function colorArrowsEvent(){

        var attrName = 'data-name';
        $('.color-nav').on('click', '.unit', function (e) {

            var $el = $(this),
                attrVal = $el.attr(attrName);
            e.stopPropagation();

            switch(attrVal){
                case 'left':
                    resetColorByIndex(getCurrentColorIndex()-1);
                    break;
                case 'right':
                    resetColorByIndex(getCurrentColorIndex()+1);
                    break;
            }
        });
    }



    window.colorExperienceHelper = colorExperienceHelper;
})(window, window.document, window.jQuery);
