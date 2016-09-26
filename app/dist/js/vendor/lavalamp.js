/*
 * jQuery LavaLamp plugin
 */
;(function($) {
	function LavaLamp(options) {
		this.options = $.extend({
			holder: null,
			activeClass: 'active',
			list: '.view-list',
			item: 'li',
			link: 'a',
			hArrow: '.horizontal-arrow',
			vArrow: '.vertical-arrow',
			position: [
				{
					name: 'top',
					desktop: {
						vCoord: [22, 40],
						vRotate: 90,
						hCoord: [13, 78],
						hRotate: -180
					},
					mobile: {
						vCoord: [50, 31],
						vRotate: 90,
						hCoord: [24, 50],
						hRotate: -180
					}
				},
				{
					name: 'side',
					desktop: {
						vCoord: [48, 40],
						vRotate: 90,
						hCoord: [38, 78],
						hRotate: -180
					},
					mobile: {
						vCoord: [50, 30],
						vRotate: -90,
						hCoord: [74, 50],
						hRotate: 180
					}
				},
				{
					name: 'bottom',
					desktop: {
						vCoord: [73, 40],
						vRotate: 90,
						hCoord: [62, 78],
						hRotate: -180
					},
					mobile: {
						vCoord: [50, 69],
						vRotate: 90,
						hCoord: [24, 50],
						hRotate: 0
					}
				},
				{
					name: 'zoom',
					desktop: {
						vCoord: [98, 40],
						vRotate: 90,
						hCoord: [87, 78],
						hRotate: -180
					},
					mobile: {
						vCoord: [50, 69],
						vRotate: -90,
						hCoord: [74, 50],
						hRotate: 0
					}
				}
			],
			animSpeed: 500
		}, options);

		this.init();
	}
	LavaLamp.prototype = {
		init: function() {
			this.findElements();
			this.makeCallback('onInit', this);
			this.attachEvents();
			this.onWindowResize();
		},
		findElements: function() {
			this.holder = jQuery(this.options.holder);
		
			this.list = this.holder.find(this.options.list);
			this.items = this.list.find(this.options.item);
			this.links = this.list.find(this.options.link);

			this.hArrow = this.holder.find(this.options.hArrow);
			this.vArrow = this.holder.find(this.options.vArrow);

			this.win = jQuery(window);

			this.activeItem = this.items.filter('.' + this.options.activeClass);
			this.currentIndex = this.items.index(this.activeItem);

			if (this.currentIndex < 0) {
				this.currentIndex = 0;
				this.items.eq(this.currentIndex).addClass(this.options.activeClass);
			}
		},
		setState: function(obj) {
			var self = this;
			var curCoord = [];

			ResponsiveHelper.addRange({
				'..849': {
					on: function() {
						curCoord.vCoord = obj.mobile.vCoord;
						curCoord.hCoord = obj.mobile.hCoord;

						curCoord.vRotate = obj.mobile.vRotate;
						curCoord.hRotate = obj.mobile.hRotate;
					}
				},
				'850..': {
					on: function() {
						curCoord.vCoord = obj.desktop.vCoord;
						curCoord.hCoord = obj.desktop.hCoord;

						curCoord.vRotate = obj.desktop.vRotate;
						curCoord.hRotate = obj.desktop.hRotate;
					}
				}
			});

			this.hArrow.css({
				left: curCoord.hCoord[0] + '%',
				top: curCoord.hCoord[1] + '%',
				bottom: 'auto'
			});

			this.vArrow.css({
				left: curCoord.vCoord[0] + '%',
				top: curCoord.vCoord[1] + '%',
				bottom: 'auto'
			});

			this.rotateElement(this.hArrow.children(), curCoord.hRotate);
			this.rotateElement(this.vArrow.children(), curCoord.vRotate);
		},
		attachEvents: function() {
			var self = this;

			this.clickHandler = function(e) {
				e.preventDefault();
				self.currentIndex = self.links.index(e.currentTarget);
				self.activeItem = self.items.eq(self.currentIndex);

				if(!self.activeItem.hasClass(self.options.activeClass)) {
					self.items.removeClass(self.options.activeClass);
					self.activeItem.addClass(self.options.activeClass);

					self.setState(self.options.position[self.currentIndex]);
				}
			};

			this.resizeHandler = function() {
				self.onWindowResize();
			};

			this.links.on('click', this.clickHandler);
			this.win.on('resize orientationchange', this.resizeHandler);
		},
		onWindowResize: function() {
			this.setState(this.options.position[this.currentIndex]);
		},
		rotateElement: function(elem, deg) {
			elem[0].style.webkitTransform = 'rotate(' + deg + 'deg)';
			elem[0].style.mozTransform = 'rotate(' + deg + 'deg)';
			elem[0].style.transform = 'rotate(' + deg + 'deg)';
		},
		makeCallback: function(name) {
			if (typeof this.options[name] === 'function') {
				var args = Array.prototype.slice.call(arguments);
				args.shift();
				this.options[name].apply(this, args);
			}
		}
	};

	$.fn.lavaLamp = function(options) {
		return this.each(function() {
			$(this).data('LavaLamp', new LavaLamp($.extend(options, { holder:this })));
		});
	};
})(jQuery);