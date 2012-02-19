// ==UserScript==
// @name           mouseless
// @namespace      http://www.userscripts.org
// @description    Internet browsing without mouse.
// @include        *
// ==/UserScript==

// Some global variables. FIXME: Global variables are bad.
var keyZero = 48
var keyNine = 57
var keyReturn = 13
var keysCaptured = ""

// Perform a click on an link.
function clickAnchor(anchor) {
    try {
        anchor.focus()
        anchor.click()
    } catch (ex) {
        // If click() method doesn't work!
        var event = document.createEvent("MouseEvents")
        event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0,
                             false, false, false, false, 0, null);
        anchor.dispatchEvent(event);
    }
}

// Capture keyboard events and take action if necessary.
function captureKey(event) {
    if (event.keyCode == keyReturn && keysCaptured.length != 0) {
        // If any editable input element has the focus, do not steal keyboard
        // events.
        var elem = document.activeElement
        var tag = elem.tagName.toUpperCase()
        if ((tag == "INPUT" || tag == "TEXTAREA") && !elem.disabled()) {
            keysCaptured = ""
            return
        }
	// Figure out matching link element and visit that link.
        var anchors = document.body.getElementsByTagName("a")
        for (var i = 0; i < anchors.length; i++) {
            var anchor = anchors[i]
            var linkIndex = anchor.getAttribute('linkIndex')
            if (!linkIndex)
                continue

            if (linkIndex == parseInt(keysCaptured)) {
                event.preventDefault()
                event.stopPropagation()
                clickAnchor(anchor)
            }
        }
        keysCaptured = ""
    } else if (event.keyCode >= keyZero && event.keyCode < keyNine) {
        keysCaptured += event.keyCode - keyZero
    } else {
        keysCaptured = ""
    }
}

// Apply a counter to each link.
function resetLinks() {
    var anchors = document.body.getElementsByTagName("a")
    for (var i = 0; i < anchors.length; i++)
        anchors[i].setAttribute('linkIndex', i)
}

// Update the CSS stylesheet to display link counters.
function updateStyleSheet() {
    var head = document.getElementsByTagName('head')[0]
    head.appendChild(document.createElement('style'))
    var style = document.styleSheets[document.styleSheets.length - 1]
    style.insertRule("a:after { " +
                     "  content: attr(linkIndex);" +
                     "  font-size: .5em;" +
                     "  font-style: italic;" +
                     "  margin: 1px;" +
                     "  vertical-align: super;" +
                     "}", 0)
}

resetLinks()
updateStyleSheet()
window.addEventListener("keydown", captureKey, true)
