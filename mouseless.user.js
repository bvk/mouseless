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
var keyControl = 17
var highlightColor = '#49A8FF' // Color that Matches with default Chrome theme.

var keysCaptured = ""

var linkSelected = null
var linkBackgroundColor = null

function log(message) {
    // GM_log(message)
}

// Perform a click on an link.
function clickAnchor(anchor) {
    try {
        anchor.focus()
        anchor.click()
    } catch (ex) {
        // If click() method doesn't work!
        var event = document.createEvent("MouseEvents")
        event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0,
                             false, false, false, false, 0, null)
        anchor.dispatchEvent(event)
    }
}

// Check if the link element is eligible for keyboard navigation.
function goodLink(anchor) {
    if (!anchor.href || anchor.href.length == 0)
        return false
    return true
}

// Update the stylesheet so that current selection is highlighted.
function highlightLink() {
    var anchors = document.body.getElementsByTagName("a")
    for (var i = 0; i < anchors.length; i++) {
        var anchor = anchors[i]
        if (!goodLink(anchor))
            continue

        var linkIndex = anchor.getAttribute('linkIndex')
        if (!linkIndex)
            continue

        if (linkIndex == parseInt(keysCaptured)) {
	    if (linkSelected)
		linkSelected.style.backgroundColor = linkBackgroundColor
	    linkSelected = anchor
	    linkBackgroundColor = anchor.style.backgroundColor
	    anchor.style.backgroundColor = highlightColor
	    log("highlighted " + anchor.href + " to red")
	    return
	}
    }
}

// Reset the state.
function reset() {
    if (linkSelected)
	linkSelected.style.backgroundColor = linkBackgroundColor
    linkSelected = null
    linkBackgroundColor = null
    keysCaptured = ""
}

// Capture keyboard events and take action if necessary.
function captureKey(event) {
    // If any editable input element has the focus, do not handle keyboard
    // events.
    var elem = document.activeElement
    var tag = elem.tagName.toUpperCase()
    if (((tag == "INPUT" && elem.type.toUpperCase() == "TEXT") ||
	 tag == "TEXTAREA") && !elem.disabled()) {
	reset()
	log("Editable element has the focus; resetting mouseless state")
        return
    }
    if (event.keyCode == keyReturn && keysCaptured.length != 0) {
	// Figure out matching link element and visit that link.
        var anchors = document.body.getElementsByTagName("a")
        for (var i = 0; i < anchors.length; i++) {
            var anchor = anchors[i]
            if (!goodLink(anchor))
                continue

            var linkIndex = anchor.getAttribute('linkIndex')
            if (!linkIndex)
                continue

            if (linkIndex == parseInt(keysCaptured)) {
                event.preventDefault()
                event.stopPropagation()

		if (event.ctrlKey) {
		    log("Opening link " + anchor.href + " in a new window")
		    window.open(anchor.href)
		} else {
		    log("Opening link " + anchor.href)
                    clickAnchor(anchor)
		}
            }
        }
	reset()
    } else if (event.keyCode >= keyZero && event.keyCode <= keyNine) {
	log("Received event with number, " + (event.keyCode - keyZero));
        keysCaptured += (event.keyCode - keyZero)
    } else if (event.keyCode == keyControl) {
	// Control+Enter should open the link in new tab, so don't reset the
	// keyboard state on control.
    } else {
	reset()
    }
    highlightLink();
}

// Apply a counter to each link.
function resetLinks() {
    var anchors = document.body.getElementsByTagName("a")
    for (var i = 0; i < anchors.length; i++) {
        var anchor = anchors[i]
        if (!goodLink(anchor))
            continue

        anchor.setAttribute('linkIndex', i)
    }
}

// Update the CSS stylesheet to display link counters.
function updateStyleSheet() {
    var head = document.getElementsByTagName('head')[0]
    if (!head)
	return

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

reset()
resetLinks()
updateStyleSheet()
window.addEventListener("keydown", captureKey, true)
