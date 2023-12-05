<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../../store/global.js';
import { createMsg, downliadLink } from '../../util/ADS.js';
import { index } from '../../util/api';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, langData, orgList } = storeToRefs(global);
const { } = global;

const props = defineProps({
    list: Array,
})

const emit = defineEmits(['close', 'save']);
const close = (f) => {
    emit('close', f);
}

const save = () => {
    console.log(orgkeyArray.value);
    if(!orgkeyArray.value.length){
        return createMsg('请选择需要分发的机构!');
    }
    indexFileDistribute();
}

const orgkeyArray = ref([]);
const orgkeyArrayList = ref([]);

/** 
 * 文件-分发（FS发给供应商、只能分发FS的文件）api 
 * @param {string} userKey - 用户key
 * @param {Array} indexUploadFileKeyArray - 分发文件key
 * @param {Array} orgkeyArray - 分发机构key
 * @returns {Object} {msg: 提示信息，status: 状态，data: 数据}
 */
 const indexFileDistribute = async () => {
    const result = await index.indexFileDistribute({
        'userKey': userInfo.value.userKey,
        'indexUploadFileKeyArray': props.list,
        'orgkeyArray': orgkeyArray.value,
    });

    if(result.status == 200){
        createMsg('文件分发成功!', true);
        close(true);
    }else if(result.status == 301){
        downliadLink(result.result, baseURL+'/');
    }else{
        createMsg(result.msg);
    }
}

onMounted(() => {
    orgkeyArrayList.value = orgList.value.filter((e) => {
        return e.label != 'FS';
    });
});

</script>

<template>
    <section class="examine-wrap">
        <header class="header">
            <h3>{{langData['分发']}}</h3>
        </header>
        <main class="main">
            <el-form>
                <el-form-item :label="langData['机构列表']">
                    <el-select v-model="orgkeyArray" multiple :placeholder="langData['机构列表']" clearable>
                        <el-option v-for="item in orgkeyArrayList" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="save">{{langData['确定']}}</el-button>
                    <el-button @click="close(false)">{{langData['取消']}}</el-button>
                </el-form-item>
            </el-form>
        </main>
    </section>
</template>

<style scoped lang="scss">
.examine-wrap{
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
        .desc{
            height: 3rem;
            line-height: 3rem;
            margin-bottom: 2rem;
        }
    }
}
</style>