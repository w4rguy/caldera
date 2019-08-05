/* http://bl.ocks.org/fancellu/2c782394602a93921faff74e594d1bb1 Much credit to this person */

let svg = d3.select('#fact-dependency-graph'),
	gWidth = svg.attr('width'),
	gHeight = svg.attr('height'),
	radius = 5,
	node,
	link,
	edgepaths,
	edgelabels;
let defs = svg.append('defs');
defs.append('marker')
	.attr('id','arrow')
	.attr('viewBox','0 -5 10 10')
	.attr('refX', 14)
	.attr('refY', 0)
	.attr('markerWidth', 8)
	.attr('markerHeight', 8)
	.attr('orient', 'auto')
	.attr('xoverflow', 'visible')
		.append('path')
		.attr('d', 'M0,-5L10,0L0,5')
		.attr('class','arrow');

let colors = d3.scaleOrdinal(d3.schemeCategory10);

let sim = d3.forceSimulation()
			.force('link', d3.forceLink().id(function(d){return d.id;}).distance(115))
			.force('charge', d3.forceManyBody())
			.force('center', d3.forceCenter(gWidth/2, gHeight/2));


function reloadFactGraph() {
	restRequest('POST', {'index':'fact_graph'}, updateFactGraph);
}

function updateFactGraph(data) {
	let graph = data;
	link = svg.selectAll('.link').data(graph.links).enter().append('line')
		.attr('class', 'link')
		.attr('marker-end', 'url(#arrow)');
	link.append('title')
		.text(function (d) {return d.label});
	edgepaths = svg.selectAll('.edgepath').data(graph.links).enter().append('path')
		.attr('class', 'edgepath')
		.attr('id', function (d, i) { return 'edgepath'+i;});
	edgelabels = svg.selectAll('.edgelabels').data(graph.links).enter().append('text')
		.attr('class','edgelabel')
		.attr('id', function (d, i ) {
			return 'edgelabel'+i;
		});
	edgelabels.append('textPath')
		.attr('xlink:href', function (d, i) { return '#edgepath'+i; })
		.attr('text-anchor', 'middle')
		.attr('startOffset', '50%')
		.text(function (d) { return d.label; } );
	node = svg.selectAll('.node').data(graph.nodes).enter().append('g')
		.attr('class','node')
		.call(d3.drag()
				.on('start', dragstarted)
				.on('drag', dragged)
				.on('end', dragended));
	node.append('circle').attr('r', radius).attr('fill', function (d) {
		if(d.type === 'fact')
			return colors(0);
		else if(d.platform === 'windows')
			return colors(1);
		else if(d.platform === 'linux')
			return colors(2);
		else
			return colors(3);
	});
	node.append('text').attr('dy', -3).attr('dx', 3).text(function (d) {
		if(d.type =='fact')
			return 'FACT | '+d.label;
		else
			return d.platform +' | '+d.label;
	});
	sim.nodes(graph.nodes).on('tick', ticked);
	sim.force('link').links(graph.links);
}

function ticked() {
	link
		.attr('x1', function (d) {return d.source.x;})
		.attr('y1', function (d) {return d.source.y;})
		.attr('x2', function (d) {return d.target.x;})
		.attr('y2', function (d) {return d.target.y;});
	node
		.attr('transform', function (d) {return 'translate(' + Math.max(radius, Math.min(gWidth-radius, d.x)) +
			', ' + Math.max(radius, Math.min(gHeight-radius, d.y)) + ')';});
	edgepaths.attr('d', function (d) {
		return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
	});
	edgelabels.attr('transform', function (d) {
		if (d.target.x < d.source.x) {
			var bbox = this.getBBox();

			rx = bbox.x + bbox.width / 2;
			ry = bbox.y + bbox.height / 2;
			return 'rotate(180 ' + rx + ' ' + ry + ')';
		}
		else {
			return 'rotate(0)';
		}
	});
}

function dragstarted(d) {
	if (!d3.event.active) sim.alphaTarget(0.3).restart();
	d.fx = d.x;
	d.fy = d.y;
}

function dragged(d) {
	d.fx = d3.event.x;
	d.fy = d3.event.y;
}

function dragended(d){
	if (!d3.event.active) sim.alphaTarget(0);
	  d.fx = null;
	  d.fy = null;
}