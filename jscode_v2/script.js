const masterPassword = '123456'; // 更改为你自己的密码
const accountsKey = 'accounts';

function unlock() {
    const inputPassword = document.getElementById('masterPassword').value;
    if (inputPassword === masterPassword) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainSection').style.display = 'block';
        displayAccounts();
    } else {
        alert('密码错误');
    }
}

function getAccounts() {
    const accounts = localStorage.getItem(accountsKey);
    return accounts ? JSON.parse(accounts) : [];
}

function saveAccounts(accounts) {
    localStorage.setItem(accountsKey, JSON.stringify(accounts));
}

function addAccount() {
    const deviceId = document.getElementById('deviceId').value;
    const systemName = document.getElementById('systemName').value;
    const tagComputerName = document.getElementById('tagComputerName').value;
    const applicationId = document.getElementById('applicationId').value;
    const domainAccount = document.getElementById('domainAccount').value;
    const appId = document.getElementById('appId').value;
    const appPassword = document.getElementById('appPassword').value;

    const newAccount = { deviceId, systemName, tagComputerName, applicationId, domainAccount, appId, appPassword };
    const accounts = getAccounts();
    accounts.push(newAccount);
    saveAccounts(accounts);
    displayAccounts();
}

function displayAccounts() {
    const accounts = getAccounts();
    const tableBody = document.getElementById('accountsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; 

    accounts.forEach((account, index) => {
        const row = tableBody.insertRow();
        row.insertCell(0).innerText = account.deviceId;
        row.insertCell(1).innerText = account.systemName;
        row.insertCell(2).innerText = account.tagComputerName;
        row.insertCell(3).innerText = account.applicationId;
        row.insertCell(4).innerText = account.domainAccount;
        row.insertCell(5).innerText = account.appId;

        const actionsCell = row.insertCell(6);
        actionsCell.innerHTML = `
            <button onclick="copyAppPassword(${index})">复制应用密码</button>
            <button onclick="deleteAccount(${index})">删除</button>
            <button onclick="editAccount(${index})">修改</button>
        `;
    });
}

function copyAppPassword(index) {
    const appPassword = getAccounts()[index].appPassword;
    navigator.clipboard.writeText(appPassword).then(() => {
        alert('应用密码已复制到剪贴板');
    });
}

function deleteAccount(index) {
    let accounts = getAccounts();
    if (confirm('确定要删除这个账户吗？')) {
        accounts.splice(index, 1);
        saveAccounts(accounts);
        displayAccounts();
    }
}

function editAccount(index) {
    let accounts = getAccounts();
    let account = accounts[index];

    document.getElementById('deviceId').value = account.deviceId;
    document.getElementById('systemName').value = account.systemName;
    document.getElementById('tagComputerName').value = account.tagComputerName;
    document.getElementById('applicationId').value = account.applicationId;
    document.getElementById('domainAccount').value = account.domainAccount;
    document.getElementById('appId').value = account.appId;
    document.getElementById('appPassword').value = account.appPassword;

    const addButton = document.querySelector('button[onclick="addAccount()"]');
    addButton.textContent = '更新账户';
    addButton.setAttribute('onclick', `updateAccount(${index})`);
}

function updateAccount(index) {
    let accounts = getAccounts();
    accounts[index] = {
        deviceId: document.getElementById('deviceId').value,
        systemName: document.getElementById('systemName').value,
        tagComputerName: document.getElementById('tagComputerName').value,
        applicationId: document.getElementById('applicationId').value,
        domainAccount: document.getElementById('domainAccount').value,
        appId: document.getElementById('appId').value,
        appPassword: document.getElementById('appPassword').value
    };

    saveAccounts(accounts);
    displayAccounts();

    const addButton = document.querySelector('button[onclick="updateAccount(${index})"]');
    addButton.textContent = '添加账户';
    addButton.setAttribute('onclick', 'addAccount()');
}

function downloadCSV() {
    const accounts = getAccounts();
    let csvContent = '设备ID,System Name,Tag/Computer Name,Application ID,域账号/DS,应用ID,应用密码\n';

    accounts.forEach(account => {
        let row = `${account.deviceId},${account.systemName},${account.tagComputerName},${account.applicationId},${account.domainAccount},${account.appId},${account.appPassword}`;
        csvContent += row + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'accounts.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadData() {
    const accounts = getAccounts();
    const blob = new Blob([JSON.stringify(accounts, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'accounts.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function uploadData(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = function(event) {
        const contents = event.target.result;
        try {
            const accounts = JSON.parse(contents);
            saveAccounts(accounts);
            displayAccounts();
        } catch (e) {
            alert('文件格式错误');
        }
    };
    reader.readAsText(file);
}

function uploadCSV(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = function(event) {
        const contents = event.target.result;
        const rows = contents.split('\n');
        let accounts = [];

        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].split(',');
            if (cells.length === 7) {
                accounts.push({
                    deviceId: cells[0],
                    systemName: cells[1],
                    tagComputerName: cells[2],
                    applicationId: cells[3],
                    domainAccount: cells[4],
                    appId: cells[5],
                    appPassword: cells[6]
                });
            }
        }

        saveAccounts(accounts);
        displayAccounts();
    };
    reader.readAsText(file);
}
