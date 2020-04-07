/**
 * navigation.js
 *
 * Handles toggling the navigation menu for small screens.
 */
( function() {
	var container, button, menu;

	container = document.getElementById( 'site-navigation' );
	if ( ! container )
		return;

    button = document.getElementsByClassName( 'menu-toggle' )[0];
	if ( 'undefined' === typeof button )
		return;

	menu = container.getElementsByTagName( 'ul' )[0];

	// Hide menu toggle button if menu is empty and return early.
	if ( 'undefined' === typeof menu ) {
		button.style.display = 'none';
		return;
	}

	if ( -1 === menu.className.indexOf( 'nav-menu' ) )
		menu.className += ' nav-menu';

	button.onclick = function() {
		if ( -1 !== container.className.indexOf( 'toggled' ) )
			container.className = container.className.replace( ' toggled', '' );
		else
			container.className += ' toggled';
	};
} )();
;
( function() {
	var is_webkit = navigator.userAgent.toLowerCase().indexOf( 'webkit' ) > -1,
	    is_opera  = navigator.userAgent.toLowerCase().indexOf( 'opera' )  > -1,
	    is_ie     = navigator.userAgent.toLowerCase().indexOf( 'msie' )   > -1;

	if ( ( is_webkit || is_opera || is_ie ) && document.getElementById && window.addEventListener ) {
		window.addEventListener( 'hashchange', function() {
			var element = document.getElementById( location.hash.substring( 1 ) );

			if ( element ) {
				if ( ! /^(?:a|select|input|button|textarea)$/i.test( element.tagName ) )
					element.tabIndex = -1;

				element.focus();
			}
		}, false );
	}
})();
;
/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.3.11
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */

/* global window, document, define, jQuery, setInterval, clearInterval */

(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

}(function($) {
    'use strict';
    var Slick = window.Slick || {};

    Slick = (function() {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this,
                responsiveSettings, breakpoint;

            _.defaults = {
                accessibility: true,
                adaptiveHeight: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button type="button" data-role="none" class="slick-prev">Previous</button>',
                nextArrow: '<button type="button" data-role="none" class="slick-next">Next</button>',
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function(slider, i) {
                    return '<button type="button" data-role="none">' + (i + 1) + '</button>';
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                fade: false,
                focusOnSelect: false,
                infinite: true,
                lazyLoad: 'ondemand',
                onBeforeChange: null,
                onAfterChange: null,
                onInit: null,
                onReInit: null,
                pauseOnHover: true,
                pauseOnDotsHover: false,
                responsive: null,
                rtl: false,
                slide: 'div',
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 300,
                swipe: true,
                swipeToSlide: false,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                variableWidth: false,
                vertical: false,
                waitForAnimate: true
            };

            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentSlide: 0,
                currentLeft: null,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                $list: null,
                touchObject: {},
                transformsEnabled: false
            };

            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.paused = false;
            _.positionProp = null;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.windowWidth = 0;
            _.windowTimer = null;

            _.options = $.extend({}, _.defaults, settings);

            _.originalSettings = _.options;
            responsiveSettings = _.options.responsive || null;

            if (responsiveSettings && responsiveSettings.length > -1) {
                for (breakpoint in responsiveSettings) {
                    if (responsiveSettings.hasOwnProperty(breakpoint)) {
                        _.breakpoints.push(responsiveSettings[
                            breakpoint].breakpoint);
                        _.breakpointSettings[responsiveSettings[
                            breakpoint].breakpoint] =
                            responsiveSettings[breakpoint].settings;
                    }
                }
                _.breakpoints.sort(function(a, b) {
                    return b - a;
                });
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);

            _.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;

            _.init();

        }

        return Slick;

    }());

    Slick.prototype.addSlide = function(markup, index, addBefore) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || (index >= _.slideCount)) {
            return false;
        }

        _.unload();

        if (typeof(index) === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slides.each(function(index, element) {
            $(element).attr("index",index);
        });

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.animateSlide = function(targetLeft, callback) {

        var animProps = {}, _ = this;

        if(_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.animate({height: targetHeight},_.options.speed);
        }

        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }

        } else {

            if (_.cssTransitions === false) {

                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function(now) {
                        if (_.options.vertical === false) {
                            animProps[_.animType] = 'translate(' +
                                now + 'px, 0px)';
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = 'translate(0px,' +
                                now + 'px)';
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function() {
                        if (callback) {
                            callback.call();
                        }
                    }
                });

            } else {

                _.applyTransition();

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function() {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }

            }

        }

    };

    Slick.prototype.asNavFor = function(index) {
        var _ = this, asNavFor = _.options.asNavFor != null ? $(_.options.asNavFor).getSlick() : null;
        if(asNavFor != null) asNavFor.slideHandler(index, true);
    };

    Slick.prototype.applyTransition = function(slide) {

        var _ = this,
            transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.autoPlay = function() {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

        if (_.slideCount > _.options.slidesToShow && _.paused !== true) {
            _.autoPlayTimer = setInterval(_.autoPlayIterator,
                _.options.autoplaySpeed);
        }

    };

    Slick.prototype.autoPlayClear = function() {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

    };

    Slick.prototype.autoPlayIterator = function() {

        var _ = this;

        if (_.options.infinite === false) {

            if (_.direction === 1) {

                if ((_.currentSlide + 1) === _.slideCount -
                    1) {
                    _.direction = 0;
                }

                _.slideHandler(_.currentSlide + _.options.slidesToScroll);

            } else {

                if ((_.currentSlide - 1 === 0)) {

                    _.direction = 1;

                }

                _.slideHandler(_.currentSlide - _.options.slidesToScroll);

            }

        } else {

            _.slideHandler(_.currentSlide + _.options.slidesToScroll);

        }

    };

    Slick.prototype.buildArrows = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow = $(_.options.prevArrow);
            _.$nextArrow = $(_.options.nextArrow);

            if (_.htmlExpr.test(_.options.prevArrow)) {
                _.$prevArrow.appendTo(_.options.appendArrows);
            }

            if (_.htmlExpr.test(_.options.nextArrow)) {
                _.$nextArrow.appendTo(_.options.appendArrows);
            }

            if (_.options.infinite !== true) {
                _.$prevArrow.addClass('slick-disabled');
            }

        }

    };

    Slick.prototype.buildDots = function() {

        var _ = this,
            i, dotString;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            dotString = '<ul class="' + _.options.dotsClass + '">';

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dotString += '<li>' + _.options.customPaging.call(this, _, i) + '</li>';
            }

            dotString += '</ul>';

            _.$dots = $(dotString).appendTo(
                _.options.appendDots);

            _.$dots.find('li').first().addClass(
                'slick-active');

        }

    };

    Slick.prototype.buildOut = function() {

        var _ = this;

        _.$slides = _.$slider.children(_.options.slide +
            ':not(.slick-cloned)').addClass(
            'slick-slide');
        _.slideCount = _.$slides.length;

        _.$slides.each(function(index, element) {
            $(element).attr("index",index);
        });

        _.$slidesCache = _.$slides;

        _.$slider.addClass('slick-slider');

        _.$slideTrack = (_.slideCount === 0) ?
            $('<div class="slick-track"/>').appendTo(_.$slider) :
            _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap(
            '<div class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true) {
            _.options.slidesToScroll = 1;
            if (_.options.slidesToShow % 2 === 0) {
                _.options.slidesToShow = 3;
            }
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        _.updateDots();

        if (_.options.accessibility === true) {
            _.$list.prop('tabIndex', 0);
        }

        _.setSlideClasses(typeof this.currentSlide === 'number' ? this.currentSlide : 0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }

    };

    Slick.prototype.checkResponsive = function() {

        var _ = this,
            breakpoint, targetBreakpoint;

        if (_.originalSettings.responsive && _.originalSettings
            .responsive.length > -1 && _.originalSettings.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if ($(window).width() < _.breakpoints[
                        breakpoint]) {
                        targetBreakpoint = _.breakpoints[
                            breakpoint];
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint) {
                        _.activeBreakpoint =
                            targetBreakpoint;
                        _.options = $.extend({}, _.options,
                            _.breakpointSettings[
                                targetBreakpoint]);
                        _.refresh();
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    _.options = $.extend({}, _.options,
                        _.breakpointSettings[
                            targetBreakpoint]);
                    _.refresh();
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = $.extend({}, _.options,
                        _.originalSettings);
                    _.refresh();
                }
            }

        }

    };

    Slick.prototype.changeSlide = function(event) {

        var _ = this,
            $target = $(event.target),
            indexOffset, slideOffset, unevenOffset;

        // If target is a link, prevent default action.
        $target.is('a') && event.preventDefault();

        unevenOffset = (_.slideCount % _.options.slidesToScroll !== 0);
        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

        switch (event.data.message) {

            case 'previous':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide  - slideOffset);
                }
                break;

            case 'next':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide + slideOffset);
                }
                break;

            case 'index':
                var index = event.data.index === 0 ? 0 :
                    event.data.index || $(event.target).parent().index() * _.options.slidesToScroll;
                _.slideHandler(index);

            default:
                return false;
        }

    };

    Slick.prototype.destroy = function() {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        $('.slick-cloned', _.$slider).remove();
        if (_.$dots) {
            _.$dots.remove();
        }
        if (_.$prevArrow) {
            _.$prevArrow.remove();
            _.$nextArrow.remove();
        }
        if (_.$slides.parent().hasClass('slick-track')) {
            _.$slides.unwrap().unwrap();
        }
        _.$slides.removeClass(
            'slick-slide slick-active slick-visible').css('width', '');
        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');

        _.$list.off('.slick');
        $(window).off('.slick-' + _.instanceUid);
        $(document).off('.slick-' + _.instanceUid);

    };

    Slick.prototype.disableTransition = function(slide) {

        var _ = this,
            transition = {};

        transition[_.transitionType] = "";

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.fadeSlide = function(oldSlide, slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: 1000
            });

            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);

            _.$slides.eq(oldSlide).animate({
                opacity: 0
            }, _.options.speed, _.options.easing);

        } else {

            _.applyTransition(slideIndex);
            _.applyTransition(oldSlide);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: 1000
            });

            _.$slides.eq(oldSlide).css({
                opacity: 0
            });

            if (callback) {
                setTimeout(function() {

                    _.disableTransition(slideIndex);
                    _.disableTransition(oldSlide);

                    callback.call();
                }, _.options.speed);
            }

        }

    };

    Slick.prototype.filterSlides = function(filter) {

        var _ = this;

        if (filter !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.getCurrent = function() {

        var _ = this;

        return _.currentSlide;

    };

    Slick.prototype.getDotCount = function() {

        var _ = this,
            breaker = 0,
            dotCounter = 0,
            dotCount = 0,
            dotLimit;

        dotLimit = _.options.infinite === true ? _.slideCount + _.options.slidesToShow - _.options.slidesToScroll : _.slideCount;

        while (breaker < dotLimit) {
            dotCount++;
            dotCounter += _.options.slidesToScroll;
            breaker = dotCounter + _.options.slidesToShow;
        }

        return dotCount;

    };

    Slick.prototype.getLeft = function(slideIndex) {

        var _ = this,
            targetLeft,
            verticalHeight,
            verticalOffset = 0,
            slideWidth,
            targetSlide;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight();

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;
                verticalOffset = (verticalHeight * _.options.slidesToShow) * -1;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    _.slideOffset = ((_.slideCount % _.options.slidesToShow) * _.slideWidth) * -1;
                    verticalOffset = ((_.slideCount % _.options.slidesToShow) * verticalHeight) * -1;
                }
            }
        } else {
            if (_.slideCount % _.options.slidesToShow !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    _.slideOffset = (_.options.slidesToShow * _.slideWidth) - ((_.slideCount % _.options.slidesToShow) * _.slideWidth);
                    verticalOffset = ((_.slideCount % _.options.slidesToShow) * verticalHeight);
                }
            }
        }

        if (_.slideCount <= _.options.slidesToShow){
            _.slideOffset = 0;
            verticalOffset = 0;
        }

        if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }

        if (_.options.vertical === false) {
            targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
        } else {
            targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;
        }

        if (_.options.variableWidth === true) {

            if(_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
            } else {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
            }
            targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
            if (_.options.centerMode === true) {
                if(_.options.infinite === false) {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                }
                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
            }
        }

        return targetLeft;

    };

    Slick.prototype.init = function() {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.checkResponsive();
        }

        if (_.options.onInit !== null) {
            _.options.onInit.call(this, _);
        }

    };

    Slick.prototype.initArrowEvents = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.on('click.slick', {
                message: 'previous'
            }, _.changeSlide);
            _.$nextArrow.on('click.slick', {
                message: 'next'
            }, _.changeSlide);
        }

    };

    Slick.prototype.initDotEvents = function() {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.options.autoplay === true) {
            $('li', _.$dots)
                .on('mouseenter.slick', _.autoPlayClear)
                .on('mouseleave.slick', _.autoPlay);
        }

    };

    Slick.prototype.initializeEvents = function() {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start'
        }, _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move'
        }, _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end'
        }, _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end'
        }, _.swipeHandler);

        if (_.options.pauseOnHover === true && _.options.autoplay === true) {
            _.$list.on('mouseenter.slick', _.autoPlayClear);
            _.$list.on('mouseleave.slick', _.autoPlay);
        }

        if(_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }

        if(_.options.focusOnSelect === true) {
            $(_.options.slide, _.$slideTrack).on('click.slick', _.selectHandler);
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, function() {
            _.checkResponsive();
            _.setPosition();
        });

        $(window).on('resize.slick.slick-' + _.instanceUid, function() {
            if ($(window).width() !== _.windowWidth) {
                clearTimeout(_.windowDelay);
                _.windowDelay = window.setTimeout(function() {
                    _.windowWidth = $(window).width();
                    _.checkResponsive();
                    _.setPosition();
                }, 50);
            }
        });

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).on('ready.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.initUI = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();

        }

        if (_.options.autoplay === true) {

            _.autoPlay();

        }

    };

    Slick.prototype.keyHandler = function(event) {

        var _ = this;

        if (event.keyCode === 37) {
            _.changeSlide({
                data: {
                    message: 'previous'
                }
            });
        } else if (event.keyCode === 39) {
            _.changeSlide({
                data: {
                    message: 'next'
                }
            });
        }

    };

    Slick.prototype.lazyLoad = function() {

        var _ = this,
            loadRange, cloneRange, rangeStart, rangeEnd;

        function loadImages(imagesScope) {
            $('img[data-lazy]', imagesScope).each(function() {
                var image = $(this),
                    imageSource = $(this).attr('data-lazy');

                image
                  .load(function() { image.animate({ opacity: 1 }, 200); })
                  .css({ opacity: 0 })
                  .attr('src', imageSource)
                  .removeAttr('data-lazy')
                  .removeClass('slick-loading');
            });
        }

        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow/2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow/2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow/2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = rangeStart + _.options.slidesToShow;
            if (_.options.fade === true ) {
                if(rangeStart > 0) rangeStart--;
                if(rangeEnd <= _.slideCount) rangeEnd++;
            }
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);
        loadImages(loadRange);

          if (_.slideCount <= _.options.slidesToShow){
              cloneRange = _.$slider.find('.slick-slide')
              loadImages(cloneRange)
          }else
        if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
            loadImages(cloneRange)
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
            loadImages(cloneRange);
        }

    };

    Slick.prototype.loadSlider = function() {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1
        });

        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }

    };

    Slick.prototype.postSlide = function(index) {

        var _ = this;

        if (_.options.onAfterChange !== null) {
            _.options.onAfterChange.call(this, _, index);
        }

        _.animating = false;

        _.setPosition();

        _.swipeLeft = null;

        if (_.options.autoplay === true && _.paused === false) {
            _.autoPlay();
        }

    };

    Slick.prototype.progressiveLazyLoad = function() {

        var _ = this,
            imgCount, targetImage;

        imgCount = $('img[data-lazy]').length;

        if (imgCount > 0) {
            targetImage = $('img[data-lazy]', _.$slider).first();
            targetImage.attr('src', targetImage.attr('data-lazy')).removeClass('slick-loading').load(function() {
                targetImage.removeAttr('data-lazy');
                _.progressiveLazyLoad();
            })
         .error(function () {
          targetImage.removeAttr('data-lazy');
          _.progressiveLazyLoad();
         });
        }

    };

    Slick.prototype.refresh = function() {

        var _ = this,
            currentSlide = _.currentSlide;

        _.destroy();

        $.extend(_, _.initials);

        _.currentSlide = currentSlide;
        _.init();

    };

    Slick.prototype.reinit = function() {

        var _ = this;

        _.$slides = _.$slideTrack.children(_.options.slide).addClass(
            'slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        _.setProps();

        _.setupInfinite();

        _.buildArrows();

        _.updateArrows();

        _.initArrowEvents();

        _.buildDots();

        _.updateDots();

        _.initDotEvents();

        if(_.options.focusOnSelect === true) {
            $(_.options.slide, _.$slideTrack).on('click.slick', _.selectHandler);
        }

        _.setSlideClasses(0);

        _.setPosition();

        if (_.options.onReInit !== null) {
            _.options.onReInit.call(this, _);
        }

    };

    Slick.prototype.removeSlide = function(index, removeBefore) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        _.$slideTrack.children(this.options.slide).eq(index).remove();

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.setCSS = function(position) {

        var _ = this,
            positionProps = {}, x, y;

        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == 'left' ? position + 'px' : '0px';
        y = _.positionProp == 'top' ? position + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }

    };

    Slick.prototype.setDimensions = function() {

        var _ = this;

        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: ('0px ' + _.options.centerPadding)
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: (_.options.centerPadding + ' 0px')
                });
            }
        }

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();


        if(_.options.vertical === false && _.options.variableWidth === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil((_.slideWidth * _.$slideTrack.children('.slick-slide').length)));

        } else if (_.options.variableWidth === true) {
            _.slideWidth = 0;
            _.$slideTrack.children('.slick-slide').each(function(){
                _.slideWidth += Math.ceil($(this).outerWidth(true));
            });
            _.$slideTrack.width(Math.ceil(_.slideWidth) + 1);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length)));
        }

        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);

    };

    Slick.prototype.setFade = function() {

        var _ = this,
            targetLeft;

        _.$slides.each(function(index, element) {
            targetLeft = (_.slideWidth * index) * -1;
            $(element).css({
                position: 'relative',
                left: targetLeft,
                top: 0,
                zIndex: 800,
                opacity: 0
            });
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: 900,
            opacity: 1
        });

    };

    Slick.prototype.setHeight = function() {

        var _ = this;

        if(_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.css('height', targetHeight);
        }

    };

    Slick.prototype.setPosition = function() {

        var _ = this;

        _.setDimensions();

        _.setHeight();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

    };

    Slick.prototype.setProps = function() {

        var _ = this,
            bodyStyle = document.body.style;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (bodyStyle.WebkitTransition !== undefined ||
            bodyStyle.MozTransition !== undefined ||
            bodyStyle.msTransition !== undefined) {
            if(_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if (bodyStyle.OTransform !== undefined) {
            _.animType = 'OTransform';
            _.transformType = "-o-transform";
            _.transitionType = 'OTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = "-moz-transform";
            _.transitionType = 'MozTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = "-webkit-transform";
            _.transitionType = 'webkitTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = 'msTransform';
            _.transformType = "-ms-transform";
            _.transitionType = 'msTransition';
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = 'transform';
            _.transformType = "transform";
            _.transitionType = 'transition';
        }
        _.transformsEnabled = (_.animType !== null && _.animType !== false);

    };


    Slick.prototype.setSlideClasses = function(index) {

        var _ = this,
            centerOffset, allSlides, indexOffset, remainder;

        _.$slider.find('.slick-slide').removeClass('slick-active').removeClass('slick-center');
        allSlides = _.$slider.find('.slick-slide');

        if (_.options.centerMode === true) {

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if(_.options.infinite === true) {

                if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {
                    _.$slides.slice(index - centerOffset, index + centerOffset + 1).addClass('slick-active');
                } else {
                    indexOffset = _.options.slidesToShow + index;
                    allSlides.slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2).addClass('slick-active');
                }

                if (index === 0) {
                    allSlides.eq(allSlides.length - 1 - _.options.slidesToShow).addClass('slick-center');
                } else if (index === _.slideCount - 1) {
                    allSlides.eq(_.options.slidesToShow).addClass('slick-center');
                }

            }

            _.$slides.eq(index).addClass('slick-center');

        } else {

            if (index >= 0 && index <= (_.slideCount - _.options.slidesToShow)) {
                _.$slides.slice(index, index + _.options.slidesToShow).addClass('slick-active');
            } else if ( allSlides.length <= _.options.slidesToShow ) {
                allSlides.addClass('slick-active');
            } else {
                remainder = _.slideCount%_.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;
                if(_.options.slidesToShow == _.options.slidesToScroll && (_.slideCount - index) < _.options.slidesToShow) {
                    allSlides.slice(indexOffset-(_.options.slidesToShow-remainder), indexOffset + remainder).addClass('slick-active');
                } else {
                    allSlides.slice(indexOffset, indexOffset + _.options.slidesToShow).addClass('slick-active');
                }
            }

        }

        if (_.options.lazyLoad === 'ondemand') {
            _.lazyLoad();
        }

    };

    Slick.prototype.setupInfinite = function() {

        var _ = this,
            i, slideIndex, infiniteCount;

        if (_.options.fade === true || _.options.vertical === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > (_.slideCount -
                    infiniteCount); i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('index', slideIndex-_.slideCount)
                        .prependTo(_.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('index', slideIndex+_.slideCount)
                        .appendTo(_.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function() {
                    $(this).attr('id', '');
                });

            }

        }

    };

    Slick.prototype.selectHandler = function(event) {

        var _ = this;
        var index = parseInt($(event.target).parents('.slick-slide').attr("index"));
        if(!index) index = 0;

        if(_.slideCount <= _.options.slidesToShow){
            return;
        }
        _.slideHandler(index);

    };

    Slick.prototype.slideHandler = function(index,sync) {

        var targetSlide, animSlide, oldSlide, slideLeft, unevenOffset, targetLeft = null,
            _ = this;

        sync = sync || false;

        if (_.animating === true && _.options.waitForAnimate === true) {
            return false;
        }

        if (sync === false) {
            _.asNavFor(index);
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        unevenOffset = _.slideCount % _.options.slidesToScroll !== 0 ? _.options.slidesToScroll : 0;

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > (_.slideCount - _.options.slidesToShow + unevenOffset))) {
            if(_.options.fade === false) {
                targetSlide = _.currentSlide;
                _.animateSlide(slideLeft, function() {
                    _.postSlide(targetSlide);
                });
            }
            return false;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > (_.slideCount - _.options.slidesToScroll))) {
            if(_.options.fade === false) {
                targetSlide = _.currentSlide;
                _.animateSlide(slideLeft, function() {
                    _.postSlide(targetSlide);
                });
            }
            return false;
        }

        if (_.options.autoplay === true) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
            } else {
                animSlide = _.slideCount + targetSlide;
            }
        } else if (targetSlide >= _.slideCount) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = 0;
            } else {
                animSlide = targetSlide - _.slideCount;
            }
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        if (_.options.onBeforeChange !== null && index !== _.currentSlide) {
            _.options.onBeforeChange.call(this, _, _.currentSlide, animSlide);
        }

        oldSlide = _.currentSlide;
        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            _.fadeSlide(oldSlide,animSlide, function() {
                _.postSlide(animSlide);
            });
            return false;
        }

        _.animateSlide(targetLeft, function() {
            _.postSlide(animSlide);
        });

    };

    Slick.prototype.startLoad = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();

        }

        _.$slider.addClass('slick-loading');

    };

    Slick.prototype.swipeDirection = function() {

        var xDist, yDist, r, swipeAngle, _ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
            return 'left';
        }
        if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
            return 'left';
        }
        if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
            return 'right';
        }

        return 'vertical';

    };

    Slick.prototype.swipeEnd = function(event) {

        var _ = this, slideCount, slidesTraversed, swipeDiff;

        _.dragging = false;

        if (_.touchObject.curX === undefined) {
            return false;
        }

        if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {
            $(event.target).on('click.slick', function(event) {
                event.stopImmediatePropagation();
                event.stopPropagation();
                event.preventDefault();
                $(event.target).off('click.slick');
            });

            if(_.options.swipeToSlide === true) {
                slidesTraversed = Math.round(_.touchObject.swipeLength / _.slideWidth);
                slideCount = slidesTraversed
            } else {
                slideCount = _.options.slidesToScroll;
            }

            switch (_.swipeDirection()) {
                case 'left':
                    _.slideHandler(_.currentSlide + slideCount);
                    _.touchObject = {};
                    break;

                case 'right':
                    _.slideHandler(_.currentSlide - slideCount);
                    _.touchObject = {};
                    break;
            }
        } else {
            if(_.touchObject.startX !== _.touchObject.curX) {
                _.slideHandler(_.currentSlide);
                _.touchObject = {};
            }
        }

    };

    Slick.prototype.swipeHandler = function(event) {

        var _ = this;

        if ((_.options.swipe === false) || ('ontouchend' in document && _.options.swipe === false)) {
           return;
        } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
           return;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
            event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options
            .touchThreshold;

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;

        }

    };

    Slick.prototype.swipeMove = function(event) {

        var _ = this,
            curLeft, swipeDirection, positionOffset, touches;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        curLeft = _.getLeft(_.currentSlide);

        if (!_.dragging || touches && touches.length !== 1) {
            return false;
        }

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        swipeDirection = _.swipeDirection();

        if (swipeDirection === 'vertical') {
            return;
        }

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            event.preventDefault();
        }

        positionOffset = _.touchObject.curX > _.touchObject.startX ? 1 : -1;

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + _.touchObject.swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + (_.touchObject
                .swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);

    };

    Slick.prototype.swipeStart = function(event) {

        var _ = this,
            touches;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.dragging = true;

    };

    Slick.prototype.unfilterSlides = function() {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.unload = function() {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();
        if (_.$dots) {
            _.$dots.remove();
        }
        if (_.$prevArrow) {
            _.$prevArrow.remove();
            _.$nextArrow.remove();
        }
        _.$slides.removeClass(
            'slick-slide slick-active slick-visible').css('width', '');

    };

    Slick.prototype.updateArrows = function() {

        var _ = this;

        if (_.options.arrows === true && _.options.infinite !==
            true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.removeClass('slick-disabled');
            _.$nextArrow.removeClass('slick-disabled');
            if (_.currentSlide === 0) {
                _.$prevArrow.addClass('slick-disabled');
                _.$nextArrow.removeClass('slick-disabled');
            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
                _.$nextArrow.addClass('slick-disabled');
                _.$prevArrow.removeClass('slick-disabled');
            }
        }

    };

    Slick.prototype.updateDots = function() {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots.find('li').removeClass('slick-active');
            _.$dots.find('li').eq(Math.floor(_.currentSlide / _.options.slidesToScroll)).addClass('slick-active');

        }

    };

    $.fn.slick = function(options) {
        var _ = this;
        return _.each(function(index, element) {

            element.slick = new Slick(element, options);

        });
    };

    $.fn.slickAdd = function(slide, slideIndex, addBefore) {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.addSlide(slide, slideIndex, addBefore);

        });
    };

    $.fn.slickCurrentSlide = function() {
        var _ = this;
        return _.get(0).slick.getCurrent();
    };

    $.fn.slickFilter = function(filter) {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.filterSlides(filter);

        });
    };

    $.fn.slickGoTo = function(slide) {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.changeSlide({
                data: {
                    message: 'index',
                    index: parseInt(slide)
                }
            });

        });
    };

    $.fn.slickNext = function() {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.changeSlide({
                data: {
                    message: 'next'
                }
            });

        });
    };

    $.fn.slickPause = function() {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.autoPlayClear();
            element.slick.paused = true;

        });
    };

    $.fn.slickPlay = function() {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.paused = false;
            element.slick.autoPlay();

        });
    };

    $.fn.slickPrev = function() {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.changeSlide({
                data: {
                    message: 'previous'
                }
            });

        });
    };

    $.fn.slickRemove = function(slideIndex, removeBefore) {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.removeSlide(slideIndex, removeBefore);

        });
    };

    $.fn.slickGetOption = function(option) {
        var _ = this;
        return _.get(0).slick.options[option];
    };

    $.fn.slickSetOption = function(option, value, refresh) {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.options[option] = value;

            if (refresh === true) {
                element.slick.unload();
                element.slick.reinit();
            }

        });
    };

    $.fn.slickUnfilter = function() {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.unfilterSlides();

        });
    };

    $.fn.unslick = function() {
        var _ = this;
        return _.each(function(index, element) {

          if (element.slick) {
            element.slick.destroy();
          }

        });
    };

    $.fn.getSlick = function() {
        var s = null;
        var _ = this;
        _.each(function(index, element) {
            s = element.slick;
        });

        return s;
    };

}));
;
/*
 *	jQuery dotdotdot 1.6.16
 *
 *	Copyright (c) Fred Heusschen
 *	www.frebsite.nl
 *
 *	Plugin website:
 *	dotdotdot.frebsite.nl
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	http://en.wikipedia.org/wiki/MIT_License
 *	http://en.wikipedia.org/wiki/GNU_General_Public_License
 */

(function( $, undef )
{
	if ( $.fn.dotdotdot )
	{
		return;
	}

	$.fn.dotdotdot = function( o )
	{
		if ( this.length == 0 )
		{
			$.fn.dotdotdot.debug( 'No element found for "' + this.selector + '".' );
			return this;
		}
		if ( this.length > 1 )
		{
			return this.each(
				function()
				{
					$(this).dotdotdot( o );
				}
			);
		}


		var $dot = this;

		if ( $dot.data( 'dotdotdot' ) )
		{
			$dot.trigger( 'destroy.dot' );
		}

		$dot.data( 'dotdotdot-style', $dot.attr( 'style' ) || '' );
		$dot.css( 'word-wrap', 'break-word' );
		if ($dot.css( 'white-space' ) === 'nowrap')
		{
			$dot.css( 'white-space', 'normal' );
		}

		$dot.bind_events = function()
		{
			$dot.bind(
				'update.dot',
				function( e, c )
				{
					e.preventDefault();
					e.stopPropagation();

					opts.maxHeight = ( typeof opts.height == 'number' )
						? opts.height
						: getTrueInnerHeight( $dot );

					opts.maxHeight += opts.tolerance;

					if ( typeof c != 'undefined' )
					{
						if ( typeof c == 'string' || c instanceof HTMLElement )
						{
					 		c = $('<div />').append( c ).contents();
						}
						if ( c instanceof $ )
						{
							orgContent = c;
						}
					}

					$inr = $dot.wrapInner( '<div class="dotdotdot" />' ).children();
					$inr.contents()
						.detach()
						.end()
						.append( orgContent.clone( true ) )
						.find( 'br' )
						.replaceWith( '  <br />  ' )
						.end()
						.css({
							'height'	: 'auto',
							'width'		: 'auto',
							'border'	: 'none',
							'padding'	: 0,
							'margin'	: 0
						});

					var after = false,
						trunc = false;

					if ( conf.afterElement )
					{
						after = conf.afterElement.clone( true );
					    after.show();
						conf.afterElement.detach();
					}

					if ( test( $inr, opts ) )
					{
						if ( opts.wrap == 'children' )
						{
							trunc = children( $inr, opts, after );
						}
						else
						{
							trunc = ellipsis( $inr, $dot, $inr, opts, after );
						}
					}
					$inr.replaceWith( $inr.contents() );
					$inr = null;

					if ( $.isFunction( opts.callback ) )
					{
						opts.callback.call( $dot[ 0 ], trunc, orgContent );
					}

					conf.isTruncated = trunc;
					return trunc;
				}

			).bind(
				'isTruncated.dot',
				function( e, fn )
				{
					e.preventDefault();
					e.stopPropagation();

					if ( typeof fn == 'function' )
					{
						fn.call( $dot[ 0 ], conf.isTruncated );
					}
					return conf.isTruncated;
				}

			).bind(
				'originalContent.dot',
				function( e, fn )
				{
					e.preventDefault();
					e.stopPropagation();

					if ( typeof fn == 'function' )
					{
						fn.call( $dot[ 0 ], orgContent );
					}
					return orgContent;
				}

			).bind(
				'destroy.dot',
				function( e )
				{
					e.preventDefault();
					e.stopPropagation();

					$dot.unwatch()
						.unbind_events()
						.contents()
						.detach()
						.end()
						.append( orgContent )
						.attr( 'style', $dot.data( 'dotdotdot-style' ) || '' )
						.data( 'dotdotdot', false );
				}
			);
			return $dot;
		};	//	/bind_events

		$dot.unbind_events = function()
		{
			$dot.unbind('.dot');
			return $dot;
		};	//	/unbind_events

		$dot.watch = function()
		{
			$dot.unwatch();
			if ( opts.watch == 'window' )
			{
				var $window = $(window),
					_wWidth = $window.width(),
					_wHeight = $window.height();

				$window.bind(
					'resize.dot' + conf.dotId,
					function()
					{
						if ( _wWidth != $window.width() || _wHeight != $window.height() || !opts.windowResizeFix )
						{
							_wWidth = $window.width();
							_wHeight = $window.height();

							if ( watchInt )
							{
								clearInterval( watchInt );
							}
							watchInt = setTimeout(
								function()
								{
									$dot.trigger( 'update.dot' );
								}, 100
							);
						}
					}
				);
			}
			else
			{
				watchOrg = getSizes( $dot );
				watchInt = setInterval(
					function()
					{
						if ( $dot.is( ':visible' ) )
						{
							var watchNew = getSizes( $dot );
							if ( watchOrg.width  != watchNew.width ||
								 watchOrg.height != watchNew.height )
							{
								$dot.trigger( 'update.dot' );
								watchOrg = watchNew;
							}
						}
					}, 500
				);
			}
			return $dot;
		};
		$dot.unwatch = function()
		{
			$(window).unbind( 'resize.dot' + conf.dotId );
			if ( watchInt )
			{
				clearInterval( watchInt );
			}
			return $dot;
		};

		var	orgContent	= $dot.contents(),
			opts 		= $.extend( true, {}, $.fn.dotdotdot.defaults, o ),
			conf		= {},
			watchOrg	= {},
			watchInt	= null,
			$inr		= null;


		if ( !( opts.lastCharacter.remove instanceof Array ) )
		{
			opts.lastCharacter.remove = $.fn.dotdotdot.defaultArrays.lastCharacter.remove;
		}
		if ( !( opts.lastCharacter.noEllipsis instanceof Array ) )
		{
			opts.lastCharacter.noEllipsis = $.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis;
		}


		conf.afterElement	= getElement( opts.after, $dot );
		conf.isTruncated	= false;
		conf.dotId			= dotId++;


		$dot.data( 'dotdotdot', true )
			.bind_events()
			.trigger( 'update.dot' );

		if ( opts.watch )
		{
			$dot.watch();
		}

		return $dot;
	};


	//	public
	$.fn.dotdotdot.defaults = {
		'ellipsis'			: '... ',
		'wrap'				: 'word',
		'fallbackToLetter'	: true,
		'lastCharacter'		: {},
		'tolerance'			: 0,
		'callback'			: null,
		'after'				: null,
		'height'			: null,
		'watch'				: false,
		'windowResizeFix'	: true
	};
	$.fn.dotdotdot.defaultArrays = {
		'lastCharacter'		: {
			'remove'			: [ ' ', '\u3000', ',', ';', '.', '!', '?' ],
			'noEllipsis'		: []
		}
	};
	$.fn.dotdotdot.debug = function( msg ) {};


	//	private
	var dotId = 1;

	function children( $elem, o, after )
	{
		var $elements 	= $elem.children(),
			isTruncated	= false;

		$elem.empty();

		for ( var a = 0, l = $elements.length; a < l; a++ )
		{
			var $e = $elements.eq( a );
			$elem.append( $e );
			if ( after )
			{
				$elem.append( after );
			}
			if ( test( $elem, o ) )
			{
				$e.remove();
				isTruncated = true;
				break;
			}
			else
			{
				if ( after )
				{
					after.detach();
				}
			}
		}
		return isTruncated;
	}
	function ellipsis( $elem, $d, $i, o, after )
	{
		var isTruncated	= false;

		//	Don't put the ellipsis directly inside these elements
		var notx = 'table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style';

		//	Don't remove these elements even if they are after the ellipsis
		var noty = 'script, .dotdotdot-keep';

		var addAfter = function(elem) {
			if ( after ) {
				elem[ elem.is( notx ) ? 'after' : 'append' ]( after );
			}
		};

		$elem
			.contents()
			.detach()
			.each(
				function()
				{

					var e	= this,
						$e	= $(e);

					if ( typeof e == 'undefined' || ( e.nodeType == 3 && $.trim( e.data ).length == 0 ) )
					{
						return true;
					}
					else if ( $e.is( noty ) )
					{
						$elem.append( $e );
					}
					else if ( isTruncated )
					{
						return true;
					}
					else
					{
						$elem.append( $e );
						addAfter( $elem );
						if ( test( $i, o ) )
						{
							if ( e.nodeType == 3 ) // node is TEXT
							{
								isTruncated = ellipsisElement( $e, $d, $i, o, after );
							}
							else
							{
								isTruncated = ellipsis( $e, $d, $i, o, after );
							}

							if ( !isTruncated )
							{
								addAfter($($elem.contents().last()));
								isTruncated = true;
							}
						}

						if ( !isTruncated )
						{
							if ( after )
							{
								after.detach();
							}
						}
					}
				}
			);

		return isTruncated;
	}
	function ellipsisElement( $e, $d, $i, o, after )
	{
		var e = $e[ 0 ];

		if ( !e )
		{
			return false;
		}

		var txt			= getTextContent( e ),
			space		= ( txt.indexOf(' ') !== -1 ) ? ' ' : '\u3000',
			separator	= ( o.wrap == 'letter' ) ? '' : space,
			textArr		= txt.split( separator ),
			position 	= -1,
			midPos		= -1,
			startPos	= 0,
			endPos		= textArr.length - 1;


		//	Only one word
		if ( o.fallbackToLetter && startPos == 0 && endPos == 0 )
		{
			separator	= '';
			textArr		= txt.split( separator );
			endPos		= textArr.length - 1;
		}

		while ( startPos <= endPos && !( startPos == 0 && endPos == 0 ) )
		{
			var m = Math.floor( ( startPos + endPos ) / 2 );
			if ( m == midPos )
			{
				break;
			}
			midPos = m;

			setTextContent( e, textArr.slice( 0, midPos + 1 ).join( separator ) + o.ellipsis );

			if ( !test( $i, o ) )
			{
				position = midPos;
				startPos = midPos;
			}
			else
			{
				endPos = midPos;

				//	Fallback to letter
				if (o.fallbackToLetter && startPos == 0 && endPos == 0 )
				{
					separator	= '';
					textArr		= textArr[ 0 ].split( separator );
					position	= -1;
					midPos		= -1;
					startPos	= 0;
					endPos		= textArr.length - 1;
				}
			}
		}

		if ( position != -1 && !( textArr.length == 1 && textArr[ 0 ].length == 0 ) )
		{
			txt = addEllipsis( textArr.slice( 0, position + 1 ).join( separator ), o );
			setTextContent( e, txt );
		}
		else
		{
			var $w = $e.parent();
			$e.detach();

			var afterLength = ( after && after.closest($w).length ) ? after.length : 0;

			if ( $w.contents().length > afterLength )
			{
				e = findLastTextNode( $w.contents().eq( -1 - afterLength ), $d );
			}
			else
			{
				e = findLastTextNode( $w, $d, true );
				if ( !afterLength )
				{
					$w.detach();
				}
			}
			if ( e )
			{
				txt = addEllipsis( getTextContent( e ), o );
				setTextContent( e, txt );
				if ( afterLength && after )
				{
					$(e).parent().append( after );
				}
			}
		}

		return true;
	}
	function test( $i, o )
	{
		return $i.innerHeight() > o.maxHeight;
	}
	function addEllipsis( txt, o )
	{
		while( $.inArray( txt.slice( -1 ), o.lastCharacter.remove ) > -1 )
		{
			txt = txt.slice( 0, -1 );
		}
		if ( $.inArray( txt.slice( -1 ), o.lastCharacter.noEllipsis ) < 0 )
		{
			txt += o.ellipsis;
		}
		return txt;
	}
	function getSizes( $d )
	{
		return {
			'width'	: $d.innerWidth(),
			'height': $d.innerHeight()
		};
	}
	function setTextContent( e, content )
	{
		if ( e.innerText )
		{
			e.innerText = content;
		}
		else if ( e.nodeValue )
		{
			e.nodeValue = content;
		}
		else if (e.textContent)
		{
			e.textContent = content;
		}

	}
	function getTextContent( e )
	{
		if ( e.innerText )
		{
			return e.innerText;
		}
		else if ( e.nodeValue )
		{
			return e.nodeValue;
		}
		else if ( e.textContent )
		{
			return e.textContent;
		}
		else
		{
			return "";
		}
	}
	function getPrevNode( n )
	{
		do
		{
			n = n.previousSibling;
		}
		while ( n && n.nodeType !== 1 && n.nodeType !== 3 );

		return n;
	}
	function findLastTextNode( $el, $top, excludeCurrent )
	{
		var e = $el && $el[ 0 ], p;
		if ( e )
		{
			if ( !excludeCurrent )
			{
				if ( e.nodeType === 3 )
				{
					return e;
				}
				if ( $.trim( $el.text() ) )
				{
					return findLastTextNode( $el.contents().last(), $top );
				}
			}
			p = getPrevNode( e );
			while ( !p )
			{
				$el = $el.parent();
				if ( $el.is( $top ) || !$el.length )
				{
					return false;
				}
				p = getPrevNode( $el[0] );
			}
			if ( p )
			{
				return findLastTextNode( $(p), $top );
			}
		}
		return false;
	}
	function getElement( e, $i )
	{
		if ( !e )
		{
			return false;
		}
		if ( typeof e === 'string' )
		{
			e = $(e, $i);
			return ( e.length )
				? e
				: false;
		}
		return !e.jquery
			? false
			: e;
	}
	function getTrueInnerHeight( $el )
	{
		var h = $el.innerHeight(),
			a = [ 'paddingTop', 'paddingBottom' ];

		for ( var z = 0, l = a.length; z < l; z++ )
		{
			var m = parseInt( $el.css( a[ z ] ), 10 );
			if ( isNaN( m ) )
			{
				m = 0;
			}
			h -= m;
		}
		return h;
	}


	//	override jQuery.html
	var _orgHtml = $.fn.html;
	$.fn.html = function( str )
	{
		if ( str != undef && !$.isFunction( str ) && this.data( 'dotdotdot' ) )
		{
			return this.trigger( 'update', [ str ] );
		}
		return _orgHtml.apply( this, arguments );
	};


	//	override jQuery.text
	var _orgText = $.fn.text;
	$.fn.text = function( str )
	{
		if ( str != undef && !$.isFunction( str ) && this.data( 'dotdotdot' ) )
		{
			str = $( '<div />' ).text( str ).html();
			return this.trigger( 'update', [ str ] );
		}
		return _orgText.apply( this, arguments );
	};


})( jQuery );;
/**
 * Theme Customizer enhancements for a better user experience.
 *
 * Contains handlers to make Theme Customizer preview reload changes asynchronously.
 */

( function( $ ) {

	var sliderHeight = $($('.featured-slides div')[0]).height();
	$('.featured-slides').slick({
		autoplay: true,
		autoplaySpeed: 15000,
		speed: 300,
		arrows: false,
		dots: true,
		pauseOnHover: true,
		onInit: function() {
			$('.slick-slide').css('height',sliderHeight);
			$(".slick-initialized .slick-slide").dotdotdot({after: 'a.read_more', watch: 'window'});	
		}
	});

	$(".site-main .widget_recent_entries .entry-intro").dotdotdot({after: 'a.read_more', height: '200px', watch: 'window', ellipsis: ''});


	if($(".clock").length) {
		$(".clock").each(function() {
			var theClock = $(this);
			var futureTime = theClock.text();
			var days, hours, minutes, seconds;

			countDown = setInterval(function () {
				var currentDate = Date.now() / 1000;
				var futureDate = new Date(futureTime).getTime() / 1000;
				var diff = futureDate - currentDate;

				if (diff < 0) {
					diff = 0;
				}

				days = parseInt(diff / 86400);
				diff = diff % 86400;

				hours = parseInt(diff / 3600);
				diff = diff % 3600;

				minutes = parseInt(diff / 60);

				theClock.html(days + " days " + hours + " hours "
				+ minutes + " mins");
				theClock.css("visibility", "visible");
			}, 1000);
		});
	}

} )( jQuery );
;
/*! This file is auto-generated */
window.addComment=function(s){var u,f,v,y=s.document,p={commentReplyClass:"comment-reply-link",cancelReplyId:"cancel-comment-reply-link",commentFormId:"commentform",temporaryFormId:"wp-temp-form-div",parentIdFieldId:"comment_parent",postIdFieldId:"comment_post_ID"},e=s.MutationObserver||s.WebKitMutationObserver||s.MozMutationObserver,i="querySelector"in y&&"addEventListener"in s,n=!!y.documentElement.dataset;function t(){r(),function(){if(!e)return;new e(d).observe(y.body,{childList:!0,subtree:!0})}()}function r(e){if(i&&(u=I(p.cancelReplyId),f=I(p.commentFormId),u)){u.addEventListener("touchstart",a),u.addEventListener("click",a);var t=function(e){if((e.metaKey||e.ctrlKey)&&13===e.keyCode)return f.removeEventListener("keydown",t),e.preventDefault(),f.submit.click(),!1};f&&f.addEventListener("keydown",t);for(var n,r=function(e){var t,n=p.commentReplyClass;e&&e.childNodes||(e=y);t=y.getElementsByClassName?e.getElementsByClassName(n):e.querySelectorAll("."+n);return t}(e),d=0,o=r.length;d<o;d++)(n=r[d]).addEventListener("touchstart",l),n.addEventListener("click",l)}}function a(e){var t=I(p.temporaryFormId);t&&v&&(I(p.parentIdFieldId).value="0",t.parentNode.replaceChild(v,t),this.style.display="none",e.preventDefault())}function l(e){var t=this,n=m(t,"belowelement"),r=m(t,"commentid"),d=m(t,"respondelement"),o=m(t,"postid");n&&r&&d&&o&&!1===s.addComment.moveForm(n,r,d,o)&&e.preventDefault()}function d(e){for(var t=e.length;t--;)if(e[t].addedNodes.length)return void r()}function m(e,t){return n?e.dataset[t]:e.getAttribute("data-"+t)}function I(e){return y.getElementById(e)}return i&&"loading"!==y.readyState?t():i&&s.addEventListener("DOMContentLoaded",t,!1),{init:r,moveForm:function(e,t,n,r){var d=I(e);v=I(n);var o,i,a,l=I(p.parentIdFieldId),m=I(p.postIdFieldId);if(d&&v&&l){!function(e){var t=p.temporaryFormId,n=I(t);if(n)return;(n=y.createElement("div")).id=t,n.style.display="none",e.parentNode.insertBefore(n,e)}(v),r&&m&&(m.value=r),l.value=t,u.style.display="",d.parentNode.insertBefore(v,d.nextSibling),u.onclick=function(){return!1};try{for(var c=0;c<f.elements.length;c++)if(o=f.elements[c],i=!1,"getComputedStyle"in s?a=s.getComputedStyle(o):y.documentElement.currentStyle&&(a=o.currentStyle),(o.offsetWidth<=0&&o.offsetHeight<=0||"hidden"===a.visibility)&&(i=!0),"hidden"!==o.type&&!o.disabled&&!i){o.focus();break}}catch(e){}return!1}}}}(window);;
( function( $ ) {
    if (document.cookie.indexOf('hd_cookie_notification_accepted=') == "-1" && $('.cookie-notifications-btn').length) {
        $('.cookie-notifications').show();

        $('.cookie-notifications-btn').click(function () {
            var days = 365;
            var date = new Date();
            date.setTime(+ date + (days * 86400000));
            document.cookie = 'hd_cookie_notification_accepted=true; expires=' + date.toGMTString() + '; path=/';
            $('.cookie-notifications').hide();
        });
    }
} )( jQuery );;
/*! This file is auto-generated */
(function(){function r(){}var n=this,t=n._,e=Array.prototype,o=Object.prototype,u=Function.prototype,i=e.push,c=e.slice,s=o.toString,a=o.hasOwnProperty,f=Array.isArray,l=Object.keys,p=u.bind,h=Object.create,v=function(n){return n instanceof v?n:this instanceof v?void(this._wrapped=n):new v(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=v),exports._=v):n._=v,v.VERSION="1.8.3";var y=function(u,i,n){if(void 0===i)return u;switch(null==n?3:n){case 1:return function(n){return u.call(i,n)};case 2:return function(n,t){return u.call(i,n,t)};case 3:return function(n,t,r){return u.call(i,n,t,r)};case 4:return function(n,t,r,e){return u.call(i,n,t,r,e)}}return function(){return u.apply(i,arguments)}},d=function(n,t,r){return null==n?v.identity:v.isFunction(n)?y(n,t,r):v.isObject(n)?v.matcher(n):v.property(n)};v.iteratee=function(n,t){return d(n,t,1/0)};function g(c,f){return function(n){var t=arguments.length;if(t<2||null==n)return n;for(var r=1;r<t;r++)for(var e=arguments[r],u=c(e),i=u.length,o=0;o<i;o++){var a=u[o];f&&void 0!==n[a]||(n[a]=e[a])}return n}}function m(n){if(!v.isObject(n))return{};if(h)return h(n);r.prototype=n;var t=new r;return r.prototype=null,t}function b(t){return function(n){return null==n?void 0:n[t]}}var x=Math.pow(2,53)-1,_=b("length"),j=function(n){var t=_(n);return"number"==typeof t&&0<=t&&t<=x};function w(a){return function(n,t,r,e){t=y(t,e,4);var u=!j(n)&&v.keys(n),i=(u||n).length,o=0<a?0:i-1;return arguments.length<3&&(r=n[u?u[o]:o],o+=a),function(n,t,r,e,u,i){for(;0<=u&&u<i;u+=a){var o=e?e[u]:u;r=t(r,n[o],o,n)}return r}(n,t,r,u,o,i)}}v.each=v.forEach=function(n,t,r){var e,u;if(t=y(t,r),j(n))for(e=0,u=n.length;e<u;e++)t(n[e],e,n);else{var i=v.keys(n);for(e=0,u=i.length;e<u;e++)t(n[i[e]],i[e],n)}return n},v.map=v.collect=function(n,t,r){t=d(t,r);for(var e=!j(n)&&v.keys(n),u=(e||n).length,i=Array(u),o=0;o<u;o++){var a=e?e[o]:o;i[o]=t(n[a],a,n)}return i},v.reduce=v.foldl=v.inject=w(1),v.reduceRight=v.foldr=w(-1),v.find=v.detect=function(n,t,r){var e;if(void 0!==(e=j(n)?v.findIndex(n,t,r):v.findKey(n,t,r))&&-1!==e)return n[e]},v.filter=v.select=function(n,e,t){var u=[];return e=d(e,t),v.each(n,function(n,t,r){e(n,t,r)&&u.push(n)}),u},v.reject=function(n,t,r){return v.filter(n,v.negate(d(t)),r)},v.every=v.all=function(n,t,r){t=d(t,r);for(var e=!j(n)&&v.keys(n),u=(e||n).length,i=0;i<u;i++){var o=e?e[i]:i;if(!t(n[o],o,n))return!1}return!0},v.some=v.any=function(n,t,r){t=d(t,r);for(var e=!j(n)&&v.keys(n),u=(e||n).length,i=0;i<u;i++){var o=e?e[i]:i;if(t(n[o],o,n))return!0}return!1},v.contains=v.includes=v.include=function(n,t,r,e){return j(n)||(n=v.values(n)),"number"==typeof r&&!e||(r=0),0<=v.indexOf(n,t,r)},v.invoke=function(n,r){var e=c.call(arguments,2),u=v.isFunction(r);return v.map(n,function(n){var t=u?r:n[r];return null==t?t:t.apply(n,e)})},v.pluck=function(n,t){return v.map(n,v.property(t))},v.where=function(n,t){return v.filter(n,v.matcher(t))},v.findWhere=function(n,t){return v.find(n,v.matcher(t))},v.max=function(n,e,t){var r,u,i=-1/0,o=-1/0;if(null==e&&null!=n)for(var a=0,c=(n=j(n)?n:v.values(n)).length;a<c;a++)r=n[a],i<r&&(i=r);else e=d(e,t),v.each(n,function(n,t,r){u=e(n,t,r),(o<u||u===-1/0&&i===-1/0)&&(i=n,o=u)});return i},v.min=function(n,e,t){var r,u,i=1/0,o=1/0;if(null==e&&null!=n)for(var a=0,c=(n=j(n)?n:v.values(n)).length;a<c;a++)(r=n[a])<i&&(i=r);else e=d(e,t),v.each(n,function(n,t,r){((u=e(n,t,r))<o||u===1/0&&i===1/0)&&(i=n,o=u)});return i},v.shuffle=function(n){for(var t,r=j(n)?n:v.values(n),e=r.length,u=Array(e),i=0;i<e;i++)(t=v.random(0,i))!==i&&(u[i]=u[t]),u[t]=r[i];return u},v.sample=function(n,t,r){return null==t||r?(j(n)||(n=v.values(n)),n[v.random(n.length-1)]):v.shuffle(n).slice(0,Math.max(0,t))},v.sortBy=function(n,e,t){return e=d(e,t),v.pluck(v.map(n,function(n,t,r){return{value:n,index:t,criteria:e(n,t,r)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(e<r||void 0===r)return 1;if(r<e||void 0===e)return-1}return n.index-t.index}),"value")};function A(o){return function(e,u,n){var i={};return u=d(u,n),v.each(e,function(n,t){var r=u(n,t,e);o(i,n,r)}),i}}v.groupBy=A(function(n,t,r){v.has(n,r)?n[r].push(t):n[r]=[t]}),v.indexBy=A(function(n,t,r){n[r]=t}),v.countBy=A(function(n,t,r){v.has(n,r)?n[r]++:n[r]=1}),v.toArray=function(n){return n?v.isArray(n)?c.call(n):j(n)?v.map(n,v.identity):v.values(n):[]},v.size=function(n){return null==n?0:j(n)?n.length:v.keys(n).length},v.partition=function(n,e,t){e=d(e,t);var u=[],i=[];return v.each(n,function(n,t,r){(e(n,t,r)?u:i).push(n)}),[u,i]},v.first=v.head=v.take=function(n,t,r){if(null!=n)return null==t||r?n[0]:v.initial(n,n.length-t)},v.initial=function(n,t,r){return c.call(n,0,Math.max(0,n.length-(null==t||r?1:t)))},v.last=function(n,t,r){if(null!=n)return null==t||r?n[n.length-1]:v.rest(n,Math.max(0,n.length-t))},v.rest=v.tail=v.drop=function(n,t,r){return c.call(n,null==t||r?1:t)},v.compact=function(n){return v.filter(n,v.identity)};var O=function(n,t,r,e){for(var u=[],i=0,o=e||0,a=_(n);o<a;o++){var c=n[o];if(j(c)&&(v.isArray(c)||v.isArguments(c))){t||(c=O(c,t,r));var f=0,l=c.length;for(u.length+=l;f<l;)u[i++]=c[f++]}else r||(u[i++]=c)}return u};function k(i){return function(n,t,r){t=d(t,r);for(var e=_(n),u=0<i?0:e-1;0<=u&&u<e;u+=i)if(t(n[u],u,n))return u;return-1}}function F(i,o,a){return function(n,t,r){var e=0,u=_(n);if("number"==typeof r)0<i?e=0<=r?r:Math.max(r+u,e):u=0<=r?Math.min(r+1,u):r+u+1;else if(a&&r&&u)return n[r=a(n,t)]===t?r:-1;if(t!=t)return 0<=(r=o(c.call(n,e,u),v.isNaN))?r+e:-1;for(r=0<i?e:u-1;0<=r&&r<u;r+=i)if(n[r]===t)return r;return-1}}v.flatten=function(n,t){return O(n,t,!1)},v.without=function(n){return v.difference(n,c.call(arguments,1))},v.uniq=v.unique=function(n,t,r,e){v.isBoolean(t)||(e=r,r=t,t=!1),null!=r&&(r=d(r,e));for(var u=[],i=[],o=0,a=_(n);o<a;o++){var c=n[o],f=r?r(c,o,n):c;t?(o&&i===f||u.push(c),i=f):r?v.contains(i,f)||(i.push(f),u.push(c)):v.contains(u,c)||u.push(c)}return u},v.union=function(){return v.uniq(O(arguments,!0,!0))},v.intersection=function(n){for(var t=[],r=arguments.length,e=0,u=_(n);e<u;e++){var i=n[e];if(!v.contains(t,i)){for(var o=1;o<r&&v.contains(arguments[o],i);o++);o===r&&t.push(i)}}return t},v.difference=function(n){var t=O(arguments,!0,!0,1);return v.filter(n,function(n){return!v.contains(t,n)})},v.zip=function(){return v.unzip(arguments)},v.unzip=function(n){for(var t=n&&v.max(n,_).length||0,r=Array(t),e=0;e<t;e++)r[e]=v.pluck(n,e);return r},v.object=function(n,t){for(var r={},e=0,u=_(n);e<u;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},v.findIndex=k(1),v.findLastIndex=k(-1),v.sortedIndex=function(n,t,r,e){for(var u=(r=d(r,e,1))(t),i=0,o=_(n);i<o;){var a=Math.floor((i+o)/2);r(n[a])<u?i=a+1:o=a}return i},v.indexOf=F(1,v.findIndex,v.sortedIndex),v.lastIndexOf=F(-1,v.findLastIndex),v.range=function(n,t,r){null==t&&(t=n||0,n=0),r=r||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=Array(e),i=0;i<e;i++,n+=r)u[i]=n;return u};function S(n,t,r,e,u){if(!(e instanceof t))return n.apply(r,u);var i=m(n.prototype),o=n.apply(i,u);return v.isObject(o)?o:i}v.bind=function(n,t){if(p&&n.bind===p)return p.apply(n,c.call(arguments,1));if(!v.isFunction(n))throw new TypeError("Bind must be called on a function");var r=c.call(arguments,2),e=function(){return S(n,e,t,this,r.concat(c.call(arguments)))};return e},v.partial=function(u){var i=c.call(arguments,1),o=function(){for(var n=0,t=i.length,r=Array(t),e=0;e<t;e++)r[e]=i[e]===v?arguments[n++]:i[e];for(;n<arguments.length;)r.push(arguments[n++]);return S(u,o,this,this,r)};return o},v.bindAll=function(n){var t,r,e=arguments.length;if(e<=1)throw new Error("bindAll must be passed function names");for(t=1;t<e;t++)n[r=arguments[t]]=v.bind(n[r],n);return n},v.memoize=function(e,u){var i=function(n){var t=i.cache,r=""+(u?u.apply(this,arguments):n);return v.has(t,r)||(t[r]=e.apply(this,arguments)),t[r]};return i.cache={},i},v.delay=function(n,t){var r=c.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},v.defer=v.partial(v.delay,v,1),v.throttle=function(r,e,u){var i,o,a,c=null,f=0;u=u||{};function l(){f=!1===u.leading?0:v.now(),c=null,a=r.apply(i,o),c||(i=o=null)}return function(){var n=v.now();f||!1!==u.leading||(f=n);var t=e-(n-f);return i=this,o=arguments,t<=0||e<t?(c&&(clearTimeout(c),c=null),f=n,a=r.apply(i,o),c||(i=o=null)):c||!1===u.trailing||(c=setTimeout(l,t)),a}},v.debounce=function(t,r,e){var u,i,o,a,c,f=function(){var n=v.now()-a;n<r&&0<=n?u=setTimeout(f,r-n):(u=null,e||(c=t.apply(o,i),u||(o=i=null)))};return function(){o=this,i=arguments,a=v.now();var n=e&&!u;return u=u||setTimeout(f,r),n&&(c=t.apply(o,i),o=i=null),c}},v.wrap=function(n,t){return v.partial(t,n)},v.negate=function(n){return function(){return!n.apply(this,arguments)}},v.compose=function(){var r=arguments,e=r.length-1;return function(){for(var n=e,t=r[e].apply(this,arguments);n--;)t=r[n].call(this,t);return t}},v.after=function(n,t){return function(){if(--n<1)return t.apply(this,arguments)}},v.before=function(n,t){var r;return function(){return 0<--n&&(r=t.apply(this,arguments)),n<=1&&(t=null),r}},v.once=v.partial(v.before,2);var E=!{toString:null}.propertyIsEnumerable("toString"),M=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"];function I(n,t){var r=M.length,e=n.constructor,u=v.isFunction(e)&&e.prototype||o,i="constructor";for(v.has(n,i)&&!v.contains(t,i)&&t.push(i);r--;)(i=M[r])in n&&n[i]!==u[i]&&!v.contains(t,i)&&t.push(i)}v.keys=function(n){if(!v.isObject(n))return[];if(l)return l(n);var t=[];for(var r in n)v.has(n,r)&&t.push(r);return E&&I(n,t),t},v.allKeys=function(n){if(!v.isObject(n))return[];var t=[];for(var r in n)t.push(r);return E&&I(n,t),t},v.values=function(n){for(var t=v.keys(n),r=t.length,e=Array(r),u=0;u<r;u++)e[u]=n[t[u]];return e},v.mapObject=function(n,t,r){t=d(t,r);for(var e,u=v.keys(n),i=u.length,o={},a=0;a<i;a++)o[e=u[a]]=t(n[e],e,n);return o},v.pairs=function(n){for(var t=v.keys(n),r=t.length,e=Array(r),u=0;u<r;u++)e[u]=[t[u],n[t[u]]];return e},v.invert=function(n){for(var t={},r=v.keys(n),e=0,u=r.length;e<u;e++)t[n[r[e]]]=r[e];return t},v.functions=v.methods=function(n){var t=[];for(var r in n)v.isFunction(n[r])&&t.push(r);return t.sort()},v.extend=g(v.allKeys),v.extendOwn=v.assign=g(v.keys),v.findKey=function(n,t,r){t=d(t,r);for(var e,u=v.keys(n),i=0,o=u.length;i<o;i++)if(t(n[e=u[i]],e,n))return e},v.pick=function(n,t,r){var e,u,i={},o=n;if(null==o)return i;v.isFunction(t)?(u=v.allKeys(o),e=y(t,r)):(u=O(arguments,!1,!1,1),e=function(n,t,r){return t in r},o=Object(o));for(var a=0,c=u.length;a<c;a++){var f=u[a],l=o[f];e(l,f,o)&&(i[f]=l)}return i},v.omit=function(n,t,r){if(v.isFunction(t))t=v.negate(t);else{var e=v.map(O(arguments,!1,!1,1),String);t=function(n,t){return!v.contains(e,t)}}return v.pick(n,t,r)},v.defaults=g(v.allKeys,!0),v.create=function(n,t){var r=m(n);return t&&v.extendOwn(r,t),r},v.clone=function(n){return v.isObject(n)?v.isArray(n)?n.slice():v.extend({},n):n},v.tap=function(n,t){return t(n),n},v.isMatch=function(n,t){var r=v.keys(t),e=r.length;if(null==n)return!e;for(var u=Object(n),i=0;i<e;i++){var o=r[i];if(t[o]!==u[o]||!(o in u))return!1}return!0};var N=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof v&&(n=n._wrapped),t instanceof v&&(t=t._wrapped);var u=s.call(n);if(u!==s.call(t))return!1;switch(u){case"[object RegExp]":case"[object String]":return""+n==""+t;case"[object Number]":return+n!=+n?+t!=+t:0==+n?1/+n==1/t:+n==+t;case"[object Date]":case"[object Boolean]":return+n==+t}var i="[object Array]"===u;if(!i){if("object"!=typeof n||"object"!=typeof t)return!1;var o=n.constructor,a=t.constructor;if(o!==a&&!(v.isFunction(o)&&o instanceof o&&v.isFunction(a)&&a instanceof a)&&"constructor"in n&&"constructor"in t)return!1}e=e||[];for(var c=(r=r||[]).length;c--;)if(r[c]===n)return e[c]===t;if(r.push(n),e.push(t),i){if((c=n.length)!==t.length)return!1;for(;c--;)if(!N(n[c],t[c],r,e))return!1}else{var f,l=v.keys(n);if(c=l.length,v.keys(t).length!==c)return!1;for(;c--;)if(f=l[c],!v.has(t,f)||!N(n[f],t[f],r,e))return!1}return r.pop(),e.pop(),!0};v.isEqual=function(n,t){return N(n,t)},v.isEmpty=function(n){return null==n||(j(n)&&(v.isArray(n)||v.isString(n)||v.isArguments(n))?0===n.length:0===v.keys(n).length)},v.isElement=function(n){return!(!n||1!==n.nodeType)},v.isArray=f||function(n){return"[object Array]"===s.call(n)},v.isObject=function(n){var t=typeof n;return"function"==t||"object"==t&&!!n},v.each(["Arguments","Function","String","Number","Date","RegExp","Error"],function(t){v["is"+t]=function(n){return s.call(n)==="[object "+t+"]"}}),v.isArguments(arguments)||(v.isArguments=function(n){return v.has(n,"callee")}),"function"!=typeof/./&&"object"!=typeof Int8Array&&(v.isFunction=function(n){return"function"==typeof n||!1}),v.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},v.isNaN=function(n){return v.isNumber(n)&&n!==+n},v.isBoolean=function(n){return!0===n||!1===n||"[object Boolean]"===s.call(n)},v.isNull=function(n){return null===n},v.isUndefined=function(n){return void 0===n},v.has=function(n,t){return null!=n&&a.call(n,t)},v.noConflict=function(){return n._=t,this},v.identity=function(n){return n},v.constant=function(n){return function(){return n}},v.noop=function(){},v.property=b,v.propertyOf=function(t){return null==t?function(){}:function(n){return t[n]}},v.matcher=v.matches=function(t){return t=v.extendOwn({},t),function(n){return v.isMatch(n,t)}},v.times=function(n,t,r){var e=Array(Math.max(0,n));t=y(t,r,1);for(var u=0;u<n;u++)e[u]=t(u);return e},v.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))},v.now=Date.now||function(){return(new Date).getTime()};function B(t){function r(n){return t[n]}var n="(?:"+v.keys(t).join("|")+")",e=RegExp(n),u=RegExp(n,"g");return function(n){return n=null==n?"":""+n,e.test(n)?n.replace(u,r):n}}var T={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},R=v.invert(T);v.escape=B(T),v.unescape=B(R),v.result=function(n,t,r){var e=null==n?void 0:n[t];return void 0===e&&(e=r),v.isFunction(e)?e.call(n):e};var q=0;v.uniqueId=function(n){var t=++q+"";return n?n+t:t},v.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};function K(n){return"\\"+D[n]}var z=/(.)^/,D={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},L=/\\|'|\r|\n|\u2028|\u2029/g;v.template=function(i,n,t){!n&&t&&(n=t),n=v.defaults({},n,v.templateSettings);var r=RegExp([(n.escape||z).source,(n.interpolate||z).source,(n.evaluate||z).source].join("|")+"|$","g"),o=0,a="__p+='";i.replace(r,function(n,t,r,e,u){return a+=i.slice(o,u).replace(L,K),o=u+n.length,t?a+="'+\n((__t=("+t+"))==null?'':_.escape(__t))+\n'":r?a+="'+\n((__t=("+r+"))==null?'':__t)+\n'":e&&(a+="';\n"+e+"\n__p+='"),n}),a+="';\n",n.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{var e=new Function(n.variable||"obj","_",a)}catch(n){throw n.source=a,n}function u(n){return e.call(this,n,v)}var c=n.variable||"obj";return u.source="function("+c+"){\n"+a+"}",u},v.chain=function(n){var t=v(n);return t._chain=!0,t};function P(n,t){return n._chain?v(t).chain():t}v.mixin=function(r){v.each(v.functions(r),function(n){var t=v[n]=r[n];v.prototype[n]=function(){var n=[this._wrapped];return i.apply(n,arguments),P(this,t.apply(v,n))}})},v.mixin(v),v.each(["pop","push","reverse","shift","sort","splice","unshift"],function(t){var r=e[t];v.prototype[t]=function(){var n=this._wrapped;return r.apply(n,arguments),"shift"!==t&&"splice"!==t||0!==n.length||delete n[0],P(this,n)}}),v.each(["concat","join","slice"],function(n){var t=e[n];v.prototype[n]=function(){return P(this,t.apply(this._wrapped,arguments))}}),v.prototype.value=function(){return this._wrapped},v.prototype.valueOf=v.prototype.toJSON=v.prototype.value,v.prototype.toString=function(){return""+this._wrapped},"function"==typeof define&&define.amd&&define("underscore",[],function(){return v})}).call(this);;
!function(t){var r={};function n(e){if(r[e])return r[e].exports;var o=r[e]={i:e,l:!1,exports:{}};return t[e].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=r,n.d=function(t,r,e){n.o(t,r)||Object.defineProperty(t,r,{enumerable:!0,get:e})},n.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,r){if(1&r&&(t=n(t)),8&r)return t;if(4&r&&"object"===typeof t&&t&&t.__esModule)return t;var e=Object.create(null);if(n.r(e),Object.defineProperty(e,"default",{enumerable:!0,value:t}),2&r&&"string"!=typeof t)for(var o in t)n.d(e,o,function(r){return t[r]}.bind(null,o));return e},n.n=function(t){var r=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(r,"a",r),r},n.o=function(t,r){return Object.prototype.hasOwnProperty.call(t,r)},n.p="",n(n.s=292)}([,,function(t,r,n){(function(r){var n="object",e=function(t){return t&&t.Math==Math&&t};t.exports=e(typeof globalThis==n&&globalThis)||e(typeof window==n&&window)||e(typeof self==n&&self)||e(typeof r==n&&r)||Function("return this")()}).call(this,n(49))},,function(t,r){t.exports=function(t){try{return!!t()}catch(t){return!0}}},,,function(t,r){t.exports=jQuery},function(t,r){t.exports=function(t){return"object"===typeof t?null!==t:"function"===typeof t}},function(t,r,n){var e=n(4);t.exports=!e((function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a}))},function(t,r,n){var e=n(9),o=n(18),i=n(26);t.exports=e?function(t,r,n){return o.f(t,r,i(1,n))}:function(t,r,n){return t[r]=n,t}},function(t,r){var n={}.hasOwnProperty;t.exports=function(t,r){return n.call(t,r)}},function(t,r,n){var e=n(2),o=n(31).f,i=n(10),c=n(36),u=n(23),a=n(57),f=n(52);t.exports=function(t,r){var n,s,l,p,v,d=t.target,h=t.global,g=t.stat;if(n=h?e:g?e[d]||u(d,{}):(e[d]||{}).prototype)for(s in r){if(p=r[s],l=t.noTargetGet?(v=o(n,s))&&v.value:n[s],!f(h?s:d+(g?".":"#")+s,t.forced)&&void 0!==l){if(typeof p===typeof l)continue;a(p,l)}(t.sham||l&&l.sham)&&i(p,"sham",!0),c(n,s,p,t)}}},function(t,r,n){var e=n(8);t.exports=function(t){if(!e(t))throw TypeError(String(t)+" is not an object");return t}},,function(t,r,n){var e=n(2),o=n(23),i=n(54),c=e["__core-js_shared__"]||o("__core-js_shared__",{});(t.exports=function(t,r){return c[t]||(c[t]=void 0!==r?r:{})})("versions",[]).push({version:"3.2.1",mode:i?"pure":"global",copyright:"© 2019 Denis Pushkarev (zloirock.ru)"})},function(t,r){t.exports=function(t){if(void 0==t)throw TypeError("Can't call method on "+t);return t}},function(t,r,n){var e=n(2),o=n(15),i=n(34),c=n(61),u=e.Symbol,a=o("wks");t.exports=function(t){return a[t]||(a[t]=c&&u[t]||(c?u:i)("Symbol."+t))}},function(t,r,n){var e=n(9),o=n(32),i=n(13),c=n(27),u=Object.defineProperty;r.f=e?u:function(t,r,n){if(i(t),r=c(r,!0),i(n),o)try{return u(t,r,n)}catch(t){}if("get"in n||"set"in n)throw TypeError("Accessors not supported");return"value"in n&&(t[r]=n.value),t}},function(t,r,n){var e=n(30),o=n(16);t.exports=function(t){return e(o(t))}},function(t,r,n){var e=n(22),o=Math.min;t.exports=function(t){return t>0?o(e(t),9007199254740991):0}},,function(t,r){var n=Math.ceil,e=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?e:n)(t)}},function(t,r,n){var e=n(2),o=n(10);t.exports=function(t,r){try{o(e,t,r)}catch(n){e[t]=r}return r}},function(t,r){var n={}.toString;t.exports=function(t){return n.call(t).slice(8,-1)}},function(t,r,n){var e=n(16);t.exports=function(t){return Object(e(t))}},function(t,r){t.exports=function(t,r){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:r}}},function(t,r,n){var e=n(8);t.exports=function(t,r){if(!e(t))return t;var n,o;if(r&&"function"==typeof(n=t.toString)&&!e(o=n.call(t)))return o;if("function"==typeof(n=t.valueOf)&&!e(o=n.call(t)))return o;if(!r&&"function"==typeof(n=t.toString)&&!e(o=n.call(t)))return o;throw TypeError("Can't convert object to primitive value")}},function(t,r){t.exports={}},function(t,r){t.exports=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"]},function(t,r,n){var e=n(4),o=n(24),i="".split;t.exports=e((function(){return!Object("z").propertyIsEnumerable(0)}))?function(t){return"String"==o(t)?i.call(t,""):Object(t)}:Object},function(t,r,n){var e=n(9),o=n(45),i=n(26),c=n(19),u=n(27),a=n(11),f=n(32),s=Object.getOwnPropertyDescriptor;r.f=e?s:function(t,r){if(t=c(t),r=u(r,!0),f)try{return s(t,r)}catch(t){}if(a(t,r))return i(!o.f.call(t,r),t[r])}},function(t,r,n){var e=n(9),o=n(4),i=n(38);t.exports=!e&&!o((function(){return 7!=Object.defineProperty(i("div"),"a",{get:function(){return 7}}).a}))},function(t,r,n){var e=n(15);t.exports=e("native-function-to-string",Function.toString)},function(t,r){var n=0,e=Math.random();t.exports=function(t){return"Symbol("+String(void 0===t?"":t)+")_"+(++n+e).toString(36)}},function(t,r,n){var e=n(11),o=n(19),i=n(46).indexOf,c=n(28);t.exports=function(t,r){var n,u=o(t),a=0,f=[];for(n in u)!e(c,n)&&e(u,n)&&f.push(n);for(;r.length>a;)e(u,n=r[a++])&&(~i(f,n)||f.push(n));return f}},function(t,r,n){var e=n(2),o=n(15),i=n(10),c=n(11),u=n(23),a=n(33),f=n(55),s=f.get,l=f.enforce,p=String(a).split("toString");o("inspectSource",(function(t){return a.call(t)})),(t.exports=function(t,r,n,o){var a=!!o&&!!o.unsafe,f=!!o&&!!o.enumerable,s=!!o&&!!o.noTargetGet;"function"==typeof n&&("string"!=typeof r||c(n,"name")||i(n,"name",r),l(n).source=p.join("string"==typeof r?r:"")),t!==e?(a?!s&&t[r]&&(f=!0):delete t[r],f?t[r]=n:i(t,r,n)):f?t[r]=n:u(r,n)})(Function.prototype,"toString",(function(){return"function"==typeof this&&s(this).source||a.call(this)}))},function(t,r,n){var e=n(59),o=n(2),i=function(t){return"function"==typeof t?t:void 0};t.exports=function(t,r){return arguments.length<2?i(e[t])||i(o[t]):e[t]&&e[t][r]||o[t]&&o[t][r]}},function(t,r,n){var e=n(2),o=n(8),i=e.document,c=o(i)&&o(i.createElement);t.exports=function(t){return c?i.createElement(t):{}}},function(t,r,n){var e=n(15),o=n(34),i=e("keys");t.exports=function(t){return i[t]||(i[t]=o(t))}},function(t,r,n){var e=n(22),o=Math.max,i=Math.min;t.exports=function(t,r){var n=e(t);return n<0?o(n+r,0):i(n,r)}},function(t,r,n){var e=n(8),o=n(42),i=n(17)("species");t.exports=function(t,r){var n;return o(t)&&("function"!=typeof(n=t.constructor)||n!==Array&&!o(n.prototype)?e(n)&&null===(n=n[i])&&(n=void 0):n=void 0),new(void 0===n?Array:n)(0===r?0:r)}},function(t,r,n){var e=n(24);t.exports=Array.isArray||function(t){return"Array"==e(t)}},,function(t,r,n){var e=n(60),o=n(30),i=n(25),c=n(20),u=n(41),a=[].push,f=function(t){var r=1==t,n=2==t,f=3==t,s=4==t,l=6==t,p=5==t||l;return function(v,d,h,g){for(var y,x,b=i(v),m=o(b),S=e(d,h,3),O=c(m.length),w=0,E=g||u,j=r?E(v,O):n?E(v,0):void 0;O>w;w++)if((p||w in m)&&(x=S(y=m[w],w,b),t))if(r)j[w]=x;else if(x)switch(t){case 3:return!0;case 5:return y;case 6:return w;case 2:a.call(j,y)}else if(s)return!1;return l?-1:f||s?s:j}};t.exports={forEach:f(0),map:f(1),filter:f(2),some:f(3),every:f(4),find:f(5),findIndex:f(6)}},function(t,r,n){"use strict";var e={}.propertyIsEnumerable,o=Object.getOwnPropertyDescriptor,i=o&&!e.call({1:2},1);r.f=i?function(t){var r=o(this,t);return!!r&&r.enumerable}:e},function(t,r,n){var e=n(19),o=n(20),i=n(40),c=function(t){return function(r,n,c){var u,a=e(r),f=o(a.length),s=i(c,f);if(t&&n!=n){for(;f>s;)if((u=a[s++])!=u)return!0}else for(;f>s;s++)if((t||s in a)&&a[s]===n)return t||s||0;return!t&&-1}};t.exports={includes:c(!0),indexOf:c(!1)}},function(t,r){t.exports=function(t){if("function"!=typeof t)throw TypeError(String(t)+" is not a function");return t}},,function(t,r){var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(t){"object"===typeof window&&(n=window)}t.exports=n},function(t,r,n){var e=n(35),o=n(29).concat("length","prototype");r.f=Object.getOwnPropertyNames||function(t){return e(t,o)}},function(t,r){r.f=Object.getOwnPropertySymbols},function(t,r,n){var e=n(4),o=/#|\.prototype\./,i=function(t,r){var n=u[c(t)];return n==f||n!=a&&("function"==typeof r?e(r):!!r)},c=i.normalize=function(t){return String(t).replace(o,".").toLowerCase()},u=i.data={},a=i.NATIVE="N",f=i.POLYFILL="P";t.exports=i},,function(t,r){t.exports=!1},function(t,r,n){var e,o,i,c=n(56),u=n(2),a=n(8),f=n(10),s=n(11),l=n(39),p=n(28),v=u.WeakMap;if(c){var d=new v,h=d.get,g=d.has,y=d.set;e=function(t,r){return y.call(d,t,r),r},o=function(t){return h.call(d,t)||{}},i=function(t){return g.call(d,t)}}else{var x=l("state");p[x]=!0,e=function(t,r){return f(t,x,r),r},o=function(t){return s(t,x)?t[x]:{}},i=function(t){return s(t,x)}}t.exports={set:e,get:o,has:i,enforce:function(t){return i(t)?o(t):e(t,{})},getterFor:function(t){return function(r){var n;if(!a(r)||(n=o(r)).type!==t)throw TypeError("Incompatible receiver, "+t+" required");return n}}}},function(t,r,n){var e=n(2),o=n(33),i=e.WeakMap;t.exports="function"===typeof i&&/native code/.test(o.call(i))},function(t,r,n){var e=n(11),o=n(58),i=n(31),c=n(18);t.exports=function(t,r){for(var n=o(r),u=c.f,a=i.f,f=0;f<n.length;f++){var s=n[f];e(t,s)||u(t,s,a(r,s))}}},function(t,r,n){var e=n(37),o=n(50),i=n(51),c=n(13);t.exports=e("Reflect","ownKeys")||function(t){var r=o.f(c(t)),n=i.f;return n?r.concat(n(t)):r}},function(t,r,n){t.exports=n(2)},function(t,r,n){var e=n(47);t.exports=function(t,r,n){if(e(t),void 0===r)return t;switch(n){case 0:return function(){return t.call(r)};case 1:return function(n){return t.call(r,n)};case 2:return function(n,e){return t.call(r,n,e)};case 3:return function(n,e,o){return t.call(r,n,e,o)}}return function(){return t.apply(r,arguments)}}},function(t,r,n){var e=n(4);t.exports=!!Object.getOwnPropertySymbols&&!e((function(){return!String(Symbol())}))},function(t,r,n){var e=n(35),o=n(29);t.exports=Object.keys||function(t){return e(t,o)}},,,function(t,r,n){"use strict";var e=n(76),o=RegExp.prototype.exec,i=String.prototype.replace,c=o,u=function(){var t=/a/,r=/b*/g;return o.call(t,"a"),o.call(r,"a"),0!==t.lastIndex||0!==r.lastIndex}(),a=void 0!==/()??/.exec("")[1];(u||a)&&(c=function(t){var r,n,c,f,s=this;return a&&(n=new RegExp("^"+s.source+"$(?!\\s)",e.call(s))),u&&(r=s.lastIndex),c=o.call(s,t),u&&c&&(s.lastIndex=s.global?c.index+c[0].length:r),a&&c&&c.length>1&&i.call(c[0],n,(function(){for(f=1;f<arguments.length-2;f++)void 0===arguments[f]&&(c[f]=void 0)})),c}),t.exports=c},,,,,function(t,r,n){"use strict";var e=n(4);t.exports=function(t,r){var n=[][t];return!n||!e((function(){n.call(null,r||function(){throw 1},1)}))}},function(t,r,n){var e=n(17),o=n(72),i=n(10),c=e("unscopables"),u=Array.prototype;void 0==u[c]&&i(u,c,o(null)),t.exports=function(t){u[c][t]=!0}},function(t,r,n){var e=n(13),o=n(73),i=n(29),c=n(28),u=n(74),a=n(38),f=n(39)("IE_PROTO"),s=function(){},l=function(){var t,r=a("iframe"),n=i.length;for(r.style.display="none",u.appendChild(r),r.src=String("javascript:"),(t=r.contentWindow.document).open(),t.write("<script>document.F=Object<\/script>"),t.close(),l=t.F;n--;)delete l.prototype[i[n]];return l()};t.exports=Object.create||function(t,r){var n;return null!==t?(s.prototype=e(t),n=new s,s.prototype=null,n[f]=t):n=l(),void 0===r?n:o(n,r)},c[f]=!0},function(t,r,n){var e=n(9),o=n(18),i=n(13),c=n(62);t.exports=e?Object.defineProperties:function(t,r){i(t);for(var n,e=c(r),u=e.length,a=0;u>a;)o.f(t,n=e[a++],r[n]);return t}},function(t,r,n){var e=n(37);t.exports=e("document","documentElement")},,function(t,r,n){"use strict";var e=n(13);t.exports=function(){var t=e(this),r="";return t.global&&(r+="g"),t.ignoreCase&&(r+="i"),t.multiline&&(r+="m"),t.dotAll&&(r+="s"),t.unicode&&(r+="u"),t.sticky&&(r+="y"),r}},,,,function(t,r,n){"use strict";var e=n(10),o=n(36),i=n(4),c=n(17),u=n(65),a=c("species"),f=!i((function(){var t=/./;return t.exec=function(){var t=[];return t.groups={a:"7"},t},"7"!=="".replace(t,"$<a>")})),s=!i((function(){var t=/(?:)/,r=t.exec;t.exec=function(){return r.apply(this,arguments)};var n="ab".split(t);return 2!==n.length||"a"!==n[0]||"b"!==n[1]}));t.exports=function(t,r,n,l){var p=c(t),v=!i((function(){var r={};return r[p]=function(){return 7},7!=""[t](r)})),d=v&&!i((function(){var r=!1,n=/a/;return n.exec=function(){return r=!0,null},"split"===t&&(n.constructor={},n.constructor[a]=function(){return n}),n[p](""),!r}));if(!v||!d||"replace"===t&&!f||"split"===t&&!s){var h=/./[p],g=n(p,""[t],(function(t,r,n,e,o){return r.exec===u?v&&!o?{done:!0,value:h.call(r,n,e)}:{done:!0,value:t.call(n,r,e)}:{done:!1}})),y=g[0],x=g[1];o(String.prototype,t,y),o(RegExp.prototype,p,2==r?function(t,r){return x.call(t,this,r)}:function(t){return x.call(t,this)}),l&&e(RegExp.prototype[p],"sham",!0)}}},function(t,r,n){var e=n(24),o=n(65);t.exports=function(t,r){var n=t.exec;if("function"===typeof n){var i=n.call(t,r);if("object"!==typeof i)throw TypeError("RegExp exec method returned something other than an Object or null");return i}if("RegExp"!==e(t))throw TypeError("RegExp#exec called on incompatible receiver");return o.call(t,r)}},,,,,,,function(t,r,n){"use strict";var e=n(12),o=n(65);e({target:"RegExp",proto:!0,forced:/./.exec!==o},{exec:o})},function(t,r,n){"use strict";var e=n(80),o=n(13),i=n(25),c=n(20),u=n(22),a=n(16),f=n(90),s=n(81),l=Math.max,p=Math.min,v=Math.floor,d=/\$([$&'`]|\d\d?|<[^>]*>)/g,h=/\$([$&'`]|\d\d?)/g;e("replace",2,(function(t,r,n){return[function(n,e){var o=a(this),i=void 0==n?void 0:n[t];return void 0!==i?i.call(n,o,e):r.call(String(o),n,e)},function(t,i){var a=n(r,t,this,i);if(a.done)return a.value;var v=o(t),d=String(this),h="function"===typeof i;h||(i=String(i));var g=v.global;if(g){var y=v.unicode;v.lastIndex=0}for(var x=[];;){var b=s(v,d);if(null===b)break;if(x.push(b),!g)break;""===String(b[0])&&(v.lastIndex=f(d,c(v.lastIndex),y))}for(var m,S="",O=0,w=0;w<x.length;w++){b=x[w];for(var E=String(b[0]),j=l(p(u(b.index),d.length),0),L=[],T=1;T<b.length;T++)L.push(void 0===(m=b[T])?m:String(m));var A=b.groups;if(h){var M=[E].concat(L,j,d);void 0!==A&&M.push(A);var P=String(i.apply(void 0,M))}else P=e(E,d,j,L,A,i);j>=O&&(S+=d.slice(O,j)+P,O=j+E.length)}return S+d.slice(O)}];function e(t,n,e,o,c,u){var a=e+t.length,f=o.length,s=h;return void 0!==c&&(c=i(c),s=d),r.call(u,s,(function(r,i){var u;switch(i.charAt(0)){case"$":return"$";case"&":return t;case"`":return n.slice(0,e);case"'":return n.slice(a);case"<":u=c[i.slice(1,-1)];break;default:var s=+i;if(0===s)return r;if(s>f){var l=v(s/10);return 0===l?r:l<=f?void 0===o[l-1]?i.charAt(1):o[l-1]+i.charAt(1):r}u=o[s-1]}return void 0===u?"":u}))}}))},function(t,r,n){"use strict";var e=n(91).charAt;t.exports=function(t,r,n){return r+(n?e(t,r).length:1)}},function(t,r,n){var e=n(22),o=n(16),i=function(t){return function(r,n){var i,c,u=String(o(r)),a=e(n),f=u.length;return a<0||a>=f?t?"":void 0:(i=u.charCodeAt(a))<55296||i>56319||a+1===f||(c=u.charCodeAt(a+1))<56320||c>57343?t?u.charAt(a):i:t?u.slice(a,a+2):c-56320+(i-55296<<10)+65536}};t.exports={codeAt:i(!1),charAt:i(!0)}},function(t,r,n){"use strict";var e=n(44).forEach,o=n(70);t.exports=o("forEach")?function(t){return e(this,t,arguments.length>1?arguments[1]:void 0)}:[].forEach},,,,,,,,,,,,,,,,,,,,,,function(t,r,n){var e=n(8),o=n(24),i=n(17)("match");t.exports=function(t){var r;return e(t)&&(void 0!==(r=t[i])?!!r:"RegExp"==o(t))}},function(t,r,n){"use strict";var e=n(12),o=n(92);e({target:"Array",proto:!0,forced:[].forEach!=o},{forEach:o})},function(t,r,n){var e=n(2),o=n(117),i=n(92),c=n(10);for(var u in o){var a=e[u],f=a&&a.prototype;if(f&&f.forEach!==i)try{c(f,"forEach",i)}catch(t){f.forEach=i}}},function(t,r){t.exports={CSSRuleList:0,CSSStyleDeclaration:0,CSSValueList:0,ClientRectList:0,DOMRectList:0,DOMStringList:0,DOMTokenList:1,DataTransferItemList:0,FileList:0,HTMLAllCollection:0,HTMLCollection:0,HTMLFormElement:0,HTMLSelectElement:0,MediaList:0,MimeTypeArray:0,NamedNodeMap:0,NodeList:1,PaintRequestList:0,Plugin:0,PluginArray:0,SVGLengthList:0,SVGNumberList:0,SVGPathSegList:0,SVGPointList:0,SVGStringList:0,SVGTransformList:0,SourceBufferList:0,StyleSheetList:0,TextTrackCueList:0,TextTrackList:0,TouchList:0}},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,function(t,r){t.exports=_},,,,,,,,,,,,,,,,,,,,function(t,r,n){"use strict";n.r(r);n(115),n(293),n(88),n(294),n(89),n(116);var e=n(7),o=n.n(e),i=n(272),c=n.n(i),u=document.querySelectorAll(".widget_ep-facet .terms");o()(u).on("keyup",".facet-search",c.a.debounce((function(t){if(13!==t.keyCode){var r=t.currentTarget.value.replace(/\s/g,"").toLowerCase();t.delegateTarget.querySelectorAll(".term").forEach((function(t){var n=t.getAttribute("data-term-slug");t.getAttribute("data-term-name").includes(r)||n.includes(r)?t.classList.remove("hide"):t.classList.add("hide")}))}}),200))},function(t,r,n){"use strict";var e=n(12),o=n(46).includes,i=n(71);e({target:"Array",proto:!0},{includes:function(t){return o(this,t,arguments.length>1?arguments[1]:void 0)}}),i("includes")},function(t,r,n){"use strict";var e=n(12),o=n(295),i=n(16);e({target:"String",proto:!0,forced:!n(296)("includes")},{includes:function(t){return!!~String(i(this)).indexOf(o(t),arguments.length>1?arguments[1]:void 0)}})},function(t,r,n){var e=n(114);t.exports=function(t){if(e(t))throw TypeError("The method doesn't accept regular expressions");return t}},function(t,r,n){var e=n(17)("match");t.exports=function(t){var r=/./;try{"/./"[t](r)}catch(n){try{return r[e]=!1,"/./"[t](r)}catch(t){}}return!1}}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZmFpbHMuanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwialF1ZXJ5XCIiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2lzLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZGVzY3JpcHRvcnMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2hpZGUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2hhcy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZXhwb3J0LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hbi1vYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3NoYXJlZC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvcmVxdWlyZS1vYmplY3QtY29lcmNpYmxlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0eS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdG8taW5kZXhlZC1vYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3RvLWxlbmd0aC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdG8taW50ZWdlci5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvc2V0LWdsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvY2xhc3NvZi1yYXcuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3RvLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5LWRlc2NyaXB0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3RvLXByaW1pdGl2ZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaGlkZGVuLWtleXMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2VudW0tYnVnLWtleXMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2luZGV4ZWQtb2JqZWN0LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pZTgtZG9tLWRlZmluZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZnVuY3Rpb24tdG8tc3RyaW5nLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy91aWQuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1rZXlzLWludGVybmFsLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9yZWRlZmluZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZ2V0LWJ1aWx0LWluLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9kb2N1bWVudC1jcmVhdGUtZWxlbWVudC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvc2hhcmVkLWtleS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdG8tYWJzb2x1dGUtaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2FycmF5LXNwZWNpZXMtY3JlYXRlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pcy1hcnJheS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYXJyYXktaXRlcmF0aW9uLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtcHJvcGVydHktaXMtZW51bWVyYWJsZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYXJyYXktaW5jbHVkZXMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2EtZnVuY3Rpb24uanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktbmFtZXMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LXN5bWJvbHMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2lzLWZvcmNlZC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaXMtcHVyZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaW50ZXJuYWwtc3RhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL25hdGl2ZS13ZWFrLW1hcC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvY29weS1jb25zdHJ1Y3Rvci1wcm9wZXJ0aWVzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vd24ta2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvcGF0aC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYmluZC1jb250ZXh0LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9uYXRpdmUtc3ltYm9sLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3Qta2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvcmVnZXhwLWV4ZWMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3Nsb3BweS1hcnJheS1tZXRob2QuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2FkZC10by11bnNjb3BhYmxlcy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWNyZWF0ZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0aWVzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9odG1sLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9yZWdleHAtZmxhZ3MuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2ZpeC1yZWdleHAtd2VsbC1rbm93bi1zeW1ib2wtbG9naWMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3JlZ2V4cC1leGVjLWFic3RyYWN0LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMucmVnZXhwLmV4ZWMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lcy5zdHJpbmcucmVwbGFjZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYWR2YW5jZS1zdHJpbmctaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3N0cmluZy1tdWx0aWJ5dGUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2FycmF5LWZvci1lYWNoLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pcy1yZWdleHAuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lcy5hcnJheS5mb3ItZWFjaC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL3dlYi5kb20tY29sbGVjdGlvbnMuZm9yLWVhY2guanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2RvbS1pdGVyYWJsZXMuanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiX1wiIiwid2VicGFjazovLy8uL2Fzc2V0cy9qcy9mYWNldHMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lcy5hcnJheS5pbmNsdWRlcy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLnN0cmluZy5pbmNsdWRlcy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvbm90LWEtcmVnZXhwLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9jb3JyZWN0LWlzLXJlZ2V4cC1sb2dpYy5qcyJdLCJuYW1lcyI6WyJpbnN0YWxsZWRNb2R1bGVzIiwiX193ZWJwYWNrX3JlcXVpcmVfXyIsIm1vZHVsZUlkIiwiZXhwb3J0cyIsIm1vZHVsZSIsImkiLCJsIiwibW9kdWxlcyIsImNhbGwiLCJtIiwiYyIsImQiLCJuYW1lIiwiZ2V0dGVyIiwibyIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiZW51bWVyYWJsZSIsImdldCIsInIiLCJTeW1ib2wiLCJ0b1N0cmluZ1RhZyIsInZhbHVlIiwidCIsIm1vZGUiLCJfX2VzTW9kdWxlIiwibnMiLCJjcmVhdGUiLCJrZXkiLCJiaW5kIiwibiIsIm9iamVjdCIsInByb3BlcnR5IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJwIiwicyIsImNoZWNrIiwiaXQiLCJNYXRoIiwiZ2xvYmFsVGhpcyIsIk8iLCJ3aW5kb3ciLCJzZWxmIiwiZ2xvYmFsIiwiRnVuY3Rpb24iLCJleGVjIiwiZXJyb3IiLCJqUXVlcnkiLCJmYWlscyIsImEiLCJERVNDUklQVE9SUyIsImRlZmluZVByb3BlcnR5TW9kdWxlIiwiY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yIiwiZiIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsImhpZGUiLCJyZWRlZmluZSIsInNldEdsb2JhbCIsImNvcHlDb25zdHJ1Y3RvclByb3BlcnRpZXMiLCJpc0ZvcmNlZCIsIm9wdGlvbnMiLCJzb3VyY2UiLCJ0YXJnZXQiLCJ0YXJnZXRQcm9wZXJ0eSIsInNvdXJjZVByb3BlcnR5IiwiZGVzY3JpcHRvciIsIlRBUkdFVCIsIkdMT0JBTCIsIlNUQVRJQyIsInN0YXQiLCJub1RhcmdldEdldCIsImZvcmNlZCIsInVuZGVmaW5lZCIsInNoYW0iLCJpc09iamVjdCIsIlR5cGVFcnJvciIsIlN0cmluZyIsIklTX1BVUkUiLCJzdG9yZSIsInB1c2giLCJ2ZXJzaW9uIiwiY29weXJpZ2h0Iiwic2hhcmVkIiwidWlkIiwiTkFUSVZFX1NZTUJPTCIsIklFOF9ET01fREVGSU5FIiwiYW5PYmplY3QiLCJ0b1ByaW1pdGl2ZSIsIm5hdGl2ZURlZmluZVByb3BlcnR5IiwiUCIsIkF0dHJpYnV0ZXMiLCJJbmRleGVkT2JqZWN0IiwicmVxdWlyZU9iamVjdENvZXJjaWJsZSIsInRvSW50ZWdlciIsIm1pbiIsImFyZ3VtZW50IiwiY2VpbCIsImZsb29yIiwiaXNOYU4iLCJ0b1N0cmluZyIsInNsaWNlIiwiYml0bWFwIiwiY29uZmlndXJhYmxlIiwid3JpdGFibGUiLCJpbnB1dCIsIlBSRUZFUlJFRF9TVFJJTkciLCJmbiIsInZhbCIsInZhbHVlT2YiLCJjbGFzc29mIiwic3BsaXQiLCJwcm9wZXJ0eUlzRW51bWVyYWJsZSIsInByb3BlcnR5SXNFbnVtZXJhYmxlTW9kdWxlIiwidG9JbmRleGVkT2JqZWN0IiwiaGFzIiwibmF0aXZlR2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwiY3JlYXRlRWxlbWVudCIsImlkIiwicG9zdGZpeCIsInJhbmRvbSIsImluZGV4T2YiLCJoaWRkZW5LZXlzIiwibmFtZXMiLCJyZXN1bHQiLCJsZW5ndGgiLCJuYXRpdmVGdW5jdGlvblRvU3RyaW5nIiwiSW50ZXJuYWxTdGF0ZU1vZHVsZSIsImdldEludGVybmFsU3RhdGUiLCJlbmZvcmNlSW50ZXJuYWxTdGF0ZSIsImVuZm9yY2UiLCJURU1QTEFURSIsInVuc2FmZSIsInNpbXBsZSIsImpvaW4iLCJ0aGlzIiwicGF0aCIsImFGdW5jdGlvbiIsInZhcmlhYmxlIiwibmFtZXNwYWNlIiwibWV0aG9kIiwiYXJndW1lbnRzIiwiZG9jdW1lbnQiLCJFWElTVFMiLCJrZXlzIiwibWF4IiwiaW5kZXgiLCJpbnRlZ2VyIiwiaXNBcnJheSIsIlNQRUNJRVMiLCJ3ZWxsS25vd25TeW1ib2wiLCJvcmlnaW5hbEFycmF5IiwiQyIsImNvbnN0cnVjdG9yIiwiQXJyYXkiLCJhcmciLCJ0b09iamVjdCIsInRvTGVuZ3RoIiwiYXJyYXlTcGVjaWVzQ3JlYXRlIiwiY3JlYXRlTWV0aG9kIiwiVFlQRSIsIklTX01BUCIsIklTX0ZJTFRFUiIsIklTX1NPTUUiLCJJU19FVkVSWSIsIklTX0ZJTkRfSU5ERVgiLCJOT19IT0xFUyIsIiR0aGlzIiwiY2FsbGJhY2tmbiIsInRoYXQiLCJzcGVjaWZpY0NyZWF0ZSIsImJvdW5kRnVuY3Rpb24iLCJmb3JFYWNoIiwibWFwIiwiZmlsdGVyIiwic29tZSIsImV2ZXJ5IiwiZmluZCIsImZpbmRJbmRleCIsIm5hdGl2ZVByb3BlcnR5SXNFbnVtZXJhYmxlIiwiTkFTSE9STl9CVUciLCIxIiwiViIsInRvQWJzb2x1dGVJbmRleCIsIklTX0lOQ0xVREVTIiwiZWwiLCJmcm9tSW5kZXgiLCJpbmNsdWRlcyIsImciLCJlIiwiaW50ZXJuYWxPYmplY3RLZXlzIiwiY29uY2F0IiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsImdldE93blByb3BlcnR5U3ltYm9scyIsInJlcGxhY2VtZW50IiwiZmVhdHVyZSIsImRldGVjdGlvbiIsImRhdGEiLCJub3JtYWxpemUiLCJQT0xZRklMTCIsIk5BVElWRSIsInN0cmluZyIsInJlcGxhY2UiLCJ0b0xvd2VyQ2FzZSIsInNldCIsIk5BVElWRV9XRUFLX01BUCIsIm9iamVjdEhhcyIsInNoYXJlZEtleSIsIldlYWtNYXAiLCJ3bWdldCIsIndtaGFzIiwid21zZXQiLCJtZXRhZGF0YSIsIlNUQVRFIiwiZ2V0dGVyRm9yIiwic3RhdGUiLCJ0eXBlIiwidGVzdCIsIm93bktleXMiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JNb2R1bGUiLCJnZXRCdWlsdEluIiwiZ2V0T3duUHJvcGVydHlOYW1lc01vZHVsZSIsImdldE93blByb3BlcnR5U3ltYm9sc01vZHVsZSIsImIiLCJhcHBseSIsImVudW1CdWdLZXlzIiwicmVnZXhwRmxhZ3MiLCJuYXRpdmVFeGVjIiwiUmVnRXhwIiwibmF0aXZlUmVwbGFjZSIsInBhdGNoZWRFeGVjIiwiVVBEQVRFU19MQVNUX0lOREVYX1dST05HIiwicmUxIiwicmUyIiwibGFzdEluZGV4IiwiTlBDR19JTkNMVURFRCIsInN0ciIsInJlQ29weSIsIm1hdGNoIiwicmUiLCJNRVRIT0RfTkFNRSIsIlVOU0NPUEFCTEVTIiwiQXJyYXlQcm90b3R5cGUiLCJkZWZpbmVQcm9wZXJ0aWVzIiwiaHRtbCIsImRvY3VtZW50Q3JlYXRlRWxlbWVudCIsIklFX1BST1RPIiwiRW1wdHkiLCJjcmVhdGVEaWN0IiwiaWZyYW1lRG9jdW1lbnQiLCJpZnJhbWUiLCJzdHlsZSIsImRpc3BsYXkiLCJhcHBlbmRDaGlsZCIsInNyYyIsImNvbnRlbnRXaW5kb3ciLCJvcGVuIiwid3JpdGUiLCJsdCIsImNsb3NlIiwiRiIsIlByb3BlcnRpZXMiLCJvYmplY3RLZXlzIiwiaWdub3JlQ2FzZSIsIm11bHRpbGluZSIsImRvdEFsbCIsInVuaWNvZGUiLCJzdGlja3kiLCJyZWdleHBFeGVjIiwiUkVQTEFDRV9TVVBQT1JUU19OQU1FRF9HUk9VUFMiLCJncm91cHMiLCJTUExJVF9XT1JLU19XSVRIX09WRVJXUklUVEVOX0VYRUMiLCJvcmlnaW5hbEV4ZWMiLCJLRVkiLCJTWU1CT0wiLCJERUxFR0FURVNfVE9fU1lNQk9MIiwiREVMRUdBVEVTX1RPX0VYRUMiLCJleGVjQ2FsbGVkIiwibmF0aXZlUmVnRXhwTWV0aG9kIiwibWV0aG9kcyIsIm5hdGl2ZU1ldGhvZCIsInJlZ2V4cCIsImFyZzIiLCJmb3JjZVN0cmluZ01ldGhvZCIsImRvbmUiLCJzdHJpbmdNZXRob2QiLCJyZWdleE1ldGhvZCIsIlIiLCJTIiwiJCIsInByb3RvIiwiZml4UmVnRXhwV2VsbEtub3duU3ltYm9sTG9naWMiLCJhZHZhbmNlU3RyaW5nSW5kZXgiLCJyZWdFeHBFeGVjIiwiU1VCU1RJVFVUSU9OX1NZTUJPTFMiLCJTVUJTVElUVVRJT05fU1lNQk9MU19OT19OQU1FRCIsIlJFUExBQ0UiLCJtYXliZUNhbGxOYXRpdmUiLCJzZWFyY2hWYWx1ZSIsInJlcGxhY2VWYWx1ZSIsInJlcGxhY2VyIiwicmVzIiwicngiLCJmdW5jdGlvbmFsUmVwbGFjZSIsImZ1bGxVbmljb2RlIiwicmVzdWx0cyIsImFjY3VtdWxhdGVkUmVzdWx0IiwibmV4dFNvdXJjZVBvc2l0aW9uIiwibWF0Y2hlZCIsInBvc2l0aW9uIiwiY2FwdHVyZXMiLCJqIiwibmFtZWRDYXB0dXJlcyIsInJlcGxhY2VyQXJncyIsImdldFN1YnN0aXR1dGlvbiIsInRhaWxQb3MiLCJzeW1ib2xzIiwiY2giLCJjYXB0dXJlIiwiY2hhckF0IiwiQ09OVkVSVF9UT19TVFJJTkciLCJwb3MiLCJmaXJzdCIsInNlY29uZCIsInNpemUiLCJjaGFyQ29kZUF0IiwiY29kZUF0IiwiJGZvckVhY2giLCJzbG9wcHlBcnJheU1ldGhvZCIsIk1BVENIIiwiaXNSZWdFeHAiLCJET01JdGVyYWJsZXMiLCJDT0xMRUNUSU9OX05BTUUiLCJDb2xsZWN0aW9uIiwiQ29sbGVjdGlvblByb3RvdHlwZSIsIkNTU1J1bGVMaXN0IiwiQ1NTU3R5bGVEZWNsYXJhdGlvbiIsIkNTU1ZhbHVlTGlzdCIsIkNsaWVudFJlY3RMaXN0IiwiRE9NUmVjdExpc3QiLCJET01TdHJpbmdMaXN0IiwiRE9NVG9rZW5MaXN0IiwiRGF0YVRyYW5zZmVySXRlbUxpc3QiLCJGaWxlTGlzdCIsIkhUTUxBbGxDb2xsZWN0aW9uIiwiSFRNTENvbGxlY3Rpb24iLCJIVE1MRm9ybUVsZW1lbnQiLCJIVE1MU2VsZWN0RWxlbWVudCIsIk1lZGlhTGlzdCIsIk1pbWVUeXBlQXJyYXkiLCJOYW1lZE5vZGVNYXAiLCJOb2RlTGlzdCIsIlBhaW50UmVxdWVzdExpc3QiLCJQbHVnaW4iLCJQbHVnaW5BcnJheSIsIlNWR0xlbmd0aExpc3QiLCJTVkdOdW1iZXJMaXN0IiwiU1ZHUGF0aFNlZ0xpc3QiLCJTVkdQb2ludExpc3QiLCJTVkdTdHJpbmdMaXN0IiwiU1ZHVHJhbnNmb3JtTGlzdCIsIlNvdXJjZUJ1ZmZlckxpc3QiLCJTdHlsZVNoZWV0TGlzdCIsIlRleHRUcmFja0N1ZUxpc3QiLCJUZXh0VHJhY2tMaXN0IiwiVG91Y2hMaXN0IiwiXyIsImZhY2V0VGVybXMiLCJxdWVyeVNlbGVjdG9yQWxsIiwib24iLCJkZWJvdW5jZSIsImV2ZW50Iiwia2V5Q29kZSIsInNlYXJjaFRlcm0iLCJjdXJyZW50VGFyZ2V0IiwiZGVsZWdhdGVUYXJnZXQiLCJ0ZXJtIiwic2x1ZyIsImdldEF0dHJpYnV0ZSIsImNsYXNzTGlzdCIsInJlbW92ZSIsImFkZCIsIiRpbmNsdWRlcyIsImFkZFRvVW5zY29wYWJsZXMiLCJub3RBUmVnRXhwIiwiY29ycmVjdElzUmVnRXhwTG9naWMiLCJzZWFyY2hTdHJpbmciXSwibWFwcGluZ3MiOiJhQUNFLElBQUlBLEVBQW1CLEdBR3ZCLFNBQVNDLEVBQW9CQyxHQUc1QixHQUFHRixFQUFpQkUsR0FDbkIsT0FBT0YsRUFBaUJFLEdBQVVDLFFBR25DLElBQUlDLEVBQVNKLEVBQWlCRSxHQUFZLENBQ3pDRyxFQUFHSCxFQUNISSxHQUFHLEVBQ0hILFFBQVMsSUFVVixPQU5BSSxFQUFRTCxHQUFVTSxLQUFLSixFQUFPRCxRQUFTQyxFQUFRQSxFQUFPRCxRQUFTRixHQUcvREcsRUFBT0UsR0FBSSxFQUdKRixFQUFPRCxRQUtmRixFQUFvQlEsRUFBSUYsRUFHeEJOLEVBQW9CUyxFQUFJVixFQUd4QkMsRUFBb0JVLEVBQUksU0FBU1IsRUFBU1Ms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RUFBUSxJQUkvQjlGLEVBQUUsQ0FBRWxPLE9BQVEsUUFBU21PLE9BQU8sR0FBUSxDQUNsQ3ZHLFNBQVUsU0FBa0JGLEdBQzFCLE9BQU9xTSxFQUFVdlAsS0FBTWtELEVBQUk1QyxVQUFVaEIsT0FBUyxFQUFJZ0IsVUFBVSxRQUFLcEUsTUFLckVzVCxFQUFpQixhLDZCQ2JqQixJQUFJOUYsRUFBSSxFQUFRLElBQ1orRixFQUFhLEVBQVEsS0FDckJuUyxFQUF5QixFQUFRLElBS3JDb00sRUFBRSxDQUFFbE8sT0FBUSxTQUFVbU8sT0FBTyxFQUFNMU4sUUFKUixFQUFRLElBSVN5VCxDQUFxQixhQUFlLENBQzlFdE0sU0FBVSxTQUFrQnVNLEdBQzFCLFNBQVVyVCxPQUFPZ0IsRUFBdUIwQyxPQUNyQ2QsUUFBUXVRLEVBQVdFLEdBQWVyUCxVQUFVaEIsT0FBUyxFQUFJZ0IsVUFBVSxRQUFLcEUsTyxnQkNYL0UsSUFBSWlRLEVBQVcsRUFBUSxLQUV2QnRVLEVBQU9ELFFBQVUsU0FBVW1DLEdBQ3pCLEdBQUlvUyxFQUFTcFMsR0FDWCxNQUFNc0MsVUFBVSxpREFDaEIsT0FBT3RDLEksZ0JDTFgsSUFFSW1TLEVBRmtCLEVBQVEsR0FFbEJuTCxDQUFnQixTQUU1QmxKLEVBQU9ELFFBQVUsU0FBVTZPLEdBQ3pCLElBQUl5QyxFQUFTLElBQ2IsSUFDRSxNQUFNekMsR0FBYXlDLEdBQ25CLE1BQU81RixHQUNQLElBRUUsT0FEQTRGLEVBQU9nRCxJQUFTLEVBQ1QsTUFBTXpGLEdBQWF5QyxHQUMxQixNQUFPbk8sS0FDVCxPQUFPIiwiZmlsZSI6ImpzL2ZhY2V0cy1zY3JpcHQubWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDI5Mik7XG4iLCJ2YXIgTyA9ICdvYmplY3QnO1xudmFyIGNoZWNrID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpdCAmJiBpdC5NYXRoID09IE1hdGggJiYgaXQ7XG59O1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvODYjaXNzdWVjb21tZW50LTExNTc1OTAyOFxubW9kdWxlLmV4cG9ydHMgPVxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgY2hlY2sodHlwZW9mIGdsb2JhbFRoaXMgPT0gTyAmJiBnbG9iYWxUaGlzKSB8fFxuICBjaGVjayh0eXBlb2Ygd2luZG93ID09IE8gJiYgd2luZG93KSB8fFxuICBjaGVjayh0eXBlb2Ygc2VsZiA9PSBPICYmIHNlbGYpIHx8XG4gIGNoZWNrKHR5cGVvZiBnbG9iYWwgPT0gTyAmJiBnbG9iYWwpIHx8XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1uZXctZnVuY1xuICBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhlYykge1xuICB0cnkge1xuICAgIHJldHVybiAhIWV4ZWMoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0galF1ZXJ5OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0eXBlb2YgaXQgPT09ICdvYmplY3QnID8gaXQgIT09IG51bGwgOiB0eXBlb2YgaXQgPT09ICdmdW5jdGlvbic7XG59O1xuIiwidmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG5cbi8vIFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHlcbm1vZHVsZS5leHBvcnRzID0gIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gNzsgfSB9KS5hICE9IDc7XG59KTtcbiIsInZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIGRlZmluZVByb3BlcnR5TW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydHknKTtcbnZhciBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBERVNDUklQVE9SUyA/IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIGRlZmluZVByb3BlcnR5TW9kdWxlLmYob2JqZWN0LCBrZXksIGNyZWF0ZVByb3BlcnR5RGVzY3JpcHRvcigxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn07XG4iLCJ2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIGtleSkge1xuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yJykuZjtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hpZGUnKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWRlZmluZScpO1xudmFyIHNldEdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zZXQtZ2xvYmFsJyk7XG52YXIgY29weUNvbnN0cnVjdG9yUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jb3B5LWNvbnN0cnVjdG9yLXByb3BlcnRpZXMnKTtcbnZhciBpc0ZvcmNlZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1mb3JjZWQnKTtcblxuLypcbiAgb3B0aW9ucy50YXJnZXQgICAgICAtIG5hbWUgb2YgdGhlIHRhcmdldCBvYmplY3RcbiAgb3B0aW9ucy5nbG9iYWwgICAgICAtIHRhcmdldCBpcyB0aGUgZ2xvYmFsIG9iamVjdFxuICBvcHRpb25zLnN0YXQgICAgICAgIC0gZXhwb3J0IGFzIHN0YXRpYyBtZXRob2RzIG9mIHRhcmdldFxuICBvcHRpb25zLnByb3RvICAgICAgIC0gZXhwb3J0IGFzIHByb3RvdHlwZSBtZXRob2RzIG9mIHRhcmdldFxuICBvcHRpb25zLnJlYWwgICAgICAgIC0gcmVhbCBwcm90b3R5cGUgbWV0aG9kIGZvciB0aGUgYHB1cmVgIHZlcnNpb25cbiAgb3B0aW9ucy5mb3JjZWQgICAgICAtIGV4cG9ydCBldmVuIGlmIHRoZSBuYXRpdmUgZmVhdHVyZSBpcyBhdmFpbGFibGVcbiAgb3B0aW9ucy5iaW5kICAgICAgICAtIGJpbmQgbWV0aG9kcyB0byB0aGUgdGFyZ2V0LCByZXF1aXJlZCBmb3IgdGhlIGBwdXJlYCB2ZXJzaW9uXG4gIG9wdGlvbnMud3JhcCAgICAgICAgLSB3cmFwIGNvbnN0cnVjdG9ycyB0byBwcmV2ZW50aW5nIGdsb2JhbCBwb2xsdXRpb24sIHJlcXVpcmVkIGZvciB0aGUgYHB1cmVgIHZlcnNpb25cbiAgb3B0aW9ucy51bnNhZmUgICAgICAtIHVzZSB0aGUgc2ltcGxlIGFzc2lnbm1lbnQgb2YgcHJvcGVydHkgaW5zdGVhZCBvZiBkZWxldGUgKyBkZWZpbmVQcm9wZXJ0eVxuICBvcHRpb25zLnNoYW0gICAgICAgIC0gYWRkIGEgZmxhZyB0byBub3QgY29tcGxldGVseSBmdWxsIHBvbHlmaWxsc1xuICBvcHRpb25zLmVudW1lcmFibGUgIC0gZXhwb3J0IGFzIGVudW1lcmFibGUgcHJvcGVydHlcbiAgb3B0aW9ucy5ub1RhcmdldEdldCAtIHByZXZlbnQgY2FsbGluZyBhIGdldHRlciBvbiB0YXJnZXRcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcHRpb25zLCBzb3VyY2UpIHtcbiAgdmFyIFRBUkdFVCA9IG9wdGlvbnMudGFyZ2V0O1xuICB2YXIgR0xPQkFMID0gb3B0aW9ucy5nbG9iYWw7XG4gIHZhciBTVEFUSUMgPSBvcHRpb25zLnN0YXQ7XG4gIHZhciBGT1JDRUQsIHRhcmdldCwga2V5LCB0YXJnZXRQcm9wZXJ0eSwgc291cmNlUHJvcGVydHksIGRlc2NyaXB0b3I7XG4gIGlmIChHTE9CQUwpIHtcbiAgICB0YXJnZXQgPSBnbG9iYWw7XG4gIH0gZWxzZSBpZiAoU1RBVElDKSB7XG4gICAgdGFyZ2V0ID0gZ2xvYmFsW1RBUkdFVF0gfHwgc2V0R2xvYmFsKFRBUkdFVCwge30pO1xuICB9IGVsc2Uge1xuICAgIHRhcmdldCA9IChnbG9iYWxbVEFSR0VUXSB8fCB7fSkucHJvdG90eXBlO1xuICB9XG4gIGlmICh0YXJnZXQpIGZvciAoa2V5IGluIHNvdXJjZSkge1xuICAgIHNvdXJjZVByb3BlcnR5ID0gc291cmNlW2tleV07XG4gICAgaWYgKG9wdGlvbnMubm9UYXJnZXRHZXQpIHtcbiAgICAgIGRlc2NyaXB0b3IgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpO1xuICAgICAgdGFyZ2V0UHJvcGVydHkgPSBkZXNjcmlwdG9yICYmIGRlc2NyaXB0b3IudmFsdWU7XG4gICAgfSBlbHNlIHRhcmdldFByb3BlcnR5ID0gdGFyZ2V0W2tleV07XG4gICAgRk9SQ0VEID0gaXNGb3JjZWQoR0xPQkFMID8ga2V5IDogVEFSR0VUICsgKFNUQVRJQyA/ICcuJyA6ICcjJykgKyBrZXksIG9wdGlvbnMuZm9yY2VkKTtcbiAgICAvLyBjb250YWluZWQgaW4gdGFyZ2V0XG4gICAgaWYgKCFGT1JDRUQgJiYgdGFyZ2V0UHJvcGVydHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHR5cGVvZiBzb3VyY2VQcm9wZXJ0eSA9PT0gdHlwZW9mIHRhcmdldFByb3BlcnR5KSBjb250aW51ZTtcbiAgICAgIGNvcHlDb25zdHJ1Y3RvclByb3BlcnRpZXMoc291cmNlUHJvcGVydHksIHRhcmdldFByb3BlcnR5KTtcbiAgICB9XG4gICAgLy8gYWRkIGEgZmxhZyB0byBub3QgY29tcGxldGVseSBmdWxsIHBvbHlmaWxsc1xuICAgIGlmIChvcHRpb25zLnNoYW0gfHwgKHRhcmdldFByb3BlcnR5ICYmIHRhcmdldFByb3BlcnR5LnNoYW0pKSB7XG4gICAgICBoaWRlKHNvdXJjZVByb3BlcnR5LCAnc2hhbScsIHRydWUpO1xuICAgIH1cbiAgICAvLyBleHRlbmQgZ2xvYmFsXG4gICAgcmVkZWZpbmUodGFyZ2V0LCBrZXksIHNvdXJjZVByb3BlcnR5LCBvcHRpb25zKTtcbiAgfVxufTtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKCFpc09iamVjdChpdCkpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoU3RyaW5nKGl0KSArICcgaXMgbm90IGFuIG9iamVjdCcpO1xuICB9IHJldHVybiBpdDtcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIHNldEdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zZXQtZ2xvYmFsJyk7XG52YXIgSVNfUFVSRSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1wdXJlJyk7XG5cbnZhciBTSEFSRUQgPSAnX19jb3JlLWpzX3NoYXJlZF9fJztcbnZhciBzdG9yZSA9IGdsb2JhbFtTSEFSRURdIHx8IHNldEdsb2JhbChTSEFSRUQsIHt9KTtcblxuKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIHN0b3JlW2tleV0gfHwgKHN0b3JlW2tleV0gPSB2YWx1ZSAhPT0gdW5kZWZpbmVkID8gdmFsdWUgOiB7fSk7XG59KSgndmVyc2lvbnMnLCBbXSkucHVzaCh7XG4gIHZlcnNpb246ICczLjIuMScsXG4gIG1vZGU6IElTX1BVUkUgPyAncHVyZScgOiAnZ2xvYmFsJyxcbiAgY29weXJpZ2h0OiAnwqkgMjAxOSBEZW5pcyBQdXNoa2FyZXYgKHpsb2lyb2NrLnJ1KSdcbn0pO1xuIiwiLy8gYFJlcXVpcmVPYmplY3RDb2VyY2libGVgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtcmVxdWlyZW9iamVjdGNvZXJjaWJsZVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKGl0ID09IHVuZGVmaW5lZCkgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gXCIgKyBpdCk7XG4gIHJldHVybiBpdDtcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQnKTtcbnZhciB1aWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdWlkJyk7XG52YXIgTkFUSVZFX1NZTUJPTCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9uYXRpdmUtc3ltYm9sJyk7XG5cbnZhciBTeW1ib2wgPSBnbG9iYWwuU3ltYm9sO1xudmFyIHN0b3JlID0gc2hhcmVkKCd3a3MnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gc3RvcmVbbmFtZV0gfHwgKHN0b3JlW25hbWVdID0gTkFUSVZFX1NZTUJPTCAmJiBTeW1ib2xbbmFtZV1cbiAgICB8fCAoTkFUSVZFX1NZTUJPTCA/IFN5bWJvbCA6IHVpZCkoJ1N5bWJvbC4nICsgbmFtZSkpO1xufTtcbiIsInZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2llOC1kb20tZGVmaW5lJyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tcHJpbWl0aXZlJyk7XG5cbnZhciBuYXRpdmVEZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuLy8gYE9iamVjdC5kZWZpbmVQcm9wZXJ0eWAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QuZGVmaW5lcHJvcGVydHlcbmV4cG9ydHMuZiA9IERFU0NSSVBUT1JTID8gbmF0aXZlRGVmaW5lUHJvcGVydHkgOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKSB7XG4gIGFuT2JqZWN0KE8pO1xuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XG4gIGFuT2JqZWN0KEF0dHJpYnV0ZXMpO1xuICBpZiAoSUU4X0RPTV9ERUZJTkUpIHRyeSB7XG4gICAgcmV0dXJuIG5hdGl2ZURlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpO1xuICB9IGNhdGNoIChlcnJvcikgeyAvKiBlbXB0eSAqLyB9XG4gIGlmICgnZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpIHRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQnKTtcbiAgaWYgKCd2YWx1ZScgaW4gQXR0cmlidXRlcykgT1tQXSA9IEF0dHJpYnV0ZXMudmFsdWU7XG4gIHJldHVybiBPO1xufTtcbiIsIi8vIHRvT2JqZWN0IHdpdGggZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBzdHJpbmdzXG52YXIgSW5kZXhlZE9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pbmRleGVkLW9iamVjdCcpO1xudmFyIHJlcXVpcmVPYmplY3RDb2VyY2libGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVxdWlyZS1vYmplY3QtY29lcmNpYmxlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBJbmRleGVkT2JqZWN0KHJlcXVpcmVPYmplY3RDb2VyY2libGUoaXQpKTtcbn07XG4iLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWludGVnZXInKTtcblxudmFyIG1pbiA9IE1hdGgubWluO1xuXG4vLyBgVG9MZW5ndGhgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdG9sZW5ndGhcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3VtZW50KSB7XG4gIHJldHVybiBhcmd1bWVudCA+IDAgPyBtaW4odG9JbnRlZ2VyKGFyZ3VtZW50KSwgMHgxRkZGRkZGRkZGRkZGRikgOiAwOyAvLyAyICoqIDUzIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXG59O1xuIiwidmFyIGNlaWwgPSBNYXRoLmNlaWw7XG52YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xuXG4vLyBgVG9JbnRlZ2VyYCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXRvaW50ZWdlclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJndW1lbnQpIHtcbiAgcmV0dXJuIGlzTmFOKGFyZ3VtZW50ID0gK2FyZ3VtZW50KSA/IDAgOiAoYXJndW1lbnQgPiAwID8gZmxvb3IgOiBjZWlsKShhcmd1bWVudCk7XG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hpZGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICB0cnkge1xuICAgIGhpZGUoZ2xvYmFsLCBrZXksIHZhbHVlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBnbG9iYWxba2V5XSA9IHZhbHVlO1xuICB9IHJldHVybiB2YWx1ZTtcbn07XG4iLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcbn07XG4iLCJ2YXIgcmVxdWlyZU9iamVjdENvZXJjaWJsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZXF1aXJlLW9iamVjdC1jb2VyY2libGUnKTtcblxuLy8gYFRvT2JqZWN0YCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXRvb2JqZWN0XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmd1bWVudCkge1xuICByZXR1cm4gT2JqZWN0KHJlcXVpcmVPYmplY3RDb2VyY2libGUoYXJndW1lbnQpKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChiaXRtYXAsIHZhbHVlKSB7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZTogIShiaXRtYXAgJiAxKSxcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXG4gICAgd3JpdGFibGU6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWU6IHZhbHVlXG4gIH07XG59O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xuXG4vLyBgVG9QcmltaXRpdmVgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdG9wcmltaXRpdmVcbi8vIGluc3RlYWQgb2YgdGhlIEVTNiBzcGVjIHZlcnNpb24sIHdlIGRpZG4ndCBpbXBsZW1lbnQgQEB0b1ByaW1pdGl2ZSBjYXNlXG4vLyBhbmQgdGhlIHNlY29uZCBhcmd1bWVudCAtIGZsYWcgLSBwcmVmZXJyZWQgdHlwZSBpcyBhIHN0cmluZ1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW5wdXQsIFBSRUZFUlJFRF9TVFJJTkcpIHtcbiAgaWYgKCFpc09iamVjdChpbnB1dCkpIHJldHVybiBpbnB1dDtcbiAgdmFyIGZuLCB2YWw7XG4gIGlmIChQUkVGRVJSRURfU1RSSU5HICYmIHR5cGVvZiAoZm4gPSBpbnB1dC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpbnB1dCkpKSByZXR1cm4gdmFsO1xuICBpZiAodHlwZW9mIChmbiA9IGlucHV0LnZhbHVlT2YpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaW5wdXQpKSkgcmV0dXJuIHZhbDtcbiAgaWYgKCFQUkVGRVJSRURfU1RSSU5HICYmIHR5cGVvZiAoZm4gPSBpbnB1dC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpbnB1dCkpKSByZXR1cm4gdmFsO1xuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBwcmltaXRpdmUgdmFsdWVcIik7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7fTtcbiIsIi8vIElFOC0gZG9uJ3QgZW51bSBidWcga2V5c1xubW9kdWxlLmV4cG9ydHMgPSBbXG4gICdjb25zdHJ1Y3RvcicsXG4gICdoYXNPd25Qcm9wZXJ0eScsXG4gICdpc1Byb3RvdHlwZU9mJyxcbiAgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJyxcbiAgJ3RvTG9jYWxlU3RyaW5nJyxcbiAgJ3RvU3RyaW5nJyxcbiAgJ3ZhbHVlT2YnXG5dO1xuIiwidmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jbGFzc29mLXJhdycpO1xuXG52YXIgc3BsaXQgPSAnJy5zcGxpdDtcblxuLy8gZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBhbmQgbm9uLWVudW1lcmFibGUgb2xkIFY4IHN0cmluZ3Ncbm1vZHVsZS5leHBvcnRzID0gZmFpbHMoZnVuY3Rpb24gKCkge1xuICAvLyB0aHJvd3MgYW4gZXJyb3IgaW4gcmhpbm8sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9yaGluby9pc3N1ZXMvMzQ2XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbiAgcmV0dXJuICFPYmplY3QoJ3onKS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgwKTtcbn0pID8gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBjbGFzc29mKGl0KSA9PSAnU3RyaW5nJyA/IHNwbGl0LmNhbGwoaXQsICcnKSA6IE9iamVjdChpdCk7XG59IDogT2JqZWN0O1xuIiwidmFyIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Rlc2NyaXB0b3JzJyk7XG52YXIgcHJvcGVydHlJc0VudW1lcmFibGVNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LXByb3BlcnR5LWlzLWVudW1lcmFibGUnKTtcbnZhciBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbnZhciB0b0luZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW5kZXhlZC1vYmplY3QnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1wcmltaXRpdmUnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaWU4LWRvbS1kZWZpbmUnKTtcblxudmFyIG5hdGl2ZUdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG5cbi8vIGBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5nZXRvd25wcm9wZXJ0eWRlc2NyaXB0b3JcbmV4cG9ydHMuZiA9IERFU0NSSVBUT1JTID8gbmF0aXZlR2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIDogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApIHtcbiAgTyA9IHRvSW5kZXhlZE9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBpZiAoSUU4X0RPTV9ERUZJTkUpIHRyeSB7XG4gICAgcmV0dXJuIG5hdGl2ZUdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHsgLyogZW1wdHkgKi8gfVxuICBpZiAoaGFzKE8sIFApKSByZXR1cm4gY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yKCFwcm9wZXJ0eUlzRW51bWVyYWJsZU1vZHVsZS5mLmNhbGwoTywgUCksIE9bUF0pO1xufTtcbiIsInZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG52YXIgY3JlYXRlRWxlbWVudCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kb2N1bWVudC1jcmVhdGUtZWxlbWVudCcpO1xuXG4vLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFERVNDUklQVE9SUyAmJiAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KGNyZWF0ZUVsZW1lbnQoJ2RpdicpLCAnYScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH1cbiAgfSkuYSAhPSA3O1xufSk7XG4iLCJ2YXIgc2hhcmVkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoYXJlZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNoYXJlZCgnbmF0aXZlLWZ1bmN0aW9uLXRvLXN0cmluZycsIEZ1bmN0aW9uLnRvU3RyaW5nKTtcbiIsInZhciBpZCA9IDA7XG52YXIgcG9zdGZpeCA9IE1hdGgucmFuZG9tKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4gJ1N5bWJvbCgnICsgU3RyaW5nKGtleSA9PT0gdW5kZWZpbmVkID8gJycgOiBrZXkpICsgJylfJyArICgrK2lkICsgcG9zdGZpeCkudG9TdHJpbmcoMzYpO1xufTtcbiIsInZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgdG9JbmRleGVkT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWluZGV4ZWQtb2JqZWN0Jyk7XG52YXIgaW5kZXhPZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1pbmNsdWRlcycpLmluZGV4T2Y7XG52YXIgaGlkZGVuS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRkZW4ta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWVzKSB7XG4gIHZhciBPID0gdG9JbmRleGVkT2JqZWN0KG9iamVjdCk7XG4gIHZhciBpID0gMDtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIga2V5O1xuICBmb3IgKGtleSBpbiBPKSAhaGFzKGhpZGRlbktleXMsIGtleSkgJiYgaGFzKE8sIGtleSkgJiYgcmVzdWx0LnB1c2goa2V5KTtcbiAgLy8gRG9uJ3QgZW51bSBidWcgJiBoaWRkZW4ga2V5c1xuICB3aGlsZSAobmFtZXMubGVuZ3RoID4gaSkgaWYgKGhhcyhPLCBrZXkgPSBuYW1lc1tpKytdKSkge1xuICAgIH5pbmRleE9mKHJlc3VsdCwga2V5KSB8fCByZXN1bHQucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBzaGFyZWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2hhcmVkJyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRlJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIHNldEdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zZXQtZ2xvYmFsJyk7XG52YXIgbmF0aXZlRnVuY3Rpb25Ub1N0cmluZyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mdW5jdGlvbi10by1zdHJpbmcnKTtcbnZhciBJbnRlcm5hbFN0YXRlTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ludGVybmFsLXN0YXRlJyk7XG5cbnZhciBnZXRJbnRlcm5hbFN0YXRlID0gSW50ZXJuYWxTdGF0ZU1vZHVsZS5nZXQ7XG52YXIgZW5mb3JjZUludGVybmFsU3RhdGUgPSBJbnRlcm5hbFN0YXRlTW9kdWxlLmVuZm9yY2U7XG52YXIgVEVNUExBVEUgPSBTdHJpbmcobmF0aXZlRnVuY3Rpb25Ub1N0cmluZykuc3BsaXQoJ3RvU3RyaW5nJyk7XG5cbnNoYXJlZCgnaW5zcGVjdFNvdXJjZScsIGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gbmF0aXZlRnVuY3Rpb25Ub1N0cmluZy5jYWxsKGl0KTtcbn0pO1xuXG4obW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTywga2V5LCB2YWx1ZSwgb3B0aW9ucykge1xuICB2YXIgdW5zYWZlID0gb3B0aW9ucyA/ICEhb3B0aW9ucy51bnNhZmUgOiBmYWxzZTtcbiAgdmFyIHNpbXBsZSA9IG9wdGlvbnMgPyAhIW9wdGlvbnMuZW51bWVyYWJsZSA6IGZhbHNlO1xuICB2YXIgbm9UYXJnZXRHZXQgPSBvcHRpb25zID8gISFvcHRpb25zLm5vVGFyZ2V0R2V0IDogZmFsc2U7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmICh0eXBlb2Yga2V5ID09ICdzdHJpbmcnICYmICFoYXModmFsdWUsICduYW1lJykpIGhpZGUodmFsdWUsICduYW1lJywga2V5KTtcbiAgICBlbmZvcmNlSW50ZXJuYWxTdGF0ZSh2YWx1ZSkuc291cmNlID0gVEVNUExBVEUuam9pbih0eXBlb2Yga2V5ID09ICdzdHJpbmcnID8ga2V5IDogJycpO1xuICB9XG4gIGlmIChPID09PSBnbG9iYWwpIHtcbiAgICBpZiAoc2ltcGxlKSBPW2tleV0gPSB2YWx1ZTtcbiAgICBlbHNlIHNldEdsb2JhbChrZXksIHZhbHVlKTtcbiAgICByZXR1cm47XG4gIH0gZWxzZSBpZiAoIXVuc2FmZSkge1xuICAgIGRlbGV0ZSBPW2tleV07XG4gIH0gZWxzZSBpZiAoIW5vVGFyZ2V0R2V0ICYmIE9ba2V5XSkge1xuICAgIHNpbXBsZSA9IHRydWU7XG4gIH1cbiAgaWYgKHNpbXBsZSkgT1trZXldID0gdmFsdWU7XG4gIGVsc2UgaGlkZShPLCBrZXksIHZhbHVlKTtcbi8vIGFkZCBmYWtlIEZ1bmN0aW9uI3RvU3RyaW5nIGZvciBjb3JyZWN0IHdvcmsgd3JhcHBlZCBtZXRob2RzIC8gY29uc3RydWN0b3JzIHdpdGggbWV0aG9kcyBsaWtlIExvRGFzaCBpc05hdGl2ZVxufSkoRnVuY3Rpb24ucHJvdG90eXBlLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuIHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgJiYgZ2V0SW50ZXJuYWxTdGF0ZSh0aGlzKS5zb3VyY2UgfHwgbmF0aXZlRnVuY3Rpb25Ub1N0cmluZy5jYWxsKHRoaXMpO1xufSk7XG4iLCJ2YXIgcGF0aCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9wYXRoJyk7XG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xuXG52YXIgYUZ1bmN0aW9uID0gZnVuY3Rpb24gKHZhcmlhYmxlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFyaWFibGUgPT0gJ2Z1bmN0aW9uJyA/IHZhcmlhYmxlIDogdW5kZWZpbmVkO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobmFtZXNwYWNlLCBtZXRob2QpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPCAyID8gYUZ1bmN0aW9uKHBhdGhbbmFtZXNwYWNlXSkgfHwgYUZ1bmN0aW9uKGdsb2JhbFtuYW1lc3BhY2VdKVxuICAgIDogcGF0aFtuYW1lc3BhY2VdICYmIHBhdGhbbmFtZXNwYWNlXVttZXRob2RdIHx8IGdsb2JhbFtuYW1lc3BhY2VdICYmIGdsb2JhbFtuYW1lc3BhY2VdW21ldGhvZF07XG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcblxudmFyIGRvY3VtZW50ID0gZ2xvYmFsLmRvY3VtZW50O1xuLy8gdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCcgaW4gb2xkIElFXG52YXIgRVhJU1RTID0gaXNPYmplY3QoZG9jdW1lbnQpICYmIGlzT2JqZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gRVhJU1RTID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChpdCkgOiB7fTtcbn07XG4iLCJ2YXIgc2hhcmVkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoYXJlZCcpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy91aWQnKTtcblxudmFyIGtleXMgPSBzaGFyZWQoJ2tleXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBrZXlzW2tleV0gfHwgKGtleXNba2V5XSA9IHVpZChrZXkpKTtcbn07XG4iLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWludGVnZXInKTtcblxudmFyIG1heCA9IE1hdGgubWF4O1xudmFyIG1pbiA9IE1hdGgubWluO1xuXG4vLyBIZWxwZXIgZm9yIGEgcG9wdWxhciByZXBlYXRpbmcgY2FzZSBvZiB0aGUgc3BlYzpcbi8vIExldCBpbnRlZ2VyIGJlID8gVG9JbnRlZ2VyKGluZGV4KS5cbi8vIElmIGludGVnZXIgPCAwLCBsZXQgcmVzdWx0IGJlIG1heCgobGVuZ3RoICsgaW50ZWdlciksIDApOyBlbHNlIGxldCByZXN1bHQgYmUgbWluKGxlbmd0aCwgbGVuZ3RoKS5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluZGV4LCBsZW5ndGgpIHtcbiAgdmFyIGludGVnZXIgPSB0b0ludGVnZXIoaW5kZXgpO1xuICByZXR1cm4gaW50ZWdlciA8IDAgPyBtYXgoaW50ZWdlciArIGxlbmd0aCwgMCkgOiBtaW4oaW50ZWdlciwgbGVuZ3RoKTtcbn07XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1hcnJheScpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xuXG52YXIgU1BFQ0lFUyA9IHdlbGxLbm93blN5bWJvbCgnc3BlY2llcycpO1xuXG4vLyBgQXJyYXlTcGVjaWVzQ3JlYXRlYCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5c3BlY2llc2NyZWF0ZVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3JpZ2luYWxBcnJheSwgbGVuZ3RoKSB7XG4gIHZhciBDO1xuICBpZiAoaXNBcnJheShvcmlnaW5hbEFycmF5KSkge1xuICAgIEMgPSBvcmlnaW5hbEFycmF5LmNvbnN0cnVjdG9yO1xuICAgIC8vIGNyb3NzLXJlYWxtIGZhbGxiYWNrXG4gICAgaWYgKHR5cGVvZiBDID09ICdmdW5jdGlvbicgJiYgKEMgPT09IEFycmF5IHx8IGlzQXJyYXkoQy5wcm90b3R5cGUpKSkgQyA9IHVuZGVmaW5lZDtcbiAgICBlbHNlIGlmIChpc09iamVjdChDKSkge1xuICAgICAgQyA9IENbU1BFQ0lFU107XG4gICAgICBpZiAoQyA9PT0gbnVsbCkgQyA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH0gcmV0dXJuIG5ldyAoQyA9PT0gdW5kZWZpbmVkID8gQXJyYXkgOiBDKShsZW5ndGggPT09IDAgPyAwIDogbGVuZ3RoKTtcbn07XG4iLCJ2YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jbGFzc29mLXJhdycpO1xuXG4vLyBgSXNBcnJheWAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1pc2FycmF5XG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gaXNBcnJheShhcmcpIHtcbiAgcmV0dXJuIGNsYXNzb2YoYXJnKSA9PSAnQXJyYXknO1xufTtcbiIsInZhciBiaW5kID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2JpbmQtY29udGV4dCcpO1xudmFyIEluZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW5kZXhlZC1vYmplY3QnKTtcbnZhciB0b09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1vYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1sZW5ndGgnKTtcbnZhciBhcnJheVNwZWNpZXNDcmVhdGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYXJyYXktc3BlY2llcy1jcmVhdGUnKTtcblxudmFyIHB1c2ggPSBbXS5wdXNoO1xuXG4vLyBgQXJyYXkucHJvdG90eXBlLnsgZm9yRWFjaCwgbWFwLCBmaWx0ZXIsIHNvbWUsIGV2ZXJ5LCBmaW5kLCBmaW5kSW5kZXggfWAgbWV0aG9kcyBpbXBsZW1lbnRhdGlvblxudmFyIGNyZWF0ZU1ldGhvZCA9IGZ1bmN0aW9uIChUWVBFKSB7XG4gIHZhciBJU19NQVAgPSBUWVBFID09IDE7XG4gIHZhciBJU19GSUxURVIgPSBUWVBFID09IDI7XG4gIHZhciBJU19TT01FID0gVFlQRSA9PSAzO1xuICB2YXIgSVNfRVZFUlkgPSBUWVBFID09IDQ7XG4gIHZhciBJU19GSU5EX0lOREVYID0gVFlQRSA9PSA2O1xuICB2YXIgTk9fSE9MRVMgPSBUWVBFID09IDUgfHwgSVNfRklORF9JTkRFWDtcbiAgcmV0dXJuIGZ1bmN0aW9uICgkdGhpcywgY2FsbGJhY2tmbiwgdGhhdCwgc3BlY2lmaWNDcmVhdGUpIHtcbiAgICB2YXIgTyA9IHRvT2JqZWN0KCR0aGlzKTtcbiAgICB2YXIgc2VsZiA9IEluZGV4ZWRPYmplY3QoTyk7XG4gICAgdmFyIGJvdW5kRnVuY3Rpb24gPSBiaW5kKGNhbGxiYWNrZm4sIHRoYXQsIDMpO1xuICAgIHZhciBsZW5ndGggPSB0b0xlbmd0aChzZWxmLmxlbmd0aCk7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgY3JlYXRlID0gc3BlY2lmaWNDcmVhdGUgfHwgYXJyYXlTcGVjaWVzQ3JlYXRlO1xuICAgIHZhciB0YXJnZXQgPSBJU19NQVAgPyBjcmVhdGUoJHRoaXMsIGxlbmd0aCkgOiBJU19GSUxURVIgPyBjcmVhdGUoJHRoaXMsIDApIDogdW5kZWZpbmVkO1xuICAgIHZhciB2YWx1ZSwgcmVzdWx0O1xuICAgIGZvciAoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKSBpZiAoTk9fSE9MRVMgfHwgaW5kZXggaW4gc2VsZikge1xuICAgICAgdmFsdWUgPSBzZWxmW2luZGV4XTtcbiAgICAgIHJlc3VsdCA9IGJvdW5kRnVuY3Rpb24odmFsdWUsIGluZGV4LCBPKTtcbiAgICAgIGlmIChUWVBFKSB7XG4gICAgICAgIGlmIChJU19NQVApIHRhcmdldFtpbmRleF0gPSByZXN1bHQ7IC8vIG1hcFxuICAgICAgICBlbHNlIGlmIChyZXN1bHQpIHN3aXRjaCAoVFlQRSkge1xuICAgICAgICAgIGNhc2UgMzogcmV0dXJuIHRydWU7ICAgICAgICAgICAgICAvLyBzb21lXG4gICAgICAgICAgY2FzZSA1OiByZXR1cm4gdmFsdWU7ICAgICAgICAgICAgIC8vIGZpbmRcbiAgICAgICAgICBjYXNlIDY6IHJldHVybiBpbmRleDsgICAgICAgICAgICAgLy8gZmluZEluZGV4XG4gICAgICAgICAgY2FzZSAyOiBwdXNoLmNhbGwodGFyZ2V0LCB2YWx1ZSk7IC8vIGZpbHRlclxuICAgICAgICB9IGVsc2UgaWYgKElTX0VWRVJZKSByZXR1cm4gZmFsc2U7ICAvLyBldmVyeVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gSVNfRklORF9JTkRFWCA/IC0xIDogSVNfU09NRSB8fCBJU19FVkVSWSA/IElTX0VWRVJZIDogdGFyZ2V0O1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vIGBBcnJheS5wcm90b3R5cGUuZm9yRWFjaGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5mb3JlYWNoXG4gIGZvckVhY2g6IGNyZWF0ZU1ldGhvZCgwKSxcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5tYXBgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUubWFwXG4gIG1hcDogY3JlYXRlTWV0aG9kKDEpLFxuICAvLyBgQXJyYXkucHJvdG90eXBlLmZpbHRlcmAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5maWx0ZXJcbiAgZmlsdGVyOiBjcmVhdGVNZXRob2QoMiksXG4gIC8vIGBBcnJheS5wcm90b3R5cGUuc29tZWAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5zb21lXG4gIHNvbWU6IGNyZWF0ZU1ldGhvZCgzKSxcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5ldmVyeWAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5ldmVyeVxuICBldmVyeTogY3JlYXRlTWV0aG9kKDQpLFxuICAvLyBgQXJyYXkucHJvdG90eXBlLmZpbmRgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZmluZFxuICBmaW5kOiBjcmVhdGVNZXRob2QoNSksXG4gIC8vIGBBcnJheS5wcm90b3R5cGUuZmluZEluZGV4YCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmZpbmRJbmRleFxuICBmaW5kSW5kZXg6IGNyZWF0ZU1ldGhvZCg2KVxufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBuYXRpdmVQcm9wZXJ0eUlzRW51bWVyYWJsZSA9IHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlO1xudmFyIGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG5cbi8vIE5hc2hvcm4gfiBKREs4IGJ1Z1xudmFyIE5BU0hPUk5fQlVHID0gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yICYmICFuYXRpdmVQcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHsgMTogMiB9LCAxKTtcblxuLy8gYE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGVgIG1ldGhvZCBpbXBsZW1lbnRhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eWlzZW51bWVyYWJsZVxuZXhwb3J0cy5mID0gTkFTSE9STl9CVUcgPyBmdW5jdGlvbiBwcm9wZXJ0eUlzRW51bWVyYWJsZShWKSB7XG4gIHZhciBkZXNjcmlwdG9yID0gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRoaXMsIFYpO1xuICByZXR1cm4gISFkZXNjcmlwdG9yICYmIGRlc2NyaXB0b3IuZW51bWVyYWJsZTtcbn0gOiBuYXRpdmVQcm9wZXJ0eUlzRW51bWVyYWJsZTtcbiIsInZhciB0b0luZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW5kZXhlZC1vYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1sZW5ndGgnKTtcbnZhciB0b0Fic29sdXRlSW5kZXggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tYWJzb2x1dGUtaW5kZXgnKTtcblxuLy8gYEFycmF5LnByb3RvdHlwZS57IGluZGV4T2YsIGluY2x1ZGVzIH1gIG1ldGhvZHMgaW1wbGVtZW50YXRpb25cbnZhciBjcmVhdGVNZXRob2QgPSBmdW5jdGlvbiAoSVNfSU5DTFVERVMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgkdGhpcywgZWwsIGZyb21JbmRleCkge1xuICAgIHZhciBPID0gdG9JbmRleGVkT2JqZWN0KCR0aGlzKTtcbiAgICB2YXIgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpO1xuICAgIHZhciBpbmRleCA9IHRvQWJzb2x1dGVJbmRleChmcm9tSW5kZXgsIGxlbmd0aCk7XG4gICAgdmFyIHZhbHVlO1xuICAgIC8vIEFycmF5I2luY2x1ZGVzIHVzZXMgU2FtZVZhbHVlWmVybyBlcXVhbGl0eSBhbGdvcml0aG1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgaWYgKElTX0lOQ0xVREVTICYmIGVsICE9IGVsKSB3aGlsZSAobGVuZ3RoID4gaW5kZXgpIHtcbiAgICAgIHZhbHVlID0gT1tpbmRleCsrXTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICAgIGlmICh2YWx1ZSAhPSB2YWx1ZSkgcmV0dXJuIHRydWU7XG4gICAgLy8gQXJyYXkjaW5kZXhPZiBpZ25vcmVzIGhvbGVzLCBBcnJheSNpbmNsdWRlcyAtIG5vdFxuICAgIH0gZWxzZSBmb3IgKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKykge1xuICAgICAgaWYgKChJU19JTkNMVURFUyB8fCBpbmRleCBpbiBPKSAmJiBPW2luZGV4XSA9PT0gZWwpIHJldHVybiBJU19JTkNMVURFUyB8fCBpbmRleCB8fCAwO1xuICAgIH0gcmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBgQXJyYXkucHJvdG90eXBlLmluY2x1ZGVzYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmluY2x1ZGVzXG4gIGluY2x1ZGVzOiBjcmVhdGVNZXRob2QodHJ1ZSksXG4gIC8vIGBBcnJheS5wcm90b3R5cGUuaW5kZXhPZmAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5pbmRleG9mXG4gIGluZGV4T2Y6IGNyZWF0ZU1ldGhvZChmYWxzZSlcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoU3RyaW5nKGl0KSArICcgaXMgbm90IGEgZnVuY3Rpb24nKTtcbiAgfSByZXR1cm4gaXQ7XG59O1xuIiwidmFyIGc7XG5cbi8vIFRoaXMgd29ya3MgaW4gbm9uLXN0cmljdCBtb2RlXG5nID0gKGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcztcbn0pKCk7XG5cbnRyeSB7XG5cdC8vIFRoaXMgd29ya3MgaWYgZXZhbCBpcyBhbGxvd2VkIChzZWUgQ1NQKVxuXHRnID0gZyB8fCBuZXcgRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpO1xufSBjYXRjaCAoZSkge1xuXHQvLyBUaGlzIHdvcmtzIGlmIHRoZSB3aW5kb3cgcmVmZXJlbmNlIGlzIGF2YWlsYWJsZVxuXHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIikgZyA9IHdpbmRvdztcbn1cblxuLy8gZyBjYW4gc3RpbGwgYmUgdW5kZWZpbmVkLCBidXQgbm90aGluZyB0byBkbyBhYm91dCBpdC4uLlxuLy8gV2UgcmV0dXJuIHVuZGVmaW5lZCwgaW5zdGVhZCBvZiBub3RoaW5nIGhlcmUsIHNvIGl0J3Ncbi8vIGVhc2llciB0byBoYW5kbGUgdGhpcyBjYXNlLiBpZighZ2xvYmFsKSB7IC4uLn1cblxubW9kdWxlLmV4cG9ydHMgPSBnO1xuIiwidmFyIGludGVybmFsT2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3Qta2V5cy1pbnRlcm5hbCcpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2VudW0tYnVnLWtleXMnKTtcblxudmFyIGhpZGRlbktleXMgPSBlbnVtQnVnS2V5cy5jb25jYXQoJ2xlbmd0aCcsICdwcm90b3R5cGUnKTtcblxuLy8gYE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5nZXRvd25wcm9wZXJ0eW5hbWVzXG5leHBvcnRzLmYgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB8fCBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKE8pIHtcbiAgcmV0dXJuIGludGVybmFsT2JqZWN0S2V5cyhPLCBoaWRkZW5LZXlzKTtcbn07XG4iLCJleHBvcnRzLmYgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuIiwidmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG5cbnZhciByZXBsYWNlbWVudCA9IC8jfFxcLnByb3RvdHlwZVxcLi87XG5cbnZhciBpc0ZvcmNlZCA9IGZ1bmN0aW9uIChmZWF0dXJlLCBkZXRlY3Rpb24pIHtcbiAgdmFyIHZhbHVlID0gZGF0YVtub3JtYWxpemUoZmVhdHVyZSldO1xuICByZXR1cm4gdmFsdWUgPT0gUE9MWUZJTEwgPyB0cnVlXG4gICAgOiB2YWx1ZSA9PSBOQVRJVkUgPyBmYWxzZVxuICAgIDogdHlwZW9mIGRldGVjdGlvbiA9PSAnZnVuY3Rpb24nID8gZmFpbHMoZGV0ZWN0aW9uKVxuICAgIDogISFkZXRlY3Rpb247XG59O1xuXG52YXIgbm9ybWFsaXplID0gaXNGb3JjZWQubm9ybWFsaXplID0gZnVuY3Rpb24gKHN0cmluZykge1xuICByZXR1cm4gU3RyaW5nKHN0cmluZykucmVwbGFjZShyZXBsYWNlbWVudCwgJy4nKS50b0xvd2VyQ2FzZSgpO1xufTtcblxudmFyIGRhdGEgPSBpc0ZvcmNlZC5kYXRhID0ge307XG52YXIgTkFUSVZFID0gaXNGb3JjZWQuTkFUSVZFID0gJ04nO1xudmFyIFBPTFlGSUxMID0gaXNGb3JjZWQuUE9MWUZJTEwgPSAnUCc7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNGb3JjZWQ7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZhbHNlO1xuIiwidmFyIE5BVElWRV9XRUFLX01BUCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9uYXRpdmUtd2Vhay1tYXAnKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRlJyk7XG52YXIgb2JqZWN0SGFzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIHNoYXJlZEtleSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQta2V5Jyk7XG52YXIgaGlkZGVuS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRkZW4ta2V5cycpO1xuXG52YXIgV2Vha01hcCA9IGdsb2JhbC5XZWFrTWFwO1xudmFyIHNldCwgZ2V0LCBoYXM7XG5cbnZhciBlbmZvcmNlID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBoYXMoaXQpID8gZ2V0KGl0KSA6IHNldChpdCwge30pO1xufTtcblxudmFyIGdldHRlckZvciA9IGZ1bmN0aW9uIChUWVBFKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoaXQpIHtcbiAgICB2YXIgc3RhdGU7XG4gICAgaWYgKCFpc09iamVjdChpdCkgfHwgKHN0YXRlID0gZ2V0KGl0KSkudHlwZSAhPT0gVFlQRSkge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKCdJbmNvbXBhdGlibGUgcmVjZWl2ZXIsICcgKyBUWVBFICsgJyByZXF1aXJlZCcpO1xuICAgIH0gcmV0dXJuIHN0YXRlO1xuICB9O1xufTtcblxuaWYgKE5BVElWRV9XRUFLX01BUCkge1xuICB2YXIgc3RvcmUgPSBuZXcgV2Vha01hcCgpO1xuICB2YXIgd21nZXQgPSBzdG9yZS5nZXQ7XG4gIHZhciB3bWhhcyA9IHN0b3JlLmhhcztcbiAgdmFyIHdtc2V0ID0gc3RvcmUuc2V0O1xuICBzZXQgPSBmdW5jdGlvbiAoaXQsIG1ldGFkYXRhKSB7XG4gICAgd21zZXQuY2FsbChzdG9yZSwgaXQsIG1ldGFkYXRhKTtcbiAgICByZXR1cm4gbWV0YWRhdGE7XG4gIH07XG4gIGdldCA9IGZ1bmN0aW9uIChpdCkge1xuICAgIHJldHVybiB3bWdldC5jYWxsKHN0b3JlLCBpdCkgfHwge307XG4gIH07XG4gIGhhcyA9IGZ1bmN0aW9uIChpdCkge1xuICAgIHJldHVybiB3bWhhcy5jYWxsKHN0b3JlLCBpdCk7XG4gIH07XG59IGVsc2Uge1xuICB2YXIgU1RBVEUgPSBzaGFyZWRLZXkoJ3N0YXRlJyk7XG4gIGhpZGRlbktleXNbU1RBVEVdID0gdHJ1ZTtcbiAgc2V0ID0gZnVuY3Rpb24gKGl0LCBtZXRhZGF0YSkge1xuICAgIGhpZGUoaXQsIFNUQVRFLCBtZXRhZGF0YSk7XG4gICAgcmV0dXJuIG1ldGFkYXRhO1xuICB9O1xuICBnZXQgPSBmdW5jdGlvbiAoaXQpIHtcbiAgICByZXR1cm4gb2JqZWN0SGFzKGl0LCBTVEFURSkgPyBpdFtTVEFURV0gOiB7fTtcbiAgfTtcbiAgaGFzID0gZnVuY3Rpb24gKGl0KSB7XG4gICAgcmV0dXJuIG9iamVjdEhhcyhpdCwgU1RBVEUpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiBzZXQsXG4gIGdldDogZ2V0LFxuICBoYXM6IGhhcyxcbiAgZW5mb3JjZTogZW5mb3JjZSxcbiAgZ2V0dGVyRm9yOiBnZXR0ZXJGb3Jcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIG5hdGl2ZUZ1bmN0aW9uVG9TdHJpbmcgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZnVuY3Rpb24tdG8tc3RyaW5nJyk7XG5cbnZhciBXZWFrTWFwID0gZ2xvYmFsLldlYWtNYXA7XG5cbm1vZHVsZS5leHBvcnRzID0gdHlwZW9mIFdlYWtNYXAgPT09ICdmdW5jdGlvbicgJiYgL25hdGl2ZSBjb2RlLy50ZXN0KG5hdGl2ZUZ1bmN0aW9uVG9TdHJpbmcuY2FsbChXZWFrTWFwKSk7XG4iLCJ2YXIgaGFzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIG93bktleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb3duLWtleXMnKTtcbnZhciBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcicpO1xudmFyIGRlZmluZVByb3BlcnR5TW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydHknKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcbiAgdmFyIGtleXMgPSBvd25LZXlzKHNvdXJjZSk7XG4gIHZhciBkZWZpbmVQcm9wZXJ0eSA9IGRlZmluZVByb3BlcnR5TW9kdWxlLmY7XG4gIHZhciBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JNb2R1bGUuZjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgaWYgKCFoYXModGFyZ2V0LCBrZXkpKSBkZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwga2V5KSk7XG4gIH1cbn07XG4iLCJ2YXIgZ2V0QnVpbHRJbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nZXQtYnVpbHQtaW4nKTtcbnZhciBnZXRPd25Qcm9wZXJ0eU5hbWVzTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LW5hbWVzJyk7XG52YXIgZ2V0T3duUHJvcGVydHlTeW1ib2xzTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LXN5bWJvbHMnKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcblxuLy8gYWxsIG9iamVjdCBrZXlzLCBpbmNsdWRlcyBub24tZW51bWVyYWJsZSBhbmQgc3ltYm9sc1xubW9kdWxlLmV4cG9ydHMgPSBnZXRCdWlsdEluKCdSZWZsZWN0JywgJ293bktleXMnKSB8fCBmdW5jdGlvbiBvd25LZXlzKGl0KSB7XG4gIHZhciBrZXlzID0gZ2V0T3duUHJvcGVydHlOYW1lc01vZHVsZS5mKGFuT2JqZWN0KGl0KSk7XG4gIHZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHNNb2R1bGUuZjtcbiAgcmV0dXJuIGdldE93blByb3BlcnR5U3ltYm9scyA/IGtleXMuY29uY2F0KGdldE93blByb3BlcnR5U3ltYm9scyhpdCkpIDoga2V5cztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbiIsInZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYS1mdW5jdGlvbicpO1xuXG4vLyBvcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZuLCB0aGF0LCBsZW5ndGgpIHtcbiAgYUZ1bmN0aW9uKGZuKTtcbiAgaWYgKHRoYXQgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZuO1xuICBzd2l0Y2ggKGxlbmd0aCkge1xuICAgIGNhc2UgMDogcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQpO1xuICAgIH07XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24gKGEpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xuICAgIH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24gKGEsIGIsIGMpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uICgvKiAuLi5hcmdzICovKSB7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gIH07XG59O1xuIiwidmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gISFPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzICYmICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gIC8vIENocm9tZSAzOCBTeW1ib2wgaGFzIGluY29ycmVjdCB0b1N0cmluZyBjb252ZXJzaW9uXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICByZXR1cm4gIVN0cmluZyhTeW1ib2woKSk7XG59KTtcbiIsInZhciBpbnRlcm5hbE9iamVjdEtleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWtleXMtaW50ZXJuYWwnKTtcbnZhciBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9lbnVtLWJ1Zy1rZXlzJyk7XG5cbi8vIGBPYmplY3Qua2V5c2AgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3Qua2V5c1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiBrZXlzKE8pIHtcbiAgcmV0dXJuIGludGVybmFsT2JqZWN0S2V5cyhPLCBlbnVtQnVnS2V5cyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHJlZ2V4cEZsYWdzID0gcmVxdWlyZSgnLi9yZWdleHAtZmxhZ3MnKTtcblxudmFyIG5hdGl2ZUV4ZWMgPSBSZWdFeHAucHJvdG90eXBlLmV4ZWM7XG4vLyBUaGlzIGFsd2F5cyByZWZlcnMgdG8gdGhlIG5hdGl2ZSBpbXBsZW1lbnRhdGlvbiwgYmVjYXVzZSB0aGVcbi8vIFN0cmluZyNyZXBsYWNlIHBvbHlmaWxsIHVzZXMgLi9maXgtcmVnZXhwLXdlbGwta25vd24tc3ltYm9sLWxvZ2ljLmpzLFxuLy8gd2hpY2ggbG9hZHMgdGhpcyBmaWxlIGJlZm9yZSBwYXRjaGluZyB0aGUgbWV0aG9kLlxudmFyIG5hdGl2ZVJlcGxhY2UgPSBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2U7XG5cbnZhciBwYXRjaGVkRXhlYyA9IG5hdGl2ZUV4ZWM7XG5cbnZhciBVUERBVEVTX0xBU1RfSU5ERVhfV1JPTkcgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgcmUxID0gL2EvO1xuICB2YXIgcmUyID0gL2IqL2c7XG4gIG5hdGl2ZUV4ZWMuY2FsbChyZTEsICdhJyk7XG4gIG5hdGl2ZUV4ZWMuY2FsbChyZTIsICdhJyk7XG4gIHJldHVybiByZTEubGFzdEluZGV4ICE9PSAwIHx8IHJlMi5sYXN0SW5kZXggIT09IDA7XG59KSgpO1xuXG4vLyBub25wYXJ0aWNpcGF0aW5nIGNhcHR1cmluZyBncm91cCwgY29waWVkIGZyb20gZXM1LXNoaW0ncyBTdHJpbmcjc3BsaXQgcGF0Y2guXG52YXIgTlBDR19JTkNMVURFRCA9IC8oKT8/Ly5leGVjKCcnKVsxXSAhPT0gdW5kZWZpbmVkO1xuXG52YXIgUEFUQ0ggPSBVUERBVEVTX0xBU1RfSU5ERVhfV1JPTkcgfHwgTlBDR19JTkNMVURFRDtcblxuaWYgKFBBVENIKSB7XG4gIHBhdGNoZWRFeGVjID0gZnVuY3Rpb24gZXhlYyhzdHIpIHtcbiAgICB2YXIgcmUgPSB0aGlzO1xuICAgIHZhciBsYXN0SW5kZXgsIHJlQ29weSwgbWF0Y2gsIGk7XG5cbiAgICBpZiAoTlBDR19JTkNMVURFRCkge1xuICAgICAgcmVDb3B5ID0gbmV3IFJlZ0V4cCgnXicgKyByZS5zb3VyY2UgKyAnJCg/IVxcXFxzKScsIHJlZ2V4cEZsYWdzLmNhbGwocmUpKTtcbiAgICB9XG4gICAgaWYgKFVQREFURVNfTEFTVF9JTkRFWF9XUk9ORykgbGFzdEluZGV4ID0gcmUubGFzdEluZGV4O1xuXG4gICAgbWF0Y2ggPSBuYXRpdmVFeGVjLmNhbGwocmUsIHN0cik7XG5cbiAgICBpZiAoVVBEQVRFU19MQVNUX0lOREVYX1dST05HICYmIG1hdGNoKSB7XG4gICAgICByZS5sYXN0SW5kZXggPSByZS5nbG9iYWwgPyBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCA6IGxhc3RJbmRleDtcbiAgICB9XG4gICAgaWYgKE5QQ0dfSU5DTFVERUQgJiYgbWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMSkge1xuICAgICAgLy8gRml4IGJyb3dzZXJzIHdob3NlIGBleGVjYCBtZXRob2RzIGRvbid0IGNvbnNpc3RlbnRseSByZXR1cm4gYHVuZGVmaW5lZGBcbiAgICAgIC8vIGZvciBOUENHLCBsaWtlIElFOC4gTk9URTogVGhpcyBkb2Vzbicgd29yayBmb3IgLyguPyk/L1xuICAgICAgbmF0aXZlUmVwbGFjZS5jYWxsKG1hdGNoWzBdLCByZUNvcHksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGggLSAyOyBpKyspIHtcbiAgICAgICAgICBpZiAoYXJndW1lbnRzW2ldID09PSB1bmRlZmluZWQpIG1hdGNoW2ldID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWF0Y2g7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcGF0Y2hlZEV4ZWM7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTUVUSE9EX05BTUUsIGFyZ3VtZW50KSB7XG4gIHZhciBtZXRob2QgPSBbXVtNRVRIT0RfTkFNRV07XG4gIHJldHVybiAhbWV0aG9kIHx8ICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZWxlc3MtY2FsbCxuby10aHJvdy1saXRlcmFsXG4gICAgbWV0aG9kLmNhbGwobnVsbCwgYXJndW1lbnQgfHwgZnVuY3Rpb24gKCkgeyB0aHJvdyAxOyB9LCAxKTtcbiAgfSk7XG59O1xuIiwidmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xudmFyIGNyZWF0ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtY3JlYXRlJyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRlJyk7XG5cbnZhciBVTlNDT1BBQkxFUyA9IHdlbGxLbm93blN5bWJvbCgndW5zY29wYWJsZXMnKTtcbnZhciBBcnJheVByb3RvdHlwZSA9IEFycmF5LnByb3RvdHlwZTtcblxuLy8gQXJyYXkucHJvdG90eXBlW0BAdW5zY29wYWJsZXNdXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUtQEB1bnNjb3BhYmxlc1xuaWYgKEFycmF5UHJvdG90eXBlW1VOU0NPUEFCTEVTXSA9PSB1bmRlZmluZWQpIHtcbiAgaGlkZShBcnJheVByb3RvdHlwZSwgVU5TQ09QQUJMRVMsIGNyZWF0ZShudWxsKSk7XG59XG5cbi8vIGFkZCBhIGtleSB0byBBcnJheS5wcm90b3R5cGVbQEB1bnNjb3BhYmxlc11cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSkge1xuICBBcnJheVByb3RvdHlwZVtVTlNDT1BBQkxFU11ba2V5XSA9IHRydWU7XG59O1xuIiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xudmFyIGRlZmluZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0aWVzJyk7XG52YXIgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZW51bS1idWcta2V5cycpO1xudmFyIGhpZGRlbktleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZGVuLWtleXMnKTtcbnZhciBodG1sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2h0bWwnKTtcbnZhciBkb2N1bWVudENyZWF0ZUVsZW1lbnQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZG9jdW1lbnQtY3JlYXRlLWVsZW1lbnQnKTtcbnZhciBzaGFyZWRLZXkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2hhcmVkLWtleScpO1xudmFyIElFX1BST1RPID0gc2hhcmVkS2V5KCdJRV9QUk9UTycpO1xuXG52YXIgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG52YXIgRW1wdHkgPSBmdW5jdGlvbiAoKSB7IC8qIGVtcHR5ICovIH07XG5cbi8vIENyZWF0ZSBvYmplY3Qgd2l0aCBmYWtlIGBudWxsYCBwcm90b3R5cGU6IHVzZSBpZnJhbWUgT2JqZWN0IHdpdGggY2xlYXJlZCBwcm90b3R5cGVcbnZhciBjcmVhdGVEaWN0ID0gZnVuY3Rpb24gKCkge1xuICAvLyBUaHJhc2gsIHdhc3RlIGFuZCBzb2RvbXk6IElFIEdDIGJ1Z1xuICB2YXIgaWZyYW1lID0gZG9jdW1lbnRDcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgdmFyIGxlbmd0aCA9IGVudW1CdWdLZXlzLmxlbmd0aDtcbiAgdmFyIGx0ID0gJzwnO1xuICB2YXIgc2NyaXB0ID0gJ3NjcmlwdCc7XG4gIHZhciBndCA9ICc+JztcbiAgdmFyIGpzID0gJ2phdmEnICsgc2NyaXB0ICsgJzonO1xuICB2YXIgaWZyYW1lRG9jdW1lbnQ7XG4gIGlmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBodG1sLmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gIGlmcmFtZS5zcmMgPSBTdHJpbmcoanMpO1xuICBpZnJhbWVEb2N1bWVudCA9IGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xuICBpZnJhbWVEb2N1bWVudC5vcGVuKCk7XG4gIGlmcmFtZURvY3VtZW50LndyaXRlKGx0ICsgc2NyaXB0ICsgZ3QgKyAnZG9jdW1lbnQuRj1PYmplY3QnICsgbHQgKyAnLycgKyBzY3JpcHQgKyBndCk7XG4gIGlmcmFtZURvY3VtZW50LmNsb3NlKCk7XG4gIGNyZWF0ZURpY3QgPSBpZnJhbWVEb2N1bWVudC5GO1xuICB3aGlsZSAobGVuZ3RoLS0pIGRlbGV0ZSBjcmVhdGVEaWN0W1BST1RPVFlQRV1bZW51bUJ1Z0tleXNbbGVuZ3RoXV07XG4gIHJldHVybiBjcmVhdGVEaWN0KCk7XG59O1xuXG4vLyBgT2JqZWN0LmNyZWF0ZWAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QuY3JlYXRlXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gY3JlYXRlKE8sIFByb3BlcnRpZXMpIHtcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKE8gIT09IG51bGwpIHtcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gYW5PYmplY3QoTyk7XG4gICAgcmVzdWx0ID0gbmV3IEVtcHR5KCk7XG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IG51bGw7XG4gICAgLy8gYWRkIFwiX19wcm90b19fXCIgZm9yIE9iamVjdC5nZXRQcm90b3R5cGVPZiBwb2x5ZmlsbFxuICAgIHJlc3VsdFtJRV9QUk9UT10gPSBPO1xuICB9IGVsc2UgcmVzdWx0ID0gY3JlYXRlRGljdCgpO1xuICByZXR1cm4gUHJvcGVydGllcyA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogZGVmaW5lUHJvcGVydGllcyhyZXN1bHQsIFByb3BlcnRpZXMpO1xufTtcblxuaGlkZGVuS2V5c1tJRV9QUk9UT10gPSB0cnVlO1xuIiwidmFyIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Rlc2NyaXB0b3JzJyk7XG52YXIgZGVmaW5lUHJvcGVydHlNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0eScpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xudmFyIG9iamVjdEtleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWtleXMnKTtcblxuLy8gYE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5kZWZpbmVwcm9wZXJ0aWVzXG5tb2R1bGUuZXhwb3J0cyA9IERFU0NSSVBUT1JTID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMgOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpIHtcbiAgYW5PYmplY3QoTyk7XG4gIHZhciBrZXlzID0gb2JqZWN0S2V5cyhQcm9wZXJ0aWVzKTtcbiAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICB2YXIgaW5kZXggPSAwO1xuICB2YXIga2V5O1xuICB3aGlsZSAobGVuZ3RoID4gaW5kZXgpIGRlZmluZVByb3BlcnR5TW9kdWxlLmYoTywga2V5ID0ga2V5c1tpbmRleCsrXSwgUHJvcGVydGllc1trZXldKTtcbiAgcmV0dXJuIE87XG59O1xuIiwidmFyIGdldEJ1aWx0SW4gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2V0LWJ1aWx0LWluJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0QnVpbHRJbignZG9jdW1lbnQnLCAnZG9jdW1lbnRFbGVtZW50Jyk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG5cbi8vIGBSZWdFeHAucHJvdG90eXBlLmZsYWdzYCBnZXR0ZXIgaW1wbGVtZW50YXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWdldC1yZWdleHAucHJvdG90eXBlLmZsYWdzXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHRoYXQgPSBhbk9iamVjdCh0aGlzKTtcbiAgdmFyIHJlc3VsdCA9ICcnO1xuICBpZiAodGhhdC5nbG9iYWwpIHJlc3VsdCArPSAnZyc7XG4gIGlmICh0aGF0Lmlnbm9yZUNhc2UpIHJlc3VsdCArPSAnaSc7XG4gIGlmICh0aGF0Lm11bHRpbGluZSkgcmVzdWx0ICs9ICdtJztcbiAgaWYgKHRoYXQuZG90QWxsKSByZXN1bHQgKz0gJ3MnO1xuICBpZiAodGhhdC51bmljb2RlKSByZXN1bHQgKz0gJ3UnO1xuICBpZiAodGhhdC5zdGlja3kpIHJlc3VsdCArPSAneSc7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZScpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlZGVmaW5lJyk7XG52YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcbnZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcbnZhciByZWdleHBFeGVjID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlZ2V4cC1leGVjJyk7XG5cbnZhciBTUEVDSUVTID0gd2VsbEtub3duU3ltYm9sKCdzcGVjaWVzJyk7XG5cbnZhciBSRVBMQUNFX1NVUFBPUlRTX05BTUVEX0dST1VQUyA9ICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gIC8vICNyZXBsYWNlIG5lZWRzIGJ1aWx0LWluIHN1cHBvcnQgZm9yIG5hbWVkIGdyb3Vwcy5cbiAgLy8gI21hdGNoIHdvcmtzIGZpbmUgYmVjYXVzZSBpdCBqdXN0IHJldHVybiB0aGUgZXhlYyByZXN1bHRzLCBldmVuIGlmIGl0IGhhc1xuICAvLyBhIFwiZ3JvcHNcIiBwcm9wZXJ0eS5cbiAgdmFyIHJlID0gLy4vO1xuICByZS5leGVjID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICByZXN1bHQuZ3JvdXBzID0geyBhOiAnNycgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICByZXR1cm4gJycucmVwbGFjZShyZSwgJyQ8YT4nKSAhPT0gJzcnO1xufSk7XG5cbi8vIENocm9tZSA1MSBoYXMgYSBidWdneSBcInNwbGl0XCIgaW1wbGVtZW50YXRpb24gd2hlbiBSZWdFeHAjZXhlYyAhPT0gbmF0aXZlRXhlY1xuLy8gV2VleCBKUyBoYXMgZnJvemVuIGJ1aWx0LWluIHByb3RvdHlwZXMsIHNvIHVzZSB0cnkgLyBjYXRjaCB3cmFwcGVyXG52YXIgU1BMSVRfV09SS1NfV0lUSF9PVkVSV1JJVFRFTl9FWEVDID0gIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgdmFyIHJlID0gLyg/OikvO1xuICB2YXIgb3JpZ2luYWxFeGVjID0gcmUuZXhlYztcbiAgcmUuZXhlYyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG9yaWdpbmFsRXhlYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9O1xuICB2YXIgcmVzdWx0ID0gJ2FiJy5zcGxpdChyZSk7XG4gIHJldHVybiByZXN1bHQubGVuZ3RoICE9PSAyIHx8IHJlc3VsdFswXSAhPT0gJ2EnIHx8IHJlc3VsdFsxXSAhPT0gJ2InO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKEtFWSwgbGVuZ3RoLCBleGVjLCBzaGFtKSB7XG4gIHZhciBTWU1CT0wgPSB3ZWxsS25vd25TeW1ib2woS0VZKTtcblxuICB2YXIgREVMRUdBVEVTX1RPX1NZTUJPTCA9ICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gICAgLy8gU3RyaW5nIG1ldGhvZHMgY2FsbCBzeW1ib2wtbmFtZWQgUmVnRXAgbWV0aG9kc1xuICAgIHZhciBPID0ge307XG4gICAgT1tTWU1CT0xdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNzsgfTtcbiAgICByZXR1cm4gJydbS0VZXShPKSAhPSA3O1xuICB9KTtcblxuICB2YXIgREVMRUdBVEVTX1RPX0VYRUMgPSBERUxFR0FURVNfVE9fU1lNQk9MICYmICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gICAgLy8gU3ltYm9sLW5hbWVkIFJlZ0V4cCBtZXRob2RzIGNhbGwgLmV4ZWNcbiAgICB2YXIgZXhlY0NhbGxlZCA9IGZhbHNlO1xuICAgIHZhciByZSA9IC9hLztcbiAgICByZS5leGVjID0gZnVuY3Rpb24gKCkgeyBleGVjQ2FsbGVkID0gdHJ1ZTsgcmV0dXJuIG51bGw7IH07XG5cbiAgICBpZiAoS0VZID09PSAnc3BsaXQnKSB7XG4gICAgICAvLyBSZWdFeHBbQEBzcGxpdF0gZG9lc24ndCBjYWxsIHRoZSByZWdleCdzIGV4ZWMgbWV0aG9kLCBidXQgZmlyc3QgY3JlYXRlc1xuICAgICAgLy8gYSBuZXcgb25lLiBXZSBuZWVkIHRvIHJldHVybiB0aGUgcGF0Y2hlZCByZWdleCB3aGVuIGNyZWF0aW5nIHRoZSBuZXcgb25lLlxuICAgICAgcmUuY29uc3RydWN0b3IgPSB7fTtcbiAgICAgIHJlLmNvbnN0cnVjdG9yW1NQRUNJRVNdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gcmU7IH07XG4gICAgfVxuXG4gICAgcmVbU1lNQk9MXSgnJyk7XG4gICAgcmV0dXJuICFleGVjQ2FsbGVkO1xuICB9KTtcblxuICBpZiAoXG4gICAgIURFTEVHQVRFU19UT19TWU1CT0wgfHxcbiAgICAhREVMRUdBVEVTX1RPX0VYRUMgfHxcbiAgICAoS0VZID09PSAncmVwbGFjZScgJiYgIVJFUExBQ0VfU1VQUE9SVFNfTkFNRURfR1JPVVBTKSB8fFxuICAgIChLRVkgPT09ICdzcGxpdCcgJiYgIVNQTElUX1dPUktTX1dJVEhfT1ZFUldSSVRURU5fRVhFQylcbiAgKSB7XG4gICAgdmFyIG5hdGl2ZVJlZ0V4cE1ldGhvZCA9IC8uL1tTWU1CT0xdO1xuICAgIHZhciBtZXRob2RzID0gZXhlYyhTWU1CT0wsICcnW0tFWV0sIGZ1bmN0aW9uIChuYXRpdmVNZXRob2QsIHJlZ2V4cCwgc3RyLCBhcmcyLCBmb3JjZVN0cmluZ01ldGhvZCkge1xuICAgICAgaWYgKHJlZ2V4cC5leGVjID09PSByZWdleHBFeGVjKSB7XG4gICAgICAgIGlmIChERUxFR0FURVNfVE9fU1lNQk9MICYmICFmb3JjZVN0cmluZ01ldGhvZCkge1xuICAgICAgICAgIC8vIFRoZSBuYXRpdmUgU3RyaW5nIG1ldGhvZCBhbHJlYWR5IGRlbGVnYXRlcyB0byBAQG1ldGhvZCAodGhpc1xuICAgICAgICAgIC8vIHBvbHlmaWxsZWQgZnVuY3Rpb24pLCBsZWFzaW5nIHRvIGluZmluaXRlIHJlY3Vyc2lvbi5cbiAgICAgICAgICAvLyBXZSBhdm9pZCBpdCBieSBkaXJlY3RseSBjYWxsaW5nIHRoZSBuYXRpdmUgQEBtZXRob2QgbWV0aG9kLlxuICAgICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiBuYXRpdmVSZWdFeHBNZXRob2QuY2FsbChyZWdleHAsIHN0ciwgYXJnMikgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogbmF0aXZlTWV0aG9kLmNhbGwoc3RyLCByZWdleHAsIGFyZzIpIH07XG4gICAgICB9XG4gICAgICByZXR1cm4geyBkb25lOiBmYWxzZSB9O1xuICAgIH0pO1xuICAgIHZhciBzdHJpbmdNZXRob2QgPSBtZXRob2RzWzBdO1xuICAgIHZhciByZWdleE1ldGhvZCA9IG1ldGhvZHNbMV07XG5cbiAgICByZWRlZmluZShTdHJpbmcucHJvdG90eXBlLCBLRVksIHN0cmluZ01ldGhvZCk7XG4gICAgcmVkZWZpbmUoUmVnRXhwLnByb3RvdHlwZSwgU1lNQk9MLCBsZW5ndGggPT0gMlxuICAgICAgLy8gMjEuMi41LjggUmVnRXhwLnByb3RvdHlwZVtAQHJlcGxhY2VdKHN0cmluZywgcmVwbGFjZVZhbHVlKVxuICAgICAgLy8gMjEuMi41LjExIFJlZ0V4cC5wcm90b3R5cGVbQEBzcGxpdF0oc3RyaW5nLCBsaW1pdClcbiAgICAgID8gZnVuY3Rpb24gKHN0cmluZywgYXJnKSB7IHJldHVybiByZWdleE1ldGhvZC5jYWxsKHN0cmluZywgdGhpcywgYXJnKTsgfVxuICAgICAgLy8gMjEuMi41LjYgUmVnRXhwLnByb3RvdHlwZVtAQG1hdGNoXShzdHJpbmcpXG4gICAgICAvLyAyMS4yLjUuOSBSZWdFeHAucHJvdG90eXBlW0BAc2VhcmNoXShzdHJpbmcpXG4gICAgICA6IGZ1bmN0aW9uIChzdHJpbmcpIHsgcmV0dXJuIHJlZ2V4TWV0aG9kLmNhbGwoc3RyaW5nLCB0aGlzKTsgfVxuICAgICk7XG4gICAgaWYgKHNoYW0pIGhpZGUoUmVnRXhwLnByb3RvdHlwZVtTWU1CT0xdLCAnc2hhbScsIHRydWUpO1xuICB9XG59O1xuIiwidmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuL2NsYXNzb2YtcmF3Jyk7XG52YXIgcmVnZXhwRXhlYyA9IHJlcXVpcmUoJy4vcmVnZXhwLWV4ZWMnKTtcblxuLy8gYFJlZ0V4cEV4ZWNgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtcmVnZXhwZXhlY1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoUiwgUykge1xuICB2YXIgZXhlYyA9IFIuZXhlYztcbiAgaWYgKHR5cGVvZiBleGVjID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdmFyIHJlc3VsdCA9IGV4ZWMuY2FsbChSLCBTKTtcbiAgICBpZiAodHlwZW9mIHJlc3VsdCAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcignUmVnRXhwIGV4ZWMgbWV0aG9kIHJldHVybmVkIHNvbWV0aGluZyBvdGhlciB0aGFuIGFuIE9iamVjdCBvciBudWxsJyk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpZiAoY2xhc3NvZihSKSAhPT0gJ1JlZ0V4cCcpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ1JlZ0V4cCNleGVjIGNhbGxlZCBvbiBpbmNvbXBhdGlibGUgcmVjZWl2ZXInKTtcbiAgfVxuXG4gIHJldHVybiByZWdleHBFeGVjLmNhbGwoUiwgUyk7XG59O1xuXG4iLCIndXNlIHN0cmljdCc7XG52YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBleGVjID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlZ2V4cC1leGVjJyk7XG5cbiQoeyB0YXJnZXQ6ICdSZWdFeHAnLCBwcm90bzogdHJ1ZSwgZm9yY2VkOiAvLi8uZXhlYyAhPT0gZXhlYyB9LCB7XG4gIGV4ZWM6IGV4ZWNcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGZpeFJlZ0V4cFdlbGxLbm93blN5bWJvbExvZ2ljID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZpeC1yZWdleHAtd2VsbC1rbm93bi1zeW1ib2wtbG9naWMnKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcbnZhciB0b09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1vYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1sZW5ndGgnKTtcbnZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW50ZWdlcicpO1xudmFyIHJlcXVpcmVPYmplY3RDb2VyY2libGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVxdWlyZS1vYmplY3QtY29lcmNpYmxlJyk7XG52YXIgYWR2YW5jZVN0cmluZ0luZGV4ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FkdmFuY2Utc3RyaW5nLWluZGV4Jyk7XG52YXIgcmVnRXhwRXhlYyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWdleHAtZXhlYy1hYnN0cmFjdCcpO1xuXG52YXIgbWF4ID0gTWF0aC5tYXg7XG52YXIgbWluID0gTWF0aC5taW47XG52YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xudmFyIFNVQlNUSVRVVElPTl9TWU1CT0xTID0gL1xcJChbJCYnYF18XFxkXFxkP3w8W14+XSo+KS9nO1xudmFyIFNVQlNUSVRVVElPTl9TWU1CT0xTX05PX05BTUVEID0gL1xcJChbJCYnYF18XFxkXFxkPykvZztcblxudmFyIG1heWJlVG9TdHJpbmcgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGl0ID09PSB1bmRlZmluZWQgPyBpdCA6IFN0cmluZyhpdCk7XG59O1xuXG4vLyBAQHJlcGxhY2UgbG9naWNcbmZpeFJlZ0V4cFdlbGxLbm93blN5bWJvbExvZ2ljKCdyZXBsYWNlJywgMiwgZnVuY3Rpb24gKFJFUExBQ0UsIG5hdGl2ZVJlcGxhY2UsIG1heWJlQ2FsbE5hdGl2ZSkge1xuICByZXR1cm4gW1xuICAgIC8vIGBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2VgIG1ldGhvZFxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXN0cmluZy5wcm90b3R5cGUucmVwbGFjZVxuICAgIGZ1bmN0aW9uIHJlcGxhY2Uoc2VhcmNoVmFsdWUsIHJlcGxhY2VWYWx1ZSkge1xuICAgICAgdmFyIE8gPSByZXF1aXJlT2JqZWN0Q29lcmNpYmxlKHRoaXMpO1xuICAgICAgdmFyIHJlcGxhY2VyID0gc2VhcmNoVmFsdWUgPT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogc2VhcmNoVmFsdWVbUkVQTEFDRV07XG4gICAgICByZXR1cm4gcmVwbGFjZXIgIT09IHVuZGVmaW5lZFxuICAgICAgICA/IHJlcGxhY2VyLmNhbGwoc2VhcmNoVmFsdWUsIE8sIHJlcGxhY2VWYWx1ZSlcbiAgICAgICAgOiBuYXRpdmVSZXBsYWNlLmNhbGwoU3RyaW5nKE8pLCBzZWFyY2hWYWx1ZSwgcmVwbGFjZVZhbHVlKTtcbiAgICB9LFxuICAgIC8vIGBSZWdFeHAucHJvdG90eXBlW0BAcmVwbGFjZV1gIG1ldGhvZFxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXJlZ2V4cC5wcm90b3R5cGUtQEByZXBsYWNlXG4gICAgZnVuY3Rpb24gKHJlZ2V4cCwgcmVwbGFjZVZhbHVlKSB7XG4gICAgICB2YXIgcmVzID0gbWF5YmVDYWxsTmF0aXZlKG5hdGl2ZVJlcGxhY2UsIHJlZ2V4cCwgdGhpcywgcmVwbGFjZVZhbHVlKTtcbiAgICAgIGlmIChyZXMuZG9uZSkgcmV0dXJuIHJlcy52YWx1ZTtcblxuICAgICAgdmFyIHJ4ID0gYW5PYmplY3QocmVnZXhwKTtcbiAgICAgIHZhciBTID0gU3RyaW5nKHRoaXMpO1xuXG4gICAgICB2YXIgZnVuY3Rpb25hbFJlcGxhY2UgPSB0eXBlb2YgcmVwbGFjZVZhbHVlID09PSAnZnVuY3Rpb24nO1xuICAgICAgaWYgKCFmdW5jdGlvbmFsUmVwbGFjZSkgcmVwbGFjZVZhbHVlID0gU3RyaW5nKHJlcGxhY2VWYWx1ZSk7XG5cbiAgICAgIHZhciBnbG9iYWwgPSByeC5nbG9iYWw7XG4gICAgICBpZiAoZ2xvYmFsKSB7XG4gICAgICAgIHZhciBmdWxsVW5pY29kZSA9IHJ4LnVuaWNvZGU7XG4gICAgICAgIHJ4Lmxhc3RJbmRleCA9IDA7XG4gICAgICB9XG4gICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHJlZ0V4cEV4ZWMocngsIFMpO1xuICAgICAgICBpZiAocmVzdWx0ID09PSBudWxsKSBicmVhaztcblxuICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICAgICAgaWYgKCFnbG9iYWwpIGJyZWFrO1xuXG4gICAgICAgIHZhciBtYXRjaFN0ciA9IFN0cmluZyhyZXN1bHRbMF0pO1xuICAgICAgICBpZiAobWF0Y2hTdHIgPT09ICcnKSByeC5sYXN0SW5kZXggPSBhZHZhbmNlU3RyaW5nSW5kZXgoUywgdG9MZW5ndGgocngubGFzdEluZGV4KSwgZnVsbFVuaWNvZGUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgYWNjdW11bGF0ZWRSZXN1bHQgPSAnJztcbiAgICAgIHZhciBuZXh0U291cmNlUG9zaXRpb24gPSAwO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdHNbaV07XG5cbiAgICAgICAgdmFyIG1hdGNoZWQgPSBTdHJpbmcocmVzdWx0WzBdKTtcbiAgICAgICAgdmFyIHBvc2l0aW9uID0gbWF4KG1pbih0b0ludGVnZXIocmVzdWx0LmluZGV4KSwgUy5sZW5ndGgpLCAwKTtcbiAgICAgICAgdmFyIGNhcHR1cmVzID0gW107XG4gICAgICAgIC8vIE5PVEU6IFRoaXMgaXMgZXF1aXZhbGVudCB0b1xuICAgICAgICAvLyAgIGNhcHR1cmVzID0gcmVzdWx0LnNsaWNlKDEpLm1hcChtYXliZVRvU3RyaW5nKVxuICAgICAgICAvLyBidXQgZm9yIHNvbWUgcmVhc29uIGBuYXRpdmVTbGljZS5jYWxsKHJlc3VsdCwgMSwgcmVzdWx0Lmxlbmd0aClgIChjYWxsZWQgaW5cbiAgICAgICAgLy8gdGhlIHNsaWNlIHBvbHlmaWxsIHdoZW4gc2xpY2luZyBuYXRpdmUgYXJyYXlzKSBcImRvZXNuJ3Qgd29ya1wiIGluIHNhZmFyaSA5IGFuZFxuICAgICAgICAvLyBjYXVzZXMgYSBjcmFzaCAoaHR0cHM6Ly9wYXN0ZWJpbi5jb20vTjIxUXplUUEpIHdoZW4gdHJ5aW5nIHRvIGRlYnVnIGl0LlxuICAgICAgICBmb3IgKHZhciBqID0gMTsgaiA8IHJlc3VsdC5sZW5ndGg7IGorKykgY2FwdHVyZXMucHVzaChtYXliZVRvU3RyaW5nKHJlc3VsdFtqXSkpO1xuICAgICAgICB2YXIgbmFtZWRDYXB0dXJlcyA9IHJlc3VsdC5ncm91cHM7XG4gICAgICAgIGlmIChmdW5jdGlvbmFsUmVwbGFjZSkge1xuICAgICAgICAgIHZhciByZXBsYWNlckFyZ3MgPSBbbWF0Y2hlZF0uY29uY2F0KGNhcHR1cmVzLCBwb3NpdGlvbiwgUyk7XG4gICAgICAgICAgaWYgKG5hbWVkQ2FwdHVyZXMgIT09IHVuZGVmaW5lZCkgcmVwbGFjZXJBcmdzLnB1c2gobmFtZWRDYXB0dXJlcyk7XG4gICAgICAgICAgdmFyIHJlcGxhY2VtZW50ID0gU3RyaW5nKHJlcGxhY2VWYWx1ZS5hcHBseSh1bmRlZmluZWQsIHJlcGxhY2VyQXJncykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcGxhY2VtZW50ID0gZ2V0U3Vic3RpdHV0aW9uKG1hdGNoZWQsIFMsIHBvc2l0aW9uLCBjYXB0dXJlcywgbmFtZWRDYXB0dXJlcywgcmVwbGFjZVZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocG9zaXRpb24gPj0gbmV4dFNvdXJjZVBvc2l0aW9uKSB7XG4gICAgICAgICAgYWNjdW11bGF0ZWRSZXN1bHQgKz0gUy5zbGljZShuZXh0U291cmNlUG9zaXRpb24sIHBvc2l0aW9uKSArIHJlcGxhY2VtZW50O1xuICAgICAgICAgIG5leHRTb3VyY2VQb3NpdGlvbiA9IHBvc2l0aW9uICsgbWF0Y2hlZC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBhY2N1bXVsYXRlZFJlc3VsdCArIFMuc2xpY2UobmV4dFNvdXJjZVBvc2l0aW9uKTtcbiAgICB9XG4gIF07XG5cbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtZ2V0c3Vic3RpdHV0aW9uXG4gIGZ1bmN0aW9uIGdldFN1YnN0aXR1dGlvbihtYXRjaGVkLCBzdHIsIHBvc2l0aW9uLCBjYXB0dXJlcywgbmFtZWRDYXB0dXJlcywgcmVwbGFjZW1lbnQpIHtcbiAgICB2YXIgdGFpbFBvcyA9IHBvc2l0aW9uICsgbWF0Y2hlZC5sZW5ndGg7XG4gICAgdmFyIG0gPSBjYXB0dXJlcy5sZW5ndGg7XG4gICAgdmFyIHN5bWJvbHMgPSBTVUJTVElUVVRJT05fU1lNQk9MU19OT19OQU1FRDtcbiAgICBpZiAobmFtZWRDYXB0dXJlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBuYW1lZENhcHR1cmVzID0gdG9PYmplY3QobmFtZWRDYXB0dXJlcyk7XG4gICAgICBzeW1ib2xzID0gU1VCU1RJVFVUSU9OX1NZTUJPTFM7XG4gICAgfVxuICAgIHJldHVybiBuYXRpdmVSZXBsYWNlLmNhbGwocmVwbGFjZW1lbnQsIHN5bWJvbHMsIGZ1bmN0aW9uIChtYXRjaCwgY2gpIHtcbiAgICAgIHZhciBjYXB0dXJlO1xuICAgICAgc3dpdGNoIChjaC5jaGFyQXQoMCkpIHtcbiAgICAgICAgY2FzZSAnJCc6IHJldHVybiAnJCc7XG4gICAgICAgIGNhc2UgJyYnOiByZXR1cm4gbWF0Y2hlZDtcbiAgICAgICAgY2FzZSAnYCc6IHJldHVybiBzdHIuc2xpY2UoMCwgcG9zaXRpb24pO1xuICAgICAgICBjYXNlIFwiJ1wiOiByZXR1cm4gc3RyLnNsaWNlKHRhaWxQb3MpO1xuICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICBjYXB0dXJlID0gbmFtZWRDYXB0dXJlc1tjaC5zbGljZSgxLCAtMSldO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiAvLyBcXGRcXGQ/XG4gICAgICAgICAgdmFyIG4gPSArY2g7XG4gICAgICAgICAgaWYgKG4gPT09IDApIHJldHVybiBtYXRjaDtcbiAgICAgICAgICBpZiAobiA+IG0pIHtcbiAgICAgICAgICAgIHZhciBmID0gZmxvb3IobiAvIDEwKTtcbiAgICAgICAgICAgIGlmIChmID09PSAwKSByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICBpZiAoZiA8PSBtKSByZXR1cm4gY2FwdHVyZXNbZiAtIDFdID09PSB1bmRlZmluZWQgPyBjaC5jaGFyQXQoMSkgOiBjYXB0dXJlc1tmIC0gMV0gKyBjaC5jaGFyQXQoMSk7XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhcHR1cmUgPSBjYXB0dXJlc1tuIC0gMV07XG4gICAgICB9XG4gICAgICByZXR1cm4gY2FwdHVyZSA9PT0gdW5kZWZpbmVkID8gJycgOiBjYXB0dXJlO1xuICAgIH0pO1xuICB9XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBjaGFyQXQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc3RyaW5nLW11bHRpYnl0ZScpLmNoYXJBdDtcblxuLy8gYEFkdmFuY2VTdHJpbmdJbmRleGAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hZHZhbmNlc3RyaW5naW5kZXhcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFMsIGluZGV4LCB1bmljb2RlKSB7XG4gIHJldHVybiBpbmRleCArICh1bmljb2RlID8gY2hhckF0KFMsIGluZGV4KS5sZW5ndGggOiAxKTtcbn07XG4iLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWludGVnZXInKTtcbnZhciByZXF1aXJlT2JqZWN0Q29lcmNpYmxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlcXVpcmUtb2JqZWN0LWNvZXJjaWJsZScpO1xuXG4vLyBgU3RyaW5nLnByb3RvdHlwZS57IGNvZGVQb2ludEF0LCBhdCB9YCBtZXRob2RzIGltcGxlbWVudGF0aW9uXG52YXIgY3JlYXRlTWV0aG9kID0gZnVuY3Rpb24gKENPTlZFUlRfVE9fU1RSSU5HKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoJHRoaXMsIHBvcykge1xuICAgIHZhciBTID0gU3RyaW5nKHJlcXVpcmVPYmplY3RDb2VyY2libGUoJHRoaXMpKTtcbiAgICB2YXIgcG9zaXRpb24gPSB0b0ludGVnZXIocG9zKTtcbiAgICB2YXIgc2l6ZSA9IFMubGVuZ3RoO1xuICAgIHZhciBmaXJzdCwgc2Vjb25kO1xuICAgIGlmIChwb3NpdGlvbiA8IDAgfHwgcG9zaXRpb24gPj0gc2l6ZSkgcmV0dXJuIENPTlZFUlRfVE9fU1RSSU5HID8gJycgOiB1bmRlZmluZWQ7XG4gICAgZmlyc3QgPSBTLmNoYXJDb2RlQXQocG9zaXRpb24pO1xuICAgIHJldHVybiBmaXJzdCA8IDB4RDgwMCB8fCBmaXJzdCA+IDB4REJGRiB8fCBwb3NpdGlvbiArIDEgPT09IHNpemVcbiAgICAgIHx8IChzZWNvbmQgPSBTLmNoYXJDb2RlQXQocG9zaXRpb24gKyAxKSkgPCAweERDMDAgfHwgc2Vjb25kID4gMHhERkZGXG4gICAgICAgID8gQ09OVkVSVF9UT19TVFJJTkcgPyBTLmNoYXJBdChwb3NpdGlvbikgOiBmaXJzdFxuICAgICAgICA6IENPTlZFUlRfVE9fU1RSSU5HID8gUy5zbGljZShwb3NpdGlvbiwgcG9zaXRpb24gKyAyKSA6IChmaXJzdCAtIDB4RDgwMCA8PCAxMCkgKyAoc2Vjb25kIC0gMHhEQzAwKSArIDB4MTAwMDA7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy8gYFN0cmluZy5wcm90b3R5cGUuY29kZVBvaW50QXRgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1zdHJpbmcucHJvdG90eXBlLmNvZGVwb2ludGF0XG4gIGNvZGVBdDogY3JlYXRlTWV0aG9kKGZhbHNlKSxcbiAgLy8gYFN0cmluZy5wcm90b3R5cGUuYXRgIG1ldGhvZFxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWF0aGlhc2J5bmVucy9TdHJpbmcucHJvdG90eXBlLmF0XG4gIGNoYXJBdDogY3JlYXRlTWV0aG9kKHRydWUpXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyICRmb3JFYWNoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FycmF5LWl0ZXJhdGlvbicpLmZvckVhY2g7XG52YXIgc2xvcHB5QXJyYXlNZXRob2QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2xvcHB5LWFycmF5LW1ldGhvZCcpO1xuXG4vLyBgQXJyYXkucHJvdG90eXBlLmZvckVhY2hgIG1ldGhvZCBpbXBsZW1lbnRhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmZvcmVhY2hcbm1vZHVsZS5leHBvcnRzID0gc2xvcHB5QXJyYXlNZXRob2QoJ2ZvckVhY2gnKSA/IGZ1bmN0aW9uIGZvckVhY2goY2FsbGJhY2tmbiAvKiAsIHRoaXNBcmcgKi8pIHtcbiAgcmV0dXJuICRmb3JFYWNoKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkKTtcbn0gOiBbXS5mb3JFYWNoO1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xudmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2xhc3NvZi1yYXcnKTtcbnZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcblxudmFyIE1BVENIID0gd2VsbEtub3duU3ltYm9sKCdtYXRjaCcpO1xuXG4vLyBgSXNSZWdFeHBgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtaXNyZWdleHBcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHZhciBpc1JlZ0V4cDtcbiAgcmV0dXJuIGlzT2JqZWN0KGl0KSAmJiAoKGlzUmVnRXhwID0gaXRbTUFUQ0hdKSAhPT0gdW5kZWZpbmVkID8gISFpc1JlZ0V4cCA6IGNsYXNzb2YoaXQpID09ICdSZWdFeHAnKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBmb3JFYWNoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FycmF5LWZvci1lYWNoJyk7XG5cbi8vIGBBcnJheS5wcm90b3R5cGUuZm9yRWFjaGAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZm9yZWFjaFxuJCh7IHRhcmdldDogJ0FycmF5JywgcHJvdG86IHRydWUsIGZvcmNlZDogW10uZm9yRWFjaCAhPSBmb3JFYWNoIH0sIHtcbiAgZm9yRWFjaDogZm9yRWFjaFxufSk7XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIERPTUl0ZXJhYmxlcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kb20taXRlcmFibGVzJyk7XG52YXIgZm9yRWFjaCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1mb3ItZWFjaCcpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZScpO1xuXG5mb3IgKHZhciBDT0xMRUNUSU9OX05BTUUgaW4gRE9NSXRlcmFibGVzKSB7XG4gIHZhciBDb2xsZWN0aW9uID0gZ2xvYmFsW0NPTExFQ1RJT05fTkFNRV07XG4gIHZhciBDb2xsZWN0aW9uUHJvdG90eXBlID0gQ29sbGVjdGlvbiAmJiBDb2xsZWN0aW9uLnByb3RvdHlwZTtcbiAgLy8gc29tZSBDaHJvbWUgdmVyc2lvbnMgaGF2ZSBub24tY29uZmlndXJhYmxlIG1ldGhvZHMgb24gRE9NVG9rZW5MaXN0XG4gIGlmIChDb2xsZWN0aW9uUHJvdG90eXBlICYmIENvbGxlY3Rpb25Qcm90b3R5cGUuZm9yRWFjaCAhPT0gZm9yRWFjaCkgdHJ5IHtcbiAgICBoaWRlKENvbGxlY3Rpb25Qcm90b3R5cGUsICdmb3JFYWNoJywgZm9yRWFjaCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgQ29sbGVjdGlvblByb3RvdHlwZS5mb3JFYWNoID0gZm9yRWFjaDtcbiAgfVxufVxuIiwiLy8gaXRlcmFibGUgRE9NIGNvbGxlY3Rpb25zXG4vLyBmbGFnIC0gYGl0ZXJhYmxlYCBpbnRlcmZhY2UgLSAnZW50cmllcycsICdrZXlzJywgJ3ZhbHVlcycsICdmb3JFYWNoJyBtZXRob2RzXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ1NTUnVsZUxpc3Q6IDAsXG4gIENTU1N0eWxlRGVjbGFyYXRpb246IDAsXG4gIENTU1ZhbHVlTGlzdDogMCxcbiAgQ2xpZW50UmVjdExpc3Q6IDAsXG4gIERPTVJlY3RMaXN0OiAwLFxuICBET01TdHJpbmdMaXN0OiAwLFxuICBET01Ub2tlbkxpc3Q6IDEsXG4gIERhdGFUcmFuc2Zlckl0ZW1MaXN0OiAwLFxuICBGaWxlTGlzdDogMCxcbiAgSFRNTEFsbENvbGxlY3Rpb246IDAsXG4gIEhUTUxDb2xsZWN0aW9uOiAwLFxuICBIVE1MRm9ybUVsZW1lbnQ6IDAsXG4gIEhUTUxTZWxlY3RFbGVtZW50OiAwLFxuICBNZWRpYUxpc3Q6IDAsXG4gIE1pbWVUeXBlQXJyYXk6IDAsXG4gIE5hbWVkTm9kZU1hcDogMCxcbiAgTm9kZUxpc3Q6IDEsXG4gIFBhaW50UmVxdWVzdExpc3Q6IDAsXG4gIFBsdWdpbjogMCxcbiAgUGx1Z2luQXJyYXk6IDAsXG4gIFNWR0xlbmd0aExpc3Q6IDAsXG4gIFNWR051bWJlckxpc3Q6IDAsXG4gIFNWR1BhdGhTZWdMaXN0OiAwLFxuICBTVkdQb2ludExpc3Q6IDAsXG4gIFNWR1N0cmluZ0xpc3Q6IDAsXG4gIFNWR1RyYW5zZm9ybUxpc3Q6IDAsXG4gIFNvdXJjZUJ1ZmZlckxpc3Q6IDAsXG4gIFN0eWxlU2hlZXRMaXN0OiAwLFxuICBUZXh0VHJhY2tDdWVMaXN0OiAwLFxuICBUZXh0VHJhY2tMaXN0OiAwLFxuICBUb3VjaExpc3Q6IDBcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IF87IiwiaW1wb3J0IGpRdWVyeSBmcm9tICdqcXVlcnknO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZXMnO1xuXG5jb25zdCBmYWNldFRlcm1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCggJy53aWRnZXRfZXAtZmFjZXQgLnRlcm1zJyApO1xuXG4vKipcbiAqIERyaWxsIGRvd24gZmFjZXQgY2hvaWNlc1xuICovXG5qUXVlcnkoIGZhY2V0VGVybXMgKS5vbiggJ2tleXVwJywgJy5mYWNldC1zZWFyY2gnLCBfLmRlYm91bmNlKCAoIGV2ZW50ICkgPT4ge1xuXHRpZiAoIDEzID09PSBldmVudC5rZXlDb2RlICkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGNvbnN0IHNlYXJjaFRlcm0gPSBldmVudC5jdXJyZW50VGFyZ2V0LnZhbHVlLnJlcGxhY2UoIC9cXHMvZywgJycgKS50b0xvd2VyQ2FzZSgpO1xuXHRjb25zdCB0ZXJtcyA9IGV2ZW50LmRlbGVnYXRlVGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoICcudGVybScgKTtcblxuXHR0ZXJtcy5mb3JFYWNoKCAoIHRlcm0gKSA9PiB7XG5cdFx0Y29uc3Qgc2x1ZyA9IHRlcm0uZ2V0QXR0cmlidXRlKCAnZGF0YS10ZXJtLXNsdWcnICk7XG5cdFx0Y29uc3QgbmFtZSA9IHRlcm0uZ2V0QXR0cmlidXRlKCAnZGF0YS10ZXJtLW5hbWUnICk7XG5cblx0XHRpZiAoIG5hbWUuaW5jbHVkZXMoIHNlYXJjaFRlcm0gKSB8fCBzbHVnLmluY2x1ZGVzKCBzZWFyY2hUZXJtICkgKSB7XG5cdFx0XHR0ZXJtLmNsYXNzTGlzdC5yZW1vdmUoICdoaWRlJyApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0ZXJtLmNsYXNzTGlzdC5hZGQoICdoaWRlJyApO1xuXHRcdH1cblx0fSApO1xufSwgMjAwICkgKTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciAkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2V4cG9ydCcpO1xudmFyICRpbmNsdWRlcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1pbmNsdWRlcycpLmluY2x1ZGVzO1xudmFyIGFkZFRvVW5zY29wYWJsZXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYWRkLXRvLXVuc2NvcGFibGVzJyk7XG5cbi8vIGBBcnJheS5wcm90b3R5cGUuaW5jbHVkZXNgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmluY2x1ZGVzXG4kKHsgdGFyZ2V0OiAnQXJyYXknLCBwcm90bzogdHJ1ZSB9LCB7XG4gIGluY2x1ZGVzOiBmdW5jdGlvbiBpbmNsdWRlcyhlbCAvKiAsIGZyb21JbmRleCA9IDAgKi8pIHtcbiAgICByZXR1cm4gJGluY2x1ZGVzKHRoaXMsIGVsLCBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZCk7XG4gIH1cbn0pO1xuXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUtQEB1bnNjb3BhYmxlc1xuYWRkVG9VbnNjb3BhYmxlcygnaW5jbHVkZXMnKTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciAkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2V4cG9ydCcpO1xudmFyIG5vdEFSZWdFeHAgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvbm90LWEtcmVnZXhwJyk7XG52YXIgcmVxdWlyZU9iamVjdENvZXJjaWJsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZXF1aXJlLW9iamVjdC1jb2VyY2libGUnKTtcbnZhciBjb3JyZWN0SXNSZWdFeHBMb2dpYyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jb3JyZWN0LWlzLXJlZ2V4cC1sb2dpYycpO1xuXG4vLyBgU3RyaW5nLnByb3RvdHlwZS5pbmNsdWRlc2AgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1zdHJpbmcucHJvdG90eXBlLmluY2x1ZGVzXG4kKHsgdGFyZ2V0OiAnU3RyaW5nJywgcHJvdG86IHRydWUsIGZvcmNlZDogIWNvcnJlY3RJc1JlZ0V4cExvZ2ljKCdpbmNsdWRlcycpIH0sIHtcbiAgaW5jbHVkZXM6IGZ1bmN0aW9uIGluY2x1ZGVzKHNlYXJjaFN0cmluZyAvKiAsIHBvc2l0aW9uID0gMCAqLykge1xuICAgIHJldHVybiAhIX5TdHJpbmcocmVxdWlyZU9iamVjdENvZXJjaWJsZSh0aGlzKSlcbiAgICAgIC5pbmRleE9mKG5vdEFSZWdFeHAoc2VhcmNoU3RyaW5nKSwgYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQpO1xuICB9XG59KTtcbiIsInZhciBpc1JlZ0V4cCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1yZWdleHAnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKGlzUmVnRXhwKGl0KSkge1xuICAgIHRocm93IFR5cGVFcnJvcihcIlRoZSBtZXRob2QgZG9lc24ndCBhY2NlcHQgcmVndWxhciBleHByZXNzaW9uc1wiKTtcbiAgfSByZXR1cm4gaXQ7XG59O1xuIiwidmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xuXG52YXIgTUFUQ0ggPSB3ZWxsS25vd25TeW1ib2woJ21hdGNoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE1FVEhPRF9OQU1FKSB7XG4gIHZhciByZWdleHAgPSAvLi87XG4gIHRyeSB7XG4gICAgJy8uLydbTUVUSE9EX05BTUVdKHJlZ2V4cCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0cnkge1xuICAgICAgcmVnZXhwW01BVENIXSA9IGZhbHNlO1xuICAgICAgcmV0dXJuICcvLi8nW01FVEhPRF9OQU1FXShyZWdleHApO1xuICAgIH0gY2F0Y2ggKGYpIHsgLyogZW1wdHkgKi8gfVxuICB9IHJldHVybiBmYWxzZTtcbn07XG4iXSwic291cmNlUm9vdCI6IiJ9;
/*! This file is auto-generated */
!function(d,l){"use strict";var e=!1,o=!1;if(l.querySelector)if(d.addEventListener)e=!0;if(d.wp=d.wp||{},!d.wp.receiveEmbedMessage)if(d.wp.receiveEmbedMessage=function(e){var t=e.data;if(t)if(t.secret||t.message||t.value)if(!/[^a-zA-Z0-9]/.test(t.secret)){var r,a,i,s,n,o=l.querySelectorAll('iframe[data-secret="'+t.secret+'"]'),c=l.querySelectorAll('blockquote[data-secret="'+t.secret+'"]');for(r=0;r<c.length;r++)c[r].style.display="none";for(r=0;r<o.length;r++)if(a=o[r],e.source===a.contentWindow){if(a.removeAttribute("style"),"height"===t.message){if(1e3<(i=parseInt(t.value,10)))i=1e3;else if(~~i<200)i=200;a.height=i}if("link"===t.message)if(s=l.createElement("a"),n=l.createElement("a"),s.href=a.getAttribute("src"),n.href=t.value,n.host===s.host)if(l.activeElement===a)d.top.location.href=t.value}}},e)d.addEventListener("message",d.wp.receiveEmbedMessage,!1),l.addEventListener("DOMContentLoaded",t,!1),d.addEventListener("load",t,!1);function t(){if(!o){o=!0;var e,t,r,a,i=-1!==navigator.appVersion.indexOf("MSIE 10"),s=!!navigator.userAgent.match(/Trident.*rv:11\./),n=l.querySelectorAll("iframe.wp-embedded-content");for(t=0;t<n.length;t++){if(!(r=n[t]).getAttribute("data-secret"))a=Math.random().toString(36).substr(2,10),r.src+="#?secret="+a,r.setAttribute("data-secret",a);if(i||s)(e=r.cloneNode(!0)).removeAttribute("security"),r.parentNode.replaceChild(e,r)}}}}(window,document);;
/* Do not modify this file directly. It is compiled from other files. */
//fgnass.github.com/spin.js#v1.3
/**
 * Copyright (c) 2011-2013 Felix Gnass
 * Licensed under the MIT license
 */
!function(t,e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):t.Spinner=e()}(this,function(){"use strict";var t,e=["webkit","Moz","ms","O"],i={};function o(t,e){var i,o=document.createElement(t||"div");for(i in e)o[i]=e[i];return o}function r(t){for(var e=1,i=arguments.length;e<i;e++)t.appendChild(arguments[e]);return t}var n,s=(n=o("style",{type:"text/css"}),r(document.getElementsByTagName("head")[0],n),n.sheet||n.styleSheet);function a(e,o,r,n){var a=["opacity",o,~~(100*e),r,n].join("-"),l=.01+r/n*100,f=Math.max(1-(1-e)/o*(100-l),e),p=t.substring(0,t.indexOf("Animation")).toLowerCase(),d=p&&"-"+p+"-"||"";return i[a]||(s.insertRule("@"+d+"keyframes "+a+"{0%{opacity:"+f+"}"+l+"%{opacity:"+e+"}"+(l+.01)+"%{opacity:1}"+(l+o)%100+"%{opacity:"+e+"}100%{opacity:"+f+"}}",s.cssRules.length),i[a]=1),a}function l(t,i){var o,r,n=t.style;if(void 0!==n[i])return i;for(i=i.charAt(0).toUpperCase()+i.slice(1),r=0;r<e.length;r++)if(void 0!==n[o=e[r]+i])return o}function f(t,e){for(var i in e)t.style[l(t,i)||i]=e[i];return t}function p(t){for(var e=1;e<arguments.length;e++){var i=arguments[e];for(var o in i)void 0===t[o]&&(t[o]=i[o])}return t}function d(t){for(var e={x:t.offsetLeft,y:t.offsetTop};t=t.offsetParent;)e.x+=t.offsetLeft,e.y+=t.offsetTop;return e}var c={lines:12,length:7,width:5,radius:10,rotate:0,corners:1,color:"#000",direction:1,speed:1,trail:100,opacity:.25,fps:20,zIndex:2e9,className:"spinner",top:"auto",left:"auto",position:"relative"};function u(t){if(void 0===this)return new u(t);this.opts=p(t||{},u.defaults,c)}u.defaults={},p(u.prototype,{spin:function(e){this.stop();var i,r,n=this,s=n.opts,a=n.el=f(o(0,{className:s.className}),{position:s.position,width:0,zIndex:s.zIndex}),l=s.radius+s.length+s.width;if(e&&(e.insertBefore(a,e.firstChild||null),r=d(e),i=d(a),f(a,{left:("auto"==s.left?r.x-i.x+(e.offsetWidth>>1):parseInt(s.left,10)+l)+"px",top:("auto"==s.top?r.y-i.y+(e.offsetHeight>>1):parseInt(s.top,10)+l)+"px"})),a.setAttribute("role","progressbar"),n.lines(a,n.opts),!t){var p,c=0,u=(s.lines-1)*(1-s.direction)/2,h=s.fps,y=h/s.speed,m=(1-s.opacity)/(y*s.trail/100),v=y/s.lines;!function t(){c++;for(var e=0;e<s.lines;e++)p=Math.max(1-(c+(s.lines-e)*v)%y*m,s.opacity),n.opacity(a,e*s.direction+u,p,s);n.timeout=n.el&&setTimeout(t,~~(1e3/h))}()}return n},stop:function(){var t=this.el;return t&&(clearTimeout(this.timeout),t.parentNode&&t.parentNode.removeChild(t),this.el=void 0),this},lines:function(e,i){var n,s=0,l=(i.lines-1)*(1-i.direction)/2;function p(t,e){return f(o(),{position:"absolute",width:i.length+i.width+"px",height:i.width+"px",background:t,boxShadow:e,transformOrigin:"left",transform:"rotate("+~~(360/i.lines*s+i.rotate)+"deg) translate("+i.radius+"px,0)",borderRadius:(i.corners*i.width>>1)+"px"})}for(;s<i.lines;s++)n=f(o(),{position:"absolute",top:1+~(i.width/2)+"px",transform:i.hwaccel?"translate3d(0,0,0)":"",opacity:i.opacity,animation:t&&a(i.opacity,i.trail,l+s*i.direction,i.lines)+" "+1/i.speed+"s linear infinite"}),i.shadow&&r(n,f(p("#000","0 0 4px #000"),{top:"2px"})),r(e,r(n,p(i.color,"0 0 1px rgba(0,0,0,.1)")));return e},opacity:function(t,e,i){e<t.childNodes.length&&(t.childNodes[e].style.opacity=i)}});var h=f(o("group"),{behavior:"url(#default#VML)"});return!l(h,"transform")&&h.adj?function(){function t(t,e){return o("<"+t+' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">',e)}s.addRule(".spin-vml","behavior:url(#default#VML)"),u.prototype.lines=function(e,i){var o=i.length+i.width,n=2*o;function s(){return f(t("group",{coordsize:n+" "+n,coordorigin:-o+" "+-o}),{width:n,height:n})}var a,l=2*-(i.width+i.length)+"px",p=f(s(),{position:"absolute",top:l,left:l});function d(e,n,a){r(p,r(f(s(),{rotation:360/i.lines*e+"deg",left:~~n}),r(f(t("roundrect",{arcsize:i.corners}),{width:o,height:i.width,left:i.radius,top:-i.width>>1,filter:a}),t("fill",{color:i.color,opacity:i.opacity}),t("stroke",{opacity:0}))))}if(i.shadow)for(a=1;a<=i.lines;a++)d(a,-2,"progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");for(a=1;a<=i.lines;a++)d(a);return r(e,p)},u.prototype.opacity=function(t,e,i,o){var r=t.firstChild;o=o.shadow&&o.lines||0,r&&e+o<r.childNodes.length&&(r=(r=(r=r.childNodes[e+o])&&r.firstChild)&&r.firstChild)&&(r.opacity=i)}}():t=l(h,"animation"),u});;
/* Do not modify this file directly. It is compiled from other files. */
/**
 * Copyright (c) 2011-2013 Felix Gnass
 * Licensed under the MIT license
 */
!function(e){if("object"==typeof exports)e(require("jquery"),require("spin"));else if("function"==typeof define&&define.amd)define(["jquery","spin"],e);else{if(!window.Spinner)throw new Error("Spin.js not present");e(window.jQuery,window.Spinner)}}(function(e,n){e.fn.spin=function(s,i){return this.each(function(){var t=e(this),r=t.data();if(r.spinner&&(r.spinner.stop(),delete r.spinner),!1!==s){if(void 0!==(s=e.extend({color:i||t.css("color")},e.fn.spin.presets[s]||s)).right&&void 0!==s.length&&void 0!==s.width&&void 0!==s.radius){var p=t.css("padding-left");p=void 0===p?0:parseInt(p,10),s.left=t.outerWidth()-2*(s.length+s.width+s.radius)-p-s.right,delete s.right}r.spinner=new n(s).spin(this)}})},e.fn.spin.presets={tiny:{lines:8,length:2,width:2,radius:3},small:{lines:8,length:4,width:3,radius:5},large:{lines:10,length:8,width:4,radius:8}}}),function(e){e.fn.spin.presets.wp={trail:60,speed:1.3},e.fn.spin.presets.small=e.extend({lines:8,length:2,width:2,radius:3},e.fn.spin.presets.wp),e.fn.spin.presets.medium=e.extend({lines:8,length:4,width:3,radius:5},e.fn.spin.presets.wp),e.fn.spin.presets.large=e.extend({lines:10,length:6,width:4,radius:7},e.fn.spin.presets.wp),e.fn.spin.presets["small-left"]=e.extend({left:5},e.fn.spin.presets.small),e.fn.spin.presets["small-right"]=e.extend({right:5},e.fn.spin.presets.small),e.fn.spin.presets["medium-left"]=e.extend({left:5},e.fn.spin.presets.medium),e.fn.spin.presets["medium-right"]=e.extend({right:5},e.fn.spin.presets.medium),e.fn.spin.presets["large-left"]=e.extend({left:5},e.fn.spin.presets.large),e.fn.spin.presets["large-right"]=e.extend({right:5},e.fn.spin.presets.large)}(jQuery);;
/* Do not modify this file directly. It is compiled from other files. */
/* global jetpackCarouselStrings, DocumentTouch */
jQuery(document).ready(function(e){var t,a,i,o,s,r,n,l,c,d,p,u,m,h,f,g,j,v,w,_=110,x=e("body").css("overflow"),b=e("html").css("overflow"),y="";window.innerWidth<=760&&(_=Math.round(window.innerWidth/760*110))<40&&("ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch)&&(_=0),void 0===Date.now&&(Date.now=function(){return(new Date).getTime()});var k=function(e){switch(e.which){case 38:e.preventDefault(),o.scrollTop(o.scrollTop()-100);break;case 40:e.preventDefault(),o.scrollTop(o.scrollTop()+100);break;case 39:e.preventDefault(),i.jp_carousel("next");break;case 37:case 8:e.preventDefault(),i.jp_carousel("previous");break;case 27:e.preventDefault(),o.jp_carousel("close")}},S=function(){clearTimeout(d),d=setTimeout(function(){i.jp_carousel("slides").jp_carousel("fitSlide",!0),i.jp_carousel("updateSlidePositions",!0),i.jp_carousel("fitMeta",!0)},200)},C=function(){e("a img[data-attachment-id]").each(function(){var t=e(this).parent();if(!t.parent(".gallery-icon").length&&void 0!==e(t).attr("href")){var a=!1;e(t).attr("href").split("?")[0]===e(this).attr("data-orig-file").split("?")[0]&&1===Number(jetpackCarouselStrings.single_image_gallery_media_file)&&(a=!0),e(t).attr("href")===e(this).attr("data-permalink")&&(a=!0),a&&(e(t).addClass("single-image-gallery"),e(t).data("carousel-extra",{blog_id:Number(jetpackCarouselStrings.blog_id)}))}})},I={testForData:function(t){return!(!(t=e(t)).length||!t.data("carousel-extra"))},testIfOpened:function(){return!(void 0===i||void 0===i.opened||!i.opened)},openOrSelectSlide:function(t){e(this).jp_carousel("testIfOpened")?i.jp_carousel("selectSlideAtIndex",t):e(this).jp_carousel("open",{start_index:t})},open:function(d){var m={items_selector:".gallery-item [data-attachment-id], .tiled-gallery-item [data-attachment-id], img[data-attachment-id]",start_index:0},h=e(this).data("carousel-extra");if(h&&(function(){if(!t){t=e("<div></div>").addClass("jp-carousel-overlay").css({position:"fixed",top:0,right:0,bottom:0,left:0});var d='<a class="jp-carousel-commentlink" href="#">'+jetpackCarouselStrings.comment+"</a>";Number(jetpackCarouselStrings.is_logged_in),d=e('<div class="jp-carousel-buttons">'+d+"</div>"),c=e('<h2 itemprop="caption description"></h2>'),p=e('<div class="jp-carousel-photo-info"></div>').append(c),(f=e("<div></div>").addClass("jp-carousel-image-meta").css({float:"right","margin-top":"20px",width:"250px"})).append(d).append("<ul class='jp-carousel-image-exif' style='display:none;'></ul>").append("<a class='jp-carousel-image-download' style='display:none;'></a>").append("<div class='jp-carousel-image-map' style='display:none;'></div>"),g=e("<div></div>").addClass("jp-carousel-titleanddesc").css({width:"100%","margin-top":f.css("margin-top")});var m='<div id="jp-carousel-comment-form-container">';jetpackCarouselStrings.local_comments_commenting_as&&jetpackCarouselStrings.local_comments_commenting_as.length&&(1!==Number(jetpackCarouselStrings.is_logged_in)&&1===Number(jetpackCarouselStrings.comment_registration)?m+='<div id="jp-carousel-comment-form-commenting-as">'+jetpackCarouselStrings.local_comments_commenting_as+"</div>":(m+='<form id="jp-carousel-comment-form">',m+='<textarea name="comment" class="jp-carousel-comment-form-field jp-carousel-comment-form-textarea" id="jp-carousel-comment-form-comment-field" placeholder="'+jetpackCarouselStrings.write_comment+'"></textarea>',m+='<div id="jp-carousel-comment-form-submit-and-info-wrapper">',m+='<div id="jp-carousel-comment-form-commenting-as">'+jetpackCarouselStrings.local_comments_commenting_as+"</div>",m+='<input type="submit" name="submit" class="jp-carousel-comment-form-button" id="jp-carousel-comment-form-button-submit" value="'+jetpackCarouselStrings.post_comment+'" />',m+='<span id="jp-carousel-comment-form-spinner">&nbsp;</span>',m+='<div id="jp-carousel-comment-post-results"></div>',m+="</div>",m+="</form>")),j=e(m+="</div>").css({width:"100%","margin-top":"20px",color:"#999"}),a=e("<div></div>").addClass("jp-carousel-comments").css({width:"100%",bottom:"10px","margin-top":"20px"});var h=e('<div id="jp-carousel-comments-loading"><span>'+jetpackCarouselStrings.loading_comments+"</span></div>").css({width:"100%",bottom:"10px","margin-top":"20px"}),w=e(window).width()-2*_-(f.width()+40);w+="px",v=e("<div></div>").addClass("jp-carousel-left-column-wrapper").css({width:Math.floor(w)}).append(g).append(j).append(a).append(h);var x=e("<div></div>").addClass("jp-carousel-fadeaway");n=e("<div></div>").addClass("jp-carousel-info").css({top:Math.floor(e(window).height()/100*85),left:_,right:_}).append(p).append(f),window.innerWidth<=760?(p.remove().insertAfter(g),n.prepend(v)):n.append(v);var b=e(window).height()-parseInt(n.css("top"),10)+"px";s=e("<div><span></span></div>").addClass("jp-carousel-next-button").css({right:"15px"}).hide(),r=e("<div><span></span></div>").addClass("jp-carousel-previous-button").css({left:0}).hide(),s.add(r).css({position:"fixed",top:"40px",bottom:b,width:_}),i=e("<div></div>").addClass("jp-carousel").css({position:"absolute",top:0,bottom:b,left:0,right:0}),u=e('<div class="jp-carousel-close-hint"><span>&times;</span></div>').css({position:"fixed"}),o=e("<div></div>").addClass("jp-carousel-wrap").addClass("jp-carousel-transitions"),"white"===jetpackCarouselStrings.background_color&&o.addClass("jp-carousel-light"),o.attr("itemscope",""),o.attr("itemtype","https://schema.org/ImageGallery"),o.css({position:"fixed",top:0,right:0,bottom:0,left:0,"z-index":2147483647,"overflow-x":"hidden","overflow-y":"auto",direction:"ltr"}).hide().append(t).append(i).append(x).append(n).append(s).append(r).append(u).appendTo(e("body")).click(function(t){var a=e(t.target),s=a.parents("div.jp-carousel-wrap"),r=s.data("carousel-extra"),l=s.find("div.selected").data("attachment-id");if(r=r||[],a.is(i)||a.parents().add(a).is(u))o.jp_carousel("close");else if(a.hasClass("jp-carousel-commentlink"))t.preventDefault(),t.stopPropagation(),e(window).unbind("keydown",k),o.animate({scrollTop:parseInt(n.position().top,10)},"fast"),e("#jp-carousel-comment-form-submit-and-info-wrapper").slideDown("fast"),e("#jp-carousel-comment-form-comment-field").focus();else if(a.hasClass("jp-carousel-comment-login")){var c=jetpackCarouselStrings.login_url+"%23jp-carousel-"+l;window.location.href=c}else if(a.parents("#jp-carousel-comment-form-container").length){var d=e("#jp-carousel-comment-form-comment-field").blur(function(){e(window).bind("keydown",k)}).focus(function(){e(window).unbind("keydown",k)}),p=e("#jp-carousel-comment-form-email-field").blur(function(){e(window).bind("keydown",k)}).focus(function(){e(window).unbind("keydown",k)}),m=e("#jp-carousel-comment-form-author-field").blur(function(){e(window).bind("keydown",k)}).focus(function(){e(window).unbind("keydown",k)}),h=e("#jp-carousel-comment-form-url-field").blur(function(){e(window).bind("keydown",k)}).focus(function(){e(window).unbind("keydown",k)});if(d&&d.attr("id")===a.attr("id"))e(window).unbind("keydown",k),e("#jp-carousel-comment-form-submit-and-info-wrapper").slideDown("fast");else if(a.is('input[type="submit"]')){t.preventDefault(),t.stopPropagation(),e("#jp-carousel-comment-form-spinner").spin("small","white");var f={action:"post_attachment_comment",nonce:jetpackCarouselStrings.nonce,blog_id:r.blog_id,id:l,comment:d.val()};if(!f.comment.length)return void i.jp_carousel("postCommentError",{field:"jp-carousel-comment-form-comment-field",error:jetpackCarouselStrings.no_comment_text});if(1!==Number(jetpackCarouselStrings.is_logged_in)&&(f.email=p.val(),f.author=m.val(),f.url=h.val(),1===Number(jetpackCarouselStrings.require_name_email))){if(!f.email.length||!f.email.match("@"))return void i.jp_carousel("postCommentError",{field:"jp-carousel-comment-form-email-field",error:jetpackCarouselStrings.no_comment_email});if(!f.author.length)return void i.jp_carousel("postCommentError",{field:"jp-carousel-comment-form-author-field",error:jetpackCarouselStrings.no_comment_author})}e.ajax({type:"POST",url:jetpackCarouselStrings.ajaxurl,data:f,dataType:"json",success:function(t){"approved"===t.comment_status?e("#jp-carousel-comment-post-results").slideUp("fast").html('<span class="jp-carousel-comment-post-success">'+jetpackCarouselStrings.comment_approved+"</span>").slideDown("fast"):"unapproved"===t.comment_status?e("#jp-carousel-comment-post-results").slideUp("fast").html('<span class="jp-carousel-comment-post-success">'+jetpackCarouselStrings.comment_unapproved+"</span>").slideDown("fast"):e("#jp-carousel-comment-post-results").slideUp("fast").html('<span class="jp-carousel-comment-post-error">'+jetpackCarouselStrings.comment_post_error+"</span>").slideDown("fast"),i.jp_carousel("clearCommentTextAreaValue"),i.jp_carousel("getComments",{attachment_id:l,offset:0,clear:!0}),e("#jp-carousel-comment-form-button-submit").val(jetpackCarouselStrings.post_comment),e("#jp-carousel-comment-form-spinner").spin(!1)},error:function(){i.jp_carousel("postCommentError",{field:"jp-carousel-comment-form-comment-field",error:jetpackCarouselStrings.comment_post_error})}})}}else a.parents(".jp-carousel-info").length||o.jp_carousel("next")}).bind("jp_carousel.afterOpen",function(){e(window).bind("keydown",k),e(window).bind("resize",S),i.opened=!0,S()}).bind("jp_carousel.beforeClose",function(){var t=e(window).scrollTop();e(window).unbind("keydown",k),e(window).unbind("resize",S),e(window).scrollTop(t),e(".jp-carousel-previous-button").hide(),e(".jp-carousel-next-button").hide(),e("html").css("height","")}).bind("jp_carousel.afterClose",function(){window.location.hash&&history.back&&history.back(),y="",i.opened=!1}).on("transitionend.jp-carousel ",".jp-carousel-slide",function(t){if("transform"===t.originalEvent.propertyName){var a=(Date.now()-l)/1e3/t.originalEvent.elapsedTime;o.off("transitionend.jp-carousel"),a>=2&&e(".jp-carousel-transitions").removeClass("jp-carousel-transitions")}}),e(".jp-carousel-wrap").touchwipe({wipeLeft:function(e){e.preventDefault(),i.jp_carousel("next")},wipeRight:function(e){e.preventDefault(),i.jp_carousel("previous")},preventDefaultEvents:!1}),s.add(r).click(function(e){e.preventDefault(),e.stopPropagation(),s.is(this)?i.jp_carousel("next"):i.jp_carousel("previous")})}}(),!i.jp_carousel("testIfOpened")))return x=e("body").css("overflow"),e("body").css("overflow","hidden"),b=e("html").css("overflow"),e("html").css("overflow","hidden"),w=e(window).scrollTop(),o.data("carousel-extra",h),this.each(function(){var t=e(this);d&&e.extend(m,d),-1===m.start_index&&(m.start_index=0),o.trigger("jp_carousel.beforeOpen").fadeIn("fast",function(){o.trigger("jp_carousel.afterOpen"),i.jp_carousel("initSlides",t.find(m.items_selector),m.start_index).jp_carousel("selectSlideAtIndex",m.start_index)}),i.html("")})},selectSlideAtIndex:function(e){var t=this.jp_carousel("slides"),a=t.eq(e);return 0===a.length&&(a=t.eq(0)),i.jp_carousel("selectSlide",a,!1),this},close:function(){return e("body").css("overflow",x),e("html").css("overflow",b),this.jp_carousel("clearCommentTextAreaValue"),o.trigger("jp_carousel.beforeClose").fadeOut("fast",function(){o.trigger("jp_carousel.afterClose"),e(window).scrollTop(w)})},next:function(){this.jp_carousel("previousOrNext","nextSlide")},previous:function(){this.jp_carousel("previousOrNext","prevSlide")},previousOrNext:function(e){if(!this.jp_carousel("hasMultipleImages"))return!1;var t=i.jp_carousel(e);t&&(o.animate({scrollTop:0},"fast"),this.jp_carousel("clearCommentTextAreaValue"),this.jp_carousel("selectSlide",t))},selectedSlide:function(){return this.find(".selected")},setSlidePosition:function(e){return l=Date.now(),this.css({"-webkit-transform":"translate3d("+e+"px,0,0)","-moz-transform":"translate3d("+e+"px,0,0)","-ms-transform":"translate("+e+"px,0)","-o-transform":"translate("+e+"px,0)",transform:"translate3d("+e+"px,0,0)"})},updateSlidePositions:function(e){var t=this.jp_carousel("selectedSlide"),a=i.width(),o=t.width(),s=i.jp_carousel("prevSlide"),r=i.jp_carousel("nextSlide"),n=s.prev(),l=r.next(),c=Math.floor(.5*(a-o));t.jp_carousel("setSlidePosition",c).show(),i.jp_carousel("fitInfo",e),1===(h.is(t.prevAll())?1:-1)?(l.is(s)||l.jp_carousel("setSlidePosition",a+r.width()).show(),n.is(r)||n.jp_carousel("setSlidePosition",-n.width()-o).show()):l.is(s)||l.jp_carousel("setSlidePosition",a+o).show(),s.jp_carousel("setSlidePosition",Math.floor(-s.width()+.75*_)).show(),r.jp_carousel("setSlidePosition",Math.ceil(a-.75*_)).show()},selectSlide:function(t,a){h=this.find(".selected").removeClass("selected");var s,r,n=i.jp_carousel("slides").css({position:"fixed"}),l=e(t).addClass("selected").css({position:"relative"}),d=l.data("attachment-id"),p=i.jp_carousel("prevSlide"),u=i.jp_carousel("nextSlide"),m=p.prev(),f=u.next();i.jp_carousel("loadFullImage",l),c.hide(),0===u.length&&n.length<=2?e(".jp-carousel-next-button").hide():e(".jp-carousel-next-button").show(),0===p.length&&n.length<=2?e(".jp-carousel-previous-button").hide():e(".jp-carousel-previous-button").show(),s=l.add(p).add(m).add(u).add(f).jp_carousel("loadSlide"),n.not(s).hide(),i.jp_carousel("updateSlidePositions",a),o.trigger("jp_carousel.selectSlide",[l]),i.jp_carousel("getTitleDesc",{title:l.data("title"),desc:l.data("desc")});var g=l.data("image-meta");i.jp_carousel("updateExif",g),i.jp_carousel("updateFullSizeLink",l),i.jp_carousel("updateMap",g),i.jp_carousel("testCommentsOpened",l.data("comments-opened")),i.jp_carousel("getComments",{attachment_id:d,offset:0,clear:!0}),e("#jp-carousel-comment-post-results").slideUp(),l.data("caption")?((r=e("<div />").text(l.data("caption")).html())===e("<div />").text(l.data("title")).html()&&e(".jp-carousel-titleanddesc-title").fadeOut("fast").empty(),r===e("<div />").text(l.data("desc")).html()&&e(".jp-carousel-titleanddesc-desc").fadeOut("fast").empty(),c.html(l.data("caption")).fadeIn("slow")):c.fadeOut("fast").empty(),jetpackCarouselStrings.stats&&((new Image).src=document.location.protocol+"//pixel.wp.com/g.gif?"+jetpackCarouselStrings.stats+"&post="+encodeURIComponent(d)+"&rand="+Math.random()),e(u).add(p).each(function(){i.jp_carousel("loadFullImage",e(this))}),window.location.hash=y="#jp-carousel-"+d},slides:function(){return this.find(".jp-carousel-slide")},slideDimensions:function(){return{width:e(window).width()-2*_,height:Math.floor(e(window).height()/100*85-60)}},loadSlide:function(){return this.each(function(){var t=e(this);t.find("img").one("load",function(){t.jp_carousel("fitSlide",!1)})})},bestFit:function(){var e,t,a=i.jp_carousel("slideDimensions"),o=this.jp_carousel("originalDimensions"),s=o.width/o.height,r=1,n=1;return o.width>a.width&&(r=a.width/o.width),o.height>a.height&&(n=a.height/o.height),r<n?(e=a.width,t=Math.floor(e/s)):n<r?(t=a.height,e=Math.floor(t*s)):(e=o.width,t=o.height),{width:e,height:t}},fitInfo:function(){var e=this.jp_carousel("selectedSlide").jp_carousel("bestFit");return p.css({left:Math.floor(.5*(n.width()-e.width)),width:Math.floor(e.width)}),this},fitMeta:function(t){var a={top:Math.floor(e(window).height()/100*85+5)+"px"},i={width:n.width()-(f.width()+80)+"px"};t?(n.animate(a),v.animate(i)):(n.animate(a),v.css(i))},fitSlide:function(){return this.each(function(){var t=e(this),a=t.jp_carousel("bestFit"),o=i.jp_carousel("slideDimensions");a.left=0,a.top=Math.floor(.5*(o.height-a.height))+40,t.css(a)})},texturize:function(t){return t=(t=(t=(t=""+t).replace(/'/g,"&#8217;").replace(/&#039;/g,"&#8217;").replace(/[\u2019]/g,"&#8217;")).replace(/"/g,"&#8221;").replace(/&#034;/g,"&#8221;").replace(/&quot;/g,"&#8221;").replace(/[\u201D]/g,"&#8221;")).replace(/([\w]+)=&#[\d]+;(.+?)&#[\d]+;/g,'$1="$2"'),e.trim(t)},initSlides:function(t,a){t.length<2?e(".jp-carousel-next-button, .jp-carousel-previous-button").hide():e(".jp-carousel-next-button, .jp-carousel-previous-button").show(),t.each(function(){var t,a=e(this),o=a.data("orig-size")||"",s=i.jp_carousel("slideDimensions"),r=o.split(","),n=a.data("medium-file")||"",l=a.data("large-file")||"";o={width:parseInt(r[0],10),height:parseInt(r[1],10)},t=a.data("orig-file"),t=i.jp_carousel("selectBestImageSize",{orig_file:t,orig_width:o.width,orig_height:o.height,max_width:s.width,max_height:s.height,medium_file:n,large_file:l}),e(this).data("gallery-src",t)}),0!==a&&(e("<img/>")[0].src=e(t[a]).data("gallery-src"));var o=t.first().closest(".tiled-gallery.type-rectangular").length>0;return t.each(function(t){var s=e(this),r=s.data("attachment-id")||0,n=s.data("comments-opened")||0,l=s.data("image-meta")||{},c=s.data("orig-size")||"",d={width:s[0].naturalWidth,height:s[0].naturalHeight},p=s.data("image-title")||"",u=s.data("image-description")||"",m=s.parents(".gallery-item").find(".gallery-caption").html()||"",h=s.data("gallery-src")||"",f=s.data("medium-file")||"",g=s.data("large-file")||"",j=s.data("orig-file")||"",v=s.parents("div.tiled-gallery-item").find("div.tiled-gallery-caption").html();if(v&&(m=v),r&&c.length){p=i.jp_carousel("texturize",p),u=i.jp_carousel("texturize",u),m=i.jp_carousel("texturize",m);var w=e("<img/>").attr("src","data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7").css("width","100%").css("height","100%"),_=e('<div class="jp-carousel-slide" itemprop="associatedMedia" itemscope itemtype="https://schema.org/ImageObject"></div>').hide().css({left:t<a?-1e3:i.width()}).append(w).appendTo(i).data("src",h).data("title",p).data("desc",u).data("caption",m).data("attachment-id",r).data("permalink",s.parents("a").attr("href")).data("orig-size",c).data("comments-opened",n).data("image-meta",l).data("medium-file",f).data("large-file",g).data("orig-file",j).data("thumb-size",d);o&&_.data("preview-image",s.attr("src")).css({"background-image":'url("'+s.attr("src")+'")',"background-size":"100% 100%","background-position":"center center"}),_.jp_carousel("fitSlide",!1)}}),this},selectBestImageSize:function(e){if("object"!=typeof e&&(e={}),void 0===e.orig_file)return"";if(void 0===e.orig_width||void 0===e.max_width)return e.orig_file;if(void 0===e.medium_file||void 0===e.large_file)return e.orig_file;var t=document.createElement("a");t.href=e.large_file;var a=/^i[0-2].wp.com$/i.test(t.hostname),o=i.jp_carousel("getImageSizeParts",e.medium_file,e.orig_width,a),s=i.jp_carousel("getImageSizeParts",e.large_file,e.orig_width,a),r=parseInt(s[0],10),n=parseInt(s[1],10),l=parseInt(o[0],10),c=parseInt(o[1],10);if(e.orig_max_width=e.max_width,e.orig_max_height=e.max_height,void 0!==window.devicePixelRatio&&window.devicePixelRatio>1&&(e.max_width=e.max_width*window.devicePixelRatio,e.max_height=e.max_height*window.devicePixelRatio),r>=e.max_width||n>=e.max_height)return e.large_file;if(l>=e.max_width||c>=e.max_height)return e.medium_file;if(a){var d=e.large_file.lastIndexOf("?"),p=e.large_file;return-1!==d&&(p=e.large_file.substring(0,d),(e.orig_width>e.max_width||e.orig_height>e.max_height)&&(p+="?fit="+e.orig_max_width+"%2C"+e.orig_max_height)),p}return e.orig_file},getImageSizeParts:function(e,t,a){var i=a?e.replace(/.*=([\d]+%2C[\d]+).*$/,"$1"):e.replace(/.*-([\d]+x[\d]+)\..+$/,"$1"),o=i!==e?a?i.split("%2C"):i.split("x"):[t,0];return"9999"===o[0]&&(o[0]="0"),"9999"===o[1]&&(o[1]="0"),o},originalDimensions:function(){var t=e(this).data("orig-size").split(",");return{width:parseInt(t[0],10),height:parseInt(t[1],10)}},format:function(e){if("object"!=typeof e&&(e={}),e.text&&void 0!==e.text)return e.replacements&&void 0!==e.replacements?e.text.replace(/{(\d+)}/g,function(t,a){return void 0!==e.replacements[a]?e.replacements[a]:t}):e.text},shutterSpeed:function(e){return e>=1?Math.round(10*e)/10+"s":"1/"+Math.round(1/e)+"s"},parseTitleDesc:function(e){return!e.match(" ")&&e.match("_")?"":e},getTitleDesc:function(t){var a,o,s="",r="";(o=e("div.jp-carousel-titleanddesc","div.jp-carousel-wrap")).hide(),s=i.jp_carousel("parseTitleDesc",t.title)||"",a=i.jp_carousel("parseTitleDesc",t.desc)||"",(s.length||a.length)&&(e("<div />").html(s).text()===e("<div />").html(a).text()&&(s=""),r=s.length?'<div class="jp-carousel-titleanddesc-title">'+s+"</div>":"",r+=a.length?'<div class="jp-carousel-titleanddesc-desc">'+a+"</div>":"",o.html(r).fadeIn("slow")),e("div#jp-carousel-comment-form-container").css("margin-top","20px"),e("div#jp-carousel-comments-loading").css("margin-top","20px")},updateExif:function(t){if(!t||1!==Number(jetpackCarouselStrings.display_exif))return!1;var a=e("<ul class='jp-carousel-image-exif'></ul>");e.each(t,function(t,o){if(0!==parseFloat(o)&&o.length&&-1!==e.inArray(t,e.makeArray(jetpackCarouselStrings.meta_data))){switch(t){case"focal_length":o+="mm";break;case"shutter_speed":o=i.jp_carousel("shutterSpeed",o);break;case"aperture":o="f/"+o}a.append("<li><h5>"+jetpackCarouselStrings[t]+"</h5>"+o+"</li>")}}),e("div.jp-carousel-image-meta ul.jp-carousel-image-exif").replaceWith(a)},updateFullSizeLink:function(t){if(!t||!t.data)return!1;var a,o=t.data("orig-size").split(","),s=document.createElement("a");s.href=t.data("src").replace(/\?.+$/,""),a=null!==s.hostname.match(/^i[\d]{1}.wp.com$/i)?s.href:t.data("orig-file").replace(/\?.+$/,"");var r=e("<a>"+i.jp_carousel("format",{text:jetpackCarouselStrings.download_original,replacements:o})+"</a>").addClass("jp-carousel-image-download").attr("href",a).attr("target","_blank");e("div.jp-carousel-image-meta a.jp-carousel-image-download").replaceWith(r)},updateMap:function(t){if(t.latitude&&t.longitude&&1===Number(jetpackCarouselStrings.display_geo)){var a=t.latitude,i=t.longitude,o=e("div.jp-carousel-image-meta","div.jp-carousel-wrap"),s="&scale=2&style=feature:all|element:all|invert_lightness:true|hue:0x0077FF|saturation:-50|lightness:-5|gamma:0.91";e("<div></div>").addClass("jp-carousel-image-map").html('<img width="154" height="154" src="https://maps.googleapis.com/maps/api/staticmap?\t\t\t\t\t\t\tcenter='+a+","+i+"&\t\t\t\t\t\t\tzoom=8&\t\t\t\t\t\t\tsize=154x154&\t\t\t\t\t\t\tsensor=false&\t\t\t\t\t\t\tmarkers=size:medium%7Ccolor:blue%7C"+a+","+i+s+'" class="gmap-main" />\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="gmap-topright"><div class="imgclip"><img width="175" height="154" src="https://maps.googleapis.com/maps/api/staticmap?\t\t\t\t\t\t\tcenter='+a+","+i+"&\t\t\t\t\t\t\tzoom=3&\t\t\t\t\t\t\tsize=175x154&\t\t\t\t\t\t\tsensor=false&\t\t\t\t\t\t\tmarkers=size:small%7Ccolor:blue%7C"+a+","+i+s+'"c /></div></div>\t\t\t\t\t\t\t\t\t\t\t\t\t').prependTo(o)}},testCommentsOpened:function(t){1===parseInt(t,10)?(e(".jp-carousel-buttons").fadeIn("fast"),j.fadeIn("fast")):(e(".jp-carousel-buttons").fadeOut("fast"),j.fadeOut("fast"))},getComments:function(t){if(clearInterval(m),"object"==typeof t&&void 0!==t.attachment_id&&t.attachment_id){(!t.offset||void 0===t.offset||t.offset<1)&&(t.offset=0);var a=e(".jp-carousel-comments"),o=e("#jp-carousel-comments-loading").show();t.clear&&a.hide().empty(),e.ajax({type:"GET",url:jetpackCarouselStrings.ajaxurl,dataType:"json",data:{action:"get_attachment_comments",nonce:jetpackCarouselStrings.nonce,id:t.attachment_id,offset:t.offset},success:function(s){t.clear&&a.fadeOut("fast").empty(),e(s).each(function(){var o=e("<div></div>").addClass("jp-carousel-comment").attr("id","jp-carousel-comment-"+this.id).html('<div class="comment-gravatar">'+this.gravatar_markup+'</div><div class="comment-author">'+this.author_markup+'</div><div class="comment-date">'+this.date_gmt+'</div><div class="comment-content">'+this.content+"</div>");a.append(o),clearInterval(m),m=setInterval(function(){e(".jp-carousel-overlay").height()-150<e(".jp-carousel-wrap").scrollTop()+e(window).height()&&(i.jp_carousel("getComments",{attachment_id:t.attachment_id,offset:t.offset+10,clear:!1}),clearInterval(m))},300)});var r=e(".jp-carousel div.selected");if(r&&r.data&&r.data("attachment-id")!=t.attachment_id)return a.fadeOut("fast"),void a.empty();e(".jp-carousel-overlay").height(e(window).height()+g.height()+j.height()+(a.height()>0?a.height():f.height())+200),a.show(),o.hide()},error:function(e,t,i){console.log("Comment get fail...",e,t,i),a.fadeIn("fast"),o.fadeOut("fast")}})}},postCommentError:function(t){"object"!=typeof t&&(t={}),t.field&&void 0!==t.field&&t.error&&void 0!==t.error&&(e("#jp-carousel-comment-post-results").slideUp("fast").html('<span class="jp-carousel-comment-post-error">'+t.error+"</span>").slideDown("fast"),e("#jp-carousel-comment-form-spinner").spin(!1))},setCommentIframeSrc:function(t){var a=e("#jp-carousel-comment-iframe");a&&a.length&&(a.attr("src",a.attr("src").replace(/(postid=)\d+/,"$1"+t)),a.attr("src",a.attr("src").replace(/(%23.+)?$/,"%23jp-carousel-"+t)))},clearCommentTextAreaValue:function(){var t=e("#jp-carousel-comment-form-comment-field");t&&t.val("")},nextSlide:function(){var e=this.jp_carousel("slides"),t=this.jp_carousel("selectedSlide");return 0===t.length||e.length>2&&t.is(e.last())?e.first():t.next()},prevSlide:function(){var e=this.jp_carousel("slides"),t=this.jp_carousel("selectedSlide");return 0===t.length||e.length>2&&t.is(e.first())?e.last():t.prev()},loadFullImage:function(t){var a=t.find("img:first");a.data("loaded")||(a.on("load.jetpack",function(){a.off("load.jetpack"),e(this).closest(".jp-carousel-slide").css("background-image","")}),!t.data("preview-image")||t.data("thumb-size")&&t.width()>t.data("thumb-size").width?a.attr("src",a.closest(".jp-carousel-slide").data("src")).attr("itemprop","image"):a.attr("src",t.data("preview-image")).attr("itemprop","image"),a.data("loaded",1))},hasMultipleImages:function(){return i.jp_carousel("slides").length>1}};e.fn.jp_carousel=function(t){return I[t]?I[t].apply(this,Array.prototype.slice.call(arguments,1)):"object"!=typeof t&&t?void e.error("Method "+t+" does not exist on jQuery.jp_carousel"):I.open.apply(this,arguments)},e(document.body).on("click.jp-carousel","div.gallery, div.tiled-gallery, ul.wp-block-gallery, ul.blocks-gallery-grid, div.wp-block-jetpack-tiled-gallery, a.single-image-gallery",function(t){e(this).jp_carousel("testForData",t.currentTarget)&&(e(t.target).parent().hasClass("gallery-caption")||e(t.target).parent().is("figcaption")||(e("html").css("height","auto"),t.preventDefault(),t.stopPropagation(),e(this).jp_carousel("open",{start_index:e(this).find(".gallery-item, .tiled-gallery-item, .blocks-gallery-item, .tiled-gallery__item").index(e(t.target).parents(".gallery-item, .tiled-gallery-item, .blocks-gallery-item, .tiled-gallery__item"))})))}),1===Number(jetpackCarouselStrings.single_image_gallery)&&(C(),e(document.body).on("post-load",function(){C()})),e(window).on("hashchange.jp-carousel",function(){var t,a,s,r=/jp-carousel-(\d+)/;window.location.hash&&r.test(window.location.hash)?window.location.hash===y&&i.opened||(window.location.hash&&i&&!i.opened&&history.back?history.back():(y=window.location.hash,t=window.location.hash.match(r),a=parseInt(t[1],10),e("div.gallery, div.tiled-gallery, a.single-image-gallery, ul.wp-block-gallery, div.wp-block-jetpack-tiled-gallery").each(function(t,i){if(e(i).find("img").each(function(t,o){if(e(o).data("attachment-id")===parseInt(a,10))return s={index:t,gallery:i},!1}),s)return e(s.gallery).jp_carousel("openOrSelectSlide",s.index),!1}))):i&&i.opened&&o.jp_carousel("close")}),window.location.hash&&e(window).trigger("hashchange")}),function(e){e.fn.touchwipe=function(t){var a={min_move_x:20,min_move_y:20,wipeLeft:function(){},wipeRight:function(){},wipeUp:function(){},wipeDown:function(){},preventDefaultEvents:!0};return t&&e.extend(a,t),this.each(function(){var e,t,i=!1;function o(){this.removeEventListener("touchmove",s),e=null,i=!1}function s(s){if(a.preventDefaultEvents&&s.preventDefault(),i){var r=s.touches[0].pageX,n=s.touches[0].pageY,l=e-r,c=t-n;Math.abs(l)>=a.min_move_x?(o(),l>0?a.wipeLeft(s):a.wipeRight(s)):Math.abs(c)>=a.min_move_y&&(o(),c>0?a.wipeDown(s):a.wipeUp(s))}}"ontouchstart"in document.documentElement&&this.addEventListener("touchstart",function(a){1===a.touches.length&&(e=a.touches[0].pageX,t=a.touches[0].pageY,i=!0,this.addEventListener("touchmove",s,!1))},!1)}),this}}(jQuery);;
var ak_js = document.getElementById( "ak_js" );

if ( ! ak_js ) {
	ak_js = document.createElement( 'input' );
	ak_js.setAttribute( 'id', 'ak_js' );
	ak_js.setAttribute( 'name', 'ak_js' );
	ak_js.setAttribute( 'type', 'hidden' );
}
else {
	ak_js.parentNode.removeChild( ak_js );
}

ak_js.setAttribute( 'value', ( new Date() ).getTime() );

var commentForm = document.getElementById( 'commentform' );

if ( commentForm ) {
	commentForm.appendChild( ak_js );
}
else {
	var replyRowContainer = document.getElementById( 'replyrow' );

	if ( replyRowContainer ) {
		var children = replyRowContainer.getElementsByTagName( 'td' );

		if ( children.length > 0 ) {
			children[0].appendChild( ak_js );
		}
	}
};
