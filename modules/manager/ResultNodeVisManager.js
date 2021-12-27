/*
 * Copyright 2018 The GraphVinci Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import ClassNodeSizer from './ClassNodeSizer.js';
import * as d3 from "d3";
import GlobalViz from "../GlobalViz";
import d3utils from "../utils/D3Utils";
export default class ResultNodeVisManager {
    constructor(node) {
        this.node = node;
    }

    build(group) {
        this.group = group;
        this.fieldArray = this.get_array();
        this.sizing = new ClassNodeSizer(this.fieldArray);

        // Create the master container, if it doesn't already exist using a single-element array
        let master = d3.select(this.group)
            .append('g')
            .attr('class', "masterGroup")
            .attr("transform", () => {
                return "translate(-" + (this.sizing.rowWidth / 2) + ",-" + (this.sizing.tableHeight / 2) + ")";
            });

        // Append the "subdermal" color layer
        master.append('g')
            .attr('class', "subgroup")
            .append('rect')
            .attr('class', "subdermis")
            .attr('width', this.sizing.rowWidth)
            .attr('height', this.sizing.tableHeight)
            .attr('fill', d3utils.get_color(this.node.domain));

        // Remove and re-create the incoming attachment points
        this._append_incoming_group(master);

        this._manage_rows(master);

        // Apply the "epidermis" top layer
        master.append('g')
            .attr('class', "overlay")
            .append('rect')
            .attr('class', "epidermis")
            .attr('width', this.sizing.rowWidth)
            .attr('height', this.sizing.tableHeight)
            .attr('stroke', d3utils.get_node_color(this.node))
            .attr('stroke-width', 4)
            .attr('rx', 4)
            .attr('fill', "none");

    }

    _manage_rows(master) {
        let self = this;
        let rowGroup = master.selectAll('.rows')
            .data(this.fieldArray)
            .enter()
            .append('g')
            .attr('class', 'rows')
            .attr('filterName', d => d.name)
            .attr("transform", function (d, i) {
                let x = 0;
                let y = i * self.sizing.fullHeight;
                return "translate(" + x + "," + y + ")";
            });

        rowGroup.append('rect')
            .attr("width", this.sizing.rowWidth)
            .attr("height", this.sizing.rowHeight)
            .attr('fill', "white")
            .attr('rx', 3)
            .style("opacity", function(d,i) {
                switch(d.rootKind) {
                    case("Header"):
                        return 0.2;
                    case("LINK"):
                        return (i % 2) ? 0.4 : 0.5;
                    default:
                        return (i % 2) ? 0.8 : 0.9;
                }
            });

        let header = rowGroup.filter(d => d.rootKind === 'Header');

        header.append('text')
            .text(d => d.name)
            .attr('class', "headerText")
            .attr('x', self.sizing.centerTextAnchorX)
            .attr('y', self.sizing.rowMidPoint)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle');

        header.selectAll('.entitySelector')
            .data([{side: "left"},{side:"right"}])
            .enter()
            .append('circle')
            .attr('class', 'entitySelector')
            .attr("r", 0)
            .attr('cx', d => {
                return (d.side === "left") ? 0 : self.sizing.rowWidth;
            })
            .attr('cy', self.sizing.rowMidPoint)
            .attr("fill", "black");

        let propRows = rowGroup.filter(d => d.rootKind === 'PROPERTY');

        propRows.append('text')
            .text(d => d.name)
            .attr('class', "leftText")
            .attr('x', self.sizing.leftTextAnchorX)
            .attr('y', self.sizing.rowMidPoint)
            .attr('alignment-baseline', 'middle');

        propRows.append('text')
            .text(d => d.definition)
            .attr('class', "rightText")
            .attr('x', self.sizing.rightTextAnchorX)
            .attr('y', self.sizing.rowMidPoint)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'end');

        let linkRows = rowGroup.filter(d => d.rootKind === 'LINK');

        linkRows.append('text')
            .text(d => d.name)
            .attr('class', "headerText")
            .attr('x', self.sizing.centerTextAnchorX)
            .attr('y', self.sizing.rowMidPoint)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle');

        linkRows
            .selectAll('.sourceSelector')
            .data([{side: "left"},{side:"right"}])
            .enter()
            .append('circle')
            .attr('class', 'sourceSelector')
            .attr("r", 0)
            .attr('cx', d => {
                return (d.side === "left") ? 0 : self.sizing.rowWidth;
            })
            .attr('cy', self.sizing.rowMidPoint)
            .attr("fill", "black");

        linkRows.selectAll('rect')
            .attr('stroke',"#444")
            .attr('stroke-width', 3);

    }

    _append_incoming_group(master) {

        master.selectAll('.incomingSelector')
            .data(this.sizing.targetPoints)
            .enter()
            .append('circle')
            .attr('class', "incomingSelector")
            .attr("r", 0)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr("fill", "black");

    }

    get_array() {
        // Create array copy
        let deDup = new Set();
        let rowsArray = [{rootKind: "Header", name: this.node.schemaNode.trueName}];
        for (let field of this.node.properties) {
            rowsArray.push(field);
        }
        for (let field of this.node.links) {
            if (! deDup.has(field.name)) {
                rowsArray.push(field);
            }
            deDup.add(field.name);
        }
        rowsArray.sort((a, b) => {
            if (a.rootKind === 'Header') return -1; // Always first
            if (b.rootKind === 'Header') return 1;

            if (a.rootKind !== b.rootKind) {
                if (a.rootKind === 'LINK') {
                    return 1;
                }
                else {
                    return -1;
                }
            }
            return a.name.localeCompare(b.name);
        });

        return rowsArray;
    }

    getSourceConnectionPoint(fieldName, destination) {
        let selector = d3.select(this.group)
            .selectAll('.sourceSelector')
            .filter(function(d) {
                return d3.select(this.parentNode).attr('filterName') === fieldName;
            });
        let candidates = this.getCandidates(selector);
        return d3utils.get_closest_point(destination, candidates);
    }

    getIncomingConnectionPoint(source) {
        let selector = d3.select(this.group)
            .selectAll('.incomingSelector');
        let candidates = this.getCandidates(selector);
        return d3utils.get_closest_point(source, candidates);
    }

    getEntityConnectionPoint(source) {
        let selector = d3.select(this.group)
            .selectAll('.entitySelector');
        let candidates = this.getCandidates(selector);
        return d3utils.get_closest_point(source, candidates);
    }

    getCandidates(selection) {
        let candidates = [];
        selection.each(function () {
            candidates.push(d3utils.get_circle_XY(this));
        });
        return candidates;
    }

}