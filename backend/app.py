from flask import Flask, request,jsonify
from flask_socketio import SocketIO,emit,join_room, leave_room,rooms
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app,resources={r"/*":{"origins":"*"}})
socketio = SocketIO(app,cors_allowed_origins="*")

@socketio.on("connect")
def on_connect(auth):
    if auth.get("token") != "123":
        raise ConnectionRefusedError("unauthorized!")


@socketio.on("message")
def handle_message(data):
    username = data.get("username")
    message = data.get("message")
    print(message)
    room = data.get("room")
    if room in rooms():
        emit("message", {"username": username, "message": message}, to=room)


@socketio.on("join")
def on_join(data):
    username = data.get("username")
    room = data.get("room")
    join_room(room)
    emit("join", {"username": username}, to=room)


@socketio.on("leave")
def on_leave(data):
    username = data.get("username")
    room = data.get("room")
    leave_room(room)
    emit("leave", {"username": username}, to=room)

if __name__== "__main__":
    socketio.run(app,debug=True,port=5555)
