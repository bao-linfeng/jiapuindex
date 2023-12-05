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

const save = () => {
    emit('save');
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
 * SLA报告列表api 
 * @param {string} SLAKey - SLA Key
 * @returns {Object} {msg: 提示信息，status: 状态，result: {list: 数据, pageNum: 分页, total: 总条数}}
 */
 const getDataList = async () => {
    const result = await index.slaAttachmentList({
        'SLAKey': props.dataKey
    });
    if(result.status == 200){
        tableData.value = result.result.map((ele) => {
            ele.createTime = ele.createTime ? formattedDate(ele.createTime) : '';
            ele.updateTime = ele.updateTime ? formattedDate(ele.updateTime) : '';
            return ele;
        });
    }else{
        createMsg(result.msg);
    }
}

/** 
 * 导入SLA报告api 
 * @param {string} userKey - 用户key
 * @param {string} orgKey - 机构key
 * @param {string} filePath - 上传的excel文件路径
 * @param {string} originalName - 原始文件名
 * @returns {Object} {msg: 提示信息，status: 状态，data: 数据}
 */
 const importSLA = async (filePath, originalName, simplePath) => {
    const result = await index.importSLA({
        'userKey': userInfo.value.userKey,
        'SLAKey': props.dataKey,
        'filePath': filePath,
        'originalName': originalName,
        'simplePath': simplePath,
    });
    console.log(result);
    if(result.status == 200){
        createMsg(langData.value['导入SLA报告成功!'], true);
        getDataList();
        save();
    }else if(result.status == 301){
        createMsg(langData.value['导入SLA报告失败!'], true);
        downliadLink(result.result, baseURL+'/');
    }else{
        createMsg(result.msg);
    }
}

/** 
 * 删除SLA api 
 * @param {string} userKey - 用户key
 * @param {string} SLAKey - SLA key
 * @returns {Object} {msg: 提示信息，status: 状态，data: 数据}
 */
 const deleteSLA = async (SLAKey) => {
    const result = await index.deleteSLA({
        'userKey': userInfo.value.userKey,
        'SLAKey': SLAKey,
    });
    if(result.status == 200){
        createMsg(langData.value['删除SLA附件成功!'], true);
        getDataList();
        save();
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
    if(t == 'download'){
        downliadLink(row.simplePath, baseURL);
    }
    if(t == 'lookview'){
        window.open('http://view.officeapps.live.com/op/view.aspx?src='+baseURL+row.simplePath);
    }
    if(t == 'delete'){
        deleteSLA(props.dataKey);
    }
}

// 上传成功回调
const handleBatchUpdate = (response, uploadFile, uploadFiles) => {
    if(response.statusCode == 200){
        console.log(response);
        if(show.value == 'updateSLA'){
            importSLA(response.filePath, response.originalName, response.simplePath);
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
    <section class="report-wrap">
        <header class="header">
            <h3>{{langData['SLA报告']}}</h3>
            <img class="close" @click="close" src="../../assets/close.svg" alt="">
        </header>
        <main class="main">
            <el-upload
                v-if="orgMemberInfo.englishName == 'FS' && orgMemberInfo.role == 2"
                class="inline-block"
                :action="baseURL+'/upload'"
                :show-file-list="false"
                accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                :on-success="handleBatchUpdate"
            >
                <template #trigger>
                    <el-button type="primary" size="small" @click="handleClickAction('', 'updateSLA')">{{langData['上传SLA报告']}}</el-button>
                </template>
            </el-upload>
        </main>
        <footer class="footer">
            <el-table 
                :data="tableData" 
                border 
                height="300"
                style="width: 100%">
                <el-table-column prop="deliveryBatch" :label="langData['批次']" align="center" width="120" />
                <el-table-column prop="originalName" :label="langData['文件名']" align="center" width="200" />
                <el-table-column prop="userInfoUpload" :label="langData['上传人']" align="center" width="100" />
                <el-table-column prop="createTime" :label="langData['创建时间']" align="center" width="120" />
                <el-table-column prop="updateTime" :label="langData['更新时间']" align="center" width="120" />
                <el-table-column :label="langData['操作']" fixed="right" width="200" align="center">
                    <template #default="scope">
                        <a class="marginR10" :href="baseURL+scope.row.simplePath" download target="_blank">{{langData['下载']}}</a>
                        <!-- <el-button size="small" type="primary" @click="handleClickAction(scope.row, 'download')">{{langData['下载']}}</el-button> -->
                        <el-button size="small" type="primary" @click="handleClickAction(scope.row, 'lookview')">{{langData['查看']}}</el-button>
                        <el-popconfirm
                            v-if="userInfo.userKey == scope.row.uploadUserKey"
                            width="220"
                            :confirm-button-text="langData['确定']"
                            :cancel-button-text="langData['取消']"
                            :title="langData['您确认要删除该SLA附件吗?']"
                            @confirm="handleClickAction(scope.row, 'delete')"
                        >
                            <template #reference>
                                <el-button type="primary" size="small">{{langData['删除']}}</el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
        </footer>
    </section>
</template>

<style scoped lang="scss">
.report-wrap{
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
.marginR10{
    margin-right: 10px;
}
</style>