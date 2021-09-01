<html>
<head>
<script type="text/javascript" src="js/paper.js"></script>
<script type="text/paperscript" canvas="myCanvas">
    var path = new Path();
    path.strokeColor = 'black';

    var coordinates = [];
    for (var i = 0; i < points.length; i++){ //points array would refer to the points stored by connection object
        coordinates.push({x: points[i].first, y:points[i].second})
    }
    for (var i = 0; i < coordinates.length; i++) {
        Path.add(new Point(coordinates[i].x, coordinates[i].y))
    } 
    path.closed = true;
    path.smooth();
</script>
</head>
<body>
	<canvas id="myCanvas" resize></canvas>
</body>
</html>