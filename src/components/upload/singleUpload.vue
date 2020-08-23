<template>
  <div class="input-group">
    <div class="custom-file">
      <input
        type="file"
        class="custom-file-input"
        id="file"
        aria-describedby="inputGroupFileAddon04"
        ref="file"
        v-on:change="handleFileUpload()"
      />
      <label class="custom-file-label" v-text="fileName" for="file">选取文件</label>
    </div>
    <div class="input-group-append">
      <button
        class="btn btn-success"
        type="button"
        id="inputGroupFileAddon04"
        @click="submitUpload"
      >上传到服务器</button>
    </div>
  </div>
</template>
<script>
import { policy } from "./policy";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";

export default {
  name: "singleUpload",
  props: {
    value: String,
  },
  data() {
    return {
      policyParams: {
        contentType: "",
        method: "",
        keyname: "",
      },
      url: "",
      actionUrl: "",
      file: "",
    };
  },
  computed: {
    imageUrl() {
      return this.value;
    },
    imageName() {
      if (this.value != null && this.value !== "") {
        return this.value.substr(this.value.lastIndexOf("/") + 1);
      } else {
        return null;
      }
    },
    fileName() {
      this.url = this.imageUrl;
      this.value = this.imageName;
      console.log("fileName : this.value", this.value);
      console.log("fileName : this.url", this.url);
      return this.value;
    },
  },
  methods: {
    emitInput(val) {
      this.$emit("input", val);
    },
    handleFileUpload() {
      this.file = this.$refs.file.files[0];
      this.value = this.file.name;
    },

    submitUpload() {
      this.policyParams = {
        keyName: this.file.name,
        method: "put",
        contentType: this.file.type,
      };

      return new Promise((resolve, reject) => {
        policy(this.policyParams)
          .then((data) => {
            this.actionUrl = data;
            resolve(true);
            // 当前推拽节点的最新层级
            axios({
              method: "put",
              url: this.actionUrl,
              cache: false,
              headers: {
                "Content-Type": this.policyParams.contentType,
              },
              data: this.file,
            })
              .then((res) => {
                console.log(res);
                this.value = this.actionUrl.substr(0, this.actionUrl.lastIndexOf("?"));
                this.emitInput(this.value);
                console.log("axios this.value", this.value);
                console.log("axios this.url", this.url);
              })
              .catch(function (error) {
                console.log(error); //错误处理 相当于error
              });

            this.policyParams = {};
          })
          .catch((err) => {
            reject(false);
          });
      });
    },
  },
};
</script>
<style>
.custom-file-input:lang(en) ~ .custom-file-label::after {
  content: "选择文件";
}

/* .custom-file-label::after {
  content: "选择文件";
} */
</style>


