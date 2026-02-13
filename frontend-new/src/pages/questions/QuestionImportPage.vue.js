import { onBeforeUnmount, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { getBanks } from "../../api/bank";
import { getImportStatus, importQuestionsWithAi, importTextQuestions } from "../../api/question";
const loading = ref(false);
const error = ref("");
const result = ref(null);
const status = ref(null);
const pollTimer = ref(null);
const mode = ref("add");
const bankId = ref("");
const textContent = ref("");
const aiContent = ref("");
const banks = ref([]);
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
    result.value = null;
    try {
        result.value = await importTextQuestions(textContent.value, mode.value, bankId.value || null);
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
    }, 2000);
}
async function importAi() {
    loading.value = true;
    error.value = "";
    result.value = null;
    status.value = null;
    try {
        const data = await importQuestionsWithAi(aiContent.value, mode.value, bankId.value || null);
        result.value = data;
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
    ...{ class: "row between" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel row wrap" },
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    value: (__VLS_ctx.textContent),
    rows: "12",
    placeholder: "粘贴题目文本",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row top-gap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.importText) },
    ...{ class: "btn" },
    disabled: (__VLS_ctx.loading),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    value: (__VLS_ctx.aiContent),
    rows: "12",
    placeholder: "粘贴原始题目资料，后端将分块调用 AI",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row top-gap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.importAi) },
    ...{ class: "btn" },
    disabled: (__VLS_ctx.loading),
});
if (__VLS_ctx.status) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "top-gap" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "row between" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.status.status);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.status.progress.percentage);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.progress)({
        value: (Number(__VLS_ctx.status.progress.percentage)),
        max: "100",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.status.progress.processed);
    (__VLS_ctx.status.progress.total);
    (__VLS_ctx.status.progress.successful);
    (__VLS_ctx.status.progress.failed);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.status.importedCount);
    (__VLS_ctx.status.duration);
    if (__VLS_ctx.status.errors.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
        (__VLS_ctx.status.errors.join('\n'));
    }
}
if (__VLS_ctx.result) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
    (JSON.stringify(__VLS_ctx.result, null, 2));
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
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['top-gap']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['top-gap']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['top-gap']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['between']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            RouterLink: RouterLink,
            loading: loading,
            error: error,
            result: result,
            status: status,
            mode: mode,
            bankId: bankId,
            textContent: textContent,
            aiContent: aiContent,
            banks: banks,
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
