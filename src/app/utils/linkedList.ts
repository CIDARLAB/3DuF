export default class LinkedList {
    head: Node | null;
    tail: Node | null;
    count: number;
    current: Node | null;

    constructor() {
        this.head = null;
        this.tail = null;
        this.count = 0;
        this.current = null;
    }

    currentData() {
        return this.current?.data;
    }

    removeCurrent() {
        const prev = this.current!.prev;
        const next = this.current!.next;

        prev!.next = next;
        next!.prev = prev;
    }

    removeNode(node: { [k: string]: any }) {
        const cnode = this.head;
        if (node.id === cnode?.id) {
            // remove the node
            const prev = cnode!.prev;
            const next = cnode!.next;

            prev!.next = next;
            if (next) {
                next.prev = prev;
            }
        } else {
            let nextnode = LinkedList.getNextNode(cnode!);
            while (nextnode) {
                if (nextnode.id === node.id) {
                    // remove the node
                    const prev = nextnode.prev;
                    const next = nextnode.next;

                    prev!.next = next;
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

    push(data: { [k: string]: any }) {
        // Incase its the first one
        if (this.count === 0) {
            const node = new Node(data);
            this.head = node;
            this.tail = node;
        } else {
            // Save the old head
            const temp = this.head;

            // Set the new head
            const node = new Node(data);
            node.id = this.count;

            // Create new links
            node.next = temp;
            temp!.prev = node;

            this.head = node;
        }
        this.count++;
    }

    getArray() {
        const retarray = [];
        retarray.push(this.head!.data);
        let nextnode = LinkedList.getNextNode(this.head!);
        while (nextnode) {
            retarray.push(nextnode.data);
            nextnode = LinkedList.getNextNode(nextnode);
        }
        return retarray;
    }

    static getNextNode(node: Node) {
        return node.next;
    }

    static getPreviousNode(node: Node) {
        return node.prev;
    }
}

class Node {
    prev: Node | null;
    data: any;
    next: Node | null;
    id: number;

    constructor(data: any) {
        this.prev = null;
        this.data = data;
        this.next = null;
        this.id = 0;
    }
}
