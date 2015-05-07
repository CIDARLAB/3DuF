import sqlite3
from flask import Flask, request, session, g, redirect, url_for, abort, render_template, flash, send_file, make_response
from contextlib import closing
import os
import json
from io import BytesIO
import JSON_import_test

#config
DATABASE = '/tmp/flaskr.db'
DEBUG = True
SECRET_KEY = 'development_key'
USERNAME = 'admin'
PASSWORD = 'default'

app = Flask(__name__)
app.config.from_object(__name__)

@app.route('/render_JSON', methods=['POST'])
def render_JSON():
	json_data = json.loads(request.form["json_data"])
	filename = json_data["device"]["name"] + "_MOCKUP.stl"
	stl = JSON_import_test.JSON_to_STL(json_data)
	response = make_response(stl)
	response.headers["Content-Disposition"] = "attachment; filename=" + filename
	return response
	#os.system("rm new_file.json")

@app.route('/submit_json')
def make_scad():
	return render_template("show_entries.html")

if __name__ == '__main__':
	app.run()