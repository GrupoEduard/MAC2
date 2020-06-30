const si = require("systeminformation");
import store from "@/store";
import { get, head } from 'lodash'

(async () => {
  if (localStorage.getItem("mac")) {
    try {
      store.commit("app/mac", localStorage.getItem("mac"));
    } catch (e) {
      localStorage.removeItem("mac");
    }
  } else {
    const serianNum = get(head(await si.diskLayout()), 'serialNum', false);
    if (serianNum !== null) localStorage.setItem("mac", serianNum);
  }

})();
