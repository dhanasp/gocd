/*
 * Copyright 2019 ThoughtWorks, Inc.
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

import {MithrilComponent} from "jsx/mithril-component";
import * as _ from "lodash";
import * as m from "mithril";
import {Stream} from "mithril/stream";
import * as stream from "mithril/stream";
import * as styles from "./index.scss";

interface Attrs {
  dataItems: Stream<any>;
}

interface State {
  dragging: Stream<number | undefined>;
  dragStart: (e: any) => void;
  dragOver: (e: any) => void;
  dragEnd: () => void;
  dragged: number;
  rearrange: (items: any, dragging: number | undefined) => void;
}

export class Draggable extends MithrilComponent<Attrs, State> {

  oninit(vnode: m.Vnode<Attrs, State>): any {
    vnode.state.dragging = stream();

    vnode.state.rearrange = (items, dragging) => {
      vnode.state.dragging(dragging);
      vnode.attrs.dataItems(items);
    };

    vnode.state.dragStart = (e) => {
      vnode.state.dragged          = Number(e.currentTarget.dataset.id);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", null);
    };

    vnode.state.dragOver = (e) => {
      e.preventDefault();
      const over = e.currentTarget;

      let to         = Number(over.dataset.id);
      const dragging = vnode.state.dragging()!;

      const from = isFinite(dragging) ? dragging : vnode.state.dragged;

      // if ((e.clientY - over.offsetTop) > (over.offsetHeight)) {
      //   to++;
      // }
      // if (from < to) {
      //   to--;
      // }

      const items = vnode.attrs.dataItems();
      items.splice(to, 0, items.splice(from, 1)[0]);

      vnode.state.rearrange(items, to);
    };

    vnode.state.dragEnd = () => {
      vnode.state.rearrange(vnode.attrs.dataItems(), undefined);
    };
  }

  view(vnode: m.Vnode<Attrs, State>): m.Children | void | null {
    return <div class="drag-n-drop">
      <ol>
        {
          _.map(vnode.attrs.dataItems(), (item, index) => {
            const dragging = (Number(index) === vnode.state.dragging()) ? styles.dragging : undefined;
            return <li data-id={index}
                       class={dragging}
                       draggable={true}
                       ondragstart={vnode.state.dragStart.bind(this)}
                       ondragover={vnode.state.dragOver.bind(this)}
                       ondragend={vnode.state.dragEnd.bind(this)}>
              {item}
            </li>;
          })
        }
      </ol>
      <pre>
        Model:
        {JSON.stringify(vnode.attrs.dataItems(), [0], 2)}
      </pre>
    </div>;
  }

}
