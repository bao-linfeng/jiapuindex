<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ElLoading } from 'element-plus';
import { useGlobalStore } from '../store/global.js';
import { setValue, createMsg, initDownloadExcel, downliadLink, thousands } from '../util/ADS.js';
import { baseURL, index } from '../util/api';
import ReturnReasonModule from '../components/deliveryreport/ReturnReasonModule.vue';
import EditBatchName from '../components/deliveryreport/EditBatchName.vue';
import LogModule from '../components/deliveryreport/LogModule.vue';
import Production from './Production.vue';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, orgList, orgMemberInfo, langData, lanType } = storeToRefs(global);
const { } = global;

const orgKey = ref('');
const deliveryProgress = ref('');
const deliverList = ref([
    {'label': langData.value['交付进度'], 'value': ''},
    // {'label': '未下载', 'value': '0'},
    // {'label': '待递交', 'value': '1'},
    {'label': langData.value['待审核'], 'value': '2'},
    {'label': langData.value['已打回'], 'value': '4'},
    {'label': langData.value['已通过'], 'value': '3'},
    {'label': langData.value['已完工'], 'value': '6'},
]);
const deliveryBatch = ref('');
const deliverBatchKey = ref('');
const deliverBatchKeyList = ref([]);

const page = ref(1);
const limit = ref(30);
const total = ref(0);
const handleCurrentChange = (data) => {
    console.log(data);
    page.value = data;
    getDataList();
}

const tableData = ref([]);
const h = ref(window.innerHeight - 140);
/** 
 * 机构交付报告api 
 * @param {string} orgKey - 机构key
 * @param {string} deliverBatchKey - 交付批次key
 * @param {string} deliveryProgress - 交付进度
 * @param {Number} page - 页码
 * @param {Number} limit - limit
 * @returns {Object} {msg: 提示信息，status: 状态，result: {list: 数据, pageNum: 分页, total: 总条数}}
 */
 const getDataList = async () => {
    console.time('get delivery report');
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.orgDeliveryReport({
        'orgKey': orgKey.value,
        'deliveryBatch': deliveryBatch.value,
        'deliveryProgress': deliveryProgress.value, 
        'page': page.value,
        'limit': limit.value,
    });
    console.timeEnd('get delivery report');
    loading.close();
    if(result.status == 200){
        // 2 等待审核 3 通过 4 打回 5 有条件通过
        tableData.value = result.result.list.map((ele) => {
            ele.orgName = lanType.value == 'en' ? ele.englishName : ele.orgName;
            ele.statusO = ele.status === 0 ? langData.value['未索引'] : ele.status === 1 ? langData.value['待递交'] : ele.status === 2 ? langData.value['待审核'] : ele.status === 3 ? langData.value['已通过'] : ele.status === 4 ? langData.value['已打回'] : ele.status === 5 ? langData.value['有条件通过'] : ele.status === 6 ? langData.value['完工'] : '';
            ele.gcCount = thousands(ele.gcCount);
            ele.imgCount = thousands(ele.imgCount);
            ele.twoPageCount = thousands(ele.twoPageCount);
            ele.singlePageCount = thousands(ele.singlePageCount);
            ele.ADJImageCount = thousands(ele.ADJImageCount);
            ele.totalPersonCount = thousands(ele.totalPersonCount);
            ele.deadCount = thousands(ele.deadCount);
            ele.maleCount = thousands(ele.maleCount);
            ele.femaleCount = thousands(ele.femaleCount);
            ele.bxCount = thousands(ele.bxCount);
            ele.regularNodeCount = thousands(ele.regularNodeCount);
            ele.JHNodeCount = thousands(ele.JHNodeCount);
            
            return ele;
        });
        total.value = result.result.total;
        console.table(tableData.value);
    }else{
        createMsg(result.msg);
    }
}
/** 
 * 导入交付报告api 
 * @param {string} userKey - 用户key
 * @param {string} orgKey - 机构key
 * @param {string} filePath - 上传的excel文件路径
 * @param {string} originalName - 原始文件名
 * @returns {Object} {msg: 提示信息，status: 状态，data: 数据}
 */
 const importDeliverBatchData = async (filePath, originalName) => {
    const result = await index.importDeliverBatchData({
        'userKey': userInfo.value.userKey,
        'orgKey': orgMemberInfo.value.orgKey,
        'filePath': filePath,
        'originalName': originalName,
    });
    if(result.status == 200){
        createMsg(langData.value['导入交付报告成功!'], true);
        handleSearch();
    }else if(result.status == 301){
        createMsg(langData.value['导入交付报告失败!']);
        downliadLink(result.result, baseURL+'/');
    }else{
        createMsg(result.msg);
    }
}
/** 
 * 机构数据更新api 
 * @param {string} userKey - 用户key
 * @param {string} orgKey - 机构key
 * @param {string} filePath - 上传的excel文件路径
 * @param {string} originalName - 原始文件名
 * @param {string} deliverBatchKey - 交付批次key
 * @returns {Object} {msg: 提示信息，status: 状态}
 */
 const orgDataUpdate = async (filePath, originalName) => {
    const result = await index.orgDataUpdate({
        'userKey': userInfo.value.userKey,
        'orgKey': orgMemberInfo.value.orgKey,
        'filePath': filePath,
        'originalName': originalName,
        'deliverBatchKey': dataKey.value,
    });
    if(result.status == 200){
        createMsg(langData.value['数据更新成功!'], true);
        getDataList();
    }else if(result.status == 301){
        createMsg(langData.value['导入交付报告失败!']);
        downliadLink(result.result, baseURL+'/');
    }else{
        createMsg(result.msg);
    }
}

function trace(){// 最终代码的运行
    console.trace();
}

/** 
 * 机构批量数据更新api 
 * @param {string} userKey - 用户key
 * @param {string} orgKey - 机构key
 * @param {string} filePath - 上传的excel文件路径
 * @param {string} originalName - 原始文件名
 * @returns {Object} {msg: 提示信息，status: 状态}
 */
 const orgBatchDataUpdate = async (filePath, originalName) => {
    const result = await index.orgBatchDataUpdate({
        'userKey': userInfo.value.userKey,
        'orgKey': orgMemberInfo.value.orgKey,
        'filePath': filePath,
        'originalName': originalName,
    });
    if(result.status == 200){
        createMsg(langData.value['批量更新成功!'], true);
        getDataList();
    }else if(result.status == 301){
        createMsg(langData.value['批量更新失败!']);
        downliadLink(result.result, baseURL+'/');
    }else{
        createMsg(result.msg);
    }
}

/** 
 * 交付批次 完工api 
 * @param {string} userKey - 用户key
 * @param {string} deliveryBatchKey - 交付批次key
 * @returns {Object} {msg: 提示信息，status: 状态}
 */
 const deliveryBatchFinish = async (deliveryBatchKey) => {
    const result = await index.deliveryBatchFinish({
        'userKey': userInfo.value.userKey,
        'deliveryBatchKey': deliveryBatchKey,
    });
    if(result.status == 200){
        createMsg(langData.value['交付批次完工成功!'], true);
        getDataList();
    }else{
        createMsg(result.msg);
    }
}

/** 
 * 删除交付批次api 
 * @param {string} userKey - 用户key
 * @param {string} deliveryBatchKey - 批次key
 * @returns {Object} {msg: 提示信息，status: 状态}
 */
 const deleteDeliveryBatch = async (deliveryBatchKey) => {
    const result = await index.deleteDeliveryBatchData({
        'userKey': userInfo.value.userKey,
        'deliveryBatchKey': deliveryBatchKey,
    });
    if(result.status == 200){
        createMsg(langData.value['删除交付批次成功!'], true);
        getDataList();
    }else{
        createMsg(result.msg);
    }
}

const orgListArr = ref([]);
onMounted(() => {
    if(orgMemberInfo.value.englishName == 'FS'){
        
    }else{
        orgKey.value = orgMemberInfo.value.orgKey;
    }
    orgListArr.value = orgList.value.filter((ele) => {
        return ele.label != 'FS';
    });
    orgListArr.value.unshift({'label': langData.value['全部机构'], 'value': ''});

    handleSearch();
});

const handleSearch = () => {
    page.value = 1;
    getDataList();
}

const selectList = ref([]);
const handleSelectionChange = (data) => {
    console.log(data);
    selectList.value = data;
}

const dataKey = ref('');
const DeliverBatchName = ref('');
// show -> 1 审核；show -> 2 打回原因；
const show = ref(0);
// 操作
const handleClickAction = (row, t) => {
    console.log(row, t);
    dataKey.value = row && row.deliverBatchKey;
    DeliverBatchName.value = row && row.deliveryBatch;
    if(t === 'returnReason'){
        show.value = 2;
    }
    if(t === 'updateData'){
        show.value = t;
    }
    if(t === 'editBatchName'){
        show.value = 4;
    }
    if(t === 'production'){
        show.value = 'production';
        // router.push('/production?id='+row.deliverBatchKey);
    }
    if(t === 'lookLog'){
        show.value = 6;
    }
    if(t === 'multiple'){
        show.value = t;
    }
    if(t === 'single'){
        show.value = t;
    }
    if(t === 'excel'){
        let aoa = [
            ['序号', '*交付批次', '* 谱ID', '谱名', '#节点', '常规节点', '总人数', '男性', '女性', '性别未知', '去世节点数', '影像页数', 'adj影像数', '全部已故', '谱数统计', '交付备注'],
            ['Seq. Number', 'Actual Delivery Date', 'Title Number',  'Jiapu Title', 'Unnamed Names (#)', 'Regular Names', 'Total Names', 'Male', 'Female', 'Unknown', 'Deceased Names', 'Total Images','Adj. Images', 'All Deceased', 'Statistical Inclusion', 'Note'],
            ['1', 'L60 0812', '3014961827', '李氏宗谱', '', '', '', '','', '', '', '', '', '是', '否', '']
        ];
        initDownloadExcel(aoa, '交付报告模板');
    }
    if(t === 'finished'){
        if(!row.finishSLA){
            return createMsg('请完结错误清单');
        }
        deliveryBatchFinish(row.deliverBatchKey);
    }
    if(t === 'delete'){
        deleteDeliveryBatch(row.deliverBatchKey);
    }
}

// 批次编辑回调
const handleEditSave = (data) => {
    show.value = 0;
    getDataList();
}
// 上传成功回调
const handleBatchUpdate = (response, uploadFile, uploadFiles) => {
    // console.log(response, uploadFile, uploadFiles);
    if(response.statusCode == 200){
        console.log(response);
        if(show.value == 'single'){
            importDeliverBatchData(response.filePath, response.originalName);
        }
        if(show.value == 'multiple'){
            orgBatchDataUpdate(response.filePath, response.originalName);
        }
        if(show.value == 'updateData'){
            orgDataUpdate(response.filePath, response.originalName);
        }
    }else{
        createMsg(response.msg);
    }
}

// route切换
const route = ref(orgMemberInfo.value.englishName == 'FS' && orgMemberInfo.value.role == 2 ? '/SLA' : '/deliveryReport');
const routeList = ref([{'label': langData.value['交付报告'], 'value': '/deliveryReport'}, {'label': 'SLA', 'value': '/SLA'}]);
watch(route, () => {
    router.push(route.value);
});

</script>

<template>
    <section class="delivery-report-wrap">
        <header class="header">
            <div class="left">
                <h3>{{langData['交付报告']}}</h3>
            </div>
            <div class="right">
                <el-upload
                    v-if="orgMemberInfo.englishName !== 'FS' && orgMemberInfo.role == 1"
                    ref="uploadRef1"
                    :action="baseURL+'/upload'"
                    :show-file-list="false"
                    accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    :on-success="handleBatchUpdate"
                >
                    <template #trigger>
                        <el-button @click="handleClickAction('', 'multiple')" type="primary">{{langData['批量更新']}}</el-button>
                    </template>
                </el-upload>
                <el-upload
                    v-if="orgMemberInfo.englishName !== 'FS' && (orgMemberInfo.role == 1 || orgMemberInfo.role == 2)"
                    class="marginL10"
                    ref="uploadRef2"
                    :action="baseURL+'/upload'"
                    :show-file-list="false"
                    accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    :on-success="handleBatchUpdate"
                >
                    <template #trigger>
                        <el-button @click="handleClickAction('', 'single')" type="primary">{{langData['导入交付报告']}}</el-button>
                    </template>
                </el-upload>
                <el-button class="marginL10" @click="handleClickAction('', 'excel')" type="primary">{{langData['模版']}}</el-button>
            </div>
        </header>
        <main class="main">
            <div class="search-wrap">
                <el-select v-model="route" class="w150">
                    <el-option v-for="item in routeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-if="orgMemberInfo.englishName == 'FS'" v-model="orgKey" class="w150" :placeholder="langData['机构列表']">
                    <el-option v-for="item in orgListArr" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-model="deliveryProgress" class="w150" :placeholder="langData['交付进度']">
                    <el-option v-for="item in deliverList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-input v-model="deliveryBatch" class="w150" :placeholder="langData['交付批次']" clearable />
                <el-button type="primary" @click="handleSearch">{{langData['检索']}}</el-button>
            </div>
            <el-table 
                :data="tableData" 
                border 
                :height="h"
                style="width: 100%"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column prop="orgName" :label="langData['机构名称']" width="100" align="center" />
                <el-table-column prop="deliveryBatch" :label="langData['交付批次']" min-width="150" align="center" />
                <el-table-column prop="statusO" :label="langData['交付进度']" width="150" align="center" />
                <el-table-column prop="gcCount" :label="langData['家谱数']" width="120" align="center" />
                <el-table-column prop="JHNodeCount" :label="langData['#节点']" width="150" align="center" />
                <el-table-column prop="regularNodeCount" :label="langData['常规节点']" width="100" align="center" />
                <el-table-column prop="totalPersonCount" :label="langData['总人数']" width="100" align="center" />
                <el-table-column prop="maleCount" :label="langData['男性']" width="100" align="center" />
                <el-table-column prop="femaleCount" :label="langData['女性']" width="100" align="center" />
                <el-table-column prop="bxCount" :label="langData['性别未知']" width="100" align="center" />
                <el-table-column prop="deadCount" :label="langData['去世节点数']" width="100" align="center" />
                <el-table-column prop="allDeadGCCount" :label="langData['全部已故谱数']" width="100" align="center" />
                <el-table-column prop="imgCount" :label="langData['影像页数']" width="100" align="center" />
                <el-table-column prop="ADJImageCount" :label="langData['adj影像数']" width="100" align="center" />
                <el-table-column :label="langData['操作']" fixed="right" width="250" align="center">
                    <template #default="scope">
                        <el-popconfirm
                            v-if="orgMemberInfo.englishName == 'FS' && orgMemberInfo.role == 1 && (scope.row.status == 3 || scope.row.status == 5)"
                            width="220"
                            :confirm-button-text="langData['确定']"
                            :cancel-button-text="langData['取消']"
                            :title="langData['您确认要完工该交付批次吗?']"
                            @confirm="handleClickAction(scope.row, 'finished')"
                        >
                            <template #reference>
                                <el-button :class="{disabled: !scope.row.finishSLA}" type="primary" size="small">{{langData['完工']}}</el-button>
                            </template>
                        </el-popconfirm>
                        <el-button v-if="orgMemberInfo.englishName !== 'FS' && scope.row.status == 4" size="small" type="primary" @click="handleClickAction(scope.row, 'returnReason')">{{langData['打回原因']}}</el-button>
                        <el-upload
                            v-if="orgMemberInfo.englishName !== 'FS' && (orgMemberInfo.role == 1 || orgMemberInfo.role == 2) && (scope.row.status >= 2 && scope.row.status <= 5)"
                            class="inline-block marginL10"
                            :action="baseURL+'/upload'"
                            :show-file-list="false"
                            accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            :on-success="handleBatchUpdate"
                        >
                            <template #trigger>
                                <el-button type="primary" size="small" @click="handleClickAction(scope.row, 'updateData')">{{langData['更新报告']}}</el-button>
                            </template>
                        </el-upload>
                        <el-button class="marginL10" v-if="orgMemberInfo.englishName !== 'FS' && (orgMemberInfo.role == 1 || orgMemberInfo.role == 2)" size="small" type="primary" @click="handleClickAction(scope.row, 'editBatchName')">{{langData['批次名修改']}}</el-button>
                        <el-button size="small" type="primary" @click="handleClickAction(scope.row, 'production')">Production</el-button>
                        <el-button size="small" type="primary" @click="handleClickAction(scope.row, 'lookLog')">{{langData['日志']}}</el-button>
                        <el-popconfirm
                            v-if="orgMemberInfo.englishName != 'FS' && orgMemberInfo.role == 1 && scope.row.status <= 2"
                            width="220"
                            :confirm-button-text="langData['确定']"
                            :cancel-button-text="langData['取消']"
                            :title="langData['您确认要删除该交付批次吗?']"
                            @confirm="handleClickAction(scope.row, 'delete')"
                        >
                            <template #reference>
                                <el-button type="primary" size="small">{{langData['删除']}}</el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
        </main>
        <footer class="footer">
            <div class="left"></div>
            <div class="rigth">
                <el-pagination
                    small
                    background
                    layout="prev, pager, next, jumper, total"
                    :current-page="page"
                    :page-size="limit"
                    :total="total"
                    :hide-on-single-page="true"
                    @current-change="handleCurrentChange"
                />
            </div>
        </footer>
    </section>
    <!-- 打回原因 -->
    <ReturnReasonModule v-if="show === 2" :dataKey="dataKey" v-on:close="show = 0" />
    <!-- 编辑批次名称 -->
    <EditBatchName v-if="show === 4" :dataKey="dataKey" :DeliverBatchName="DeliverBatchName" v-on:close="show = 0" v-on:save="handleEditSave" />
    <!-- 日子 -->
    <LogModule v-if="show === 6" :dataKey="dataKey" v-on:close="show = 0" />
    <!-- Production -->
    <Production v-if="show === 'production'" :dataKey="dataKey" v-on:close="show = 0" />
</template>

<style scoped lang="scss">
.delivery-report-wrap{
    position: relative;
    width: 100%;
    height: 100%;
    .header{
        position: relative;
        height: 5rem;
        width: calc(100% - 4rem);
        padding: 0 2rem;
        background: #fff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 1.8rem;
        .left{
            display: flex;
            align-items: center;
        }
        .right{
            height: 100%;
            display: flex;
            align-items: center;
        }
    }
    .main{
        width: calc(100% - 4rem);
        height: calc(100% - 10rem);
        padding: 0 2rem;
        font-size: 2.5rem;
        .search-wrap{
            display: flex;
            align-items: center;
            height: 4rem;
        }
    }
    .footer{
        width: calc(100% - 4rem);
        padding: 0 2rem;
        height: 5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .left{
            display: flex;
            align-items: center;
        }
        .right{
            display: flex;
            align-items: center;
        }
    }
}
.w150{
    width: 150px;
}
.marginL10{
    margin-left: 10px;
}
.inline-block{
    display: inline-block;
}
.disabled{
    background: #ddd;
}
</style>