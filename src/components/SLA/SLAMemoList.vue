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
})

const emit = defineEmits(['close']);
const close = () => {
    emit('close');
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
 * 交付备注列表api 
 * @param {string} SLAKey - SLA Key
 * @returns {Object} {msg: 提示信息，status: 状态，result: {list: 数据, pageNum: 分页, total: 总条数}}
 */
 const getDataList = async () => {
    const result = await index.getSLADeliveryMemoList({
        'SLAKey': props.dataKey
    });
    if(result.status == 200){
        tableData.value = result.result.list.map((ele, index) => {
            ele.i = index;

            return ele;
        });
        total.value = result.result.total;
    }else{
        createMsg(result.msg);
    }
}

onMounted(() => {
    getDataList();
});

</script>

<template>
    <section class="error-wrap">
        <header class="header">
            <h3>{{langData['交付备注']}}</h3>
            <img class="close" @click="close" src="../../assets/close.svg" alt="">
        </header>
        <main class="main">
            <el-table 
                :data="tableData" 
                border 
                height="300"
                style="width: 100%">
                <el-table-column prop="indexSerialNumber" :label="langData['序号']" align="center" width="60" />
                <el-table-column prop="gcKey" :label="langData['谱ID']" align="center" width="120" />
                <el-table-column prop="genealogyName" :label="langData['谱名']" align="center" width="200" />
                <el-table-column prop="deliveryMemo" :label="langData['交付备注']" align="center" width="200" />
            </el-table>
        </main>
        <footer class="footer">
            
        </footer>
    </section>
</template>

<style scoped lang="scss">
.error-wrap{
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
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }
    .footer{
        height: 4rem;
    }
}
</style>