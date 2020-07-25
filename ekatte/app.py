from flask import Flask, flash, request, redirect, url_for, Blueprint, render_template, jsonify
from werkzeug.utils import secure_filename
import db
app = Flask(__name__)

from views import addfiles
#app.register_blueprint(addfiles.add)
@app.route('/filter', methods=['POST'])
def filter():
    if request.method == 'POST':
        sett_name = request.form['sname']
        return jsonify(db.find_sett_info(sett_name))
    return redirect(url_for('index'))
@app.route('/stats', methods=['POST'])
def get_stats():
    if request.method == 'POST':
        return jsonify(db.get_stats())
    return redirect(url_for('index'))

@app.route('/', methods=['GET'])
def render_add():
    return render_template('filter.html')