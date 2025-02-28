// ==UserScript==
// @name         Zoho People Timesheet Description Icon Unpacker
// @author       Leon Sandøy (@lemonsaurus)
// @namespace    http://tampermonkey.net/
// @version      1.9.6
// @updateURL    https://lemonsaur.us/static/js/zohopeople_icon_unpacker.js
// @downloadURL  https://lemonsaur.us/static/js/zohopeople_icon_unpacker.js
// @description  Unpacks the description in timesheets, and allows certain modals to be closed with Escape.
// @match        https://people.zoho.com/ion8hrportal/zp*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /* Wait for Timetracker.timesheet.showDescPopup to be available */
    function waitForTimetracker() {
        return new Promise(resolve => {
            (function check() {
                if (window.Timetracker &&
                    Timetracker.timesheet &&
                    typeof Timetracker.timesheet.showDescPopup === 'function') {
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            })();
        });
    }

    /* Poll for new timesheet tables in #tsdatatbody every second */
    function pollForNewTables() {
        setInterval(() => {
            const tables = document.querySelectorAll("#tsdatatbody table.zpl_tbl.zpl_nocrsor");
            tables.forEach(table => {
                if (!table.dataset.processed) {
                    processTable(table);
                    table.dataset.processed = "true";
                }
            });
        }, 1000);
    }

    /* Process a single timesheet table */
    async function processTable(table) {
        await processIcons(table);
        adjustTableHeaders(table);
        adjustDataRows(table);
    }

    /* Wait for the modal container (#descBodyTag) to yield a <p> element with description text */
    function waitForModalAndCapture(id) {
        return new Promise((resolve) => {
            let container = document.querySelector('#descBodyTag');
            function checkForDescription() {
                const p = container ? container.querySelector('p') : null;
                if (p && p.innerText.trim().length > 0) {
                    resolve(p.innerText.trim());
                    return true;
                }
                return false;
            }
            if (!container) {
                const pollId = setInterval(() => {
                    container = document.querySelector('#descBodyTag');
                    if (container && checkForDescription()) {
                        clearInterval(pollId);
                    }
                }, 100);
            } else {
                if (checkForDescription()) return;
            }
            const observer = new MutationObserver((mutations, obs) => {
                if (checkForDescription()) {
                    obs.disconnect();
                }
            });
            if (container) {
                observer.observe(container, { childList: true, subtree: true, characterData: true });
            }
        });
    }

    /* Override showDescPopup to use the original function */
    function overrideShowDescPopup() {
        const originalShowDescPopup = Timetracker.timesheet.showDescPopup;
        Timetracker.timesheet.showDescPopup = function(id) {
            return originalShowDescPopup.apply(this, arguments);
        };
    }

    /* Simulate a click on a description icon by:
       - Clearing the modal container to remove any stale data,
       - Calling showDescPopup,
       - Waiting for the description,
       - Replacing the icon's container with the new description,
       - And closing the modal */
    async function simulateClickForIcon(icon, id) {
        // Clear modal container to prevent stale data issues
        const modal = document.querySelector('#descBodyTag');
        if (modal) {
            modal.innerHTML = '';
        }
        Timetracker.timesheet.showDescPopup(id);
        const description = await waitForModalAndCapture(id);
        if (!icon.dataset.replaced) {
            icon.parentElement.innerHTML = '<span style="color: #333;">' + description + '</span>';
            icon.dataset.replaced = "true";
        }
        if (typeof Timetracker.timesheet.closeDescPopup === "function") {
            Timetracker.timesheet.closeDescPopup();
        }
    }

    /* Process all icons with onclick calling showDescPopup within a given table element */
    async function processIcons(context) {
        const icons = Array.from(context.querySelectorAll('i[onclick^="Timetracker.timesheet.showDescPopup"]'));
        for (const icon of icons) {
            const onclickText = icon.getAttribute("onclick") || "";
            const idMatch = onclickText.match(/showDescPopup\('(\d+)'\)/);
            if (idMatch) {
                const id = idMatch[1];
                await simulateClickForIcon(icon, id);
            }
        }
    }

    /* Adjust table headers in a given table element.
       For header rows using <th>:
         - Set the second cell's class to "mw80" and width to 80.
         - Set the third cell's class to "mw300", width to 300, and content to "Description".
         - Set the fourth cell's class to "mw80", width to 80, and content to "Billable". */
    function adjustTableHeaders(table) {
        let headerRow = table.querySelector("thead tr");
        if (!headerRow) {
            headerRow = table.querySelector("tr");
            if (headerRow && !headerRow.querySelector("th")) {
                return;
            }
        }
        const thCells = headerRow.querySelectorAll("th");
        if (thCells.length >= 6) {
            thCells[1].className = "mw80";
            thCells[1].setAttribute("width", "80");
            thCells[2].className = "mw300";
            thCells[2].setAttribute("width", "300");
            thCells[2].innerHTML = '<div class="txtbrk zpl_whtspnrml">Description</div>';
            thCells[3].className = "mw80";
            thCells[3].setAttribute("width", "80");
            thCells[3].innerHTML = '<div class="txtbrk zpl_whtspnrml">Billable</div>';
        }
    }

    /* Adjust data rows in a given table element.
       For rows with 7 cells, skip cell[2] (the hidden extra cell) and adjust the visible cells:
         - cell[0]: set class to "mw300" and width to 300.
         - cell[1]: set class to "mw80" and width to 80.
         - cell[3]: set class to "mw300" and width to 300.
         - cell[4]: set class to "mw80" and width to 80.
         - cell[5]: set class to "w100" and width to 100.
         - cell[6]: set class to "mw100 text-right" and width to 100.
       For rows with 6 cells, adjust them normally. */
    function adjustDataRows(table) {
        table.querySelectorAll("tr.timelog").forEach(function(row) {
            let cells = row.querySelectorAll("td");
            if (cells.length === 7) {
                cells[0].className = "mw300";
                cells[0].setAttribute("width", "300");
                cells[1].className = "mw80";
                cells[1].setAttribute("width", "80");
                // Skip cell[2]
                cells[3].className = "mw300";
                cells[3].setAttribute("width", "300");
                cells[4].className = "mw80";
                cells[4].setAttribute("width", "80");
                cells[5].className = "w100";
                cells[5].setAttribute("width", "100");
                cells[6].className = "mw100 text-right";
                cells[6].setAttribute("width", "100");
            } else if (cells.length === 6) {
                cells[0].className = "mw300";
                cells[0].setAttribute("width", "300");
                cells[1].className = "mw80";
                cells[1].setAttribute("width", "80");
                cells[2].className = "mw300";
                cells[2].setAttribute("width", "300");
                cells[3].className = "mw80";
                cells[3].setAttribute("width", "80");
                cells[4].className = "w100";
                cells[4].setAttribute("width", "100");
                cells[5].className = "mw100 text-right";
                cells[5].setAttribute("width", "100");
            }
        });
    }

    waitForTimetracker().then(() => {
        overrideShowDescPopup();
        pollForNewTables();
    });

    // Close modals by pressing the Esc key (including Audit History modal logic)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // If a visible note icon is present, we're still processing the description injection code; do nothing.
            const noteIcon = document.querySelector('i.PI_note.zpl_cp[title="View Description"]');
            if (noteIcon && noteIcon.offsetWidth > 0 && noteIcon.offsetHeight > 0) {
                return;
            }

            // First, try to close the Audit History modal (layered on top)
            const auditClose = document.querySelector('a._cls.PI_cls.tooltip-js[data-title-position="bottom"][title="Close"]');
            if (auditClose) {
                auditClose.click();
                return;
            }

            // Next, try to close the timesheet approval modal
            const sliderClose = document.getElementById('sliderCls');
            if (sliderClose) {
                sliderClose.click();
                return;
            }

            // Next, try to close the View Time Log modal
            const closeByName = document.querySelector('a._cls.PI_cls[name="closeBtn"]');
            if (closeByName) {
                closeByName.click();
                return;
            }

            // Lastly, if we're on the timesheet modal page, call the special function
            // because clicking the close button (with title "Close") causes a crash.
            //
            // Tim Sheets, if you're reading this, you owe me 3 hours of my life back you sonuvabitch
            const closeByTitle = document.querySelector('a._cls.PI_cls[title="Close"]');
            if (closeByTitle && window.Timetracker && typeof Timetracker.timesheet.closeTimsheetPage === 'function') {
                Timetracker.timesheet.closeTimsheetPage();
                closeByTitle.click();  // Fallback in case the above call does nothing.
            }
        }
    });
})();
