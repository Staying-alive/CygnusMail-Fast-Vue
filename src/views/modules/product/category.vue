<template>
  <div>
    <el-switch v-model="draggable" active-text="开启拖拽" inactive-text="关闭拖拽"></el-switch>
    <el-button v-if="draggable" type="success" @click="batchSave">批量保存</el-button>
    <el-button type="danger" v-on:click="batchDelete">批量删除</el-button>
    <el-tree
      :data="menus"
      :props="defaultProps"
      :expand-on-click-node="false"
      show-checkbox
      node-key="catId"
      :default-expanded-keys="expandKey"
      :draggable="draggable"
      :allow-drop="allowDrop"
      @node-drop="handleDrop"
      ref="menuTree"
    >
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span>
          <el-button v-if="node.level <= 2" type="text" size="mini" @click="() => append(data)">保存</el-button>
          <el-button type="text" size="mini" @click="() => edit(data)">更新</el-button>
          <el-button
            v-if="node.childNodes.length==0"
            type="text"
            size="mini"
            @click="() => remove(node, data)"
          >删除</el-button>
        </span>
      </span>
    </el-tree>
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-form :model="category">
        <el-form-item label="分类名称" :label-width="formLabelWidth">
          <el-input v-model="category.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="图标" :label-width="formLabelWidth">
          <el-input v-model="category.icon" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="计量单位" :label-width="formLabelWidth">
          <el-input v-model="category.productUnit" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitdata">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  components: {},
  props: {},
  data() {
    return {
      draggable: false,
      pcId: [],
      maxLevel: 1,
      menus: [],
      defaultProps: {
        children: "children",
        label: "name",
      },
      expandKey: [],
      dialogVisible: false,
      formLabelWidth: "120px",
      dataType: "",
      category: {
        catId: null,
        name: "",
        parentCid: 0,
        catLevel: 0,
        showStatus: 1,
        sort: 0,
        productCount: 0,
        icon: null,
        productUnit: null,
      },
      title: "",
      updateNodes: [],
      deleteNodes: [],
    };
  },
  methods: {
    // 批量删除
    batchDelete() {
      let checkedNode = this.$refs.menuTree.getCheckedNodes();
      for (let i = 0; i < checkedNode.length; i++) {
        this.deleteNodes.push(checkedNode[i].catId);
      }

      this.$confirm(`是否批量删除菜单?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        // 当前推拽节点的最新层级
        this.$http({
          url: this.$http.adornUrl("/product/category/delete"),
          method: "post",
          data: this.$http.adornData(this.deleteNodes, false),
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.$message({
              message: "菜单批量删除",
              type: "success",
            });
            console.log("批量删除成功");
            this.getMenu();

            // 更对象数组初始化
            this.deleteNodes = [];
          } else {
          }
        });
      });
    },
    // 批量保存
    batchSave() {
      this.$confirm(`是否批量更新菜单?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        // 当前推拽节点的最新层级
        this.$http({
          url: this.$http.adornUrl("/product/category/update/sort"),
          method: "post",
          data: this.$http.adornData(this.updateNodes, false),
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.$message({
              message: "菜单批量更新",
              type: "success",
            });
            console.log("批量更新成功");
            this.getMenu();
            this.expandKey = this.pcId;

            // 更对象数组初始化
            this.updateNodes = [];
          } else {
          }
        });
      });
    },

    handleDrop(draggingNode, dropNode, dropType, ev) {
      console.log("dropNode ", dropNode);

      let pcId = 0;
      let siblings = null;
      // 当前节点最新的父节点ID
      if (dropType == "before" || dropType == "after") {
        pcId =
          dropNode.parent.data.catId == undefined
            ? 0
            : dropNode.parent.data.catId;
        siblings = dropNode.parent.childNodes;
      } else {
        pcId = dropNode.data.catId;
        siblings = dropNode.childNodes;
      }

      this.pcId.push(pcId);
      // 当前拖拽节点的最新顺序
      for (let i = 0; i < siblings.length; i++) {
        if (siblings[i].data.catId == draggingNode.data.catId) {
          let catLevel = draggingNode.level;
          if (siblings[i].level != draggingNode.level) {
            catLevel = siblings[i].level;
            this.updateChildNodeLvel(siblings[i]);
          }

          this.updateNodes.push({
            catId: siblings[i].data.catId,
            sort: i,
            parentCid: pcId,
            catLevel: catLevel,
          });
        } else {
          this.updateNodes.push({ catId: siblings[i].data.catId, sort: i });
        }
      }
      console.log("updateNodes", this.updateNodes);
    },
    updateChildNodeLvel(node) {
      if (node.childNodes.length > 0) {
        for (let j = 0; j < node.childNodes.length; j++) {
          let cNode = node.childNodes[j].data;
          this.updateNodes.push({
            catId: cNode.catId,
            catLevel: node.childNodes[j].level,
          });
          this.updateChildNodeLvel(node.childNodes[j]);
        }
      }
    },
    getMenu() {
      this.$http({
        url: this.$http.adornUrl("/product/category/list/tree"),
        method: "get",
      }).then(({ data }) => {
        console.log("Get Menu Data Successfully.....", data.dataLis);
        this.menus = data.dataLis;
      });
    },
    append(data) {
      this.dialogVisible = true;
      this.category.parentCid = data.catId;
      this.category.catLevel = data.catLevel * 1 + 1;
      this.dataType = "add";
      this.title = "添加分类";
      console.log("append", this.category);
    },
    edit(data) {
      this.dialogVisible = true;
      // 发送请求获取当前节点最新数据
      this.$http({
        url: this.$http.adornUrl(`/product/category/info/${data.catId}`),
        method: "get",
      }).then(({ data }) => {
        this.category = data.data;
      });
      this.dataType = "edit";
      this.title = "修改分类";
      console.log("edit", this.category);
    },
    remove(node, data) {
      var ids = [data.catId];
      this.$confirm(`是否删除【${data.name}】菜单?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$http({
            url: this.$http.adornUrl("/product/category/delete"),
            method: "post",
            data: this.$http.adornData(ids, false),
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message({
                message: "菜单删除成功",
                type: "success",
              });
              console.log("删除成功");
              this.getMenu();
              this.expandKey = [node.parent.data.catId];
            } else {
            }
          });
        })
        .catch(() => {});
      console.log("remove", node, data);
    },
    submitdata() {
      if (this.dataType === "add") {
        this.addCategory();
      } else {
        this.editCategory();
      }
    },
    addCategory() {
      console.log("addCategory : ", this.category);
      this.$confirm(`是否保存【${this.category.name}】菜单?`, "添加分类", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$http({
            url: this.$http.adornUrl("/product/category/save"),
            method: "post",
            data: this.$http.adornData(this.category, false),
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message({
                message: "菜单保存成功",
                type: "success",
              });
              this.dialogVisible = false;
              console.log("保存成功");
              this.getMenu();
              this.expandKey = [this.category.parentCid];
              this.category = {
                catId: null,
                name: "",
                parentCid: 0,
                catLevel: 0,
                showStatus: 1,
                sort: 0,
                productCount: 0,
                icon: null,
                productUnit: null,
              };
            } else {
            }
          });
        })
        .catch(() => {});
    },

    editCategory() {
      console.log("editCategory : ", this.category);
      this.$confirm(`是否更新【${this.category.name}】菜单?`, "修改分类", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          var { catId, name, icon, productUnit } = this.category;
          this.$http({
            url: this.$http.adornUrl("/product/category/update"),
            method: "post",
            data: this.$http.adornData(
              { catId, name, icon, productUnit },
              false
            ),
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message({
                message: "菜单更新成功",
                type: "success",
              });
              this.dialogVisible = false;
              console.log("更新成功");
              this.getMenu();
              this.expandKey = [this.category.parentCid];
              this.category = {};
            } else {
            }
          });
        })
        .catch(() => {});
    },
    allowDrop(draggingNode, dropNode, type) {
      // 1被拖动的当前节点以及所在的父节点总层数不能大于3
      console.log(draggingNode, dropNode, type);
      this.countNodeLevel(draggingNode);
      let level = this.maxLevel - draggingNode.level + 1;
      console.log(level);
      this.maxLevel = 1;
      if (type == "inner") {
        return level + dropNode.level <= 3;
      } else {
        return level + dropNode.parent.level <= 3;
      }
    },
    countNodeLevel(node) {
      if (node.childNodes != null && node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          if (node.childNodes[i].level > this.maxLevel) {
            this.maxLevel = node.childNodes[i].level;
          }
          this.countNodeLevel(node.childNodes[i]);
        }
      }
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