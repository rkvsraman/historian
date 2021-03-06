'use strict';

pathfinder.controller('GlobalCtrl',

    function GlobalCtrl($scope, $location) {

        $scope.zoomval = 1;
        $scope.onceRendered = false;


        $scope.zoomin = function () {
            $scope.zoomval++;
            setUpgraph($scope.graphData);
        }

        $scope.zoomout = function () {
            if ($scope.zoomval > 1) {
                $scope.zoomval--;
                setUpgraph($scope.graphData);
            }

        }

        var Renderer = function (elt) {
            var dom = $(elt)
            var canvas = dom.get(0)
            var ctx = canvas.getContext("2d");

            var gfx = arbor.Graphics(canvas)
            var sys = null

            var _vignette = null
            var selected = null,
                nearest = null,
                _mouseP = null;


            var that = {
                init: function (pSystem) {
                    sys = pSystem
                    sys.screen({size: {width: dom.width(), height: dom.height()},
                        padding: [36, 60, 36, 60]})

                    $(window).resize(that.resize)
                    that.resize()
                    that._initMouseHandling()


                },
                resize: function () {
                    canvas.width = $(window).width()
                    canvas.height = .60 * $(window).height()
                    sys.screen({size: {width: canvas.width, height: canvas.height}})
                    ctx.scale($scope.zoomval, $scope.zoomval);
                    _vignette = null
                    that.redraw()
                },
                redraw: function () {
                    if ($scope.activeNodes == 1 && $scope.onceRendered) {
                        return
                    }
                    gfx.clear()

                    sys.eachEdge(function (edge, p1, p2) {
                        var grd = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                        grd.addColorStop(0, "#FFCC00");
                        grd.addColorStop(0.2, "#FFCC00");
                        grd.addColorStop(0.6, "#5C001F");
                        grd.addColorStop(1, "#5C001F");

                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = grd;
                        ctx.lineWidth = 5
                        ctx.stroke();

                        //gfx.line(p1, p2, {stroke: "#3333CC", width: 5, alpha: 1})
                        //gfx.line(p1, p2, {stroke: grd, width: 5})


                    })
                    sys.eachNode(function (node, pt) {
                        var w = Math.max(20, 20 + gfx.textWidth(node.name))

                        if (node.data.link.indexOf("chrome://newtab") != -1) {

                            gfx.oval(pt.x - w / 2, pt.y - w / 2, w, w, {fill: "#003300", alpha: node.data.alpha})
                            gfx.text("S", pt.x, pt.y + 7, {color: "white", align: "center", font: "Arial", size: 12})

                        }
                        else if (node.data.link === $scope.graphData.lastURL) {
                            gfx.oval(pt.x - w / 2, pt.y - w / 2, w, w, {fill: "#FF6666", alpha: node.data.alpha})
                            gfx.text(node.name, pt.x, pt.y + 7, {color: "black", align: "center", font: "Arial", size: 12})
                        } else {
                            gfx.oval(pt.x - w / 2, pt.y - w / 2, w, w, {fill: "#FFCC00", alpha: node.data.alpha})
                            gfx.text(node.name, pt.x, pt.y + 7, {color: "black", align: "center", font: "Arial", size: 12})
                        }

                    })
                    if (!$scope.onceRendered) {
                        $scope.$apply(function () {
                            $scope.onceRendered = true;
                        });
                    }

                },


                _initMouseHandling: function () {
                    // no-nonsense drag and drop (thanks springy.js)
                    selected = null;
                    nearest = null;
                    var dragged = null;
                    var oldmass = 1

                    var _section = null

                    var handler = {
                        moved: function (e) {

                            var pos = $(canvas).offset();
                            _mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top)
                            nearest = sys.nearest(_mouseP);

                            if (!nearest.node) return false


                            selected = (nearest.distance < 20) ? nearest : null
                            if (selected) {
                                //console.log("Found %j", nearest.node);
                                if (nearest.node.data.link.indexOf("chrome://newtab") == -1) {
                                    $scope.$apply(function () {
                                        $scope.title = nearest.node.data.title;
                                        $scope.link = nearest.node.data.link;
                                    });
                                }

                                dom.addClass('linkable')
                                //window.status = selected.node.data.link.replace(/^\//, "http://" + window.location.host + "/").replace(/^#/, '')
                            }
                            else {
                                dom.removeClass('linkable')
                                //window.status = ''
                            }


                            return false
                        },
                        clicked: function (e) {

                            var pos = $(canvas).offset();
                            _mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top)
                            nearest = dragged = sys.nearest(_mouseP);

                            if (nearest && selected && nearest.node === selected.node) {
                                var link = selected.node.data.link
                                var tabId = selected.node.data.tabId

                                console.log(link);
                                if (link.indexOf("chrome://newtab") == -1) {
                                    setLink(link,tabId);
                                }
                                //window.location = link
                                return false
                            }


                            if (dragged && dragged.node !== null) dragged.node.fixed = true

                            $(canvas).unbind('mousemove', handler.moved);
                            $(canvas).bind('mousemove', handler.dragged)
                            $(window).bind('mouseup', handler.dropped)

                            return false
                        },
                        dragged: function (e) {

                            var old_nearest = nearest && nearest.node._id
                            var pos = $(canvas).offset();
                            var s = arbor.Point(e.pageX - pos.left, e.pageY - pos.top)

                            if (!nearest) return
                            if (dragged !== null && dragged.node !== null) {
                                var p = sys.fromScreen(s)
                                dragged.node.p = p
                            }

                            return false
                        },

                        dropped: function (e) {

                            if (dragged === null || dragged.node === undefined) return
                            if (dragged.node !== null) dragged.node.fixed = false
                            dragged.node.tempMass = 1000
                            dragged = null;
                            // selected = null
                            $(canvas).unbind('mousemove', handler.dragged)
                            $(window).unbind('mouseup', handler.dropped)
                            $(canvas).bind('mousemove', handler.moved);
                            _mouseP = null
                            return false
                        }


                    }

                    $(canvas).mousedown(handler.clicked);
                    $(canvas).mousemove(handler.moved);

                }
            }

            return that
        }

        var CLR = {
            branch: "#995C1F",
            code: "orange",
            doc: "#922E00",
            demo: "#a7af00"
        }


        function setUpgraph(data) {
            console.log("%j", data.graph);
            var graph = data.graph;
            var nodes = graph._nodes;

            var activeNodes = 0;
            var theUI = {};
            theUI.nodes = {};
            theUI.edges = {};
            var i = 1;
            for (var properties in nodes) {
                if (nodes[properties].closed) {
                    continue;
                }
                activeNodes++;
                theUI.nodes[i] = {color: CLR.branch, shape: "dot", alpha: 1};
                theUI.nodes[i].link = properties;
                theUI.nodes[i].title = nodes[properties].title;
                theUI.nodes[i].tabId = nodes[properties].tabId;
                i++;

            }
            for (var properties in nodes) {

                if (nodes[properties].closed) {
                    continue;
                }
                var sourceNodeIndex = findgraphNode(theUI.nodes, properties);
                if (sourceNodeIndex) {
                    theUI.edges[sourceNodeIndex] = {};
                    var outEdges = nodes[properties]._outEdges
                    for (var edges in outEdges) {

                        var edgeIndex = findgraphNode(theUI.nodes, edges);
                        if (edgeIndex) {
                            theUI.edges[sourceNodeIndex][edgeIndex] = {};
                        }
                    }
                }

            }
            $scope.activeNodes = activeNodes;

            var sys = arbor.ParticleSystem();
            sys.parameters({stiffness: 900, repulsion: 2000, gravity: true, dt: 0.015})
            sys.renderer = Renderer("#globalgraph");
            sys.graft(theUI);

        }

        function findgraphNode(nodes, prop) {
            for (var props in nodes) {
                if (nodes[props].link === prop) {
                    return props;
                }
            }
            return null;
        }

        function setLink(link, tabId) {
            chrome.runtime.sendMessage({request: 'openLink',
                link: link,
                tabId: tabId}, function (response) {
                window.close();

            });
        }

        function getGraphData() {
            chrome.runtime.sendMessage({request: 'browserGraph'}, function (response) {

                $scope.$apply(function () {
                    $scope.graphData = response;
                    setUpgraph(response);
                });

            });
        }

        getGraphData();

    });