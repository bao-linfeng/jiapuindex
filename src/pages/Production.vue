<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../store/global.js';
import { setValue, createMsg, getQueryVariable, initDownloadExcel, thousands, downliadLink } from '../util/ADS.js';
import { baseURL, index } from '../util/api';
import EditProduction from '../components/production/EditProduction.vue';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, orgMemberInfo, langData } = storeToRefs(global);
const { } = global;

const props = defineProps({
    dataKey: String,
})

const emit = defineEmits(['close', 'save']);
const close = () => {
    emit('close');
}

const deliverBatchKey = ref('');
const tableData = ref([]);
const page = ref(1);
const limit = ref(50);
const total = ref(0);
const handleCurrentChange = (data) => {
    console.log(data);
    page.value = data;
    getDataList();
}
/** 
 * production api 
 * @param {string} deliverBatchKey - 交付批次key
 * @param {Number} page - 页码
 * @param {Number} limit - limit
 * @returns {Object} {msg: 提示信息，status: 状态，result: {list: 数据, pageNum: 分页, total: 总条数}}
 */
 const getDataList = async () => {
    const result = await index.production({
        'deliverBatchKey': deliverBatchKey.value,
        'page': page.value,
        'limit': limit.value,
    });
    if(result.status == 200){
        tableData.value = result.result.list.map((ele, i) => {
            ele.i = i+1;
            ele.twoPageImageCountO = thousands(ele.twoPageImageCount);
            ele.singlePageImageCountO = thousands(ele.singlePageImageCount);
            ele.ADJImageCountO = thousands(ele.ADJImageCount);
            ele.imageCountO = thousands(ele.imageCount);
            ele.JHNodeCountO = thousands(ele.JHNodeCount);
            ele.regularNodeCountO = thousands(ele.regularNodeCount);
            ele.totalPersonCountO = thousands(ele.totalPersonCount);
            ele.maleCountO = thousands(ele.maleCount);
            ele.femaleCountO = thousands(ele.femaleCount);
            ele.bxCountO = thousands(ele.bxCount);
            ele.allDeadO = ele.allDead ? '是' : '否';
            ele.deadCountO = thousands(ele.deadCount);
            return ele;
        });
        total.value = result.result.total;
    }else{
        createMsg(result.msg);
    }
}
const show = ref('');
const dataRow = ref({});
const handleClickAction = (row, t) => {
    show.value = t;
    dataRow.value = row;
}

const handleEditSave = () => {
    show.value = '';
    getDataList();
}

const h = ref(window.innerHeight - 240);
onMounted(() => {
    deliverBatchKey.value = props.dataKey || getQueryVariable('id');
    getDataList();
});

const productionDownload = async () => {
    const result = await index.productionDownload({
        'deliverBatchKey': deliverBatchKey.value,
    });
    if(result.status == 200){
        downliadLink(result.result, baseURL+'/');
    }else{
        createMsg(result.msg);
    }
}

const handleDownload = () => {
    let aoa = [
        [langData.value['序号'], langData.value['交付批次'], langData.value['谱ID'], langData.value['谱名'], langData.value['影像页数'], langData.value['adj影像数'], langData.value['#节点'], langData.value['常规节点'], langData.value['总人数'], langData.value['男性'], langData.value['女性'], langData.value['性别未知'], langData.value['全部已故'], langData.value['去世节点数'],langData.value['谱数统计'], langData.value['交付备注'], langData.value['影像来源']]
    ];
    tableData.value.forEach((ele) => {
        aoa.push([ele.indexSerialNumber, ele.deliveryBatch, ele.gcKey, ele.genealogyName, ele.imageCount, ele.ADJImageCount, ele.JHNodeCount, ele.regularNodeCount, ele.totalPersonCount, ele.maleCount, ele.femaleCount, ele.bxCount, ele.allDeadO, ele.deadCount, ele.catalogStatistics, ele.deliveryMemo, ele.isRMSOrPipeline]);
    });
    initDownloadExcel(aoa, 'Production');
}
</script>

<template>
    <section class="production-wrap">
        <header class="header">
            <div class="left">
                <h3>Production</h3>
            </div>
            <div class="right">
                <el-button type="primary" @click="productionDownload">{{langData['下载']}}</el-button>
                <img class="close" @click="close" src="../assets/close.svg" />
            </div>
        </header>
        <main class="main">
            <div class="search-wrap">
                
            </div>
            <el-table 
                :data="tableData" 
                border 
                :height="h"
                :show-overflow-tooltip="true"
                style="width: 100%">
                <el-table-column prop="indexSerialNumber" :label="langData['序号']" width="100" align="center" />
                <el-table-column prop="orgName" :label="langData['机构名称']" width="120" align="center" />
                <el-table-column prop="deliveryBatch" :label="langData['交付批次']" width="120" align="center" />
                <el-table-column prop="gcKey" :label="langData['谱ID']" width="110" align="center" />
                <el-table-column prop="genealogyName" :label="langData['谱名']" min-width="100" align="center" />

                <el-table-column prop="JHNodeCountO" :label="langData['#节点']" width="150" align="center" />
                <el-table-column prop="regularNodeCountO" :label="langData['常规节点']" width="100" align="center" />
                <el-table-column prop="totalPersonCountO" :label="langData['总人数']" width="100" align="center" />
                <el-table-column prop="maleCountO" :label="langData['男性']" width="150" align="center" />
                <el-table-column prop="femaleCountO" :label="langData['女性']" width="150" align="center" />
                <el-table-column prop="bxCountO" :label="langData['性别未知']" width="100" align="center" />
                <el-table-column prop="deadCountO" :label="langData['去世节点数']" width="100" align="center" />
                <!-- <el-table-column prop="twoPageImageCountO" :label="langData['双页']" width="100" align="center" />
                <el-table-column prop="singlePageImageCountO" :label="langData['单页']" width="100" align="center" /> -->
                <el-table-column prop="imageCountO" :label="langData['影像页数']" width="100" align="center" />
                <el-table-column prop="ADJImageCountO" :label="langData['adj影像数']" width="100" align="center" />

                <el-table-column prop="allDeadO" :label="langData['全部已故']" width="100" align="center" />
                <el-table-column prop="catalogStatistics" :label="langData['谱数统计']" width="100" align="center" />
                <el-table-column prop="deliveryMemo" :label="langData['交付备注']" width="100" align="center" />
                <el-table-column prop="isRMSOrPipeline" :label="langData['影像来源']" width="100" align="center" />
                <el-table-column v-if="orgMemberInfo.englishName !== 'FS' && (orgMemberInfo.role == 1 || orgMemberInfo.role == 2)" :label="langData['操作']" fixed="right" width="100" align="center">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="handleClickAction(scope.row, 'edit')">{{langData['编辑']}}</el-button>
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
        <EditProduction v-if="show === 'edit'" :originData="dataRow" v-on:close="show = ''" v-on:save="handleEditSave" />
    </section>
</template>

<style scoped lang="scss">
.production-wrap{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(100% - 100px);
    height: calc(100% - 100px);
    padding: 20px;
    background: #fff;
    z-index: 100;
    box-shadow: 0 0 1px 2px #ddd;
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
            .close{
                cursor: pointer;
                margin-left: 20px;
            }
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
</style>