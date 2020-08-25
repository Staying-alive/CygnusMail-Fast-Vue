<template>
  <el-tree
    :data="menus"
    :props="defaultProps"
    node-key="catId"
    ref="menuTree"
    @node-click="handleNodeClick"
  ></el-tree>
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
  computed: {},
  watch: {},
  methods: {
    getMenu() {
      this.$http({
        url: this.$http.adornUrl("/product/category/list/tree"),
        method: "get",
      }).then(({ data }) => {
        console.log("Get Menu Data Successfully.....", data.dataLis);
        this.menus = data.dataLis;
      });
    },
    handleNodeClick(data, node, compo) {
      console.log(data);
      console.log(node);
      console.log(compo);
      this.value = node.data.catId;
      this.$emit("tree-node-click", data, node, compo);
    },
  },
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