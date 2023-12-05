import { ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { index } from '../util/api.js';
import { createMsg } from '../util/ADS.js';
import { useGlobalStore } from '../store/global.js';

const global = useGlobalStore();
console.log(global);
const { userInfo, orgMemberInfo, langData, lanType } = storeToRefs(global);
const { saveProperyValue } = global;

export default common = () =>  {
    const getOrgList = async () => {
        const result = await index.getOrgList({'userKey': userInfo.value.userKey});
        if(result.status == 200){
            let O = {};
            result.data.map((ele) => {
                ele.label = lanType.value == 'en' ? ele.englishName : ele.orgName;
                ele.value = ele.orgKey;
                O[ele.orgKey] = lanType.value == 'en' ? ele.englishName : ele.orgName;
                return ele;
            });
            saveProperyValue({'value': result.data, 'label': 'orgList'}, 'dep');
            saveProperyValue({'value': O, 'label': 'orgObj'}, 'dep');
        }else{
            createMsg(result.msg);
        }
    }

    return {
        getOrgList
    };
}