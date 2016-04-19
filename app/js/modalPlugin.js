(function (window, document, $) {
  'use strict';

  // constructor
  function ModalPlugin () {

    this.closeButton = null;
    this.modal = null;
    this.overlay = null;

    // Determine proper event prefix
    this.transitionEnd = transitionSelect();

    //options defaults 
    var defaults = {
      content: "TestTestTestTest",
      autoOpen: false,
      className: 'modal-fade',
      closeButton: true,
      maxWidth: 496,
      minWidth: 295,
      overlay: true,
      slider: null, 
      dataTarget: 0 
    }

    // Create options by extending defaults with the passed in arugments
    if (arguments[0] && typeof arguments[0] === "object") {
      this.options = extendDefaults(defaults, arguments[0]);
    }

    if(this.options.autoOpen === true) { this.open(); } 

  };

  ModalPlugin.prototype.open = function() {
    initModal.call(this);
    initEvents.call(this);
    window.getComputedStyle(this.modal).height;
    this.modal.className = this.modal.className +
      (this.modal.offsetHeight > window.innerHeight ?
        " w-modal-open w-modal-anchored" : " w-modal-open");
    this.overlay.className = this.overlay.className + " w-modal-open";
  };

  ModalPlugin.prototype.close = function() {
    var self = this,
        $sliderWrap =  $('.slider-wrap');;
    this.modal.className = this.modal.className.replace(" w-modal-open", "");
    this.overlay.className = this.overlay.className.replace(" w-modal-open", ""),
    
   
    this.modal.addEventListener(this.transitionEnd, function() {

      if (self.options.content === 'thumbnail_widget') {
        $sliderWrap.appendTo('body');
        $sliderWrap.children('.slider').css({'display': 'none'});
        $sliderWrap.css({'display': 'none'});
      } 
      self.modal.parentNode && self.modal.parentNode.removeChild(self.modal);
    });
    this.overlay.addEventListener(this.transitionEnd, function() {
      if(self.overlay.parentNode) self.overlay.parentNode.removeChild(self.overlay);
    });
  };

  function initModal() {
    var content, contentHolder, docFrag, appendContent, $sliderWrap;

    /*
     * If content is an HTML string, append the HTML string. if string is 'thumbnail_widget', append deep clone of widget wrap
     * If content is a domNode, append its content.
     */

    if (typeof this.options.content === 'string') {
      if (this.options.content !== 'thumbnail_widget') {
        content = this.options.content;
      } else {
        content = '';
      } 
    } else {
      content = this.options.content.innerHTML;
    }

    // Create a DocumentFragment to build with
    docFrag = document.createDocumentFragment();

    // Create modal element
    this.modal = document.createElement("div");
    this.modal.className = "w-modal " + this.options.className;
    this.modal.style.minWidth = this.options.minWidth + "px";
    this.modal.style.maxWidth = this.options.maxWidth + "px";

    // If closeButton option is true, add a close button
    if (this.options.closeButton === true) {
      this.closeButton = document.createElement("button");
      this.closeButton.className = "w-modal-close close-button";
      this.closeButton.innerHTML = "&times;";
      this.modal.appendChild(this.closeButton);
    }

    // If overlay is true, add one
    if (this.options.overlay === true) {
      this.overlay = document.createElement("div");
      this.overlay.className = "w-modal-overlay " + this.options.className;
      docFrag.appendChild(this.overlay);
    }

    // Create content area and append to modal
    contentHolder = document.createElement("div");
    contentHolder.className = "w-modal-content";
    contentHolder.innerHTML = content;
    this.modal.appendChild(contentHolder);


    // Append modal to DocumentFragment
    docFrag.appendChild(this.modal);

    // Append DocumentFragment to body
    document.body.appendChild(docFrag);

    // append content if thumbnail widget and goTo dataTarget page
    if (this.options.content === 'thumbnail_widget') {
      $sliderWrap = $('.slider-wrap');
      $sliderWrap.appendTo('.w-modal-content');
      $sliderWrap.children('.slider').css({'display': 'block'});
      $sliderWrap.css({'display': 'block'});
      if (this.options.slider && this.options.dataTarget >= 0) {
        this.options.slider.goTo(this.options.dataTarget);
      }
    } 
  };

  function extendDefaults(source, properties) {
    var property;
    for (property in properties) {
      if (properties.hasOwnProperty(property)) {
        source[property] = properties[property];
      }
    }
    return source;
  };

  function initEvents() {

    if (this.closeButton) {
      this.closeButton.addEventListener('click', this.close.bind(this));
    }

    if (this.overlay) {
      this.overlay.addEventListener('click', this.close.bind(this));
    }

  };

  function transitionSelect() {
    var el = document.createElement("div");
    if (el.style.WebkitTransition) return "webkitTransitionEnd";
    if (el.style.OTransition) return "oTransitionEnd";
    return 'transitionend';
  };

  window.ModalPlugin = ModalPlugin;

})(window, window.document, window.jQuery);