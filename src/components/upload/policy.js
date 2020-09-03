import http from '@/utils/httpRequest.js'
export function policy(entity) {
   return  new Promise((resolve,reject)=>{
        http({
            url: http.adornUrl("/thirdparty/s3/policy"),
            method: "post",
            data: http.adornData(entity, false)
        }).then(({ data }) => {
            resolve(data);
        })
    });
}
export function policyOfMultiUpload() {
    return  new Promise((resolve,reject)=>{
         http({
             url: http.adornUrl("/thirdparty/s3/policyOfMultiUpload"),
             method: "get",
             params: http.adornParams({})
         }).then(({ data }) => {
             resolve(data);
         })
     });
 }