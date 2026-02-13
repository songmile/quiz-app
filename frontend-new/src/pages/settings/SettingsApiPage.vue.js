import { onMounted, ref } from "vue";
import { testConnection } from "../../api/ai";
import { getSettings, updateApiConfig } from "../../api/settings";
const loading = ref(false);
const error = ref("");
const configs = ref([]);
const testResult = ref({});
async function load() {
    loading.value = true;
    error.value = "";
    try {
        const settings = await getSettings();
        configs.value = JSON.parse(JSON.stringify(settings.api_configs || []));
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        loading.value = false;
    }
}
async function save(index) {
    loading.value = true;
    error.value = "";
    try {
        await updateApiConfig(index, configs.value[index]);
        await load();
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        loading.value = false;
    }
}
async function test(index) {
    try {
        testResult.value[index] = await testConnection(index);
    }
    catch (e) {
        testResult.value[index] = { error: e.message };
    }
}
onMounted(load);
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.load) },
    ...{ class: "btn" },
    disabled: (__VLS_ctx.loading),
});
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    (__VLS_ctx.error);
}
for (const [cfg, idx] of __VLS_getVForSourceType((__VLS_ctx.configs))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
        key: (idx),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (idx);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({});
    (cfg.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({});
    (cfg.api_url);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({});
    (cfg.model);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        placeholder: "保持掩码表示不变更",
    });
    (cfg.api_key);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        min: "1",
    });
    (cfg.chunk_size);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        min: "1",
    });
    (cfg.max_tokens);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "checkbox",
    });
    (cfg.enabled);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "row top-gap" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.save(idx);
            } },
        ...{ class: "btn" },
        disabled: (__VLS_ctx.loading),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.test(idx);
            } },
        ...{ class: "btn" },
        disabled: (__VLS_ctx.loading),
    });
    if (__VLS_ctx.testResult[idx]) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
        (JSON.stringify(__VLS_ctx.testResult[idx], null, 2));
    }
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['between']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['top-gap']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            error: error,
            configs: configs,
            testResult: testResult,
            load: load,
            save: save,
            test: test,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
