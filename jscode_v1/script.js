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
    const osUserId = document.getElementById('osUserId').value;
    const osPassword = document.getElementById('osPassword').value;
    const appId = document.getElementById('appId').value;
    const appPassword = document.getElementById('appPassword').value;

    const newAccount = { deviceId, osUserId, osPassword, appId, appPassword };
    const accounts = getAccounts();
    accounts.push(newAccount);
    saveAccounts(accounts);
    displayAccounts();
}


function downloadCSV() {
    const accounts = getAccounts();
    let csvContent = '设备ID,操作系统用户ID,操作系统密码,应用ID,应用密码\n';

    accounts.forEach(account => {
        let row = `${account.deviceId},${account.osUserId},${account.osPassword},${account.appId},${account.appPassword}`;
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



function displayAccounts() {
    const accounts = getAccounts();
    const tableBody = document.getElementById('accountsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';  // 清空现有的表格内容

    accounts.forEach((account, index) => {
        const row = tableBody.insertRow();
        row.insertCell(0).innerText = account.deviceId;
        row.insertCell(1).innerText = account.osUserId;
        row.insertCell(2).innerText = account.appId;

        const actionsCell = row.insertCell(3);
        actionsCell.innerHTML = `
            <button onclick="copyOsPassword(${index})">复制操作系统密码</button>
            <button onclick="copyAppPassword(${index})">复制应用密码</button>
            <button onclick="deleteAccount(${index})">删除</button>
            <button onclick="editAccount(${index})">修改</button>
        `;
    });
}


function copyOsPassword(index) {
    const osPassword = getAccounts()[index].osPassword;
    navigator.clipboard.writeText(osPassword).then(() => {
        alert('操作系统密码已复制到剪贴板');
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

    // 将账户信息填充到输入字段
    document.getElementById('deviceId').value = account.deviceId;
    document.getElementById('osUserId').value = account.osUserId;
    document.getElementById('osPassword').value = account.osPassword;
    document.getElementById('appId').value = account.appId;
    document.getElementById('appPassword').value = account.appPassword;

    // 更改添加按钮的行为为更新
    const addButton = document.querySelector('button[onclick="addAccount()"]');
    addButton.textContent = '更新账户';
    addButton.setAttribute('onclick', `updateAccount(${index})`);
}

function updateAccount(index) {
    let accounts = getAccounts();
    accounts[index] = {
        deviceId: document.getElementById('deviceId').value,
        osUserId: document.getElementById('osUserId').value,
        osPassword: document.getElementById('osPassword').value,
        appId: document.getElementById('appId').value,
        appPassword: document.getElementById('appPassword').value
    };

    saveAccounts(accounts);
    displayAccounts();

    // 恢复添加新账户的行为
    const addButton = document.querySelector('button[onclick="updateAccount(${index})"]');
    addButton.textContent = '添加账户';
    addButton.setAttribute('onclick', 'addAccount()');
}




function copyToClipboard(index) {
    const account = getAccounts()[index];
    const textToCopy = `设备ID: ${account.deviceId}, 用户ID: ${account.osUserId}, 密码: ${account.osPassword}, 应用ID: ${account.appId}, 应用密码: ${account.appPassword}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('信息已复制到剪贴板');
    });
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

        for (let i = 1; i < rows.length; i++) { // 跳过标题行
            const cells = rows[i].split(',');
            if (cells.length === 5) {
                accounts.push({
                    deviceId: cells[0],
                    osUserId: cells[1],
                    osPassword: cells[2],
                    appId: cells[3],
                    appPassword: cells[4]
                });
            }
        }

        saveAccounts(accounts);
        displayAccounts();
    };
    reader.readAsText(file);
}
