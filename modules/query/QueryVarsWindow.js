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

import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript'
import "codemirror/lib/codemirror.css";
import 'codemirror/theme/idea.css';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/html-hint';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/keymap/sublime';
import GlobalViz from "../GlobalViz";

export default class QueryVarsWindow {

    constructor() {
        this.storageKey = "Graphvinci.codemirror";
    }

    get contents() {
        let validJson = null;
        try {
            validJson = JSON.parse(this.editor.getValue())
        }
        catch(err) {
            // do nothing
        }
        return validJson;
    }

    build(container, contents) {
        contents = (contents && contents !== 'null') ? contents : "# Variables in JSON format go here"
        this.visible = true;
        container.selectAll('*').remove();
        container.append('textarea')
            .attr('class', "mirrorarea")
            .attr('id', "varswindow")
            .property('value', contents)

        let myTextArea = document.getElementById("varswindow");

        this.editor = CodeMirror.fromTextArea(myTextArea, {
            mode: 'javascript',
            tabSize: 2,
            keyMap: 'sublime',
            theme: "idea",
            lineNumbers: true,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            autoCloseBrackets: true,
            matchBrackets: true
        });
        this.editor.setSize("100%", "100%");
        this.editor.on("change", () => {
            GlobalViz.vis?.query_window.push_change();
        });
    }

}
