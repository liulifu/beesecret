const { createApp, reactive, ref, computed, watch } = Vue;
const hoveredIndex = ref(-1);


createApp({
    setup() {
        const tableData = reactive(loadData());
        const newRecord = ref({
            deviceId: '',
            updatedAt: '',
            systemName: '',
            tagName: '',
            applicationId: '',
            domainAccount: '',
            appId: '',
            appPassword: ''
        });
        const isEditing = ref(false);
        const currentRecord = ref({});
        const currentIndex = ref(null);


        function getCurrentDateTime() {
            const now = new Date();
            return now.getFullYear() + '-' + 
                (now.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                now.getDate().toString().padStart(2, '0') + ' ' + 
                now.getHours().toString().padStart(2, '0') + ':' + 
                now.getMinutes().toString().padStart(2, '0');
        }
        

        function addRecord() {
            // 检查新记录的设备ID是否已存在
            const isDuplicate = tableData.some(record => record.deviceId === newRecord.value.deviceId);
            newRecord.value.updatedAt = getCurrentDateTime();
            if (isDuplicate) {
                // 如果设备ID重复，弹出警告并阻止添加
                alert('设备ID已存在，请输入一个唯一的设备ID。');
            } else {
                // 如果设备ID不重复，添加新记录
                tableData.push({ ...newRecord.value });
                // 重置newRecord的所有属性
                Object.keys(newRecord.value).forEach(key => newRecord.value[key] = '');
            }
        }
        

        function deleteRecord(deviceId) {
            const index = tableData.findIndex(item => item.deviceId === deviceId);
            if (index !== -1) {
                tableData.splice(index, 1);
            }
        }
        

        function editRecord(record, index) {
            currentRecord.value = { ...record };
            currentIndex.value = index;
            isEditing.value = true;
        }

        function updateRecord(index) {
            currentRecord.value.updatedAt = getCurrentDateTime();
            tableData[index] = { ...currentRecord.value };
            isEditing.value = false;
        }

        function cancelEdit() {
            isEditing.value = false;
        }

        function exportToJson() {
            const jsonStr = JSON.stringify(tableData);
            downloadFile(jsonStr, "data.json", "text/json");
        }

        function exportToCsv() {
            const csv = Papa.unparse(tableData);
            downloadFile(csv, "data.csv", "text/csv");
        }

        function resetFileInput(event) {
            // 检查是否已选择文件
            if (event.target.value) {
                // 重置文件输入的值
                event.target.value = '';
            }
        }
        

        function importFile(event) {
            const file = event.target.files[0];
            const currentTime = getCurrentDateTime(); // 获取当前时间

            if (file.type === "application/json") {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = JSON.parse(e.target.result);
                    data.forEach(item => item.updatedAt = currentTime); // 为每条记录设置当前时间
                    console.log("处理后的数据:", data);  // 这行用来检查数据
                    tableData.splice(0, tableData.length, ...data);
                };
                reader.readAsText(file);
            } else if (file.type === "text/csv") {
                Papa.parse(file, {
                    complete: (result) => {
                        result.data.forEach(item => item.updatedAt = currentTime); // 为每条记录设置当前时间
                        tableData.splice(0, tableData.length, ...result.data);
                    },
                    header: true
                });
            }
            // // 重置文件输入
            // event.target.value = '';

        }

        function downloadFile(content, fileName, contentType) {
            const a = document.createElement("a");
            const file = new Blob([content], { type: contentType });
            a.href = URL.createObjectURL(file);
            a.download = fileName;
            a.click();
        }

        // 计算属性，用于获取排序后的表格数据
        const sortedTableData = computed(() => {
            return [...tableData].sort((a, b) => a.deviceId - b.deviceId);
        });

        // 当tableData变化时，自动保存到本地存储
        watch(tableData, () => {
            localStorage.setItem('tableData', JSON.stringify(tableData));
        }, { deep: true });

        function loadData() {
            const savedData = localStorage.getItem('tableData');
            return savedData ? JSON.parse(savedData) : [];
        }

    // 复制密码按钮
    const copiedIndex = ref(-1);

    function copyToClipboard(password, index) {
        navigator.clipboard.writeText(password).then(() => {
            copiedIndex.value = index;
            setTimeout(() => {
                copiedIndex.value = -1;
            }, 2000); // 2秒后重置
        }).catch(err => {
            console.error('复制失败: ', err);
        });
    }
    
    // 清除所有数据
    function clearLocalStorage() {
        if (confirm("确定要清除所有本地存储数据吗？这个操作不能撤销。")) {
            localStorage.clear();
            tableData.splice(0, tableData.length); // 清空当前的表格数据
        }
    }


    return {
        resetFileInput,
        clearLocalStorage, sortedTableData, tableData, 
        newRecord, addRecord, deleteRecord,
        exportToJson, exportToCsv, importFile,
        isEditing, currentRecord, currentIndex,
        editRecord, updateRecord, cancelEdit,
        hoveredIndex,copiedIndex, copyToClipboard
    };
}
}).mount('#app');
