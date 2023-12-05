<template>
    <div 
    class="rt-form-parser" 
    >
        <div ref="con"></div>
    </div>
</template>

<script>
import Vue from 'vue';

import MIXIN_PARSER from './mixins/parsers';

export default {
    mixins: [MIXIN_PARSER],
    props: {
        // 表单值
        value: {
            type: Object,
            defulat: () => ({}),
        },
        // html模板字符串
        html: {
            type: String,
            default: '',
        },
        // 输入组件大小
        size: {
            type: String,
            default: 'mini',
        },
        strSpliter: {
            type: String,
            default: ',',
        },
    },
    data() {
        return {
            tempStr: '', // 替换后的模板
            temp: null, // 组件

            keysInnerIsArr: [], // 表单值中，类型为数组的字段集合
            errorKeyArr: [], // 未完成填写的字段几个
        };
    },
    computed: {
        /**
         * 保证组件内部可以绑定数组，组件外部均绑定设定符号隔开的字符串
         */
        model: {
            get() {
                var obj = {},
                    val = this.value;

                Object.keys(val).forEach(key => {
                    if (this.keysInnerIsArr.includes(key) && val[key]) {
                        obj[key] = val[key].split(this.strSpliter);
                    } else {
                        obj[key] = val[key];
                    }
                });

                return obj;
            },
            set(val) {
                var obj = {},
                    keysInnerIsArr = [...this.keysInnerIsArr];

                Object.keys(val).forEach(key => {
                    if (keysInnerIsArr.includes(key)) {
                        obj[key] = val[key].join(this.strSpliter);
                    } else {
                        obj[key] = val[key];
                    }
                });

                this.$emit('input', obj);
            },
        },
    },
    watch: {
        html: {
            handler(val) {
                if (!val) {
                    return;
                }

                this.$nextTick(() => {
                    this.keysInnerIsArr = [];

                    this.buildComponent();
                });
            },
            immediate: true,
        },
    },
    methods: {
        /**
         * 创建表单组件
         */
        buildComponent() {
            var that = this,
                Temp = null,
                tempStr = this.mainParser();

            this.tempStr = tempStr;

            try {
                this.temp.$destroy();
            } catch (e) {}

            Temp = Vue.extend({
                template: this.tempStr,
                props: {
                    value: {
                        type: Object,
                        default: () => ({}),
                    },
                },
                computed: {
                    errorKeyArr() {
                        return that.errorKeyArr;
                    },
                    model: {
                        get() {
                            return that.value;
                        },
                        set(val) {
                            that.model = val;
                        },
                    },
                },
            });

            this.temp = new Temp({
                propsData: {
                    value: this.model,
                },
            });
            
            // 绑定slots
            this.temp.$slots = this.$slots;

            this.temp.$mount(this.$refs.con);
        },
        /**
         * 校验表单内容
         */
        validate(cb) {
            var errorKeyArr = [];

            this.errorKeyArr = [];

            Object.keys(this.value).forEach(key => {
                var res = ['', undefined].includes(this.value[key]);

                if (res) {
                    errorKeyArr.push(key);
                }
            });

            if (errorKeyArr.length) {
                // 有没填写的内容
                this.errorKeyArr = errorKeyArr;

                this.showErrItemInView();

                return cb(false);
            }

            return cb(true);
        },
        /**
         * 将未填写项滚动入窗口
         */
        showErrItemInView() {
            this.$nextTick(() => {
                let target = document.querySelector('.rt-form-parser .form-item.error');

                if (!target) {
                    return;
                }

                target.scrollIntoView({
                    behavior: 'smooth',
                });
            });
        },
    },
    mounted() {
        
    },
};
</script>

<style lang="scss">
.rt-form-parser{
    overflow: hidden;

    .temp-rebuild{
        .form-item{
            display: inline-block;

            &.error{
                .el-input__inner,
                .el-textarea__inner,
                .el-checkbox__inner,
                .el-radio__inner {
                    border-color: red;
                }
            }
        }
    }
}
</style>