<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../store/global.js';
import { setValue, createMsg, thousands } from '../util/ADS.js';
import { baseURL, index } from '../util/api';
import AllocationDetails from '../components/IndexAllocationAndCompletionReport/AllocationDetails.vue';
import DeliveryDetails from '../components/IndexAllocationAndCompletionReport/DeliveryDetails.vue';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, orgList, orgMemberInfo, langData, lanType } = storeToRefs(global);
const { } = global;

const h = ref(window.innerHeight - 140);
const year = ref();
const startYear = ref('');
const endYear = ref('');
const tableData = ref([]);

// 明细
const type = ref('1');
const typeList = ref([
    {'label': langData.value['按年份汇总'], 'value': '1'},
    {'label': langData.value['按分配批次汇总'], 'value': '2'},
]);
const orgKey = ref('');
const assignBatchKey = ref('');
const assignOrgKey = ref('');
const show = ref(0);
const handleClickAction = (row, t) => {
    console.log(row, t);
    assignOrgKey.value = row.assignOrgKey;
    assignBatchKey.value = row.assignBatchKey;
    year.value = (row.year || '')+'';
    if(t === 'allocationDetails'){
        show.value = 1;
    }
    if(t === 'deliveryDetails'){
        show.value = 2;
    }
}
const loading = ref(false);
/** 
 * 索引分配与完成度表api 
 * @param {string} year - 年份
 * @returns {Object} {msg: 提示信息，status: 状态，data: 统计数据}
 */
 const getDataList = async () => {
    console.time('get assign deliver report');
    loading.value = true;
    const result = await index.assignDeliverReport({
        'type': type.value,
        'startYear': startYear.value,
        'endYear': endYear.value,
        'orgKey': orgKey.value,
    });
    console.timeEnd('get assign deliver report');
    loading.value = false;
    if(result.status == 200){
        tableData.value = result.data.map((ele) => {
            ele.deliverProgressO = ele.deliverProgress+'%';
            ele.assignGCCount = thousands(ele.assignGCCount);
            ele.assignImageCount = thousands(ele.assignImageCount);
            ele.assignADJImageCount = thousands(ele.assignADJImageCount);
            ele.deliverGCCount = thousands(ele.deliverGCCount);
            ele.deliverImageCount = thousands(ele.deliverImageCount);
            ele.deliverADJImageCount = thousands(ele.deliverADJImageCount);
            ele.deliverPersonCount = thousands(ele.deliverPersonCount);
            ele.finishGCCount = thousands(ele.finishGCCount);
            ele.finishPersonCount = thousands(ele.finishPersonCount);

            ele.RMSDeliverGCCount = thousands(ele.RMSDeliverGCCount);
            ele.RMSDeliverImageCount = thousands(ele.RMSDeliverImageCount);
            ele.RMSDeliverADJImageCount = thousands(ele.RMSDeliverADJImageCount);
            ele.RMSDeliverPersonCount = thousands(ele.RMSDeliverPersonCount);
            ele.RMSFinishGCCount = thousands(ele.RMSFinishGCCount);
            ele.RMSFinishPersonCount = thousands(ele.RMSFinishPersonCount);

            return ele;
        });
        console.table(tableData.value);
    }else{
        createMsg(result.msg);
    }
}
onMounted(() => {
    if(orgMemberInfo.value.englishName == 'FS'){
        
    }else{
        orgKey.value = orgMemberInfo.value.orgKey;
    }
    getDataList();
});

watch(type, () => {
    getDataList();
});

</script>

<template>
    <section class="IndexAllocationAndCompletionReport-wrap">
        <header class="header">
            <div class="left">
                <h3>{{langData['索引分配与完成度表']}}</h3>
            </div>
            <div class="right">
                <!-- <el-button type="primary">{{langData['下载Excel']}}</el-button> -->
            </div>
        </header>
        <main class="main">
            <div class="search-wrap">
                <el-select v-model="type" class="w150">
                    <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-if="orgMemberInfo.englishName == 'FS'" v-model="orgKey" class="w150" :placeholder="langData['机构列表']" clearable>
                    <el-option v-for="item in orgList" :key="item.value" :label="item.label" :value="item.value" />
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
                <el-button type="primary" @click="getDataList">{{langData['检索']}}</el-button>
            </div>
            <el-table 
                v-loading="loading"
                :data="tableData" 
                border 
                :height="h"
                style="width: 100%">
                <el-table-column v-if="type == 1" prop="year" :label="langData['年份']" align="center" width="120" />
                <el-table-column v-if="type == 2" prop="assignBatch" :label="langData['分配批次号']" align="center" min-width="120" />
                <el-table-column prop="orgName" :label="langData['机构名称']" align="center" width="120" />
                <el-table-column prop="deliverProgressO" :label="langData['谱目交付进度']" align="center" width="120" />
                <el-table-column :label="langData['已分配']" :align="'center'">
                    <el-table-column prop="assignGCCount" :label="langData['谱目数']" align="center" width="120" />
                    <el-table-column prop="assignImageCount" :label="langData['影像数']" align="center" width="120" />
                    <el-table-column prop="assignADJImageCount" :label="langData['adj影像数']" align="center" width="120" />
                </el-table-column>
                <el-table-column :label="'Pipeline '+langData['已交付']" :align="'center'">
                    <el-table-column prop="deliverGCCount" :label="langData['谱目数']" align="center" width="120" />
                    <el-table-column prop="deliverImageCount" :label="langData['影像数']" align="center" width="120" />
                    <el-table-column prop="deliverADJImageCount" :label="langData['adj影像数']" align="center" width="120" />
                    <el-table-column prop="deliverPersonCount" :label="langData['节点数']" align="center" width="120" />
                </el-table-column>
                <el-table-column :label="'Pipeline '+langData['已完工']" :align="'center'">
                    <el-table-column prop="finishGCCount" :label="langData['谱目数']" align="center" width="120" />
                    <el-table-column prop="finishPersonCount" :label="langData['节点数']" align="center" width="120" />
                </el-table-column>

                <el-table-column v-if="type == 1" :label="'RMS '+langData['已交付']" :align="'center'">
                    <el-table-column prop="RMSDeliverGCCount" :label="langData['谱目数']" align="center" width="120" />
                    <el-table-column prop="RMSDeliverImageCount" :label="langData['影像数']" align="center" width="120" />
                    <el-table-column prop="RMSDeliverADJImageCount" :label="langData['adj影像数']" align="center" width="120" />
                    <el-table-column prop="RMSDeliverPersonCount" :label="langData['节点数']" align="center" width="120" />
                </el-table-column>
                <el-table-column v-if="type == 1" :label="'RMS '+langData['已完工']" :align="'center'">
                    <el-table-column prop="RMSFinishGCCount" :label="langData['谱目数']" align="center" width="120" />
                    <el-table-column prop="RMSFinishPersonCount" :label="langData['节点数']" align="center" width="120" />
                </el-table-column>
                <el-table-column :label="langData['操作']" fixed="right" width="200" align="center">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="handleClickAction(scope.row, 'allocationDetails')">{{langData['分配明细']}}</el-button>
                        <el-button size="small" type="primary" @click="handleClickAction(scope.row, 'deliveryDetails')">{{langData['交付明细']}}</el-button>
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
    <AllocationDetails v-if="show === 1" :year="year" :orgKey="assignOrgKey" :assignBatchKey="assignBatchKey" v-on:close="show = 0" />
    <DeliveryDetails v-if="show === 2" :year="year" :orgKey="assignOrgKey" :assignBatchKey="assignBatchKey" v-on:close="show = 0" />
</template>

<style scoped lang="scss">
.IndexAllocationAndCompletionReport-wrap{
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