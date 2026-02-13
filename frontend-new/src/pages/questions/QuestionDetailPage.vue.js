import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { createQuestion, getQuestion, updateQuestion } from "../../api/question";
import { getBanks } from "../../api/bank";
const route = useRoute();
const router = useRouter();
const id = computed(() => String(route.params.id || "new"));
const isCreate = computed(() => id.value === "new");
const saving = ref(false);
const error = ref("");
const banks = ref([]);
const tagText = ref("");
const optionText = ref("");
const form = reactive({
    id: "",
    type: "单选题",
    text: "",
    answer: "",
    bankId: "",
    explanation: "",
    tags: [],
    options: []
});
function parseOptions(text) {
    return text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
        const m = line.match(/^([A-Za-z])[\.、:：\)]\s*(.+)$/);
        if (!m)
            return null;
        return { letter: m[1].toUpperCase(), text: m[2].trim() };
    })
        .filter((v) => Boolean(v));
}
function hydrate(item) {
    form.id = item.id;
    form.type = item.type;
    form.text = item.text;
    form.answer = item.answer;
    form.bankId = item.bankId || "";
    form.explanation = item.explanation || "";
    form.tags = item.tags || [];
    form.options = item.options || [];
    tagText.value = (form.tags || []).join(",");
    optionText.value = (form.options || []).map((o) => `${o.letter}. ${o.text}`).join("\n");
}
async function load() {
    error.value = "";
    try {
        banks.value = await getBanks();
        if (!isCreate.value) {
            const data = await getQuestion(id.value);
            hydrate(data);
        }
    }
    catch (e) {
        error.value = e.message;
    }
}
async function save() {
    saving.value = true;
    error.value = "";
    try {
        const payload = {
            ...form,
            bankId: form.bankId || undefined,
            tags: tagText.value.split(",").map((v) => v.trim()).filter(Boolean),
            options: parseOptions(optionText.value)
        };
        if (isCreate.value) {
            const created = await createQuestion(payload);
            await router.replace(`/questions/${created.id}`);
        }
        else {
            await updateQuestion(id.value, payload);
            alert("保存成功");
        }
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        saving.value = false;
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
(__VLS_ctx.isCreate ? "新建题目" : `编辑题目 ${__VLS_ctx.form.id}`);
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
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    (__VLS_ctx.error);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
    ...{ onSubmit: (__VLS_ctx.save) },
    ...{ class: "panel form" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.form.type),
    required: true,
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.form.bankId),
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    value: (__VLS_ctx.form.text),
    rows: "4",
    required: true,
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    required: true,
});
(__VLS_ctx.form.answer);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    value: (__VLS_ctx.form.explanation),
    rows: "4",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "如: SQL,索引",
});
(__VLS_ctx.tagText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    value: (__VLS_ctx.optionText),
    rows: "6",
    placeholder: "\u0041\u002e\u0020\u9009\u9879\u4e00\u005c\u006e\u0042\u002e\u0020\u9009\u9879\u4e8c",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ class: "btn" },
    disabled: (__VLS_ctx.saving),
});
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['between']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['form']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            RouterLink: RouterLink,
            isCreate: isCreate,
            saving: saving,
            error: error,
            banks: banks,
            tagText: tagText,
            optionText: optionText,
            form: form,
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
