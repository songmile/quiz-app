import { onBeforeUnmount, onMounted, ref } from "vue";
import { createAppBackup, getBackupJobStatus, getSettings, listBackupFiles, restoreAppBackup, updateDataPath } from "../../api/settings";
const BACKUP_POLL_INTERVAL_MS = 1500;
const BACKUP_POLL_TIMEOUT_MS = 180000;
const loading = ref(false);
const error = ref("");
const result = ref(null);
const files = ref([]);
const restoreFilename = ref("");
const dataPath = ref("");
const backupPolling = ref(false);
const backupJobNo = ref("");
let backupPollTimer = null;
let backupPollStartedAt = 0;
async function load() {
    loading.value = true;
    error.value = "";
    try {
        const [fileList, settings] = await Promise.all([listBackupFiles(), getSettings()]);
        files.value = fileList;
        dataPath.value = settings.data_path || "";
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        loading.value = false;
    }
}
async function refreshBackupFiles() {
    files.value = await listBackupFiles();
}
function stopBackupPolling() {
    backupPolling.value = false;
    if (backupPollTimer) {
        clearTimeout(backupPollTimer);
        backupPollTimer = null;
    }
}
function scheduleBackupPoll() {
    backupPollTimer = setTimeout(() => {
        void pollBackupStatus();
    }, BACKUP_POLL_INTERVAL_MS);
}
async function pollBackupStatus() {
    if (!backupJobNo.value) {
        stopBackupPolling();
        loading.value = false;
        return;
    }
    try {
        const job = await getBackupJobStatus(backupJobNo.value);
        result.value = job;
        if (job.status === "completed") {
            stopBackupPolling();
            await refreshBackupFiles();
            loading.value = false;
            return;
        }
        if (job.status === "failed") {
            stopBackupPolling();
            error.value = job.error || "备份失败";
            loading.value = false;
            return;
        }
        if (Date.now() - backupPollStartedAt > BACKUP_POLL_TIMEOUT_MS) {
            stopBackupPolling();
            error.value = "备份任务轮询超时，请稍后手动刷新";
            loading.value = false;
            return;
        }
        scheduleBackupPoll();
    }
    catch (e) {
        stopBackupPolling();
        error.value = e.message;
        loading.value = false;
    }
}
async function backup() {
    if (backupPolling.value)
        return;
    loading.value = true;
    error.value = "";
    try {
        const job = await createAppBackup();
        result.value = job;
        backupJobNo.value = job.jobNo;
        backupPolling.value = true;
        backupPollStartedAt = Date.now();
        scheduleBackupPoll();
    }
    catch (e) {
        error.value = e.message;
        loading.value = false;
    }
}
async function restore() {
    if (!confirm("恢复将覆盖当前数据，继续？"))
        return;
    loading.value = true;
    error.value = "";
    try {
        result.value = await restoreAppBackup(restoreFilename.value.trim());
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        loading.value = false;
    }
}
async function saveDataPath() {
    loading.value = true;
    error.value = "";
    try {
        result.value = await updateDataPath(dataPath.value.trim());
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        loading.value = false;
    }
}
onMounted(load);
onBeforeUnmount(stopBackupPolling);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "row between" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.load) },
    ...{ class: "btn" },
    disabled: (__VLS_ctx.loading),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel row wrap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.backup) },
    ...{ class: "btn" },
    disabled: (__VLS_ctx.loading),
});
if (__VLS_ctx.backupPolling) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.backupJobNo);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "选择或输入备份文件名",
});
(__VLS_ctx.restoreFilename);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.restore) },
    ...{ class: "btn" },
    disabled: (__VLS_ctx.loading || !__VLS_ctx.restoreFilename),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel row wrap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "\u6570\u636e\u76ee\u5f55\uff0c\u5982\u0020\u0044\u003a\u005c\u005c\u0071\u0075\u0069\u007a\u002d\u0064\u0061\u0074\u0061",
});
(__VLS_ctx.dataPath);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.saveDataPath) },
    ...{ class: "btn" },
    disabled: (__VLS_ctx.loading || !__VLS_ctx.dataPath),
});
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    (__VLS_ctx.error);
}
if (__VLS_ctx.result) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
    (JSON.stringify(__VLS_ctx.result, null, 2));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
    ...{ class: "table" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
for (const [f] of __VLS_getVForSourceType((__VLS_ctx.files))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
        key: (f.filename),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    (f.filename);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    (f.type);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    (f.questionCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    (f.size);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    (f.modifiedAt);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.restoreFilename = f.filename;
            } },
        ...{ class: "btn" },
    });
}
if (__VLS_ctx.files.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
        colspan: "6",
    });
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['between']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            error: error,
            result: result,
            files: files,
            restoreFilename: restoreFilename,
            dataPath: dataPath,
            backupPolling: backupPolling,
            backupJobNo: backupJobNo,
            load: load,
            backup: backup,
            restore: restore,
            saveDataPath: saveDataPath,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
