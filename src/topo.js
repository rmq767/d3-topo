const d3 = require("d3");

const imgMap = {
  0: require("./assets/clouds/cloud-province.png"),
  1: require("./assets/clouds/cloud-city.png"),
  2: require("./assets/clouds/cloud-county.png"),
  "error-tip": require("./assets/clouds/error-tip.png"),
  "link-cut": require("./assets/clouds/link-cut.png"),
};

export default class Topo {
  constructor(el, data) {
    this.svg = d3.select(el);
    this.width = this.svg.attr("width");
    this.height = this.svg.attr("height");
    this.nodes = data.nodes;
    this.links = data.links;
    this.tooltips = d3.select("#tooltips")
  }
  render() {
    this.container = this.svg.append("g").attr("class", "graph")
    this.init();

    this.force.on("tick", () => {
      this.initLinksPosition();
      this.initNodesPosition();
    });
  }

  init() {
    this.initForce();//初始化力模型
    this.initMarker();//初始化连线箭头
    this.initLinks(); //连线需要在节点之前，否则会盖住
    this.initNodes();//初始化节点
    this.initDrag();//初始化节点拖拽
    this.initZoom()//初始化缩放
    this.initNodeHover()//初始化hover节点信息展示
  }

  initForce() {
    this.force = d3
      .forceSimulation(this.nodes)
      .alpha(0.5)//力迭代次数[0,1]，越大布局越好
      .force("charge", d3.forceManyBody().strength(-8000).distanceMax(200))//strength节点之间引力，负值越大分的越开。distanceMax连线距离
      .force("link", d3.forceLink(this.links))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2));//布局中心点
  }

  initNodes() {
    this.graphNodes = this.container
      .append("g")
      .attr("class", "node-group")
      .selectAll("g.node")
      .data(this.nodes)
      .enter()
      .append("g")
      .attr("class", "node");

    this.graphNodes
      .append("image")
      .attr("width", function (d) {
        var width = 40;
        switch (d.type) {
          case "0":
            width = 1.5 * width;
            break;
          case "1":
            width = 1.2 * width;
            break;
          default:
            break;
        }
        return width;
      })
      .attr("height", function (d) {
        var height = 40;
        switch (d.type) {
          case "0":
            height = 1.5 * height;
            break;
          case "1":
            height = 1.2 * height;
            break;
          default:
            break;
        }
        return height;
      })
      .attr("xlink:href", function (d) {
        return imgMap[d.type];
      });

    this.graphNodes
      .append("text")
      .text(function (d) {
        return d.name;
      })
      .style("font-size", "12")
      .style("fill", "#333");

    this.graphNodes.each(function (d) {
      var selection = d3.select(this);
      if (d.status == "0") {
        selection
          .append("g")
          .attr("class", "error-tip")
          .append("image")
          .attr("xlink:href", function () {
            return imgMap["error-tip"];
          });
      }
    });
  }
  initNodesPosition() {
    this.graphNodes.attr("transform", function (d) {
      let halfWidth = parseFloat(70) / 2;
      let halfHeight = parseFloat(70) / 2;
      return "translate(" + (d.x - halfWidth) + "," + (d.y - halfHeight) + ")";
    });
  }

  initMarker() {
    this.svg
      .append("marker")
      .attr("id", "resolved")
      .attr("markerUnits", "userSpaceOnUse")
      .attr("viewBox", "0 -5 10 10") //坐标系的区域
      .attr("refX", 12) //箭头坐标
      .attr("refY", 0)
      .attr("markerWidth", 12) //标识的大小
      .attr("markerHeight", 12)
      .attr("orient", "auto") //绘制方向，可设定为：auto（自动确认方向）和 角度值
      .attr("stroke-width", 2) //箭头宽度
      .append("path")
      .attr("d", "M0,-5L10,0L0,5") //箭头的路径
      .attr("fill", "#6cbfed"); //箭头颜色
  }

  initLinks() {
    this.graphLinks = this.container
      .append("g")
      .attr("class", "link-group")
      .selectAll("g.link")
      .data(this.links)
      .enter()
      .append("g")
      .attr("class", "link");

    this.graphLinks
      .append("path")
      .attr("class", "line-path")
      .style("stroke", "#ceeaf9")
      .style("stroke-width", 4);

    this.graphLinks.append("text").attr("fill", "#000").attr('font-size', 10).text(function (d) {
      if (d.status !== 0 && d.netspeed) {
        return d.netspeed
      } else {
        return "无法到达"
      }
    })

    this.graphLinks.each(function (d) {
      let linkEl = d3.select(this)
      if (d.status !== 0) {
        linkEl.append("path").attr("class", 'animate-path').style("stroke", "#6cbfed")
          .style("stroke-width", 4);
      }
    })
  }

  initLinksPosition() {
    this.graphLinks
      .selectAll("path")
      .attr("d", function (d) {
        // M x y L x y 移到M点，画到L点
        return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
      })
      .attr("marker-end", "url(#resolved)");
    //连线文字放于中心 
    this.graphLinks.selectAll("text").attr("dx", function (d) {
      return (d.source.x + d.target.x) / 2
    }).attr("dy", function (d) {
      return (d.source.y + d.target.y) / 2
    })
  }

  initDrag() {
    let _this = this;
    this.graphNodes.call(
      d3.drag().on("start", dragStart).on("drag", dragging).on("end", dragEnd)
    );
    function dragStart(d) {
      if (!d.active)
        _this.force.alphaTarget(0.2).restart();
    }
    function dragging(d) {
      d.subject.x = d.x;
      d.subject.y = d.y;
    }
    function dragEnd(d) {
      if (!d.active)
        _this.force.alphaTarget(0);
    }
  }

  initZoom() {
    // scaleExtent缩放范围
    let _this = this
    this.svg.call(getZoom())
    function getZoom() {
      return _this.zoom = d3.zoom().scaleExtent([0.05, 8]).on('zoom', (d) => {
        d3.select("g.graph").attr("transform", function () {
          return `translate(${d.transform.x},${d.transform.y}) scale(${d.transform.k})`
        })
      })
    }
  }

  initNodeHover() {
    // 移入展示信息
    this.graphNodes.on("mouseenter", (event, node) => {
      this.tooltips.html(createTips(node))
      this.tooltips.style("left", event.offsetX + 10 + 'px').style("top", event.offsetY + 10 + 'px').style("display", 'block')
    })
    // 移出隐藏信息
    this.graphNodes.on("mouseleave", () => {
      this.tooltips.style("display", 'none')
    })
    function createTips(node) {
      let html = `<div>${node.name}</div>`
      return html
    }
  }
}
