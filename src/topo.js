const d3 = require("d3");

const imgMap = {
  0: require("./assets/clouds/cloud-province.png"),
  1: require("./assets/clouds/cloud-city.png"),
  2: require("./assets/clouds/cloud-county.png"),
  "error-tip": require("./assets/clouds/error-tip.png"),
  "link-cut": require("./assets/clouds/link-cut.png"),
};

export default class Topo {
  strength = -10000;
  alpha = 1;
  alphaDecay = 0.05;
  distanceMax = 500;
  scaleExtent = [0.05, 10];
  nodeOption = {
    textColor: "#000",
    nodeTextSize: 16,
    imageWidth: 40,
    imageHeight: 40,
    tipsOffset: [10, 10],
  };
  lineOption = {
    textColor: "#000",
    strokeWidth: 4,
    lineTextSize: 10,
    stroke: "rgb(169,204,255)",
    strokeAnimation: "#b8faff",
    strokeError: "red",
  };
  constructor(el, data) {
    this.svg = d3.select(el);
    this.width = this.svg.attr("width");
    this.height = this.svg.attr("height");
    this.nodes = data.nodes;
    this.links = data.links;
    this.tooltips = d3.select("#tooltips");
  }
  render() {
    this.container = this.svg.append("g").attr("class", "graph");
    this.init();

    this.force.on("tick", () => {
      this.initLinksPosition();
      this.initNodesPosition();
    });
  }

  init() {
    this.initForce(); //初始化力模型
    this.initMarker(); //初始化连线箭头
    this.initLinks(); //连线需要在节点之前，否则会盖住
    this.initNodes(); //初始化节点
    this.initDrag(); //初始化节点拖拽
    this.initZoom(); //初始化缩放
    this.initNodeHover(); //初始化hover节点信息展示
  }

  initForce() {
    this.force = d3
      .forceSimulation(this.nodes)
      .alpha(this.alpha) //力迭代次数[0,1]，越大布局越好
      .force(
        "charge",
        d3.forceManyBody().strength(this.strength).distanceMax(this.distanceMax)
      ) //strength节点之间引力，负值越大分的越开。distanceMax连线距离
      .force("link", d3.forceLink(this.links))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2)); //布局中心点
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

    this.enterNodes(this.graphNodes);
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

    this.enterLinks(this.graphLinks);
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
    this.graphLinks
      .selectAll("text")
      .attr("dx", function (d) {
        return (d.source.x + d.target.x) / 2;
      })
      .attr("dy", function (d) {
        return (d.source.y + d.target.y) / 2;
      });
  }

  initDrag() {
    let _this = this;
    this.graphNodes.call(
      d3.drag().on("start", dragStart).on("drag", dragging).on("end", dragEnd)
    );
    function dragStart(d) {
      if (!d.active) _this.force.alphaTarget(0.2).restart();
    }
    function dragging(d) {
      d.subject.x = d.x;
      d.subject.y = d.y;
    }
    function dragEnd(d) {
      if (!d.active) _this.force.alphaTarget(0);
    }
  }

  initZoom() {
    // scaleExtent缩放范围
    let _this = this;
    this.svg.call(getZoom()).on("dblclick.zoom", null);
    function getZoom() {
      return (_this.zoom = d3
        .zoom()
        .scaleExtent([0.05, 8])
        .on("zoom", (d) => {
          d3.select("g.graph").attr("transform", function () {
            return `translate(${d.transform.x},${d.transform.y}) scale(${d.transform.k})`;
          });
        }));
    }
  }

  initNodeHover() {
    // 移入展示信息
    this.graphNodes.on("mouseenter", (event, node) => {
      this.tooltips.html(createTips(node));
      this.tooltips
        .style("left", event.offsetX + 10 + "px")
        .style("top", event.offsetY + 10 + "px")
        .style("display", "block");
    });
    // 移出隐藏信息
    this.graphNodes.on("mouseleave", () => {
      this.tooltips.style("display", "none");
    });
    function createTips(node) {
      let html = `<div>${node.name}</div>`;
      return html;
    }
  }

  reRender() {
    this.reInitLink();
    this.reInitNode();

    this.force.nodes(this.nodes);
    this.force.force("links", d3.forceLink(this.links));
    this.force.alpha(this.alpha).alphaDecay(this.alphaDecay).restart();
  }

  reInitLink() {
    let updateLinks = d3
      .select("g.link-group")
      .selectAll("g.link")
      .data(this.links);

    // 更新
    this.updateLinks(updateLinks);

    updateLinks.exit().remove();

    let enterLinks = updateLinks.enter().append("g").attr("class", "line");
    this.enterLinks(enterLinks);

    this.graphLinks = enterLinks.merge(updateLinks);
  }
  updateLinks(selection) {
    let _this = this;
    selection.each(function (d) {
      let self = d3.select(this);
      let path = self.select("path.line-path");
      let text = self.select("text");
      let animatePath = self.select("path.animate-path");
      if (text.empty()) {
        if (d.netspeed) {
          drawLinkText.call(_this, self);
        }
      } else {
        if (d.netspeed) {
          updateLinkText.call(_this, self);
        } else {
          text.remove();
        }
      }
      if (d.status === 0) {
        if (!path.empty()) {
          path.remove();
        }
        if (animatePath.empty()) {
          drawLinkAnimatePath.call(_this, self);
        }
      } else {
        if (path.empty()) {
          drawLinkPath.call(_this, self);
        } else {
          updateLinkPath.call(_this, self);
        }
        if (!animatePath.empty()) {
          animatePath.remove();
        }
      }
    });
  }
  enterLinks(selection) {
    let _this = this;
    selection.each(function (d) {
      let self = d3.select(this);
      if (d.status !== 2) {
        drawLinkPath.call(_this, self);
      } else {
        drawLinkAnimatePath.call(_this, self);
      }
      if (d.netspeed) {
        drawLinkText.call(_this, self);
      }
    });
  }

  reInitNode() {
    let updateNodes = d3
      .select("g.node-group")
      .selectAll("g.node")
      .data(this.nodes);

    this.updateNodes(updateNodes);

    updateNodes.exit().remove();

    let enterNodes = updateNodes.enter().append("g").attr("class", "node");

    this.enterNodes(enterNodes);

    this.graphNodes = enterNodes.merge(updateNodes);
  }

  updateNodes(selection) {
    updateNodeImage.call(this, selection);
    updateNodeText.call(this, selection);
  }
  enterNodes(selection) {
    drawNodeImage.call(this, selection);
    drawNodeText.call(this, selection);
  }
}

function drawNodeImage(selection) {
  selection
    .append("image")
    .attr("width", this.nodeOption.imageWidth)
    .attr("height", this.nodeOption.imageHeight)
    .attr("xlink:href", (d) => {
      return imgMap[d.type];
    });
}

function drawNodeText(selection) {
  selection
    .append("text")
    .style("fill", this.nodeOption.textColor)
    .style("font-size", this.nodeOption.nodeTextSize)
    .attr("dy", this.nodeOption.imageHeight + 12)
    .attr("dx", this.nodeOption.imageWidth / 2)
    .text((d) => d.name);
}

function updateNodeImage(selection) {
  selection
    .select("image")
    .attr("width", this.nodeOption.imageWidth)
    .attr("height", this.nodeOption.imageHeight)
    .attr("xlink:href", (d) => {
      return imgMap[d.type];
    });
}

function updateNodeText(selection) {
  selection
    .select("text")
    .style("fill", this.nodeOption.textColor)
    .style("font-size", this.nodeOption.nodeTextSize)
    .attr("dy", this.nodeOption.imageHeight + 12)
    .attr("dx", this.nodeOption.imageWidth / 2)
    .text((d) => d.name);
}

function drawLinkPath(selection) {
  selection
    .append("path")
    .style("stroke", (d) => {
      if (d.status === 0) {
        return this.lineOption.strokeError;
      } else {
        return this.lineOption.stroke;
      }
    })
    .style("stroke-width", this.lineOption.strokeWidth)
    .attr("class", "line-path")
    .attr("marker-end", "url(#resolved)");
}

function drawLinkText(selection) {
  selection
    .append("text")
    .text((d) => d.netspeed)
    .style("fill", this.lineOption.textColor)
    .style("font-size", this.lineOption.lineTextSize);
}

function drawLinkAnimatePath(selection) {
  selection
    .append("path")
    .style("stroke", this.lineOption.strokeAnimation)
    .style("stroke-width", this.lineOption.strokeWidth)
    .attr("class", "animate-path")
    .attr("marker-end", "url(#resolved)");
}

function updateLinkPath(selection) {
  selection
    .select("path.line-path")
    .style("stroke", (d) => {
      if (d.status === 0) {
        return this.lineOption.strokeError;
      } else {
        return this.lineOption.stroke;
      }
    })
    .style("stroke-width", this.lineOption.strokeWidth)
    .attr("class", "line-path")
    .attr("marker-end", "url(#resolved)");
}

function updateLinkText(selection) {
  selection
    .select("text")
    .text((d) => d.netspeed)
    .style("fill", this.lineOption.textColor)
    .style("font-size", this.lineOption.lineTextSize);
}
