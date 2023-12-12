const { createApp, reactive, ref, computed, watch } = Vue;

createApp({
    setup() {
        const tableData = reactive(loadData());
        const newRecord = ref({
            deviceId: '',
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

        function addRecord() {
            tableData.push({ ...newRecord.value });
            Object.keys(newRecord.value).forEach(key => newRecord.value[key] = '');
        }

        function deleteRecord(index) {
            tableData.splice(index, 1);
        }

        function editRecord(record, index) {
            currentRecord.value = { ...record };
            currentIndex.value = index;
            isEditing.value = true;
        }

        function updateRecord(index) {
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

        function importFile(event) {
            const file = event.target.files[0];
            if (file.type === "application/json") {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = JSON.parse(e.target.result);
                    tableData.splice(0, tableData.length, ...data);
                };
                reader.readAsText(file);
            } else if (file.type === "text/csv") {
                Papa.parse(file, {
                    complete: (result) => {
                        tableData.splice(0, tableData.length, ...result.data);
                    },
                    header: true
                });
            }
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
        clearLocalStorage, sortedTableData, tableData, newRecord, addRecord, deleteRecord,
        exportToJson, exportToCsv, importFile,
        isEditing, currentRecord, currentIndex,
        editRecord, updateRecord, cancelEdit,
        copiedIndex, copyToClipboard
    };
}
}).mount('#app');
