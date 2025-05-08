// DOM Elements
const balanceEl = document.getElementById('balance');
const incomeAmountEl = document.getElementById('income-amount');
const expenseAmountEl = document.getElementById('expense-amount');
const transactionForm = document.getElementById('transaction-form');
const transactionList = document.getElementById('transaction-list');
const filterCategory = document.getElementById('filter-category');
const expenseChart = document.getElementById('expense-chart');

// Initialize transactions array from localStorage or empty array
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Initialize Chart.js
let chart = null;

// Event Listeners
transactionForm.addEventListener('submit', addTransaction);
filterCategory.addEventListener('change', filterTransactions);

// Initialize the app
init();

function init() {
    transactionList.innerHTML = '';
    updateBalance();
    updateChart();
    renderTransactions();
}

function addTransaction(e) {
    e.preventDefault();

    const type = document.getElementById('type').value;
    const description = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    if (description === '' || isNaN(amount) || amount <= 0) {
        alert('Please enter valid description and amount');
        return;
    }

    const transaction = {
        id: generateID(),
        type,
        description,
        amount,
        category,
        date
    };

    transactions.push(transaction);
    updateLocalStorage();
    renderTransactions();
    updateBalance();
    updateChart();
    transactionForm.reset();
}

function generateID() {
    return Math.floor(Math.random() * 1000000000);
}

function renderTransactions() {
    transactionList.innerHTML = '';
    const filteredTransactions = filterTransactionsByCategory(transactions);
    
    filteredTransactions.forEach(transaction => {
        const sign = transaction.type === 'income' ? '+' : '-';
        const item = document.createElement('li');
        item.classList.add('transaction-item', transaction.type);
        
        item.innerHTML = `
            <div class="transaction-info">
                <span class="transaction-description">${transaction.description}</span>
                <span class="transaction-category">${transaction.category}</span>
                <span class="transaction-date">${formatDate(transaction.date)}</span>
            </div>
            <span class="transaction-amount">${sign}$${Math.abs(transaction.amount).toFixed(2)}</span>
            <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        transactionList.appendChild(item);
    });
}

function filterTransactionsByCategory(transactions) {
    const selectedCategory = filterCategory.value;
    if (selectedCategory === 'all') {
        return transactions;
    }
    return transactions.filter(transaction => transaction.category === selectedCategory);
}

function filterTransactions() {
    renderTransactions();
    updateChart();
}

function deleteTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    renderTransactions();
    updateBalance();
    updateChart();
}

function updateBalance() {
    const amounts = transactions.map(transaction => {
        return transaction.type === 'income' ? transaction.amount : -transaction.amount;
    });

    const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => acc + item, 0).toFixed(2);
    const expense = (amounts.filter(item => item < 0).reduce((acc, item) => acc + item, 0) * -1).toFixed(2);

    balanceEl.textContent = `$${total}`;
    incomeAmountEl.textContent = `$${income}`;
    expenseAmountEl.textContent = `$${expense}`;
}

function updateChart() {
    const filteredTransactions = filterTransactionsByCategory(transactions);
    const expensesByCategory = {};
    
    filteredTransactions.forEach(transaction => {
        if (transaction.type === 'expense') {
            if (expensesByCategory[transaction.category]) {
                expensesByCategory[transaction.category] += transaction.amount;
            } else {
                expensesByCategory[transaction.category] = transaction.amount;
            }
        }
    });

    const categories = Object.keys(expensesByCategory);
    const amounts = Object.values(expensesByCategory);

    if (chart) {
        chart.destroy();
    }

    const ctx = expenseChart.getContext('2d');
    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: [
                    '#e74c3c',
                    '#3498db',
                    '#2ecc71',
                    '#f1c40f',
                    '#9b59b6',
                    '#1abc9c'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Expense Distribution by Category'
                }
            }
        }
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
} 