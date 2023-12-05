<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../../store/global.js';
import { createMsg, formattedDate } from '../../util/ADS.js';
import { index } from '../../util/api';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, langData } = storeToRefs(global);
const {  } = global;

const props = defineProps({
    dataKey: String,
})

const emit = defineEmits(['close']);
const close = () => {
    emit('close');
}

const page = ref(1);
const limit = ref(30);
const total = ref(0);
const tableData = ref([]);
/** 
 * 交付批次的打回原因列表api 
 * @param {string} deliverBatchKey - 交付批次key
 * @param {Number} page - 页码
 * @param {Number} limit - limit
 * @returns {Object} {msg: 提示信息，status: 状态，result: {list: 数据, pageNum: 分页, total: 总条数}}
 */
 const getDataList = async () => {
    const result = await index.deliveryBatchReturnReason({
        'deliveryBatchKey': props.dataKey,
        'page': page.value,
        'limit': limit.value,
    });
    if(result.status == 200){
        tableData.value = result.result.list.map((ele) => {
            ele.checkTime = ele.checkTime ? formattedDate(ele.checkTime) : '';
            return ele;
        });
    }else{
        createMsg(result.msg);
    }
}
onMounted(() => {
    getDataList();
});

</script>

<template>
    <section class="return-reason-wrap">
        <header class="header">
            <h3>{{langData['打回原因']}}</h3>
            <img class="close" @click="close" src="../../assets/close.svg" alt="">
        </header>
        <main class="main">
            <el-table 
                :data="tableData" 
                border 
                height="300"
                style="width: 100%">
                <el-table-column prop="userName" :label="langData['打回人']" align="center" width="100" />
                <el-table-column prop="checkTime" :label="langData['打回时间']" align="center" width="150" />
                <el-table-column prop="returnReason" :label="langData['备注']" align="center" width="200" />
            </el-table>
        </main>
    </section>
</template>

<style scoped lang="scss">
.return-reason-wrap{
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
}
</style>