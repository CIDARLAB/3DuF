import paper from "paper";

export default class GridRenderer {
    static renderGrid(grid) {
        // con
        const gridGroup = new paper.Group();
        gridGroup.addChild(GridRenderer.makeHorizontalLines(grid));
        gridGroup.addChild(GridRenderer.makeVerticalLines(grid));
        return gridGroup;
    }

    static vertLineSymbol(width, color) {
        return GridRenderer.lineSymbol(paper.view.bounds.topLeft, paper.view.bounds.bottomLeft, width, color);
    }

    static horizLineSymbol(width, color) {
        return GridRenderer.lineSymbol(paper.view.bounds.topLeft, paper.view.bounds.topRight, width, color);
    }

    static lineSymbol(start, end, width, color) {
        const line = paper.Path.Line({
            from: start,
            to: end,
            strokeWidth: width,
            strokeColor: color
        });
        line.strokeColor.alpha = 0.25;
        line.remove();
        return new paper.Symbol(line);
    }

    static isThick(val, origin, spacing, thickCount) {
        const diff = Math.abs(val - origin);
        const remainder = diff % (spacing * thickCount);
        if (remainder < spacing) {
            return true;
        } else return false;
    }

    static makeVerticalLines(grid) {
        const spacing = grid.getSpacing();
        const sym = GridRenderer.vertLineSymbol(grid.getThinWidth(), grid.color);
        const thickSym = GridRenderer.vertLineSymbol(grid.getThickWidth(), grid.color);
        const start = paper.view.bounds.topLeft;
        const end = paper.view.bounds.topRight;
        const height = paper.view.bounds.height;
        const group = new paper.Group();

        const startX = Math.floor((start.x - grid.origin.x) / spacing) * spacing + grid.origin.x;

        for (let i = startX; i < end.x; i += spacing) {
            const pos = new paper.Point(i, start.y + height / 2);
            if (GridRenderer.isThick(i, grid.origin.x, spacing, grid.thickCount)) group.addChild(thickSym.place(pos));
            else group.addChild(sym.place(pos));
        }

        for (let i = startX; i >= end.x; i -= spacing) {
            const pos = new paper.Point(i, start.y + height / 2);
            if (GridRenderer.isThick(i, grid.origin.x, spacing, grid.thickCount)) group.addChild(thickSym.place(pos));
            else group.addChild(sym.place(pos));
        }
        return group;
    }

    static makeHorizontalLines(grid) {
        const spacing = grid.getSpacing();
        const sym = GridRenderer.horizLineSymbol(grid.getThinWidth(), grid.color);
        const thickSym = GridRenderer.horizLineSymbol(grid.getThickWidth(), grid.color);
        const start = paper.view.bounds.topLeft;
        const end = paper.view.bounds.bottomLeft;
        const width = paper.view.bounds.width;
        const group = new paper.Group();

        const startY = Math.floor((start.y - grid.origin.y) / spacing) * spacing + grid.origin.y;

        for (let i = startY; i < end.y; i += spacing) {
            const pos = new paper.Point(start.x + width / 2, i);
            if (GridRenderer.isThick(i, grid.origin.y, spacing, grid.thickCount)) group.addChild(thickSym.place(pos));
            else group.addChild(sym.place(pos));
        }

        for (let i = startY; i >= end.y; i -= spacing) {
            const pos = new paper.Point(start.x + width / 2, i);
            if (GridRenderer.isThick(i, grid.origin.y, spacing, grid.thickCount)) group.addChild(thickSym.place(pos));
            else group.addChild(sym.place(pos));
        }
        return group;
    }
}
