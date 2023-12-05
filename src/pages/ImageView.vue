<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../store/global.js';
import { setValue, createMsg, formattedDate, getQueryVariable } from '../util/ADS.js';
import { baseURL, index, imageHref } from '../util/api';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, orgMemberInfo, langData, lanType } = storeToRefs(global);
const { orgList } = global;


const gcKey = ref('');
const genealogyName = ref('');
const volumeKey = ref('');
const volumeList = ref([]);
const tableData = ref([]);
const h = ref(window.innerHeight - 140);

/** 
 * 影像列表api 
 * @param {string} volumeKey - 卷册Key
 * @returns {Object} {msg: 提示信息，status: 状态，data: {list: 日志列表, pageNum: 分页数, total: 总条数}}
 */
 const getDataList = async () => {
    const result = await index.shuiyinImageList({
        'volumeKey': volumeKey.value,
    });
    if(result.status == 200){
        tableData.value = result.data;
        total.value = tableData.value.length;
        imageURL.value = imageHref+tableData.value[0];
    }else{
        createMsg(result.msg);
    }
}

const getVolumeList = async (dataKey) => {// 卷册列表
    const result = await index.getVolumeList({
        'catalogKey': dataKey,
    }, baseURL);
    if(result.status == 200){
        let arr = [];
        let takeStatusOO = {'1': '待拍摄', '2': '拍摄中', '3': '自检中', '4': '同步中', '5': '初审', '6': '打回中', '7': '完成', '8': '开发票中', '12': '审核', '13': '复审', '14': '待议', '15': '', '16': '作废'};
        result.data.forEach((ele) => {
            ele.takeStatusO = takeStatusOO[ele.takeStatus];
            ele.label = ele.volumeNumber+'('+ele.takeStatusO+')';
            ele.value = ele._key;

            arr.push(ele);
        });

        arr = arr.sort((a, b) => {return a.internalSerialNumber - b.internalSerialNumber});
        volumeList.value = arr;
        volumeKey.value = arr[0]._key;
    }else{
        createMsg(result.msg);
    }
}

// 操作参数
const x = ref(0);
const y = ref(0);
const rotate = ref(0);
const scale = ref(1);
const imageURL = ref('');
const isNatural = ref(false);
const total = ref(0);
const page = ref(1);

const changeImagePage = (e) => {
    if(page.value > total.value){
        
    }else if(page.value < 1){
        
    }else{
        imageURL.value = imageHref + tableData.value[page.value - 1];
    }
}

const changeImage = (i) => {
    if(i == 1){
        if(page.value < total.value){
            page.value = Number(page.value) + 1;
        }else{
            return createMsg('末一页了！');
        }
    }else{
        if(page.value > 1){
            page.value = Number(page.value) - 1;
        }else{
            return createMsg('首一页了！');
        }
    }

    imageURL.value = imageHref + tableData.value[page.value - 1];
}

watch(volumeKey, () => {
    getDataList();
});

onMounted(() => {
    gcKey.value = getQueryVariable('gcKey');
    genealogyName.value = getQueryVariable('genealogyName') ? decodeURIComponent(getQueryVariable('genealogyName')) : '';

    getVolumeList(gcKey.value);
});

</script>

<template>
    <section class="images-wrap">
        <header class="header">
            <div class="left">
                <p class="genealogyName" :title="genealogyName">{{genealogyName}}({{gcKey}})</p>
                <el-select class="width150" v-model="volumeKey" placeholder="请选择卷名" size="small">
                    <el-option
                        v-for="item in volumeList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </div>
            <div class="right">
                
            </div>
        </header>
        <main class="main">
            <!-- 大图 -->
            <div class="img-box">
                <img class="large-image" :class="{active: isNatural}" :style="{transform: 'translate('+x+'px, '+y+'px) rotate('+rotate+'deg) scale('+scale+')'}" :src="imageURL" alt="" />
                <div class="img-hand"></div>
            </div>
            <!-- 工具栏 -->
            <div class="tool-wrap">
                <div class="tool-box">
                    <el-input v-model="page" class="w150" @change="changeImagePage" placeholder="页码" />
                    <span class="total">/共{{total}}页</span>
                </div>
            </div>
            <i class="arrow-left prev" @click="changeImage(-1)">上一页</i>
            <i class="el-icon-arrow-right next" @click="changeImage(1)">下一页</i>
        </main>
        <footer class="footer">
            
        </footer>
    </section>
</template>

<style scoped lang="scss">
.images-wrap{
    position: relative;
    width: 100%;
    height: 100%;
    color: #fff;
    overflow: hidden;
    .header{
        position: relative;
        width: calc(100% - 40px);
        padding: 0 20px;
        height: 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #404040;
        .left{
            position: relative;
            display: flex;
            align-items: center;
            .genealogyName{
                margin: 0 10px;
            }
        }
        .right{
            display: flex;
            align-items: center;
        }
    }
    .main{
        width: calc(100% - 4rem);
        height: calc(100% - 10rem);
        padding: 0 2rem;
        .img-box{
            position: relative;
            overflow: hidden;
            height: calc(100% - 40px);
            width: 100%;
            margin-top: 5px;
            &.active{
                overflow: auto;
            }
            .img-hand{
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
            }
        }
        .large-image{
            height: 100%;
            display: block;
            margin: 0 auto;
            &.active{
                height: auto;
                transform-origin: 0 0;
            }
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
.tool-wrap{
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(53, 138, 205, 0.5);
    cursor: pointer;
}
.tool-box{
    position: relative;
    height: 30px;
    display: inline-flex;
    align-items: center;
}
.prev{
    position: absolute;
    top: 50%;
    left: 20px;
    transform: translateY(-50%);
    font-size: 40px;
    color: #000;
    cursor: pointer;
}
.next{
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    font-size: 40px;
    color: #000;
    cursor: pointer;
}
.w150{
    width: 150px;
}
</style>