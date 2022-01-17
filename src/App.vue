<template>
  <div id="app" ref="app">
    <svg id="topo" :width="width" :height="height"></svg>
    <div id="tooltips"></div>
  </div>
</template>

<script>
import Topo from "./topo";
export default {
  name: "App",
  data() {
    return {
      width: 0,
      height: 0,
      topo: null,
      topoData: {
        nodes: [
          {
            name: "四川省政务云",
            type: "0",
            status: "0",
            info: {
              netstatus: "网络不通",
            },
          },
          {
            name: "成都市政务云",
            type: "1",
            status: "1",
            info: {
              netstatus: "网络良好 ",
            },
          },
          {
            name: "双流区政务云",
            type: "2",
            status: "1",
            info: {
              netstatus: "网络良好 ",
            },
          },
          {
            name: "武侯区政务云",
            type: "2",
            status: "1",
            info: {
              netstatus: "网络良好 ",
            },
          },
          {
            name: "龙泉驿区政务云",
            type: "2",
            status: "1",
            info: {
              netstatus: "网络良好 ",
            },
          },
          {
            name: "南充市政务云",
            type: "1",
            status: "1",
            info: {
              netstatus: "网络良好 ",
            },
          },
          {
            name: "南部县政务云",
            type: "2",
            status: "1",
            info: {
              netstatus: "网络良好 ",
            },
          },
          {
            name: "蓬安县政务云",
            type: "2",
            status: "1",
            info: {
              netstatus: "网络良好 ",
            },
          },
          {
            name: "仪陇县政务云",
            type: "2",
            status: "1",
            info: {
              netstatus: "网络良好 ",
            },
          },
          {
            name: "绵阳市政务云",
            type: "1",
            status: "1",
            info: {
              netstatus: "网络良好 ",
            },
          },
          {
            name: "三台县政务云",
            type: "2",
            status: "1",
            info: {
              netstatus: "网络良好 ",
            },
          },
          {
            name: "梓潼县政务云",
            type: "2",
            status: "1",
            info: {
              netstatus: "网络良好 ",
            },
          },
          {
            name: "盐亭县政务云",
            type: "2",
            status: "1",
            info: {
              netstatus: "网络良好 ",
            },
          },
        ],
        links: [
          {
            source: 0,
            target: 1,
            active: true,
            status: 0,
            netspeed: "1024MB/s",
          },
          {
            source: 0,
            target: 5,
            active: true,
            status: 1,
            netspeed: "1024MB/s",
          },
          {
            source: 0,
            target: 9,
            active: true,
            status: 1,
            netspeed: "1024MB/s",
          },
          {
            source: 1,
            target: 2,
            active: true,
            status: 1,
            netspeed: "1024MB/s",
          },
          {
            source: 1,
            target: 3,
            active: true,
            status: 1,
            netspeed: "1024MB/s",
          },
          {
            source: 1,
            target: 4,
            active: true,
            status: 1,
            netspeed: "1024MB/s",
          },
          {
            source: 5,
            target: 6,
            active: true,
            status: 1,
            netspeed: "1024MB/s",
          },
          {
            source: 5,
            target: 7,
            active: true,
            status: 1,
            netspeed: "1024MB/s",
          },
          {
            source: 5,
            target: 8,
            active: true,
            status: 1,
            netspeed: "1024MB/s",
          },
          {
            source: 9,
            target: 10,
            active: true,
            status: 1,
            netspeed: "1024MB/s",
          },
          {
            source: 9,
            target: 11,
            active: true,
            status: 1,
            netspeed: "1024MB/s",
          },
          {
            source: 9,
            target: 12,
            active: true,
            status: 1,
            netspeed: "1024MB/s",
          },
        ],
      },
    };
  },
  mounted() {
    this.width = this.$refs.app.clientWidth;
    this.height = this.$refs.app.clientHeight;
    this.$nextTick(() => {
      this.init();
    });
  },
  methods: {
    init() {
      this.topo = new Topo("#topo", this.topoData);
      this.topo.render();
    },
  },
};
</script>

<style>
html,
body,
#app {
  margin: 0;
}
#app {
  width: 100vw;
  height: 100vh;
}

#tooltips {
  position: absolute;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
  box-shadow: 2px 2px 2px 0px #000;
  display: none;
  padding: 10px;
  border-radius: 8px;
}

.animate-path {
  stroke-dasharray: 10;
  stroke-dashoffset: 100;
  animation: dash 1s linear infinite;
}

@keyframes dash {
  from {
    stroke-dashoffset: 100;
  }
  to {
    stroke-dashoffset: 0;
  }
}
</style>
