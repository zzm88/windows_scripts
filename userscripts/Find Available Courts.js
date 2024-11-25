// ==UserScript==
// @name         Find Available Courts
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Find all available courts on the schedule page and output the results
// @author       Your Name
// @match        https://*.ydmap.cn/booking/schedule/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // Create form elements
    const form = document.createElement('form');
    form.innerHTML = `
    <form id="courtSelectionForm" style="position: fixed; top: 10px; right: 10px; z-index: 1000; background-color: #4CAF50; color: white; padding: 20px; width: 250px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
    <label for="timeSelect" style="display: block; margin-bottom: 10px;">选择时间:</label>
    <select id="timeSelect" multiple style="width: 100%; height: 500px; margin-bottom: 10px;">
        <option value="11:00-11:30">11:00</option>
        <option value="12:00-12:30">12:00</option>
        <option value="13:00-13:30">13:00</option>
        <option value="14:00-14:30">14:00</option>
        <option value="15:00-15:30">15:00</option>
        <option value="16:00-16:30">16:00</option>
        <option value="17:00-17:30">17:00</option>
        <option value="18:00-18:30">18:00</option>
        <option value="18:30-19:00">18:30</option>
        <option value="19:00-19:30">19:00</option>
        <option value="19:30-20:00">19:30</option>
        <option value="20:00-20:30">20:00</option>
        <option value="20:30-21:00">20:30</option>
        <option value="21:00-21:30">21:00</option>
    </select>
    <label for="courtTypeSelect" style="display: block; margin-bottom: 10px;">选择场地类型:</label>
    <select id="courtTypeSelect" multiple style="width: 100%; height: 150px; margin-bottom: 10px;">
        <option value="风雨场">风雨场</option>
        <option value="室外场">室外场</option>
        <option value="训练墙">训练墙</option>
        <option value="网球场">网球场</option>
                <option value="场">场</option>

    </select>
    <input type="text" id="otherCourtType" placeholder="其他场地类型" style="width: 100%; margin-bottom: 10px;">
    <button type="button" id="findCourtsButton" style="width: 100%; padding: 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Find Courts</button>

            <label for="intervalSelect" style="display: block; margin-top: 20px;">检查间隔 (秒):</label>
        <select id="intervalSelect" style="width: 100%; margin-bottom: 10px;">
            <option value="10">10s</option>
            <option value="30">30s</option>
            <option value="60">1min</option>
        </select>
        <button type="button" id="runTimerButton" style="width: 100%; padding: 10px; background-color: #FF5722; color: white; border: none; cursor: pointer;">Run Timer Checking</button>
</form>


    `;

    form.style.position = 'fixed';
    form.style.top = '10px';
    form.style.right = '10px';
    form.style.zIndex = '1000';
    form.style.backgroundColor = '#4CAF50';
    form.style.color = 'white';
    form.style.border = 'none';
    form.style.padding = '10px 20px';
    form.style.cursor = 'pointer';

    // Append form to body
    document.body.appendChild(form);

        // Utility functions to save and load selections
    function saveSelections() {
        const timeSelect = document.getElementById('timeSelect');
        const courtTypeSelect = document.getElementById('courtTypeSelect');
        const selectedTimes = Array.from(timeSelect.selectedOptions).map(opt => opt.value);
        const selectedCourtTypes = Array.from(courtTypeSelect.selectedOptions).map(opt => opt.value);

        const storageKey = `savedSelections_${window.location.pathname}`;
        localStorage.setItem(storageKey, JSON.stringify({times: selectedTimes, courtTypes: selectedCourtTypes}));
    }

    function loadSelections() {
        const storageKey = `savedSelections_${window.location.pathname}`;
        const savedData = JSON.parse(localStorage.getItem(storageKey));

        if (savedData) {
            const { times, courtTypes } = savedData;
            const timeSelect = document.getElementById('timeSelect');
            const courtTypeSelect = document.getElementById('courtTypeSelect');
            Array.from(timeSelect.options).forEach(option => {
                option.selected = times.includes(option.value);
            });
            Array.from(courtTypeSelect.options).forEach(option => {
                option.selected = courtTypes.includes(option.value);
            });
        }
    }

    // Event listeners for changes in selections
    document.getElementById('timeSelect').addEventListener('change', saveSelections);
    document.getElementById('courtTypeSelect').addEventListener('change', saveSelections);

    // Load selections on page load
    window.addEventListener('load', loadSelections);
    // Function to find all available courts
    function FindOutAllAvailableCourts() {
        console.log('Starting FindOutAllAvailableCourts...');

        // Updated selector to find the header cells with the new structure
        const headerCells = document.querySelectorAll('th[data-v-4349d30f] div');
        console.log('Found header cells:', headerCells.length);

        const courtTypes = {};

        headerCells.forEach((div, index) => {
            const text = div.textContent.trim();
            console.log(`Header cell ${index} text:`, text);

            // Updated regex to match the new format (e.g., "1号风雨场")
            const matchResult = text.match(/\d+号(.*)/);
            if (matchResult) {
                const courtType = matchResult[1];
                const columnClass = `column-${index}`; // We'll use index-based tracking instead
                courtTypes[columnClass] = courtType;
                console.log(`Mapped column ${columnClass} to court type: ${courtType}`);
            }
        });

        // Updated selector for time cells
        const timeCells = document.querySelectorAll('td[data-v-4349d30f]');
        console.log('Found time cells:', timeCells.length);

        let availableCourts = {};

        timeCells.forEach((cell, index) => {
            const text = cell.innerText || cell.textContent;
            //print cell
            console.log(`Checking cell ${index}:`, text);

            // Updated conditions for unavailable courts
            if (text==""||text.includes('已预订') || text.includes('￥') ||
                text.includes('预订中') || text.includes('仅支持线下预订')) {
                console.log(`Cell ${index} is not available:`, text);
                return;
            }

            // Get the column index
            const cellPlatformId = cell.getAttribute('data-platform-id');
            const matchingHeader = document.querySelector(`th[data-platform-id="${cellPlatformId}"] div`);
            const courtType = matchingHeader ? courtTypes[`column-${Array.from(headerCells).indexOf(matchingHeader)}`] : null;
            console.log("debug_here");
            console.log(courtType);
            console.log(cell);
            console.log(matchingHeader);

            // Get the time from the cell or its parent row
            const timeCell = cell;
            //print cell
            console.log(cell);
            // print timeCell
            console.log(timeCell);
            const timeMatch = timeCell ? text.match(/\d+:\d+-\d+:\d+/) : null;

            if (timeMatch && courtType) {
                const time = timeMatch[0];
                if (!availableCourts[time]) {
                    availableCourts[time] = {};
                }
                if (!availableCourts[time][courtType]) {
                    availableCourts[time][courtType] = 0;
                }
                availableCourts[time][courtType]++;
                console.log(availableCourts);
                console.log(`Added available court: ${time} - ${courtType} - Court #${cellPlatformId + 1} + ||| ${text}`);
                //print timematch
                console.log(timeMatch);
                //print timecell
                console.log(timeCell);
            }
        });

        console.log('Final available courts:', availableCourts);
        return availableCourts;
    }
    // Add a function to wait for the table to be loaded
    function waitForTable(callback, maxAttempts = 10) {
        let attempts = 0;

        const checkTable = () => {
            const headerCells = document.querySelectorAll('th[data-v-4349d30f] div');
            if (headerCells.length > 0) {
                console.log('Table found, proceeding with search');
                callback();
            } else if (attempts < maxAttempts) {
                console.log('Table not found, attempting again...');
                attempts++;
                setTimeout(checkTable, 1000);
            } else {
                console.log('Table not found after maximum attempts');
            }
        };

        checkTable();
    }

    // Function to filter the selected courts based on user input
   function FilterSelectedCourts() {
        console.log('Starting FilterSelectedCourts...');

        const allAvailableCourts = FindOutAllAvailableCourts();
        console.log('Retrieved all available courts:', allAvailableCourts);

        const timeSelect = document.getElementById('timeSelect');
        const courtTypeSelect = document.getElementById('courtTypeSelect');

        console.log('Time select element:', timeSelect);
        console.log('Court type select element:', courtTypeSelect);

        if (!timeSelect || !courtTypeSelect) {
            console.error('Could not find select elements');
            return;
        }

        const selectedTimes = Array.from(timeSelect.selectedOptions).map(opt => opt.value);
        const selectedCourtTypes = Array.from(courtTypeSelect.selectedOptions).map(opt => opt.value);
        const otherCourtType = document.getElementById('otherCourtType')?.value || '';

        console.log('Selected times:', selectedTimes);
        console.log('Selected court types:', selectedCourtTypes);
        console.log('Other court type:', otherCourtType);

        if (otherCourtType.trim() !== '') {
            selectedCourtTypes.push(otherCourtType.trim());
        }

        const filteredCourts = {};
        let foundMatch = false;

        selectedTimes.forEach(time => {
            console.log(`Checking time: ${time}`);
            if (allAvailableCourts[time]) {
                selectedCourtTypes.forEach(courtType => {
                    console.log(`Checking court type: ${courtType} for time ${time}`);
                    if (allAvailableCourts[time][courtType]) {
                        if (!filteredCourts[time]) {
                            filteredCourts[time] = {};
                        }
                        filteredCourts[time][courtType] = allAvailableCourts[time][courtType];
                        foundMatch = true;
                        console.log(`Match found: ${time} - ${courtType}`);
                    }
                });
            }
        });

        console.log('Filtered courts:', filteredCourts);
        console.log('Found match:', foundMatch);

        // Output results
        for (const [time, courts] of Object.entries(filteredCourts)) {
            let output = `${time} `;
            let courtTypes = [];
            for (const [courtType, count] of Object.entries(courts)) {
                courtTypes.push(`${count}个${courtType}`);
            }
            const outputResult = output + courtTypes.join(' ');
            console.log('Output result:', outputResult);

            if (foundMatch) {
                const title = document.title;
                console.log('Sending notification with title:', title);
                sendNotification(title + ":" + outputResult);
            }
        }
    }

    function sendNotification(message) {
        GM_xmlhttpRequest({
            method: "GET",
            url: `https://api.day.app/DuVn5KaRwyfNdhixASmxqd/${encodeURIComponent(message)}?sound=minuet`,
            onload: function(response) {
                if (response.status >= 200 && response.status < 300) {
                    console.log('Notification sent successfully');
                } else {
                    console.log('Error sending notification');
                }
            }
        });
    }
    // Attach event listener to button
    document.getElementById('findCourtsButton').addEventListener('click', () => {
        console.log('Find courts button clicked');
        waitForTable(() => {
            FilterSelectedCourts();
        });
    });


        // Select the date on the schedule automatically
    function selectDate() {
        const dateElement = document.querySelector('.new-datetime.selected');
        if (dateElement) {
            dateElement.click();
            console.log('Date selected:', dateElement.querySelector('.datetime').textContent);
        }
    }

    // Add a variable to store the timer interval ID
    let countdownInterval;
    let checkingInterval;

    // Variable to track if checking is active
    let isChecking = false;

    // Timer functionality to trigger checking periodically
    document.getElementById('runTimerButton').addEventListener('click', function() {
        const button = this;
        const originalText = button.textContent;

        // If already checking, stop the check
        if (isChecking) {
            clearInterval(countdownInterval);
            clearInterval(checkingInterval);
            button.textContent = originalText;
            button.style.backgroundColor = '#FF5722';
            isChecking = false;
            return;
        }

        const interval = parseInt(document.getElementById('intervalSelect').value, 10);
        let countdown = interval;

        // Clear existing intervals if any
        if (countdownInterval) clearInterval(countdownInterval);
        if (checkingInterval) clearInterval(checkingInterval);

        // Set checking flag
        isChecking = true;

        // Start the checking interval
        checkingInterval = setInterval(() => {
            selectDate();
            document.getElementById('findCourtsButton').click();
            countdown = interval; // Reset countdown after each check
        }, interval * 1000);

        // Start the countdown display
        countdownInterval = setInterval(() => {
            countdown--;
            button.textContent = `Next check in ${countdown}s`;
            if (countdown <= 0) {
                countdown = interval;
            }
        }, 1000);

        // Update button state
        button.textContent = `Next check in ${countdown}s`;
        button.style.backgroundColor = '#ff0000';

        console.log('Timer set to check every', interval, 'seconds');
    });

    // Auto-trigger the court finding on page load
    window.addEventListener('load', function() {
        selectDate();  // Select the date first
        FindOutAllAvailableCourts();  // Then find courts
    });




})();

