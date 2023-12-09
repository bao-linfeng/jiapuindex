<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../../store/global.js';
import { createMsg, formattedDate, downliadLink } from '../../util/ADS.js';
import { index, baseURL } from '../../util/api';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, orgList, orgMemberInfo, langData } = storeToRefs(global);
const {  } = global;

const props = defineProps({
    dataKey: String,
    row: Object,
})

const emit = defineEmits(['close', 'save']);
const close = () => {
    emit('close');
}

const page = ref(1);
const limit = ref(30);
const total = ref(0);
const handleCurrentChange = (data) => {
    console.log(data);
    page.value = data;
    getDataList();
}
const tableData = ref([]);
/** 
 * 错误清单列表api 
 * @param {string} SLAKey - SLA Key
 * @returns {Object} {msg: 提示信息，status: 状态，result: {list: 数据, pageNum: 分页, total: 总条数}}
 */
 const getDataList = async () => {
    const result = await index.getSLAErrorList({
        'SLAKey': props.dataKey
    });
    if(result.status == 200){
        tableData.value = result.result.list.map((ele) => {
            ele.createTime = ele.createTime ? formattedDate(ele.createTime) : '';
            return ele;
        });
        total.value = result.result.total;
    }else{
        createMsg(result.msg);
    }
}

/** 
 * 生成SLA错误清单api 
 * @param {string} userKey - 用户key
 * @param {string} SLAKey - SLA Key
 * @param {string} simplePath - 上传的excel文件路径
 * @param {string} originalName - 原始文件名
 * @returns {Object} {msg: 提示信息，status: 状态，data: 数据}
 */
 const addSLAErrorList = async (simplePath, originalName) => {
    const result = await index.addSLAErrorList({
        'userKey': userInfo.value.userKey,
        'SLAKey': props.dataKey,
        'originalName': originalName,
        'simplePath': simplePath,
    });
    if(result.status == 200){
        createMsg(langData.value['上传错误清单成功!'], true);
        emit('save');
        getDataList();
    }else if(result.status == 301){
        createMsg(langData.value['上传错误清单失败!'], true);
        downliadLink(result.result, baseURL+'/');
    }else{
        createMsg(result.msg);
    }
}

/** 
 * 生成SLA错误清单-附件api 
 * @param {string} userKey - 用户key
 * @param {string} SLAErrorKey - SLA error Key
 * @param {string} simplePath - 上传的excel文件路径
 * @param {string} originalName - 原始文件名
 * @returns {Object} {msg: 提示信息，status: 状态，data: 数据}
 */
 const addSLAErrorAttachment = async (simplePath, originalName) => {
    const result = await index.addSLAErrorAttachment({
        'userKey': userInfo.value.userKey,
        'SLAErrorKey': SLAErrorKey.value,
        'originalName': originalName,
        'simplePath': simplePath,
    });
    if(result.status == 200){
        createMsg(langData.value['上传错误清单附件成功!'], true);
        getDataList();
    }else if(result.status == 301){
        createMsg(langData.value['上传错误清单附件失败!'], true);
        downliadLink(result.result, baseURL+'/');
    }else{
        createMsg(result.msg);
    }
}

/** 
 * 错误清单-完结api 
 * @param {string} userKey - 用户key
 * @param {string} SLAKey - SLA Key
 * @returns {Object} {msg: 提示信息，status: 状态，data: 数据}
 */
 const SLAErrorListFinish = async () => {
    const result = await index.SLAErrorListFinish({
        'userKey': userInfo.value.userKey,
        'SLAKey': props.dataKey,
    });
    if(result.status == 200){
        props.row.finishSLA = 1;
        createMsg(langData.value['错误清单完结成功!'], true);
    }else if(result.status == 301){
        createMsg(langData.value['错误清单完结失败!'], true);
    }else{
        createMsg(result.msg);
    }
}

/** 
 * 删除错误清单excel api 
 * @param {string} userKey - 用户key
 * @param {string} SLAKey - SLA key
 * @returns {Object} {msg: 提示信息，status: 状态，data: 数据}
 */
 const deleteSLAErrorList = async (SLAErrorKey) => {
    const result = await index.deleteSLAErrorList({
        'userKey': userInfo.value.userKey,
        'SLAErrorKey': SLAErrorKey,
    });
    if(result.status == 200){
        createMsg(langData.value['删除错误清单成功!'], true);
        getDataList();
    }else{
        createMsg(result.msg);
    }
}

const show = ref('');
const SLAErrorKey = ref('');
// 回调
const handleClickAction = (row, t) => {
    console.log(row, t);
    show.value = t;
    SLAErrorKey.value = row._key;
    if(t == 'download'){
        downliadLink(row.simplePath, baseURL);
    }
    if(t == 'lookview'){
        window.open('http://view.officeapps.live.com/op/view.aspx?src='+baseURL+row.simplePath);
    }
    if(t == 'complete'){
        SLAErrorListFinish();
    }
    if(t == 'delete'){
        deleteSLAErrorList(row._key);
    }
}

// 上传成功回调
const handleBatchUpdate = (response, uploadFile, uploadFiles) => {
    if(response.statusCode == 200){
        console.log(response);
        if(show.value == 'uploadError'){
            addSLAErrorList(response.simplePath, response.originalName);
        }
        if(show.value == 'uploadAnnex'){
            addSLAErrorAttachment(response.simplePath, response.originalName);
        }
    }else{
        createMsg(response.msg);
    }
}

onMounted(() => {
    console.log(props.row);
    getDataList();
});

</script>

<template>
    <section class="error-wrap">
        <header class="header">
            <h3>{{langData['错误清单']}}</h3>
            <img class="close" @click="close" src="../../assets/close.svg" alt="">
        </header>
        <main class="main">
            <el-upload
                v-if="((orgMemberInfo.englishName == 'FS' && orgMemberInfo.role == 2) || (orgMemberInfo.englishName != 'FS' && orgMemberInfo.role <= 2)) && !props.row.finishSLA && props.row.deliveryBatchStatus != 6"
                class="inline-block"
                :action="baseURL+'/upload'"
                :show-file-list="false"
                accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                :on-success="handleBatchUpdate"
            >
                <template #trigger>
                    <el-button type="primary" size="small" @click="handleClickAction('', 'uploadError')">{{langData['上传错误清单']}}</el-button>
                </template>
            </el-upload>
            <el-button v-if="tableData.length >= 2 && orgMemberInfo.englishName == 'FS' && orgMemberInfo.role <= 2 && !props.row.finishSLA" class="marginL10" type="primary" size="small" @click="handleClickAction('', 'complete')">{{langData['完结']}}</el-button>
        </main>
        <footer class="footer">
            <el-table 
                :data="tableData" 
                border 
                height="300"
                style="width: 100%">
                <el-table-column prop="deliveryBatch" :label="langData['批次']" align="center" width="120" />
                <el-table-column prop="originalName" :label="langData['文件名']" align="center" width="200" />
                <el-table-column prop="userName" :label="langData['上传人']" align="center" width="100" />
                <el-table-column prop="createTime" :label="langData['上传时间']" align="center" width="120" />
                <!-- <el-table-column :label="langData['附件']" width="200" align="center">
                    <template #default="scope">
                        <a class="block" v-for="(ele, index) in scope.row.attachment" :key="'attachment'+index" :href="baseURL+ele.simplePath">{{ele.originalName}}</a>
                    </template>
                </el-table-column> -->
                <el-table-column :label="langData['操作']" fixed="right" width="200" align="center">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="handleClickAction(scope.row, 'download')">{{langData['下载']}}</el-button>
                        <el-button size="small" type="primary" @click="handleClickAction(scope.row, 'lookview')">{{langData['查看']}}</el-button>
                        <el-popconfirm
                            v-if="userInfo.userKey == scope.row.userKey"
                            width="220"
                            :confirm-button-text="langData['确定']"
                            :cancel-button-text="langData['取消']"
                            :title="langData['您确认要删除该错误清单吗?']"
                            @confirm="handleClickAction(scope.row, 'delete')"
                        >
                            <template #reference>
                                <el-button type="primary" size="small">{{langData['删除']}}</el-button>
                            </template>
                        </el-popconfirm>
                        <!-- <el-upload
                            v-if="scope.row.userKey == userInfo.userKey && !props.row.finishSLA"
                            class="inline-block marginL10"
                            :action="baseURL+'/upload'"
                            :show-file-list="false"
                            :on-success="handleBatchUpdate"
                        >
                            <template #trigger>
                                <el-button type="primary" size="small" @click="handleClickAction(scope.row, 'uploadAnnex')">{{langData['附件']}}</el-button>
                            </template>
                        </el-upload> -->
                    </template>
                </el-table-column>
            </el-table>
        </footer>
    </section>
</template>

<style scoped lang="scss">
.error-wrap{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 0 3rem 3rem 3rem;
    background: #fff;
    z-index: 1000;
    border-radius: 5px;
    box-shadow: 0 0 1px 2px #ddd;
    .header{
        position: relative;
        height: 5rem;
        display: flex;
        justify-content: center;
        align-items: center;
        .close{
            position: absolute;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            cursor: pointer;
        }
    }
    .main{
        height: 4rem;
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }
    .footer{
        
    }
}
.block{
    display: block;
}
.marginL10{
    margin-left: 10px;
}
</style>