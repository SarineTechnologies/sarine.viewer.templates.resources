(function (window, document, $) {
    $(function () {
		$(document).on('loadTemplate', function() {
		    var cert = $('[data-sarine-info="labs.0.certificateSerialNumber"]');
		    if (typeof cert !== 'undefined' && cert !== null && cert.text() === '') {
		        var grade = stones[0] && stones[0].labs[0] && stones[0].labs[0].gradeId;
		        if (typeof grade !== 'undefined' && grade !== null && grade !== '') {
		            cert.text(grade);
		            cert.parent().show();
		        }
		    }
		});
	});
})(window, window.document, window.jQuery);
