let members = [];
let expenses = [];

function addMember() {
    const newMember = document.getElementById('newMember').value.trim();
    if (newMember && !members.includes(newMember)) {
        members.push(newMember);
        updateMemberList();
        document.getElementById('newMember').value = '';
    }
}

function updateMemberList() {
    const payerSelect = document.getElementById('expensePayer');
    payerSelect.innerHTML = '';
    members.forEach(member => {
        const option = document.createElement('option');
        option.value = option.textContent = member;
        payerSelect.appendChild(option);
    });
}

function addExpense() {
    const description = document.getElementById('expenseDescription').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const payer = document.getElementById('expensePayer').value;

    if (description && !isNaN(amount) && amount > 0 && payer) {
        expenses.push({ description, amount, payer });
        updateExpenseList();
        calculateSplitAndSummary();
        clearExpenseInputs();
    }
}

function updateExpenseList() {
    const table = document.getElementById('expenseTable');
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
    expenses.forEach(expense => {
        const row = table.insertRow();
        row.insertCell(0).textContent = expense.description;
        row.insertCell(1).textContent = expense.amount.toFixed(2);
        row.insertCell(2).textContent = expense.payer;
    });
}

function clearExpenseInputs() {
    document.getElementById('expenseDescription').value = '';
    document.getElementById('expenseAmount').value = '';
}

function calculateSplitAndSummary() {
    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const perPersonShare = totalExpense / members.length;
    const balances = {};

    members.forEach(member => {
        balances[member] = 0;
    });

    expenses.forEach(expense => {
        balances[expense.payer] += expense.amount;
    });

    members.forEach(member => {
        balances[member] -= perPersonShare;
    });

    const summaryResult = document.getElementById('summaryResult');
    summaryResult.innerHTML = '';

    members.forEach(member => {
        const balance = balances[member];
        const p = document.createElement('p');
        if (balance > 0) {
            p.textContent = `${member} รับเงินคืน ${balance.toFixed(2)} บาท`;
        } else if (balance < 0) {
            p.textContent = `${member} ต้องจ่ายเพิ่ม ${Math.abs(balance).toFixed(2)} บาท`;
        } else {
            p.textContent = `${member} ไม่ต้องจ่ายเพิ่มหรือรับคืน`;
        }
        summaryResult.appendChild(p);
    });

    calculateDetailedTransactions(balances);
}

function calculateDetailedTransactions(balances) {
    const transactions = [];
    const debtors = Object.keys(balances).filter(member => balances[member] < 0);
    const creditors = Object.keys(balances).filter(member => balances[member] > 0);

    debtors.forEach(debtor => {
        let remainingDebt = Math.abs(balances[debtor]);
        creditors.forEach(creditor => {
            if (remainingDebt > 0 && balances[creditor] > 0) {
                const amount = Math.min(remainingDebt, balances[creditor]);
                transactions.push({
                    from: debtor,
                    to: creditor,
                    amount: amount
                });
                remainingDebt -= amount;
                balances[creditor] -= amount;
            }
        });
    });

    const transactionDetails = document.getElementById('transactionDetails');
    transactionDetails.innerHTML = '';

    if (transactions.length === 0) {
        transactionDetails.textContent = 'ไม่มีการชำระเงินระหว่างสมาชิก';
    } else {
        transactions.forEach(transaction => {
            const p = document.createElement('p');
            p.textContent = `${transaction.from} จ่ายให้ ${transaction.to} ${transaction.amount.toFixed(2)} บาท`;
            transactionDetails.appendChild(p);
        });
    }
}