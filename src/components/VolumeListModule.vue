<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ElLoading } from 'element-plus';
import { useGlobalStore } from '../store/global.js';
import { createMsg, downliadLink, thousands } from '../util/ADS.js';
import { volume, index, baseURL } from '../util/api';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, langData } = storeToRefs(global);
const { } = global;

const props = defineProps({
    catalogKey: String,
    volumeKey: String,
})

const tableData = ref([]);

const handleClickAction = (row, t) => {
    console.log(row, t);
    if(t === 'downloadPARK'){
        GIKDownloadVolume([row._key]);
    }
}

const getVolumeList = async () => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await volume.getVolumeList({'catalogKey': props.catalogKey});
    loading.close();
    if(result.status == 200){
        tableData.value = result.data.map((ele) => {
            ele.syncPages = thousands(ele.syncPages);
            ele.singleOrTwoO = ele.singleOrTwo == 1 ? langData.value['单拍'] : ele.singleOrTwo == 2 ? langData.value['双拍'] : '';
            ele.isLeadImagesO = ele.isLeadImages == 1 ? langData.value['是'] : langData.value['否'];
            return ele;
        });
    }else{
        createMsg(result.msg);
    }
}

/** 
 * gik下载（卷册）api 
 * @param {Array} volumeKeyArray - 卷ID数组
 * @returns {Object} {msg:提示信息，status:状态，result:excel链接}
 */
 const GIKDownloadVolume = async (volumeKeyArray) => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.GIKDownloadVolume({
        'volumeKeyArray': volumeKeyArray,
    });
    loading.close();
    if(result.status == 200){
        downliadLink(result.result, baseURL+'/');
    }else{
        createMsg(result.msg);
    }
}

const cellClassName = ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex }) => {
    if(row._key == props.volumeKey && column.property == '_key') {
        return 'row-blue'
    }
}

const emit = defineEmits(['close']);
const close = () => {
    emit('close');
}

const h = ref(window.innerHeight - 180);
onMounted(() => {
    getVolumeList();
});

</script>

<template>
    <section class="volume-list-wrap">
        <header class="header">
            <h3>{{langData['卷册列表']}}</h3>
            <img class="close" @click="close" src="../assets/close.svg" alt="">
        </header>
        <main class="main">
            <el-table 
                :data="tableData" 
                border 
                :cell-class-name="cellClassName"
                :height="h"
                style="width: 100%">
                <el-table-column prop="_key" :label="langData['卷ID']" width="120" align="center" />
                <el-table-column prop="internalSerialNumber" :label="langData['卷序号']" width="180" align="center" />
                <el-table-column prop="volumeNumber" :label="langData['卷名']" width="150" align="center" />
                <el-table-column prop="syncPages" :label="langData['影像页数']" width="150" align="center" />
                <el-table-column prop="singleOrTwoO" :label="langData['单双拍']" width="120" align="center" />
                <el-table-column prop="isLeadImagesO" :label="langData['电子谱']" width="120" align="center" />
                <el-table-column prop="memo" :label="langData['备注']" width="120" align="center" />
                <el-table-column :label="langData['操作']" fixed="right" width="150" align="center">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="handleClickAction(scope.row, 'downloadPARK')">{{langData['下载 GIK']}}</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </main>
        <footer class="footer">
            <img src="../assets/logout.svg" alt="">
        </footer>
    </section>
</template>

<style scoped lang="scss">
.volume-list-wrap{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 0 2rem;
    height: calc(100% - 10rem);
    background: #fff;
    z-index: 1000;
    border-radius: 5px;
    box-shadow: 0 0 1px 2px #ddd;
    .header{
        position: relative;
        height: 4rem;
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

    }
    .footer{
        height: 4rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>