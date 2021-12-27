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

const storage_key = "Geeviz.history.v1";
const preview_size = 100;
const preview_end = "...";

export default class HistoryManager {

    constructor() {
        this.history = {};
        let stored = localStorage.getItem(storage_key);
        if (!stored) return;
        this.history = JSON.parse(localStorage.getItem(storage_key))
    }

    save(op) {
        let full_query = {
            operation: op.query,
            variables: op.variables
        }
        let hash_code = this._hashCode(full_query)
        if (this.history[hash_code]) {
            console.log("Not re-saving query with hash " + hash_code)
            return;
        }
        full_query.hash_code = hash_code;
        this._assign_metadata(op, full_query);
        this.history[hash_code] = full_query;
        this._store();
    }

    delete(op) {
        if (this.history[op.hash_code]) {
            delete this.history[op.hash_code];
            this._store();
        }
    }

    _store() {
        localStorage.setItem(storage_key, JSON.stringify(this.history));
    }

    _assign_metadata(op, saveable) {
        saveable.type = "query";
        saveable.op = "unknown";
        saveable.preview = `query unknown`;
        if (op && op.ast && op.ast.definitions && op.ast.definitions[0]) {
            let def = op.ast.definitions[0];
            saveable.type = op.ast.definitions[0].operation;
            if (def.selectionSet && def.selectionSet.selections && def.selectionSet.selections[0]) {
                let first_selection = def.selectionSet.selections[0];
                if (first_selection.name && first_selection.name.value) {
                    saveable.op = first_selection.name.value;
                }
            }
        }
        if (saveable.operation) {
            let preview = saveable.operation.replace(/\n/g, " ").substr(0, preview_size)
            saveable.preview = `${preview}`;
            if (saveable.operation.length > preview_size) {
                saveable.preview = saveable.preview + ` ${preview_end}`
            }
        }
    }

    get_history(filter) {
        let ret = [];
        for (const hash_code in this.history) {
            if (!this.history.hasOwnProperty(hash_code)) continue;
            let history_entry = this.history[hash_code];
            if (filter) {
                if (history_entry.operation.includes(filter))
                    ret.push(history_entry);
            } else {
                ret.push(history_entry)
            }
        }
        return ret;
    }

    _hashCode(op) {
        let hash = 0;
        let op_string = JSON.stringify(op);
        if (op_string.length == 0) {
            return hash;
        }
        for (let i = 0; i < op_string.length; i++) {
            let char = op_string.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
}
