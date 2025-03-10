import paper from 'paper';

// Set up a Paper.js project with the given dimensions
paper.setup([640, 480]);

// Create a Paper.js Path to draw a line
const path = new paper.Path();
// Set the stroke color
path.strokeColor = new paper.Color('black');

// Define the starting point
const start = new paper.Point(100, 100);
// Move to the starting point
path.moveTo(start);
// Draw a line to the calculated point
path.lineTo(start.add(new paper.Point(200, -50)));

// Create a Paper.js Circle
const circleCenter = new paper.Point(300, 200);
const circleRadius = 50;
const circle = new paper.Path.Circle({
    center: circleCenter,
    radius: circleRadius,
    strokeColor: new paper.Color('blue'),
    fillColor: new paper.Color('lightblue'),
});

// Log some properties of the circle
console.log('Circle Center:', circle.position);
console.log('Circle Radius:', circleRadius);
console.log('Circle Bounds:', circle.bounds);

// Render the view
//paper.view.draw();

// Export the project as JSON
console.log(paper.project.exportJSON());
