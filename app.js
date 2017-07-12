const express = require('express');
const path = require('path');

const app = express();
const server = require('http').Server(app);

const io = require('socket.io')(server);

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'public')));



var postList = [];

io.on('connection', socket => {


    socket.emit('sendPostList', postList);

    socket.on('post', (post) => {
    	postList.push(post);
        socket.broadcast.emit('post', post);
    });

    socket.on('deletePost', (post) => {

    	var index = postList.map(function(post) {return post.id; }).indexOf(post.id);

		postList.splice(index, 1);   

        socket.broadcast.emit('sendPostList', postList);
    });

    socket.on('sendLike', (sentLike) => {
    	var index = postList.map(function(post) {return post.id; }).indexOf(sentLike.postId);

    	post = postList[index];

    	if (post.dislikers.includes(sentLike.likerPseudo)) {
    		var pseudoIndex = post.dislikers.indexOf(sentLike.likerPseudo);
    		post.dislikers.splice(pseudoIndex);
    		post.dislike = post.dislike - 1;
    	}

    	post.like = post.like + 1;
    	post.likers.push(sentLike.likerPseudo);

    	postList[index] = post;

    	socket.broadcast.emit('sendPostList', postList);
    });

    socket.on('sendDislike', (sentDislike) => {
    	var index = postList.map(function(post) {return post.id; }).indexOf(sentDislike.postId);

    	post = postList[index];

    	if (post.likers.includes(sentDislike.dislikerPseudo)) {
    		var pseudoIndex = post.likers.indexOf(sentDislike.dislikerPseudo);
    		post.likers.splice(pseudoIndex);
    		post.like = post.like - 1;
    	}

    	post.dislike = post.dislike + 1;
    	post.dislikers.push(sentDislike.dislikerPseudo);

    	postList[index] = post;

    	socket.broadcast.emit('sendPostList', postList);
    });

    socket.on('removeThinking', (thinking) => {

    	var index = postList.map(function(post) {return post.id; }).indexOf(thinking.postId);

    	post = postList[index];

    	if (thinking.option === "dislike") {
			var pseudoIndex = post.dislikers.indexOf(thinking.pseudo);
			post.dislikers.splice(pseudoIndex);
			post.dislike = post.dislike - 1;
		} else {
			var pseudoIndex = post.likers.indexOf(thinking.pseudo);
			post.likers.splice(pseudoIndex);
			post.like = post.like - 1;
		}

    	postList[index] = post;

    	socket.broadcast.emit('sendPostList', postList);
    });

    socket.on('disconnect', function() {
        console.log('Bye');
    });
});

const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`Server is listening on port ${port}`));