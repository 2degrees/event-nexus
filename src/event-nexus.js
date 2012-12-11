/**
* Copyright (c) 2012, 2degrees Limited <2degrees-floss@googlegroups.com>.
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
* 
*/


var event_trackers = (function () {
    
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
        
        $(document).one('click', self.element_selector, function (event) {
            event.preventDefault();
            
            var $element = $(this);
            
            var tracking_data = resolve_tracking_data(
                self.tracking_data,
                $element
            );
            tracking_data_handler(tracking_data);
            
            // Delay outbound click
            setTimeout(
                function () { $element[0].click(); },
                100
            );
        });
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
})();


var event_recorders = (function () {
    
    'use strict';
    
    var ConsoleEventRecorder = function () {};
    ConsoleEventRecorder.prototype.record = (function () {
        var recording_function;
        
        if (window.console) {
            recording_function = function (tracking_data) {
                var message = '';
                $.each(tracking_data, function(key, value) {
                    message += key + ': ' + value + ', ';
                });
                console.info(message);
            };
        } else {
            recording_function = $.noop;
        }
        return recording_function;
    })();
    
    // Public API
    
    var module = {
        ConsoleEventRecorder: ConsoleEventRecorder
    };
    return module;
})();


var event_tracker_binding = (function () {
    
    'use strict';
    
    var check_element_to_track_exists = function (tracker_configuration) {
        if (!window.console) {
            return;
        }
        
        var element_selector =
            tracker_configuration.event_tracker.element_selector;
        if ($(element_selector).length) {
            console.log('Tracked element "' + element_selector + '" found');
        } else {
            console.warn(
                'Tracked element "' + element_selector + '" not found'
            );
        }
    };
    
    var bind_trackers_to_dom = function (
        event_tracking_configuration,
        event_recorder,
        page_id,
        debug
    ) {
        $.each(event_tracking_configuration, function () {
            var tracker_configuration = this;
            
            var are_page_ids_specified =
                !$.isEmptyObject(tracker_configuration.page_ids);
            var is_current_page_id_matched =
                $.inArray(page_id, tracker_configuration.page_ids) !== -1;
            if (are_page_ids_specified && !is_current_page_id_matched) {
                return true;
            }
            
            if (debug) {
                check_element_to_track_exists(tracker_configuration);
            }
            
            tracker_configuration.event_tracker.bind(
                function (tracking_data) {
                    event_recorder.record(tracking_data);
                }
            );
        });
    };
    
    // Public API
    
    var module = {
        bind_trackers_to_dom: bind_trackers_to_dom
    };
    return module;
})();
