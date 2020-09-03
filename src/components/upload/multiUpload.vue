<template>
  <div>
    <el-upload
      :action="presignedUrl"
      :http-request="upload"
      list-type="picture-card"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :on-preview="handlePreview"
      :limit="maxCount"
      :on-exceed="handleExceed"
    >
      <i class="el-icon-plus"></i>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt />
    </el-dialog>
  </div>
</template>
<script>
import { policy } from "./policy";
import { getUUID } from "@/utils";
import axios from "axios";
export default {
  name: "multiUpload",
  props: {
    //图片属性数组
    value: Array,
    //最大上传图片数量
    maxCount: {
      type: Number,
      default: 10,
    },
  },
  data() {
    return {
      dataObj: {
        policy: "",
        signature: "",
        key: "",
        ossaccessKeyId: "",
        dir: "",
        host: "",
        uuid: "",
      },
      dialogVisible: false,
      dialogImageUrl: null,
      presignedUrl: "https://cygnusmail.s3.ap-northeast-1.amazonaws.com",
      policyParams: {
        contentType: "",
        method: "",
        keyname: "",
      },
    };
  },
  computed: {
    fileList() {
      let fileList = [];
      for (let i = 0; i < this.value.length; i++) {
        fileList.push({ url: this.value[i] });
      }

      return fileList;
    },
  },
  mounted() {},
  methods: {
    upload(res) {
      let file = res.file; //注意：直接上传file文件，不要用FormData对象的形式传
      let config = {
        headers: {
          "Content-Type": res.file.type,
        },
      };

      axios
        .put(this.presignedUrl, file, config)
        .then((res) => {
          this.fileList.push({
            name: file.name,
            // url: this.dataObj.host + "/" + this.dataObj.dir + "/" + file.name； 替换${filename}为真正的文件名
            url:
              this.presignedUrl.substr(0, this.presignedUrl.lastIndexOf("?")),
          });
          this.emitInput(this.fileList);
          console.log("upload(res)", this.fileList);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    emitInput(fileList) {
      let value = [];
      for (let i = 0; i < fileList.length; i++) {
        value.push(fileList[i].url);
      }
      this.$emit("input", value);
      console.log("emitInput", value);
    },
    handleRemove(file, fileList) {
      this.emitInput(fileList);
    },
    handlePreview(file) {
      this.dialogVisible = true;
      this.dialogImageUrl = file.url;
    },
    beforeUpload(file) {
      let _self = this;
      this.policyParams = {
        keyName: getUUID() + "_" + file.name,
        method: "put",
        contentType: file.type,
      };
      return new Promise((resolve, reject) => {
        policy(this.policyParams)
          .then((response) => {
            this.presignedUrl = response;
            resolve(true);
            this.policyParams = {};
          })
          .catch((err) => {
            console.log("出错了...", err);
            reject(false);
          });
      });
    },
    handleExceed(files, fileList) {
      console.log("handleExceed", this.fileList);
      this.$message({
        message: "最多只能上传" + this.maxCount + "张图片",
        type: "warning",
        duration: 1000,
      });
    },
  },
};
</script>
<style>
</style>


