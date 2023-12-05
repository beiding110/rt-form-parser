export default {
    data() {
        return {
            /**
             * 模板解析题，支持的模块如下：
             * {{name}}
             * {{detail|textarea}}
             * {{age|number}}
             * {{checkbox|checkbox|[{label:'1',value:'1'},{label:'2',value:'2'}]}}
             * {{radio|radio|[{label:'1',value:'1'},{label:'2',value:'2'}]}}
             * {{select|select|[{label:'1',value:'1'},{label:'2',value:'2'}]}}
             * {{addtime|date|datetime}}
             * {{slotname|slot}}
             */
            parsersObj: {
                'input': (key) => {
                    if (!this.model[key]) {
                        this.$set(this.value, key, '');
                    }

                    return `<el-input 
                        v-model="model.${key}"
                        size="${this.size}"
                        clearable
                    ></el-input>`;
                },
                'textarea': (key) => {
                    if (!this.model[key]) {
                        this.$set(this.value, key, '');
                    }

                    return `<el-input 
                        v-model="model.${key}" 
                        type="textarea"
                        size="${this.size}"
                    ></el-input>`;
                },
                'richtext': (key) => {
                    if (!this.model[key]) {
                        this.$set(this.value, key, '');
                    }

                    return `<tinymce
                        v-model="model.${key}"
                    ></tinymce>`;
                },
                'number': (key) => {
                    if (!this.model[key]) {
                        this.$set(this.value, key, 0);
                    }

                    return `<el-input-number 
                        v-model="model.${key}" 
                        :min="0"
                        controls-position="right"
                        size="${this.size}"
                    ></el-input-number>`;
                },
                'checkbox': (key, data = '[]') => {
                    if (!this.model[key]) {
                        this.$set(this.value, key, []);
                    }

                    if (!this.keysInnerIsArr.includes(key)) {
                        this.keysInnerIsArr.push(key);
                    }

                    return `<el-checkbox-group 
                    v-model="model.${key}"
                    size="${this.size}"
                    >
                        <el-checkbox 
                        v-for="(item, index) in ${data}" 
                        :key="index" 
                        :label="item.value"
                        >
                            {{item.label}}
                        </el-checkbox>
                    </el-checkbox-group>`;
                },
                'radio': (key, data = '[]') => {
                    if (!this.model[key]) {
                        this.$set(this.value, key, '');
                    }

                    return `<el-radio-group v-model="model.${key}">
                        <el-radio 
                        v-for="(item, index) in ${data}" 
                        :key="index" 
                        :label="item.value"
                        >
                            {{item.label}}
                        </el-radio>
                    </el-radio-group>`;
                },
                'select': (key, data = '[]') => {
                    if (!this.model[key]) {
                        this.$set(this.value, key, '');
                    }

                    return `<el-select 
                    v-model="model.${key}"
                    size="${this.size}"
                    clearable
                    placeholder=""
                    >
                        <el-option 
                            v-for="(item, index) in ${data}" 
                            :key="index" 
                            :label="item.label" 
                            :value="item.value"
                        ></el-option>
                    </el-select>`;
                },
                'date': (key, type = 'date') => {
                    if (!this.model[key]) {
                        this.$set(this.value, key, '');
                    }

                    var formatSwitch = {
                            date: ['yyyy年MM月dd日', 'yyyy-MM-dd'],
                            week: ['yyyy年MM月dd日', 'yyyy-MM-dd'],
                            month: ['yyyy年MM月', 'yyyy-MM-dd'],
                            year: ['yyyy年', 'yyyy-MM-dd'],
                            datetime: ['yyyy年MM月dd日 HH时mm分', 'yyyy-MM-dd HH:mm:ss'],
                        },
                        formatItem = formatSwitch[type] || formatSwitch['datetime'];

                    return `<el-date-picker 
                        type="${type}" 
                        v-model="model.${key}" 
                        format="${formatItem[0]}" 
                        value-format="${formatItem[1]}"
                        size="${this.size}"
                        clearable
                    ></el-date-picker>`;
                },
                'slot': (name) => {
                    return `<slot name="${name}"></slot>`;
                },
            }
        };
    },
    methods: {
        /**
         * 处理标签闭合问题
         */
        htmlTagFormatter(html) {
            var div = document.createElement('div'),
                htmlFormatted = '';

            div.innerHTML = html;

            htmlFormatted = div.innerHTML;

            div = null;

            return htmlFormatted;
        },
        /**
         * 解析html模板字符串并生成替换后的字符串
         */
        mainParser() {
            var htmlStr = this.htmlTagFormatter(this.html),
                patt = new RegExp('\{\{((?:.|\n)+?)\}\}', 'g'),
                result, 
                rebuildBody = '', 
                reBeginLength = 0;
            
            while ((result = patt.exec(htmlStr)) !== null) {
                let replacedDom = this.tempStrToComStr(result[1]);
                
                rebuildBody += ( htmlStr.slice(reBeginLength, result['index']) + replacedDom );
                
                reBeginLength = result['index'] + result[0].length;
            }
            
            rebuildBody += htmlStr.slice(reBeginLength);
            rebuildBody = rebuildBody.replace(/\n/g, '');
            
            return `<div class="temp-rebuild">${rebuildBody}</div>`;
        },
        /**
         * 解析模板内容，模板形式：
         * key|type|data
         * 例：
         * protype|radio|[{label:'',value:''}]
         */
        tempStrToComStr(str) {
            var strSections = str.split('|'),
                key = (strSections[0] || '').trim(),
                type = (strSections[1] || 'input').trim(),
                data = (strSections[2] || '').trim(),
                tempBuilder,
                shiftedTemp;

            if (!key) {
                // 模块中为空，或无法解析key
                throw new Error(`模板语法错误，无法获取对应的key：${str}`);
            }

            // 根据类型获取解析器
            tempBuilder = this.parsersObj[type];

            if (!tempBuilder) {
                // 默认使用input解析
                tempBuilder = this.parsersObj['input'];
            }

            shiftedTemp = tempBuilder(key, data);

            if (type === 'slot') {
                // 插槽不包外壳
                return shiftedTemp;
            }

            return `<div class="form-item" :class="{error: errorKeyArr.includes('${key}')}">${shiftedTemp}</div>`;
        },
    }
};