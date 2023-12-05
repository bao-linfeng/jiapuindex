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
const handleCurrentChange = (data) => {
    console.log(data);
    page.value = data;
    getDataList();
}
const tableData = ref([]);
/** 
 * 交付批次的日志列表api 
 * @param {string} deliverBatchKey - 交付批次key
 * @param {Number} page - 页码
 * @param {Number} limit - limit
 * @returns {Object} {msg: 提示信息，status: 状态，result: {list: 数据, pageNum: 分页, total: 总条数}}
 */
 const getDataList = async () => {
    const result = await index.deliveryBatchLog({
        'deliveryBatchKey': props.dataKey,
        'page': page.value,
        'limit': limit.value,
    });
    if(result.status == 200){
        tableData.value = result.result.list.map((ele) => {
            ele.timeO = ele.time ? formattedDate(ele.time) : '';
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
    <section class="log-wrap">
        <header class="header">
            <h3>{{langData['日志记录']}}</h3>
            <img class="close" @click="close" src="../../assets/close.svg" alt="">
        </header>
        <main class="main">
            <el-table 
                :data="tableData" 
                border 
                height="300"
                style="width: 100%">
                <el-table-column prop="userName" :label="langData['操作者']" align="center" width="100" />
                <el-table-column prop="timeO" :label="langData['创建时间']" align="center" width="110" />
                <el-table-column prop="log" :label="langData['日志']" align="center" width="300" />
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
</template>

<style scoped lang="scss">
.log-wrap{
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