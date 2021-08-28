import http from 'http';
import SocketIO from 'socket.io';
import express from 'express';

const app = express();

app.set('view engine', 'pug'); // whatis this?
app.set('views', __dirname + '/views'); // what is this?
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

function publicRooms() {
    const {
        sockets: {
            adapter: { sids, rooms }, // sids에는 privite room이 저장되어 있고 rooms에는 privite room + public room이 저장되어 있기 때문에 key로 public room만구별가능
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName) {
    console.log('roomName: ', roomName, wsServer.sockets.adapter.rooms);
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on('connection', socket => {
    socket['nickname'] = 'Anon';
    socket.onAny(event => {
        console.log(`Socket Event: ${event}`);
    });

    socket.on('enter_room', (roomName, done) => {
        socket.join(roomName);
        done();
        // to는 해당 룸에 있는 유저 전부에게
        socket.to(roomName).emit('welcome', socket.nickname, countRoom(roomName));
        wsServer.sockets.emit('room_change', publicRooms());
    });

    socket.on('disconnecting', () => {
        socket.rooms.forEach(room =>
            socket.to(room).emit('bye', socket.nickname, countRoom(room) - 1)
        );
    });

    socket.on('disconnect', () => {
        wsServer.sockets.emit('room_change', publicRooms());
    });
    socket.on('new_message', (msg, room, done) => {
        socket.to(room).emit('new_message', `${socket.nickname}: ${msg}`);
        done();
    });
    socket.on('nickname', nickname => (socket['nickname'] = nickname));
});

// const wss = new WebSocket.Server({ server });
// // fake database
// const sockets = [];

// // socket은 연결된 브라우저를뜻함
// // connection이 생기면 socket으로 메세지를 보냄
// wss.on('connection', socket => {
//     sockets.push(socket);
//     socket['nickname'] = 'anonymous';
//     // 브라우저창을 열었을 때 발생
//     console.log('Connected to Browser');

//     // 브라우저창을 닫으면 발생함
//     socket.on('close', () => console.log('브라우저로부터 연결이 끊김'));

//     // 프론트에서 보낸 메세지를 받음
//     socket.on('message', msg => {
//         const message = JSON.parse(msg);
//         switch (message.type) {
//             case 'new_message':
//                 sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${message.payload}`));
//                 break;
//             case 'nickname':
//                 socket['nickname'] = message.payload;
//                 break;
//         }
//     });
//     // socket으로 해당 메세지를 보냄
//     // socket메서드 사용 send로 메세지를 보냈고 프론트에서 메세지를 받아야함
//     // socket.send('hello');
// });

httpServer.listen(3000, handleListen);
