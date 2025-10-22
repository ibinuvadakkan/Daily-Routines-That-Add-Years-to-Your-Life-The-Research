document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.longevity-table-wrapper .search-input');
    const sortButtons = document.querySelectorAll('.longevity-table-wrapper .sort-btn');
    const tableBody = document.getElementById('tableBody');
    const tableRows = Array.from(tableBody.querySelectorAll('tr'));
    const tableHeaders = document.querySelectorAll('.longevity-table-wrapper .research-table th[data-sort]');
    
    let currentSort = { column: null, direction: 'asc' };
    let filteredData = tableRows;

    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        filteredData = tableRows.filter(row => {
            const rowText = row.textContent.toLowerCase();
            return searchTerm === '' || rowText.includes(searchTerm);
        });
        
        renderTable();
    });

    // Sort functionality for buttons
    sortButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sortColumn = this.dataset.sort;
            sortTable(sortColumn);
        });
    });

    // Sort functionality for header clicks
    tableHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const sortColumn = this.dataset.sort;
            sortTable(sortColumn);
        });
    });

    function sortTable(column) {
        // Update sort direction if clicking same column
        if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.column = column;
            currentSort.direction = 'asc';
        }
        
        // Sort the data
        filteredData.sort((a, b) => {
            const aValue = getCellValue(a, column);
            const bValue = getCellValue(b, column);
            
            // Handle numeric values for participants
            if (column === 'participants') {
                const aNum = extractNumber(aValue);
                const bNum = extractNumber(bValue);
                
                if (aNum !== null && bNum !== null) {
                    return currentSort.direction === 'asc' ? aNum - bNum : bNum - aNum;
                }
            }
            
            // Handle duration sorting
            if (column === 'duration') {
                const aYears = extractYears(aValue);
                const bYears = extractYears(bValue);
                
                if (aYears !== null && bYears !== null) {
                    return currentSort.direction === 'asc' ? aYears - bYears : bYears - aYears;
                }
            }
            
            // Default string comparison
            const aStr = String(aValue).toLowerCase();
            const bStr = String(bValue).toLowerCase();
            
            if (aStr < bStr) return currentSort.direction === 'asc' ? -1 : 1;
            if (aStr > bStr) return currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
        
        // Update sort indicators
        updateSortIndicators();
        
        // Re-render table
        renderTable();
    }

    function getCellValue(row, column) {
        const cellIndex = Array.from(tableHeaders).findIndex(th => th.dataset.sort === column);
        return row.cells[cellIndex].textContent;
    }

    function extractNumber(str) {
        const match = str.match(/(\d+,\d+|\d+)/);
        if (match) {
            return parseInt(match[0].replace(/,/g, ''));
        }
        return null;
    }

    function extractYears(str) {
        if (str.includes('Ongoing')) return 999;
        if (str.includes('Long-term')) return 500;
        const match = str.match(/(\d+)/);
        return match ? parseInt(match[0]) : 0;
    }

    function updateSortIndicators() {
        // Remove all sort indicators
        tableHeaders.forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
        });
        
        // Add indicator to current sort column
        if (currentSort.column) {
            const currentHeader = Array.from(tableHeaders).find(
                th => th.dataset.sort === currentSort.column
            );
            if (currentHeader) {
                currentHeader.classList.add(`sort-${currentSort.direction}`);
            }
        }
    }

    function renderTable() {
        tableBody.innerHTML = '';
        
        if (filteredData.length === 0) {
            const noResultsRow = document.createElement('tr');
            noResultsRow.innerHTML = `
                <td colspan="4" style="text-align: center; padding: 40px; color: #666;">
                    <div class="no-results">No studies found matching your search criteria.</div>
                </td>
            `;
            tableBody.appendChild(noResultsRow);
        } else {
            filteredData.forEach(row => {
                tableBody.appendChild(row.cloneNode(true));
            });
        }
    }

    // Initialize sort indicators
    updateSortIndicators();
});
