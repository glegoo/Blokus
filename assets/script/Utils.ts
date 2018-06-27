export class Utils {
    constructor(parameters) {

    }

    static changeParent(node: cc.Node, newParent: cc.Node) {
        if (node.parent == newParent)
            return;
        let getWorldRotation = function (node) {
            let currNode = node;
            let resultRot = currNode.rotation;
            do {
                currNode = currNode.parent;
                resultRot += currNode.rotation;
            } while (currNode.parent != null);
            resultRot = resultRot % 360;
            return resultRot;
        };

        let oldWorRot = getWorldRotation(node);
        let newParentWorRot = getWorldRotation(newParent);
        let newLocRot = oldWorRot - newParentWorRot;

        let oldWorPos = node.convertToWorldSpaceAR(cc.p(0, 0));
        let newLocPos = newParent.convertToNodeSpaceAR(oldWorPos);

        node.parent = newParent;
        node.position = newLocPos;
        node.rotation = newLocRot;
    }

    // 从一个节点坐标切换到另一个
    static convertToOtherNodeSpaceAR(pos:cc.Vec2, from:cc.Node, to:cc.Node) {        
        // 获取子节点世界坐标
        let result = from.convertToWorldSpaceAR(pos);
        // 转换到board坐标
        return to.convertToNodeSpaceAR(result);
    }
}