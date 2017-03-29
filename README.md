# Pull to refresh
Pull down on mobile to enable page refresh.

## Features
* Overlay with icon and message is shown when pulling down
* When online refresh current page
* Offline enabled; works when offline and re-syncs when back online
* Message for pull and release and reload
* Cancel pull 2 refresh when move up
* Will not interfere with scroll behavior

## Limitations
* When refreshing a page the list view does not keep 'Load more' items
* Pull to refresh will only work when everything is scrolled to top

## Dependencies
Mendix 6.10

## Demo project
https://pulltorefresh.mxapps.io

## Usage
* Place the widget on a page or layout
* Add configurations for the different text when:
    - pulling down
    - releasing
    - refreshing
* In the client: Pull down page until the text 'release to refresh' appears in order to refresh the page

## Issues, suggestions and feature requests
We are actively maintaining this widget, please report any issues or suggestions for improvement
https://github.com/mendixlabs/pull-to-refresh/issues

## Disclaimer
Status: In development

Pull 2 refresh. No guarantees are given that this works or keeps working.
