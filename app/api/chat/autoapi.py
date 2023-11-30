from flask import Flask, jsonify
from flask_cors import CORS

#app instance
#instatiated a flask app
app = Flask(__name__)

#cores allows other servers to make requests to this server
CORS(app)

#we set up a route to access this method which is located at /api/home and the only methods we are accepting in this method is a GET request
#all we do when you call this function is return a json which we want to push to our next js
@app.route("/app/api/chat", methods = ['GET', "POST"])
def return_home():
    return jsonify({
        "message": "Hello World!",
        "people": ['jack', 'harry', 'barry']
    })

#we have the code that we need to run the app
if __name__ == "__main__":
    app.run(debug=True, port =8080) #debug=True is only for developement mode. Remove later. Set to 8080

