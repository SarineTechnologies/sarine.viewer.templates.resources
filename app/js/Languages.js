(function (window, document, $) {
    'use strict';
    
    // Dependency:
    // assets/jquery.selectric.js & css
    // template.resources/js/Cookie.js (included in base's app.bundle.js)

    var _availLangs = window.availableLanguages,
        _toElement = undefined,
        _selected = undefined,
        _curLang = getCookie('lang') || configuration.selectedLanguage || "en-US";

    window.Languages = {
        init: init
    };

    function init (toElement) {
        
        // Set language selector if number ov available languages more than 1
        if (_availLangs &&  Object.keys(_availLangs).length > 1) {
            _toElement = toElement;

            window.tplUtils.loadCSS('/content/viewers/atomic/v1/assets/jquery.selectric/jquery.selectric.css?' + cacheSuperVersion);
            window.tplUtils.loadScript('/content/viewers/atomic/v1/assets/jquery.selectric/jquery.selectric.min.js?' + cacheSuperVersion,
                
                renderSelector,
            
                function () {
                    console.error("Loading failed: jquery.selectric.min.js")
                }
            )
        }
    }

    function renderSelector () {
        
        // Create unique id for <select> tag
        var elId = "lang" + parseInt(Math.random() * 10000); 
        
        // Create <select> with <option>'s
        var select = $("<select />").attr("id", elId);
        for (var i in _availLangs) {    
            $('<option />', {value: i, text: i}).appendTo(select);
        }

        // Append <select> to required DOM element
        $(_toElement).append(select);

        var selector = $('#' + elId);
        $(function() {

            // Set "selectric" and bind to 'change' event
            selector.selectric().on('change', function() {
                _selected = $(this).val();
                getTranslations();
            }); 
               
            // Set current language as selected
            selector.val(_curLang).selectric('refresh');
        });
    }
    
    function getTranslations () {
        // ajax
        var langs = {
            "ru-RU": {
                "displayName": "РУ",
                "order": 1,
                "translation": {
                    "footer.conditions": "РУ-Conditions",
                    "footer.powered": "РУ-Powered by",
                    "logo.center.first.url": "РУ-javascript:void(0)",
                    "logo.center.url": "РУ-javascript:void(0)",
                    "logo.footer.url": "РУ-javascript:void(0)",
                    "logo.left.first.url": "РУ-javascript:void(0)",
                    "logo.left.url": "РУ-javascript:void(0)",
                    "logo.right.first.url": "РУ-javascript:void(0)",
                    "logo.right.url": "РУ-javascript:void(0)",
                    "navigation.aboutUs.title": "РУ-About Us",
                    "navigation.brilliance.title": "РУ-Brilliance",
                    "navigation.cut.title": "РУ-Cut",
                    "navigation.cut3d.title": "РУ-3D Cut",
                    "navigation.externalImage.title": "РУ-AGS ASET",
                    "navigation.fire.title": "РУ-Fire",
                    "navigation.gemPrint.title": "РУ-Gemprint",
                    "navigation.hna.title": "РУ-Hearts & Arrows",
                    "navigation.light.title": "РУ-Light",
                    "navigation.loupe.title": "РУ-Loupe",
                    "navigation.loupe3d.title": "РУ-Loupe 3D",
                    "navigation.loupeInscription.title": "РУ-Inscription",
                    "navigation.report.title": "РУ-Report",
                    "navigation.sparkle.title": "РУ-Sparkle",
                    "navigation.summary.title": "РУ-Summary",
                    "navigation.symmetry.title": "РУ-Light Symmetry",
                    "navigation.youtube.title": "РУ-Learn More",
                    "popup.arrows.body": "РУ-A distinctive circular arrows pattern is apparent from the top view of the diamond’s crown. Created by the play of light as it enters and exits the diamond, the arrows pattern indicates superior optical symmetry and a higher cut grade.",
                    "popup.arrows.title": "РУ-Arrows",
                    "popup.brilliance.body": "РУ-Brilliance is a measure of the intense white light that radiates from the stone. Brilliance is created by the diamond's unique cut, which determines how the light that enters the diamond is reflected back to the viewer.",
                    "popup.brilliance.title": "РУ-Brilliance",
                    "popup.carat.body": "РУ-Carat is the measure of a diamond’s mass or weight. For the past century, the carat unit has been set at a standard 200 milligrams. Diamonds are often measured in increments of 1/4 carat.",
                    "popup.carat.title": "РУ-Carat",
                    "popup.clarity.body": "РУ-Clarity is the measure of a diamond’s inclusions, which occur naturally inside the stone or on the stone's surface. Flawless diamonds are considered the most desirable for their rare perfection.",
                    "popup.clarity.title": "РУ-Clarity",
                    "popup.color.body": "РУ-Color is the measure of a diamond’s natural hue. The grading spectrum ranges from colorless to yellow. Colorless diamonds are rare, and are prized for their natural beauty and value.",
                    "popup.color.title": "РУ-Color",
                    "popup.cut.body": "РУ-Cut is the measure of a diamond’s beauty and craftsmanship. A diamond's cut grade is determined by its geometrical proportions and symmetry, which affect the play of light reflected in the diamond.",
                    "popup.cut.title": "РУ-Cut",
                    "popup.cut3d.body": "РУ-Cut is the measure of a diamond’s beauty and craftsmanship. A diamond's cut grade is determined by its geometrical proportions and symmetry, which affect the play of light reflected in the diamond.",
                    "popup.cut3d.title": "РУ-Cut and Symmentry Grading",
                    "popup.cut_symmery.body": "РУ-Cut grade is determined by the quality of the diamond's craftsmanship. In the hands of the professional cutter, the rough stone is transformed into a polished diamond featuring optimal proportion, symmetry and light refraction. The cut is the diamond's unique signature, reflecting its individual character and beauty.",
                    "popup.cut_symmery.title": "РУ-Cut & Craftsmanship",
                    "popup.cut_symmery3d.body": "РУ-Cut grade is determined by the quality of the diamond's craftsmanship. In the hands of the professional cutter, the rough stone is transformed into a polished diamond featuring optimal proportion, symmetry and light refraction. The cut is the diamond's unique signature, reflecting its individual character and beauty.",
                    "popup.cut_symmery3d.title": "РУ-Cut and Symmentry Grading",
                    "popup.externalImage.body": "РУ-Angular Spectrum Evaluation Tool&reg; (ASET) was developed to demonstrate - in red, green, and blue - how the diamond is performing - in other words, how the diamond is handling and returning light to our eyes.<br>Red indicates the brightest areas of the diamond - areas that attract the brightest light from above.<br>Green also indicates light return; however, from an indirect source which is not as bright.<br>The blue indicates a contrast pattern of dark reflections giving the diamond its personality.",
                    "popup.externalImage.title": "РУ-AGS ASET",
                    "popup.fire.body": "РУ-When light enters and exits the dense structure of the diamond, it refracts, or bends. This refraction radiates vivid flares of rainbow colors that are commonly described as the diamond's 'fire'. Diamonds with intense fire are appreciated for their fascinating play of color and beauty at different angles.",
                    "popup.fire.title": "РУ-Fire",
                    "popup.gemPrint.body": "РУ-GEMPRINT® is the world’s most sophisticated, non-invasive, positive identification technology that records the unique optical ‘fingerprint’ of each diamond. Just like a human fingerprint, every diamond has a unique GEMPRINT®.  Invented in 1976, this patented and proven technology has been used by the FBI and Canadian Government.",
                    "popup.gemPrint.title": "РУ-Gemprint",
                    "popup.hearts.body": "РУ-A distinctive circular hearts pattern is apparent from the bottom view of the diamond’s pavilion. Created by the play of light as it enters and exits the diamond, the hearts pattern indicates superior optical symmetry and a higher cut grade.",
                    "popup.hearts.title": "РУ-Hearts",
                    "popup.inscription.body": "РУ-View your diamond like a professional. In this view your diamond has been magnified similar to how your diamond is graded in a lab. This will allow you to see the fingerprint of the diamond that most people never experience.",
                    "popup.inscription.title": "РУ-ID Inscription",
                    "popup.light.body": "РУ-As light enters and exits a diamond, the rare allure of the unique gemstone is revealed. Light performance is the combined grading of the four light qualities that define the diamond's individual beauty: Brilliance, Sparkle, Fire and Light Symmetry.",
                    "popup.light.title": "РУ-Light Performance Results",
                    "popup.loupe.body": "РУ-The Sarine Loupe provides advanced virtual imaging of the diamond's top view, based on its unique cut and clarity. See an instant, accurate display of the diamond's actual appearance.",
                    "popup.loupe.title": "РУ-Diamond Imaging",
                    "popup.loupe3d.body": "РУ-The Sarine Loupe knits together thousands of individual images to present an accurate, instant picture of the diamond's cut and clarity. Intuitive 3D imaging allows you to explore the diamond at near microscopic level, for a superbly precise viewing experience.",
                    "popup.loupe3d.title": "РУ-Diamond Imaging",
                    "popup.shape.body": "РУ-Lorem ipsum dolor sit amet, id quem democritum per. Doctus indoctum omittantur usu in, te vim elit eripuit. At his case omnis legendos, diam sint suavitate cum an. Ne veri quaestio ius, at illum laoreet lucilius est. Mea tempor facilis alienum ne, etiam honestatis et eam.",
                    "popup.shape.title": "РУ-Shape",
                    "popup.sparkle.body": "РУ-As a diamond moves, the play of light inside the stone creates dramatic, luminous flashes that are ever changing in their beauty. The diamond's sparkle reflects the quality of the cut, a direct result of the skill and craftsmanship of the professional diamond cutter.",
                    "popup.sparkle.title": "РУ-Sparkle",
                    "popup.symmetry.body": "РУ-Light symmetry is determined by the quality of a diamond's cut and the position of inclusions and blemishes, which may occur during the natural formation process. A well-cut diamond features optimal proportions for equal light distribution.",
                    "popup.symmetry.title": "РУ-Symmetry",
                    "slide.aboutUs.facebook.link": "РУ-https://www.facebook.com/sarinetech?_rdr",
                    "slide.aboutUs.img.src": "РУ-slide-about-img.png",
                    "slide.aboutUs.instagram.link": "РУ-https://www.instagram.com/sarine_tech/",
                    "slide.aboutUs.link": "РУ-http://sarine.com",
                    "slide.aboutUs.social": "РУ-Like us fb.com/sarinetech <br>Follow us @sarine_tech <br>www.sarine.com",
                    "slide.aboutUs.subtitle": "РУ-Click the image to contact us",
                    "slide.aboutUs.text": "РУ-To be the world leader in the provision of technological solutions for the diamond and gemstone industries, with innovative and advanced products and services for the benefit of the entire industry, from mine to consumers.",
                    "slide.aboutUs.title": "РУ-About Us",
                    "slide.all.title": "РУ-Diamond Story",
                    "slide.brilliance.grade.title": "РУ-Brilliance Grade",
                    "slide.brilliance.graph.text1": "РУ-Exceptional",
                    "slide.brilliance.graph.text2": "РУ-Very High",
                    "slide.brilliance.graph.text3": "РУ-High",
                    "slide.brilliance.graph.text4": "РУ-Standard",
                    "slide.brilliance.graph.text5": "РУ-Low",
                    "slide.brilliance.title": "РУ-Brilliance Result",
                    "slide.certificate": "РУ-Certificate #",
                    "slide.cut.body": "РУ-View the diamond’s gemological measurements and angles to assess its proportions.",
                    "slide.cut.subtitle1": "РУ-Actual Proportions Diagram",
                    "slide.cut.title": "РУ-Cut & Craftsmanship",
                    "slide.cut3d.title": "РУ-Cut and Symmentry Grading",
                    "slide.externalImage.body": "РУ-AGSL Computer generated light performance map for this diamond.<br>U.S Patent No: 7.355.683",
                    "slide.externalImage.footer": "РУ-<span class=text-footer-top>Diamond beauty is all about light, which is why every Masterpiece™ diamond is tested to ensure that it exhibits the highest level of light performance. All Masterpiece™ diamonds must score an AGS Ideal® for light performance.</span> <br> <br> <span class=text-footer-bottom>ASET® Image 2016 AGS and AGSL have provided this ASET® image solely for use by Helzberg Diamonds® as part of their Masterpiece™ collection and is not affiliated with Sarine™ in any way.</span>",
                    "slide.externalImage.subtitle": "РУ-AGS™ Light Performance",
                    "slide.externalImage.title": "РУ-AGS Report",
                    "slide.fire.grade.title": "РУ-Fire Grade",
                    "slide.fire.graph.text1": "РУ-Exceptional",
                    "slide.fire.graph.text2": "РУ-Very High",
                    "slide.fire.graph.text3": "РУ-High",
                    "slide.fire.graph.text4": "РУ-Standard",
                    "slide.fire.graph.text5": "РУ-Low",
                    "slide.fire.title": "РУ-Fire Result",
                    "slide.gemPrint.text": "РУ-Click the image to view the report",
                    "slide.gemPrint.title": "РУ-Gemprint ID:",
                    "slide.gradedBy": "РУ-Graded By:",
                    "slide.hna.body": "РУ-Hearts & Arrows is a symmetrical optical pattern that is visible in brilliant diamonds cuts to the highest quality and precision.",
                    "slide.hna.subtitle1": "РУ-Hearts",
                    "slide.hna.subtitle2": "РУ-Arrows",
                    "slide.hna.title": "РУ-Hearts & Arrows",
                    "slide.inscription.title": "РУ-ID Inscription",
                    "slide.light.horizontal.specs.title": "РУ-Light Analysis",
                    "slide.light.horizontal.text1": "РУ-brilliance",
                    "slide.light.horizontal.text2": "РУ-fire",
                    "slide.light.horizontal.text3": "РУ-scintillation",
                    "slide.light.horizontal.text4": "РУ-Fair",
                    "slide.light.horizontal.text5": "РУ-Good",
                    "slide.light.horizontal.text6": "РУ-Very Good",
                    "slide.light.horizontal.text7": "РУ-Excellent",
                    "slide.light.issueDate.title": "РУ-Issue Date:",
                    "slide.light.reportId.title": "РУ-Report ID:",
                    "slide.light.text1": "РУ-Total Grade",
                    "slide.light.text10": "РУ-Symmetry",
                    "slide.light.text2": "РУ-Exceptional",
                    "slide.light.text3": "РУ-Very High",
                    "slide.light.text4": "РУ-High",
                    "slide.light.text5": "РУ-Standard",
                    "slide.light.text6": "РУ-Minimum",
                    "slide.light.text7": "РУ-Brilliance",
                    "slide.light.text8": "РУ-Sparkle",
                    "slide.light.text9": "РУ-Fire",
                    "slide.light.title": "РУ-Light Performance Results",
                    "slide.light.title1": "РУ-Light Analysis",
                    "slide.loupe.body": "РУ-Get to know the diamond as if you were holding it in your hand. View the diamond in precise virtual detail, and discover if it is the perfect choice for you.",
                    "slide.loupe.title": "РУ-Diamond Imaging",
                    "slide.loupe3d.title": "РУ-Diamond Imaging",
                    "slide.report.text": "РУ-Click the image to view the report",
                    "slide.report.title": "РУ-diamond report",
                    "slide.reportId": "РУ-Report ID:",
                    "slide.sparkle.grade.title": "РУ-Sparkle Grade",
                    "slide.sparkle.graph.text1": "РУ-Exceptional",
                    "slide.sparkle.graph.text2": "РУ-Very High",
                    "slide.sparkle.graph.text3": "РУ-High",
                    "slide.sparkle.graph.text4": "РУ-Standard",
                    "slide.sparkle.graph.text5": "РУ-Low",
                    "slide.sparkle.title": "РУ-Sparkle Result",
                    "slide.summary.comment.title": "РУ-Comment",
                    "slide.summary.depth.title": "РУ-Depth",
                    "slide.summary.dimensions.title": "РУ-Dimensions",
                    "slide.summary.fluorescence.title": "РУ-Fluorescence",
                    "slide.summary.fluorescenceColor.title": "РУ-Fluorescence Color",
                    "slide.summary.gradedBy": "РУ-Graded by ",
                    "slide.summary.height.title": "РУ-Height",
                    "slide.summary.lotId.title": "РУ-Lot ID",
                    "slide.summary.partyInformation": "РУ-Information provided by 3<sup>rd</sup> party",
                    "slide.summary.polish.title": "РУ-Polish",
                    "slide.summary.shape": "РУ-Shape",
                    "slide.summary.stockId.title": "РУ-Stock ID",
                    "slide.summary.symmetry.title": "РУ-Symmetry",
                    "slide.summary.text1": "РУ-Sarine ID",
                    "slide.summary.text2": "РУ-Color",
                    "slide.summary.text3": "РУ-Clarity",
                    "slide.summary.text4": "РУ-Cut",
                    "slide.summary.text5": "РУ-Carat",
                    "slide.summary.text6": "РУ-GIA",
                    "slide.summary.title": "РУ-Explore This Diamond Story",
                    "slide.summary.width.title": "РУ-Width",
                    "slide.symmetry.grade.title": "РУ-Light Symmetry Grade",
                    "slide.symmetry.graph.text1": "РУ-Exceptional",
                    "slide.symmetry.graph.text2": "РУ-Very High",
                    "slide.symmetry.graph.text3": "РУ-High",
                    "slide.symmetry.graph.text4": "РУ-Standard",
                    "slide.symmetry.graph.text5": "РУ-Low",
                    "slide.symmetry.title": "РУ-Light Symmetry Result",
                    "slide.youtube.src": "РУ-https://www.youtube.com/embed/9kxxNft130Y?loop=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1&amp;playlist=9kxxNft130Y"
                }
            },
            "en-US": {
                "displayName": "EN",
                "order": 1,
                "translation": {
                    "footer.conditions": "EN-Conditions",
                    "footer.powered": "EN-Powered by",
                    "logo.center.first.url": "EN-javascript:void(0)",
                    "logo.center.url": "EN-javascript:void(0)",
                    "logo.footer.url": "EN-javascript:void(0)",
                    "logo.left.first.url": "EN-javascript:void(0)",
                    "logo.left.url": "EN-javascript:void(0)",
                    "logo.right.first.url": "EN-javascript:void(0)",
                    "logo.right.url": "EN-javascript:void(0)",
                    "navigation.aboutUs.title": "EN-About Us",
                    "navigation.brilliance.title": "EN-Brilliance",
                    "navigation.cut.title": "EN-Cut",
                    "navigation.cut3d.title": "EN-3D Cut",
                    "navigation.externalImage.title": "EN-AGS ASET",
                    "navigation.fire.title": "EN-Fire",
                    "navigation.gemPrint.title": "EN-Gemprint",
                    "navigation.hna.title": "EN-Hearts & Arrows",
                    "navigation.light.title": "EN-Light",
                    "navigation.loupe.title": "EN-Loupe",
                    "navigation.loupe3d.title": "EN-Loupe 3D",
                    "navigation.loupeInscription.title": "EN-Inscription",
                    "navigation.report.title": "EN-Report",
                    "navigation.sparkle.title": "EN-Sparkle",
                    "navigation.summary.title": "EN-Summary",
                    "navigation.symmetry.title": "EN-Light Symmetry",
                    "navigation.youtube.title": "EN-Learn More",
                    "popup.arrows.body": "EN-A distinctive circular arrows pattern is apparent from the top view of the diamond’s crown. Created by the play of light as it enters and exits the diamond, the arrows pattern indicates superior optical symmetry and a higher cut grade.",
                    "popup.arrows.title": "EN-Arrows",
                    "popup.brilliance.body": "EN-Brilliance is a measure of the intense white light that radiates from the stone. Brilliance is created by the diamond's unique cut, which determines how the light that enters the diamond is reflected back to the viewer.",
                    "popup.brilliance.title": "EN-Brilliance",
                    "popup.carat.body": "EN-Carat is the measure of a diamond’s mass or weight. For the past century, the carat unit has been set at a standard 200 milligrams. Diamonds are often measured in increments of 1/4 carat.",
                    "popup.carat.title": "EN-Carat",
                    "popup.clarity.body": "EN-Clarity is the measure of a diamond’s inclusions, which occur naturally inside the stone or on the stone's surface. Flawless diamonds are considered the most desirable for their rare perfection.",
                    "popup.clarity.title": "EN-Clarity",
                    "popup.color.body": "EN-Color is the measure of a diamond’s natural hue. The grading spectrum ranges from colorless to yellow. Colorless diamonds are rare, and are prized for their natural beauty and value.",
                    "popup.color.title": "EN-Color",
                    "popup.cut.body": "EN-Cut is the measure of a diamond’s beauty and craftsmanship. A diamond's cut grade is determined by its geometrical proportions and symmetry, which affect the play of light reflected in the diamond.",
                    "popup.cut.title": "EN-Cut",
                    "popup.cut3d.body": "EN-Cut is the measure of a diamond’s beauty and craftsmanship. A diamond's cut grade is determined by its geometrical proportions and symmetry, which affect the play of light reflected in the diamond.",
                    "popup.cut3d.title": "EN-Cut and Symmentry Grading",
                    "popup.cut_symmery.body": "EN-Cut grade is determined by the quality of the diamond's craftsmanship. In the hands of the professional cutter, the rough stone is transformed into a polished diamond featuring optimal proportion, symmetry and light refraction. The cut is the diamond's unique signature, reflecting its individual character and beauty.",
                    "popup.cut_symmery.title": "EN-Cut & Craftsmanship",
                    "popup.cut_symmery3d.body": "EN-Cut grade is determined by the quality of the diamond's craftsmanship. In the hands of the professional cutter, the rough stone is transformed into a polished diamond featuring optimal proportion, symmetry and light refraction. The cut is the diamond's unique signature, reflecting its individual character and beauty.",
                    "popup.cut_symmery3d.title": "EN-Cut and Symmentry Grading",
                    "popup.externalImage.body": "EN-Angular Spectrum Evaluation Tool&reg; (ASET) was developed to demonstrate - in red, green, and blue - how the diamond is performing - in other words, how the diamond is handling and returning light to our eyes.<br>Red indicates the brightest areas of the diamond - areas that attract the brightest light from above.<br>Green also indicates light return; however, from an indirect source which is not as bright.<br>The blue indicates a contrast pattern of dark reflections giving the diamond its personality.",
                    "popup.externalImage.title": "EN-AGS ASET",
                    "popup.fire.body": "EN-When light enters and exits the dense structure of the diamond, it refracts, or bends. This refraction radiates vivid flares of rainbow colors that are commonly described as the diamond's 'fire'. Diamonds with intense fire are appreciated for their fascinating play of color and beauty at different angles.",
                    "popup.fire.title": "EN-Fire",
                    "popup.gemPrint.body": "EN-GEMPRINT® is the world’s most sophisticated, non-invasive, positive identification technology that records the unique optical ‘fingerprint’ of each diamond. Just like a human fingerprint, every diamond has a unique GEMPRINT®.  Invented in 1976, this patented and proven technology has been used by the FBI and Canadian Government.",
                    "popup.gemPrint.title": "EN-Gemprint",
                    "popup.hearts.body": "EN-A distinctive circular hearts pattern is apparent from the bottom view of the diamond’s pavilion. Created by the play of light as it enters and exits the diamond, the hearts pattern indicates superior optical symmetry and a higher cut grade.",
                    "popup.hearts.title": "EN-Hearts",
                    "popup.inscription.body": "EN-View your diamond like a professional. In this view your diamond has been magnified similar to how your diamond is graded in a lab. This will allow you to see the fingerprint of the diamond that most people never experience.",
                    "popup.inscription.title": "EN-ID Inscription",
                    "popup.light.body": "EN-As light enters and exits a diamond, the rare allure of the unique gemstone is revealed. Light performance is the combined grading of the four light qualities that define the diamond's individual beauty: Brilliance, Sparkle, Fire and Light Symmetry.",
                    "popup.light.title": "EN-Light Performance Results",
                    "popup.loupe.body": "EN-The Sarine Loupe provides advanced virtual imaging of the diamond's top view, based on its unique cut and clarity. See an instant, accurate display of the diamond's actual appearance.",
                    "popup.loupe.title": "EN-Diamond Imaging",
                    "popup.loupe3d.body": "EN-The Sarine Loupe knits together thousands of individual images to present an accurate, instant picture of the diamond's cut and clarity. Intuitive 3D imaging allows you to explore the diamond at near microscopic level, for a superbly precise viewing experience.",
                    "popup.loupe3d.title": "EN-Diamond Imaging",
                    "popup.shape.body": "EN-Lorem ipsum dolor sit amet, id quem democritum per. Doctus indoctum omittantur usu in, te vim elit eripuit. At his case omnis legendos, diam sint suavitate cum an. Ne veri quaestio ius, at illum laoreet lucilius est. Mea tempor facilis alienum ne, etiam honestatis et eam.",
                    "popup.shape.title": "EN-Shape",
                    "popup.sparkle.body": "EN-As a diamond moves, the play of light inside the stone creates dramatic, luminous flashes that are ever changing in their beauty. The diamond's sparkle reflects the quality of the cut, a direct result of the skill and craftsmanship of the professional diamond cutter.",
                    "popup.sparkle.title": "EN-Sparkle",
                    "popup.symmetry.body": "EN-Light symmetry is determined by the quality of a diamond's cut and the position of inclusions and blemishes, which may occur during the natural formation process. A well-cut diamond features optimal proportions for equal light distribution.",
                    "popup.symmetry.title": "EN-Symmetry",
                    "slide.aboutUs.facebook.link": "EN-https://www.facebook.com/sarinetech?_rdr",
                    "slide.aboutUs.img.src": "EN-slide-about-img.png",
                    "slide.aboutUs.instagram.link": "EN-https://www.instagram.com/sarine_tech/",
                    "slide.aboutUs.link": "EN-http://sarine.com",
                    "slide.aboutUs.social": "EN-Like us fb.com/sarinetech <br>Follow us @sarine_tech <br>www.sarine.com",
                    "slide.aboutUs.subtitle": "EN-Click the image to contact us",
                    "slide.aboutUs.text": "EN-To be the world leader in the provision of technological solutions for the diamond and gemstone industries, with innovative and advanced products and services for the benefit of the entire industry, from mine to consumers.",
                    "slide.aboutUs.title": "EN-About Us",
                    "slide.all.title": "EN-Diamond Story",
                    "slide.brilliance.grade.title": "EN-Brilliance Grade",
                    "slide.brilliance.graph.text1": "EN-Exceptional",
                    "slide.brilliance.graph.text2": "EN-Very High",
                    "slide.brilliance.graph.text3": "EN-High",
                    "slide.brilliance.graph.text4": "EN-Standard",
                    "slide.brilliance.graph.text5": "EN-Low",
                    "slide.brilliance.title": "EN-Brilliance Result",
                    "slide.certificate": "EN-Certificate #",
                    "slide.cut.body": "EN-View the diamond’s gemological measurements and angles to assess its proportions.",
                    "slide.cut.subtitle1": "EN-Actual Proportions Diagram",
                    "slide.cut.title": "EN-Cut & Craftsmanship",
                    "slide.cut3d.title": "EN-Cut and Symmentry Grading",
                    "slide.externalImage.body": "EN-AGSL Computer generated light performance map for this diamond.<br>U.S Patent No: 7.355.683",
                    "slide.externalImage.footer": "EN-<span class=text-footer-top>Diamond beauty is all about light, which is why every Masterpiece™ diamond is tested to ensure that it exhibits the highest level of light performance. All Masterpiece™ diamonds must score an AGS Ideal® for light performance.</span> <br> <br> <span class=text-footer-bottom>ASET® Image 2016 AGS and AGSL have provided this ASET® image solely for use by Helzberg Diamonds® as part of their Masterpiece™ collection and is not affiliated with Sarine™ in any way.</span>",
                    "slide.externalImage.subtitle": "EN-AGS™ Light Performance",
                    "slide.externalImage.title": "EN-AGS Report",
                    "slide.fire.grade.title": "EN-Fire Grade",
                    "slide.fire.graph.text1": "EN-Exceptional",
                    "slide.fire.graph.text2": "EN-Very High",
                    "slide.fire.graph.text3": "EN-High",
                    "slide.fire.graph.text4": "EN-Standard",
                    "slide.fire.graph.text5": "EN-Low",
                    "slide.fire.title": "EN-Fire Result",
                    "slide.gemPrint.text": "EN-Click the image to view the report",
                    "slide.gemPrint.title": "EN-Gemprint ID:",
                    "slide.gradedBy": "EN-Graded By:",
                    "slide.hna.body": "EN-Hearts & Arrows is a symmetrical optical pattern that is visible in brilliant diamonds cuts to the highest quality and precision.",
                    "slide.hna.subtitle1": "EN-Hearts",
                    "slide.hna.subtitle2": "EN-Arrows",
                    "slide.hna.title": "EN-Hearts & Arrows",
                    "slide.inscription.title": "EN-ID Inscription",
                    "slide.light.horizontal.specs.title": "EN-Light Analysis",
                    "slide.light.horizontal.text1": "EN-brilliance",
                    "slide.light.horizontal.text2": "EN-fire",
                    "slide.light.horizontal.text3": "EN-scintillation",
                    "slide.light.horizontal.text4": "EN-Fair",
                    "slide.light.horizontal.text5": "EN-Good",
                    "slide.light.horizontal.text6": "EN-Very Good",
                    "slide.light.horizontal.text7": "EN-Excellent",
                    "slide.light.issueDate.title": "EN-Issue Date:",
                    "slide.light.reportId.title": "EN-Report ID:",
                    "slide.light.text1": "EN-Total Grade",
                    "slide.light.text10": "EN-Symmetry",
                    "slide.light.text2": "EN-Exceptional",
                    "slide.light.text3": "EN-Very High",
                    "slide.light.text4": "EN-High",
                    "slide.light.text5": "EN-Standard",
                    "slide.light.text6": "EN-Minimum",
                    "slide.light.text7": "EN-Brilliance",
                    "slide.light.text8": "EN-Sparkle",
                    "slide.light.text9": "EN-Fire",
                    "slide.light.title": "EN-Light Performance Results",
                    "slide.light.title1": "EN-Light Analysis",
                    "slide.loupe.body": "EN-Get to know the diamond as if you were holding it in your hand. View the diamond in precise virtual detail, and discover if it is the perfect choice for you.",
                    "slide.loupe.title": "EN-Diamond Imaging",
                    "slide.loupe3d.title": "EN-Diamond Imaging",
                    "slide.report.text": "EN-Click the image to view the report",
                    "slide.report.title": "EN-diamond report",
                    "slide.reportId": "EN-Report ID:",
                    "slide.sparkle.grade.title": "EN-Sparkle Grade",
                    "slide.sparkle.graph.text1": "EN-Exceptional",
                    "slide.sparkle.graph.text2": "EN-Very High",
                    "slide.sparkle.graph.text3": "EN-High",
                    "slide.sparkle.graph.text4": "EN-Standard",
                    "slide.sparkle.graph.text5": "EN-Low",
                    "slide.sparkle.title": "EN-Sparkle Result",
                    "slide.summary.comment.title": "EN-Comment",
                    "slide.summary.depth.title": "EN-Depth",
                    "slide.summary.dimensions.title": "EN-Dimensions",
                    "slide.summary.fluorescence.title": "EN-Fluorescence",
                    "slide.summary.fluorescenceColor.title": "EN-Fluorescence Color",
                    "slide.summary.gradedBy": "EN-Graded by ",
                    "slide.summary.height.title": "EN-Height",
                    "slide.summary.lotId.title": "EN-Lot ID",
                    "slide.summary.partyInformation": "EN-Information provided by 3<sup>rd</sup> party",
                    "slide.summary.polish.title": "EN-Polish",
                    "slide.summary.shape": "EN-Shape",
                    "slide.summary.stockId.title": "EN-Stock ID",
                    "slide.summary.symmetry.title": "EN-Symmetry",
                    "slide.summary.text1": "EN-Sarine ID",
                    "slide.summary.text2": "EN-Color",
                    "slide.summary.text3": "EN-Clarity",
                    "slide.summary.text4": "EN-Cut",
                    "slide.summary.text5": "EN-Carat",
                    "slide.summary.text6": "EN-GIA",
                    "slide.summary.title": "EN-Explore This Diamond Story",
                    "slide.summary.width.title": "EN-Width",
                    "slide.symmetry.grade.title": "EN-Light Symmetry Grade",
                    "slide.symmetry.graph.text1": "EN-Exceptional",
                    "slide.symmetry.graph.text2": "EN-Very High",
                    "slide.symmetry.graph.text3": "EN-High",
                    "slide.symmetry.graph.text4": "EN-Standard",
                    "slide.symmetry.graph.text5": "EN-Low",
                    "slide.symmetry.title": "EN-Light Symmetry Result",
                    "slide.youtube.src": "EN-https://www.youtube.com/embed/9kxxNft130Y?loop=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1&amp;playlist=9kxxNft130Y"
                }
            }
        };

        translate(langs);
    }

    function translate (langs) {
        // replace text
        var dataTextEls = $.makeArray($("[data-text]")),
            currentEl = "",
            currentDataTextKey = "";

        for (var i in dataTextEls) {
            console.log("XXX", i, dataTextEls[i]);
            currentEl = $($("[data-text]")[i]);
            currentDataTextKey = currentEl.attr("data-text");

            if (langs[_selected].translation[currentDataTextKey]) {
                currentEl.html(langs[_selected].translation[currentDataTextKey]) 
            }
        }
        
    }

})(window, window.document, window.jQuery);