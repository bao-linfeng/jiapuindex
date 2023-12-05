<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../store/global.js';
import { setValue, createMsg, thousands, initDownloadExcel } from '../util/ADS.js';
import { baseURL, index } from '../util/api';
import DeliveryDetails from '../components/IndexDeliveryReport/DeliveryDetails.vue';
import { ElLoading } from 'element-plus';
import EchartsModule from '../components/EchartsModule.vue';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, orgList, orgMemberInfo, langData, lanType } = storeToRefs(global);
const { } = global;

const orgKey = ref('');
const orgName = ref('');
const year = ref(new Date().getFullYear()+'');
const tableData = ref([]);
const orgListArr = ref([]);

// 明细
const catalogKey = ref('');
const show = ref('');
const handleClickAction = (row, t) => {
    // console.log(row, t);
    catalogKey.value = row._key;
    if(t === 'deliveryDetails'){
        show.value = 'deliveryDetails';
    }
}

const h = ref(window.innerHeight - 140);
const loading = ref(false);
/** 
 * 年度报告完成报表api 
 * @param {string} startYear - 开始年份
 * @param {string} endYear - 结束年份
 * @returns {Object} {msg: 提示信息，status: 状态，data: 统计数据}
 */
 const getDataList = async () => {
    console.time('get complete report');
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.targetStatistics({
        'orgKey': orgKey.value,
        'year': year.value,
    });
    loading.close();
    console.timeEnd('get complete report');
    if(result.status == 200){
        let targetNumber = 0, accumulateTarget = 0, gcCount= 0, personCount = 0, accumulatePerson = 0; 
        tableData.value = result.result.map((ele) => {
            ele.time = ele.year+''+(ele.month <= 9 ? '0'+ele.month : ele.month);
            orgName.value = ele.orgName;
            ele.orgName = ele.orgName ? ele.orgName : langData.value['全部机构'];
            targetNumber = targetNumber + ele.targetNumber;
            accumulateTarget = accumulateTarget + ele.accumulateTarget;
            gcCount = gcCount + ele.gcCount;
            personCount = personCount + ele.personCount;
            accumulatePerson = accumulatePerson + ele.accumulatePerson;

            ele.targetNumberO = thousands(ele.targetNumber);
            ele.accumulateTargetO = thousands(ele.accumulateTarget);
            ele.gcCountO = thousands(ele.gcCount);
            ele.personCountO = thousands(ele.personCount);
            ele.accumulatePersonO = thousands(ele.accumulatePerson);
            
            return ele;
        });
        tableData.value.push({
            'time': langData.value['小计'], 
            'targetNumberO': thousands(targetNumber), 
            // 'accumulateTarget': thousands(accumulateTarget), 
            'gcCountO': thousands(gcCount), 
            'personCountO': thousands(personCount),
            // 'accumulatePerson': thousands(accumulatePerson),
        });
        console.table(tableData.value);
        // 可视化数据处理
        let chartDataO = {'labels': [], 'data': [], 'dataCount': [], 'label': [langData.value['目标节点数'], langData.value['交付节点数']]}, 
        targetNumberArr = [], 
        personCountArr = [], 
        accumulateTargetArr = [], 
        accumulatePersonArr = [];
        tableData.value.forEach((ele, i) => {
            if(ele.time == '小计'){

            }else{
                chartDataO.labels.push(ele.time); 
                targetNumberArr.push(ele.targetNumber);
                accumulateTargetArr.push(ele.accumulateTarget);
                personCountArr.push(ele.personCount);
                accumulatePersonArr.push(ele.accumulatePerson);
            }
        });
        chartDataO.data.push(targetNumberArr); 
        chartDataO.data.push(personCountArr); 
        chartDataO.dataCount.push(accumulateTargetArr); 
        chartDataO.dataCount.push(accumulatePersonArr); 
        chartData.value = chartDataO;
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
    getDataList();
});

const r = ref('/YearCompleteReport');
const rList = ref([{'label': '交付报表', 'value': '/indexDeliveryReport'}, {'label': '完成报表', 'value': '/YearCompleteReport'}]);
watch(r, (nv, ov) => {
    router.push(nv);
});

// 下载excel
const handleDownload = () => {
    let aoa = [], t = [], name = langData.value['年度报告完成情况统计报表'];
    ['年份月度', '机构名称', '目标节点数', '目标累计节点数', '交付谱目数', '交付节点数', '交付累计节点数'].forEach((ele) => {
        t.push(langData.value[ele]);
    });
    aoa.push(t);
    tableData.value.forEach((ele) => {
        aoa.push([ele.time, ele.orgName, ele.targetNumber, ele.accumulateTarget, ele.gcCount, ele.personCount, ele.accumulatePerson]);
    });

    initDownloadExcel(aoa, name);
}

// 可视化
const isChart = ref(false);
const chartData = ref({});

</script>

<template>
    <section class="wrap">
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
                    v-model="year"
                    value-format="YYYY"
                    type="year"
                />
                <el-button type="primary" @click="getDataList">{{langData['检索']}}</el-button>
                <!-- <el-button type="primary" @click="isChart = true">Chart</el-button> -->
                <img class="chart" src="../assets/chart.svg" @click="isChart = true">
            </div>
            <el-table 
                v-loading="loading"
                :data="tableData" 
                border 
                :height="h"
                style="width: 100%">
                <el-table-column prop="time" :label="langData['年份月度']" align="center" />
                <el-table-column prop="orgName" :label="langData['机构名称']" align="center" />
                <el-table-column :label="langData['目标']" :align="'center'">
                    <el-table-column prop="targetNumberO" :label="langData['节点数']" align="center" />
                    <el-table-column prop="accumulateTargetO" :label="langData['累计节点数']" align="center" />
                </el-table-column>
                <el-table-column :label="langData['交付']" :align="'center'">
                    <el-table-column prop="gcCountO" :label="langData['谱目数']" align="center" />
                    <el-table-column prop="personCountO" :label="langData['节点数']" align="center" />
                    <el-table-column prop="accumulatePersonO" :label="langData['累计节点数']" align="center" />
                </el-table-column>
            </el-table>
        </main>
        <footer class="footer">
            <div class="left"></div>
            <div class="rigth">
                
            </div>
        </footer>
    </section>
    <!-- 可视化 -->
    <EchartsModule v-if="isChart" :year="year" :orgName="orgName" :chartData="chartData" :stackArea="true" v-on:close="isChart = false" />
</template>

<style scoped lang="scss">
.wrap{
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
            display: flex;
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
.marginL10{
    margin-left: 10px;
}
.chart{
    cursor: pointer;
    margin-left: 10px;
}
</style>