# event-nexus

A declarative way to tracking recording events on your website.

## Overview

If you need to set-up event tracking and recording on your website it can be
a never ending task to keep lots of snippets of javascript up-to-date. With a
dynmaic site this becomes a task of ever-increasing complexity and maintainace
can become a headache.

To overcome this problem, `event-nexus` allows you to declare all the events
you want to track in a single place.

## Adding the code to your site

``event-nexus`` requires jQuery 1.7.2+ (it should work with any version of
jQuery 1.7), so include this:

``` html
<script src="/path/to/jquery/"></script>
```

Then include the event tracking library itself:

``` html
<script src="/path/to/event-nexus.js"></script>
```

At this point you have all the code to declare you events. It's recommended that
you put all the declarations for your site in a single place, e.g.

``` html
<script src="/js/my_events.js"></script>
```