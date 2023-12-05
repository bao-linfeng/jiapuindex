<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ElLoading } from 'element-plus';
import { useGlobalStore } from '../../store/global.js';
import { createMsg, thousands } from '../../util/ADS.js';
import { index } from '../../util/api';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, langData } = storeToRefs(global);
const {  } = global;

const props = defineProps({
    originData: Object,
    list: Array,
})

const emit = defineEmits(['close', 'save']);
const close = () => {
    emit('close');
}

const save = () => {
    console.log(form.value.assignBatch);
    if(!form.value.orgKey){
        return createMsg(langData.value['分配机构必填']);
    }
    if(!form.value.assignBatch){
        return createMsg(langData.value['分配批次必填']);
    }
    taskAssign();
}

const orgKeyList = ref([]);
const allocationBatchList = ref([]);
const form = ref({
    'orgKey': '',
    'assignBatch': ''
});

const getOrgList = async () => {
    let arr = [];
    const result = await index.getOrgList({'userKey': userInfo.value.userKey});
    if(result.status == 200){
        result.data.forEach((ele) => {
            if(ele.englishName != 'FS'){
                arr.push({'label': ele.orgName, 'value': ele.orgKey});
            }
        });
        orgKeyList.value = arr;
    }else{
        createMsg(result.msg);
    }
}

const assignBatchList = async () => {
    const result = await index.assignBatchList({'orgKey': ''});
    if(result.status == 200){
        allocationBatchList.value = result.data.map((ele) => {
            ele.label = ele.assignBatch;
            ele.value = ele.assignBatch;
            return ele;
        });
    }else{
        createMsg(result.msg);
    }
}

const taskAssign = async (key) => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    let gcKeyArray = [];
    props.list.forEach((ele) => {
        gcKeyArray.push(ele.gcKey);
    });
    const result = await index.taskAssign({
        'userKey': userInfo.value.userKey,
        'orgKey': form.value.orgKey,
        'gcKeyArray': gcKeyArray,
        'assignBatch': form.value.assignBatch
    });
    loading.close();
    if(result.status == 200){
        createMsg(langData.value['任务分配成功！'], true);
        emit('save');
    }else{
        createMsg(result.msg);
    }
}

/** 
 * 任务分配判断谱目是否已分配过api 
 * @param {string} gcKeyArray - 谱目ID数组
 * @returns {Object} {msg:提示信息，status:状态，data: 已分配谱目数}
 */
const JudgeGC = ref(0);
 const taskAssignJudgeGC = async (gcKeyArray) => {
    const result = await index.taskAssignJudgeGC({
        'gcKeyArray': gcKeyArray,
    });
    if(result.status == 200){
        JudgeGC.value = result.data;
    }else{
        createMsg(result.msg);
    }
}

const catalogCount = ref(0);
const imageCount = ref(0);
const DupbookidCount = ref(0);

onMounted(() => {
    let gcKeyArray = [];
    props.list.forEach((ele) => {
        gcKeyArray.push(ele.gcKey);
        catalogCount.value = catalogCount.value + 1;
        imageCount.value = imageCount.value + ele.imageCount;
        if(ele.Dupbookid){
            DupbookidCount.value = DupbookidCount.value + 1;
        }
    });

    catalogCount.value = thousands(catalogCount.value);
    imageCount.value = thousands(imageCount.value);

    getOrgList();
    taskAssignJudgeGC(gcKeyArray);
    assignBatchList();
});

</script>

<template>
    <section class="taskAssign-wrap">
        <header class="header">
            <h3>{{langData['任务分配']}}</h3>
        </header>
        <main class="main">
            <el-form :model="form" label-width="120px">
                <el-form-item :label="langData['分配机构']"
                >
                    <el-select v-model="form.orgKey" class="w150" :placeholder="langData['机构列表']">
                        <el-option v-for="item in orgKeyList" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="langData['分配批次']"
                >
                    <el-select v-model="form.assignBatch" class="w150" filterable allow-create :placeholder="langData['分配批次']">
                        <el-option v-for="item in allocationBatchList" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <p>{{langData['当前选择谱数']}} {{catalogCount}} {{langData['套']}}，{{imageCount}} {{langData['页影像！']}}</p>
                </el-form-item>
                <el-form-item v-if="JudgeGC || DupbookidCount" :label="langData['提示']">
                    <p class="red" v-if="JudgeGC">{{langData['当前选中的谱目，有']}} {{JudgeGC}} {{langData['条已分配，系统会忽略不予分配！']}}</p>
                    <p class="red" v-if="DupbookidCount">{{DupbookidCount}} {{langData['条有重复谱ID，请确认分配？']}}</p>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="save">{{langData['确定']}}</el-button>
                    <el-button @click="close">{{langData['取消']}}</el-button>
                </el-form-item>
            </el-form>
        </main>
        <footer class="footer">
            
        </footer>
    </section>
</template>

<style scoped lang="scss">
.taskAssign-wrap{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 0 5rem;
    background: #fff;
    z-index: 1000;
    border-radius: 5px;
    box-shadow: 0 0 1px 2px #ddd;
    .header{
        height: 6rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .main{
        max-width: 500px;
    }
    .footer{
        height: 4rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
.red{
    color: #f00;
}
</style>