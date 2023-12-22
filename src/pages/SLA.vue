<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../store/global.js';
import { setValue, createMsg, initDownloadExcel, downliadLink, thousands } from '../util/ADS.js';
import { baseURL, index } from '../util/api';
import ExamineModule from '../components/deliveryreport/examineModule.vue';
import EditSLA from '../components/SLA/EditSLA.vue';
import SLAReportList from '../components/SLA/SLAReportList.vue';
import SLAErrorList from '../components/SLA/SLAErrorList.vue';
import SLAFiles from '../components/SLA/SLAFiles.vue';
import SLAMemoList from '../components/SLA/SLAMemoList.vue';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, orgList, orgMemberInfo, langData, lanType } = storeToRefs(global);
const { } = global;

const orgKey = ref('');
const deliveryBatchList = ref([]);
const deliveryBatchKey = ref('');
const year = ref('');

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
 * SLA报告api 
 * @param {string} year - 年份
 * @param {string} orgKey - 机构key
 * @param {string} deliveryBatchKey - 交付批次key
 * @param {Number} page - 页码
 * @param {Number} limit - limit
 * @returns {Object} {msg: 提示信息，status: 状态，result: {list: 数据, pageNum: 分页, total: 总条数}}
 */
 const getDataList = async () => {
    console.time('get SLA report');
    const result = await index.getSLAList({
        'orgKey': orgKey.value,
        'deliveryBatchKey': deliveryBatchKey.value,
        'year': year.value,
        'page': page.value,
        'limit': limit.value,
    });
    console.timeEnd('get SLA report');
    if(result.status == 200){
        tableData.value = result.result.list.map((ele) => {
            ele.deliveryBatchO = ele.deliveryBatch + (ele.SLAReworkTime ? 're'+ele.SLAReworkTime : '');
            ele.ImageAuditO = ele.ImageAudit ? (ele.ImageAudit*100).toFixed(2)+'%' : '0%';
            ele.CompletenessO = ele.Completeness ? (ele.Completeness*100).toFixed(2)+'%' : '0%';
            ele.WrongNameO = ele.WrongName ? (ele.WrongName*100).toFixed(2)+'%' : '0%';
            ele.LinkingO = ele.Linking ? (ele.Linking*100).toFixed(2)+'%' : '0%';
            ele.SurnameO = ele.Surname ? (ele.Surname*100).toFixed(2)+'%' : '0%';
            ele.AKAO = ele.AKA ? (ele.AKA*100).toFixed(2)+'%' : '0%';
            ele.GivenNameO = ele.GivenName ? (ele.GivenName*100).toFixed(2)+'%' : '0%';
            ele.GenderO = ele.Gender ? (ele.Gender*100).toFixed(2)+'%' : '0%';
            ele.BirthDateO = ele.BirthDate ? (ele.BirthDate*100).toFixed(2)+'%' : '0%';
            ele.BirthPlaceO = ele.BirthPlace ? (ele.BirthPlace*100).toFixed(2)+'%' : '0%';
            ele.DeathDateO = ele.DeathDate ? (ele.DeathDate*100).toFixed(2)+'%' : '0%';
            ele.DeathAgeO = ele.DeathAge ? (ele.DeathAge*100).toFixed(2)+'%' : '0%';
            ele.MigrationToO = ele.MigrationTo ? (ele.MigrationTo*100).toFixed(2)+'%' : '0%';
            ele.MigrationFromO = ele.MigrationFrom ? (ele.MigrationFrom*100).toFixed(2)+'%' : '0%';
            ele.RelationshipO = ele.Relationship ? (ele.Relationship*100).toFixed(2)+'%' : '0%';
            ele.statusO = ele.status === 0 ? langData.value['未索引'] : ele.status === 1 ? langData.value['待递交'] : ele.status === 2 ? langData.value['待审核'] : ele.status === 3 ? langData.value['已通过'] : ele.status === 4 ? langData.value['已打回'] : ele.status === 5 ? langData.value['有条件通过'] :'';
            ele.statusO = ele.statusO + (ele.returnReason ? ': '+ele.returnReason : '');

            return ele;
        });
        total.value = result.result.total;
        console.table(tableData.value);
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
        'SLAKey': dataKey.value,
        'filePath': filePath,
        'originalName': originalName,
        'simplePath': simplePath,
    });
    console.log(result);
    if(result.status == 200){
        createMsg(langData.value['导入SLA报告成功!'], true);
        handleSearch();
    }else if(result.status == 301){
        createMsg(langData.value['导入SLA报告失败!'], true);
        downliadLink(result.result, baseURL+'/');
    }else{
        createMsg(result.msg);
    }
}

/** 
 * 交付批次列表api 
 * @param {string} orgKey - 机构key
 * @returns {Object} {msg: 提示信息，status: 状态，data: 数据}
 */
const getDeliveryBatchList = async () => {
    const result = await index.deliveryBatchList({'orgKey': orgKey.value});
    if(result.status == 200){
        deliveryBatchList.value = result.data.map((ele) => {
            ele.label = ele.deliveryBatch;
            ele.value = ele._key;
            return ele;
        });
        deliveryBatchList.value.unshift({'label': langData.value['交付批次'], 'value': ''});
    }else{
        createMsg(result.msg);
    }
}

/** 
 * 删除SLAapi 
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
        handleSearch();
    }else{
        createMsg(result.msg);
    }
}

const orgListArr = ref([]);
onMounted(() => {
    if(orgMemberInfo.value.englishName == 'FS'){
        if(orgMemberInfo.value.role == 2){
            routeList.value = [{'label': 'SLA', 'value': '/SLA'}];
        }
    }else{
        orgKey.value = orgMemberInfo.value.orgKey;
    }
    orgListArr.value = orgList.value.filter((ele) => {
        return ele.label != 'FS';
    });
    orgListArr.value.unshift({'label': langData.value['全部机构'], 'value': ''});
    getDeliveryBatchList();
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
// show -> 1 审核；show -> 2 打回原因；
const show = ref('');
const dataRow = ref({});
// 操作
const handleClickAction = (row, t) => {
    console.log(row, t);
    dataKey.value = row && row._key;

    if(t === 'examine'){
        if(!row.simplePath){
            return createMsg('请上传SLA报告');;
        }
        if(!row.errorListCount){
            return createMsg('请上传错误清单');
        }
    }
    if(t == 'editSLA'){
        dataRow.value = row;
    }
    if(t == 'errorList'){
        dataRow.value = row;
        if(!row.errorListCount && orgMemberInfo.value.englishName != 'FS'){
            return;
        }
    }
    if(t == 'download'){
        if(row.simplePath){
            downliadLink(row.simplePath, baseURL+'/');
        }
    }
    if(t === 'excel'){
        downliadLink('SLA模板.xlsx', '/');
    }
    if(t === 'delete'){
        deleteSLA(row._key);
    }

    show.value = t;
}

// 上传成功回调
const handleBatchUpdate = (response, uploadFile, uploadFiles) => {
    // console.log(response, uploadFile, uploadFiles);
    if(response.statusCode == 200){
        console.log(response);
        if(show.value == 'updateSLA'){
            importSLA(response.filePath, response.originalName, response.simplePath);
        }
    }else{
        createMsg(response.msg);
    }
}

// 审核保存回调
const handleExamineSave = (data) => {
    console.log(data);
    show.value = '';
    getDataList();
}

const cellClassName = ({ row, column, rowIndex, columnIndex }) => {
    if(row.ImageAudit < 0.97 && column.property == 'ImageAuditO'){
        return 'red-color';
    }
    if(row.Completeness < 0.98 && column.property == 'CompletenessO'){
        return 'red-color';
    }
    if(row.WrongName < 0.98 && column.property == 'WrongNameO'){
        return 'red-color';
    }
    if(row.Linking < 0.97 && column.property == 'LinkingO'){
        return 'red-color';
    }
    if(row.Surname < 0.98 && column.property == 'SurnameO'){
        return 'red-color';
    }
    if(row.AKA < 0.95 && column.property == 'AKAO'){
        return 'red-color';
    }
    if(row.GivenName < 0.98 && column.property == 'GivenNameO'){
        return 'red-color';
    }
    if(row.Gender < 0.98 && column.property == 'GenderO'){
        return 'red-color';
    }
    if(row.BirthDate < 0.95 && column.property == 'BirthDateO'){
        return 'red-color';
    }
    if(row.BirthPlace < 0.95 && column.property == 'BirthPlaceO'){
        return 'red-color';
    }
    if(row.DeathDate < 0.95 && column.property == 'DeathDateO'){
        return 'red-color';
    }
    if(row.DeathAge < 0.96 && column.property == 'DeathAgeO'){
        return 'red-color';
    }
    if(row.MigrationTo < 0.95 && column.property == 'MigrationToO'){
        return 'red-color';
    }
    if(row.MigrationFrom < 0.95 && column.property == 'MigrationFromO'){
        return 'red-color';
    }
    if(row.Relationship < 0.98 && column.property == 'RelationshipO'){
        return 'red-color';
    }
}

const headerCellClassName = ({row, column, rowIndex, columnIndex}) => {
    if(['AKA', 'Birth Date', 'Birth Place', 'Death Date', 'Death Age', 'Migration to', 'Migration from'].indexOf(column.label) > -1){
        return 'orange-background';
    }
    if(['ImageAuditO', 'CompletenessO', 'WrongNameO', 'LinkingO', 'SurnameO', 'AKAO', 'GivenNameO', 'GenderO', 'BirthDateO', 'BirthPlaceO', 'DeathDateO', 'DeathAgeO', 'MigrationToO', 'MigrationFromO', 'RelationshipO'].indexOf(column.property) > -1){
        return 'green-background';
    }
}

const handleSLAReportSave = () => {
    handleSearch();
}

// 编辑SLA
const handleEditSave = () => {
    show.value = '';
    getDataList();
}

// route切换
const route = ref('SLA');
const routeList = ref([{'label': langData.value['交付报告'], 'value': '/deliveryReport'}, {'label': 'SLA', 'value': '/SLA'}]);
watch(route, () => {
    router.push(route.value);
});

</script>

<template>
    <section class="SLA-wrap">
        <header class="header">
            <div class="left">
                <h3>SLA</h3>
            </div>
            <div class="right">
                <el-button type="primary" @click="handleClickAction('', 'SLAFiles')">{{langData['文件']}}</el-button>
                <el-button class="marginL10" @click="handleClickAction('', 'excel')" type="primary">{{langData['模版']}}</el-button>
            </div>
        </header>
        <main class="main">
            <div class="search-wrap">
                <el-select v-model="route" class="w150">
                    <el-option v-for="item in routeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-date-picker
                    class="w150"
                    v-model="year"
                    value-format="YYYY"
                    type="year"
                    :placeholder="langData['年份']"
                />
                <el-select v-if="orgMemberInfo.englishName == 'FS'" v-model="orgKey" class="w150" :placeholder="langData['机构列表']">
                    <el-option v-for="item in orgListArr" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select class="w150" v-model="deliveryBatchKey" clearable>
                    <el-option v-for="item in deliveryBatchList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button type="primary" @click="handleSearch">{{langData['检索']}}</el-button>
            </div>
            <el-table 
                :data="tableData" 
                border 
                :height="h"
                style="width: 100%"
                :cell-class-name="cellClassName"
                :header-cell-class-name="headerCellClassName"
                @selection-change="handleSelectionChange">
                <el-table-column prop="year" :label="langData['年份']" fixed="left" width="100" align="center" />
                <el-table-column prop="orgName" :label="langData['机构名称']" fixed="left" width="100" align="center" />
                <el-table-column prop="deliveryBatchO" :label="langData['交付批次']" fixed="left" min-width="150" align="center" />
                <el-table-column :label="langData['备注详情']" fixed="left" width="130" align="center">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="handleClickAction(scope.row, 'memo')">{{langData['备注']}}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="checkUserName" :label="langData['审核人']" width="150" align="center" />
                <el-table-column prop="statusO" :label="langData['审核情况']" width="150" align="center" />
                <el-table-column label="ImageAudit" width="120" align="center">
                    <el-table-column prop="ImageAuditO" label="97.00%" width="120" align="center" />
                </el-table-column>
                <el-table-column label="Completeness" width="130" align="center">
                    <el-table-column prop="CompletenessO" label="98.00%" width="130" align="center" />
                </el-table-column>
                <el-table-column label="Wrong Name" width="130" align="center">
                    <el-table-column prop="WrongNameO" label="98.00%" width="130" align="center" />
                </el-table-column>
                <el-table-column label="Linking" width="100" align="center">
                    <el-table-column prop="LinkingO" label="97.00%" width="100" align="center" />
                </el-table-column>
                <el-table-column label="Surname" width="100" align="center">
                    <el-table-column prop="SurnameO" label="98.00%" width="100" align="center" />
                </el-table-column>
                <el-table-column label="AKA" width="100" align="center">
                    <el-table-column prop="AKAO" label="95.00%" width="100" align="center" />
                </el-table-column>
                <el-table-column label="Given Name" width="130" align="center">
                    <el-table-column prop="GivenNameO" label="98.00%" width="130" align="center" />
                </el-table-column>
                <el-table-column label="Gender" width="100" align="center">
                    <el-table-column prop="GenderO" label="98.00%" width="100" align="center" />
                </el-table-column>
                <el-table-column label="Birth Date" width="130" align="center">
                    <el-table-column prop="BirthDateO" label="95.00%" width="130" align="center" />
                </el-table-column>
                <el-table-column label="Birth Place" width="130" align="center">
                    <el-table-column prop="BirthPlaceO" label="95.00%" width="130" align="center" />
                </el-table-column>
                <el-table-column label="Death Date" width="130" align="center">
                    <el-table-column prop="DeathDateO" label="95.00%" width="130" align="center" />
                </el-table-column>
                <el-table-column label="Death Age" width="130" align="center">
                    <el-table-column prop="DeathAgeO" label="96.00%" width="130" align="center" />
                </el-table-column>
                <el-table-column label="Migration to" width="130" align="center">
                    <el-table-column prop="MigrationToO" label="95.00%" width="130" align="center" />
                </el-table-column>
                <el-table-column label="Migration from" width="150" align="center">
                    <el-table-column prop="MigrationFromO" label="95.00%" width="150" align="center" />
                </el-table-column>
                <el-table-column label="Relationship" width="130" align="center">
                    <el-table-column prop="RelationshipO" label="98.00%" width="130" align="center" />
                </el-table-column>
                <el-table-column :label="langData['操作']" fixed="right" width="250" align="center">
                    <template #default="scope">
                        <el-badge class="margin10" :is-dot="!scope.row.simplePath && orgMemberInfo.englishName == 'FS' && orgMemberInfo.role == 2">
                            <el-button class="marginL10" size="small" type="primary" @click="handleClickAction(scope.row, 'showSLAList')">{{langData['SLA报告']}}</el-button>
                        </el-badge>
                        <el-badge class="margin10" :is-dot="((!scope.row.errorListCount || (!scope.row.finishSLA && scope.row.newestErrorListOrgName != 'FS')) && orgMemberInfo.englishName == 'FS' && orgMemberInfo.role == 2) || (!scope.row.finishSLA && scope.row.newestErrorListOrgName == 'FS' && orgMemberInfo.englishName != 'FS' && orgMemberInfo.role >= 2)">
                            <el-button class="marginL10" :class="{disabled: !scope.row.errorListCount && orgMemberInfo.englishName != 'FS'}" size="small" type="primary" @click="handleClickAction(scope.row, 'errorList')">{{langData['错误清单']}}</el-button>
                        </el-badge>
                        <el-badge class="margin10" :is-dot="!!(scope.row.simplePath && scope.row.errorListCount)" v-if="(orgMemberInfo.englishName == 'FS' && orgMemberInfo.role == 1 && scope.row.status == 2)">
                            <el-button class="marginL10" :class="{disabled: !scope.row.simplePath || !scope.row.errorListCount}" size="small" type="primary" @click="handleClickAction(scope.row, 'examine')">{{langData['审核']}}</el-button>
                        </el-badge>
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
    <!-- 审核 -->
    <ExamineModule v-if="show === 'examine'" :dataKey="dataKey" v-on:close="show = ''" v-on:save="handleExamineSave" />
    <!-- SLA编辑 -->
    <EditSLA v-if="show === 'editSLA'" :originData="dataRow" v-on:close="show = ''" v-on:save="handleEditSave" />
    <!-- SLA报告 -->
    <SLAReportList v-if="show === 'showSLAList'" :dataKey="dataKey" :row="dataRow" v-on:close="show = ''" v-on:save="handleSLAReportSave" />
    <!-- 错误报告 -->
    <SLAErrorList v-if="show === 'errorList'" :dataKey="dataKey" :row="dataRow" v-on:close="show = ''" v-on:save="handleEditSave" />
    <!-- 文件上传 -->
    <SLAFiles v-if="show === 'SLAFiles'" v-on:close="show = ''" />
    <!-- 交付备注 -->
    <SLAMemoList v-if="show === 'memo'" :dataKey="dataKey" v-on:close="show = ''" />
</template>

<style scoped lang="scss">
.SLA-wrap{
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
.margin10{
    margin: 5px 0;
}
</style>