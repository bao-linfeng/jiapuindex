<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../../store/global.js';
import { createMsg, thousands } from '../../util/ADS.js';
import { org, index } from '../../util/api';
import { ElLoading } from 'element-plus';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, orgMemberInfo, langData } = storeToRefs(global);
const {  } = global;

const props = defineProps({
    originData: Object,
})

const tableData = ref([]);

/** 
 * 年度目标月份 api 
 * @param {string} type - type 1 年度目标 FS管理员 2 月度目标 机构管理员
 * @param {string} orgKey - 机构key
 * @param {Number} year - 年份
 * @returns {Object} {msg: 提示信息，status: 状态，data: {list: 日志列表, pageNum: 分页数, total: 总条数}}
 */
 const getDataList = async () => {
    console.time('get monthTarget report');
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.getTargetList({
        'type': '2',
        'orgKey': props.originData.orgKey,
        'year': props.originData.year,
        'page': 1,
        'limit': 100,
    });
    loading.close();
    console.timeEnd('get monthTarget report');
    if(result.status == 200){
        let targetNumber = 0;
        tableData.value = result.result.list.map((ele) => {
            targetNumber = targetNumber + ele.targetNumber;
            ele.targetNumberO = thousands(ele.targetNumber);
            ele.time = ele.year+'-'+(ele.month <= 9 ? '0'+ele.month : ele.month);
            return ele;
        });
        tableData.value.push({'time': '汇总', 'targetNumber': targetNumber, 'targetNumberO': thousands(targetNumber)});
        console.table(tableData.value);
    }else{
        createMsg(result.msg);
    }
}

/** 
 * 删除年度/月度目标 api 
 * @param {string} type - type 1 年度目标 FS管理员 2 月度目标 机构管理员
 * @param {string} orgKey - 机构key
 * @returns {Object} {msg: 提示信息，status: 状态，data: {list: 日志列表, pageNum: 分页数, total: 总条数}}
 */
 const deleteTarget = async (row) => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.deleteTarget({
        'userKey': userInfo.value.userKey,
        'targetKey': row._key,
    });
    loading.close();
    if(result.status == 200){
        createMsg('删除成功!', true);
        getDataList();
    }else{
        createMsg(result.msg);
    }
}

// 新增月度节点
const addData = async (targetNumber, month) => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.addTarget({
        'userKey': userInfo.value.userKey,
        'type': '2',
        'orgKey': props.originData.orgKey,
        'targetNumber': targetNumber,
        'year': props.originData.year,
        'month': month,
    });
    loading.close();
    if(result.status == 200){
        createMsg(langData.value['新增成功!'], true);
        getDataList();
    }else{
        createMsg(result.msg);
    }
}

// 编辑月度节点
const editData = async (row) => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.updateTarget({
        'userKey': userInfo.value.userKey,
        'targetKey': row._key,
        'targetNumber': Number(row.targetNumber),
    });
    loading.close();
    if(result.status == 200){
        createMsg(langData.value['编辑成功！'], true);
        getDataList();
    }else{
        createMsg(result.msg);
    }
}

// 批量编辑月度节点
const batchUpdateMonthTarget = async (monthArray) => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.batchUpdateMonthTarget({
        'userKey': userInfo.value.userKey,
        'orgKey': props.originData.orgKey,
        'monthArray': monthArray,
    });
    loading.close();
    if(result.status == 200){
        createMsg(langData.value['编辑成功！'], true);
        show.value = '';
        getDataList();
    }else{
        createMsg(result.msg);
    }
}

const show = ref('');
const handleClickAction = (row, t) => {
    console.log(row, t);
    switch(t){
        case 'add':
            addData((props.originData.targetNumber/12).toFixed(0), tableData.value.length+1);
            break;
        case 'edit':
            // editData(row);
            break;
        case 'delete':
            deleteTarget(row);
            break;
        default:
    }
    show.value = t;
}


const emit = defineEmits(['close', 'save']);
const close = () => {
    emit('close');
}

const handleEdit = () => {
    let arr = [];
    tableData.value.forEach((e) => {
        if(e.time == langData.value['汇总']){

        }else{
            arr.push({'_key': e._key, 'targetNumber': Number(e.targetNumber)});
        }
    });
    batchUpdateMonthTarget(arr);
}

const handleBlur = () => {
    let targetNumber = 0;
    tableData.value = tableData.value.map((ele) => {
        if(ele.time == langData.value['汇总']){
            ele.targetNumber = targetNumber;
            ele.targetNumberO = thousands(targetNumber);
        }else{
            targetNumber = targetNumber + Number(ele.targetNumber);
            ele.targetNumberO = thousands(ele.targetNumber);
        }
        
        return ele;
    });
}

onMounted(() => {
    getDataList();
});

</script>

<template>
    <section class="month-target">
        <header class="header">
            <h3>{{langData['月度目标']}}</h3>
            <el-button v-if="orgMemberInfo.englishName != 'FS' && orgMemberInfo.role == 1 && show != 'edit'" class="add" size="small" type="primary" @click="handleClickAction({}, 'edit')">{{langData['编辑']}}</el-button>
            <!-- <el-button v-if="orgMemberInfo.englishName != 'FS' && orgMemberInfo.role == 1 && tableData.length < 12" class="add" size="small" type="primary" @click="handleClickAction({}, 'add')">{{langData['新增']}}</el-button> -->
            <img class="close" @click="close" src="../../assets/close.svg" alt="">
        </header>
        <main class="main">
            <el-table 
                :data="tableData" 
                border 
                max-height="675"
                style="width: 100%">
                <el-table-column prop="time" :label="langData['月份']" width="220" align="center"></el-table-column>
                <el-table-column :label="langData['预估节点数']" width="220" align="center">
                    <template #default="scope">
                        <!-- <p v-if="show != 'edit'">{{scope.row.targetNumberO}}</p> -->
                        <!-- <el-input v-if="scope.row.time == langData['汇总'] && show == 'edit'" v-model="scope.row.targetNumber" class="w150" :disabled="true" /> -->
                        <el-input v-if="scope.row.time != langData['汇总'] && show == 'edit'" v-model="scope.row.targetNumber" class="w150" @blur="handleBlur" :disabled="show != 'edit'" />
                        <p v-else>{{scope.row.targetNumberO}}</p>
                    </template>
                </el-table-column>
            </el-table>
        </main>
        <footer class="footer" v-if="show === 'edit'">
            <el-button @click="show = ''">{{langData['取消']}}</el-button>
            <el-button type="primary" @click="handleEdit">{{langData['保存']}}</el-button>
        </footer>
    </section>
</template>

<style scoped lang="scss">
.month-target{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 2rem;
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
        .add{
            position: absolute;
            top: 50%;
            right: 40px;
            transform: translateY(-50%);
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
.marginB10{
    margin-bottom: 10px;
}
.w150{
    width: 150px;
}
</style>