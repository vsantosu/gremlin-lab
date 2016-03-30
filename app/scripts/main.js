$(document).ready(function() {

    /* this object */
    var self = {};

    /* Initialize sigma container */
    self.s = new sigma(document.getElementById('container'));
    /* The gremlin client */
    self.client = null;

    /* Load random graph */
    $("#btnLoad").click(function() {
        generateRandomGraph(self.s);
    });
    /* take graph snapshot */
    $("#btnTakeSnapshot").click(function() {
        takeGraphSnapshot(self.s);
    });
    /* take graph snapshot */
    $("#btnStartForceLayout").click(function() {
        self.s.startForceAtlas2({
            worker: true,
            barnesHutOptimize: true,
            gravity: 5
        });
    });

    /* take graph snapshot */
    $("#btnStopForceLayout").click(function() {
        self.s.stopForceAtlas2();
    });

    /* Connect to server */
    $("#btnConnect").click(function() {
        connectToServer(self);
    });

    /* Connect to server */
    $("#btnLoadServer").click(function() {
        loadServerGraph(self);
    });

    /* Initializing listeners */
    initializeSigmaListeners(self.s);
});

function loadServerGraph(obj){

    var script = 'g.V()';

    var query = obj.client.stream(script);

    query.on('data', function(d) {

        /* Adding to graph viz */
        obj.s.graph.addNode({
            id: d.id,
            label: d.label,
            x: Math.random(),
            y: Math.random(),
            size: Math.random(),
            color: '#' + (Math.floor(Math.random() * 16777215).toString(16) + '000000').substr(0, 6),
        });

        /* display incoming node */
        console.log(d);
    });

    query.on('end', function(d) {
        /* refresh all vertices */
        obj.s.refresh();
        /* logging the action */
        console.log('All results fetched, goint to the nodes now');
        /* Going for the edges */
        var edgeScript = 'g.E()';
        var edgeQuery = obj.client.stream(edgeScript);

        edgeQuery.on('data', function(e) {

            /* Adding to graph viz */
            obj.s.graph.addEdge({
                id: e.id,
                source: e.outV,
                target: e.inV,
                label: e.label,
                size: Math.random(),
                color: '#ccc'
            });

            /* display incoming edge */
            console.log(e);
        });

        edgeQuery.on('end', function() {
            /* refresh all new vertices */
            obj.s.refresh();             
        });

    });

    query.on('error', function(e) {
        console.log('Could not complete query:', e.message);
    });

}

function connectToServer(obj) {

    /* Get the values */
    var hostname = $("#txtHostname").val();
    var port = parseInt($("#txtPort").val());
    /* Try to connect */
    obj.client = gremlin.createClient(port, hostname);
    
    obj.client.on('open', function() {
        console.log("Connection to Gremlin Server established!");
    });
}

function generateRandomGraph(s) {
    var i, N = 300,
        E = 450;
    // Generate a random graph:
    for (i = 0; i < N; i++) {
        s.graph.addNode({
            id: 'n' + i,
            label: 'Node ' + i,
            x: Math.random(),
            y: Math.random(),
            size: Math.random(),
            color: '#' + (Math.floor(Math.random() * 16777215).toString(16) + '000000').substr(0, 6),
        });
    }
    for (i = 0; i < E; i++) {
        s.graph.addEdge({
            id: 'e' + i,
            source: 'n' + (Math.random() * N | 0),
            target: 'n' + (Math.random() * N | 0),
            size: Math.random(),
            color: '#ccc'
        });
    }
    // Finally, let's ask our sigma instance to refresh:
    s.refresh();
}
/* Sigma listeners */
function initializeSigmaListeners(s) {
    s.bind('overNode outNode clickNode doubleClickNode rightClickNode', function(e) {
        console.log(e.type, e.data.node.label, e.data.captor);
    });
    s.bind('overEdge outEdge clickEdge doubleClickEdge rightClickEdge', function(e) {
        console.log(e.type, e.data.edge, e.data.captor);
    });
    s.bind('clickStage', function(e) {
        console.log(e.type, e.data.captor);
    });
    s.bind('doubleClickStage rightClickStage', function(e) {
        console.log(e.type, e.data.captor);
    });
    /* Initialize the dragNodes plugin: */
    var dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);
    /*
    dragListener.bind('startdrag', function(event) {
        console.log(event);
    });
    dragListener.bind('drag', function(event) {
        console.log(event);
    });
    dragListener.bind('drop', function(event) {
        console.log(event);
    });
    dragListener.bind('dragend', function(event) {
        console.log(event);
    });
    */
}

function takeGraphSnapshot(s) {
    s.renderers[0].snapshot({
        format: 'png',
        background: 'white',
        filename: 'my-graph.png',
        labels: false,
        download: true
    })
}