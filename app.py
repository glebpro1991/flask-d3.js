import datetime
import json
import os
import time

from flask import Flask, jsonify, make_response

from models import db, SensorDataModel

app = Flask(__name__)

POSTGRES = {
    'user': 'gleb',
    'pw': 'primary1',
    'db': 'sensordata',
    'host': 'localhost',
    'port': '5432',
}

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://%(user)s:\
%(pw)s@%(host)s:%(port)s/%(db)s' % POSTGRES

db.init_app(app)


@app.route('/', methods=['GET'])
def home():
    return 'Successfully deployed!'


@app.route('/download', methods=['GET'])
def download():
    resultset = db.session.query(SensorDataModel).limit(1000).all()
    filedir = '/home/gprohorovs/flask-sensor-data-app/download'

    with open(os.path.join(filedir, 'result.json'), 'w') as fp:
        j = json.dumps([i.serialize for i in resultset], default=converter)
    fp.write(j)

    return make_response()


@app.route('/getLastBatch', methods=['GET'])
def getLastBatch():
    resultset = db.session.query(SensorDataModel)
    return jsonify([i.serialize for i in resultset.order_by(SensorDataModel.sampleId.desc()).limit(100).all()])


@app.route('/count', methods=['GET'])
def count():
    numRows = db.session.query(SensorDataModel).count()
    return 'The total number of rows in the table is ' + str(numRows)


@app.route('/validate', methods=['GET'])
def validate():
    tstart = time.time()
    errors = []
    counter = db.session.query(SensorDataModel.sampleId).order_by(SensorDataModel.sampleId.asc()).first()[0]

    for sample in db.session.query(SensorDataModel.sampleId).order_by(SensorDataModel.sampleId.asc()).all():
        sampleId = int(sample[0])

        if counter != sampleId:
            difference = (sampleId - counter)
            counter = counter + difference
            errors.append('Sequence broken on sample ID '
                          + str(sampleId)
                          + '. ' + str(difference)
                          + ' rows are missing!')
        counter = counter + 1

    response = [
        {'time taken': str(time.time() - tstart)},
        {'errors': errors}
    ]
    return jsonify(results=response)


def make_response():
    response = make_response()
    response.headers['Content-Description'] = 'File Transfer'
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['Content-Type'] = 'application/octet-stream'
    response.headers['Content-Disposition'] = 'attachment; filename=%s' % 'result.json'
    response.headers['Content-Length'] = os.path.getsize('/home/gprohorovs/flask-sensor-data-app/download/result.json')
    response.headers['X-Accel-Redirect'] = '/download/result.json'


def converter(o):
    if isinstance(o, datetime.datetime):
        return o.__str__()


if __name__ == '__main__':
    app.run(debug=True)
