import paper from "paper";

export default class GridRenderer {
    static renderGrid(grid) {
        //con
        let gridGroup = new paper.Group();
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
        let line = paper.Path.Line({
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
        let diff = Math.abs(val - origin);
        let remainder = diff % (spacing * thickCount);
        if (remainder < spacing) {
            return true;
        } else return false;
    }

    static makeVerticalLines(grid) {
        let spacing = grid.getSpacing();
        let sym = GridRenderer.vertLineSymbol(grid.getThinWidth(), grid.color);
        let thickSym = GridRenderer.vertLineSymbol(grid.getThickWidth(), grid.color);
        let start = paper.view.bounds.topLeft;
        let end = paper.view.bounds.topRight;
        let height = paper.view.bounds.height;
        let group = new paper.Group();

        let startX = Math.floor((start.x - grid.origin.x) / spacing) * spacing + grid.origin.x;

        for (let i = startX; i < end.x; i += spacing) {
            let pos = new paper.Point(i, start.y + height / 2);
            if (GridRenderer.isThick(i, grid.origin.x, spacing, grid.thickCount)) group.addChild(thickSym.place(pos));
            else group.addChild(sym.place(pos));
        }

        for (let i = startX; i >= end.x; i -= spacing) {
            let pos = new paper.Point(i, start.y + height / 2);
            if (GridRenderer.isThick(i, grid.origin.x, spacing, grid.thickCount)) group.addChild(thickSym.place(pos));
            else group.addChild(sym.place(pos));
        }
        return group;
    }

    static makeHorizontalLines(grid) {
        let spacing = grid.getSpacing();
        let sym = GridRenderer.horizLineSymbol(grid.getThinWidth(), grid.color);
        let thickSym = GridRenderer.horizLineSymbol(grid.getThickWidth(), grid.color);
        let start = paper.view.bounds.topLeft;
        let end = paper.view.bounds.bottomLeft;
        let width = paper.view.bounds.width;
        let group = new paper.Group();

        let startY = Math.floor((start.y - grid.origin.y) / spacing) * spacing + grid.origin.y;

        for (let i = startY; i < end.y; i += spacing) {
            let pos = new paper.Point(start.x + width / 2, i);
            if (GridRenderer.isThick(i, grid.origin.y, spacing, grid.thickCount)) group.addChild(thickSym.place(pos));
            else group.addChild(sym.place(pos));
        }

        for (let i = startY; i >= end.y; i -= spacing) {
            let pos = new paper.Point(start.x + width / 2, i);
            if (GridRenderer.isThick(i, grid.origin.y, spacing, grid.thickCount)) group.addChild(thickSym.place(pos));
            else group.addChild(sym.place(pos));
        }
        return group;
    }
}
