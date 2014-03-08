'use strict';

pathfinder.controller('WelcomeCtrl',

    function WelcomeCtrl($scope, $location) {
        $scope.clicked = function () {
            alert("Clicked");
        };


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
                    canvas.height = .75 * $(window).height()
                    sys.screen({size: {width: canvas.width, height: canvas.height}})
                    _vignette = null
                    that.redraw()
                },
                redraw: function () {
                    gfx.clear()
                    sys.eachEdge(function (edge, p1, p2) {
                        if (edge.source.data.alpha * edge.target.data.alpha == 0) return
                        gfx.line(p1, p2, {stroke: "#b2b19d", width: 2, alpha: edge.target.data.alpha})
                    })
                    sys.eachNode(function (node, pt) {
                        var w = Math.max(20, 20 + gfx.textWidth(node.name))

                        gfx.oval(pt.x - w / 2, pt.y - w / 2, w, w, {fill: node.data.color, alpha: node.data.alpha})
                        gfx.text(node.name, pt.x, pt.y + 7, {color: "white", align: "center", font: "Arial", size: 12})
                        gfx.text(node.name, pt.x, pt.y + 7, {color: "white", align: "center", font: "Arial", size: 12})

                    })
                    that._drawVignette()
                },

                _drawVignette: function () {
                    var w = canvas.width
                    var h = canvas.height
                    var r = 20

                    if (!_vignette) {
                        var top = ctx.createLinearGradient(0, 0, 0, r)
                        top.addColorStop(0, "#e0e0e0")
                        top.addColorStop(.7, "rgba(255,255,255,0)")

                        var bot = ctx.createLinearGradient(0, h - r, 0, h)
                        bot.addColorStop(0, "rgba(255,255,255,0)")
                        bot.addColorStop(1, "white")

                        _vignette = {top: top, bot: bot}
                    }

                    // top
                    ctx.fillStyle = _vignette.top
                    ctx.fillRect(0, 0, w, r)

                    // bot
                    ctx.fillStyle = _vignette.bot
                    ctx.fillRect(0, h - r, w, r)
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


                            selected = (nearest.distance < 50) ? nearest : null
                            if (selected) {
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

                                console.log(link);
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
            branch: "#b2b19d",
            code: "orange",
            doc: "#922E00",
            demo: "#a7af00"
        }

        var theUI = {
            nodes: {"arbor.js": {color: "red", shape: "dot", alpha: 1},

                demos: {color: CLR.branch, shape: "dot", alpha: 1},
                halfviz: {color: CLR.demo, alpha: 1, link: '/halfviz'},
                atlas: {color: CLR.demo, alpha: 1, link: '/atlas'},
                echolalia: {color: CLR.demo, alpha: 1, link: '/echolalia'},

                docs: {color: CLR.branch, shape: "dot", alpha: 1},
                reference: {color: CLR.doc, alpha: 1, link: '#reference'},
                introduction: {color: CLR.doc, alpha: 1, link: '#introduction'},

                code: {color: CLR.branch, shape: "dot", alpha: 1},
                github: {color: CLR.code, alpha: 1, link: 'https://github.com/samizdatco/arbor'},
                ".zip": {color: CLR.code, alpha: 1, link: '/js/dist/arbor-v0.92.zip'},
                ".tar.gz": {color: CLR.code, alpha: 1, link: '/js/dist/arbor-v0.92.tar.gz'}
            },
            edges: {
                "arbor.js": {
                    demos: {length: .8},
                    docs: {length: .8},
                    code: {length: .8}
                },
                demos: {halfviz: {},
                    atlas: {},
                    echolalia: {}
                },
                docs: {reference: {},
                    introduction: {}
                },
                code: {".zip": {},
                    ".tar.gz": {},
                    "github": {}
                }
            }
        }





        chrome.runtime.sendMessage({request: 'getTabInfo'}, function (response) {

          console.log("%j",response.graph);
            var graph = response.graph;
            var nodes = graph._nodes;

            theUI = {};
            theUI.nodes = {};
            theUI.edges = {};
            var i = 1;
            for(var properties in nodes){
                theUI.nodes[i] = {color: CLR.branch, shape: "dot", alpha: 1};
                theUI.nodes[i].link = properties;
                i++;
            }
            for(var properties in nodes){

               var sourceNodeIndex =  findgraphNode(theUI.nodes , properties);
                if(sourceNodeIndex){
                      theUI[sourceNodeIndex] = {};
                }

            }

            var sys = arbor.ParticleSystem()    ;
            sys.parameters({stiffness: 900, repulsion: 2000, gravity: true, dt: 0.015})
            sys.renderer = Renderer("#showgraph")  ;
            sys.graft(theUI)  ;

        });

        function findgraphNode(nodes,prop){
            for(var props in nodes){
                if(nodes[props].link === prop){
                    return props;
                }
            }
            return null;
        }


    };