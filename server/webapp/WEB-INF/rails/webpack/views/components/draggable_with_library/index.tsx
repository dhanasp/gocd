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

import {bind} from "classnames/bind";
import {MithrilComponent} from "jsx/mithril-component";
import * as _ from "lodash";
import * as m from "mithril";
import {Stream} from "mithril/stream";
import * as styles from "./index.scss";

const classnames = bind(styles);

const Sortable = require("@shopify/draggable/lib/es5/sortable").default; // es5 bundle => IE11 support

interface Attrs {
  dataItems: Stream<any>;
}

interface State {
  rearrange: (items: any) => void;
}

export class DraggableLib extends MithrilComponent<Attrs, State> {
  x0: number = 0;

  oncreate(vnode: m.VnodeDOM<Attrs, State>): any {
    return this.initializeDragging(vnode);
  }

  view(vnode: m.Vnode<Attrs, State>): m.Children | void | null {
    return <div class="test">
      {
        _.map(vnode.attrs.dataItems(), (item) => {
          return <div className={classnames("draggable-row", styles.row)}>
            <i className={classnames(styles.dragIcon, "icon_drag")}></i>
            {item}
          </div>;
        })
      }
    </div>;
  }

  private initializeDragging(vnode: m.VnodeDOM<Attrs, State>) {
    return new Sortable(vnode.dom, {
      draggable: ".draggable-row",
      handle: ".icon_drag",
      swapThreshold: 1,
      easing: "cubic-bezier(1, 0, 0, 1)"
    }).on("drag:start", (e: any) => {
      this.x0 = e.data.sensorEvent.data.clientX; // save initial x-coord
    }).on("drag:move", (e: any) => {
      e.data.sensorEvent.data.clientX = this.x0; // prevent vertical scrolling; that would reveal the magic trick!
    }).on("sortable:stop", (e: any) => {
    });
  }

}
