#include <iostream>
#include <list>

void example_flexpath1(Cell& out_cell) {
    FlexPath* fp = (FlexPath*)allocate_clear(2 * sizeof(FlexPath));
    fp[0].simple_path = true;
    fp[0].init(Vec2{0, 0}, 1, 0.5, 0, 0.01);

    Vec2 points1[] = {{3, 0}, {3, 2}, {5, 3}, {3, 4}, {0, 4}};
    fp[0].segment({.count = COUNT(points1), .items = points1}, NULL, NULL, false);

    out_cell.flexpath_array.append(fp);

    const double widths[] = {0.3, 0.2, 0.4};
    const double offsets[] = {-0.5, 0, 0.5};
    fp[1].init(Vec2{12, 0}, 3, widths, offsets, 0.01);

    fp[1].elements[0].end_type = EndType::HalfWidth;
    fp[1].elements[0].join_type = JoinType::Bevel;

    fp[1].elements[1].end_type = EndType::Flush;
    fp[1].elements[1].join_type = JoinType::Miter;

    fp[1].elements[2].end_type = EndType::Round;
    fp[1].elements[2].join_type = JoinType::Round;

    Vec2 points2[] = {{8, 0}, {8, 3}, {10, 2}};
    fp[1].segment({.count = COUNT(points2), .items = points2}, NULL, NULL, false);

    fp[1].arc(2, 2, -M_PI / 2, M_PI / 2, 0, NULL, NULL);
    fp[1].arc(1, 1, M_PI / 2, 1.5 * M_PI, 0, NULL, NULL);

    out_cell.flexpath_array.append(fp + 1);
}

int main(){
    list <int,int> points = [(0, 0), (3, 0), (3, 2), (5, 3), (3, 4), (0, 4)];
    int width = 5;
    
}