<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../../store/global.js';
import { createMsg, thousands } from '../../util/ADS.js';
import { index } from '../../util/api';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, langData } = storeToRefs(global);
const {  } = global;

const props = defineProps({
    year: String,
    orgKey: String,
    assignBatchKey: String,
})

const emit = defineEmits(['close']);
const close = () => {
    emit('close');
}

const tableData = ref([]);
const loading = ref(false);
/** 
 * 分配谱目明细api 
 * @param {string} year - 年份
 * @param {string} orgKey - 机构key
 * @returns {Object} {msg: 提示信息，status: 状态，data: 统计数据}
 */
 const getDataList = async () => {
    loading.value = true;
    const result = await index.assignGCDetail({
        'year': props.year,
        'orgKey': props.orgKey,
        'assignBatchKey': props.assignBatchKey
    });
    loading.value = false;
    if(result.status == 200){
        tableData.value = result.data.map((ele) => {
            if(!ele.assignBatch){
                ele.assignBatch = langData.value['合计'];
            }
            ele.assignGCCount = thousands(ele.assignGCCount);
            ele.assignImageCount = thousands(ele.assignImageCount);
            return ele;
        });
    }else{
        createMsg(result.msg);
    }
}
onMounted(() => {
    console.log(props.year);
    getDataList();
});

</script>

<template>
    <section class="allocationDetails-wrap">
        <header class="header">
            <h3>{{year ? year+langData['年分配谱目明细'] : langData['分配谱目明细']}}</h3>
            <img class="close" @click="close" src="../../assets/close.svg" alt="">
        </header>
        <main class="main">
            <el-table 
                v-loading="loading"
                :data="tableData" 
                border 
                height="500"
                style="width: 100%">
                <el-table-column prop="assignBatch" :label="langData['分配批次']" width="150" align="center" />
                <el-table-column prop="assignDate" :label="langData['分配日期']" width="220" align="center" />
                <el-table-column prop="assignGCCount" :label="langData['已分配谱目数']" width="150" align="center" />
                <el-table-column prop="assignImageCount" :label="langData['已分配影像数']" width="150" align="center" />
            </el-table>
        </main>
        <footer class="footer">
            <div class="left"></div>
            <div class="rigth">
                
            </div>
        </footer>
    </section>
</template>

<style scoped lang="scss">
.allocationDetails-wrap{
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
        height: 6rem;
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
</style>