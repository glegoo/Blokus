/*
 * @Author: chengwei 
 * @Date: 2018-06-14 16:12:53 
 */
import { Utils } from "../Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ButtonActive extends cc.Component {

    @property([cc.Node])
    showNodes: cc.Node[] = [];

    @property([cc.Node])
    hideNodes: cc.Node[] = [];

    @property([cc.Node])
    switchNodes: cc.Node[] = [];

    onLoad() {        
        let eventHandler = new cc.Component.EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = 'ButtonActive';
        eventHandler.handler = 'onClick';

        let clickEvents = this.node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    }

    onClick() {
        for (let index = 0; index < this.showNodes.length; index++) {
            let node = this.showNodes[index];
            if (node) {
                node.active = true;
            }
        }

        for (let index = 0; index < this.hideNodes.length; index++) {
            let node = this.hideNodes[index];
            if (node) {
                node.active = false;
            }
        }

        for (let index = 0; index < this.switchNodes.length; index++) {
            let node = this.switchNodes[index];
            if (node) {
                node.active = !node.active;
            }
        }
    }
}
