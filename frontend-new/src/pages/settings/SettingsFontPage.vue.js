import { onMounted, reactive, ref } from "vue";
import { getSettings, updateFontSettings } from "../../api/settings";
const keys = [
    "question_font_size",
    "option_font_size",
    "answer_font_size",
    "explanation_font_size",
    "ai_font_size",
    "error_font_size",
    "variant_font_size"
];
const loading = ref(false);
const error = ref("");
const fonts = reactive({});
async function load() {
    loading.value = true;
    error.value = "";
    try {
        const settings = await getSettings();
        keys.forEach((k) => { fonts[k] = Number(settings.font_settings?.[k] ?? 11); });
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        loading.value = false;
    }
}
async function save() {
    loading.value = true;
    error.value = "";
    try {
        await updateFontSettings(fonts);
        alert("保存成功");
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        loading.value = false;
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
    ...{ onSubmit: (__VLS_ctx.save) },
    ...{ class: "panel grid" },
});
for (const [key] of __VLS_getVForSourceType((__VLS_ctx.keys))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        key: (key),
    });
    (key);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        min: "8",
        max: "64",
    });
    (__VLS_ctx.fonts[key]);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row full" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ class: "btn" },
    disabled: (__VLS_ctx.loading),
});
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['between']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['full']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            keys: keys,
            loading: loading,
            error: error,
            fonts: fonts,
            load: load,
            save: save,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
