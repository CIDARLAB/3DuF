export default class SimpleQueue {
    timeout?: number;
    func: () => any;
    waiting: boolean;
    queued: boolean;
    counter: number;
    report: boolean;

    constructor(func: () => any, timeout?: number, report = false) {
        this.timeout = timeout;
        this.func = func;
        this.waiting = false;
        this.queued = true;
        this.counter = 0;
        this.report = report;
    }

    run() {
        if (this.waiting) {
            this.counter++;
            if (!this.queued) {
                this.queued = true;
            }
        } else {
            if (this.report) console.log("Waited " + this.counter + " times.");
            this.func();
            this.startTimer();
            this.counter = 0;
        }
    }

    endTimer() {
        this.waiting = false;
        if (this.queued) {
            this.queued = false;
            this.run();
        }
    }

    startTimer() {
        const ref = this;
        this.waiting = true;
        window.setTimeout(function() {
            ref.endTimer();
        }, this.timeout);
    }
}
