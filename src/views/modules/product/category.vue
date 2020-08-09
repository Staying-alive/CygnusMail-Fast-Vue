<template>
  <el-tree :data="menus" :props="defaultProps" :expand-on-click-node= "false" show-checkbox node-key="catId">
    <span class="custom-tree-node" slot-scope="{ node, data }">
      <span>{{ node.label }}</span>
      <span>
        <el-button v-if="node.level <= 2" type="text" size="mini" @click="() => append(data)">Append</el-button>
        <el-button v-if="node.childNodes.length==0" type="text" size="mini" @click="() => remove(node, data)">Delete</el-button>
      </span>
    </span>
  </el-tree>
</template>
<script>
export default {
  components: {},
  props: {},
  data() {
    return {
      menus: [],
      defaultProps: {
        children: "children",
        label: "name",
      },
    };
  },
  methods: {
    getMenu() {
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl("/product/category/list/tree"),
        method: "get",
        // params: this.$http.adornParams({
        //   page: this.pageIndex,
        //   limit: this.pageSize,
        //   roleName: this.dataForm.roleName,
        // }),
      }).then(({ data }) => {
        console.log("Get Menu Data Successfully.....", data.dataLis);
        this.menus = data.dataLis;
      });
    },
    append(data) {
      console.log("append", data);
    },

    remove(node, data) {
      console.log("remove", node, data);
    },
  },
  computed: {},
  watch: {},
  created() {
    this.getMenu();
  },
  mounted() {},
  beforeCreate() {},
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  activated() {},
};
</script>
<style scoped>
</style>