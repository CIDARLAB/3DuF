from flask import Flask, render_template, url_for
app = Flask(__name__)

@app.route('/fabric/')
def hello():
    return render_template('fabric.html')

if __name__ == '__main__':
    app.run(debug=True)