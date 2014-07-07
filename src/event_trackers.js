/**
* Copyright (c) 2012-2014, 2degrees Limited <2degrees-floss@googlegroups.com>.
* All Rights Reserved.
*
* This file is part of event-nexus
* <https://github.com/2degrees/event-nexus>, which is subject to
* the provisions of the BSD at
* <http://dev.2degreesnetwork.com/p/2degrees-license.html>. A copy of the
* license should accompany this distribution. THIS SOFTWARE IS PROVIDED "AS IS"
* AND ANY AND ALL EXPRESS OR IMPLIED WARRANTIES ARE DISCLAIMED, INCLUDING, BUT
* NOT LIMITED TO, THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY, AGAINST
* INFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE.
*
* Dependencies:
* - jQuery 1.7.2+
* - require.js (or other AMD loader)
*
*/

define(['jquery'], function ($) {

    'use strict';

    var UserInteractionTracker = function (
        element_selector,
        event_name,
        tracking_data
    ) {
        this.element_selector = element_selector;
        this.event_name = event_name;
        this.tracking_data = $.extend({is_interactive: true}, tracking_data);
    };

    UserInteractionTracker.prototype.bind = function (tracking_data_handler) {
        var self = this;
        $(document).on(self.event_name, self.element_selector, function () {
            var tracking_data = resolve_tracking_data(
                self.tracking_data,
                $(this)
            );
            tracking_data_handler(tracking_data);
        });
    };


    var build_specific_user_interaction_tracker = function (event_name) {
        return function (element_selector, tracking_data) {
            return new UserInteractionTracker(
                element_selector,
                event_name,
                tracking_data
            );
        };
    };


    /**
     * Tracker for links which leave the current page.
     *
     * @param {String} element_selector
     * @param {Object} tracking_data
     */
    var OutboundLinkTracker = function (element_selector, tracking_data) {
        this.element_selector = element_selector;
        this.tracking_data = $.extend({is_interactive: true}, tracking_data);
    };
    OutboundLinkTracker.prototype.bind = function (tracking_data_handler) {
        var self = this;

        var handler = function (event) {
            var $element = $(this);
            if (!$element.attr('href')) {
                $.error(
                    'Cannot use OutboundLinkTracker on elements without "href"'
                );
            }

            var tracking_data = resolve_tracking_data(
                self.tracking_data,
                $element
            );
            tracking_data_handler(tracking_data);

            // Delay outbound click
            if (event.metaKey || event.ctrlKey) {
                event.preventDefault();
                setTimeout(
                    function () { location.href = $element.attr('href'); },
                    100
                );
                $(document).off('click.event_nexus', self.element_selector);
            }
        };

        $(document).on('click.event_nexus', self.element_selector, handler);
    };


    var ElementImpressionTracker = function (element_selector, tracking_data) {
        this.element_selector = element_selector;
        this.tracking_data = $.extend({is_interactive: false}, tracking_data);
    };

    ElementImpressionTracker.prototype.bind = function (tracking_data_handler) {
        var self = this;

        $(function () {
            var $matching_elements = $(self.element_selector);
            $matching_elements.each(function () {
                var tracking_data = resolve_tracking_data(
                    self.tracking_data,
                    $(this)
                );
                tracking_data_handler(tracking_data);
            });
        });
    };


    var resolve_tracking_data = function (tracking_data, $element) {
        var resolved_tracking_data = {};

        $.each(tracking_data, function (key, value) {
            var resolved_value;
            if ($.isFunction(value)) {
                resolved_value = value($element);
            } else {
                resolved_value = value;
            }
            resolved_tracking_data[key] = resolved_value;
        });

        return resolved_tracking_data;
    };


    // Public API

    var module = {
        build_specific_user_interaction_tracker:
            build_specific_user_interaction_tracker,
        ClickTracker: build_specific_user_interaction_tracker('click'),
        ElementImpressionTracker: ElementImpressionTracker,
        OutboundLinkTracker: OutboundLinkTracker,
        UserInteractionTracker: UserInteractionTracker,
        resolve_tracking_data: resolve_tracking_data
    };
    return module;
});
