<template>
    <div class="page">
        <RtFormParser 
        ref="form"
        v-model="form"
        :html="temp"
        >
            <template v-slot:slotOtherSupplementInfo>
                <el-button type="primary" @click="addOtherSupplementInfo">添加</el-button>
            </template>

            <template v-slot:slotOtherSupplementInfoContent>
                <div v-html="otherSupplementInfoContent"></div>
            </template>
        </RtFormParser>

        <div class="btns">
            <el-button type="primary" @click="submitHandler">提交</el-button>
        </div>
    </div>
</template>

<script>
import RtFormParser from '../package/rt-form-parser/index.vue';

import htmlStr from './html.js';

export default {
    components: {RtFormParser},
    data() {
        return {
            form: {
                dljgname: '返回的已填写的代理机构'
            },

            temp: htmlStr,

            otherSupplementInfoContent: '',
        };
    },
    methods: {
        submitHandler() {
            this.$refs.form.validate(valid => {
                if (!valid) {
                    console.log(false);
                    console.log(this.form);
                    return;
                }

                console.log(true);
                console.log(this.form);
            });
        },
        addOtherSupplementInfo() {
            this.$prompt('这是开发人员可以自己定义的组件，这里以prompt为例', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            }).then(({ value }) => {
                this.otherSupplementInfoContent = value;
            });
        },
    },
};
</script>

<style lang="scss" scoped>
    .page{
        width: 842px;
        margin: 0 auto;
        box-shadow: 0 0 10px #909399;
    }
</style>