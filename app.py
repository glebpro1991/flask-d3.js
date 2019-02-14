import datetime
from flask import Flask, request, jsonify, Response, send_file
import json, os

from models import db, SensorDataModel

app = Flask(__name__)

POSTGRES = {
    'user': 'gleb',
    'pw': 'primary1',
    'db': 'sensordata1',
    'host': 'localhost',
    'port': '5432',
}

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://%(user)s:\
%(pw)s@%(host)s:%(port)s/%(db)s' % POSTGRES

db.init_app(app)


@app.route('/', methods=['GET'])
def home():
    return 'Successfully deployed!'


@app.route('/save', methods=['POST'])
def save():
    req_data = request.get_json()
    message = saveData(req_data)
    return jsonify([{"response": message}])


@app.route('/getAll', methods=['GET'])
def getAll():
    resultset = db.session.query(SensorDataModel).all()
    with open(os.path.join('/tmp', 'result.json'), 'w') as fp:
        j = json.dumps([i.serialize for i in resultset], default=converter, indent=4)
        fp.write(j)
    return send_file('/tmp/result.json', as_attachment=True)


@app.route('/getLastBatch', methods=['GET'])
def getLastBatch():
    resultset = db.session.query(SensorDataModel)
    return jsonify([i.serialize for i in resultset.order_by(SensorDataModel.sampleId.desc()).limit(100).all()])


def saveData(data):
    try:
        db.session.add_all(
            [
                SensorDataModel(record)
                for record in data
            ]
        )
        db.session.commit()
        return "success"
    except Exception as e:
        db.session.rollback()
        return str(e)
    finally:
        db.session.close()


def converter(o):
    if isinstance(o, datetime.datetime):
        return o.__str__()


if __name__ == '__main__':
    app.run(debug=True)
