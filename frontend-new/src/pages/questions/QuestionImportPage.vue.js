import { onBeforeUnmount, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { getBanks } from "../../api/bank";
import { getImportStatus, importQuestionsWithAi, importTextQuestions } from "../../api/question";
const loading = ref(false);
const error = ref("");
const resultObj = ref(null);
const status = ref(null);
const pollTimer = ref(null);
const mode = ref("add");
const bankId = ref("");
const textContent = ref("");
const aiContent = ref("");
const banks = ref([]);
const resultCards = ref([]);
const resultPreview = ref([]);
function buildResultView(data) {
    const cards = [];
    if (data.message)
        cards.push({ label: "消息", value: String(data.message) });
    if (data.importId)
        cards.push({ label: "导入任务ID", value: String(data.importId) });
    if (data.mode)
        cards.push({ label: "模式", value: String(data.mode) });
    if (data.parsedCount !== undefined)
        cards.push({ label: "解析数", value: String(data.parsedCount) });
    if (data.insertedCount !== undefined)
        cards.push({ label: "插入数", value: String(data.insertedCount) });
    if (data.duplicateCount !== undefined)
        cards.push({ label: "重复数", value: String(data.duplicateCount) });
    if (cards.length === 0) {
        Object.entries(data)
            .filter(([, value]) => value === null || ["string", "number", "boolean"].includes(typeof value))
            .forEach(([key, value]) => cards.push({ label: key, value: String(value ?? "-") }));
    }
    resultCards.value = cards;
    const list = Array.isArray(data.data) ? data.data : [];
    resultPreview.value = list.slice(0, 10).map((item) => ({
        id: String(item.id || ""),
        type: String(item.type || ""),
        text: String(item.text || "")
    }));
}
async function loadBanks() {
    try {
        banks.value = await getBanks();
    }
    catch {
        banks.value = [];
    }
}
async function importText() {
    loading.value = true;
    error.value = "";
    resultObj.value = null;
    resultCards.value = [];
    resultPreview.value = [];
    try {
        const data = await importTextQuestions(textContent.value, mode.value, bankId.value || null);
        resultObj.value = data;
        buildResultView(data);
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        loading.value = false;
    }
}
function stopPolling() {
    if (pollTimer.value) {
        window.clearInterval(pollTimer.value);
        pollTimer.value = null;
    }
}
function startPolling(importId) {
    stopPolling();
    pollTimer.value = window.setInterval(async () => {
        try {
            const current = await getImportStatus(importId);
            status.value = current;
            if (current.status === "completed" || current.status === "failed") {
                stopPolling();
            }
        }
        catch (e) {
            error.value = e.message;
            stopPolling();
        }
    }, 1500);
}
async function importAi() {
    loading.value = true;
    error.value = "";
    resultObj.value = null;
    resultCards.value = [];
    resultPreview.value = [];
    status.value = null;
    try {
        const data = await importQuestionsWithAi(aiContent.value, mode.value, bankId.value || null);
        resultObj.value = data;
        buildResultView(data);
        startPolling(data.importId);
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        loading.value = false;
    }
}
onMounted(loadBanks);
onBeforeUnmount(stopPolling);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "row between wrap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "hint" },
});
const __VLS_0 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "btn" },
    to: "/questions",
}));
const __VLS_2 = __VLS_1({
    ...{ class: "btn" },
    to: "/questions",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row wrap top-gap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.mode),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "add",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "replace",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.bankId),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "",
});
for (const [b] of __VLS_getVForSourceType((__VLS_ctx.banks))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (b.id),
        value: (b.id),
    });
    (b.name);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    value: (__VLS_ctx.textContent),
    rows: "10",
    placeholder: "粘贴结构化题目文本",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row top-gap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.importText) },
    ...{ class: "btn primary" },
    disabled: (__VLS_ctx.loading || !__VLS_ctx.textContent.trim()),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    value: (__VLS_ctx.aiContent),
    rows: "10",
    placeholder: "粘贴原始资料，后端将分片调用 AI 解析",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row top-gap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.importAi) },
    ...{ class: "btn" },
    disabled: (__VLS_ctx.loading || !__VLS_ctx.aiContent.trim()),
});
if (__VLS_ctx.status) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "top-gap status-box" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "row between wrap" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.status.status);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.status.progress.percentage);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.progress, __VLS_intrinsicElements.progress)({
        value: (Number(__VLS_ctx.status.progress.percentage)),
        max: "100",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "kv-grid top-gap" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "kv-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.status.progress.total);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "kv-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.status.progress.processed);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "kv-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.status.progress.successful);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "kv-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.status.progress.failed);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "kv-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.status.importedCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "kv-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.status.duration);
    if (__VLS_ctx.status.errors.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "panel top-gap" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
        (__VLS_ctx.status.errors.join("\n"));
    }
}
if (__VLS_ctx.resultObj) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "kv-grid top-gap" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.resultCards))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "kv-item" },
            key: (item.label),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
        (item.label);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (item.value);
    }
    if (__VLS_ctx.resultPreview.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "table-wrap top-gap" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
        for (const [row] of __VLS_getVForSourceType((__VLS_ctx.resultPreview))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
                key: (row.id),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (row.id);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (row.type);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (row.text);
        }
    }
}
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    (__VLS_ctx.error);
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['between']} */ ;
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['hint']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['top-gap']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['top-gap']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['top-gap']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['top-gap']} */ ;
/** @type {__VLS_StyleScopedClasses['status-box']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['between']} */ ;
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['kv-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['top-gap']} */ ;
/** @type {__VLS_StyleScopedClasses['kv-item']} */ ;
/** @type {__VLS_StyleScopedClasses['kv-item']} */ ;
/** @type {__VLS_StyleScopedClasses['kv-item']} */ ;
/** @type {__VLS_StyleScopedClasses['kv-item']} */ ;
/** @type {__VLS_StyleScopedClasses['kv-item']} */ ;
/** @type {__VLS_StyleScopedClasses['kv-item']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['top-gap']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['kv-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['top-gap']} */ ;
/** @type {__VLS_StyleScopedClasses['kv-item']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['top-gap']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            RouterLink: RouterLink,
            loading: loading,
            error: error,
            resultObj: resultObj,
            status: status,
            mode: mode,
            bankId: bankId,
            textContent: textContent,
            aiContent: aiContent,
            banks: banks,
            resultCards: resultCards,
            resultPreview: resultPreview,
            importText: importText,
            importAi: importAi,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
