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
});
