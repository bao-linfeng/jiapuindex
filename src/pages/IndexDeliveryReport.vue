<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../store/global.js';
import { setValue, createMsg, thousands, initDownloadExcel } from '../util/ADS.js';
import { baseURL, index } from '../util/api';
import DeliveryDetails from '../components/IndexDeliveryReport/DeliveryDetails.vue';
import Production from '../components/IndexDeliveryReport/Production.vue';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, orgList, orgMemberInfo, langData, lanType } = storeToRefs(global);
const { } = global;

const orgKey = ref('');
const year = ref();
const startYear = ref('');
const endYear = ref('');
const tableData = ref([]);
const orgListArr = ref([]);

// 明细
const catalogKey = ref('');
const show = ref('');
const assignBatchKey = ref('');
const indexOrgKey = ref('');
const handleClickAction = (row, t) => {
    // console.log(row, t);
    catalogKey.value = row._key;
    indexOrgKey.value = row.indexOrgKey;
    year.value = row.year ? row.year+'' : '';

    show.value = t;
}

const h = ref(window.innerHeight - 140);
const loading = ref(false);
/** 
 * 索引交付报表api 
 * @param {string} startYear - 开始年份
 * @param {string} endYear - 结束年份
 * @returns {Object} {msg: 提示信息，status: 状态，data: 统计数据}
 */
 const getDataList = async () => {
    console.time('get delivery report');
    loading.value = true;
    const result = await index.deliverReport({
        'startYear': startYear.value,
        'endYear': endYear.value,
        'orgKey': orgKey.value,
        'assignBatchKey': assignBatch.value,
    });
    console.timeEnd('get delivery report');
    loading.value = false;
    if(result.status == 200){
        let deliveryCount = 0, deliverImageCount = 0, deliverGCCount = 0, deliverADJImageCount = 0, deliverPersonCount = 0, returnCount = 0, conditionalPassCount = 0, passRateO = 0, finishGCCount = 0, finishPersonCount = 0; 
        tableData.value = result.data.map((ele) => {
            deliveryCount = deliveryCount + ele.deliveryCount;
            deliverImageCount = deliverImageCount + ele.deliverImageCount;
            deliverGCCount = deliverGCCount + ele.deliverGCCount;
            deliverADJImageCount = deliverADJImageCount + ele.deliverADJImageCount;
            deliverPersonCount = deliverPersonCount + ele.deliverPersonCount;
            returnCount = returnCount + ele.returnCount;
            conditionalPassCount = conditionalPassCount + ele.conditionalPassCount;
            passRateO = passRateO + ele.passRate;
            finishGCCount = finishGCCount + ele.finishGCCount;
            finishPersonCount = finishPersonCount + ele.finishPersonCount;

            ele.passRateO = (ele.passRate).toFixed(2)+'%';
            ele.deliverImageCount = thousands(ele.deliverImageCount);
            ele.deliverGCCount = thousands(ele.deliverGCCount);
            ele.deliverADJImageCount = thousands(ele.deliverADJImageCount);
            ele.deliverPersonCount = thousands(ele.deliverPersonCount);
            ele.finishGCCount = thousands(ele.finishGCCount);
            ele.finishPersonCount = thousands(ele.finishPersonCount);
            
            return ele;
        });
        if(tableData.value.length){
            tableData.value.push({
                'year': langData.value['小计'], 
                'deliveryCount': deliveryCount, 
                'deliverImageCount': thousands(deliverImageCount), 
                'deliverGCCount': deliverGCCount, 
                'deliverADJImageCount': thousands(deliverADJImageCount),
                'deliverPersonCount': thousands(deliverPersonCount),
                'returnCount': returnCount,
                'conditionalPassCount': conditionalPassCount,
                'passRateO': (passRateO/tableData.value.length).toFixed(2)+'%',
                'finishGCCount': finishGCCount,
                'finishPersonCount': thousands(finishPersonCount),
            });
        }
        
        console.table(tableData.value);
    }else{
        createMsg(result.msg);
    }
}

const assignBatch = ref('');
const allocationBatchList = ref([]);
/** 
 * 分配批次列表api 
 * @param {string} startYear - 开始年份
 * @param {string} endYear - 结束年份
 * @returns {Object} {msg: 提示信息，status: 状态，data: 统计数据}
 */
const assignBatchList = async () => {
    const result = await index.assignBatchList({'orgKey': orgKey.value});
    if(result.status == 200){
        allocationBatchList.value = result.data.map((ele) => {
            ele.label = ele.assignBatch;
            ele.value = ele._key;
            return ele;
        });
        allocationBatchList.value.unshift({'label': langData.value['分配批次'], 'value': ''});
    }else{
        createMsg(result.msg);
    }
}

onMounted(() => {
    if(orgMemberInfo.value.englishName == 'FS'){
        
    }else{
        orgKey.value = orgMemberInfo.value.orgKey;
    }
    orgListArr.value = orgList.value.filter((ele) => {
        return ele.label != 'FS';
    });
    orgListArr.value.unshift({'label': langData.value['全部机构'], 'value': ''});
    assignBatchList();
    getDataList();
});

watch(assignBatch, (nv) => {
    assignBatchKey.value = nv;
});

const r = ref('/indexDeliveryReport');
const rList = ref([{'label': '交付报表', 'value': '/indexDeliveryReport'}, {'label': '完成报表', 'value': '/YearCompleteReport'}]);
watch(r, (nv, ov) => {
    router.push(nv);
});

// 下载excel
const handleDownload = () => {
    let aoa = [], t = [], name = langData.value['年度报告'];
    ['年份', '机构名称', '交付次数', '已交付谱目数', '已交付影像数', '已交付adj影像数', '已交付节点数', '打回次数', '有条件通过数', '通过率', '已完成谱目数', '已完成节点数'].forEach((ele) => {
        t.push(langData.value[ele]);
    });
    aoa.push(t);
    tableData.value.forEach((ele) => {
        aoa.push([ele.year, ele.orgName, ele.deliveryCount, ele.deliverGCCount, ele.deliverImageCount, ele.deliverADJImageCount, ele.deliverPersonCount, ele.returnCount, ele.conditionalPassCount, ele.passRateO, ele.finishGCCount, ele.finishPersonCount]);
    });

    initDownloadExcel(aoa, name);
}

</script>

<template>
    <section class="IndexDeliveryReport-wrap">
        <header class="header">
            <div class="left">
                <h3>{{langData['年度报告']}}</h3>
                <el-select v-model="r" class="w150 marginL10">
                    <el-option v-for="item in rList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </div>
            <div class="right">
                <el-button v-if="tableData.length" type="primary" @click="handleDownload">{{langData['下载Excel']}}</el-button>
            </div>
        </header>
        <main class="main">
            <div class="search-wrap">
                <el-select v-if="orgMemberInfo.englishName == 'FS'" v-model="orgKey" class="w150" :placeholder="langData['机构列表']">
                    <el-option v-for="item in orgListArr" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-date-picker
                    class="w150"
                    v-model="startYear"
                    value-format="YYYY"
                    type="year"
                    :placeholder="langData['开始时间']"
                />
                <el-date-picker
                    class="w150"
                    v-model="endYear"
                    value-format="YYYY"
                    type="year"
                    :placeholder="langData['结束时间']"
                />
                <el-select v-model="assignBatch" class="w150" :placeholder="langData['分配批次']" clearable>
                    <el-option v-for="item in allocationBatchList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button type="primary" @click="getDataList">{{langData['检索']}}</el-button>
            </div>
            <el-table 
                v-loading="loading"
                :data="tableData" 
                border 
                :height="h"
                style="width: 100%">
                <el-table-column prop="year" :label="langData['年份']" align="center" />
                <el-table-column prop="orgName" :label="langData['机构名称']" align="center" />
                <el-table-column prop="deliveryCount" :label="langData['交付次数']" align="center" />
                <el-table-column :label="langData['已交付']" :align="'center'">
                    <el-table-column prop="deliverGCCount" :label="langData['谱目数']" align="center" />
                    <el-table-column prop="deliverImageCount" :label="langData['影像数']" align="center" />
                    <el-table-column prop="deliverADJImageCount" :label="langData['adj影像数']" align="center" />
                    <el-table-column prop="deliverPersonCount" :label="langData['节点数']" align="center" />
                </el-table-column>
                <el-table-column prop="returnCount" :label="langData['打回次数']" align="center" />
                <el-table-column prop="conditionalPassCount" :label="langData['有条件通过数']" align="center" />
                <el-table-column prop="passRateO" :label="langData['通过率']" align="center" />
                <el-table-column :label="langData['已完工']" :align="'center'">
                    <el-table-column prop="finishGCCount" :label="langData['谱目数']" align="center" />
                    <el-table-column prop="finishPersonCount" :label="langData['节点数']" align="center" />
                </el-table-column>
                <el-table-column :label="langData['操作']" fixed="right" width="200" align="center">
                    <template #default="scope">
                        <el-button v-if="scope.row.orgName" size="small" type="primary" @click="handleClickAction(scope.row, 'Production')">Production</el-button>
                        <el-button v-if="scope.row.orgName" size="small" type="primary" @click="handleClickAction(scope.row, 'deliveryDetails')">{{langData['查看详情']}}</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </main>
        <footer class="footer">
            <div class="left"></div>
            <div class="rigth">
                
            </div>
        </footer>
    </section>
    <!-- 查看详情 -->
    <DeliveryDetails v-if="show === 'deliveryDetails'" :year="year" :orgKey="indexOrgKey" :assignBatchKey="assignBatchKey" v-on:close="show = ''" />
    <!-- Production -->
    <Production v-if="show === 'Production'" :orgKey="indexOrgKey" :year="year" v-on:close="show = ''" />
</template>

<style scoped lang="scss">
.IndexDeliveryReport-wrap{
    position: relative;
    width: 100%;
    height: 100%;
    .header{
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
            // display: flex;
            justify-content: flex-start;
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
    width: 150px !important;
}
.marginL10{
    margin-left: 10px;
}
.inline-block{
    display: inline-block;
}
</style>