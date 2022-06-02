export function removeClass(el: HTMLElement, className: string): void  {
    if (el.classList) el.classList.remove(className);
    else el.className = el.className.replace(new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"), " ");
}

export function addClass(el: HTMLElement, className: string): void  {
    if (el.classList) el.classList.add(className);
    else el.className += " " + className;
}

// From http://stackoverflow.com/questions/8869403/drag-drop-json-into-chrome
export function DnDFileController(this: any, selector: string, onDropCallback: (files: FileList, e: unknown) => any): void  {
    const el_ = document.querySelector(selector);
    this.dragenter = function(e: DragEvent) {
        e.stopPropagation();
        e.preventDefault();
        el_?.classList.add("dropping");
    };

    this.dragover = function(e: DragEvent) {
        e.stopPropagation();
        e.preventDefault();
    };

    this.dragleave = function(e: DragEvent) {
        e.stopPropagation();
        e.preventDefault();
        // el_.classList.remove('dropping');
    };

    this.drop = function(e: DragEvent) {
        e.stopPropagation();
        e.preventDefault();

        el_?.classList.remove("dropping");

        onDropCallback(e.dataTransfer?.files!, e);
    };

    el_?.addEventListener("dragenter", this.dragenter, false);
    el_?.addEventListener("dragover", this.dragover, false);
    el_?.addEventListener("dragleave", this.dragleave, false);
    el_?.addEventListener("drop", this.drop, false);
}

export function setButtonColor(button: HTMLButtonElement, color: string, text: string): void  {
    button.style.background = color;
    button.style.color = text;
}
