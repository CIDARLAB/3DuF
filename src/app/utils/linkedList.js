export default class LinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.count = 0;
        this.current = null;
    }

    currentData() {
        return this.current.data;
    }

    removeCurrent() {
        let prev = this.current.prev;
        let next = this.current.next;

        prev.next = next;
        next.prev = prev;
    }

    removeNode(node) {
        let cnode = this.head;
        if (node.id === cnode.id) {
            //remove the node
            let prev = cnode.prev;
            let next = cnode.next;

            prev.next = next;
            if (next) {
                next.prev = prev;
            }
        } else {
            let nextnode = LinkedList.getNextNode(cnode);
            while (nextnode) {
                if (nextnode.id === node.id) {
                    //remove the node
                    let prev = nextnode.prev;
                    let next = nextnode.next;

                    prev.next = next;
                    if (next) {
                        next.prev = prev;
                    }
                    break;
                } else {
                    nextnode = LinkedList.getNextNode(nextnode);
                }
            }
        }
        this.count--;
    }

    get length() {
        return this.count;
    }

    push(data) {
        //Incase its the first one
        if (this.count === 0) {
            let node = new Node(data);
            this.head = node;
            this.tail = node;
        } else {
            //Save the old head
            let temp = this.head;

            //Set the new head
            let node = new Node(data);
            node.id = this.count;

            //Create new links
            node.next = temp;
            temp.prev = node;

            this.head = node;
        }
        this.count++;
    }

    getArray() {
        let retarray = [];
        retarray.push(this.head.data);
        let nextnode = LinkedList.getNextNode(this.head);
        while (nextnode) {
            retarray.push(nextnode.data);
            nextnode = LinkedList.getNextNode(nextnode);
        }
        return retarray;
    }

    static getNextNode(node) {
        return node.next;
    }

    static getPreviousNode(node) {
        return node.prev;
    }
}

class Node {
    constructor(data) {
        this.prev = null;
        this.data = data;
        this.next = null;
        this.id = 0;
    }
}
