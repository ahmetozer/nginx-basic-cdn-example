import http from "k6/http";
import {check} from "k6";

// export function setup() {
// }

export const options = {
    
    scenarios: {
        constant_request_rate: {
          executor: 'constant-arrival-rate',
          rate: 100000,
          timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
          duration: '300s',
          preAllocatedVUs: 1000, // how large the initial pool of VUs would be
          // maxVUs: 200, // if the preAllocatedVUs are not enough, we can initialize more
        },
      },
}; 

// export function teardown(data) {
// }

export default function (data) {
    let res = http.get("http://tier-three-nginx/resize/600/700/photo-1713798218034-412a7e791ebc");
    // check(res, {"status is 200": (r) => r.status === 200});
}