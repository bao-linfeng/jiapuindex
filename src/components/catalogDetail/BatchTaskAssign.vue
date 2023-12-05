<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ElLoading } from 'element-plus';
import { useGlobalStore } from '../../store/global.js';
import { createMsg, thousands, downliadLink } from '../../util/ADS.js';
import { index, baseURL } from '../../util/api';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, langData } = storeToRefs(global);
const {  } = global;

const props = defineProps({
    parameter: Object
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
    if(!form.value.gcNumber){
        return createMsg(langData.value['预设谱数必填']);
    }
    if(!form.value.imageNumber){
        return createMsg(langData.value['预设拍数必填']);
    }
    if(fileName.value){
        taskAssignBatchConfirm();
    }else{
        taskAssignBatch();
    }
}

const orgKeyList = ref([]);
const allocationBatchList = ref([]);
const form = ref({
    'orgKey': '',
    'assignBatch': '',
    'gcNumber': '',
    'imageNumber': '',
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

const title = ref('');
// 分配确认
const taskAssignBatch = async () => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    
    const result = await index.taskAssignBatch({
        'userKey': userInfo.value.userKey,
        'orgKey': form.value.orgKey,
        'assignBatch': form.value.assignBatch,
        'gcNumber': Number(form.value.gcNumber),
        'imageNumber': Number(form.value.imageNumber),
        'gcHasZip': props.parameter.gcHasZip,
        'Dupbookid': props.parameter.Dupbookid,
        'startImages': props.parameter.startImages,
        'endImages': props.parameter.endImages,
        'lostVolume': props.parameter.lostVolume
    });
    loading.close();
    if(result.status == 200){
        // createMsg(langData.value['任务分配成功！'], true);
        // emit('save');
    }else if(result.status == 301){
        createMsg(langData.value['计划分配excel已下载,请认真查看!'], true);
        downliadLink(result.result, baseURL+'/');
        fileName.value = result.result;
        title.value = langData.value['即将分配谱目数 ']+thousands(result.gcCount)+langData.value[' 套，影像数 ']+thousands(result.imageCount)+langData.value[' 页'];
    }else{
        createMsg(result.msg);
    }
}
const fileName = ref('');
// 真实分配
const taskAssignBatchConfirm = async () => {
    if(!fileName.value){
        return;
    }
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    
    const result = await index.taskAssignBatchConfirm({
        'userKey': userInfo.value.userKey,
        'orgKey': form.value.orgKey,
        'fileName': fileName.value,
        'assignBatch': form.value.assignBatch,
    });
    loading.close();
    if(result.status == 200){
        createMsg(langData.value['任务分配成功！'], true);
        emit('save');
    }else{
        createMsg(result.msg);
    }
}

const catalogCount = ref(0);
const imageCount = ref(0);

onMounted(() => {
    getOrgList();
    assignBatchList();
});

</script>

<template>
    <section class="taskAssign-wrap">
        <header class="header">
            <h3>{{langData['批量任务分配']}}</h3>
        </header>
        <main class="main">
            <!-- label-width="120px" -->
            <el-form :model="form">
                <el-form-item :label="langData['分配机构']">
                    <el-select v-model="form.orgKey" class="w150" :placeholder="langData['机构列表']">
                        <el-option v-for="item in orgKeyList" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="langData['分配批次']">
                    <el-select v-model="form.assignBatch" class="w150" filterable allow-create :placeholder="langData['分配批次']">
                        <el-option v-for="item in allocationBatchList" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="langData['预设谱数']">
                    <el-input v-model="form.gcNumber" class="w150" clearable />
                </el-form-item>
                <el-form-item :label="langData['预设拍数']">
                    <el-input v-model="form.imageNumber" class="w150" clearable />
                </el-form-item>
                <el-form-item v-if="title" :label="langData['提示']">
                    <p class="red">{{title}}</p>
                </el-form-item>
                <!-- <el-form-item>
                    <p>分配原则：按谱ID排序</p>
                    <p>1.目标套数*60%分配平均值范围内+-500拍的影像</p>
                    <p>2.目标套数*20%分配低于1000拍的影像</p>
                    <p>3.目标套数*20%分配大于3000拍的影像</p>
                    <p>备注：最终分配的拍数不超过预设值的10%</p>
                </el-form-item> -->
                <!-- <el-form-item>
                    <el-button v-if="!fileName" type="primary" @click="save">{{langData['计划批量分配']}}</el-button>
                    <el-button v-else type="primary" @click="save">{{langData['确定']}}</el-button>
                    <el-button @click="close">{{langData['取消']}}</el-button>
                </el-form-item> -->
            </el-form>
        </main>
        <footer class="footer">
            <el-button v-if="!fileName" type="primary" @click="save">{{langData['计划批量分配']}}</el-button>
            <el-popconfirm
                v-else
                width="220"
                :confirm-button-text="langData['确定']"
                :cancel-button-text="langData['取消']"
                :title="langData['您确认要批量分配系统分配的谱目吗?']"
                @confirm="save"
            >
                <template #reference>
                    <el-button type="primary">{{langData['确定']}}</el-button>
                </template>
            </el-popconfirm>
            <el-button @click="close">{{langData['取消']}}</el-button>
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
        height: 6rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
.red{
    color: #f00;
}
</style>