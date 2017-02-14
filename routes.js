const exec = require('child_process').exec;

const speaker = require('./speech/amazon-polly-speaker');
const requestHelper = require('./util/request_helper');
const articleExtractor = require('./util/article_extractor');
const serialHandler = require('./util/serial_handler');

module.exports = (app, mirrorSocket) => {

	app.get('/api/serial/:command', (req, res) => {
		serialHandler.writeString(req.params.command);
	  res.json({
      success: true
    });
	});

	app.post('/api/serial', (req, res) => {
		if(req.body.mode){
			const mode = req.body.mode;
			const speed = req.body.speed;
			serialHandler.writeString('mode:' + req.body.mode + ':' + req.body.speed);
		} else {
	    const side = req.body.side;
	    const rgb = req.body.rgb;
	   	if(side === 'all'){
	   		serialHandler.writeString('rgb:' + rgb.r + ':' + rgb.g + ':' + rgb.b);
	   	} else {
	   		serialHandler.writeString('side:' + side + ':' + rgb.r + ':' + rgb.g + ':' + rgb.b);
	   	}
	  }
	  res.json({
      success: true
    });
	});

	app.get('/api/speak/:text', (req, res) => {
	  if (req.params.text) speaker.speak(req.params.text);
	  res.json({
      success: true
    });
	});

	app.get('/api/hide', (req, res) => {
	  mirrorSocket.sendToClient('visibility', {component: 'forecasts', visible: false});
	  mirrorSocket.sendToClient('visibility', {component: 'news', visible: false});
	  mirrorSocket.sendToClient('visibility', {component: 'article', visible: false});
	  mirrorSocket.sendToClient('visibility', {component: 'tasks', visible: false});
	  mirrorSocket.sendToClient('visibility', {component: 'weather', visible: false});
	  mirrorSocket.sendToClient('visibility', {component: 'clock', visible: false});

	  res.json({
      success: true
    });
	});

	app.get('/api/hide/:component', (req, res) => {
	  mirrorSocket.sendToClient('visibility', {component: req.params.component, visible: false});
	
	  res.json({
	      success: true
	    });
	});

	app.get('/api/show/:component', (req, res) => {
	  mirrorSocket.sendToClient('visibility', {component: req.params.component, visible: true});

	  res.json({
	      success: true
	    });
	});


	app.get('/api/show', (req, res) => {
	  mirrorSocket.sendToClient('visibility', {component: 'forecasts', visible: true});
	  mirrorSocket.sendToClient('visibility', {component: 'news', visible: true});
	  mirrorSocket.sendToClient('visibility', {component: 'article', visible: false});
	  mirrorSocket.sendToClient('visibility', {component: 'tasks', visible: true});
	  mirrorSocket.sendToClient('visibility', {component: 'weather', visible: true});
	  mirrorSocket.sendToClient('visibility', {component: 'clock', visible: true});

	  res.json({
	      success: true
	    });
	});

	app.get('/api/tasks', (req, res) => {
		requestHelper.getTasks((tasks) => {
	    res.json({
	      tasks: tasks
	    });
		return;
	  })
	});

	app.get('/api/tasks/create/:title', (req, res) => {
		if(req.params.title){
			requestHelper.createTask(req.params.title)
	    res.json({
	      success: true
	    });
		} else {
			res.json({
	      success: false
	    });
		}
	});

	app.get('/api/articles', (req, res) => {
		articleExtractor.getArticles((articles) => {
	    res.json({
	      articles
	    });
		return;
	  })
	});

	app.get('/api/shutdown', (req, res) => {
		exec("sudo shutdown -h now");
    res.json({
      success: true
    });
	});

	app.get('/api/next', (req, res) => {
	  mirrorSocket.sendToClient('command', {component: 'article', action: 'next'});
	  res.json({
	      success: true
	    });
	});

	app.get('/api/forecast', (req, res) => {
		requestHelper.getForecast((forecast) => {
	    res.json({
	      forecast: forecast
	    });
		return;
	  })
	});
}