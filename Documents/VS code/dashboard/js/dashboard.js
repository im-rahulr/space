document.addEventListener('DOMContentLoaded', function() {
    // Initialize base values and timestamp
    let timestamp = 0;
    
    // Storage keys
    const STORAGE_KEYS = {
        READ_COUNT: 'readCount',
        WRITE_COUNT: 'writeCount',
        MONTHLY_READ: 'monthlyReadCount',
        MONTHLY_WRITE: 'monthlyWriteCount',
        LAST_SAVED: 'lastSaved',
        USED_STORAGE: 'usedStorage',
        TOTAL_STORAGE: 'totalStorage',
        LOGS: 'activityLogs',
        TODAY_TOKENS: 'todayTokens',
        MONTHLY_TOKENS: 'monthlyTokens',
        LAST_TOKEN_DATE: 'lastTokenDate'
    };

    // Add greeting functionality
    function updateGreeting() {
        const hour = new Date().getHours();
        const greetingText = document.getElementById('greetingText');
        let greeting = '';
        
        if (hour >= 5 && hour < 12) {
            greeting = 'Good Morning, Rahul';
        } else if (hour >= 12 && hour < 17) {
            greeting = 'Good Afternoon, Rahul';
        } else if (hour >= 17 && hour < 22) {
            greeting = 'Good Evening, Rahul';
        } else {
            greeting = 'Good Night, Rahul';
        }
        
        greetingText.textContent = greeting;
    }

    // Initialize counters from localStorage or default values
    let baseReadCount = parseInt(localStorage.getItem(STORAGE_KEYS.READ_COUNT)) || 3500;
    let baseWriteCount = parseInt(localStorage.getItem(STORAGE_KEYS.WRITE_COUNT)) || 3000;
    let monthlyReadTotal = parseInt(localStorage.getItem(STORAGE_KEYS.MONTHLY_READ)) || 6644002;
    let monthlyWriteTotal = parseInt(localStorage.getItem(STORAGE_KEYS.MONTHLY_WRITE)) || 6436763;
    let totalStorageTB = 2.5; // 2.5 TB total storage
    let usedStorageMB = parseInt(localStorage.getItem(STORAGE_KEYS.USED_STORAGE)) || 850432; // Start with ~850 GB
    let todayTokens = parseInt(localStorage.getItem(STORAGE_KEYS.TODAY_TOKENS)) || 0;
    let monthlyTokens = parseInt(localStorage.getItem(STORAGE_KEYS.MONTHLY_TOKENS)) || 0;
    const maxDailyTokens = 10000000; // 10M tokens

    // Initialize charts
    const dbActivityChart = new Chart(
        document.getElementById('dbActivityChart').getContext('2d'),
        {
            type: 'line',
            data: {
                labels: Array(50).fill(''),
                datasets: [{
                    label: 'Total Reads',
                    data: Array(50).fill(monthlyReadTotal),
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1.5,
                    tension: 0.4
                }, {
                    label: 'Total Writes',
                    data: Array(50).fill(monthlyWriteTotal),
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1.5,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    y: {
                        min: 6000000,
                        max: 7000000,
                        grid: {
                            color: 'rgba(51, 65, 85, 0.1)'
                        },
                        ticks: {
                            callback: value => (value / 1000000).toFixed(1) + 'M'
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { display: false }
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            }
        }
    );

    const aiPerformanceChart = new Chart(
        document.getElementById('aiPerformanceChart').getContext('2d'),
        {
            type: 'line',
            data: {
                labels: Array(50).fill(''),
                datasets: [{
                    label: 'AI Reads',
                    data: Array(50).fill(2248747),
                    borderColor: 'rgb(139, 92, 246)',
                    borderWidth: 1.5,
                    tension: 0.4
                }, {
                    label: 'AI Writes',
                    data: Array(50).fill(1689359),
                    borderColor: 'rgb(236, 72, 153)',
                    borderWidth: 1.5,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    y: {
                        min: 1500000,
                        max: 2500000,
                        grid: {
                            color: 'rgba(51, 65, 85, 0.1)'
                        },
                        ticks: {
                            callback: value => (value / 1000000).toFixed(1) + 'M'
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { display: false }
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            }
        }
    );

    function addLog(message, type = 'info') {
        const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
        const timestamp = new Date().toLocaleString();
        
        const log = {
            message,
            type,
            timestamp
        };
        
        logs.unshift(log); // Add to beginning
        if (logs.length > 100) logs.pop(); // Keep only last 100 logs
        
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
        updateLogsDisplay();
    }

    function updateLogsDisplay() {
        const logsContainer = document.getElementById('logsContainer');
        const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
        
        logsContainer.innerHTML = logs.map(log => `
            <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium ${getLogTypeColor(log.type)}">${log.message}</span>
                    <span class="text-xs text-slate-500 dark:text-slate-400">${log.timestamp}</span>
                </div>
            </div>
        `).join('');
    }

    function getLogTypeColor(type) {
        switch(type) {
            case 'success': return 'text-green-600 dark:text-green-400';
            case 'warning': return 'text-yellow-600 dark:text-yellow-400';
            case 'error': return 'text-red-600 dark:text-red-400';
            default: return 'text-slate-600 dark:text-slate-300';
        }
    }

    function checkAndResetDailyTokens() {
        const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_TOKEN_DATE);
        const today = new Date().toDateString();
        
        if (lastDate !== today) {
            todayTokens = 0;
            localStorage.setItem(STORAGE_KEYS.TODAY_TOKENS, todayTokens);
            localStorage.setItem(STORAGE_KEYS.LAST_TOKEN_DATE, today);
            addLog('Daily token count reset', 'info');
        }
    }

    function formatNumber(number) {
        if (number >= 1000000) {
            return (number / 1000000).toFixed(2) + 'M';
        } else if (number >= 1000) {
            return (number / 1000).toFixed(1) + 'K';
        }
        return number.toLocaleString();
    }

    function updateData() {
        timestamp += 0.1;

        // Fast increments for live counts (more frequent, smaller increments)
        if (Math.random() < 0.3) { // 30% chance to increment live counters
            baseReadCount += Math.floor(Math.random() * 5); // Add 1-5 reads at a time
            baseWriteCount += Math.floor(Math.random() * 3); // Add 1-3 writes at a time
            
            // Keep the live counts within reasonable bounds
            if (baseReadCount > 5000) baseReadCount = 3500;
            if (baseWriteCount > 4500) baseWriteCount = 3000;
            
            // Update storage
            localStorage.setItem(STORAGE_KEYS.READ_COUNT, baseReadCount);
            localStorage.setItem(STORAGE_KEYS.WRITE_COUNT, baseWriteCount);
        }

        // Much slower increments for monthly totals (less frequent, larger increments)
        if (Math.random() < 0.05) { // 5% chance to increment monthly counters
            monthlyReadTotal += Math.floor(Math.random() * 1000 + 500); // Add 500-1500 reads
            monthlyWriteTotal += Math.floor(Math.random() * 800 + 400);  // Add 400-1200 writes
            
            // Update storage
            localStorage.setItem(STORAGE_KEYS.MONTHLY_READ, monthlyReadTotal);
            localStorage.setItem(STORAGE_KEYS.MONTHLY_WRITE, monthlyWriteTotal);
        }

        // Update storage metrics (increment used storage slowly)
        if (Math.random() < 0.1) { // 10% chance to increment
            usedStorageMB += Math.floor(Math.random() * 5); // Add up to 5MB at a time
            localStorage.setItem(STORAGE_KEYS.USED_STORAGE, usedStorageMB);
            
            // Update storage display
            document.getElementById('totalStorage').textContent = totalStorageTB.toFixed(1);
            document.getElementById('usedStorage').textContent = (usedStorageMB / 1024).toFixed(2) + ' GB';
            
            // Update progress bar
            const percentUsed = (usedStorageMB / (totalStorageTB * 1024 * 1024)) * 100;
            document.getElementById('storageProgress').style.width = `${Math.min(percentUsed, 100)}%`;
        }

        // Update displays with formatted numbers
        document.getElementById('readCount').textContent = baseReadCount.toLocaleString();
        document.getElementById('writeCount').textContent = baseWriteCount.toLocaleString();
        document.getElementById('monthlyReadCount').textContent = formatNumber(monthlyReadTotal);
        document.getElementById('monthlyWriteCount').textContent = formatNumber(monthlyWriteTotal);

        // Update last saved timestamp
        if (Math.random() < 0.02) { // Update timestamp occasionally
            localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toLocaleString());
            document.getElementById('lastSaved').textContent = localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
        }

        // Update charts
        const readWave = Math.sin(timestamp) * 100000 + Math.sin(timestamp * 2) * 50000;
        const writeWave = Math.cos(timestamp) * 80000 + Math.cos(timestamp * 1.5) * 40000;

        dbActivityChart.data.datasets[0].data.push(monthlyReadTotal + readWave);
        dbActivityChart.data.datasets[1].data.push(monthlyWriteTotal + writeWave);
        dbActivityChart.data.datasets[0].data.shift();
        dbActivityChart.data.datasets[1].data.shift();
        dbActivityChart.update();

        const aiReadWave = Math.sin(timestamp * 1.1) * 50000 + Math.sin(timestamp * 2.2) * 25000;
        const aiWriteWave = Math.cos(timestamp * 1.1) * 40000 + Math.cos(timestamp * 2.2) * 20000;
        
        aiPerformanceChart.data.datasets[0].data.push(2248747 + aiReadWave);
        aiPerformanceChart.data.datasets[1].data.push(1689359 + aiWriteWave);
        aiPerformanceChart.data.datasets[0].data.shift();
        aiPerformanceChart.data.datasets[1].data.shift();
        aiPerformanceChart.update();

        // Add logs for significant events
        if (Math.random() < 0.02) { // 2% chance for a log entry
            const events = [
                { message: `Read operations peaked at ${baseReadCount.toLocaleString()} requests`, type: 'success' },
                { message: `Storage usage increased to ${(usedStorageMB / 1024).toFixed(2)} GB`, type: 'info' },
                { message: `Write operations reached ${baseWriteCount.toLocaleString()} requests`, type: 'success' },
                { message: `Monthly reads surpassed ${(monthlyReadTotal / 1000000).toFixed(1)}M`, type: 'info' }
            ];
            
            const event = events[Math.floor(Math.random() * events.length)];
            addLog(event.message, event.type);
        }

        // Add warning logs for high usage
        const storagePercentage = (usedStorageMB / (totalStorageTB * 1024 * 1024)) * 100;
        if (storagePercentage > 85 && Math.random() < 0.05) {
            addLog(`Storage usage critical: ${storagePercentage.toFixed(1)}% used`, 'warning');
        }

        // Check and reset daily tokens if needed
        checkAndResetDailyTokens();

        // Update token counts
        if (Math.random() < 0.1) { // 10% chance to increment
            const tokenIncrement = Math.floor(Math.random() * 50000); // Random increment up to 50k tokens
            todayTokens += tokenIncrement;
            monthlyTokens += tokenIncrement;

            // Update storage
            localStorage.setItem(STORAGE_KEYS.TODAY_TOKENS, todayTokens);
            localStorage.setItem(STORAGE_KEYS.MONTHLY_TOKENS, monthlyTokens);

            // Update displays with M/K formatting
            document.getElementById('todayTokens').textContent = formatNumber(todayTokens);
            document.getElementById('monthlyTokens').textContent = formatNumber(monthlyTokens);
            document.getElementById('availableTokens').textContent = '10M'; // Fixed value

            // Update progress bar
            const tokenPercentage = (todayTokens / maxDailyTokens) * 100;
            document.getElementById('tokenProgress').style.width = `${Math.min(tokenPercentage, 100)}%`;

            // Add warning log if approaching limit
            if (tokenPercentage > 85 && Math.random() < 0.05) {
                addLog(`High token usage: ${formatNumber(todayTokens)} of 10M daily limit`, 'warning');
            }

            // Add success log for significant usage
            if (Math.random() < 0.02) {
                addLog(`Token generation reached ${formatNumber(todayTokens)} today`, 'success');
            }
        }
    }

    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
    });

    // Initialize everything
    updateGreeting();
    setInterval(updateGreeting, 60000); // Update greeting every minute
    setInterval(updateData, 50); // Update data every 50ms

    // Add event listener for clearing logs
    document.getElementById('clearLogs').addEventListener('click', () => {
        localStorage.setItem(STORAGE_KEYS.LOGS, '[]');
        updateLogsDisplay();
        addLog('Logs cleared by user', 'info');
    });

    // Add hover effects to metric cards
    document.querySelectorAll('.p-4.rounded-xl').forEach(card => {
        card.classList.add('metric-card');
    });
});