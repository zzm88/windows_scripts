// Function to find available courts
function findAvailableCourts() {
    // Get all court elements
    const courts = document.querySelectorAll('.court-item'); // Adjust selector based on actual page structure
    const availableCourts = [];

    courts.forEach(court => {
        // Check if court is available (adjust logic based on actual page structure)
        const isAvailable = !court.classList.contains('booked') && 
                          !court.classList.contains('disabled');
        
        if (isAvailable) {
            const courtName = court.querySelector('.court-name')?.textContent;
            const timeSlot = court.querySelector('.time-slot')?.textContent;
            
            availableCourts.push({
                name: courtName,
                time: timeSlot
            });
        }
    });

    // Output results
    if (availableCourts.length > 0) {
        console.log('Available Courts:');
        availableCourts.forEach(court => {
            console.log(`${court.name} - ${court.time}`);
        });
    } else {
        console.log('No available courts found.');
    }

    return availableCourts;
}

// Run the function periodically
setInterval(findAvailableCourts, 60000); // Check every minute
findAvailableCourts(); // Initial check 