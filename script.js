class Bank {
    constructor(accountHolder, accountNumber, password) {
        this.accountHolder = accountHolder;
        this.accountNumber = parseInt(accountNumber);
        this.password = password;
        this.balance = 0;
        this.transactionHistory = [];
    }

    verifyCredentials(accountno, password) {
        return parseInt(accountno) === this.accountNumber && password === this.password;
    }

    depositit(accountno, password, amount) {
        if (!this.verifyCredentials(accountno, password)) {
            return { success: false, message: "❌ Wrong Account Number or Password" };
        }
        const depositAmount = parseFloat(amount);
        if (depositAmount <= 0 || isNaN(depositAmount)) {
            return { success: false, message: "❌ Amount must be a positive number" };
        }
        this.balance += depositAmount;
        this.transactionHistory.push({ type: "deposit", amount: depositAmount, balance: this.balance, date: new Date().toLocaleString() });
        saveAccount();
        return { success: true, message: `✅ Deposited $${depositAmount.toFixed(2)}. New balance: $${this.balance.toFixed(2)}` };
    }

    withdrawit(accountno, password, amount) {
        if (!this.verifyCredentials(accountno, password)) {
            return { success: false, message: "❌ Wrong Account Number or Password" };
        }
        const withdrawAmount = parseFloat(amount);
        if (withdrawAmount <= 0 || isNaN(withdrawAmount)) {
            return { success: false, message: "❌ Amount must be a positive number" };
        }
        if (withdrawAmount > this.balance) {
            return { success: false, message: "❌ Insufficient funds!" };
        }
        this.balance -= withdrawAmount;
        this.transactionHistory.push({ type: "withdraw", amount: withdrawAmount, balance: this.balance, date: new Date().toLocaleString() });
        saveAccount();
        return { success: true, message: `✅ Withdrew $${withdrawAmount.toFixed(2)}. New balance: $${this.balance.toFixed(2)}` };
    }

    checkBalance(accountno, password) {
        if (!this.verifyCredentials(accountno, password)) {
            return { success: false, message: "❌ Wrong Account Number or Password" };
        }
        return { success: true, message: `💰 Current balance: $${this.balance.toFixed(2)}` };
    }

    getTransactionHistory(accountno, password) {
        if (!this.verifyCredentials(accountno, password)) {
            return { success: false, message: "❌ You don't have access to this account" };
        }
        if (this.transactionHistory.length === 0) {
            return { success: true, message: "📝 No transactions yet" };
        }
        let historyText = `📊 Transaction History for: ${this.accountHolder}<br><br>`;
        this.transactionHistory.forEach((t, i) => {
            historyText += `${i + 1}. <strong>${t.type.toUpperCase()}</strong>: $${t.amount.toFixed(2)} on ${t.date} (Balance: $${t.balance.toFixed(2)})<br>`;
        });
        return { success: true, message: historyText };
    }
}

let currentAccount = null;

window.onload = function () {
    const savedAccount = localStorage.getItem('bankAccount');
    if (savedAccount) {
        const data = JSON.parse(savedAccount);
        currentAccount = new Bank(data.accountHolder, data.accountNumber, data.password);
        currentAccount.balance = data.balance;
        currentAccount.transactionHistory = data.transactionHistory;
    }
    document.getElementById('operationsSection').classList.remove('hidden');
};

function saveAccount() {
    if (currentAccount) {
        localStorage.setItem('bankAccount', JSON.stringify(currentAccount));
    }
}

function createAccount() {
    const name = document.getElementById('holderName').value.trim();
    const accountNo = document.getElementById('accountNo').value.trim();
    const password = document.getElementById('setPassword').value.trim();
    if (!name || !accountNo || !password) {
        showOutput('❌ Please fill all fields!', 'error');
        return;
    }
    if (accountNo.length < 4) {
        showOutput('❌ Account number must be at least 4 digits!', 'error');
        return;
    }
    if (password.length < 4) {
        showOutput('❌ Password must be at least 4 characters!', 'error');
        return;
    }
    currentAccount = new Bank(name, accountNo, password);
    saveAccount();
    showOutput(`🎉 Congratulations ${name}!<br>Account created successfully!<br><strong>Account Number:</strong> ${accountNo}<br><strong>Initial Balance:</strong> $0.00`, 'success');
    document.getElementById('holderName').value = '';
    document.getElementById('accountNo').value = '';
    document.getElementById('setPassword').value = '';
}

function makeDeposit() {
    if (!currentAccount) { showOutput('❌ Please create an account first!', 'error'); return; }
    const accountNo = document.getElementById('loginAccountNo').value;
    const password = document.getElementById('loginPassword').value;
    const amount = document.getElementById('amount').value;
    const result = currentAccount.depositit(accountNo, password, amount);
    showOutput(result.message, result.success ? 'success' : 'error');
}

function makeWithdrawal() {
    if (!currentAccount) { showOutput('❌ Please create an account first!', 'error'); return; }
    const accountNo = document.getElementById('loginAccountNo').value;
    const password = document.getElementById('loginPassword').value;
    const amount = document.getElementById('amount').value;
    const result = currentAccount.withdrawit(accountNo, password, amount);
    showOutput(result.message, result.success ? 'success' : 'error');
}

function checkBalance() {
    if (!currentAccount) { showOutput('❌ Please create an account first!', 'error'); return; }
    const accountNo = document.getElementById('loginAccountNo').value;
    const password = document.getElementById('loginPassword').value;
    const result = currentAccount.checkBalance(accountNo, password);
    showOutput(result.message, result.success ? 'success' : 'error');
}

function viewHistory() {
    if (!currentAccount) { showOutput('❌ Please create an account first!', 'error'); return; }
    const accountNo = document.getElementById('loginAccountNo').value;
    const password = document.getElementById('loginPassword').value;
    const result = currentAccount.getTransactionHistory(accountNo, password);
    showOutput(result.message, result.success ? 'success' : 'error');
}

function showOutput(message, type = 'info') {
    const output = document.getElementById('output');
    const timestamp = new Date().toLocaleTimeString();
    output.innerHTML = `<div class="${type}"><small>[${timestamp}]</small><br>${message}</div>`;
}
