from flask import Flask, request, session, g, redirect, url_for, abort, render_template, flash, send_file, make_response
from contextlib import closing
import os
import json
from io import BytesIO
import JSON_import_test
import JSON_parser_test

#config
DEBUG = True
SECRET_KEY = 'development_key'
USERNAME = 'admin'
PASSWORD = 'default'

app = Flask(__name__)
app.config.from_object(__name__)

def convert_B_to_A(json_data):
	return JSON_parser_test.convert_json(json_data)

def convert_A_to_stl(json_data):
	return JSON_import_test.JSON_to_STL(json_data)

def create_STL_file(filename, stl_data):
	response = make_response(stl_data)
	response.headers["Content-Disposition"] = "attachment; filename=" + filename
	return response

@app.route('/convert_JSON_B', methods=['POST'])
def convert_JSON_B():
	print("Converting file...")
	json_data = json.loads(request.form["json_data"])
	converted = convert_B_to_A(json_data)
	filename = converted["device"]["name"] + "_MOCKUP.stl"
	stl = convert_A_to_stl(converted)
	print("File converted!")
	print(stl)
	return create_STL_file(filename, stl)

@app.route('/render_JSON_A', methods=['POST'])
def render_JSON_A():
	json_data = json.loads(request.form["json_data"])
	filename = json_data["device"]["name"] + "_MOCKUP.stl"
	return create_STL_file(filename, convert_A_to_stl(json_data))

@app.route('/submit_JSON_B')
def make_stl_B():
	return render_template("submit_JSON_B.html")

@app.route('/submit_JSON_A')
def make_stl_A():
	return render_template("submit_JSON_A.html")

@app.route('/fabric_demo')
def fabric_demo():
	return render_template("fabric_test.html")

@app.route('/fabric_demo_2')
def fabric_demo_2():
	return render_template("fabric_test_2.html")

if __name__ == '__main__':
	app.run()